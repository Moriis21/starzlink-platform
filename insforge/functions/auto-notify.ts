/**
 * StarzLink Auto-Notification Edge Function
 * Triggered when a new job/scholarship/training/resource is published.
 * Sends a branded email to ALL registered users who have email addresses.
 *
 * Deploy: npx @insforge/cli functions deploy auto-notify
 *
 * Call from admin panel after publishing content:
 *   insforge.functions.invoke('auto-notify', {
 *     body: {
 *       type: 'job' | 'scholarship' | 'training' | 'resource' | 'campus',
 *       title: string,
 *       description: string,
 *       organization: string,
 *       deadline?: string,
 *       link: string,
 *     }
 *   })
 */

const INSFORGE_URL = "https://8qn72bza.us-east.insforge.app";
const BRAND_COLOR = "#1a3c8f";
const SITE_NAME = "StarzLink";
const SITE_URL = process.env.SITE_URL || "https://starzlink.com";
const WHATSAPP = "https://whatsapp.com/channel/0029Vb60NZgGZNCt2yKAOa17";

const TYPE_META: Record<string, { emoji: string; label: string; color: string; ctaLabel: string }> = {
  job:         { emoji: "💼", label: "New Job Opportunity",    color: "#1a3c8f", ctaLabel: "View & Apply Now" },
  scholarship: { emoji: "🎓", label: "New Scholarship",        color: "#7c3aed", ctaLabel: "View Scholarship" },
  training:    { emoji: "📚", label: "New Training Program",   color: "#d97706", ctaLabel: "Register Now" },
  resource:    { emoji: "📄", label: "New Resource Available", color: "#059669", ctaLabel: "Get Resource" },
  campus:      { emoji: "🏫", label: "Campus Update",          color: "#0891b2", ctaLabel: "Read More" },
};

