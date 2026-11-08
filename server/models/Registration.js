const mongoose = require('mongoose');
const { COLLEGES, COURSES, BRANCHES, YEARS, DOMAINS, NAME_REGEX, INDIAN_MOBILE_REGEX } = require('../utils/constants');

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, match: NAME_REGEX },
    email: { type: String, required: true, trim: true, lowercase: true, match: /^\S+@\S+\.\S+$/ },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    // unique:true enforces one hackathon registration per user at the database level.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true, minlength: 3, match: NAME_REGEX },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true, match: [INDIAN_MOBILE_REGEX, 'Enter a valid 10-digit Indian mobile number'] },
    collegeName: { type: String, required: true, enum: COLLEGES },
    course: { type: String, required: true, enum: COURSES },
    branch: { type: String, required: true, enum: BRANCHES },
    yearOfStudy: { type: String, required: true, enum: YEARS },
    domain: { type: String, required: true, enum: DOMAINS },
    projectName: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
    pptLink: { type: String, required: true, trim: true },
    prototypeLink: { type: String, required: true, trim: true },
    demoVideoLink: { type: String, trim: true, default: '' },
    teamSize: { type: Number, required: true, min: 1, max: 5 },
    teamMembers: { type: [memberSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
