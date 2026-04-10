import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {

  console.log("KEY EXISTS:", !!process.env.RESEND_API_KEY);
  console.log("FROM:", process.env.EMAIL_FROM);
  
  // quick guard for missing environment variable
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
  }
  
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: "spiridonpagiatis@gmail.com",
    subject: "TEST EMAIL",
    html: "<h1>Hello</h1>",
  });
  console.log("RESEND RESULT:", result);


  return Response.json(result);
}