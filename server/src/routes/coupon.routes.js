const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public route: Apply a coupon
router.post('/apply', couponController.applyCoupon);

// Admin only routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/', couponController.createCoupon);
router.get('/', couponController.getAllCoupons);
router.patch('/:id/status', couponController.toggleCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
