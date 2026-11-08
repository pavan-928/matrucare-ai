const router = require('express').Router();
const c = require('../controllers/authController');
const v = require('../middleware/validators');

router.post('/signup', v.signupRules, v.validate, c.signup);
router.post('/verify-otp', v.otpRules, v.validate, c.verifyOtp);
router.post('/resend-otp', v.emailOnlyRules, v.validate, c.resendOtp);
router.post('/login', v.loginRules, v.validate, c.login);
router.post('/logout', c.logout);

module.exports = router;
