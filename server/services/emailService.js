const nodemailer = require('nodemailer');

const SENDER_NAME = 'MatruCare AI';
const isProd = process.env.NODE_ENV === 'production';

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: (process.env.EMAIL_USER || '').trim(),
        // Google shows app passwords with spaces; strip them so a pasted value still works.
        pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, ''),
      },
    });
  }
  return transporter;
};

/** Turns a Nodemailer error into a plain-English hint for the server console. */
const explainEmailError = (err) => {
  const msg = err && err.message ? err.message : String(err);
  if (/Invalid login|Username and Password not accepted|535/i.test(msg)) {
    return 'Gmail rejected the login. Use a 16-character Gmail App Password (not your normal password), turn on 2-Step Verification, and make EMAIL_USER the same account that created it.';
  }
  if (/Missing credentials|No auth/i.test(msg)) return 'EMAIL_USER or EMAIL_PASS is empty. Check server/.env and restart the server.';
  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/i.test(msg)) return 'Cannot reach smtp.gmail.com. Check your internet connection or firewall.';
  return msg;
};

/** Called once at startup so email problems are visible immediately. */
const verifyEmailConfig = async () => {
  if (!process.env.EMAIL_PASS || !process.env.EMAIL_USER) {
    console.warn('[email] EMAIL_USER/EMAIL_PASS not set. OTPs will be PRINTED IN THIS TERMINAL instead of emailed.');
    return;
  }
  try {
    await getTransporter().verify();
    console.log(`[email] Gmail login OK. Sending as "MatruCare AI" <${process.env.EMAIL_USER}>`);
  } catch (err) {
    console.error(`[email] Gmail login FAILED: ${explainEmailError(err)}`);
    if (!isProd) console.error('[email] While developing, OTPs will be printed in this terminal instead.');
  }
};

// Escape user-supplied values before placing them in HTML emails.
const esc = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Base layout shared by all emails. */
const layout = (title, bodyHtml) => `
<div style="background:#f3f8f7;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#10201f">
  <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden">
    <tr><td style="background:#0e5a57;padding:20px 28px">
      <span style="color:#ffffff;font-size:20px;font-weight:bold">MatruCare</span><span style="color:#f5a524;font-size:20px;font-weight:bold"> AI</span>
    </td></tr>
    <tr><td style="padding:28px">
      <h2 style="margin:0 0 16px;font-size:20px">${title}</h2>
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:16px 28px;background:#f3f8f7;font-size:12px;color:#5c6f6d">
      Sent by MatruCare AI &middot; ${esc(process.env.EMAIL_USER || '')}
    </td></tr>
  </table>
</div>`;

/**
 * Sends an email. In development, if there is no EMAIL_PASS or Gmail rejects the
 * message, the email is printed to the server console instead so the flow can
 * still be tested. In production, failures are thrown.
 */
const send = async ({ to, subject, html, text, replyTo }) => {
  const printLocally = (reason) => {
    console.log(`\n========== [DEV EMAIL - ${reason}] ==========\nTo: ${to}\nSubject: ${subject}\n${text}\n==============================================\n`);
  };

  if (!process.env.EMAIL_PASS || !process.env.EMAIL_USER) {
    if (isProd) throw new Error('EMAIL_USER / EMAIL_PASS are not configured');
    return printLocally('email not configured');
  }

  try {
    await getTransporter().sendMail({
      from: `"${SENDER_NAME}" <${process.env.EMAIL_USER}>`, // sender name is always MatruCare AI
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
  } catch (err) {
    console.error(`[email] Sending to ${to} failed: ${explainEmailError(err)}`);
    if (isProd) throw err;
    printLocally('Gmail send failed, showing message here');
  }
};

const sendOtpEmail = (to, name, otp) =>
  send({
    to,
    subject: 'Your MatruCare AI verification code',
    text: `Hi ${name}, your MatruCare AI verification code is ${otp}. It expires in 10 minutes.`,
    html: layout('Verify your email', `
      <p style="margin:0 0 16px;line-height:1.5">Hi ${esc(name)}, use this code to finish creating your account.</p>
      <div style="font-size:34px;letter-spacing:10px;font-weight:bold;text-align:center;background:#fff4e0;border:1px solid #f5a524;border-radius:8px;padding:16px;color:#0e5a57">${esc(otp)}</div>
      <p style="margin:16px 0 0;line-height:1.5">This code expires in <strong>10 minutes</strong>. If you did not sign up, you can ignore this email.</p>`),
  });

const sendRegistrationEmail = (to, reg) => {
  const members = reg.teamMembers.length
    ? `<ul style="padding-left:18px;margin:6px 0 0">${reg.teamMembers.map((m) => `<li>${esc(m.name)} (${esc(m.email)})</li>`).join('')}</ul>`
    : '<p style="margin:6px 0 0">Solo participation</p>';
  const row = (label, value) =>
    `<tr><td style="padding:6px 0;color:#5c6f6d;width:130px">${label}</td><td style="padding:6px 0"><strong>${value}</strong></td></tr>`;
  return send({
    to,
    subject: 'Your MatruCare AI Hackathon registration is confirmed',
    text: `Hi ${reg.fullName}, your registration for the MatruCare AI Hackathon is confirmed. Project: ${reg.projectName}. Domain: ${reg.domain}. Team size: ${reg.teamSize}.`,
    html: layout('Registration confirmed', `
      <p style="margin:0 0 16px;line-height:1.5">Hi ${esc(reg.fullName)}, you are registered for the MatruCare AI Hackathon.</p>
      <table role="presentation" width="100%" style="border-collapse:collapse">
        ${row('Project', esc(reg.projectName))}
        ${row('Domain', esc(reg.domain))}
        ${row('Team size', reg.teamSize)}
      </table>
      <p style="margin:16px 0 0"><strong>Team members</strong></p>
      ${members}
      <p style="margin:20px 0 0;line-height:1.5">You can view or edit your entry anytime from your dashboard.</p>`),
  });
};

const sendContactNotification = ({ name, email, message }) =>
  send({
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New contact message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: layout('New contact message', `
      <p style="margin:0 0 8px"><strong>${esc(name)}</strong> &lt;${esc(email)}&gt;</p>
      <p style="margin:0;line-height:1.5;white-space:pre-wrap">${esc(message)}</p>`),
  });

module.exports = { sendOtpEmail, sendRegistrationEmail, sendContactNotification, verifyEmailConfig };
