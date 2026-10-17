# Kết quả kiểm tra lại sau chỉnh sửa

Ngày kiểm tra: 17/10/2026.

**Kết luận: chưa hoàn thiện hoàn toàn, chưa đủ điều kiện nghiệm thu production.** Có những sửa đổi thực chất, nhưng vẫn còn lỗi chức năng quản trị và lỗi toàn vẹn đơn hàng/tồn kho. Nội dung “100% hoàn thành” trong `PROJECT_COMPLETION_STATUS.md` và một số kết luận trong `VERIFICATION.md` vượt quá bằng chứng hiện có.

Lượt này chỉ kiểm tra và tạo báo cáo; không sửa mã nguồn nghiệp vụ, không thay đổi dữ liệu MySQL, không cài lại dependencies hoặc khởi động lại dịch vụ đang chạy. Lệnh build tạo lại `dist/`.

## 1. Kiểm tra đã thực hiện

| Kiểm tra | Kết quả thực tế | Giới hạn |
| --- | --- | --- |
| `npm run lint` tại thư mục gốc | Exit 0, không có lỗi/cảnh báo được in | Cấu hình mới đã có phạm vi backend. Lint không chứng minh nghiệp vụ đúng. |
| `npm test` | Exit 0, 14/14 test pass | Một số test dùng logic tự viết trong test, không gọi controller. Không có kiểm chứng transaction/concurrency MySQL hoặc E2E trong bộ này. |
| `npm run build` | Exit 0 khi chạy ngoài sandbox; 142 modules; không cảnh báo chunk >500 kB | Lần đầu trong sandbox bị EPERM realpath `index.html`. Đây là hạn chế môi trường, không được tính là lỗi ứng dụng. |
| Backend đang chạy: `GET /health` | HTTP 200, `status: ok` | Health này không tự kiểm tra DB. |
| Backend đang chạy: `GET /order/all` với token admin tổng hợp hợp lệ | HTTP 400, `Mã đơn hàng không hợp lệ` | Request chỉ đọc, không sử dụng thông tin tài khoản thật; controller dừng ở validation ID. |
| Backend đang chạy: `GET /order/dashboard` với token admin tổng hợp hợp lệ | HTTP 400, `Mã đơn hàng không hợp lệ` | Cùng lỗi thứ tự route. |
| MySQL theo `.env`, truy vấn chỉ đọc | Kết nối được, MySQL 8.0.46; có `ONLY_FULL_GROUP_BY`, `STRICT_TRANS_TABLES` | Chỉ đọc VERSION/sql_mode và metadata cột của orders/order_items/product_variants. Không thực hiện đặt/hủy đơn trên DB thật. |
| Probe controller/router thực tế bằng Node VM | Tái hiện được lỗi ở mục 2 | DB được thay bằng adapter trong bộ nhớ; không được coi là test tích hợp MySQL. |
| Manifest và lockfile backend | Thiếu dotenv/multer/sharp trong danh sách dependency gốc của `sever/package-lock.json` so với manifest | Chưa thử cài sạch. `require('dotenv')` thực tế trả MODULE_NOT_FOUND trong môi trường hiện tại. |

Frontend tại cổng localhost 5173 chưa nhận kết nối tại thời điểm kiểm tra. Các cổng 3030, 3306, 3308 nhận kết nối. Chỉ dùng kết nối DB theo `.env` để đọc metadata. Chưa kiểm thử trình duyệt, responsive, checkout E2E, sandbox thanh toán hoặc triển khai production.

## 2. Các lỗi cần xử lý trước nghiệm thu

### R01 — P1: Hai API quản trị bị route động bắt trước

- Vị trí: `sever/routes/orderRoute.js:9`, `:13`, `:14`; `sever/controllers/orderController.js:93`.
- `GET /:id` được đăng ký trước `/all` và `/dashboard`. Express đưa `all`/`dashboard` vào `req.params.id`, rồi controller trả 400 vì không phải số.
- Đã xác nhận cả bằng dispatch router cô lập lẫn HTTP đến backend đang chạy.
- Ảnh hưởng: danh sách đơn hàng admin và dashboard không tải đúng.
- Cần đưa route tĩnh lên trước route động; kiểm thử request đầy đủ qua router cho customer/admin, bao gồm 401/403 và response nghiệp vụ đúng.

### R02 — P1: Lặp cùng variant trong payload có thể làm âm tồn kho

