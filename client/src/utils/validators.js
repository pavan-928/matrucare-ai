// Frontend validation. Mirrors the backend rules in server/middleware/validators.js.
export const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const parseUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u : null;
  } catch { return null; }
};
const hostIn = (u, hosts) => hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));

const PPT_HOSTS = ['drive.google.com', 'docs.google.com', 'onedrive.live.com', '1drv.ms', 'sharepoint.com', 'onedrive.com'];
const VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'drive.google.com'];

export const vName = (v, label = 'Full name') => {
  const s = (v || '').trim();
  if (s.length < 3) return `${label} must be at least 3 characters`;
  if (!NAME_REGEX.test(s)) return `${label} can contain letters only`;
  return '';
};
export const vEmail = (v) => (EMAIL_REGEX.test((v || '').trim()) ? '' : 'Enter a valid email address');
export const vPassword = (v) => {
  if (!v || v.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(v)) return 'Password must include a letter';
  if (!/\d/.test(v)) return 'Password must include a number';
  return '';
};

export function validateSignup(f) {
  const e = {};
  if (vName(f.fullName)) e.fullName = vName(f.fullName);
  if (vEmail(f.email)) e.email = vEmail(f.email);
  if (vPassword(f.password)) e.password = vPassword(f.password);
  if (f.confirmPassword !== f.password) e.confirmPassword = 'Passwords do not match';
  return e;
}

export function validateLogin(f) {
  const e = {};
  if (vEmail(f.email)) e.email = vEmail(f.email);
  if (!f.password) e.password = 'Password is required';
  return e;
}

export function validateContact(f) {
  const e = {};
  if ((f.name || '').trim().length < 2) e.name = 'Name must be at least 2 characters';
  if (vEmail(f.email)) e.email = vEmail(f.email);
  if ((f.message || '').trim().length < 10) e.message = 'Message must be at least 10 characters';
  return e;
}

export function validateRegistration(f) {
  const e = {};
  if (vName(f.fullName)) e.fullName = vName(f.fullName);
  if (vEmail(f.email)) e.email = vEmail(f.email);
  if (!MOBILE_REGEX.test(f.mobileNumber)) e.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
  ['collegeName', 'course', 'branch', 'yearOfStudy', 'domain'].forEach((k) => { if (!f[k]) e[k] = 'This field is required'; });
  if ((f.projectName || '').trim().length < 5) e.projectName = 'Project name must be at least 5 characters';

  const ppt = parseUrl((f.pptLink || '').trim());
  if (!ppt || !hostIn(ppt, PPT_HOSTS)) e.pptLink = 'Enter a valid Google Drive or OneDrive link';
  if (!parseUrl((f.prototypeLink || '').trim())) e.prototypeLink = 'Enter a valid GitHub, Figma or live demo URL';
  if ((f.demoVideoLink || '').trim()) {
    const v = parseUrl(f.demoVideoLink.trim());
    if (!v || !hostIn(v, VIDEO_HOSTS)) e.demoVideoLink = 'Enter a valid YouTube or Google Drive link';
  }

  const size = Number(f.teamSize);
  if (!(size >= 1 && size <= 5)) e.teamSize = 'Select a team size';
  const seen = new Set();
  (f.teamMembers || []).forEach((m, i) => {
    if (vName(m.name, 'Member name')) e[`teamMembers.${i}.name`] = vName(m.name, 'Member name');
    if (vEmail(m.email)) e[`teamMembers.${i}.email`] = vEmail(m.email);
    else if (seen.has(m.email.trim().toLowerCase())) e[`teamMembers.${i}.email`] = 'Each member needs a different email';
    seen.add((m.email || '').trim().toLowerCase());
  });
  return e;
}
