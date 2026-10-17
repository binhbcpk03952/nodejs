# Báo Cáo Khảo Sát và Kiểm Tra Toàn Diện Hệ Thống (Audit Report)
**Dự án:** Núi Xanh Badminton (E-Commerce Web Application)  
**Thư mục làm việc:** `D:\source_code\react_js_pro`  
**Ngày thực hiện:** 17/10/2026  
**Môi trường:** Windows 10/11, Node.js v22.13.1, npm 11.11.0, React 19, Vite 7, Express 5, MySQL  

---

## 1. Bối cảnh & Phạm vi Khảo sát

Hệ thống **Núi Xanh Badminton** bao gồm:
- **Frontend:** Single Page Application (SPA) xây dựng trên React 19, Vite 7, React Router 7, Bootstrap 5, Axios, Chart.js.
- **Backend:** Node.js Express 5, MySQL, CommonJS đặt trong thư mục `sever/`.
- **Phạm vi nghiệp vụ hiện có:** Xem danh mục, danh sách & chi tiết sản phẩm, chọn biến thể (màu, size), giỏ hàng, sổ địa chỉ, checkout, đơn hàng & lịch sử đơn hàng, đăng nhập, trang liên hệ, trang giới thiệu; Admin quản lý sản phẩm (thêm/sửa/xóa, upload ảnh, quản lý biến thể), quản lý đơn hàng & chuyển trạng thái, dashboard thống kê doanh thu.

---

## 2. Ma Trận Chức Năng & Hiện Trạng Triển Khai

