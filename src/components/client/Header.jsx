import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { formatImagePath } from "../../utils/image";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, isAdmin, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  const formatCurrency = (value) => {
    if (isNaN(Number(value))) return "0 VND";
    return Number(value).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Debounced search
  const handleSearchChange = (value) => {
    setSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setProducts([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(value.trim())}`);
        if (res.data && res.data.products) {
          setProducts(res.data.products);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm sản phẩm:", error);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setProducts([]);
    }
  };

  return (
    <header className="py-2 position-relative">
      <div className="d-flex justify-content-between align-items-center">
        {/* Logo & Navigation */}
        <div className="d-flex align-items-center gap-4">
          <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <span className="fs-3">🏸</span>
            <div>
              <span className="fw-bold fs-5 text-dark tracking-tight d-block leading-none">
                NÚI XANH
              </span>
              <small className="text-success fw-semibold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>
                Badminton Pro
              </small>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="d-none d-lg-block">
            <ul className="d-flex gap-4 mb-0 list-unstyled align-items-center">
              <li>
                <Link className="text-dark text-uppercase fw-semibold text-decoration-none small hover-green" to="/products">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link className="text-dark text-uppercase fw-semibold text-decoration-none small hover-green" to="/products?category=1">
                  Vợt Cầu Lông
                </Link>
              </li>
              <li>
                <Link className="text-dark text-uppercase fw-semibold text-decoration-none small hover-green" to="/products?category=2">
                  Giày Cầu Lông
                </Link>
              </li>
              <li>
                <Link className="text-dark text-uppercase fw-semibold text-decoration-none small hover-green" to="/about">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link className="text-dark text-uppercase fw-semibold text-decoration-none small hover-green" to="/contact">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="search-box d-none d-md-block position-relative" style={{ width: '320px' }}>
          <form onSubmit={handleSearchSubmit} className="d-flex align-items-center border rounded-pill px-3 py-1 bg-light">
            <input
              type="text"
              placeholder="Tìm vợt, giày, phụ kiện..."
              className="form-control form-control-sm border-0 bg-transparent shadow-none"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searching ? (
              <span className="spinner-border spinner-border-sm text-success" role="status"></span>
            ) : (
              <button type="submit" className="btn btn-link text-secondary p-0 border-0">
                <i className="bi bi-search"></i>
              </button>
            )}
          </form>
        </div>

        {/* User & Cart Action Buttons */}
        <div className="d-flex align-items-center gap-3">
          {/* Cart Icon with Live Badge */}
          <Link
            to="/carts"
            className="btn btn-light rounded-pill position-relative d-flex align-items-center gap-2 px-3 py-2 border shadow-sm text-dark text-decoration-none"
          >
            <i className="bi bi-bag-check-fill text-success fs-5"></i>
            <span className="d-none d-sm-inline fw-medium small">Giỏ hàng</span>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
                <span className="visually-hidden">sản phẩm trong giỏ</span>
              </span>
            )}
          </Link>

          {/* User Account Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-light rounded-pill dropdown-toggle d-flex align-items-center gap-2 px-3 py-2 border shadow-sm"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle fs-5 text-secondary"></i>
              <span className="d-none d-sm-inline fw-medium small">
                {user ? user.name : 'Tài khoản'}
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2 p-2" style={{ minWidth: '220px' }}>
              {user ? (
                <>
                  <li className="px-3 py-2 border-bottom mb-1">
                    <span className="d-block fw-bold text-dark small">{user.name}</span>
                    <small className="text-muted">{user.email}</small>
                    <span className="badge bg-success-subtle text-success mt-1 d-inline-block">
                      {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item py-2 rounded-2 text-primary fw-medium" to="/admin">
                        <i className="bi bi-speedometer2 me-2"></i> Trang quản trị (Admin)
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item py-2 rounded-2" to="/order_history">
                      <i className="bi bi-receipt me-2"></i> Lịch sử đơn hàng
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item py-2 rounded-2 text-danger"
                      onClick={() => logout()}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link className="dropdown-item py-2 rounded-2 fw-medium text-success" to="/login">
                      <i className="bi bi-box-arrow-in-right me-2"></i> Đăng nhập
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="btn btn-outline-secondary d-lg-none rounded-circle p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-5`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="d-lg-none mt-3 p-3 bg-white border rounded-3 shadow-sm animate__animated animate__fadeIn">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="input-group">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                className="form-control"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <button type="submit" className="btn btn-success">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>
          <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
            <li>
              <Link className="text-dark fw-medium text-decoration-none d-block py-1" to="/products" onClick={() => setMobileMenuOpen(false)}>
                🏸 Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link className="text-dark fw-medium text-decoration-none d-block py-1" to="/products?category=1" onClick={() => setMobileMenuOpen(false)}>
                Vợt Cầu Lông Chính Hãng
              </Link>
            </li>
            <li>
              <Link className="text-dark fw-medium text-decoration-none d-block py-1" to="/products?category=2" onClick={() => setMobileMenuOpen(false)}>
                Giày Cầu Lông
              </Link>
            </li>
            <li>
              <Link className="text-dark fw-medium text-decoration-none d-block py-1" to="/about" onClick={() => setMobileMenuOpen(false)}>
                Về Núi Xanh Badminton
              </Link>
            </li>
            <li>
              <Link className="text-dark fw-medium text-decoration-none d-block py-1" to="/contact" onClick={() => setMobileMenuOpen(false)}>
                Liên hệ & Hỗ trợ
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Dropdown Live Search Results */}
      {search.trim() && (
        <div
          className="position-absolute start-50 translate-middle-x bg-white shadow-lg rounded-3 overflow-hidden border"
          style={{
            top: "100%",
            width: "90%",
            maxWidth: "520px",
            zIndex: 1050,
            marginTop: "12px",
          }}
        >
          {searching ? (
            <div className="p-4 text-center text-muted">
              <span className="spinner-border spinner-border-sm me-2 text-success" role="status"></span>
              Đang tìm kiếm sản phẩm...
            </div>
          ) : products.length > 0 ? (
            <div className="list-group list-group-flush" style={{ maxHeight: "360px", overflowY: "auto" }}>
              <div className="p-2 bg-light small fw-medium text-secondary">
                Tìm thấy {products.length} sản phẩm cho "<strong>{search}</strong>":
              </div>
              {products.map((product) => (
                <Link
                  to={`/products/${product.product_id}`}
                  key={product.product_id}
                  className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-2 px-3"
                  onClick={() => {
                    setSearch("");
                    setProducts([]);
                  }}
                >
                  <img
                    src={formatImagePath(product.image_url)}
                    alt={product.name}
                    className="rounded border object-fit-contain"
                    style={{ width: "52px", height: "52px" }}
                  />
                  <div className="flex-grow-1 overflow-hidden">
                    <h6 className="mb-1 text-dark text-truncate" style={{ fontSize: '14px' }}>
                      {product.name}
                    </h6>
                    <small className="text-danger fw-bold">
                      {formatCurrency(product.price)}
                    </small>
                  </div>
                  <i className="bi bi-chevron-right text-muted small"></i>
                </Link>
              ))}
              <Link
                to={`/products?search=${encodeURIComponent(search.trim())}`}
                className="list-group-item list-group-item-action text-center text-success fw-bold small py-2 bg-light"
                onClick={() => {
                  setSearch("");
                  setProducts([]);
                }}
              >
                Xem tất cả kết quả ({products.length})
              </Link>
            </div>
          ) : (
            <div className="p-4 text-center text-muted small">
              <i className="bi bi-emoji-frown fs-4 d-block mb-1"></i>
              Không tìm thấy sản phẩm nào khớp với từ khoá "<strong>{search}</strong>"
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
