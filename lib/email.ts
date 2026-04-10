import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// debugging logs to verify that environment variables are being read correctly
console.log("RESEND KEY:", process.env.RESEND_API_KEY?.slice(0, 5));
console.log("FROM:", process.env.EMAIL_FROM);
console.log("URL:", process.env.NEXTAUTH_URL);

export async function sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
    
    if (process.env.NODE_ENV === "development") {
        console.log("DEV MODE EMAIL:", url);
    }
    
    const result = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Verify your account",
        html: `
      <h1>Verify your account</h1>
      <p>Click the link below to activate your account for Game Journal Companion:</p>
      <a href="${url}">${url}</a>
    `,
    });

    console.log("RESEND RESULT:", result);

    return result;
}