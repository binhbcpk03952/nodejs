import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const AddAddress = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get('back') || 'checkout';
  const { showToast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    recipient_name: user?.name || '',
    phone: '',
    address_line: '',
    ward: '',
    district: '',
    province: '',
    is_default: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Vui lòng đăng nhập để lưu địa chỉ giao hàng', 'warning');
      navigate('/login');
      return;
    }

    if (!formData.recipient_name || !formData.phone || !formData.address_line) {
      showToast('Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ cụ thể', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/address', formData);

      if (res.status === 201 || res.status === 200) {
        showToast('Thêm địa chỉ giao hàng thành công!', 'success');
        if (backTo === 'checkout') {
          navigate('/checkout');
        } else {
          navigate('/order_history');
        }
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Không thể lưu địa chỉ lúc này', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '650px' }}>
      <div className="card shadow-sm border-0 rounded-4 p-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <button className="btn btn-sm btn-outline-secondary rounded-circle" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left"></i>
          </button>
          <h4 className="fw-bold mb-0 text-success">Thêm địa chỉ nhận hàng</h4>
        </div>
        <p className="text-secondary small mb-4">
          Địa chỉ này sẽ được dùng để giao các đơn hàng cầu lông của bạn một cách nhanh chóng và chính xác.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium small">Họ và tên người nhận *</label>
              <input
                type="text"
                name="recipient_name"
                className="form-control rounded-3"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={formData.recipient_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium small">Số điện thoại *</label>
              <input
                type="tel"
                name="phone"
                className="form-control rounded-3"
                placeholder="Ví dụ: 0912 345 678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-medium small">Tỉnh / Thành phố *</label>
              <input
                type="text"
                name="province"
                className="form-control rounded-3"
                placeholder="Ví dụ: TP. Hồ Chí Minh"
                value={formData.province}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-medium small">Quận / Huyện *</label>
              <input
                type="text"
                name="district"
                className="form-control rounded-3"
                placeholder="Ví dụ: Quận 1"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-medium small">Phường / Xã *</label>
              <input
                type="text"
                name="ward"
                className="form-control rounded-3"
                placeholder="Ví dụ: Phường Bến Nghé"
                value={formData.ward}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-medium small">Địa chỉ chi tiết (Số nhà, tên đường, toà nhà) *</label>
              <input
                type="text"
                name="address_line"
                className="form-control rounded-3"
                placeholder="Số 45/2 Đường Lê Lợi..."
                value={formData.address_line}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-12 mt-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                />
                <label className="form-check-label small fw-medium" htmlFor="is_default">
                  Đặt làm địa chỉ giao hàng mặc định
                </label>
              </div>
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4"
                onClick={() => navigate(-1)}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-success rounded-pill px-4 shadow-sm"
              >
                {submitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddress;
