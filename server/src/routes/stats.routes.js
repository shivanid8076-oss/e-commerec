const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Admin only route
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', statsController.getAdminStats);
router.get('/analytics', statsController.getAnalytics);
router.get('/customers', statsController.getCustomers);

module.exports = router;
