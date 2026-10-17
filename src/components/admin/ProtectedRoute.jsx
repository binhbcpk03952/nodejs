import React from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  // Nếu chưa đăng nhập, điều hướng về trang Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập nhưng không phải Admin
  if (!isAdmin) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: '600px' }}>
        <div className="card border-0 shadow-lg rounded-4 p-5 bg-white">
          <div className="text-danger mb-3">
            <i className="bi bi-shield-slash fs-1"></i>
          </div>
          <h3 className="fw-bold mb-2 text-dark">Truy Cập Bị Từ Chối</h3>
          <p className="text-secondary small mb-4">
            Tài khoản hiện tại (<strong>{user.email}</strong>) có vai trò <strong>Khách Hàng</strong>, không có quyền truy cập vào bảng điều khiển quản trị.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">
              <i className="bi bi-house me-1"></i> Về trang chủ
            </Link>
            <Link to="/login" className="btn btn-primary rounded-pill px-4">
              <i className="bi bi-box-arrow-in-right me-1"></i> Đăng nhập tài khoản khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
