const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public route to get settings (e.g. for storefront banner)
router.get('/', settingsController.getSettings);

// Admin only route to update settings
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/', settingsController.updateSetting);

module.exports = router;
