# Prompt kiểm tra và hoàn thiện dự án Núi Xanh Badminton

Ngày rà soát sơ bộ: 17/10/2026. Thư mục: `D:\source_code\react_js_pro`.

## Kết quả kiểm tra ban đầu

Đã xem cấu trúc thư mục, manifest, cấu hình, routing, context, các phần xác thực, API giỏ hàng, địa chỉ, sản phẩm, đơn hàng và một số luồng giao diện chính. Đây là rà soát tĩnh và kiểm tra lệnh cơ bản, chưa phải nghiệm thu toàn bộ hệ thống.

| Nội dung | Kết quả và bằng chứng |
| --- | --- |
| Công nghệ | React 19, Vite 7, React Router 7, Bootstrap 5; backend Express 5, MySQL, CommonJS trong `sever/`. |
| Lint | `npm run lint` thành công. `eslint.config.js` bỏ qua `sever/**`, vì vậy chưa đánh giá chất lượng backend bằng lint. |
| Build frontend | `npm run build` thành công khi chạy lại ngoài sandbox. Lần đầu gặp `EPERM` khi realpath `index.html`; không coi lỗi môi trường này là lỗi code. Gói JS chính 578,39 kB, gzip 181,18 kB; Vite cảnh báo chunk trên 500 kB. |
| Cú pháp backend | `node --check` thành công với 14 file JavaScript thuộc entrypoint, kết nối DB, controllers và routes. Chưa xác nhận backend khởi động, truy vấn DB hay nghiệp vụ chạy đúng. |
| Xác thực | `src/pages/Login.jsx:14` chỉ kiểm tra email/mật khẩu không rỗng rồi tạo user cục bộ; quyền admin dựa trên email chứa `admin`. `src/context/AuthContext.jsx:5` có user admin mặc định, lưu user vào localStorage và cung cấp `switchRole`. `src/components/admin/ProtectedRoute.jsx:27` có nút tự bật quyền admin. |
| Phân quyền API | Các router được kiểm tra không có middleware xác thực/phân quyền. `sever/controllers/cartController.js:34`, `addressControler.js:4`, `orderController.js:32` lấy ID từ request hoặc dùng mặc định. Cần kiểm thử độc lập giữa nhiều tài khoản. |
| Tạo đơn | `sever/controllers/orderController.js:183` nhận tổng tiền, phí vận chuyển, giảm giá và giá từng dòng hàng từ request; chuỗi ghi order/items/xóa cart chưa được bọc transaction. |
| Tồn kho | `sever/controllers/orderController.js:253` cập nhật trạng thái tùy ý; mỗi request `completed` lại chạy trừ kho. Chưa có điều kiện chuyển trạng thái hay chặn xử lý lặp. |
| Sản phẩm/ảnh | `sever/controllers/productByPageController.js:639` truy vấn và xóa ảnh theo image ID mà chưa ràng buộc product ID trong nhánh đó. Có thao tác xóa file trước khi transaction DB commit; cần kiểm tra tính nhất quán và rollback. |
| Tìm kiếm/phân trang | Trong `getProducts`, nhánh count khi có category chưa áp dụng cùng bộ lọc search như truy vấn lấy sản phẩm; một nhánh trả mảng rỗng thay vì object phân trang. Cần tái hiện bằng fixture. |
| Tính năng chưa hoàn thiện | `src/pages/Checkout.jsx:157` mới thông báo đang tích hợp VNPay. `src/pages/Contact.jsx:8` chỉ hiện toast thành công và reset form. `src/pages/OrderSuccess.jsx:16` tải danh sách đơn và có thể lấy đơn đầu tiên khi không tìm thấy ID yêu cầu. |
| Khả năng dựng lại | Chưa thấy test, schema SQL, migration, seed, CI hoặc `.env.example` trong các tệp đã liệt kê. README vẫn là mẫu Vite. `sever/package.json` thiếu scripts và chưa khai báo `multer`, `sharp` dù backend sử dụng; hai package này đang nằm ở manifest gốc. |
| Cấu hình | `sever/demo_db_connection.js` chứa cấu hình DB trực tiếp; không sao chép giá trị vào báo cáo. `.env` tồn tại nhưng `.gitignore` chưa có quy tắc `.env` rõ ràng. `git status` báo thư mục hiện tại không phải Git repository. |

