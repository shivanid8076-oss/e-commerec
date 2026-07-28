const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');

// Note: In a fully authenticated app, you'd use a middleware like authOptional 
// to extract req.user if present, but allow requests without it.
// For now, we'll assume the controller handles extraction from token or session.

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.delete('/item/:itemId', cartController.removeFromCart);
router.patch('/item/:itemId', cartController.updateQuantity);

module.exports = router;
