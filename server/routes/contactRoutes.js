const router = require('express').Router();
const { submitContact } = require('../controllers/contactController');
const v = require('../middleware/validators');

router.post('/', v.contactRules, v.validate, submitContact);

module.exports = router;
