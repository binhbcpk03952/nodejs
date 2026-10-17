import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Vui lòng nhập đầy đủ email và mật khẩu', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email, password);
      showToast(`Đăng nhập thành công! Xin chào ${res.user.name}`, 'success');

      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/admin' ? '/' : from, { replace: true });
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      const errMsg = err.response?.data?.error || err.message || 'Đăng nhập không thành công';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Vui lòng điền đầy đủ các trường bắt buộc', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('Mật khẩu phải có tối thiểu 6 ký tự', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await register(name, email, password, phone);
      showToast(`Đăng ký thành công! Xin chào ${res.user.name}`, 'success');
      navigate('/');
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      const errMsg = err.response?.data?.error || err.message || 'Đăng ký tài khoản thất bại';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Nút hỗ trợ điền nhanh thông tin tài khoản mẫu để kiểm thử
  const fillSampleAccount = (role) => {
    if (role === 'admin') {
      setEmail('admin@badminton.vn');
      setPassword('Admin@123456');
      showToast('Đã điền thông tin tài khoản Quản Trị (Admin)', 'info');
    } else {
      setEmail('customer@badminton.vn');
      setPassword('Customer@123456');
      showToast('Đã điền thông tin tài khoản Khách Hàng (Customer)', 'info');
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '480px' }}>
      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
        <div className="text-center mb-4">
          <div
            className="d-inline-flex p-3 bg-success-subtle text-success rounded-circle mb-3"
            style={{ width: '60px', height: '60px', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className={`bi ${isRegisterMode ? 'bi-person-plus-fill' : 'bi-person-fill'} fs-2`}></i>
          </div>
          <h3 className="fw-bold text-dark">
            {isRegisterMode ? 'Đăng Ký Thành Viên' : 'Đăng Nhập Tài Khoản'}
          </h3>
          <p className="text-secondary small">Hệ thống phân phối dụng cụ cầu lông Núi Xanh</p>
        </div>

        {/* Chuyển đổi Đăng nhập / Đăng ký */}
        <div className="d-flex rounded-pill bg-light p-1 mb-4 border">
          <button
            type="button"
            className={`btn btn-sm w-50 rounded-pill fw-medium ${!isRegisterMode ? 'btn-white shadow-sm text-success bg-white' : 'text-muted'}`}
            onClick={() => setIsRegisterMode(false)}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            className={`btn btn-sm w-50 rounded-pill fw-medium ${isRegisterMode ? 'btn-white shadow-sm text-success bg-white' : 'text-muted'}`}
            onClick={() => setIsRegisterMode(true)}
          >
            Đăng Ký
          </button>
        </div>

        {!isRegisterMode && (
          <div className="bg-light p-3 rounded-3 mb-4 text-center border">
            <small className="text-muted d-block mb-2 fw-medium">🔑 Điền nhanh tài khoản kiểm thử:</small>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-success btn-sm w-50 rounded-pill"
                onClick={() => fillSampleAccount('customer')}
              >
                <i className="bi bi-person me-1"></i> Khách Hàng
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm w-50 rounded-pill"
                onClick={() => fillSampleAccount('admin')}
              >
                <i className="bi bi-shield-lock me-1"></i> Quản Trị
              </button>
            </div>
          </div>
        )}

        {!isRegisterMode ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-medium">Email tài khoản</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 rounded-start-3">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 rounded-end-3"
                  placeholder="name@badminton.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-medium">Mật khẩu</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 rounded-start-3">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 rounded-end-3"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-success w-100 rounded-pill py-2 fw-medium shadow-sm mb-3"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-medium">Họ và tên *</label>
              <input
                type="text"
                className="form-control rounded-3"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-medium">Email đăng nhập *</label>
              <input
                type="email"
                className="form-control rounded-3"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-medium">Số điện thoại</label>
              <input
                type="tel"
                className="form-control rounded-3"
                placeholder="0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-medium">Mật khẩu (tối thiểu 6 ký tự) *</label>
              <input
                type="password"
                className="form-control rounded-3"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-medium">Xác nhận mật khẩu *</label>
              <input
                type="password"
                className="form-control rounded-3"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-success w-100 rounded-pill py-2 fw-medium shadow-sm mb-3"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang tạo tài khoản...
                </>
              ) : (
                'Tạo Tài Khoản Mới'
              )}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link to="/" className="text-muted small text-decoration-none">
            <i className="bi bi-arrow-left me-1"></i> Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
