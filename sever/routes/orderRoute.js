const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// Route người dùng thông thường (Customer)
router.get('/', authenticate, controller.getOrders);
router.post('/', authenticate, controller.addOrder);

// Route quản trị viên (Admin)
router.get('/all', authenticate, requireAdmin, controller.getAllOrders);
router.get('/dashboard', authenticate, requireAdmin, controller.getDashboardStatistic);

// Route chi tiết & cập nhật theo id
router.get('/:id', authenticate, controller.getOrderById);
router.put('/:id', authenticate, controller.updateOrderStatus);

module.exports = router;