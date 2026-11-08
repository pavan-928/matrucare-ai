const crypto = require('crypto');

/** Cryptographically secure random 6-digit OTP. */
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

/** HMAC the OTP so a leaked database does not reveal live codes. */
const hashOtp = (otp) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(String(otp)).digest('hex');

const safeEqual = (a, b) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

module.exports = { generateOtp, hashOtp, safeEqual };
