import { Resend } from "resend";

export async function GET() {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: "test-or-my-real-email@gmail.com",
    subject: "TEST EMAIL",
    html: "<h1>Hello</h1>",
  });

  return Response.json(result);
}