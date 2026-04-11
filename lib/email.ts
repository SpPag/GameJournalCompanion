import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// debugging logs to verify that environment variables are being read correctly
// console.log("RESEND KEY:", process.env.RESEND_API_KEY?.slice(0, 5));
// console.log("FROM:", process.env.EMAIL_FROM);
// console.log("URL:", process.env.NEXTAUTH_URL);

export async function sendVerificationEmail(email: string, token: string) {
    const url = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;
    
    // debugging logs to verify that environment variables are being read correctly
    // console.log("RESEND API KEY EXISTS:", !!process.env.RESEND_API_KEY);
    // console.log("RESEND KEY PREFIX:", process.env.RESEND_API_KEY?.slice(0, 4));
    // console.log("NODE ENV:", process.env.NODE_ENV);
    // console.log("FULL RESEND KEY:", process.env.RESEND_API_KEY);

    if (process.env.NODE_ENV === "development") {
        console.log("DEV MODE ACCOUNT VERIFICATION EMAIL:", url);
    }
    
    const result = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Verify your account",
        html: `
      <h1>Verify your account</h1>
      <p>Click the link below to activate your account for Game Journal Companion:</p>
      <a href="${url}">${url}</a>
      <p>This link will expire in 1 hour.</p>
    `,
    });

    console.log("ACCOUNT VERIFICATION EMAIL RESEND RESULT:", result);

    return result;
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const url = `${process.env.NEXTAUTH_URL}/auth/resetPassword?token=${token}`;

    if (process.env.NODE_ENV === "development") {
        console.log("DEV MODE PASSWORD RESET EMAIL:", url);
    }

    const result = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Reset your password",
        html: `
      <h1>Reset your password</h1>
      <p>Click the link below to reset your password for Game Journal Companion:</p>
      <a href="${url}">${url}</a>
      <p>This link will expire in 1 hour.</p>
    `,
    });

    console.log("PASSWORD RESET EMAIL RESULT:", result);

    return result;
}