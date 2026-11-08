const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { COOKIE_NAME } = require('../utils/token');

/** Protects a route: requires a valid JWT in the HTTP-only cookie and a verified user. */
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) throw new AppError('Please log in to continue', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Your session has expired. Please log in again', 401);
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isVerified) throw new AppError('Please log in to continue', 401);

  req.user = user;
  next();
});

module.exports = { protect };
