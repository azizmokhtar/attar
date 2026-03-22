import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

// Allowed MIME types for CV uploads
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

// Escape user input before placing it inside HTML email
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
  // Allows digits, spaces, +, -, (, ) — minimum 6 digits
  return /^[\d\s\+\-\(\)]{6,20}$/.test(phone.trim());
}

function sanitizeFilename(name: string): string {
  // Strip any path separators or special chars, keep extension
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Only accept multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Ungültige Anfrage.' }), { status: 400 });
    }

    const formData = await request.formData();

    const name     = ((formData.get('name')     as string) || '').trim().slice(0, 200);
    const email    = ((formData.get('email')    as string) || '').trim().slice(0, 200);
    const phone    = ((formData.get('phone')    as string) || '').trim().slice(0, 50);
    const position = ((formData.get('position') as string) || 'Initiativbewerbung').trim().slice(0, 200);
    const message  = ((formData.get('message')  as string) || '').trim().slice(0, 2000);
    const cvFile   = formData.get('cv') as File | null;

    // Server-side validation
    if (!name || !email || !phone) {
      return new Response(JSON.stringify({ error: 'Pflichtfelder fehlen.' }), { status: 400 });
    }
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Ungültige E-Mail-Adresse.' }), { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return new Response(JSON.stringify({ error: 'Ungültige Telefonnummer.' }), { status: 400 });
    }

    // File validation
    if (cvFile && cvFile.size > 0) {
      if (cvFile.size > MAX_FILE_BYTES) {
        return new Response(JSON.stringify({ error: 'Datei zu groß. Maximum: 5 MB.' }), { status: 400 });
      }
      if (!ALLOWED_MIME_TYPES.has(cvFile.type)) {
        return new Response(JSON.stringify({ error: 'Nur PDF oder Word-Dateien erlaubt.' }), { status: 400 });
      }
    }

    // Escape all user input before embedding in HTML
    const safeName     = escapeHtml(name);
    const safeEmail    = escapeHtml(email);
    const safePhone    = escapeHtml(phone);
    const safePosition = escapeHtml(position);
    const safeMessage  = escapeHtml(message).replace(/\n/g, '<br/>');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: import.meta.env.GMAIL_USER,
        pass: import.meta.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Attar Bewerbungen" <${import.meta.env.GMAIL_USER}>`,
      to: import.meta.env.GMAIL_USER,
      replyTo: email, // safe — nodemailer handles header encoding
      subject: `Bewerbung: ${safePosition} – ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #0d1b2a; border-bottom: 3px solid #ff5f00; padding-bottom: 10px;">
            Neue Bewerbung
          </h2>
          <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #666; width: 140px;">Position</td><td style="padding: 8px 0;">${safePosition}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Name</td><td style="padding: 8px 0;">${safeName}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">E-Mail</td><td style="padding: 8px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Telefon</td><td style="padding: 8px 0;">${safePhone}</td></tr>
          </table>
          ${safeMessage ? `
          <div style="margin-top: 20px; background: #f8fafc; padding: 16px; border-left: 4px solid #ff5f00;">
            <strong style="color: #0d1b2a;">Nachricht:</strong>
            <p style="margin: 8px 0 0; color: #444;">${safeMessage}</p>
          </div>` : ''}
          ${cvFile && cvFile.size > 0
            ? '<p style="margin-top:20px; color: #888; font-size: 13px;">Lebenslauf ist als Anhang beigefügt.</p>'
            : '<p style="margin-top:20px; color: #888; font-size: 13px;">Kein Lebenslauf hochgeladen.</p>'}
        </div>
      `,
    };

    if (cvFile && cvFile.size > 0) {
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      mailOptions.attachments = [{
        filename: sanitizeFilename(cvFile.name),
        content: buffer,
        contentType: cvFile.type,
      }];
    }

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('apply endpoint error:', err);
    return new Response(JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden.' }), { status: 500 });
  }
};
