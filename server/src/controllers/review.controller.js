const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../middleware/asyncHandler');

// Customer: Add a review for a product
exports.addReview = asyncHandler(async (req, res) => {
    const { productId, rating, title, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Valid Product ID and Rating (1-5) are required' });
    }

    // Check if the user has purchased the product to set isVerifiedPurchase
    const hasPurchased = await prisma.order.findFirst({
      where: {
        email: req.user.email,
        productId: productId,
        status: { in: ['COMPLETED', 'RETURN_REQUESTED'] } // Or check paymentStatus
      }
    });

    const isVerifiedPurchase = !!hasPurchased;

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        title,
        comment,
        isVerifiedPurchase
      }
    });

    res.status(201).json({ success: true, message: 'Review added successfully', review });
});

// Public: Get approved reviews for a product
exports.getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: {
        user: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const aggregations = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true }
    });

    res.json({
      success: true,
      reviews,
      stats: {
        averageRating: aggregations._avg.rating ? parseFloat(aggregations._avg.rating.toFixed(1)) : 0,
        totalReviews: aggregations._count.rating
      }
    });
});

// Admin: Get all reviews (including unapproved)
exports.getAllReviews = asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { username: true, email: true } },
        product: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, reviews });
});

// Admin: Toggle approval status (Hide spam/abusive reviews)
exports.toggleApproval = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved }
    });

    res.json({ success: true, message: 'Review status updated', review });
});
