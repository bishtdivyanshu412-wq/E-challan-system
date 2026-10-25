const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const { lookupByVehicle, addViolation, listViolations } = require('../controllers/officer.controller');

router.get('/lookup', auth(), requireRole('OFFICER'), lookupByVehicle);
router.post('/violations', auth(), requireRole('OFFICER'), addViolation);
router.get('/violations', auth(), requireRole('OFFICER'), listViolations);

module.exports = router;