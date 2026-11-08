const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/hackathonController');
const v = require('../middleware/validators');

router.use(protect);
router.post('/register', v.hackathonRules, v.validate, c.register);
router.get('/my-entry', c.getMyEntry);
router.put('/:id', v.hackathonRules, v.validate, c.updateEntry);
router.delete('/:id', c.deleteEntry);

module.exports = router;
