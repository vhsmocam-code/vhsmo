import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

/** VHSMO-branded welcome email. Table-based + inline styles for email clients. */
function welcomeEmailHtml() {
  const DARKROOM = "#2A2422";
  const SILVER = "#E3E3E1";
  const FONT = "Arial, Helvetica, sans-serif";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <title>Welcome to VHSMO</title>
</head>
<body style="margin:0; padding:0; background-color:${DARKROOM}; -webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${DARKROOM};">
    <tr>
      <td align="center" style="padding:56px 24px;">

        <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:480px;">

          <!-- logo -->
          <tr>
            <td style="padding:0 0 40px 0;">
              <img src="https://vhsmo.com/yellowLogo.png" width="120" alt="VHSMO" style="display:block; width:120px; height:auto; border:0;" />
            </td>
          </tr>

          <!-- body -->
          <tr>
            <td>
              <p style="margin:0 0 20px 0; font-family:${FONT}; font-size:16px; line-height:1.6; color:#FFFFFF;">
                Thanks for subscribing.
              </p>
              <p style="margin:0 0 20px 0; font-family:${FONT}; font-size:16px; line-height:1.6; color:${SILVER};">
                You're on the list. We'll email you when there's something worth your time - the launch, and little else.
              </p>
              <p style="margin:0; font-family:${FONT}; font-size:16px; line-height:1.6; color:${SILVER};">
                ~ VHSMO
              </p>
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="padding:44px 0 0 0;">
              <p style="margin:0; padding-top:24px; border-top:1px solid rgba(227,227,225,0.15); font-family:${FONT}; font-size:12px; line-height:1.6; color:${SILVER}; opacity:0.5;">
                <a href="https://vhsmo.com" style="color:${SILVER}; text-decoration:none;">vhsmo.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Footer newsletter - adds an email to the subscribers table. */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const clean = typeof email === "string" ? email.toLowerCase().trim() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email." },
        { status: 400 },
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", clean)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        already: true,
      });
    }

    // Insert first
    const { error } = await supabase
      .from("subscribers")
      .insert({ email: clean });

    if (error) {
      console.error("subscriber insert:", error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    // Now send the email
    try {
      const res = await sendEmail({
        to: clean,
        subject: "You're on the roll — welcome to VHSMO",
        html: welcomeEmailHtml(),
      });

      console.log(res);
    } catch (err) {
      console.error("Failed to send welcome email:", err);

    }

    return NextResponse.json({ success: true });
 
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