- Vị trí: `sever/controllers/orderController.js:355` đến `:390`, `:454` đến `:465`.
- Tất cả dòng hàng được kiểm tra stock trước, sau đó mới trừ stock. Hai dòng có cùng variant cùng nhìn thấy stock ban đầu. Row lock không giải quyết việc kiểm tra hai lần cùng dòng trong một transaction.
- Probe gọi chính `addOrder`, với adapter DB trong bộ nhớ: stock ban đầu 5; items gồm variant 1/quantity 4 và variant 1/quantity 4; nhận HTTP 201 và stock cuối -3.
- Schema trong `database/schema.sql` khai báo stock INT nhưng chưa có CHECK không âm.
- Cần gộp quantity theo variant hoặc từ chối variant trùng; xác thực tổng quantity; dùng cập nhật có điều kiện stock và kiểm tra affectedRows. Bổ sung test tích hợp MySQL cho payload trùng và nhiều request cạnh tranh.

### R03 — P1: Retry đặt hàng tạo thêm đơn và tiếp tục trừ kho

- Vị trí: `sever/controllers/orderController.js:304` đến `:501`; `database/schema.sql:152`.
- Endpoint nhận `items` trực tiếp, không có idempotency key/kết quả request đã xử lý hoặc ràng buộc tương đương. Xóa giỏ không ngăn request lặp vì lần sau vẫn lấy items từ body.
- Probe gọi `addOrder` hai lần với cùng payload hợp lệ: hai response 201, tạo hai đơn; stock 20 xuống 18.
- Cần khóa chống lặp theo user và thao tác checkout, được bảo vệ ở DB; xác minh cả retry sau timeout và hai request đồng thời. Disable nút giao diện chưa đủ.

### R04 — P1: Controller chưa thi hành ma trận chuyển trạng thái được test mô tả

- Vị trí: `sever/controllers/orderController.js:556` đến `:564`, `:580` đến `:588`.
- Với admin, code chỉ chặn khi trạng thái hiện tại đã completed/cancelled. Các trạng thái còn lại vẫn cho nhảy tùy ý trong enum, ví dụ pending → completed, shipping → pending.
- Probe gọi controller thật với admin và đơn pending: yêu cầu completed được HTTP 200, cập nhật completed và logic đánh dấu paid.
- Trong khi đó, test riêng ở `sever/tests/auth_order_test.js:166` lại khẳng định pending → completed bị chặn. Test này không gọi controller nên không phát hiện khác biệt.
- Cần một định nghĩa chuyển trạng thái được code thực và test sử dụng, bao gồm quyền hủy và quy tắc thanh toán theo phương thức.

### R05 — P1: Tổng tiền checkout hiển thị không khớp số tiền server tạo đơn

- Vị trí: `src/pages/Checkout.jsx:37`, `:109`, `:342`; `sever/controllers/orderController.js:410`, `:425`, `:430`.
- Frontend luôn tính ship 30.000đ; backend miễn ship khi subtotal từ 2.000.000đ. Ví dụ không voucher, subtotal 2.000.000đ: UI 2.030.000đ, backend 2.000.000đ.
- UI cũng chưa đối chiếu đầy đủ hiệu lực/đơn tối thiểu và chặn discount cố định vượt subtotal như backend. Backend có thể âm thầm bỏ voucher nhưng vẫn tạo đơn.
- Cần server quote/preview hoặc contract giá nhất quán để người mua xác nhận đúng số tiền và voucher trước đặt hàng. Không chỉ sửa con số ship tại UI rồi bỏ qua các điều kiện còn lại.

### R06 — P1 có điều kiện triển khai: Vẫn tồn tại đường cấu hình xác thực không an toàn

- Vị trí: `sever/utils/authHelper.js:10`, `:49`; `src/pages/Login.jsx:79`.
- Khi thiếu JWT_SECRET, code dùng secret cố định trong source, không fail startup. Chưa khẳng định môi trường đang chạy sử dụng fallback này.
- `verifyPassword` vẫn chấp nhận password lưu plaintext. Probe dùng cặp chuỗi tổng hợp giống nhau xác nhận hàm trả true.
- UI vẫn cung cấp điền tài khoản mẫu cả admin; không thấy giới hạn theo chế độ development. Nếu seed tài khoản mẫu được đưa lên production thì đây là rủi ro truy cập thực tế.
- Cần bắt buộc secret cấu hình hợp lệ, bỏ plaintext fallback hoặc có migration cụ thể, và tách seed/tiện ích đăng nhập demo khỏi production. Không coi việc đổi UI đăng nhập là nghiệm thu toàn bộ bảo mật.

### R07 — P2: Chưa áp dụng phạm vi danh mục của khuyến mãi

- Vị trí: `sever/controllers/orderController.js:396` đến `:423`; `sever/controllers/promotionController.js:16`; `database/schema.sql:140`.
- Schema và API promotion có promotion_categories, nhưng addOrder không đọc/ràng buộc phạm vi này mà tính giảm theo tổng đơn.
- Nếu mã được giới hạn category, sản phẩm ngoài category vẫn có thể được tính giảm. Cần định nghĩa giảm trên dòng đủ điều kiện và kiểm thử giỏ có nhiều category.

