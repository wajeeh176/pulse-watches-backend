const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { createOrder, getMyOrders, getAllOrders } = require('../controllers/orderController');

// Important: More specific routes must come before general ones
router.get('/mine', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders); // Admin: get all orders
router.post('/', protect, createOrder);

module.exports = router;
