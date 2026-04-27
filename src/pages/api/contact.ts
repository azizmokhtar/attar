import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

const SERVICE_LABELS: Record<string, string> = {
  reinigung: 'Reinigungsservice',
  hausmeister: 'Hausmeisterservice',
  umzug: 'Umzugsservice',
  garten: 'Gartenservice',
  sonstiges: 'Allgemeine Anfrage',
};

const BRAND_NAVY = '#0d1b2a';
const BRAND_ORANGE = '#ff5f00';
const COMPANY = 'Attar Dienstleistungen';
const COMPANY_PHONE = '+49 (0) 15 569 365 96';
const COMPANY_HOURS = 'Mo – Fr: 07:00 – 20:00 · Sa: 08:30 – 18:00';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[\d\s\+\-\(\)]{6,20}$/.test(phone.trim());
}

function generateReference(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ATR-${date}-${rand}`;
}

function buildInternalEmail(p: {
  name: string; email: string; phone: string;
  service: string; message: string; reference: string;
  ip: string; submittedAt: string;
}): string {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background:#f8fafc; padding:32px 16px; color:${BRAND_NAVY};">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0;">
      <div style="background:${BRAND_NAVY}; padding:24px 32px; border-bottom:4px solid ${BRAND_ORANGE};">
        <p style="margin:0; color:${BRAND_ORANGE}; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase;">Neue Anfrage · ${p.reference}</p>
        <h1 style="margin:8px 0 0; color:#ffffff; font-size:22px; font-weight:900; letter-spacing:-0.5px; text-transform:uppercase;">${p.service}</h1>
      </div>

      <div style="padding:32px;">
        <table style="width:100%; border-collapse:collapse; margin:0 0 24px;">
          <tr>
            <td style="padding:10px 0; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1.5px; width:140px; vertical-align:top;">Name</td>
            <td style="padding:10px 0; font-size:14px; font-weight:700; color:${BRAND_NAVY};">${p.name}</td>
          </tr>
          <tr style="border-top:1px solid #f1f5f9;">
            <td style="padding:10px 0; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1.5px; vertical-align:top;">E-Mail</td>
            <td style="padding:10px 0; font-size:14px; font-weight:700;"><a href="mailto:${p.email}" style="color:${BRAND_ORANGE}; text-decoration:none;">${p.email}</a></td>
          </tr>
          <tr style="border-top:1px solid #f1f5f9;">
            <td style="padding:10px 0; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1.5px; vertical-align:top;">Telefon</td>
            <td style="padding:10px 0; font-size:14px; font-weight:700;"><a href="tel:${p.phone.replace(/\s/g, '')}" style="color:${BRAND_NAVY}; text-decoration:none;">${p.phone}</a></td>
          </tr>
          <tr style="border-top:1px solid #f1f5f9;">
            <td style="padding:10px 0; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1.5px; vertical-align:top;">Eingegangen</td>
            <td style="padding:10px 0; font-size:13px; color:#475569;">${p.submittedAt}</td>
          </tr>
        </table>

        <div style="background:#f8fafc; border-left:4px solid ${BRAND_ORANGE}; padding:20px 24px; margin-bottom:24px;">
          <p style="margin:0 0 8px; font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:${BRAND_NAVY};">Nachricht</p>
          <p style="margin:0; font-size:14px; line-height:1.7; color:#334155;">${p.message}</p>
        </div>

        <div style="display:block; margin-top:24px; padding:16px 20px; background:${BRAND_NAVY}; text-align:center;">
          <a href="mailto:${p.email}?subject=Re: Ihre Anfrage [${p.reference}]" style="color:#ffffff; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; text-decoration:none;">Direkt antworten →</a>
        </div>

        <p style="margin:24px 0 0; font-size:10px; color:#94a3b8; text-align:center;">IP: ${p.ip} · Vorgang: ${p.reference}</p>
      </div>
    </div>
  </div>`;
}

