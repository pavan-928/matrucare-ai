const User = require('../models/User');
const { generateOtp, hashOtp } = require('../utils/otp');
const { OTP_TTL_MS } = require('../utils/constants');
const { sendOtpEmail } = require('./emailService');

/** Generates a fresh OTP, stores its hash with a 10-minute expiry, and emails the code. */
const issueOtp = async (user) => {
  const otp = generateOtp();
  await User.updateOne(
    { _id: user._id },
    { otp: hashOtp(otp), otpExpiresAt: new Date(Date.now() + OTP_TTL_MS), otpAttempts: 0 }
  );
  await sendOtpEmail(user.email, user.fullName, otp);
};

module.exports = { issueOtp };
