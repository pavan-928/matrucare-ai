const Registration = require('../models/Registration');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendRegistrationEmail } = require('../services/emailService');

const FIELDS = [
  'fullName', 'mobileNumber', 'collegeName', 'course', 'branch', 'yearOfStudy', 'domain',
  'projectName', 'pptLink', 'prototypeLink', 'demoVideoLink', 'teamSize', 'teamMembers',
];
// Whitelist fields so clients cannot set userId, email or timestamps directly.
const pick = (body) => Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

// POST /api/hackathon/register
const register = asyncHandler(async (req, res) => {
  if (await Registration.findOne({ userId: req.user._id })) {
    throw new AppError('You have already registered for the hackathon.', 409);
  }
  const registration = await Registration.create({
    ...pick(req.body),
    userId: req.user._id,
    email: req.user.email, // always the verified account email
  });

  let emailSent = true;
  try {
    await sendRegistrationEmail(registration.email, registration);
  } catch (err) {
    emailSent = false; // registration is saved; do not fail the request over email
    console.error('Confirmation email failed:', err.message);
  }
  res.status(201).json({ message: 'Registration successful', registration, emailSent });
});

// GET /api/hackathon/my-entry
const getMyEntry = asyncHandler(async (req, res) => {
  const registration = await Registration.findOne({ userId: req.user._id });
  res.json({ registration });
});

// PUT /api/hackathon/:id
const updateEntry = asyncHandler(async (req, res) => {
  const registration = await Registration.findOne({ _id: req.params.id, userId: req.user._id });
  if (!registration) throw new AppError('Registration not found', 404);
  registration.set(pick(req.body));
  await registration.save();
  res.json({ message: 'Registration updated', registration });
});

// DELETE /api/hackathon/:id
const deleteEntry = asyncHandler(async (req, res) => {
  const deleted = await Registration.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deleted) throw new AppError('Registration not found', 404);
  res.json({ message: 'Registration deleted' });
});

module.exports = { register, getMyEntry, updateEntry, deleteEntry };
