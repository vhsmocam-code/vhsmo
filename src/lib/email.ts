import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { ses } from "./email/ses";

/** Site origin that serves the email images in public/email/ (emails need full links). */
export function emailAssetBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.vhsmo.com").replace(/\/+$/, "");
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = "VHSMO <team@vhsmo.com>",
}: {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative, sent alongside the HTML. */
  text?: string;
  /** Sender; defaults to the team address. OTP emails use no-reply@. */
  from?: string;
}) {
  try {
    const command = new SendEmailCommand({
      FromEmailAddress: from,
      Destination: {
        ToAddresses: [to],
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject,
          },
          Body: {
            Html: {
              Data: html,
            },
            ...(text ? { Text: { Data: text } } : {}),
          },
        },
      },
    });

    const response = await ses.send(command);

    console.log("Success:", response.MessageId);

    return response;
  } catch (err) {
    console.error("SES Error:", err);
    throw err;
  }
}