### R08 — P2: Thống kê doanh thu theo năm bị sai do ưu tiên AND/OR

- Vị trí: `sever/controllers/orderController.js:622`, `:637`.
- `WHERE status = 'completed' OR payment_status = 'paid' AND YEAR(created_at) = ?` tương đương `completed OR (paid AND year)`. Các đơn completed năm khác vẫn được cộng vào tháng của năm đang xem.
- Cần ngoặc đúng theo định nghĩa doanh thu; test dữ liệu completed thuộc hai năm. Đồng thời rà quy tắc loại trừ hủy/hoàn khi dùng payment_status.

### R09 — P2: Nút hoàn tiền không có contract backend tương ứng

- Vị trí: `src/pages/OrderManagement.jsx:279` đến `:281`; `sever/controllers/orderController.js:516`; `database/schema.sql:163`.
- UI gửi status refunded cho đơn completed, trong khi enum/validation backend không có refunded và logic không cho đổi completed. Nút hiện tại luôn bị từ chối.
- Cần quyết định phạm vi hoàn tiền: triển khai luồng/quyền/trạng thái thanh toán đúng, hoặc ẩn chức năng chưa hỗ trợ. Không chỉ thêm enum để làm request qua.

### R10 — P2: CartContext không đồng bộ theo đăng nhập/đăng xuất

- Vị trí: `src/context/CartContext.jsx:10` đến `:26`; `src/context/AuthContext.jsx:61`, `:85`.
- Provider không đọc auth và fetchCart có dependency rỗng; effect chỉ chạy lúc mount. Không có reset khi logout hoặc fetch lại theo user sau login.
- Trong cùng phiên SPA, giỏ có thể còn hiển thị dữ liệu tài khoản trước hoặc vẫn rỗng sau đăng nhập cho tới khi một luồng khác chủ động refresh. Đây là vấn đề state UI; chưa có bằng chứng API ownership bị bypass.
- Cần reset/refetch theo auth và bỏ response cũ khi user đổi trong lúc request đang chạy.

### R11 — P2: Bộ test không chứng minh các tuyên bố về nghiệp vụ và bảo mật API

- Vị trí: `sever/tests/auth_order_test.js:103`, `:122`, `:166`; `docs/VERIFICATION.md:18`; `docs/PROJECT_COMPLETION_STATUS.md:90`.
- Regex, hàm tính tiền và ma trận trạng thái được khai báo riêng trong test, không import logic production. Hàm tính voucher trong test còn dùng discount_type='percentage' và min_order_value, trong khi controller dùng 'percent' và min_order_amount.
- Bộ test không gọi Express API, không mở MySQL và không test ownership/transaction/oversell/idempotency. Các probe của lượt rà soát này tái hiện lỗi dù toàn bộ 14 test vẫn xanh.
- Cần regression test đi qua code thực, test API và test MySQL độc lập. Gọi chúng là “unit & integration tests” hiện không chính xác.

### R12 — P2: Cài đặt backend chưa được đồng bộ và xác minh

- Vị trí: `sever/package.json`, `sever/package-lock.json:6`; `sever/sever.js:6`; `sever/demo_db_connection.js:6`.
- Manifest thêm dotenv/multer/sharp nhưng lockfile backend chưa có các dependency này trong mục package gốc. Không được kết luận cài sạch tái lập được khi chưa đồng bộ và thử.
- `require('dotenv')` hiện MODULE_NOT_FOUND; code bắt lỗi và bỏ qua. Lệnh gốc dev:server dùng Node --env-file nên có thể vẫn chạy, nhưng `npm start` trong sever có thể bỏ qua cấu hình .env và dùng fallback nếu môi trường chưa export biến.
- Cần đồng bộ manifest/lockfile, kiểm tra cách load env nhất quán và thử cài/chạy từ môi trường sạch.

### R13 — P2: Snapshot lịch sử đơn mới hoàn thiện phần giá

- Vị trí: `database/schema.sql:152`, `:176`; `sever/controllers/orderController.js:16`, `:52`.
- Đã lưu oi.price đúng thời điểm mua. Tuy nhiên tên/màu/size sản phẩm và địa chỉ vẫn lấy bằng join tới bản ghi hiện tại; chưa thấy cột snapshot cho các thông tin này.
- Đổi thông tin sản phẩm hoặc sửa địa chỉ trong DB có thể làm thay đổi lịch sử hiển thị; việc xóa variant đã bán bị FK RESTRICT ngăn, cần xử lý có chủ đích trong UI/API.
- Cần xác định dữ liệu đơn bất biến và cách ngừng bán/ẩn sản phẩm đã có lịch sử, thay vì chỉ dựa trên hard delete.

### R14 — P2: Báo cáo hoàn thiện và số liệu hiệu năng đang kết luận quá mức

