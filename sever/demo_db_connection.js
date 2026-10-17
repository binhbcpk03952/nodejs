const mysql = require('mysql');
const path = require('path');
const util = require('util');

// Load biến môi trường từ .env (ưu tiên file .env ở thư mục gốc hoặc sever/)
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch {
  // Bỏ qua nếu không có dotenv
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'badminton_shop',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  charset: 'utf8mb4',
  timezone: '+07:00'
};

// Tạo Connection Pool thay vì single connection để phục vụ đồng thời nhiều request
const pool = mysql.createPool(dbConfig);

// Kiểm tra kết nối thử khi khởi động
pool.getConnection((err, connection) => {
  if (err) {
    console.warn("⚠️ Cảnh báo kết nối Database (kiểm tra MySQL đang chạy):", err.message);
    return;
  }
  console.log("✅ Kết nối Database Pool thành công! (Host:", dbConfig.host, "DB:", dbConfig.dbName || dbConfig.database, ")");
  connection.release();
});

// Helper lấy connection dạng Promise hỗ trợ transaction an toàn
pool.getConnectionAsync = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);

      // Bọc các phương thức query, beginTransaction, commit, rollback thành Promise
      const queryAsync = util.promisify(conn.query).bind(conn);
      const beginTransactionAsync = util.promisify(conn.beginTransaction).bind(conn);
      const commitAsync = util.promisify(conn.commit).bind(conn);
      const rollbackAsync = util.promisify(conn.rollback).bind(conn);

      resolve({
        rawConn: conn,
        query: queryAsync,
        beginTransaction: beginTransactionAsync,
        commit: commitAsync,
        rollback: rollbackAsync,
        release: () => conn.release()
      });
    });
  });
};

module.exports = pool;
