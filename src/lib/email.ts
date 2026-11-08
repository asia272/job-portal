function escapeHtml(s: string) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

type Mail = {
    to: string;
    name: string;
    subject: string;
    html: string;
    devLog: string; // printed in the terminal when Brevo is not configured
};

async function sendEmail({ to, name, subject, html, devLog }: Mail) {
    if (!process.env.BREVO_API_KEY) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("BREVO_API_KEY is not set");
        }
        console.log(`\n[DEV EMAIL to ${to}] ${subject}\n${devLog}\n`);
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
            subject,
            htmlContent: html,
        }),
        signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
        console.error("Brevo error:", res.status, await res.text());
        throw new Error("Failed to send email");
    }
}

function layout(content: string) {
    return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#111">${content}</div>`;
}

function button(url: string, label: string) {
    return `<p><a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">${label}</a></p>`;
}

const small = (t: string) => `<p style="font-size:12px;color:#666">${t}</p>`;

// ---------- Recruiter: verify email ----------
export async function sendVerificationEmail(to: string, name: string, rawToken: string) {
    const url = `${process.env.APP_URL}/recruiter/verify-email?token=${rawToken}`;
    await sendEmail({
        to,
        name,
        subject: "Verify your email - Insiderjobs",
        devLog: `Verification link: ${url}`,
        html: layout(`
      <h2>Welcome to Insiderjobs, ${escapeHtml(name)}!</h2>
      <p>Please confirm your email address to activate your recruiter account.</p>
      ${button(url, "Verify my email")}
      ${small("This link expires in 24 hours. If you did not create this account, you can ignore this email.")}
    `),
    });
}

// ---------- Recruiter: reset password ----------
export async function sendPasswordResetEmail(to: string, name: string, rawToken: string) {
    const url = `${process.env.APP_URL}/recruiter/reset-password?token=${rawToken}`;
    await sendEmail({
        to,
        name,
        subject: "Reset your password - Insiderjobs",
        devLog: `Password reset link: ${url}`,
        html: layout(`
      <h2>Reset your password</h2>
      <p>Hi ${escapeHtml(name)}, we received a request to reset your Insiderjobs recruiter password.</p>
      ${button(url, "Choose a new password")}
      ${small("This link expires in 1 hour and can be used once. If you did not request this, you can safely ignore this email. Your password will not change.")}
    `),
    });
}

// ---------- Candidate: application accepted / rejected ----------
export async function sendApplicationStatusEmail(opts: {
    to: string;
    name: string | null;
    jobTitle: string;
    company: string;
    status: "ACCEPTED" | "REJECTED";
}) {
    const { to, status } = opts;
    const name = opts.name ?? "there";
    const job = escapeHtml(opts.jobTitle);
    const company = escapeHtml(opts.company);
    const url = `${process.env.APP_URL}/my-applications`;

    const accepted = status === "ACCEPTED";
    const subject = accepted
        ? `Good news: your application for ${opts.jobTitle} was accepted`
        : `Update on your application for ${opts.jobTitle}`;

    const body = accepted
        ? `<p>Great news! <b>${company}</b> has accepted your application for <b>${job}</b>.</p>
       <p>The recruiter may contact you soon about the next steps. You can follow your applications any time.</p>`
        : `<p>Thank you for your interest in <b>${job}</b> at <b>${company}</b>.</p>
       <p>After reviewing applications, they have decided not to move forward with yours this time. We encourage you to keep applying, there are many more openings waiting.</p>`;

    await sendEmail({
        to,
        name,
        subject,
        devLog: `Status: ${status} | Job: ${opts.jobTitle} | Company: ${opts.company}`,
        html: layout(`
      <h2>Hi ${escapeHtml(name)},</h2>
      ${body}
      ${button(url, "View my applications")}
    `),
    });
}