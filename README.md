# 🏸 Núi Xanh Badminton - E-Commerce Platform

Dự án website thương mại điện tử chuyên cung cấp vợt, giày, phụ kiện và dịch vụ đan vợt cầu lông chính hãng Núi Xanh Badminton. Hệ thống được xây dựng theo kiến trúc full-stack hiện đại: Frontend React 19 + Vite 7 và Backend Express 5 + MySQL (InnoDB).

---

## 📌 1. Công nghệ sử dụng (Tech Stack)

### Frontend
- **Framework & Core**: [React 19](https://react.dev/), [Vite 7](https://vitejs.dev/)
- **Routing & Navigation**: [React Router v7](https://reactrouter.com/) (Hỗ trợ Lazy loading & Suspense)
- **UI & Styling**: [Bootstrap 5.3](https://getbootstrap.com/), [Bootstrap Icons](https://icons.getbootstrap.com/), Vanilla CSS / Responsive Layouts
- **Data Visualization**: [Chart.js 4](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/) (Báo cáo doanh thu & đơn hàng admin)
- **HTTP Client**: [Axios](https://axios-http.com/) với Interceptor tự động gắn Bearer Token và xử lý lỗi 401

### Backend
- **Runtime & Web Framework**: [Node.js](https://nodejs.org/) (LTS/v22+), [Express 5](https://expressjs.com/)
- **Database Engine**: [MySQL](https://www.mysql.com/) (InnoDB, Connection Pooling `mysql.createPool`, Pessimistic Locking `FOR UPDATE`, Transactions)
- **Authentication & Security**: Native Node.js `crypto.scryptSync` (OWASP/NIST standards), JWT HMAC-SHA256, CORS config, Role-based middleware (`authenticate`, `requireAdmin`)
- **File Upload & Storage**: [Multer](https://github.com/expressjs/multer) kết hợp cơ chế dọn dẹp file an toàn sau khi commit giao dịch database (`post-commit physical cleanup`)

---

## 📂 2. Cấu trúc thư mục dự án

```
react_js_pro/
├── database/
│   ├── schema.sql           # Cấu trúc 13 bảng chuẩn InnoDB với khóa ngoại & chỉ mục
│   └── seed.sql             # Dữ liệu mẫu (tài khoản demo, danh mục, sản phẩm, mã giảm giá)
├── docs/
│   ├── PROJECT_AUDIT.md     # Báo cáo kiểm toán bảo mật, kiến trúc & hiệu năng (P0 - P3)
│   ├── PROJECT_COMPLETION_STATUS.md # Bảng theo dõi tiến độ hoàn thiện chi tiết
│   └── VERIFICATION.md      # Nhật ký kiểm thử, log lint, test, build và số liệu benchmark
├── public/                  # Static assets công khai
├── sever/                   # Backend Express (CommonJS)
│   ├── controllers/         # Xử lý nghiệp vụ (auth, product, cart, order, address, contact...)
│   ├── middleware/          # authMiddleware (authenticate, requireAdmin, optionalAuth)
│   ├── routes/              # Định tuyến API RESTful
│   ├── tests/               # Bộ test tự động (auth_order_test.js)
│   ├── uploads/             # Thư mục lưu trữ hình ảnh sản phẩm
│   ├── utils/               # authHelper.js (scrypt, JWT signing/verification)
│   ├── demo_db_connection.js# MySQL Connection Pool & Promise/Transaction Wrapper
│   └── sever.js             # Express Entry Point, Middleware & Route Mounting
├── src/                     # Frontend React (ES Modules)
│   ├── api/                 # Cấu hình Axios & Interceptors
│   ├── assets/              # Hình ảnh, icons giao diện
│   ├── components/          # Header, Footer, Admin Layout, ProtectedRoute...
│   ├── context/             # AuthContext (quản lý phiên đăng nhập JWT thực tế)
│   ├── pages/               # Trang người dùng & Quản trị Admin
│   ├── App.jsx              # Định tuyến ứng dụng với React.lazy & Suspense
│   └── main.jsx             # React DOM root entry
├── .env.example             # Template biến môi trường mẫu an toàn
├── eslint.config.js         # Cấu hình ESLint thống nhất cho cả frontend và backend
├── package.json             # Scripts & dependencies
└── vite.config.js           # Cấu hình Vite & tối ưu hóa chia nhỏ chunk (manualChunks)
```

---

## 🚀 3. Hướng dẫn cài đặt & Chạy dự án

### Bước 1: Yêu cầu môi trường
- **Node.js**: Phiên bản 18 trở lên (Khuyến nghị LTS hoặc v22).
- **MySQL / MariaDB**: Phiên bản 8.0+ hoặc MariaDB 10.4+ (thông qua MySQL Server độc lập, XAMPP hoặc Docker).

### Bước 2: Thiết lập biến môi trường
Sao chép file `.env.example` thành file `.env` ở thư mục gốc:
```bash
cp .env.example .env
```
Cấu hình các thông số phù hợp trong `.env`:
```env
# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_IMAGE_BASE_URL=http://localhost:5000/uploads

# Backend
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=badminton_shop
JWT_SECRET=your_super_secret_jwt_key_badminton_2026
```

### Bước 3: Khởi tạo Cơ sở dữ liệu (Database)

Dự án đã được đóng gói sẵn **Docker Compose** với **MySQL 8.0**, tự động nạp toàn bộ cấu trúc bảng và dữ liệu mẫu:

#### Cách 1: Khởi động tự động bằng Docker (Khuyến nghị 🌟)
Chạy một lệnh duy nhất:
```bash
npm run db:up
# Hoặc chạy script trên Windows: .\docker-db.bat
```
- **MySQL Server:** `localhost:3308` (User: `root`, Mật khẩu: `root`, Database: `badminton_shop`).
- **Quản lý bằng HeidiSQL / DBeaver:**
  - Network type: `MariaDB or MySQL (TCP/IP)`
  - Hostname / IP: `127.0.0.1` (hoặc `localhost`)
  - User: `root` | Password: `root` | Port: `3308` | Database: `badminton_shop`
- Dữ liệu schema (`01_schema.sql`) và seed (`02_seed.sql`) tự động nạp sẵn vào database ngay lần chạy đầu tiên.
- Lệnh dừng database: `npm run db:down` | Xem logs: `npm run db:logs` | Reset sạch: `.\docker-db.bat reset`.

#### Cách 2: Sử dụng MySQL cục bộ (XAMPP / MySQL Server độc lập)
Nếu bạn đã có sẵn MySQL cục bộ:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS badminton_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p badminton_shop < database/schema.sql
mysql -u root -p badminton_shop < database/seed.sql
```

### Bước 4: Cài đặt thư viện dependencies
```bash
npm install
```

### Bước 5: Chạy ứng dụng
Mở 2 cửa sổ terminal:
- **Terminal 1 (Backend API Server)**:
  ```bash
  npm run dev:server
  ```
  *Server chạy tại:* `http://localhost:5000` (API endpoint: `http://localhost:5000/api`)

- **Terminal 2 (Frontend Client)**:
  ```bash
  npm run dev
  ```
  *Frontend chạy tại:* `http://localhost:5173`

---

## 🔐 4. Tài khoản dùng thử (Test Accounts)

Hệ thống đã có sẵn 2 tài khoản mẫu trong `database/seed.sql` với mật khẩu được mã hóa an toàn bằng chuẩn `crypto.scrypt`:

| Vai trò | Email | Mật khẩu mặc định | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@badminton.vn` | `Admin@123456` | Toàn quyền: Xem Dashboard, Quản lý đơn hàng, Thêm/Sửa/Xóa sản phẩm, Upload ảnh |
| **Khách hàng (Customer)** | `customer@badminton.vn` | `Customer@123456` | Xem sản phẩm, Quản lý giỏ hàng, Thêm địa chỉ, Đặt hàng, Xem lịch sử mua hàng, Đổi mật khẩu |

*(Tại màn hình Đăng nhập `http://localhost:5173/login`, có sẵn 2 nút "Dùng tài khoản Admin mẫu" và "Dùng tài khoản Khách mẫu" để tự động điền nhanh khi test).*

---

## 🧪 5. Kiểm thử & Đảm bảo chất lượng (Verification)

### 1. Chạy bộ kiểm thử tự động (Unit / Integration Tests)
Kiểm tra tính đúng đắn của hàm băm scrypt, xác thực JWT, phát hiện token bị can thiệp/hết hạn, validation số điện thoại Việt Nam, tính toán chiết khấu voucher và máy trạng thái đơn hàng (order state machine):
```bash
npm test
```
*Kết quả:* `14/14 tests passed` (Exit code: 0).

### 2. Kiểm tra chất lượng mã nguồn (Linting)
Kiểm tra cú pháp và quy chuẩn mã nguồn cho toàn bộ thư mục `src/` và `sever/`:
```bash
npm run lint
```
*Kết quả:* `0 errors, 0 warnings` (Exit code: 0).

### 3. Đóng gói sản xuất (Production Build)
Biên dịch và tối ưu hóa tài nguyên frontend:
```bash
npm run build
```
*Kết quả:* Tối ưu hóa chia nhỏ chunk hiệu quả:
- Monolithic chunk ban đầu: **578.39 kB** ➔ Chunk ứng dụng chính sau tối ưu: **206.71 kB** (Gzip: **39.90 kB**).
- Tách riêng các vendor độc lập: `vendor-react` (429 kB), `vendor-bootstrap` (311 kB), `vendor-charts` (173 kB).
- Tất cả các trang admin & phụ trợ đều được nạp lười (`React.lazy`) theo route.

---

## 🛡️ 6. Các điểm cải tiến bảo mật & Kiến trúc cốt lõi

1. **Chống gian lận giá & Khóa tồn kho (Inventory Pessimistic Locking)**:
   - Toàn bộ giá trị đơn hàng, phí ship, và chiết khấu voucher được tính toán tuyệt đối trên server dựa trên bảng giá DB, không chấp nhận tổng tiền client gửi lên.
   - Khi tạo đơn, sử dụng giao dịch MySQL với `SELECT stock FROM products ... FOR UPDATE` để ngăn chặn triệt để race-condition bán vượt tồn kho (overselling).
2. **Loại bỏ hoàn toàn lỗ hổng leo quyền (Privilege Escalation)**:
   - Xóa bỏ nút chuyển đổi role giả lập trên giao diện người dùng.
   - Mọi API thêm/sửa/xóa sản phẩm và cập nhật trạng thái đơn hàng được bảo vệ bởi middleware `requireAdmin` kiểm tra trực tiếp chữ ký JWT.
3. **Mã hóa mật khẩu chuẩn OWASP**:
   - Thay thế việc so sánh plaintext / hardcoded bằng thuật toán băm khóa dẫn xuất `crypto.scrypt` với muối ngẫu nhiên 16 bytes.
4. **An toàn tập tin & Post-Commit Cleanup**:
   - Upload file sử dụng đường dẫn tuyệt đối, chuẩn hóa định dạng ảnh hợp lệ.
   - File cũ chỉ bị xóa khỏi ổ cứng (`fs.unlinkSync`) *sau khi* transaction database đã commit thành công, đảm bảo nếu DB lỗi thì file trên ổ đĩa không bị mất oan.
5. **Đồng bộ phân trang & bộ lọc**:
   - Đồng nhất logic đếm tổng số trang (`COUNT(*)`) và danh sách kết quả (`SELECT ... LIMIT / OFFSET`) khi tìm kiếm, phân loại và lọc theo khoảng giá.

---

## 📄 7. Tài liệu kỹ thuật chi tiết
- [Báo cáo Kiểm toán chi tiết (PROJECT_AUDIT.md)](docs/PROJECT_AUDIT.md)
- [Bảng trạng thái hoàn thiện tính năng (PROJECT_COMPLETION_STATUS.md)](docs/PROJECT_COMPLETION_STATUS.md)
- [Nhật ký và Biên bản kiểm chứng (VERIFICATION.md)](docs/VERIFICATION.md)
