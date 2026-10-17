const express = require('express');
const router = express.Router();
const controller = require('../controllers/cartController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, controller.getCartItems);
router.post('/', authenticate, controller.addToCart);
router.put('/:id', authenticate, controller.updateCartItem);
router.delete('/:id', authenticate, controller.deleteCartItem);

module.exports = router;