| STT | Chức năng | Route UI | Endpoint API | Bảng DB liên quan | Hiện trạng triển khai | Mức độ kiểm thử | Tồn đọng / Rủi ro chính | Mức ưu tiên |
|---|---|---|---|---|---|---|---|---|
| 1 | Xác thực tài khoản | `/login` | Chưa có (chỉ xử lý ở UI) | `users` | ⚠️ Mock UI hoàn toàn: login dựa vào chuỗi "admin" trong email, AuthContext cấp sẵn admin mặc định `user_id: 12`. | Chưa có test | Không có API đăng nhập, không mã hóa password, không phiên làm việc backend. | **P0** |
| 2 | Phân quyền truy cập | `/admin/*` | Không có middleware phân quyền | `users` | ⚠️ Bị hổng: `ProtectedRoute.jsx` có nút tự bật quyền admin; API admin gọi tự do không xác thực. | Kiểm tra tĩnh | Bất kỳ ai cũng có thể gọi API quản trị (thêm/xóa sản phẩm, xem toàn bộ đơn). | **P0** |
| 3 | Tách dữ liệu người dùng (Ownership) | `/carts`, `/checkout`, `/order_history` | `GET/POST /cart`, `GET/POST /address`, `GET/POST /order` | `users`, `carts`, `cart_items`, `addresses`, `orders` | ⚠️ Bị hổng: API lấy `user_id` / `cart_id` từ client hoặc fallback cố định `user_id=12, cart_id=2`. | Kiểm tra tĩnh | Customer A đọc/sửa/xóa giỏ hàng, địa chỉ, đơn hàng của Customer B. | **P0** |
| 4 | Tính tiền & Đặt hàng | `/checkout` | `POST /order` | `orders`, `order_items`, `product_variants`, `cart_items` | ⚠️ Nghiêm trọng: `total_amount`, `shipping_fee`, `discount_amount` và giá từng item tin 100% từ request body. Không có transaction. | Kiểm tra tĩnh | Gian lận giá, đơn hàng mồ côi khi lỗi giữa chừng, mất tính toàn vẹn dữ liệu. | **P0** |
| 5 | Quản lý kho & Đổi trạng thái đơn | `/admin/order_management` | `PUT /order/:id` | `orders`, `order_items`, `product_variants` | ⚠️ Nghiêm trọng: Mỗi lần gửi status `completed` lại trừ kho; dùng `GREATEST(0, ...)` che giấu âm kho; không kiểm soát transition hợp lệ. | Kiểm tra tĩnh | Trừ kho lặp nhiều lần, oversell, khách hàng tự hủy đơn đã giao. | **P1** |
| 6 | Quản lý sản phẩm & ảnh | `/admin/products`, `/admin/add_products`, `/admin/update_product/:id` | `POST /products`, `POST /products/:id`, `DELETE /products/:id` | `products`, `product_images`, `product_variants` | ⚠️ Xóa ảnh không ràng buộc `product_id`; xóa file trên đĩa trước khi commit DB; createProduct không bọc transaction. | Kiểm tra tĩnh | Xóa nhầm ảnh của sản phẩm khác; rollback DB nhưng file đã bị xóa vĩnh viễn. | **P1** |
| 7 | Danh sách sản phẩm & Lọc/Phân trang | `/products` | `GET /products` | `products`, `categories`, `product_variants`, `product_images` | ⚠️ Nhánh count khi có category bỏ sót bộ lọc search; khi hết sản phẩm trả về mảng `[]` thay vì object phân trang; lọc giá/sort chỉ thực hiện trên client (12 item/trang). | Kiểm tra tĩnh | Phân trang sai lệch, số lượng tổng không khớp, sort/lọc không phản ánh toàn bộ danh mục. | **P1** |
| 8 | Trang đơn hàng thành công | `/order_success` | `GET /order` | `orders` | ⚠️ Lấy toàn bộ đơn hàng của user 12 rồi tìm trong mảng; nếu không tìm thấy id thì fallback ngẫu nhiên lấy đơn đầu tiên (`res.data[0]`). | Kiểm tra tĩnh | Lộ đơn hàng của người khác, không báo lỗi đúng khi sai id. | **P1** |
| 9 | Trang liên hệ | `/contact` | Không có API | `contact_messages` | ⚠️ Chỉ hiện Toast thành công và xóa form, không lưu dữ liệu vào backend. | Kiểm tra tĩnh | Mất thông tin liên hệ của khách hàng, giả lập thành công. | **P2** |
| 10 | Tích hợp thanh toán | `/checkout` | Không có API VNPay backend | `orders` | ⚠️ VNPay chỉ hiện Toast "Đang tích hợp cổng VNPay sandbox". | Kiểm tra tĩnh | Chưa hoàn thiện cổng thanh toán online. | **P2** |
| 11 | Cấu hình & Bảo mật kết nối | Toàn hệ thống | N/A | Toàn bộ DB | ⚠️ Hardcode thông tin DB trong `demo_db_connection.js`; dùng `createConnection` đơn lẻ thay vì Connection Pool; `.env` chưa có trong `.gitignore`. | Kiểm tra tĩnh | Xung đột transaction trên connection dùng chung; nguy cơ rò rỉ secret. | **P1** |
| 12 | Khai báo Dependencies & Manifest | `package.json`, `sever/package.json` | N/A | N/A | ⚠️ `multer` và `sharp` khai báo ở root `package.json` thay vì `sever/package.json`; `sever/package.json` thiếu start/dev scripts. | npm check | Không thể cài đặt độc lập backend trên môi trường mới. | **P2** |
| 13 | Bundle Size & Tối ưu Frontend | Toàn bộ SPA | N/A | N/A | ⚠️ Bundle JS chính đạt 578.39 kB (> 500 kB), chưa áp dụng lazy routing và split vendor chunk. | `npm run build` | Cảnh báo build từ Vite, tăng thời gian tải trang ban đầu. | **P3** |

---

## 3. Sổ Vấn Đề Chi Tiết (Issue Register)

### [ISSUE-01] P0: Xác thực giả lập và thiếu hoàn toàn hệ thống xác thực backend
- **Vị trí:** `src/pages/Login.jsx:21-30`, `src/context/AuthContext.jsx:5-21`, `src/components/admin/ProtectedRoute.jsx:27-33`.
- **Bằng chứng:**
  - `Login.jsx` kiểm tra `email.toLowerCase().includes('admin')` để gán role admin hoặc gán `user_id: 12`.
  - `AuthContext.jsx` khởi tạo `DEFAULT_USER` với `user_id: 12, role: 'admin'`.
  - `ProtectedRoute.jsx` cung cấp nút "Bật quyền Admin để thử nghiệm" gọi `switchRole('admin')`.
  - Backend không có route `/auth` nào để kiểm tra thông tin đăng nhập hoặc cấp session/token.
- **Ảnh hưởng:** Bất kỳ người dùng nào cũng có thể truy cập trang quản trị hoặc mạo danh người dùng khác.
- **Giải pháp:**
  1. Xây dựng module xác thực backend chuẩn: `/auth/login`, `/auth/register`, `/auth/me`.
  2. Băm mật khẩu an toàn với salt (sử dụng module hashing mật khẩu chuẩn).
  3. Cấp JWT Token có thời hạn và bảo vệ bằng khóa bí mật từ biến môi trường.
  4. Cập nhật `AuthContext.jsx` và `Login.jsx` gọi API backend thật, lưu token an toàn, xóa bỏ `DEFAULT_USER`, xóa nút tự nâng quyền trong `ProtectedRoute.jsx`.

