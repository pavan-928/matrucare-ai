// Single source of truth for dropdown values. Mirrored in client/src/utils/constants.js.
const COLLEGES = [
  'IIT Madras',
  'IIT Hyderabad',
  'NIT Warangal',
  'NIT Tiruchirappalli',
  'IIIT Hyderabad',
  'BITS Pilani',
  'VIT Vellore',
  'SRM Institute of Science and Technology',
  'Anna University',
  'Osmania University',
  'JNTU Hyderabad',
  'JNTU Kakinada',
  'Andhra University',
  'Other',
];
const COURSES = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BSc', 'MSc', 'Other'];
const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AI & DS', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const DOMAINS = [
  'AI/ML',
  'Web Development',
  'IoT',
  'Cyber Security',
  'Blockchain',
  'Health Tech',
  'Data Science',
  'Mobile Apps',
];

const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/; // letters (plus space . ' -) only, no digits
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

const OTP_TTL_MS = 10 * 60 * 1000; // OTP expires after 10 minutes
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const OTP_MAX_ATTEMPTS = 5;

module.exports = {
  COLLEGES,
  COURSES,
  BRANCHES,
  YEARS,
  DOMAINS,
  NAME_REGEX,
  INDIAN_MOBILE_REGEX,
  OTP_TTL_MS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_MAX_ATTEMPTS,
};