function buildAutoReply(p: {
  name: string; service: string; message: string; reference: string;
}): string {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background:#f8fafc; padding:32px 16px; color:${BRAND_NAVY};">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0;">
      <div style="background:${BRAND_NAVY}; padding:32px; border-bottom:4px solid ${BRAND_ORANGE};">
        <p style="margin:0; color:${BRAND_ORANGE}; font-size:10px; font-weight:800; letter-spacing:3px; text-transform:uppercase;">${COMPANY}</p>
        <h1 style="margin:12px 0 0; color:#ffffff; font-size:28px; font-weight:900; letter-spacing:-1px; text-transform:uppercase; line-height:1;">Anfrage erhalten.</h1>
      </div>

      <div style="padding:32px;">
        <p style="margin:0 0 20px; font-size:15px; color:${BRAND_NAVY}; line-height:1.6;">
          Sehr geehrte/r ${p.name},
        </p>
        <p style="margin:0 0 20px; font-size:15px; color:#334155; line-height:1.7;">
          vielen Dank für Ihre Anfrage. Wir haben Ihre Nachricht erhalten und melden uns
          <strong style="color:${BRAND_NAVY};">innerhalb von 24 Stunden</strong> persönlich bei Ihnen –
          werktags in der Regel deutlich schneller.
        </p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:20px 24px; margin:28px 0;">
          <p style="margin:0 0 6px; font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#94a3b8;">Ihre Vorgangsnummer</p>
          <p style="margin:0; font-size:18px; font-weight:900; color:${BRAND_NAVY}; letter-spacing:1px; font-family: 'SF Mono', Menlo, monospace;">${p.reference}</p>
        </div>

        <table style="width:100%; border-collapse:collapse; margin:24px 0;">
          <tr>
            <td style="padding:8px 0; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1.5px; width:130px; vertical-align:top;">Anfrage</td>
            <td style="padding:8px 0; font-size:14px; font-weight:700; color:${BRAND_NAVY};">${p.service}</td>
          </tr>
          <tr style="border-top:1px solid #f1f5f9;">
            <td style="padding:8px 0; font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1.5px; vertical-align:top;">Ihre Nachricht</td>
            <td style="padding:8px 0; font-size:13px; color:#475569; line-height:1.6;">${p.message}</td>
          </tr>
        </table>

        <p style="margin:32px 0 8px; font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:${BRAND_ORANGE};">Sie haben Fragen vorab?</p>
        <p style="margin:0 0 24px; font-size:14px; color:#334155; line-height:1.6;">
          Sie erreichen uns telefonisch unter
          <a href="tel:+4915569365960" style="color:${BRAND_NAVY}; font-weight:700; text-decoration:none; border-bottom:2px solid ${BRAND_ORANGE};">${COMPANY_PHONE}</a>
          während unserer Bürozeiten:
        </p>
        <p style="margin:0; font-size:13px; color:#64748b;">${COMPANY_HOURS}</p>

        <p style="margin:32px 0 0; font-size:14px; color:${BRAND_NAVY}; line-height:1.6;">
          Mit freundlichen Grüßen<br/>
          <strong>Ihr ${COMPANY} Team</strong>
        </p>
      </div>

      <div style="background:#f8fafc; padding:24px 32px; border-top:1px solid #e2e8f0;">
        <p style="margin:0; font-size:10px; color:#94a3b8; line-height:1.6; text-align:center;">
          Diese Nachricht wurde automatisch versendet. Bitte antworten Sie nicht direkt auf diese E-Mail –
          unser Team meldet sich in Kürze persönlich bei Ihnen.
        </p>
      </div>
    </div>
  </div>`;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    let data: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      const body = await request.json();
      data = Object.fromEntries(
        Object.entries(body).map(([k, v]) => [k, String(v ?? '')])
      );
    } else if (
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      const formData = await request.formData();
      formData.forEach((v, k) => { data[k] = typeof v === 'string' ? v : ''; });
    } else {
      return new Response(JSON.stringify({ error: 'Ungültige Anfrage.' }), { status: 400 });
    }

    // Honeypot — silently accept and drop spam
    if (typeof data._gotcha === 'string' && data._gotcha.trim().length > 0) {
      return new Response(
        JSON.stringify({ success: true, reference: generateReference() }),
        { status: 200 }
      );
    }

    const name    = (data.name    || '').trim().slice(0, 200);
    const email   = (data.email   || '').trim().slice(0, 200);
    const phone   = (data.phone   || '').trim().slice(0, 50);
    const service = (data.service || 'sonstiges').trim().slice(0, 50);
    const message = (data.message || '').trim().slice(0, 3000);

    if (!name || !email || !phone || !message) {
      return new Response(JSON.stringify({ error: 'Pflichtfelder fehlen.' }), { status: 400 });
    }
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Ungültige E-Mail-Adresse.' }), { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return new Response(JSON.stringify({ error: 'Ungültige Telefonnummer.' }), { status: 400 });
    }

    const serviceLabel = SERVICE_LABELS[service] || SERVICE_LABELS.sonstiges;
    const reference = generateReference();

    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: escapeHtml(phone),
      service: escapeHtml(serviceLabel),
      message: escapeHtml(message).replace(/\n/g, '<br/>'),
      reference: escapeHtml(reference),
      ip: escapeHtml(clientAddress || 'unbekannt'),
      submittedAt: new Date().toLocaleString('de-DE', {
        dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin',
      }),
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.GMAIL_USER,
        pass: import.meta.env.GMAIL_APP_PASSWORD,
      },
    });

    const internalMail: nodemailer.SendMailOptions = {
      from: `"${COMPANY} – Anfragen" <${import.meta.env.GMAIL_USER}>`,
      to: import.meta.env.GMAIL_USER,
      replyTo: email,
      subject: `Neue Anfrage [${reference}]: ${serviceLabel} – ${name}`,
      html: buildInternalEmail(safe),
    };

    await transporter.sendMail(internalMail);

    // Auto-reply: best-effort, but must be awaited or the serverless runtime
    // will terminate the function before the email actually goes out.
    const autoReply: nodemailer.SendMailOptions = {
      from: `"${COMPANY}" <${import.meta.env.GMAIL_USER}>`,
      to: email,
      subject: `Eingangsbestätigung Ihrer Anfrage [${reference}]`,
      html: buildAutoReply(safe),
    };
    try {
      await transporter.sendMail(autoReply);
    } catch (err) {
      console.error('contact auto-reply failed:', err);
    }

    return new Response(
      JSON.stringify({ success: true, reference }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('contact endpoint error:', err);
    return new Response(
      JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
