const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
// Anyone can create an order (Buy It Now flow)
router.post('/', orderController.createOrder);

// Customer actions (Usually would require customer auth, but using order ID for simplicity now)
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/return', orderController.requestReturn);

// Admin only routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', orderController.getAllOrders);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
