import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import { formatImagePath } from "../utils/image";
import "../OrderSuccess.css";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setErrorMsg('Không tìm thấy mã đơn hàng cần xem.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/order/${orderId}`);
        if (res.status === 200 && res.data) {
          setOrder(res.data);
          setErrorMsg('');
        } else {
          setErrorMsg('Không thể tìm thấy thông tin đơn hàng này.');
        }
      } catch (err) {
        console.error("Lỗi khi tải đơn hàng:", err);
        const msg = err.response?.data?.error || 'Đơn hàng không tồn tại hoặc bạn không có quyền xem.';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Hàm helper format tiền tệ VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Hàm helper format ngày tháng
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Hàm dịch phương thức thanh toán
  const getPaymentMethod = (method) => {
    switch (method) {
      case "cod":
        return "Thanh toán khi nhận hàng (COD)";
      case "vnpay":
        return "Thanh toán qua VNPAY";
      case "momo":
        return "Thanh toán qua Momo";
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-success" role="status"></div>
        <div className="mt-3 text-muted">Đang tải thông tin đơn hàng #{orderId || ''}...</div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="container py-5 text-center my-5" style={{ maxWidth: '600px' }}>
        <div className="card border-0 shadow-lg rounded-4 p-5 bg-white">
          <div className="text-warning mb-3">
            <i className="bi bi-exclamation-circle fs-1"></i>
          </div>
          <h4 className="fw-bold mb-2">Không Thể Hiển Thị Đơn Hàng</h4>
          <p className="text-secondary small mb-4">{errorMsg || 'Không tìm thấy dữ liệu đơn hàng.'}</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">
              Về trang chủ
            </Link>
            <Link to="/order_history" className="btn btn-success rounded-pill px-4">
              Xem lịch sử đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="order-success-container">
      <div className="success-card">
        {/* Header: Icon thành công */}
        <div className="success-header">
          <div className="check-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2>Đặt hàng thành công!</h2>
          <p>Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được xử lý.</p>
        </div>

        {/* Thông tin chung đơn hàng */}
        <div className="order-info-grid">
          <div className="info-column">
            <h3>Thông tin nhận hàng</h3>
            <p>
              <strong>Người nhận:</strong> {order.recipient_name}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {order.phone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {order.address_line}, {order.ward},{" "}
              {order.district}, {order.province}
            </p>
            <p className="note">
              <strong>Ghi chú:</strong> {order.note || "Không có"}
            </p>
          </div>
          <div className="info-column">
            <h3>Thông tin đơn hàng</h3>
            <p>
              <strong>Mã đơn hàng:</strong> #{order.order_id}
            </p>
            <p>
              <strong>Ngày đặt:</strong> {formatDate(order.created_at)}
            </p>
            <p>
              <strong>Phương thức:</strong>{" "}
              {getPaymentMethod(order.payment_method)}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <span className={`status-badge ${order.status}`}>
                {order.status === "pending" ? "Chờ xác nhận" : order.status}
              </span>
            </p>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="order-items">
          <h3>Sản phẩm đã mua</h3>
          {order.order_items.map((item) => (
            <div key={item.order_item_id} className="item-row">
              <div className="item-image">
                {/* Xử lý hiển thị ảnh */}
                <img
                  src={formatImagePath(item.image_url)}
                          style={{
                              width: "80px",
                          }}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80";
                  }} // Fallback nếu ảnh lỗi
                />
              </div>
              <div className="item-details">
                <h4>{item.name}</h4>
                <p className="variant">
                  Phân loại: {item.color} / Size {item.size}
                </p>
              </div>
              <div className="item-meta">
                <span className="price">{formatCurrency(item.price)}</span>
                <span className="quantity">x{item.quantity}</span>
                <span className="total-line">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tổng kết tài chính */}
        <div className="order-summary">
          <div className="summary-row">
            <span>Tạm tính:</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển:</span>
            <span>{formatCurrency(order.shipping_fee)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="summary-row discount">
              <span>Giảm giá:</span>
              <span>-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <div className="summary-row final">
            <span>Tổng thanh toán:</span>
            <span className="final-price">
              {formatCurrency(order.final_amount)}
            </span>
          </div>
        </div>

        {/* Nút điều hướng */}
        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Về trang chủ
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
