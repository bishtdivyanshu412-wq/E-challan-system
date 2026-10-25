const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const { myVehicles, myViolations, myPayments, payFine } = require('../controllers/driver.controller');

router.get('/vehicles', auth(), requireRole('DRIVER'), myVehicles);
router.get('/violations', auth(), requireRole('DRIVER'), myViolations);
router.get('/payments', auth(), requireRole('DRIVER'), myPayments);
router.post('/pay', auth(), requireRole('DRIVER'), payFine);

module.exports = router;