---

### [ISSUE-02] P0: Thiếu Middleware phân quyền và kiểm tra sở hữu tài nguyên (Ownership)
- **Vị trí:** `sever/routes/*.js`, `sever/controllers/cartController.js:34`, `sever/controllers/addressControler.js:4`, `sever/controllers/orderController.js:32,198`.
- **Bằng chứng:**
  - Tất cả route `sever/routes/productRoutes.js`, `orderRoute.js`, `cartRoute.js`, `addressRoute.js` đều mở công khai không có middleware xác thực.
  - Các controller đọc `user_id` và `cart_id` từ query/body hoặc mặc định fallback: `const userId = parseInt(req.query.user_id) || 12;`.
  - `updateCartItem` và `deleteCartItem` không kiểm tra `cart_item_id` đó có thuộc giỏ hàng của user đang đăng nhập hay không.
- **Ảnh hưởng:** Khách hàng A có thể đọc/sửa/xóa giỏ hàng, địa chỉ, đơn hàng của khách hàng B (IDOR). Bất kỳ ai cũng có thể xóa hoặc sửa sản phẩm của cửa hàng.
- **Giải pháp:**
  1. Tạo `authMiddleware` giải mã JWT, gắn `req.user` (`user_id`, `role`).
  2. Tạo `requireRole('admin')` để bảo vệ các endpoint quản trị: `POST/PUT/DELETE /products`, `GET /order/all`, `PUT /order/:id`, `GET /order/dashboard`.
  3. Mọi thao tác giỏ hàng, địa chỉ, tạo đơn chỉ lấy `user_id` từ `req.user.user_id`. Truy vấn giỏ hàng tự động liên kết với `user_id` tương ứng.

---

### [ISSUE-03] P0: Gian lận giá, đơn hàng không bọc Transaction và thiếu tính toàn vẹn
- **Vị trí:** `sever/controllers/orderController.js:183-250`.
- **Bằng chứng:**
  - Server lấy trực tiếp `total_amount`, `shipping_fee`, `discount_amount`, `item.price` từ `req.body`. Khách hàng có thể can thiệp payload gửi giá `1 VND`.
  - Server chạy 3 bước riêng lẻ: `INSERT INTO orders` -> `Promise.all(INSERT order_items)` -> `DELETE FROM cart_items` không dùng database transaction (`beginTransaction`, `commit`, `rollback`).
  - Không kiểm tra số lượng tồn kho (`stock`) của từng biến thể trước khi cho phép đặt hàng.
- **Ảnh hưởng:** Thất thoát tài chính nghiêm trọng do giả mạo giá tiền; đơn hàng mồ côi nếu lỗi xảy ra giữa chừng; bán vượt tồn kho (oversell).
- **Giải pháp:**
  1. Đọc lại giá gốc và tồn kho của từng `variant_id` từ database tại thời điểm đặt hàng.
  2. Tính toán lại toàn bộ `total_amount`, kiểm tra điều kiện mã khuyến mãi (`promotions`) trên server, tính phí vận chuyển theo chính sách.
  3. Bọc toàn bộ quy trình trong database transaction có connection riêng từ Connection Pool.
  4. Trừ/giữ tồn kho ngay khi đặt hàng thành công hoặc áp dụng cơ chế khóa nhất quán. Rollback hoàn toàn nếu có bất kỳ lỗi nào.

---

### [ISSUE-04] P1: Cập nhật trạng thái đơn hàng tùy ý và trừ kho lặp vô tận
- **Vị trí:** `sever/controllers/orderController.js:253-278`.
- **Bằng chứng:**
  - `updateOrderStatus` cho phép cập nhật trạng thái bất kỳ mà không kiểm tra trạng thái hiện tại.
  - Khi `status === 'completed'`, câu lệnh `UPDATE product_variants ... SET pv.stock = GREATEST(0, pv.stock - oi.quantity)` được chạy. Nếu gửi `completed` 2 lần, tồn kho bị trừ 2 lần!
  - Sử dụng `GREATEST(0, ...)` che giấu lỗi âm kho.
  - Endpoint `PUT /order/:id` không yêu cầu quyền admin; khách hàng có thể gọi trực tiếp để đổi trạng thái đơn sang bất kỳ giá trị nào.