- Vị trí: `docs/PROJECT_COMPLETION_STATUS.md:5`; `docs/VERIFICATION.md:30` và phần kết luận.
- Main chunk 206,71 kB là đúng ở lần build lại, nhưng HTML còn preload vendor-react 429,18 kB. Không thể lấy mức giảm main chunk làm mức giảm toàn bộ JavaScript tải ban đầu.
- Gzip hai tệp này cộng lại khoảng 170,64 kB; baseline JS gzip cũ 181,18 kB. Đây chỉ là so sánh đầu ra build của các tệp được tham chiếu, chưa phải đo network, thời gian tải, Lighthouse hoặc cache thực tế.
- Không cảnh báo chunk không đồng nghĩa “đạt chuẩn hiệu năng cao”. Tuyên bố “100% hoàn thành”, “triệt để” và “sẵn sàng production” cần được sửa theo bằng chứng và lỗi còn mở.

## 3. Bằng chứng từ probe cô lập

Probe đọc chính file router/controller/helper bằng Node VM. Router dùng Express thật, handler được thay bằng nhãn để quan sát dispatch. Với controller, chỉ thay require kết nối DB bằng adapter trong bộ nhớ; giữ nguyên logic addOrder/updateOrderStatus. Không thực thi ghi dữ liệu MySQL.

```text
actual_router_dispatch /all       -> getOrderById, id=all
actual_router_dispatch /dashboard -> getOrderById, id=dashboard
actual_router_dispatch /123       -> getOrderById, id=123

actual_controller_duplicate_variant
initialStock=5, quantities=[4,4], status=201, remainingStock=-3

actual_controller_identical_retry
responses=[201,201], ordersCreated=2, remainingStock=18 (initial=20)

actual_controller_pending_to_completed
status=200, newStatus=completed

actual_helper_accepts_plaintext
accepted=true (synthetic values only)
```

Các kết quả stock/retry/state là bằng chứng lỗi trong logic controller, không phải chứng nhận hành vi khóa/rollback trên MySQL thật. Kiểm thử đồng thời và transaction trên DB test vẫn còn phải thực hiện.

## 4. Những phần đã cải thiện

- Có endpoint đăng ký/đăng nhập/me, băm scrypt, middleware xác thực và kiểm tra admin; bỏ cơ chế tự bật role trên giao diện.
- Phần lớn thao tác giỏ/địa chỉ/đơn đã suy user từ token và có điều kiện ownership trong code đã đọc.
- Tạo đơn đọc giá từ DB, sử dụng pool connection riêng, transaction và khóa dòng; tuy vậy các lỗi R02/R03/R04 vẫn chặn nghiệm thu.
- Chỉnh/xóa ảnh đã ràng buộc product_id và dọn file cũ sau commit.
- Có schema/seed, env example, tài liệu và cấu hình lint backend.
- Có chia bundle/lazy page; Contact đã gọi API và backend có thao tác lưu; OrderSuccess đã có API chi tiết theo ID.

Đây là đánh giá theo code và kiểm tra ghi ở mục 1; không mặc định mọi nhánh của các tính năng trên đã được test tích hợp. VNPay vẫn chưa được kiểm chứng như một phương thức thanh toán hoạt động đầy đủ.

## 5. Thứ tự xử lý và điều kiện kiểm tra lại

1. Sửa R01 để danh sách đơn/dashboard hoạt động; test HTTP qua router thật.
2. Sửa R02/R03/R04, validation quantity và quy tắc thanh toán; regression test gọi controller và test MySQL test cho rollback/concurrency/idempotency.
3. Đồng bộ checkout với server quote, điều kiện voucher, hoàn tiền theo phạm vi đã chốt, cart theo auth và thống kê năm.
4. Bắt buộc cấu hình xác thực an toàn; tách demo khỏi production; đồng bộ dependencies/lockfile và cách load env.
5. Hoàn thiện kiểm thử E2E đa tài khoản: login → thêm giỏ → địa chỉ → COD → đúng đơn → lịch sử → admin xử lý; thử lỗi và quyền trái phép.
6. Chỉnh báo cáo nghiệm thu để liệt kê pass/fail/chưa chạy, sau đó mới đánh giá phát hành. Không gán tỷ lệ hoàn thiện chủ quan.

| Mức sẵn sàng | Kết luận tại thời điểm kiểm tra |
| --- | --- |
| Build frontend và kiểm tra tĩnh | Đạt các lệnh đã chạy. |
| Demo local có backend/DB | Backend/DB đang chạy; hai API quản trị đang lỗi; chưa nghiệm thu trọn luồng. |
| Hoàn thiện mọi chức năng đã công bố | Chưa đạt. |
| Phát hành production | Chưa đạt; cần xử lý lỗi P1 và bổ sung bằng chứng tích hợp/E2E. |