**Kết luận sơ bộ:** chưa đủ điều kiện nghiệm thu để sử dụng thực tế với nhiều người dùng. Build và lint frontend thành công không chứng minh xác thực, phân quyền, thanh toán hay tính toàn vẹn đơn hàng đã hoàn thiện. Chưa chạy E2E, truy vấn database, kiểm tra giao diện trên trình duyệt hoặc quét dependency vulnerability trong lượt rà soát này.

Các dòng tham chiếu phản ánh thời điểm rà soát; hãy xác minh lại khi code thay đổi.

## Cách dùng

Copy toàn bộ nội dung trong khối dưới đây vào một chat làm việc tại thư mục dự án. Prompt yêu cầu kiểm tra rồi triển khai sửa theo từng đợt, có bằng chứng kiểm chứng. Báo cáo sơ bộ ở trên là đầu mối để điều tra, không thay thế việc kiểm tra lại.

```text
Bạn đang làm việc trực tiếp trong dự án D:\source_code\react_js_pro.

Hãy đóng vai kỹ sư full-stack có trách nhiệm về kiến trúc, chất lượng, bảo mật và khả năng vận hành. Kiểm tra toàn bộ mã nguồn do dự án quản lý, xác định mức độ hoàn thiện thực tế, sau đó trực tiếp sửa các vấn đề thuộc phạm vi ứng dụng hiện có để dự án dễ bảo trì, có thể cài đặt lại và sử dụng trọn vẹn các luồng được công bố.

Không dừng ở nhận xét hoặc đề xuất. Sau khi lập baseline và kế hoạch, tiếp tục triển khai các sửa đổi đã xác định, chạy kiểm tra và cập nhật tài liệu. Chỉ dừng phần phụ thuộc khi thực sự thiếu dữ liệu, thông tin đăng nhập dịch vụ, quyền truy cập hoặc quyết định nghiệp vụ không thể suy ra; tiếp tục phần độc lập còn lại.

1. BỐI CẢNH VÀ PHẠM VI

- Frontend hiện tại: React 19 + Vite 7, JavaScript/JSX, React Router 7, Axios, Bootstrap 5, Chart.js.
- Backend: Express 5 + MySQL, code CommonJS trong thư mục hiện đang tên là sever/.
- Chức năng hiện có: xem/tìm kiếm/lọc sản phẩm, chọn biến thể, giỏ hàng, địa chỉ, checkout, lịch sử/chi tiết đơn, đăng nhập, liên hệ; admin quản lý sản phẩm/ảnh/biến thể, đơn hàng và dashboard.
- Đọc AGENTS.md và hướng dẫn áp dụng trong phạm vi làm việc nếu có. Kiểm tra manifest, lockfile và code để xác nhận bối cảnh thực tế.
- Lập danh sách đầy đủ route giao diện, API endpoint, module, mô hình dữ liệu suy ra và tích hợp bên ngoài. Đánh dấu rõ phần chỉ có UI, phần demo, phần có backend và phần đã kiểm thử.
- Kiểm tra toàn bộ source/config do dự án quản lý. Bỏ qua nội dung vendor, node_modules, dist, build và binary; vẫn kiểm tra manifest/lockfile, cách phục vụ và tham chiếu asset.
- Không tự mở rộng sang chức năng kinh doanh chưa có yêu cầu như đa cửa hàng, ERP, đăng nhập mạng xã hội. Với thiếu sót ngoài phạm vi hiện có, ghi nhận đề xuất riêng.

2. NGUYÊN TẮC THỰC HIỆN

- Giữ UI tiếng Việt, nhận diện, dữ liệu và hành vi đúng đang có. Chỉ đổi luồng khi cần sửa lỗi, bảo mật hoặc làm đúng chức năng đã công bố.
- Ưu tiên thay đổi nhỏ có thể kiểm chứng. Không viết lại toàn bộ ứng dụng hoặc đổi framework, ORM, state library, module system, TypeScript chỉ để đồng bộ hình thức.
- Chọn cấu trúc tương xứng quy mô; giải thích việc thêm dependency hoặc tầng kiến trúc bằng vấn đề cụ thể được giải quyết.
- Không sửa code người dùng đang làm dở, xóa dữ liệu, reset Git hay tạo lại database hiện hữu. Nếu không có Git, tạo bản sao các file sắp sửa ở vị trí phù hợp; không tự khởi tạo Git, commit hoặc push.
- Không in nội dung .env, password, secret, token hoặc dữ liệu cá nhân. Dùng placeholder trong báo cáo và file mẫu.
- Chỉ chạy migration/seed/test ghi dữ liệu trên database local/test đã xác nhận được phép và tách khỏi dữ liệu thật. Chưa rõ môi trường thì chuẩn bị migration/test và báo phần chưa chạy; không thử vào DB có sẵn.
- Không tự gửi email/tin nhắn ra ngoài, triển khai public, tạo thanh toán thật hoặc gọi dịch vụ có phí. Có thể triển khai mã và mô phỏng hợp đồng tích hợp để kiểm tra cục bộ; nêu rõ giới hạn bằng chứng.
- Phân biệt lỗi code với lỗi quyền truy cập, mạng, runtime và dịch vụ thiếu. Không sửa cấu hình chỉ để che lỗi môi trường.
- Không dùng dữ liệu giả, toast thành công, try/catch nuốt lỗi hay fallback sang bản ghi khác để khiến chức năng trông như đã chạy đúng.
- Không tắt rule lint, bỏ test, nới điều kiện bảo mật hoặc tăng ngưỡng cảnh báo chỉ để làm báo cáo xanh.
- Mọi phát hiện phải gắn file/dòng, hành vi thực tế hoặc suy luận có căn cứ, ảnh hưởng, hướng sửa và cách xác minh. Không bịa kết quả chạy lệnh.

3. GIAI ĐOẠN A — KHẢO SÁT VÀ BASELINE

- Liệt kê cây thư mục có ý nghĩa, entrypoint và luồng frontend → API → controller → DB/file.
- Đọc toàn bộ scripts ở cả hai manifest, cấu hình Vite/proxy, ESLint, ignore, biến môi trường dưới dạng tên biến, cách chạy backend và phục vụ ảnh.
- Ghi phiên bản Node/npm thực tế; suy ra yêu cầu tương thích từ manifest/lockfile. Không tự nâng đồng loạt dependency lên latest.
- Chạy các lệnh kiểm tra hiện có phù hợp: lint, build và test nếu có. Ghi chính xác command, thư mục chạy, exit code và tóm tắt kết quả. Script chưa tồn tại phải ghi là thiếu.
- Kiểm tra khởi động backend/frontend và kết nối DB khi môi trường local/test đã được xác nhận; tránh import entrypoint có side effect vào test không kiểm soát.
- Lập ma trận chức năng với các cột: chức năng, route UI, API, bảng liên quan, trạng thái triển khai, kiểm thử đã chạy, thiếu sót, mức ưu tiên.
- Lập sổ vấn đề: ID, mức P0/P1/P2/P3, vị trí, bằng chứng, cách tái hiện, ảnh hưởng, giải pháp, phụ thuộc, tiêu chí chấp nhận.
- Dùng P0 cho vấn đề cần chặn phát hành ngay; P1 cho lỗi nghiêm trọng về quyền, dữ liệu hoặc luồng chính; P2 cho chức năng/khả năng bảo trì/hiệu năng cần sửa; P3 cho cải tiến nhỏ. Giải thích mức độ theo ảnh hưởng cụ thể.
- Ghi rõ module nào đã đọc, API nào đã chạy và phần nào chưa có bằng chứng thực thi; không đồng nhất rà soát tĩnh với test tích hợp.

4. GIAI ĐOẠN B — KIỂM TRA TOÀN DIỆN

4.1. Cấu trúc và khả năng bảo trì

- Kiểm tra trách nhiệm của page, component, context, API client, route, controller, logic nghiệp vụ và truy vấn DB.
- Tách các phần đang trộn UI/nghiệp vụ/truy vấn khi việc tách giúp kiểm thử hoặc tái sử dụng thực tế; tránh tạo lớp trung gian không có trách nhiệm rõ ràng.
- Rà code trùng lặp, dead code, comment code cũ, tên sai, import vòng, file quá nhiều trách nhiệm, hardcode ID/URL/status/phí vận chuyển và định dạng tiền/ngày trùng lặp.
- Chuẩn hóa tên như sever/server hoặc addressControler chỉ khi có lợi rõ ràng. Nếu đổi tên, cập nhật toàn bộ import, scripts, proxy, static URL, tài liệu và khả năng tương thích dữ liệu cũ.
- Không đặt mục tiêu số dòng/file máy móc. Tạo module dựa trên ranh giới trách nhiệm.
- Xác định nguồn dữ liệu chung cho auth/cart; tránh state khác nhau giữa header, giỏ hàng, checkout và sau logout/đổi tài khoản.

4.2. Xác thực, phân quyền và tách dữ liệu người dùng

- Xác minh đặc biệt src/pages/Login.jsx, src/context/AuthContext.jsx và src/components/admin/ProtectedRoute.jsx: bỏ admin mặc định, quick login sản xuất, suy quyền từ email và chức năng tự nâng quyền.
- Tạo luồng xác thực backend thực sự phù hợp schema: kiểm tra thông tin đăng nhập, password hash an toàn, lỗi đăng nhập không tiết lộ dữ liệu, giới hạn thử đăng nhập và logout/hết hạn phiên.
- Chọn session hoặc token dựa trên kiến trúc triển khai, giải thích lựa chọn và xử lý lưu trữ, cookie, CSRF/CORS tương ứng. Không coi user/role trong localStorage là nguồn xác thực.
- Quyền thực phải do backend xác minh. Bảo vệ endpoint quản trị và kiểm tra ownership tại API đọc/sửa/xóa giỏ hàng, địa chỉ, đơn hàng.
- Loại bỏ user_id=12, cart_id=2 và việc tin ID người dùng được truyền từ client. Backend suy user từ phiên hợp lệ và xác định giỏ hàng thuộc user.
- Nếu hỗ trợ guest cart, thiết kế nhận diện riêng rõ ràng và quy tắc hợp nhất khi đăng nhập; không sử dụng giỏ mặc định chung.
- Test ít nhất: chưa đăng nhập, customer A, customer B, admin, phiên hết hạn, sửa localStorage, gọi trực tiếp API admin, thay ID tài nguyên người khác.
- Frontend guard giúp điều hướng nhưng mọi quy tắc quyền phải được kiểm chứng trực tiếp qua API.

4.3. API, validation và xử lý lỗi

- Liệt kê method/path/request/response/status code/quyền cho mọi endpoint.
- Validation phía server cho body, query, params: kiểu dữ liệu, số nguyên dương, enum, độ dài, trường bắt buộc, ID tồn tại, quantity/price/stock không hợp lệ, JSON variants sai và trường thừa nhạy cảm.
- Ràng buộc tài nguyên con thuộc tài nguyên cha: image thuộc product, variant thuộc product, address/cart/order thuộc user.
- Dùng truy vấn có tham số; rà điểm nội suy SQL, allowlist cho sort/column và bộ lọc; không kết luận SQL injection chỉ vì có template string.
- Chuẩn hóa response và lỗi để frontend xử lý nhất quán; bao gồm kết quả rỗng, 400/401/403/404/409/500 và pagination. Nếu thay contract, cập nhật đồng thời consumer và test.
- Có middleware xử lý lỗi tập trung, bao gồm lỗi upload/JSON/async; không trả stack trace, SQL hay thông tin nội bộ cho client.
- Cấu hình CORS theo môi trường, giới hạn body/upload và biện pháp bảo vệ HTTP phù hợp; tránh cấu hình chồng chéo hoặc không tương thích phiên đăng nhập.

4.4. Database và tính toàn vẹn dữ liệu

- Tìm schema/migration/seed thực tế trước khi thay đổi. Nếu thiếu schema, phân biệt phần suy ra từ SQL với phần đã xác minh từ DB được phép truy cập.
- Kiểm tra foreign key, unique constraint, nullability, chỉ mục, kiểu tiền, charset/collation, múi giờ, generated column/trigger và phiên bản MySQL cần cho WITH RECURSIVE/GROUP BY.
- Không tự giả định final_amount là cột ghi trực tiếp; xác minh có phải generated column hoặc được tính bởi trigger hay không.
- Thay cấu hình DB trực tiếp bằng env; validate cấu hình khi khởi động, không dùng giá trị mặc định nguy hiểm.
- Đánh giá connection pool và cấp connection riêng cho mỗi transaction. Không giả lập begin/commit/rollback bằng no-op để che thiếu hỗ trợ; không để transaction của các request đan xen trên một connection dùng chung.
- Chuẩn bị migration có phiên bản, seed dữ liệu tổng hợp và hướng dẫn dựng DB sạch. Với DB hiện hữu, mô tả phương án chuyển đổi, backup và khôi phục; không thực thi khi chưa được phép.
- Kiểm tra tác động khi xóa sản phẩm/biến thể đã xuất hiện trong đơn. Giữ lịch sử đơn bằng snapshot hoặc cơ chế thích hợp, không làm mất dữ liệu đã bán.
- Kiểm tra N+1, truy vấn lặp, bộ lọc count/list không khớp, category tree trùng/lặp và SQL mode. Tối ưu theo bằng chứng; không thêm index hoặc cache không có mục tiêu.

4.5. Giỏ hàng, checkout, tiền và đơn hàng

- Trace toàn bộ luồng chọn variant → thêm giỏ → tăng/giảm/xóa → chọn địa chỉ → khuyến mãi → đặt đơn → trang thành công → lịch sử → admin xử lý.
- Backend phải đọc giá/stock từ nguồn đáng tin, xác minh variant/quantity/địa chỉ và tính lại subtotal, phí vận chuyển, giảm giá, tổng thanh toán. Không tin price/total/discount/shipping do trình duyệt gửi.
- Định nghĩa rõ cách tính và làm tròn tiền VND; không cho tổng tiền âm hoặc phát sinh sai số giữa DB/backend/UI.
- Xác minh điều kiện khuyến mãi theo schema/yêu cầu: thời gian, trạng thái, phạm vi category/product, đơn tối thiểu, mức giảm tối đa, số lần dùng và ownership nếu có. Ghi rõ quy tắc nào cần xác nhận.
- Đặt đơn, ghi order items, cập nhật/giữ kho, sử dụng khuyến mãi và xử lý cart phải có tính nguyên tử trong phạm vi dữ liệu liên quan. Lỗi giữa chừng phải rollback đúng.
- Có cơ chế chống tạo đơn trùng khi double click, retry hoặc timeout, với khóa/ràng buộc bền vững phù hợp; việc disable nút chỉ là hỗ trợ UI.
- Kiểm thử đồng thời hai người mua đơn vị tồn kho cuối cùng; không oversell, âm kho hay che thiếu kho bằng GREATEST(0,...).
- Định nghĩa trạng thái và chuyển trạng thái hợp lệ, quyền của customer/admin, điều kiện hủy/hoàn. Tách trạng thái giao hàng và thanh toán nếu cần cho tính đúng.
- Việc gửi completed lặp lại không được trừ kho nhiều lần. Quy tắc giữ/trừ/hoàn kho cần nhất quán, có test cho retry và request cạnh tranh.
- Lưu giá và thông tin cần thiết tại thời điểm mua; giá/tên/địa chỉ hiển thị lịch sử không được thay đổi tùy tiện khi dữ liệu hiện tại được sửa.
- OrderSuccess phải tải đúng order_id được yêu cầu, xác minh ownership, hiển thị lỗi/not found đúng và không fallback sang đơn khác.
- Dashboard phải có định nghĩa doanh thu rõ ràng, khớp trạng thái/tiền thực tế, xử lý giảm giá/hủy/hoàn theo quy tắc đã chọn.

4.6. Sản phẩm, ảnh và cache

- Kiểm tra create/update/delete sản phẩm nhiều biến thể, ảnh chính, ảnh xóa/ảnh mới, giá/stock và xử lý dữ liệu không tồn tại.
- Rà riêng updateProduct: deleteImages phải được ràng buộc product_id trong cả SELECT và DELETE, không tác động ảnh của sản phẩm khác.
- Upload dùng đường dẫn tuyệt đối dựa trên module/config, không phụ thuộc cwd. Kiểm tra tên file, số lượng/kích thước, định dạng nội dung, kích thước pixel và ảnh hỏng; dự án đã có Multer/Sharp, hãy kiểm tra và hoàn thiện thay vì mô tả như chưa có.
- File đã upload nhưng validation/DB thất bại phải được dọn. Không xóa file đang dùng trước khi DB commit nếu rollback không thể phục hồi; thiết kế cleanup sau commit hoặc cơ chế bù và xử lý cleanup lỗi.
- Việc xóa file phải bị giới hạn trong thư mục quản lý, không dựa vào path tùy ý từ request.
- Kiểm tra cache key/invalidation sau sửa sản phẩm/biến thể/stock và dữ liệu liên quan; không để cache thông tin riêng tư dùng chung giữa user.
- Kiểm tra formatImagePath, các URL /uploads, /assets, /sever/assets và VITE_SERVER_URL trong dev/production. Bảo toàn URL ảnh cũ khi đổi cấu trúc.

4.7. Frontend, UI và khả năng sử dụng

- Kiểm tra tất cả route/link/menu/form/button; route sai, refresh deep link và quyền truy cập sau logout.
- Mỗi luồng tải dữ liệu cần trạng thái loading/empty/error phù hợp và cách thử lại; không hiển thị dữ liệu cũ như kết quả hiện tại khi request mới lỗi.
- Kiểm tra useEffect dependencies, cleanup timer/event, stale response khi tìm nhanh/đổi lọc, request bị hủy và double invocation trong StrictMode.
- Sort/lọc giá/phân trang phải áp dụng lên tập dữ liệu đúng theo nhãn UI. Không chỉ sort/lọc một trang rồi hiển thị tổng như đã xử lý toàn danh mục.
- Kiểm tra dữ liệu số/null, format tiền/ngày, stock=0, ảnh thiếu và thứ tự chọn màu/size.
- Kiểm tra responsive tối thiểu khoảng 375, 768 và 1440 px; bàn phím, focus modal, label/error của input, alt text, độ tương phản và thông báo trạng thái.
- Rà index.html: lang tiếng Việt, title/favicon và đường dẫn asset khi build/deploy; kiểm tra console/network cho lỗi liên quan.
- Nội dung như review/rating/thông số phải có nguồn dữ liệu đúng hoặc được ghi rõ là thông tin mẫu; không trình bày dữ liệu dựng sẵn như đánh giá thật.

4.8. Chức năng demo và tích hợp bên ngoài

- VNPay hiện có nhánh UI báo đang tích hợp. Nếu không có thông tin tích hợp/sandbox, vô hiệu hóa phương thức chưa khả dụng với thông báo trung thực; giữ COD hoạt động và ghi VNPay chưa nghiệm thu.
- Nếu đủ cấu hình và được phép kiểm thử sandbox, triển khai tạo giao dịch phía server, xác thực chữ ký callback/IPN, đối chiếu order/amount/currency, xử lý retry/idempotency và trạng thái thất bại. Không đánh dấu đã thanh toán chỉ theo redirect trình duyệt.
- Contact hiện chỉ toast thành công. Triển khai lưu yêu cầu liên hệ ở backend với validation và trạng thái lỗi thực; chỉ báo đã nhận khi API xác nhận lưu thành công. Không tự gửi email/tin nhắn ra bên ngoài.
- Phân biệt rõ: triển khai xong, test qua mô phỏng, test tích hợp sandbox và vận hành thật. Không dùng kết quả mock để nghiệm thu dịch vụ bên ngoài.

4.9. Dependency, cài đặt và môi trường

- Kiểm tra frontend/backend có thể cài và chạy từ manifest riêng; chuyển/khai báo đúng dependencies sử dụng. Đặc biệt multer/sharp đang được backend dùng nhưng khai báo ở gốc.
- Chuẩn hóa scripts dễ hiểu: frontend dev/build/lint/test/preview và backend dev/start/lint/test theo công cụ được chọn. Cung cấp lệnh chạy cả hệ thống nếu hữu ích.
- ESLint phải bao phủ backend với globals/CommonJS phù hợp và frontend với React Hooks; ignore đúng file generated/vendor.
- Tạo .env.example cho frontend/backend, giải thích biến public VITE_* và biến server-only; tuyệt đối không đưa secret vào bundle frontend. Bổ sung ignore env thật nhưng cho phép file mẫu.
- Kiểm tra cài đặt sạch trong bản sao/thư mục tách biệt khi cần, tránh xóa node_modules đang dùng của người dùng.
- Có thể chạy dependency audit nếu mạng cho phép; phân biệt dependency runtime/dev, đường khai thác, bản sửa và breaking change. Không npm audit fix --force hoặc coi audit không chạy được là không có lỗ hổng.
- Khi cần xác minh API/version/cấu hình thư viện, tra tài liệu chính thức tương ứng phiên bản và ghi nguồn; không khẳng định theo trí nhớ.

4.10. Kiểm thử, build và hiệu năng

- Bổ sung test có giá trị tại ranh giới nghiệp vụ và quyền: auth/ownership, validation, tính tiền/khuyến mãi, transaction rollback, tồn kho cạnh tranh, idempotency và trạng thái đơn.
- Test backend tích hợp phải chạy trên MySQL test tương thích hoặc ghi rõ phần chưa chạy; mock DB không chứng minh transaction/SQL hoạt động đúng.
- Bổ sung kiểm thử frontend cho tương tác/trạng thái lỗi quan trọng và E2E các luồng chính khi môi trường cho phép.
- Fixture/seed phải tái lập được, không chứa dữ liệu thật. Test độc lập, dọn đúng dữ liệu test và không dùng ID demo cố định làm giả lập đa người dùng.
- Không đặt mục tiêu coverage tùy ý hoặc viết test chỉ lặp lại implementation. Với lỗi nghiêm trọng đã sửa, có regression test tái hiện đúng hành vi lỗi.
- Sau mỗi nhóm sửa, chạy kiểm tra liên quan. Cuối đợt chạy bộ kiểm tra tổng hợp; báo rõ test nào pass/fail/skipped/chưa chạy và nguyên nhân.
- Build hiện có chunk JS chính khoảng 578 kB. Đánh giá lazy route/chart hoặc chia bundle phù hợp, đo trước/sau; không chỉ tăng ngưỡng cảnh báo. Không coi kích thước bundle là phép đo tốc độ tải trang.
- Với nhận định hiệu năng DB/UI, ghi phép đo/cách đo và giới hạn môi trường; không bịa số liệu tải, Lighthouse hoặc khả năng chịu tải.

4.11. Tài liệu và vận hành

- Thay README mẫu bằng hướng dẫn cài mới: runtime, dependencies, DB, migration/seed, env, chạy FE/BE, scripts test/build và tài khoản test tạo bằng seed an toàn.
- Tài liệu kiến trúc ngắn: trách nhiệm thư mục, luồng dữ liệu, quyền, API contract, trạng thái đơn và chính sách tiền/stock.
- Hướng dẫn production build, routing fallback, API prefix/reverse proxy, static/uploads, HTTPS/cookie/CORS và biến môi trường tương ứng. Không giả định Vite dev proxy hoạt động ở production.
- Backend có logging lỗi phù hợp, health/readiness hợp lý, fail rõ khi thiếu cấu hình quan trọng và graceful shutdown/giải phóng DB connection.
- Ghi quy trình backup/restore DB và uploads, migration/rollback và chẩn đoán lỗi thường gặp. Chỉ xác nhận restore hoạt động nếu đã thử trên môi trường test.
- Cung cấp script kiểm tra tổng hợp có thể dùng trong CI; nếu đã có CI thì cập nhật. Nếu chưa xác định nền tảng repository/CI, tài liệu hóa lệnh độc lập, không tự công bố hay push.

5. GIAI ĐOẠN C — TRIỂN KHAI THEO ƯU TIÊN

Đề xuất kế hoạch ngắn rồi bắt đầu sửa, không kết thúc chỉ với kế hoạch:

Đợt 1: Xác thực, phân quyền API, ownership, loại bỏ ID/admin demo và bảo vệ cấu hình.
Đợt 2: Tính tiền trên server, transaction, chống trùng đơn, state transition, tồn kho, tính nhất quán ảnh/DB và ràng buộc tài nguyên con.
Đợt 3: Hoàn thiện các luồng chức năng, API contract, bộ lọc/phân trang, Contact/OrderSuccess và xử lý phương thức thanh toán chưa khả dụng.
Đợt 4: Refactor có mục tiêu, kiểm tra frontend/backend, hiệu năng có phép đo, scripts cài/chạy và tài liệu vận hành.

Thứ tự có thể điều chỉnh theo phụ thuộc thực tế, ví dụ chuẩn bị schema/test DB trước auth. Mỗi đợt cần ghi file đã sửa, vấn đề giải quyết, thay đổi hành vi, kiểm tra đã chạy và tồn đọng. Duy trì docs/PROJECT_COMPLETION_STATUS.md để có thể tiếp tục khi hết ngữ cảnh.

Nếu bị thiếu dịch vụ hoặc cần quyết định nghiệp vụ, ghi rõ một câu hỏi cụ thể, ảnh hưởng và giả định an toàn. Tiếp tục những phần độc lập; không tự coi thời gian chờ là câu trả lời.

6. TIÊU CHÍ NGHIỆM THU

Chỉ đánh dấu từng tiêu chí đạt khi có bằng chứng:

[ ] Có hướng dẫn và cấu hình mẫu để cài từ môi trường sạch; dependencies FE/BE được khai báo đầy đủ.
[ ] Lint bao phủ FE/BE, build thành công, bộ test cần thiết chạy qua; không có lỗi console/network trên các luồng đã nghiệm thu.
[ ] Không còn đăng nhập giả, admin mặc định, tự đổi role hoặc ID người dùng/giỏ hàng dùng chung trong luồng thực.
[ ] Gọi API trực tiếp vẫn bị kiểm soát quyền; customer A không đọc/sửa dữ liệu của B.
[ ] Giá/giảm giá/tổng tiền phía client bị sửa không làm thay đổi số tiền backend tính đúng.
[ ] Lỗi ghi giữa đơn hàng không để lại dữ liệu dở dang; retry không tạo/trừ kho trùng; request cạnh tranh không bán vượt tồn.
[ ] Trạng thái đơn được kiểm soát, lịch sử dùng snapshot phù hợp, cập nhật completed lặp không trừ kho thêm.
[ ] CRUD sản phẩm/ảnh/biến thể không tác động sai sản phẩm hoặc làm mất file khi DB rollback; cache phản ánh thay đổi đúng.
[ ] Tìm kiếm + category + lọc/sort + phân trang có kết quả/tổng số nhất quán, kể cả không có kết quả hoặc trang vượt giới hạn.
[ ] Luồng COD hoàn chỉnh từ sản phẩm đến lịch sử/admin; OrderSuccess hiển thị đúng đơn và đúng quyền.
[ ] Contact lưu thật hoặc thông báo chưa khả dụng trung thực; tích hợp thanh toán chưa test đủ không được quảng bá là hoàn thiện.
[ ] Có UI loading/empty/error, responsive và hỗ trợ bàn phím cho các luồng chính.
[ ] Có migration/seed/test setup và tài liệu kiến trúc/API/nghiệp vụ/vận hành cần thiết; không lộ secret.
[ ] Không còn vấn đề P0/P1 chưa xử lý. Nếu còn, kết luận chưa đủ điều kiện phát hành và mô tả đúng blocker.

Đánh giá riêng ba mức: chạy demo local, dùng đầy đủ các chức năng trong phạm vi đã chốt, sẵn sàng phát hành production. Không lấy việc chạy demo hoặc build thành công làm bằng chứng cho hai mức còn lại.

7. ĐẦU RA BẮT BUỘC

- docs/PROJECT_AUDIT.md: phạm vi đã kiểm tra, ma trận chức năng/module và sổ phát hiện có file/dòng/bằng chứng/ưu tiên.
- docs/PROJECT_COMPLETION_STATUS.md: tiến độ từng đợt, thay đổi, câu hỏi/phụ thuộc và việc tiếp theo cụ thể.
- docs/VERIFICATION.md: môi trường, command, exit code, tóm tắt test, bằng chứng E2E/DB, phần chưa chạy và cách tái hiện.
- README.md và các tài liệu bổ trợ cần thiết, .env.example không chứa secret, scripts/migration/seed/test tương ứng thay đổi thực tế.
- Source code đã sửa, không chỉ checklist, không để TODO thay cho phần có thể triển khai.
- Báo cáo cuối ngắn gọn bằng tiếng Việt: kết luận cho từng mức sẵn sàng, vấn đề quan trọng đã sửa, kiểm tra đã qua, hạn chế còn lại, cách chạy và đường dẫn file bàn giao.

Không dùng một tỷ lệ phần trăm chủ quan để tuyên bố dự án hoàn thiện. Mọi tuyên bố đạt phải liên kết được tới tiêu chí và bằng chứng kiểm chứng.

Bắt đầu bằng việc đọc source, lập baseline và đối chiếu các phát hiện trong PROMPT_HOAN_THIEN_DU_AN.md. Sau đó tiếp tục triển khai cho đến khi các phần thuộc phạm vi có thể làm được đã hoàn tất và các phần bị chặn được mô tả chính xác.
```