- **Ảnh hưởng:** Sai lệch số liệu tồn kho nghiêm trọng; khách hàng có thể can thiệp trạng thái đơn hàng.
- **Giải pháp:**
  1. Phân quyền: Chỉ admin được đổi trạng thái đơn hàng (trừ trường hợp khách hàng hủy đơn khi đơn còn ở trạng thái `pending`).
  2. Xây dựng ma trận chuyển đổi trạng thái hợp lệ: `pending -> confirmed -> shipping -> completed`, `pending -> cancelled`.
  3. Quản lý kho theo cơ chế chuẩn: Trừ kho khi đặt hàng thành công (hoặc khi xác nhận), hoàn kho khi đơn bị hủy (`cancelled`). Không trừ kho lặp lại khi đơn đã ở trạng thái đích.

---

### [ISSUE-05] P1: Lỗi xóa ảnh không ràng buộc sản phẩm và xóa file trước commit DB
- **Vị trí:** `sever/controllers/productByPageController.js:636-646`.
- **Bằng chứng:**
  - Truy vấn xóa: `SELECT image_id, image_url FROM product_images WHERE image_id IN (${placeholders})` không có điều kiện `AND product_id = ?`.
  - `fs.unlinkSync(filePath)` được gọi TRƯỚC `await commit()`. Nếu commit thất bại và rollback DB, file ảnh vật lý trên đĩa đã bị xóa vĩnh viễn không thể phục hồi.
- **Ảnh hưởng:** Xóa nhầm hình ảnh của sản phẩm khác nếu gửi danh sách ID không thuộc sản phẩm đang sửa; mất dữ liệu file khi gặp lỗi DB.
- **Giải pháp:**
  1. Thêm ràng buộc `AND product_id = ?` cho cả câu lệnh SELECT và DELETE ảnh.
  2. Chỉ thực hiện xóa file vật lý trên đĩa sau khi `await commit()` thành công (post-commit cleanup).

---

### [ISSUE-06] P1: Lỗi lọc, tìm kiếm và định dạng trả về của API sản phẩm
- **Vị trí:** `sever/controllers/productByPageController.js:328-360, 392`.
- **Bằng chứng:**
  - Khi có cả `category` và `search`, câu lệnh `countSql` chỉ lọc theo `category` trong subcategories mà bỏ qua điều kiện `AND p.name LIKE ?`.
  - Khi không tìm thấy sản phẩm trên trang (`products.length === 0`), controller trả về mảng rỗng `[]` (dòng 392) thay vì object phân trang `{ currentPage, totalPages, totalProducts, limit, products: [] }`.
  - Ở phía frontend `ProductsList.jsx:63-78`, việc sort và lọc theo khoảng giá (`priceRange`) chỉ được thực hiện trên 12 sản phẩm của trang hiện tại, trong khi tổng số sản phẩm hiển thị là của toàn bộ database.
- **Ảnh hưởng:** Frontend bị lỗi hiển thị khi trang rỗng; số lượng trang phân trang không khớp với số sản phẩm tìm thấy; bộ lọc giá và sắp xếp hoạt động sai lệch.
- **Giải pháp:**
  1. Đồng bộ câu truy vấn đếm (`COUNT(*)`) và truy vấn lấy dữ liệu (`SELECT`) áp dụng chung đầy đủ các điều kiện `category`, `search`, `price_min`, `price_max`.
  2. Đưa logic sắp xếp (`sort`) và lọc khoảng giá vào query database.
  3. Chuẩn hóa contract trả về: luôn trả về object `{ currentPage, totalPages, totalProducts, limit, products }`.

---

### [ISSUE-07] P1: Lỗi bảo mật và kết nối Database dùng chung
- **Vị trí:** `sever/demo_db_connection.js:3-16`, `.env`, `.gitignore`.
- **Bằng chứng:**
  - `demo_db_connection.js` chứa thông tin DB kết nối trực tiếp, sử dụng `mysql.createConnection` (kết nối đơn lẻ, không hỗ trợ quản lý pool khi có nhiều request đồng thời).
  - Wrapper transaction trong `productByPageController.js:32-38` giả lập release bằng hàm no-op; các transaction từ các request khác nhau sẽ chạy chồng chéo trên cùng 1 kết nối.
  - `.gitignore` không khai báo `.env`.
