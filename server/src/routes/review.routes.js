const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public route: Get reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);

// Customer route: Add a review (Must be logged in)
// Assuming we have customer auth setup (using standard authenticate middleware for now)
router.post('/', authenticate, reviewController.addReview);

// Admin routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/all', reviewController.getAllReviews);
router.patch('/:id/approve', reviewController.toggleApproval);

module.exports = router;
