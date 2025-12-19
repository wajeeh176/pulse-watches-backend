const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const seoController = require('../controllers/seoController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);

// admin routes
router.post('/', protect, admin, productController.createProduct);
// Public: allow generating SEO without auth (safe local generator)
router.post('/generate-seo', seoController.generateSEO);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;
