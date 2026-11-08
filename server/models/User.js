const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true, minlength: 3, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    // select:false keeps secrets out of every query unless explicitly requested.
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false }, // stores an HMAC of the OTP, never the raw code
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Safety net: never serialise secrets, even if a query selected them.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.otp;
    delete ret.otpExpiresAt;
    delete ret.otpAttempts;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
