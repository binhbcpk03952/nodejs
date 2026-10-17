import React, { useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const Contact = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      showToast('Vui lòng điền họ tên, số điện thoại và nội dung cần hỗ trợ', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/contact', formData);
      showToast(res.data?.message || 'Cảm ơn bạn! Chúng tôi đã nhận được thông tin và sẽ liên hệ sớm nhất.', 'success');
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      console.error('Lỗi gửi liên hệ:', err);
      const msg = err.response?.data?.error || 'Không thể gửi tin nhắn lúc này. Vui lòng thử lại sau.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-success mb-2">Liên Hệ Với Núi Xanh Badminton</h1>
        <p className="text-secondary">
          Bạn cần tư vấn chọn vợt, hỗ trợ căng cước hay có câu hỏi về đơn hàng? Hãy liên hệ ngay với chúng tôi!
        </p>
      </div>

      <div className="row g-4 mb-5">
        {/* Cột thông tin liên hệ */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <h4 className="fw-bold mb-4 text-dark">Thông tin cửa hàng</h4>

            <div className="d-flex align-items-start gap-3 mb-4">
              <div className="p-3 bg-success-subtle text-success rounded-3">
                <i className="bi bi-geo-alt-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Địa chỉ trực tiếp</h6>
                <p className="text-secondary small mb-0">123 Đường Cầu Lông, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-4">
              <div className="p-3 bg-primary-subtle text-primary rounded-3">
                <i className="bi bi-telephone-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Hotline & Zalo tư vấn</h6>
                <p className="text-secondary small mb-0">0988 888 999 - 0977 777 888</p>
                <small className="text-muted">(Phục vụ từ 8h00 đến 21h30 hàng ngày)</small>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3 mb-4">
              <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-3">
                <i className="bi bi-envelope-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Hòm thư điện tử</h6>
                <p className="text-secondary small mb-0">contact@nuixanhbadminton.vn</p>
              </div>
            </div>

            <div className="d-flex align-items-start gap-3">
              <div className="p-3 bg-info-subtle text-info-emphasis rounded-3">
                <i className="bi bi-clock-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1">Giờ mở cửa đón khách</h6>
                <p className="text-secondary small mb-0">Thứ Hai - Chủ Nhật: 08:00 - 21:30</p>
                <small className="text-muted">Nhận căng cước lấy liền trong 20 phút</small>
              </div>
            </div>
          </div>
        </div>

        {/* Cột Form gửi tin nhắn */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
            <h4 className="fw-bold mb-3 text-dark">Gửi tin nhắn cho chúng tôi</h4>
            <p className="text-secondary small mb-4">
              Điền thông tin vào form dưới đây, chuyên viên tư vấn cầu lông sẽ gọi lại hỗ trợ bạn trong vòng 15 phút.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Họ và tên *</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Số điện thoại *</label>
                  <input
                    type="tel"
                    className="form-control rounded-3"
                    placeholder="0912 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Email (nếu có)</label>
                  <input
                    type="email"
                    className="form-control rounded-3"
                    placeholder="name@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-medium">Nội dung cần hỗ trợ *</label>
                  <textarea
                    rows={4}
                    className="form-control rounded-3"
                    placeholder="Ví dụ: Tôi muốn tư vấn vợt thiên công tầm giá 2 triệu, lực tay trung bình..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div className="col-12">
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="btn btn-success rounded-pill px-5 py-2 fw-medium shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      'Gửi yêu cầu tư vấn'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
