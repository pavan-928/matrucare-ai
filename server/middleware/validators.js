const { body, validationResult } = require('express-validator');
const {
  COLLEGES, COURSES, BRANCHES, YEARS, DOMAINS, NAME_REGEX, INDIAN_MOBILE_REGEX,
} = require('../utils/constants');

/** Runs after the rule chains; responds 400 with per-field messages. */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
  return res.status(400).json({ message: errors[0].message, errors });
};

const parseUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
};
const hostMatches = (url, hosts) => hosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`));

const PPT_HOSTS = ['drive.google.com', 'docs.google.com', 'onedrive.live.com', '1drv.ms', 'sharepoint.com', 'onedrive.com'];
const VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'drive.google.com'];

const nameRule = (field, label) =>
  body(field).trim().isLength({ min: 3 }).withMessage(`${label} must be at least 3 characters`)
    .bail().matches(NAME_REGEX).withMessage(`${label} can contain letters only`);

const emailRule = (field) =>
  body(field).trim().isEmail().withMessage('Enter a valid email address').bail().customSanitizer((v) => v.toLowerCase());

const passwordRule = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .bail().matches(/[A-Za-z]/).withMessage('Password must include a letter')
  .bail().matches(/\d/).withMessage('Password must include a number');

const signupRules = [
  nameRule('fullName', 'Full name'),
  emailRule('email'),
  passwordRule,
  body('confirmPassword').custom((v, { req }) => v === req.body.password).withMessage('Passwords do not match'),
];
const loginRules = [emailRule('email'), body('password').notEmpty().withMessage('Password is required')];
const otpRules = [emailRule('email'), body('otp').trim().matches(/^\d{6}$/).withMessage('Enter the 6-digit OTP')];
const emailOnlyRules = [emailRule('email')];
const updateUserRules = [nameRule('fullName', 'Full name')];

const hackathonRules = [
  nameRule('fullName', 'Full name'),
  emailRule('email'),
  body('mobileNumber').trim().matches(INDIAN_MOBILE_REGEX).withMessage('Enter a valid 10-digit Indian mobile number'),
  body('collegeName').isIn(COLLEGES).withMessage('Select a college from the list'),
  body('course').isIn(COURSES).withMessage('Select a course'),
  body('branch').isIn(BRANCHES).withMessage('Select a branch'),
  body('yearOfStudy').isIn(YEARS).withMessage('Select your year of study'),
  body('domain').isIn(DOMAINS).withMessage('Select a domain'),
  body('projectName').trim().isLength({ min: 5, max: 100 }).withMessage('Project name must be 5 to 100 characters'),
  body('pptLink').trim().custom((v) => {
    const url = parseUrl(v);
    return !!url && hostMatches(url, PPT_HOSTS);
  }).withMessage('Enter a valid Google Drive or OneDrive link'),
  body('prototypeLink').trim().custom((v) => !!parseUrl(v)).withMessage('Enter a valid GitHub, Figma or live demo URL'),
  body('demoVideoLink').optional({ values: 'falsy' }).trim().custom((v) => {
    const url = parseUrl(v);
    return !!url && hostMatches(url, VIDEO_HOSTS);
  }).withMessage('Enter a valid YouTube or Google Drive link'),
  body('teamSize').isInt({ min: 1, max: 5 }).withMessage('Team size must be between 1 and 5').toInt(),
  // Solo (size 1) has no extra members; sizes 2-5 need exactly that many members.
  body('teamMembers').isArray().withMessage('Team members must be a list').bail().custom((members, { req }) => {
    const expected = req.body.teamSize === 1 ? 0 : req.body.teamSize;
    return members.length === expected;
  }).withMessage('Number of team members must match the team size'),
  body('teamMembers.*.name').trim().isLength({ min: 3 }).withMessage('Member name must be at least 3 characters')
    .bail().matches(NAME_REGEX).withMessage('Member name can contain letters only'),
  body('teamMembers.*.email').trim().isEmail().withMessage('Enter a valid member email').bail().customSanitizer((v) => v.toLowerCase()),
  body('teamMembers').custom((members) => {
    if (!Array.isArray(members)) return true;
    const emails = members.map((m) => m && m.email);
    return new Set(emails).size === emails.length;
  }).withMessage('Each team member needs a different email'),
];

const contactRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2 to 80 characters'),
  emailRule('email'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be 10 to 2000 characters'),
];

module.exports = {
  validate, signupRules, loginRules, otpRules, emailOnlyRules, updateUserRules, hackathonRules, contactRules,
};
