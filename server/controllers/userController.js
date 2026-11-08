const asyncHandler = require('../utils/asyncHandler');

// GET /api/user/me
const getMe = asyncHandler(async (req, res) => res.json({ user: req.user }));

// PUT /api/user/update  (only the display name is editable; email is tied to the verified account)
const updateMe = asyncHandler(async (req, res) => {
  req.user.fullName = req.body.fullName;
  await req.user.save();
  res.json({ message: 'Profile updated', user: req.user });
});

module.exports = { getMe, updateMe };
