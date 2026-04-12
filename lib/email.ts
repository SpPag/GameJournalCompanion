import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// debugging logs to verify that environment variables are being read correctly
// console.log("RESEND KEY:", process.env.RESEND_API_KEY?.slice(0, 5));
// console.log("FROM:", process.env.EMAIL_FROM);
// console.log("URL:", process.env.NEXTAUTH_URL);

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

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

export async function sendPasswordChangedEmail(email: string) {
    const url = `${process.env.NEXTAUTH_URL}/login`;

    if (process.env.NODE_ENV === "development") {
        console.log("DEV MODE PASSWORD CHANGED EMAIL for:", email);
        console.log("LOGIN URL:", url);
    }

    const result = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Your password has been changed",
        html: `
            <h1>Password changed</h1>
            <p>Your password for Game Journal Companion has been changed successfully.</p>
            <p>If you did not make this change, someone else may have access to your account or email address.</p>
            <p>You can sign in here: <a href="${url}">${url}</a></p>
        `,
    });

    console.log("PASSWORD CHANGED EMAIL RESULT:", result);

    return result;
}

export async function sendGameRequestEmail({
    requesterEmail,
    requesterUsername,
    gameTitle,
    message,
}: {
    requesterEmail: string;
    requesterUsername?: string;
    gameTitle: string;
    message?: string;
}) {
    const safeRequesterEmail = escapeHtml(requesterEmail);
    const safeRequesterUsername = requesterUsername?.trim() ? escapeHtml(requesterUsername) : "Not provided";
    const safeGameTitle = escapeHtml(gameTitle);
    const safeMessage = message?.trim() ? escapeHtml(message).replace(/\n/g, "<br />") : "No additional details provided.";

    if (process.env.NODE_ENV === "development") {
        console.log("DEV MODE GAME REQUEST EMAIL:");
        console.log("FROM USER:", requesterEmail);
        console.log("REQUESTER USERNAME:", requesterUsername || "Somehow no username was provided");
        console.log("GAME TITLE:", gameTitle);
        console.log("MESSAGE:", message || "(none)");
    }

    const result = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: process.env.CONTACT_EMAIL!,
        subject: `Game request: ${gameTitle}`,
        replyTo: requesterEmail,
        html: `
            <h1>New game request</h1>
            <p><strong>Requested by:</strong> ${safeRequesterEmail}</p>
            <p><strong>Requester username:</strong> ${safeRequesterUsername}</p>
            <p><strong>Game title:</strong> ${safeGameTitle}</p>
            <p><strong>Message:</strong></p>
            <p>${safeMessage}</p>
            <p>You can reply to this email to contact the requester.</p>
        `,
    });

    console.log("GAME REQUEST EMAIL RESULT:", result);

    return result;
}