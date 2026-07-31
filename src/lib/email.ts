import { SendEmailCommand } from "@aws-sdk/client-sesv2";
import { ses } from "./email/ses";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const command = new SendEmailCommand({
      FromEmailAddress: "VHSMO <team@vhsmo.com>",
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
