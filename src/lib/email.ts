import "server-only";
import { serviceStatus } from "./services";

type Mail = { to: string; subject: string; text: string };

/** Sends mail through Resend when configured. Returns false when not configured. */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!serviceStatus().email) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email not configured — dev log]\nTo: ${mail.to}\nSubject: ${mail.subject}\n${mail.text}`);
    }
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: mail.to, subject: mail.subject, text: mail.text }),
  });
  if (!res.ok) throw new Error(`Email provider error: ${res.status}`);
  return true;
}
