const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Create Razorpay order (Usually called before opening the checkout modal)
router.post('/create-order', paymentController.createOrder);

// Verify payment signature (Called after Razorpay modal succeeds)
router.post('/verify', paymentController.verifyPayment);

// Razorpay Webhook Endpoint
router.post('/webhook', paymentController.webhookHandler);

module.exports = router;
