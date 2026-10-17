import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { formatImagePath } from "../utils/image";

const HomeView = () => {
  const navigate = useNavigate();

  const [productBestSeller, setProductBestSeller] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProductBestSeller = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/best-seller");
      setProductBestSeller(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm bán chạy:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductBestSeller();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleQuickBuy = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="home-page pb-5">
      {/* 1. HERO BANNER */}
      <section className="hero-banner rounded-4 overflow-hidden position-relative mb-5 shadow-sm text-white" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #064e3b 100%)',
        minHeight: '380px'
      }}>
        <div className="row align-items-center g-4 p-4 p-md-5">
          <div className="col-lg-7">
            <span className="badge bg-success px-3 py-2 rounded-pill mb-3 fw-semibold">
              🏸 BST VỢT CẦU LÔNG 2026 CHÍNH HÃNG
            </span>
            <h1 className="fw-bold display-5 mb-3 text-white">
              Chinh Phục Đỉnh Cao Cùng Núi Xanh Badminton
            </h1>
            <p className="lead text-light opacity-90 mb-4" style={{ fontSize: '1.1rem' }}>
              Trải nghiệm các dòng vợt chuyên nghiệp hàng đầu từ Yonex, Victor, Lining. Căng cước điện tử chuẩn LBS, bảo hành 90 ngày.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/products" className="btn btn-success btn-lg rounded-pill px-4 fw-bold shadow">
                Mua Sắm Ngay <i className="bi bi-arrow-right ms-1"></i>
              </Link>
              <Link to="/about" className="btn btn-outline-light btn-lg rounded-pill px-4">
                Tìm Hiểu Thêm
              </Link>
            </div>
          </div>
          <div className="col-lg-5 text-center d-none d-lg-block">
            <img
              src="https://images.unsplash.com/photo-1613918431703-aa6321c27219?w=600&auto=format&fit=crop&q=80"
              alt="Vợt cầu lông"
              className="img-fluid rounded-4 shadow-lg border border-secondary"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS (CAM KẾT) */}
      <section className="features-bar mb-5">
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center h-100 bg-white">
              <i className="bi bi-patch-check-fill text-success fs-2 mb-2"></i>
              <h6 className="fw-bold mb-1">100% Chính Hãng</h6>
              <small className="text-secondary">Đền gấp 10 nếu phát hiện hàng giả</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center h-100 bg-white">
              <i className="bi bi-tools text-primary fs-2 mb-2"></i>
              <h6 className="fw-bold mb-1">Căng Cước Lấy Liền</h6>
              <small className="text-secondary">Chuẩn 4 nút kỹ thuật quốc tế</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center h-100 bg-white">
              <i className="bi bi-arrow-repeat text-warning-emphasis fs-2 mb-2"></i>
              <h6 className="fw-bold mb-1">Đổi Trả 7 Ngày</h6>
              <small className="text-secondary">Đổi size giày & quần áo miễn phí</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center h-100 bg-white">
              <i className="bi bi-truck text-danger fs-2 mb-2"></i>
              <h6 className="fw-bold mb-1">Giao Nhanh Toàn Quốc</h6>
              <small className="text-secondary">Bọc hộp bảo vệ khung vợt an toàn</small>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DANH MỤC NỔI BẬT */}
      <section className="categories-section mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold text-dark mb-0">Danh Mục Sản Phẩm</h3>
          <Link to="/products" className="text-success fw-semibold text-decoration-none small">
            Xem tất cả <i className="bi bi-chevron-right"></i>
          </Link>
        </div>

        <div className="row g-3">
          <div className="col-6 col-md-3">
            <Link to="/products?category=1" className="text-decoration-none">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden text-center p-3 hover-lift bg-white">
                <span className="fs-1 d-block mb-2">🏸</span>
                <h6 className="fw-bold text-dark mb-1">Vợt Cầu Lông</h6>
                <small className="text-muted">Yonex, Victor, Lining...</small>
              </div>
            </Link>
          </div>
          <div className="col-6 col-md-3">
            <Link to="/products?category=2" className="text-decoration-none">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden text-center p-3 hover-lift bg-white">
                <span className="fs-1 d-block mb-2">👟</span>
                <h6 className="fw-bold text-dark mb-1">Giày Cầu Lông</h6>
                <small className="text-muted">Bám sân, đệm êm ái</small>
              </div>
            </Link>
          </div>
          <div className="col-6 col-md-3">
            <Link to="/products?category=3" className="text-decoration-none">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden text-center p-3 hover-lift bg-white">
                <span className="fs-1 d-block mb-2">🎒</span>
                <h6 className="fw-bold text-dark mb-1">Balo & Bao Vợt</h6>
                <small className="text-muted">Nhiều ngăn chứa đồ tiện lợi</small>
              </div>
            </Link>
          </div>
          <div className="col-6 col-md-3">
            <Link to="/products?category=4" className="text-decoration-none">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden text-center p-3 hover-lift bg-white">
                <span className="fs-1 d-block mb-2">👕</span>
                <h6 className="fw-bold text-dark mb-1">Quần Áo & Phụ Kiện</h6>
                <small className="text-muted">Thoáng mát, co giãn tốt</small>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SẢN PHẨM BÁN CHẠY NHẤT */}
      <section className="best-sellers-section mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1">🔥 Sản Phẩm Bán Chạy Nhất</h3>
            <p className="text-secondary small mb-0">Được đông đảo anh em lông thủ tin dùng và đánh giá cao</p>
          </div>
          <Link to="/products" className="btn btn-outline-success btn-sm rounded-pill px-3">
            Xem thêm
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border text-success" role="status"></span>
            <p className="text-muted mt-2 small">Đang tải sản phẩm bán chạy...</p>
          </div>
        ) : (
          <div className="row g-4">
            {productBestSeller && productBestSeller.length > 0 ? (
              productBestSeller.map((product) => (
                <div className="col-6 col-md-4 col-lg-3" key={product.product_id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card bg-white position-relative">
                    {/* Hot Badge */}
                    <span className="position-absolute top-0 start-0 m-3 badge bg-danger rounded-pill px-2 py-1 shadow-sm" style={{ zIndex: 10 }}>
                      HOT
                    </span>

                    <Link
                      to={`/products/${product.product_id}`}
                      className="text-decoration-none d-block overflow-hidden p-3 bg-light text-center"
                      style={{ height: '220px' }}
                    >
                      <img
                        src={formatImagePath(product.image_url)}
                        alt={product.name}
                        className="w-100 h-100 object-fit-contain transition-transform"
                      />
                    </Link>

                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center gap-1 text-warning small mb-1">
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <span className="text-muted ms-1" style={{ fontSize: '11px' }}>
                            ({product.stock_selling || 50}+)
                          </span>
                        </div>
                        <h6 className="card-title fw-bold text-dark text-truncate mb-2" title={product.name}>
                          <Link to={`/products/${product.product_id}`} className="text-dark text-decoration-none">
                            {product.name}
                          </Link>
                        </h6>
                        <p className="card-text text-danger fw-bold fs-5 mb-3">
                          {formatCurrency(product.price)}
                        </p>
                      </div>

                      <button
                        className="btn btn-outline-success btn-sm w-100 rounded-pill fw-medium d-flex align-items-center justify-content-center gap-2 py-2"
                        onClick={() => handleQuickBuy(product.product_id)}
                      >
                        <i className="bi bi-eye"></i> Xem Chi Tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5 text-muted">
                <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                Hiện chưa có danh sách sản phẩm bán chạy.
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. THƯƠNG HIỆU ĐỒNG HÀNH */}
      <section className="brands-section text-center py-4 bg-white rounded-4 border p-4">
        <h6 className="text-uppercase text-secondary fw-bold small mb-4 tracking-wider">
          CÁC THƯƠNG HIỆU HÀNG ĐẦU TẠI NÚI XANH BADMINTON
        </h6>
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5">
          <span className="fw-bold fs-4 text-dark opacity-75">YONEX</span>
          <span className="fw-bold fs-4 text-dark opacity-75">VICTOR</span>
          <span className="fw-bold fs-4 text-dark opacity-75">LI-NING</span>
          <span className="fw-bold fs-4 text-dark opacity-75">MIZUNO</span>
          <span className="fw-bold fs-4 text-dark opacity-75">KUMPOO</span>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
