const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { hashOtp, safeEqual } = require('../utils/otp');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/token');
const { OTP_TTL_MS, OTP_RESEND_COOLDOWN_MS, OTP_MAX_ATTEMPTS } = require('../utils/constants');
const { issueOtp } = require('../services/otpService');

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing && existing.isVerified) throw new AppError('An account with this email already exists. Please log in.', 409);

  const hashed = await bcrypt.hash(password, 12);
  let user = existing;
  if (user) {
    // Unverified account re-registering: refresh details and send a new OTP.
    user.fullName = fullName;
    user.password = hashed;
    await user.save();
  } else {
    user = await User.create({ fullName, email, password: hashed });
  }

  try {
    await issueOtp(user);
  } catch (err) {
    console.error('OTP email failed:', err.message);
    throw new AppError('Your account was created but we could not send the OTP email. Use "Resend OTP" to try again.', 502);
  }
  res.status(201).json({ message: 'Account created. We sent a 6-digit OTP to your email.', email: user.email });
});

// POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpiresAt +otpAttempts');
  if (!user) throw new AppError('Invalid or expired OTP', 400);
  if (user.isVerified) throw new AppError('This email is already verified. Please log in.', 400);
  if (!user.otp || !user.otpExpiresAt) throw new AppError('No active OTP. Please request a new one.', 400);

  if (user.otpExpiresAt.getTime() < Date.now()) {
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    throw new AppError('This OTP has expired. Please request a new one.', 400);
  }

  if (!safeEqual(user.otp, hashOtp(otp))) {
    user.otpAttempts += 1;
    if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      throw new AppError('Too many incorrect attempts. Please request a new OTP.', 400);
    }
    await user.save();
    throw new AppError('Incorrect OTP. Please check the code and try again.', 400);
  }

  // Success: mark verified and invalidate the OTP so it cannot be reused.
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  user.otpAttempts = 0;
  await user.save();
  res.json({ message: 'Email verified. You can now log in.' });
});

// POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+otpExpiresAt');
  const generic = { message: 'If this email has a pending account, a new OTP has been sent.' };
  if (!user || user.isVerified) return res.json(generic); // avoid revealing which emails exist

  if (user.otpExpiresAt) {
    const sentAt = user.otpExpiresAt.getTime() - OTP_TTL_MS;
    const waitMs = OTP_RESEND_COOLDOWN_MS - (Date.now() - sentAt);
    if (waitMs > 0) throw new AppError(`Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another OTP.`, 429);
  }

  try {
    await issueOtp(user);
  } catch (err) {
    console.error('OTP email failed:', err.message);
    throw new AppError('We could not send the OTP email. Please try again shortly.', 502);
  }
  res.json(generic);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) throw new AppError('Invalid email or password', 401);
  if (!user.isVerified) throw new AppError('Please verify your email before logging in.', 403, 'NOT_VERIFIED');

  setAuthCookie(res, signToken(user._id));
  res.json({ message: 'Logged in', user });
});

// POST /api/auth/logout
const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
};

module.exports = { signup, verifyOtp, resendOtp, login, logout };
