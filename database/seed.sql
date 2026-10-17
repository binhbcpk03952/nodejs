-- ==========================================================
-- NÚI XANH BADMINTON - DATABASE SEED DATA
-- Dữ liệu mẫu chuẩn cho môi trường kiểm thử / local
-- Mật khẩu mặc định:
--   Admin: admin@badminton.vn / Admin@123456
--   Khách hàng: customer@badminton.vn / Customer@123456
-- ==========================================================

USE `badminton_shop`;

-- 1. USERS
INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `phone`, `role`, `avatar`) VALUES
(1, 'Quản Trị Viên Núi Xanh', 'admin@badminton.vn', '46cd933ae270647b0d98f3850f2d7e37:5b57f2754cbc774a22b8542482d17d4f6acaa245b82e64170133b84f49ccedd9fe4bcd26ce4fec4e46c1c7f5369babe29673a3866c5b964b94ceab16fda30f17', '0901234567', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'),
(2, 'Nguyễn Văn An', 'customer@badminton.vn', '19ffbcdf465a4518a8870d17966e3847:8385bb6b113b67ea0ab7c08c6e5d9ee6476282ccd4fe98f05cfe96bb4be61718bce52caf9a7ccb572c58d0333cb721f895c5fdb361989df04923f2fa8395cdd1', '0988776655', 'customer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. CATEGORIES
INSERT INTO `categories` (`category_id`, `name`, `parent_id`) VALUES
(1, 'Vợt Cầu Lông', NULL),
(2, 'Giày Cầu Lông', NULL),
(3, 'Phụ Kiện Cầu Lông', NULL),
(4, 'Quần Áo Cầu Lông', NULL),
(5, 'Vợt Yonex', 1),
(6, 'Vợt Lining', 1),
(7, 'Vợt Victor', 1),
(8, 'Giày Yonex', 2),
(9, 'Balo & Túi Vợt', 3),
(10, 'Quấn Cán & Dây Cước', 3)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 3. PRODUCTS
INSERT INTO `products` (`product_id`, `category_id`, `name`, `description`, `price`) VALUES
(1, 5, 'Vợt Cầu Lông Yonex Astrox 88D Pro', 'Dòng vợt cao cấp dành cho người chơi tấn công cầu sau, trợ lực smash cực mạnh.', 4350000),
(2, 6, 'Vợt Cầu Lông Lining Axforce 80', 'Cây vợt gắn liền với Chen Long, đầm đầu, thân dẻo vừa, độ chính xác tuyệt đối.', 3800000),
(3, 7, 'Vợt Cầu Lông Victor Thruster Ryuga', 'Vợt công thủ toàn diện với sức mạnh đập cầu uy lực và khả năng phản tạt nhanh.', 3150000),
(4, 8, 'Giày Cầu Lông Yonex Power Cushion 65Z3', 'Đôi giày huyền thoại được phần lớn tay vợt top đầu thế giới tin dùng, êm ái bám sân.', 2750000),
(5, 10, 'Cước Cầu Lông Yonex BG 65 Titanium', 'Dòng cước bền bỉ kinh điển, độ nảy tốt, tiếng nổ đanh giòn, phù hợp mọi cấp độ.', 140000)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `price`=VALUES(`price`);

-- 4. PRODUCT_IMAGES
INSERT INTO `product_images` (`image_id`, `product_id`, `image_url`, `is_main`) VALUES
(1, 1, '/assets/images/astrox88d.jpg', 1),
(2, 2, '/assets/images/axforce80.jpg', 1),
(3, 3, '/assets/images/ryuga.jpg', 1),
(4, 4, '/assets/images/shb65z3.jpg', 1),
(5, 5, '/assets/images/bg65ti.jpg', 1)
ON DUPLICATE KEY UPDATE `image_url`=VALUES(`image_url`);

-- 5. PRODUCT_VARIANTS
INSERT INTO `product_variants` (`variant_id`, `product_id`, `color`, `size`, `stock`, `price`) VALUES
(1, 1, 'Đen Xanh Ngọc', '4U/G5', 15, 4350000),
(2, 1, 'Đen Xanh Ngọc', '3U/G5', 8, 4350000),
(3, 2, 'Đen Vàng Kim', '4U/G5', 12, 3800000),
(4, 3, 'Đỏ Cam Trắng', '4U/G5', 10, 3150000),
(5, 4, 'Trắng Cam', '41', 6, 2750000),
(6, 4, 'Trắng Cam', '42', 9, 2750000),
(7, 5, 'Trắng', 'Tiêu chuẩn', 50, 140000)
ON DUPLICATE KEY UPDATE `stock`=VALUES(`stock`), `price`=VALUES(`price`);

-- 6. ADDRESSES
INSERT INTO `addresses` (`address_id`, `user_id`, `recipient_name`, `phone`, `address_line`, `ward`, `district`, `province`, `is_default`) VALUES
(1, 2, 'Nguyễn Văn An', '0988776655', 'Số 45 Lê Duẩn', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', 1)
ON DUPLICATE KEY UPDATE `recipient_name`=VALUES(`recipient_name`);

-- 7. PROMOTIONS
INSERT INTO `promotions` (`promotion_id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount`, `is_active`) VALUES
(1, 'NUIXANH50', 'Giảm 50K cho đơn từ 500K', 'Ưu đãi cho khách hàng mua vợt và phụ kiện tại Núi Xanh', 'fixed', 50000, 500000, 50000, 1),
(2, 'VIP10', 'Giảm 10% tối đa 150K', 'Áp dụng cho đơn hàng bất kỳ trên 1.000.000đ', 'percent', 10, 1000000, 150000, 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 8. CARTS
INSERT INTO `carts` (`cart_id`, `user_id`) VALUES
(1, 1),
(2, 2)
ON DUPLICATE KEY UPDATE `user_id`=VALUES(`user_id`);
