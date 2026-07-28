const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);

// Admin only routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/', productController.createProduct);
router.post('/bulk-delete', productController.bulkDelete);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/feature', productController.toggleFeature);
router.patch('/:id/stock', productController.toggleStock);
router.patch('/:id/price', productController.updatePrice);

module.exports = router;
