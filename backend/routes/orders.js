const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Statistics route (Must be before /:id)
router.get('/statistics', authenticate, requireAdmin, orderController.getStatistics);

// User routes
router.get('/my-orders', authenticate, orderController.getUserOrders);
router.post('/', authenticate, orderController.createOrder);
router.post('/verify-payment', authenticate, orderController.verifyPayment);
router.get('/:id', authenticate, orderController.getOrderById);

// Admin routes
router.get('/', authenticate, requireAdmin, orderController.getAllOrders);
router.put('/:id/status', authenticate, requireAdmin, orderController.updateOrderStatus);

module.exports = router;
