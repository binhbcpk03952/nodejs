import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row g-4">
          {/* Thông tin thương hiệu */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-success p-2 fs-6">🏸 NÚI XANH BADMINTON</span>
            </div>
            <p className="text-secondary small mb-3">
              Hệ thống phân phối dụng cụ cầu lông chính hãng hàng đầu Việt Nam: Yonex, Victor, Lining, Mizuno. Dịch vụ căng cước chuẩn thi đấu, hỗ trợ tư vấn chọn vợt theo lối đánh tận tâm.
            </p>
            <div className="d-flex gap-3 text-secondary">
              <a href="#" className="text-white fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-youtube"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-tiktok"></i></a>
              <a href="#" className="text-white fs-5"><i className="bi bi-instagram"></i></a>
            </div>
          </div>

          {/* Dịch vụ & Hỗ trợ */}
          <div className="col-lg-2 col-md-6">
            <h6 className="text-uppercase fw-bold text-success mb-3">Sản phẩm</h6>
            <ul className="list-unstyled small text-secondary">
              <li className="mb-2"><Link to="/products?category=1" className="text-secondary text-decoration-none hover-white">Vợt cầu lông</Link></li>
              <li className="mb-2"><Link to="/products?category=2" className="text-secondary text-decoration-none hover-white">Giày cầu lông</Link></li>
              <li className="mb-2"><Link to="/products?category=3" className="text-secondary text-decoration-none hover-white">Bao vợt & Balo</Link></li>
              <li className="mb-2"><Link to="/products?category=4" className="text-secondary text-decoration-none hover-white">Quần áo thể thao</Link></li>
              <li className="mb-2"><Link to="/products" className="text-secondary text-decoration-none hover-white">Phụ kiện cầu lông</Link></li>
            </ul>
          </div>

          {/* Chính sách */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase fw-bold text-success mb-3">Chính sách & Hỗ trợ</h6>
            <ul className="list-unstyled small text-secondary">
              <li className="mb-2"><span className="text-secondary">Chính sách bảo hành vợt 90 ngày</span></li>
              <li className="mb-2"><span className="text-secondary">Đổi trả miễn phí trong 7 ngày</span></li>
              <li className="mb-2"><span className="text-secondary">Dịch vụ căng cước vợt chuẩn LBS</span></li>
              <li className="mb-2"><span className="text-secondary">Giao hàng hoả tốc toàn quốc</span></li>
              <li className="mb-2"><Link to="/order_history" className="text-secondary text-decoration-none">Tra cứu đơn hàng</Link></li>
            </ul>
          </div>

          {/* Liên hệ cửa hàng */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase fw-bold text-success mb-3">Liên hệ cửa hàng</h6>
            <ul className="list-unstyled small text-secondary">
              <li className="mb-2 d-flex gap-2">
                <i className="bi bi-geo-alt-fill text-success"></i>
                <span>Số 123 Đường Cầu Lông, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="mb-2 d-flex gap-2">
                <i className="bi bi-telephone-fill text-success"></i>
                <span>Hotline: 0988 888 999 (8h00 - 21h30)</span>
              </li>
              <li className="mb-2 d-flex gap-2">
                <i className="bi bi-envelope-fill text-success"></i>
                <span>Email: contact@nuixanhbadminton.vn</span>
              </li>
              <li className="mb-2 d-flex gap-2">
                <i className="bi bi-shield-check text-success"></i>
                <span>100% Sản phẩm chính hãng - Đền gấp 10 nếu phát hiện hàng giả</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
          <p className="mb-0">© {new Date().getFullYear()} Núi Xanh Badminton Shop. Tất cả các quyền được bảo lưu.</p>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span>Thanh toán tiện lợi qua COD, VNPAY, MOMO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
