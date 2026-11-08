const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getMe, updateMe } = require('../controllers/userController');
const v = require('../middleware/validators');

router.get('/me', protect, getMe);
router.put('/update', protect, v.updateUserRules, v.validate, updateMe);

module.exports = router;
