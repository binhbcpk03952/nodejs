const express = require('express');
const router = express.Router();
const controller = require('../controllers/addressControler');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, controller.getAddresses);
router.post('/', authenticate, controller.createAddress);

module.exports = router;