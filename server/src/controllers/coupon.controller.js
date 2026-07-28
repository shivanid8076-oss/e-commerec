const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../middleware/asyncHandler');

// Create a new coupon (Admin only)
exports.createCoupon = asyncHandler(async (req, res) => {
    const { 
      code, discountType, discountValue, 
      minOrderValue, maxDiscount, expiryDate, usageLimit 
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code, Discount Type, and Value are required' });
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType, // 'PERCENTAGE' or 'FLAT'
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      }
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully', coupon: newCoupon });
});

// Get all coupons (Admin only)
exports.getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, coupons });
});

// Toggle coupon status (Admin only)
exports.toggleCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: { isActive }
    });
    
    res.json({ success: true, message: 'Coupon status updated', coupon: updatedCoupon });
});

// Delete coupon (Admin only)
exports.deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res.json({ success: true, message: 'Coupon deleted successfully' });
});

// Validate and apply coupon (Public)
exports.applyCoupon = asyncHandler(async (req, res) => {
    const { code, orderValue } = req.body;
    
    if (!code || !orderValue) {
      return res.status(400).json({ success: false, message: 'Code and order value are required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    // Validations
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (!coupon.isActive) return res.status(400).json({ success: false, message: 'Coupon is not active' });
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    if (coupon.minOrderValue && parseFloat(orderValue) < coupon.minOrderValue) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'FLAT') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (parseFloat(orderValue) * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }

    // Ensure discount doesn't exceed order value
    discountAmount = Math.min(discountAmount, parseFloat(orderValue));

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discountAmount,
      finalAmount: parseFloat(orderValue) - discountAmount,
      couponCode: coupon.code
    });
});
