const express = require('express');
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productByPageController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Đường dẫn tuyệt đối chuẩn xác cho thư mục uploads, không phụ thuộc vào cwd
const uploadsDir = path.join(__dirname, '../uploads');

// Cấu hình multer lưu trữ với đường dẫn tuyệt đối
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận các tệp hình ảnh (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Route xem sản phẩm công khai (Public)
router.get('/best-seller', productController.getProdctBestSeller);
router.get('/related/:id', productController.getProductRelated);
router.get('/by-page', productController.getProductByPage);
router.get('/:id', productController.getProductById);
router.get('/', productController.getProducts);

// Route quản trị viên (Admin only)
router.post('/', authenticate, requireAdmin, upload.array('images', 10), productController.createProduct);
router.post('/:id', authenticate, requireAdmin, upload.array('images', 10), productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

module.exports = router;