function escapeHtml(s: string) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export async function sendVerificationEmail(to: string, name: string, rawToken: string) {
    const url = `${process.env.APP_URL}/recruiter/verify-email?token=${rawToken}`;

    // Dev fallback: no Brevo key yet, print the link in the terminal
    if (!process.env.BREVO_API_KEY) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("BREVO_API_KEY is not set");
        }
        console.log(`\n[DEV] Verification link for ${to}:\n${url}\n`);
        return;
    }

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "content-type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            sender: {
                name: process.env.BREVO_SENDER_NAME ?? "Insiderjobs",
                email: process.env.BREVO_SENDER_EMAIL,
            },
            to: [{ email: to, name }],
            subject: "Verify your email - Insiderjobs",
            htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
          <h2>Welcome to Insiderjobs, ${escapeHtml(name)}!</h2>
          <p>Please confirm your email address to activate your recruiter account.</p>
          <p>
            <a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">
              Verify my email
            </a>
          </p>
          <p style="font-size:12px;color:#666">
            This link expires in 24 hours. If you did not create this account, you can ignore this email.
          </p>
        </div>`,
        }),
        signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
        console.error("Brevo error:", res.status, await res.text());
        throw new Error("Failed to send verification email");
    }
}