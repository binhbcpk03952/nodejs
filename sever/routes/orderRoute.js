const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// Route người dùng thông thường (Customer)
router.get('/', authenticate, controller.getOrders);
router.post('/', authenticate, controller.addOrder);
router.get('/:id', authenticate, controller.getOrderById);
router.put('/:id', authenticate, controller.updateOrderStatus);

// Route quản trị viên (Admin)
router.get('/all', authenticate, requireAdmin, controller.getAllOrders);
router.get('/dashboard', authenticate, requireAdmin, controller.getDashboardStatistic);

module.exports = router;