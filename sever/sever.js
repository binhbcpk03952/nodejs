const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch {
  // Bỏ qua
}

const authRoute = require('./routes/authRoute');
const productRoute = require('./routes/productRoutes');
const categoryRoute = require('./routes/categoryRoute');
const cartRoute = require('./routes/cartRoute');
const addressRoute = require('./routes/addressRoute');
const promotionRoute = require('./routes/promotionRoute');
const orderRoute = require('./routes/orderRoute');
const contactRoute = require('./routes/contactRoute');

const app = express();

// Cấu hình CORS
const corsOrigin = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) 
  : '*';

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh cho uploads và assets (hỗ trợ cả prefix /sever/ để tương thích ngược)
const uploadsPath = path.join(__dirname, 'uploads');
const assetsPath = path.join(__dirname, 'assets');

app.use('/uploads', express.static(uploadsPath));
app.use('/assets', express.static(assetsPath));
app.use('/sever/assets', express.static(assetsPath));
app.use('/sever/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Núi Xanh Badminton Backend', timestamp: new Date().toISOString() });
});

// Gắn các router API
app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/categories', categoryRoute);
app.use('/cart', cartRoute);
app.use('/address', addressRoute);
app.use('/promotion', promotionRoute);
app.use('/order', orderRoute);
app.use('/contact', contactRoute);

// Test home page
app.get('/', (req, res) => {
  res.send('Núi Xanh Badminton Backend API Server is running!');
});

// Middleware 404 cho route không tồn tại
app.use((req, res) => {
  res.status(404).json({ error: "Route không tồn tại" });
});

// Middleware xử lý lỗi tập trung (Error Handler)
app.use((err, req, res, _next) => {
  console.error('[Unhandled Error]:', err);
  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  const message = err.message || 'Lỗi máy chủ nội bộ';
  res.status(status).json({ error: message });
});

const PORT = parseInt(process.env.PORT, 10) || 3030;

// Khởi chạy server nếu file được thực thi trực tiếp
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server Núi Xanh Badminton đang chạy tại http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("\nĐang đóng server và giải phóng tài nguyên...");
    server.close(() => {
      const db = require('./demo_db_connection');
      if (typeof db.end === 'function') {
        db.end(() => {
          console.log("Đã giải phóng database pool. Thoát an toàn.");
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = app;
