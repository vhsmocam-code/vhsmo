import { sendEmail } from "@/lib/email";
import { easyEcomConfig } from "./config";

/** Best-effort operator alert. Never throws. */
export async function sendAlert(subject: string, body: string): Promise<void> {
  console.error(`[easyecom] ${subject}\n${body}`);
  const to = easyEcomConfig().alertEmail;
  if (!to) return;
  try {
    const safe = body.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    await sendEmail({ to, subject, html: `<pre style="font-family:monospace">${safe}</pre>` });
  } catch (e) {
    console.error("[easyecom] alert email failed:", e);
  }
}