function buildEmailHTML(payload: any): string {
  const meta = TYPE_META[payload.type] || TYPE_META.job;
  const deadlineRow = payload.deadline
    ? `<tr><td style="padding:4px 0;color:#6b7280;font-size:13px;">⏰ Deadline:</td><td style="padding:4px 0;font-weight:bold;color:#dc2626;font-size:13px;">${payload.deadline}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="background:${BRAND_COLOR};border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
        <img src="${SITE_URL}/images/logo.jpg" alt="${SITE_NAME}" height="52"
          style="height:52px;width:auto;border-radius:10px;background:white;padding:5px;display:inline-block;" />
        <p style="color:#bfdbfe;font-size:11px;letter-spacing:2px;margin:8px 0 0;font-weight:600;">
          OPPORTUNITY · IMPACT · INSPIRATION
        </p>
      </td></tr>

      <!-- Type badge -->
      <tr><td style="background:white;padding:20px 32px 0;text-align:center;">
        <span style="display:inline-block;background:${meta.color}20;color:${meta.color};font-weight:700;font-size:12px;
          letter-spacing:1px;padding:6px 16px;border-radius:50px;text-transform:uppercase;">
          ${meta.emoji} ${meta.label}
        </span>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:white;padding:20px 32px 32px;">
        <h1 style="color:#111827;font-size:22px;font-weight:800;margin:0 0 12px;line-height:1.3;">
          ${payload.title}
        </h1>

        ${payload.organization ? `<p style="color:#6b7280;font-size:13px;margin:0 0 16px;font-weight:500;">
          🏢 ${payload.organization}
        </p>` : ""}

        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px;">
          ${payload.description?.substring(0, 300)}${payload.description?.length > 300 ? "…" : ""}
        </p>

        ${deadlineRow ? `<table style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;margin:0 0 20px;width:100%;">${deadlineRow}</table>` : ""}

        <a href="${payload.link || SITE_URL + '/opportunities'}"
          style="display:inline-block;background:${meta.color};color:white;text-decoration:none;
            font-weight:700;font-size:14px;padding:13px 28px;border-radius:12px;">
          ${meta.ctaLabel} →
        </a>
      </td></tr>

      <!-- WhatsApp CTA -->
      <tr><td style="background:#f0fdf4;padding:18px 32px;text-align:center;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
        <p style="margin:0 0 10px;font-size:13px;color:#374151;">
          📱 Get instant updates — join our <strong>WhatsApp channel</strong>!
        </p>
        <a href="${WHATSAPP}"
          style="display:inline-block;background:#25D366;color:white;text-decoration:none;
            font-weight:700;font-size:13px;padding:9px 22px;border-radius:24px;">
          Join WhatsApp Channel
        </a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#0d1b4b;border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;">
        <p style="color:#93c5fd;font-size:11px;margin:0 0 4px;">
          © 2025 ${SITE_NAME} · Monrovia, Liberia
        </p>
        <p style="color:#60a5fa;font-size:11px;margin:0;">
          +231 770 787 020 / 0888 283 007 ·
          <a href="mailto:support@starzlink.com" style="color:#60a5fa;">support@starzlink.com</a>
        </p>
        <p style="color:#4b5563;font-size:10px;margin:8px 0 0;">
          You received this email because you are a registered member of ${SITE_NAME}.
          <a href="${SITE_URL}/unsubscribe" style="color:#4b5563;">Unsubscribe</a>
        </p>
      </td></tr>

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
    const payload = await req.json();
    const { type, title } = payload;

    if (!type || !title) {
      return new Response(JSON.stringify({ error: "Missing required fields: type, title" }), { status: 400 });
    }

    const apiKey = process.env.INSFORGE_SERVICE_ROLE_KEY || process.env.INSFORGE_ANON_KEY || "";

    // ── Fetch all registered users' emails ──────────────────────────
    // We get emails from auth.users joined with profiles
    const usersRes = await fetch(`${INSFORGE_URL}/api/database/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        query: `
          SELECT DISTINCT u.email, p.full_name
          FROM auth.users u
          LEFT JOIN profiles p ON p.id = u.id
          WHERE u.email IS NOT NULL
            AND u.email != ''
          LIMIT 1000
        `,
      }),
    });

    // Also get newsletter subscribers
    const newsletterRes = await fetch(`${INSFORGE_URL}/api/database/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ query: "SELECT email FROM newsletter_subscribers LIMIT 1000" }),
    });

    const usersData = usersRes.ok ? await usersRes.json() : [];
    const newsletterData = newsletterRes.ok ? await newsletterRes.json() : [];

    // Merge & deduplicate emails
    const emailSet = new Set<string>();
    const recipients: Array<{ email: string; name?: string }> = [];

    for (const u of (Array.isArray(usersData) ? usersData : [])) {
      if (u.email && !emailSet.has(u.email)) {
        emailSet.add(u.email);
        recipients.push({ email: u.email, name: u.full_name });
      }
    }
    for (const n of (Array.isArray(newsletterData) ? newsletterData : [])) {
      if (n.email && !emailSet.has(n.email)) {
        emailSet.add(n.email);
        recipients.push({ email: n.email });
      }
    }

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No recipients found" }), { status: 200 });
    }

    const meta = TYPE_META[type] || TYPE_META.job;
    const subject = `${meta.emoji} ${meta.label}: ${title}`;
    const html = buildEmailHTML(payload);

    // ── Send emails (batch via InsForge email API) ──────────────────
    let sent = 0;
    const errors: string[] = [];

    // Send in batches of 50 to avoid timeouts
    const BATCH = 50;
    for (let i = 0; i < recipients.length; i += BATCH) {
      const batch = recipients.slice(i, i + BATCH);

      await Promise.allSettled(
        batch.map(async (r) => {
          try {
            const emailRes = await fetch(`${INSFORGE_URL}/api/email/send`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
              body: JSON.stringify({ to: r.email, subject, html }),
            });
            if (emailRes.ok) {
              sent++;
            } else {
              errors.push(r.email);
            }
          } catch {
            errors.push(r.email);
          }
        })
      );
    }

    // Log the notification action
    await fetch(`${INSFORGE_URL}/api/database/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        query: `
          INSERT INTO activity_logs (action, module, details)
          VALUES ('notify', '${type}s', 'Notification sent for "${title.replace(/'/g, "''")}": ${sent} emails sent')
        `,
      }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        total_recipients: recipients.length,
        errors: errors.length,
        message: `Notification sent to ${sent}/${recipients.length} users`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