- **Ảnh hưởng:** Lỗi runtime nghiêm trọng khi có nhiều kết nối đồng thời; rò rỉ thông tin đăng nhập database.
- **Giải pháp:**
  1. Chuyển sang sử dụng Connection Pool với biến môi trường `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
  2. Cung cấp hàm lấy connection riêng biệt từ pool cho mỗi transaction: `const conn = await pool.getConnection()`.
  3. Bổ sung `.env` vào `.gitignore` và tạo `.env.example` chuẩn cho dự án.

---

### [ISSUE-08] P1: Lộ đơn hàng và Fallback sai tại trang OrderSuccess
- **Vị trí:** `src/pages/OrderSuccess.jsx:16-24`.
- **Bằng chứng:**
  - Khi không tìm thấy đơn hàng với `id` được yêu cầu, code fallback: `setOrder(found || res.data[0])`.
  - Gọi API lấy tất cả đơn của user (`/order`) rồi tìm thủ công trên frontend thay vì gọi API lấy chi tiết 1 đơn hàng theo ID.
- **Ảnh hưởng:** Hiển thị sai đơn hàng của người khác khi khách hàng nhập URL không hợp lệ; vi phạm tính riêng tư dữ liệu.
- **Giải pháp:**
  1. Tạo API backend `GET /order/:id` có kiểm tra ownership (chỉ chủ đơn hàng hoặc admin mới xem được).
  2. Nếu không tìm thấy hoặc không có quyền, trả về lỗi 404/403 rõ ràng trên UI, không tự ý fallback sang đơn hàng khác.

---

### [ISSUE-09] P2: Trang Contact chỉ hiển thị Toast giả lập
- **Vị trí:** `src/pages/Contact.jsx:8-12`.
- **Bằng chứng:** Hàm `handleSubmit` chỉ gọi `showToast` thành công và reset form, không gửi dữ liệu về backend.
- **Ảnh hưởng:** Khách hàng tưởng đã gửi yêu cầu thành công nhưng cửa hàng không hề nhận được thông tin.
- **Giải pháp:**
  1. Tạo bảng `contact_messages` và API `POST /contact` ở backend có validate thông tin (tên, số điện thoại, nội dung).
  2. Frontend gọi API thực sự và chỉ hiển thị thông báo thành công khi backend xác nhận đã lưu.

---

### [ISSUE-10] P2: Trạng thái thanh toán VNPay thiếu trung thực
- **Vị trí:** `src/pages/Checkout.jsx:157-159`.
- **Bằng chứng:** Chọn VNPay chỉ hiện toast thông báo đang tích hợp, nhưng trong UI vẫn cho phép chọn.
- **Ảnh hưởng:** Trải nghiệm người dùng không rõ ràng.
- **Giải pháp:**
  - Hiển thị badge "(Đang thử nghiệm / Bảo trì)" tại phương thức VNPay và vô hiệu hóa nút chọn khi chưa có cấu hình sandbox thực tế; mặc định chọn COD và giải thích trung thực.

---

### [ISSUE-11] P2: Khai báo sai Dependencies giữa Frontend và Backend
- **Vị trí:** `package.json:17,23`, `sever/package.json`.
- **Bằng chứng:** `multer` và `sharp` được khai báo ở root `package.json` (frontend) thay vì `sever/package.json`. `sever/package.json` thiếu các script `start`, `dev`.
- **Ảnh hưởng:** Khi triển khai độc lập backend trên máy chủ khác sẽ gặp lỗi `Cannot find module 'multer'/'sharp'`.
- **Giải pháp:**
  1. Khai báo đầy đủ `multer`, `sharp` và các package cần thiết trong `sever/package.json`.
  2. Bổ sung script chạy backend: `npm run dev:server`, `npm run dev:all`.

---

### [ISSUE-12] P3: Bundle Size Frontend vượt ngưỡng 500 kB
- **Vị trí:** `vite.config.js`, `src/App.jsx`.
- **Bằng chứng:** Build cảnh báo `dist/assets/index-bguZLCZs.js 578.39 kB │ gzip: 181.18 kB`. Tất cả các trang admin, biểu đồ Chart.js đều bị gom vào một bundle duy nhất.
- **Ảnh hưởng:** Làm chậm thời gian tải trang ban đầu của khách hàng.
- **Giải pháp:** Áp dụng `React.lazy` và `Suspense` cho các route client và admin, kết hợp cấu hình `manualChunks` trong `vite.config.js` để tách vendor (chart.js, bootstrap, v.v.).
