/**
 * StarzLink Branded Email Edge Function
 * Deploys to InsForge as 'send-email'
 *
 * Usage: insforge.functions.invoke('send-email', {
 *   body: { to, subject, type, data }
 * })
 */

const BRAND_COLOR = "#1a3c8f";
const BRAND_NAME = "StarzLink";
const WHATSAPP = "https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17";
const SITE_URL = "https://starzlink.com"; // Update when deployed

function brandedEmail(subject: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Logo / Header -->
        <tr>
          <td align="center" style="background:${BRAND_COLOR};border-radius:16px 16px 0 0;padding:28px 32px;">
            <img src="${SITE_URL}/images/logo.jpg" alt="${BRAND_NAME}" height="56" style="height:56px;width:auto;display:block;border-radius:10px;background:white;padding:6px;" />
            <p style="color:#bfdbfe;font-size:11px;letter-spacing:2px;margin:8px 0 0;font-weight:600;">OPPORTUNITY · IMPACT · INSPIRATION</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 36px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- WhatsApp CTA -->
        <tr>
          <td style="background:#f0fdf4;padding:20px 36px;border:1px solid #e5e7eb;border-top:none;text-align:center;">
            <p style="margin:0 0 10px;font-size:13px;color:#374151;">Join our WhatsApp channel for daily updates!</p>
            <a href="${WHATSAPP}" style="display:inline-block;background:#25D366;color:white;text-decoration:none;font-weight:bold;font-size:13px;padding:10px 24px;border-radius:24px;">
              📱 Join WhatsApp Channel
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d1b4b;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
            <p style="color:#93c5fd;font-size:11px;margin:0 0 4px;">
              © 2025 ${BRAND_NAME} · Monrovia, Liberia
            </p>
            <p style="color:#60a5fa;font-size:11px;margin:0;">
              +231 770 787 020 / 0888 283 007 ·
              <a href="mailto:support@starzlink.com" style="color:#60a5fa;">support@starzlink.com</a>
            </p>
            <p style="color:#6b7280;font-size:10px;margin:8px 0 0;">
              You received this email because you are a member of ${BRAND_NAME}.
              <a href="${SITE_URL}/unsubscribe" style="color:#6b7280;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { to, subject, type, data } = await req.json();

    if (!to || !subject) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject" }), { status: 400 });
    }

    let bodyHtml = "";

    switch (type) {
      case "welcome":
        bodyHtml = `
          <h1 style="color:${BRAND_COLOR};font-size:24px;margin:0 0 16px;font-weight:800;">Welcome to ${BRAND_NAME}! 🎉</h1>
          <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
            Hi <strong>${data?.name || "there"}</strong>, your account is ready. You now have access to thousands of scholarships, job leads, trainings, and campus updates.
          </p>
          <div style="background:#f0f9ff;border-left:4px solid ${BRAND_COLOR};border-radius:8px;padding:16px;margin:20px 0;">
            <p style="margin:0;color:#1e40af;font-size:14px;font-weight:600;">Your next step</p>
            <p style="margin:8px 0 0;color:#374151;font-size:13px;">Complete your profile to get personalized recommendations.</p>
          </div>
          <a href="${SITE_URL}/dashboard" style="display:inline-block;background:${BRAND_COLOR};color:white;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:12px;margin-top:8px;">
            Go to My Dashboard →
          </a>
        `;
        break;

      case "new_opportunity":
        bodyHtml = `
          <h1 style="color:${BRAND_COLOR};font-size:22px;margin:0 0 8px;font-weight:800;">New ${data?.opportunity_type || "Opportunity"} 🚀</h1>
          <h2 style="color:#111827;font-size:18px;margin:0 0 16px;font-weight:700;">${data?.title}</h2>
          <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">${data?.description?.substring(0, 200)}…</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
            ${data?.deadline ? `<p style="margin:0 0 8px;color:#64748b;font-size:13px;">⏰ Deadline: <strong style="color:#dc2626;">${data.deadline}</strong></p>` : ""}
            ${data?.location ? `<p style="margin:0 0 8px;color:#64748b;font-size:13px;">📍 Location: ${data.location}</p>` : ""}
            ${data?.organization ? `<p style="margin:0;color:#64748b;font-size:13px;">🏢 Organisation: ${data.organization}</p>` : ""}
          </div>
          <a href="${data?.link || SITE_URL + "/opportunities"}" style="display:inline-block;background:${BRAND_COLOR};color:white;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:12px;margin-top:8px;">
            View & Apply →
          </a>
        `;
        break;

      case "newsletter":
        bodyHtml = `
          <h1 style="color:${BRAND_COLOR};font-size:22px;margin:0 0 16px;font-weight:800;">${data?.title || "StarzLink Newsletter"}</h1>
          <div style="color:#374151;font-size:14px;line-height:1.8;">${data?.body || ""}</div>
          <a href="${SITE_URL}/opportunities" style="display:inline-block;background:${BRAND_COLOR};color:white;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:12px;margin-top:20px;">
            Explore All Opportunities →
          </a>
        `;
        break;

      case "password_reset":
        bodyHtml = `
          <h1 style="color:${BRAND_COLOR};font-size:22px;margin:0 0 16px;font-weight:800;">Password Reset Request 🔐</h1>
          <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
            Hi <strong>${data?.name || "there"}</strong>, we received a request to reset your password.
          </p>
          ${data?.reset_link ? `
          <a href="${data.reset_link}" style="display:inline-block;background:${BRAND_COLOR};color:white;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:12px;">
            Reset My Password →
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          ` : `
          <p style="color:#374151;font-size:14px;">Your reset code is: <strong style="color:${BRAND_COLOR};font-size:24px;letter-spacing:4px;">${data?.code}</strong></p>
          <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">This code expires in 15 minutes.</p>
          `}
        `;
        break;

      default:
        bodyHtml = `
          <p style="color:#374151;font-size:15px;line-height:1.7;">${data?.message || subject}</p>
        `;
    }

    const html = brandedEmail(subject, bodyHtml);

    // Use InsForge's built-in email sending (via platform API)
    const apiUrl = (process.env.INSFORGE_API_URL || "https://8qn72bza.us-east.insforge.app") + "/api/email/send";
    const apiKey = process.env.INSFORGE_SERVICE_ROLE_KEY || process.env.INSFORGE_ANON_KEY || "";

    const emailRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ to, subject, html }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      return new Response(JSON.stringify({ error: `Email send failed: ${err}` }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, to, subject }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
