-- ==========================================================
-- NÚI XANH BADMINTON - DATABASE SEED DATA (FULL & REALISTIC)
-- Thiết lập chuẩn Charset UTF-8 chống hoàn toàn lỗi Mojibake
-- Mật khẩu mặc định:
--   Admin: admin@badminton.vn / Admin@123456
--   Khách hàng: customer@badminton.vn / Customer@123456
-- ==========================================================

USE `badminton_shop`;

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

-- Dọn dẹp dữ liệu cũ (nếu có) để tránh dữ liệu lỗi font còn sót lại
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `order_items`;
TRUNCATE TABLE `orders`;
TRUNCATE TABLE `cart_items`;
TRUNCATE TABLE `carts`;
TRUNCATE TABLE `contact_messages`;
TRUNCATE TABLE `addresses`;
TRUNCATE TABLE `product_variants`;
TRUNCATE TABLE `product_images`;
TRUNCATE TABLE `products`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `promotions`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS (Tài khoản mẫu đã mã hóa an toàn bằng scrypt)
INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `phone`, `role`, `avatar`) VALUES
(1, 'Quản Trị Viên Núi Xanh', 'admin@badminton.vn', '46cd933ae270647b0d98f3850f2d7e37:5b57f2754cbc774a22b8542482d17d4f6acaa245b82e64170133b84f49ccedd9fe4bcd26ce4fec4e46c1c7f5369babe29673a3866c5b964b94ceab16fda30f17', '0901234567', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'),
(2, 'Nguyễn Văn An', 'customer@badminton.vn', '19ffbcdf465a4518a8870d17966e3847:8385bb6b113b67ea0ab7c08c6e5d9ee6476282ccd4fe98f05cfe96bb4be61718bce52caf9a7ccb572c58d0333cb721f895c5fdb361989df04923f2fa8395cdd1', '0988776655', 'customer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'),
(3, 'Lê Thị Mai', 'lemai@gmail.com', '19ffbcdf465a4518a8870d17966e3847:8385bb6b113b67ea0ab7c08c6e5d9ee6476282ccd4fe98f05cfe96bb4be61718bce52caf9a7ccb572c58d0333cb721f895c5fdb361989df04923f2fa8395cdd1', '0912345678', 'customer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80');

-- 2. CATEGORIES (Danh mục phân cấp chuẩn tiếng Việt)
INSERT INTO `categories` (`category_id`, `name`, `parent_id`) VALUES
(1, 'Vợt Cầu Lông', NULL),
(2, 'Giày Cầu Lông', NULL),
(3, 'Phụ Kiện Cầu Lông', NULL),
(4, 'Quần Áo & Balo', NULL),
(5, 'Vợt Yonex', 1),
(6, 'Vợt Lining', 1),
(7, 'Vợt Victor', 1),
(8, 'Giày Yonex', 2),
(9, 'Balo & Túi Vợt', 4),
(10, 'Cước Căng Vợt', 3);

-- 3. PRODUCTS (Sản phẩm với tên và mô tả chuẩn tiếng Việt)
INSERT INTO `products` (`product_id`, `category_id`, `name`, `description`, `price`) VALUES
(1, 5, 'Vợt Cầu Lông Yonex Astrox 100ZZ Kurenai Đỏ', 'Cực phẩm tấn công đỉnh cao dành cho các tay vợt chuyên nghiệp. Thân vợt siêu cứng, điểm ngọt mở rộng trợ lực smash cực mạnh.', 4350000),
(2, 6, 'Vợt Cầu Lông Lining Turbo Charging 75', 'Dòng vợt cao cấp với thiết kế rãnh khí động học độc quyền, hỗ trợ phản tạt và thoát cầu tốc độ cao.', 3750000),
(3, 7, 'Vợt Cầu Lông Victor Thruster Ryuga II Pro China Open', 'Dòng vợt gắn liền với Lee Zii Jia, đầu nặng chuyên công, khung đầm mang lại uy lực đập cầu sấm sét.', 3950000),
(4, 1, 'Vợt Cầu Lông Mizuno JPX Limited Attack', 'Vợt công thủ toàn diện cao cấp thương hiệu Nhật Bản, độ ổn định cực cao khi phòng thủ và bứt tốc.', 3200000),
(5, 8, 'Giày Cầu Lông Yonex Power Cushion Aerus Z2 Wide 2024', 'Đôi giày siêu nhẹ chỉ 250g, đệm Power Cushion+ êm ái đàn hồi vượt trội, đế chống lật cổ chân an toàn.', 2850000),
(6, 2, 'Giày Cầu Lông Victor P9200 Trắng Chính Hãng', 'Đôi giày bảo vệ khớp chân toàn diện, da PU bền bỉ, độ bám sân cao cấp phù hợp đánh phong trào lẫn chuyên nghiệp.', 2350000),
(7, 10, 'Cước Căng Vợt Victor VS-100 Bền Bỉ', 'Dòng cước sợi Polymer tổng hợp siêu bền, tiếng nổ vang giòn, chịu sức căng cao lên tới 30 lbs.', 120000),
(8, 9, 'Balo Cầu Lông Yonex Pro 1408 Đa Năng', 'Balo chuyên dụng có ngăn đựng vợt cách nhiệt, ngăn để giày riêng biệt và nhiều ngăn phụ kiện rộng rãi.', 750000);

-- 4. PRODUCT_IMAGES (Sử dụng đúng các tệp ảnh thật trong sever/assets/images/)
INSERT INTO `product_images` (`image_id`, `product_id`, `image_url`, `is_main`) VALUES
(1, 1, 'vot-cau-long-yonex-astrox-100zz-kurenai-do-new-2021-5.webp', 1),
(2, 2, 'vot-cau-long-lining-turbo-charging-75-chinh-hang-1.webp', 1),
(3, 3, 'vot-cau-long-victor-ryuga-ii-pro-china-open-2025-chinh-hang-1_1754853029.webp', 1),
(4, 4, 'vot-cau-long-mizuno-jpx-limited-edition-attack-new-den-xanh-chinh-hang-1.webp', 1),
(5, 5, 'giay-cau-long-yonex-aerus-z2-wide-2024-dark-gray-chinh-hang_1732243688.webp', 1),
(6, 6, 'giay-cau-long-victor-p9200-chp-ab-trang-chinh-hang_1750884421.webp', 1),
(7, 7, 'day-cuoc-cang-vot-victor-vs-100-1_1758241926.jpg', 1),
(8, 8, 'balo-cau-long-yonex-1408-gia-cong-2.jpg', 1);

-- 5. PRODUCT_VARIANTS (Biến thể màu sắc và size chuẩn tiếng Việt)
INSERT INTO `product_variants` (`variant_id`, `product_id`, `color`, `size`, `stock`, `price`) VALUES
(1, 1, 'Kurenai Đỏ', '4U/G5', 18, 4350000),
(2, 1, 'Kurenai Đỏ', '3U/G5', 8, 4350000),
(3, 2, 'Đen Xám Bạc', '4U/G5', 15, 3750000),
(4, 2, 'Đen Xám Bạc', '3U/G5', 6, 3750000),
(5, 3, 'Đỏ Đen Rồng', '4U/G5', 12, 3950000),
(6, 4, 'Đen Xanh Dương', '4U/G5', 10, 3200000),
(7, 5, 'Dark Gray Xám Đậm', '41', 7, 2850000),
(8, 5, 'Dark Gray Xám Đậm', '42', 9, 2850000),
(9, 6, 'Trắng Xanh', '40', 5, 2350000),
(10, 6, 'Trắng Xanh', '41', 8, 2350000),
(11, 7, 'Trắng Tiêu Chuẩn', '0.66mm', 50, 120000),
(12, 8, 'Xanh Navy Đen', 'Tiêu chuẩn', 20, 750000);

-- 6. ADDRESSES (Sổ địa chỉ người dùng chuẩn tiếng Việt)
INSERT INTO `addresses` (`address_id`, `user_id`, `recipient_name`, `phone`, `address_line`, `ward`, `district`, `province`, `is_default`) VALUES
(1, 2, 'Nguyễn Văn An', '0988776655', 'Số 45 Lê Duẩn', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1),
(2, 2, 'Nguyễn Văn An (Công ty)', '0988776655', 'Tòa nhà Landmark 81, 720A Điện Biên Phủ', 'Phường 22', 'Bình Thạnh', 'TP. Hồ Chí Minh', 0),
(3, 3, 'Lê Thị Mai', '0912345678', 'Số 18 Hoàng Hoa Thám', 'Ngọc Hà', 'Ba Đình', 'Hà Nội', 1);

-- 7. PROMOTIONS (Mã giảm giá chuẩn tiếng Việt)
INSERT INTO `promotions` (`promotion_id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount`, `is_active`) VALUES
(1, 'NUIXANH50', 'Giảm 50.000đ cho đơn từ 500K', 'Ưu đãi cho đơn hàng phụ kiện & giày vợt', 'fixed', 50000, 500000, 50000, 1),
(2, 'VIP10', 'Giảm 10% tối đa 200.000đ', 'Dành riêng cho khách hàng VIP Núi Xanh', 'percent', 10, 1000000, 200000, 1),
(3, 'FREESHIP', 'Miễn phí vận chuyển 30.000đ', 'Hỗ trợ phí ship cho đơn từ 1.500.000đ', 'fixed', 30000, 1500000, 30000, 1);

-- 8. CARTS & CART_ITEMS (Giỏ hàng mẫu)
INSERT INTO `carts` (`cart_id`, `user_id`) VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO `cart_items` (`cart_item_id`, `cart_id`, `variant_id`, `quantity`) VALUES
(1, 2, 1, 1),
(2, 2, 11, 2);

-- 9. ORDERS & ORDER_ITEMS (Đơn hàng mẫu chuẩn tiếng Việt)
INSERT INTO `orders` (`order_id`, `user_id`, `address_id`, `total_amount`, `shipping_fee`, `discount_amount`, `final_amount`, `promotion_id`, `payment_method`, `payment_status`, `status`, `note`, `created_at`) VALUES
(1, 2, 1, 4350000, 30000, 200000, 4180000, 2, 'vnpay', 'paid', 'completed', 'Giao giờ hành chính, gọi trước 15p', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(2, 3, 3, 3750000, 35000, 50000, 3735000, 1, 'cod', 'paid', 'completed', 'Đan vợt mức 10.5kg 4 nút', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(3, 2, 1, 2850000, 30000, 0, 2880000, NULL, 'cod', 'paid', 'completed', 'Gửi kèm hộp giày nguyên seal', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 2, 2, 3950000, 30000, 50000, 3930000, 1, 'vnpay', 'paid', 'shipping', 'Đơn hàng đang trung chuyển', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 3, 3, 2350000, 35000, 0, 2385000, NULL, 'cod', 'unpaid', 'confirmed', 'Đã xác nhận đơn hàng', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 2, 1, 750000, 25000, 0, 775000, NULL, 'cod', 'unpaid', 'pending', 'Khách hàng vừa đặt chờ duyệt', NOW());

INSERT INTO `order_items` (`order_item_id`, `order_id`, `variant_id`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 4350000),
(2, 2, 3, 1, 3750000),
(3, 3, 7, 1, 2850000),
(4, 4, 5, 1, 3950000),
(5, 5, 10, 1, 2350000),
(6, 6, 12, 1, 750000);

-- 10. CONTACT_MESSAGES (Tin nhắn liên hệ mẫu)
INSERT INTO `contact_messages` (`id`, `name`, `phone`, `email`, `message`, `status`, `created_at`) VALUES
(1, 'Trần Minh Quân', '0933221100', 'minhquan@gmail.com', 'Shop có nhận căng cước 4 nút chuẩn Yonex không ạ? Mình muốn căng cây Astrox 88D mức 11kg.', 'new', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 'Đỗ Hoàng Nam', '0944556677', 'namhoang@gmail.com', 'Cửa hàng có sẵn mẫu Giày Yonex Aerus Z2 size 42 tại shop để thử chân không?', 'read', DATE_SUB(NOW(), INTERVAL 1 DAY));
