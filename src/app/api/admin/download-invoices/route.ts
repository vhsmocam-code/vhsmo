import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value: unknown, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

const invoiceStyles = `*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#1f1a18;margin:0}.invoice{padding:42px;max-width:980px;margin:0 auto}header{display:flex;justify-content:space-between;border-bottom:2px solid #1f1a18;padding-bottom:20px}h1,h2,p{margin:0}h2{font-size:20px}h1{font-size:22px;letter-spacing:1px}.right{text-align:right}p,td,th,.columns{font-size:13px;line-height:1.5}.columns{display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;margin:28px 0}label{display:block;color:#6b6360;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px}.columns strong{display:block}.paid{color:#1a7f37;margin-top:8px}table{width:100%;border-collapse:collapse}th{text-align:left;color:#6b6360;border-bottom:1px solid #ddd;padding:8px 0;text-transform:uppercase;font-size:11px}td{border-bottom:1px solid #eee;padding:11px 0;vertical-align:top}td small{display:block;color:#6b6360}.num{text-align:right;white-space:nowrap}.totals{width:280px;margin:18px 0 0 auto}.totals div{display:flex;justify-content:space-between;padding:5px 0}.totals .grand{border-top:2px solid #1f1a18;margin-top:7px;padding-top:10px;font-size:17px;font-weight:bold}footer{border-top:1px solid #eee;margin-top:42px;padding-top:12px;color:#6b6360;font-size:12px}@media print{.invoice{padding:24px}}`;

function standaloneInvoice(row: Record<string, any>) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>VHSMO Invoice</title><style>${invoiceStyles}</style></head><body>${invoiceHtml(row)}</body></html>`;
}

// Creates a dependency-free ZIP (stored entries, no compression) for the
// invoice HTML files. Each file can be opened and printed as its own PDF.
function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipFiles(files: { name: string; contents: Buffer }[]) {
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const crc = crc32(file.contents);
    const header = Buffer.alloc(30 + name.length);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(file.contents.length, 18);
    header.writeUInt32LE(file.contents.length, 22);
    header.writeUInt16LE(name.length, 26);
    name.copy(header, 30);
    local.push(header, file.contents);

    const entry = Buffer.alloc(46 + name.length);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0, 8);
    entry.writeUInt16LE(0, 10);
    entry.writeUInt16LE(0, 12);
    entry.writeUInt16LE(0, 14);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(file.contents.length, 20);
    entry.writeUInt32LE(file.contents.length, 24);
    entry.writeUInt16LE(name.length, 28);
    entry.writeUInt32LE(offset, 42);
    name.copy(entry, 46);
    central.push(entry);
    offset += header.length + file.contents.length;
  }

  const centralDirectory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, centralDirectory, end]);
}

function invoiceHtml(row: Record<string, any>) {
  const id = String(row.razorpay_order_id ?? row.id ?? "");
  const shortId = id.replace(/^order_/, "").slice(-8).toUpperCase();
  const currency = String(row.currency ?? "INR");
  const date = row.created_at
    ? new Date(row.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const items = Array.isArray(row.items) ? row.items : [];
  const itemRows = items
    .map((item: Record<string, any>) => {
      const quantity = Number(item.quantity ?? 1);
      const price = Number(item.price ?? 0);
      return `<tr><td><strong>${escapeHtml(item.name)}</strong>${item.variant ? `<small>${escapeHtml(item.variant)}</small>` : ""}</td><td class="num">${quantity}</td><td class="num">${money(price, currency)}</td><td class="num">${money(price * quantity, currency)}</td></tr>`;
    })
    .join("");
  const address = [
    row.address_line1,
    row.address_line2,
    [row.city, row.state, row.postal_code].filter(Boolean).join(", "),
    row.country,
  ]
    .filter(Boolean)
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join("");

  return `<section class="invoice">
    <header><div><h2>VHSMO LLP</h2><p>H. No. 20, Nilaya Kapil, Aasmant Society,<br>S. No. 124/3/4, Armament, Sutarwadi,<br>Pune, Maharashtra – 411021, India<br>GSTIN: 27ABBFV3675J1ZQ</p></div><div class="right"><h1>INVOICE</h1><p>#${shortId}<br>${escapeHtml(date)}</p></div></header>
    <div class="columns"><div><label>Billed to</label><strong>${escapeHtml(row.customer_name)}</strong><div>${escapeHtml(row.email)}</div><div>${escapeHtml(row.phone)}</div></div><div><label>Ship to</label><strong>${escapeHtml(row.customer_name)}</strong>${address}</div><div><label>Payment</label><div>Razorpay</div><div>Order: ${escapeHtml(id)}</div>${row.razorpay_payment_id ? `<div>Payment: ${escapeHtml(row.razorpay_payment_id)}</div>` : ""}<strong class="paid">Paid</strong></div></div>
    <table><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead><tbody>${itemRows}</tbody></table>
    <div class="totals"><div><span>Subtotal</span><span>${money(row.subtotal, currency)}</span></div>${Number(row.discount ?? 0) > 0 ? `<div><span>Discount</span><span>-${money(row.discount, currency)}</span></div>` : ""}<div><span>Shipping</span><span>${money(row.shipping_cost, currency)}</span></div><div class="grand"><span>Total</span><span>${money(row.total ?? row.amount, currency)}</span></div></div>
    <footer>Thank you for your order.<br>team@vhsmo.com · vhsmo.com</footer>
  </section>`;
}

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("payment_status", "paid")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const files = (data ?? []).map((row) => {
    const id = String(row.razorpay_order_id ?? row.id ?? "invoice");
    const shortId = id.replace(/^order_/, "").slice(-8).toUpperCase();
    return {
      name: `invoice-${shortId}.html`,
      contents: Buffer.from(standaloneInvoice(row), "utf8"),
    };
  });
  const zip = zipFiles(files);

  return new NextResponse(zip as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="vhsmo-paid-invoices.zip"',
      "Cache-Control": "no-store",
    },
  });
}
