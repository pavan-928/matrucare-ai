const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const { sendContactNotification } = require('../services/emailService');

// POST /api/contact
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  await Contact.create({ name, email, message });
  sendContactNotification({ name, email, message }).catch((err) => console.error('Contact email failed:', err.message));
  res.status(201).json({ message: 'Thanks for reaching out. We will reply soon.' });
});

module.exports = { submitContact };
