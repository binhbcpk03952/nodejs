const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', controller.createContact);
router.get('/', authenticate, requireAdmin, controller.getContacts);

module.exports = router;
