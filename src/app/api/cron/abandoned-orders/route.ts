import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

function abandonedCheckoutEmail({
  name,
  checkoutUrl,
}: {
  name: string;
  checkoutUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, Helvetica, sans-serif; color:#222; line-height:1.7; font-size:16px;">

<p>Hi ${name || "there"},</p>

<p>
Thank you for your interest in <strong>VHSMO</strong> — we noticed you were close to completing your purchase.
Just a quick heads-up: once you start checkout, your VHSMO is held for just <strong>10 minutes</strong>.
Beyond that window, the unit may be released and assigned to another buyer.
</p>

<p>
As part of our limited pre-order batch, we're currently offering a
<strong>one-time launch price of ₹4,999</strong>.
Once pre-orders close, the price will revert to <strong>₹6,999</strong>.
Availability is limited, so we'd recommend securing your unit while this offer is live.
</p>

<p>
<a href="${checkoutUrl}">
Complete your preorder
</a>
</p>

<p>
If you have any questions or need help completing your pre-order, feel free to reply to this email—we're happy to assist.
We're excited to get a VHSMO into your hands.
</p>

<p>
Best regards,<br/>
Team VHSMO
</p>

</body>
</html>
`;
}
export async function GET(request: NextRequest) {
  try {
    // Protect the endpoint
    const auth = request.headers.get("authorization");

    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Orders older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const now = new Date().toISOString();


const { data: orders, error } = await supabase
  .from("orders")
  .select("*")
  .eq("payment_status", "pending")
  .eq("abandoned_email_sent", false)
  .gte("created_at", oneHourAgo)
  .lte("created_at", now);



    if (error) throw error;

    if (!orders?.length) {
      return NextResponse.json({
        success: true,
        message: "No abandoned orders.",
      });
    }

    // One email per customer
    const uniqueOrders = [
      ...new Map(orders.map((order) => [order.email, order])).values(),
    ];

    

    let emailsSent = 0;

    console.log(`Found ${orders.length} pending orders, ${uniqueOrders.length} unique customers.`);
    for (const order of uniqueOrders) {
      try {
        await sendEmail({
          to: order.email,
          subject: "Complete your VHSMO preorder before the price increases",
          html: abandonedCheckoutEmail({
            name: order.customer_name,
            checkoutUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
          }),
        });

        // Mark ALL pending orders of this email as emailed
        await supabase
          .from("orders")
          .update({
            abandoned_email_sent: true,
          })
          .eq("email", order.email)
          .eq("payment_status", "pending");

        emailsSent++;
      } catch (err) {
        console.error(`Failed sending email to ${order.email}`, err);
      }
    }

    return NextResponse.json({
      success: true,
      totalPendingOrders: orders.length,
      uniqueCustomers: uniqueOrders.length,
      emailsSent,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
