import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="text-center py-5 bg-success text-white rounded-4 shadow-sm mb-5 p-4">
        <h1 className="fw-bold display-5 mb-3">Về Chúng Tôi - Núi Xanh Badminton</h1>
        <p className="lead mx-auto mb-4" style={{ maxWidth: '750px' }}>
          Đam mê cầu lông đích thực. Chúng tôi cung cấp các sản phẩm vợt, giày và phụ kiện cầu lông chính hãng 100%, đồng hành cùng mọi lông thủ từ phong trào đến chuyên nghiệp.
        </p>
        <Link to="/products" className="btn btn-light text-success fw-bold rounded-pill px-4 py-2 shadow-sm">
          Khám phá sản phẩm
        </Link>
      </div>

      {/* Giá trị cốt lõi */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center">
            <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mx-auto mb-3">
              <i className="bi bi-patch-check-fill fs-2"></i>
            </div>
            <h5 className="fw-bold">100% Hàng Chính Hãng</h5>
            <p className="text-secondary small mb-0">
              Nhập khẩu trực tiếp từ các thương hiệu hàng đầu: Yonex Nhật Bản, Victor Đài Loan, Lining, Mizuno. Cam kết đền bù gấp 10 lần nếu phát hiện hàng nhái.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center">
            <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mx-auto mb-3">
              <i className="bi bi-tools fs-2"></i>
            </div>
            <h5 className="fw-bold">Căng Cước Điện Tử Chuẩn LBS</h5>
            <p className="text-secondary small mb-0">
              Máy căng điện tử Victor hiện đại, đội ngũ kỹ thuật viên kinh nghiệm 4 nút / 2 nút chuẩn thi đấu quốc tế, bảo vệ khung vợt an toàn tối đa.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center">
            <div className="d-inline-flex p-3 rounded-circle bg-warning-subtle text-warning-emphasis mx-auto mb-3">
              <i className="bi bi-truck fs-2"></i>
            </div>
            <h5 className="fw-bold">Giao Hàng & Bảo Hành 90 Ngày</h5>
            <p className="text-secondary small mb-0">
              Đóng gói hộp chuyên dụng bọc khí chống gãy vỡ, giao hoả tốc toàn quốc. Bảo hành chính hãng khung vợt theo đúng tiêu chuẩn nhà phân phối.
            </p>
          </div>
        </div>
      </div>

      {/* Thông điệp cửa hàng */}
      <div className="card border-0 bg-light rounded-4 p-4 p-md-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <h3 className="fw-bold text-dark mb-3">Câu Chuyện Núi Xanh Badminton</h3>
            <p className="text-secondary">
              Khởi đầu từ những buổi tập luyện và thi đấu phong trào, chúng tôi thấu hiểu cảm giác khi sở hữu một cây vợt hợp tay, vừa vặn độ dẻo và lực căng lý tưởng.
            </p>
            <p className="text-secondary">
              Núi Xanh Badminton không chỉ là một cửa hàng bán đồ thể thao, mà là không gian chia sẻ kiến thức, kinh nghiệm chọn vợt theo lối đánh tấn công, công thủ toàn diện hoặc điều cầu kỹ thuật.
            </p>
            <div className="d-flex gap-3 mt-4">
              <Link to="/contact" className="btn btn-outline-success rounded-pill px-4">
                Liên hệ tư vấn
              </Link>
            </div>
          </div>
          <div className="col-lg-6 text-center">
            <img
              src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=700&auto=format&fit=crop&q=80"
              alt="Cầu lông Núi Xanh"
              className="img-fluid rounded-4 shadow"
              style={{ maxHeight: '350px', objectFit: 'cover', width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
