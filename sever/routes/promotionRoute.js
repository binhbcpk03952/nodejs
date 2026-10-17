const express = require('express');
const router = express.Router();

const controller = require('../controllers/promotionController');

router.get('/', controller.getPromotions);

module.exports = router;