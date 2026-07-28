const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shipping.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public route: Track order using Airway Bill (AWB) number
router.get('/track/:awb', shippingController.trackOrder);

// Admin only route: Create a shipment in Shiprocket
router.post('/create', authenticate, authorize('ADMIN'), shippingController.createShipment);

module.exports = router;
