import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { formatImagePath } from "../utils/image";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import "../Cart.css";

const Carts = () => {
  const navigate = useNavigate();
  const { cartItems, fetchCart, cartTotal, loading } = useCart();
  const { showToast, showConfirm } = useToast();
  const [updatingId, setUpdatingId] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const deleteCartItem = async (id, name) => {
    const isConfirm = await showConfirm(
      "Xác nhận xoá",
      `Bạn chắc chắn muốn xoá sản phẩm "${name || 'này'}" khỏi giỏ hàng?`
    );
    if (!isConfirm) return;

    try {
      setUpdatingId(id);
      const res = await api.delete(`/cart/${id}`);
      if (res.status === 200) {
        showToast("Đã xoá sản phẩm khỏi giỏ hàng", "info");
        await fetchCart();
      }
    } catch {
      showToast("Không thể xoá sản phẩm lúc này", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateQuantity = async (item, action) => {
    if (action === "decrease" && item.quantity <= 1) {
      await deleteCartItem(item.cart_item_id, item.name);
      return;
    }

    if (action === "increase" && item.stock && item.quantity >= item.stock) {
      showToast(`Sản phẩm này trong kho chỉ còn ${item.stock} cái`, "warning");
      return;
    }

    const newQty = action === "increase" ? item.quantity + 1 : item.quantity - 1;

    try {
      setUpdatingId(item.cart_item_id);
      const res = await api.put(`/cart/${item.cart_item_id}`, {
        quantity: newQty,
      });
      if (res.status === 200) {
        await fetchCart();
      }
    } catch {
      showToast("Không thể cập nhật số lượng", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="container py-5 text-center">
        <span className="spinner-border text-success" role="status"></span>
        <p className="mt-2 text-muted">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="fw-bold text-dark mb-0">
          🛒 Giỏ Hàng Của Bạn
          {cartItems.length > 0 && (
            <span className="text-secondary fs-6 fw-normal ms-2">
              ({cartItems.length} sản phẩm)
            </span>
          )}
        </h2>
        <Link to="/products" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i className="bi bi-arrow-left me-1"></i> Tiếp tục chọn đồ
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
          <div className="text-muted mb-3">
            <i className="bi bi-cart-x display-1 text-success opacity-50"></i>
          </div>
          <h4 className="fw-bold text-dark mb-2">Giỏ hàng của bạn đang trống</h4>
          <p className="text-secondary small mb-4">
            Hãy khám phá các mẫu vợt, giày và phụ kiện cầu lông chính hãng mới nhất tại shop!
          </p>
          <div>
            <Link to="/products" className="btn btn-success rounded-pill px-4 py-2 fw-medium shadow-sm">
              Khám Phá Sản Phẩm Ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Danh sách sản phẩm trong giỏ */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light small text-secondary">
                    <tr>
                      <th scope="col" className="py-3 px-4 text-start">Sản phẩm</th>
                      <th scope="col" className="py-3 text-center">Đơn giá</th>
                      <th scope="col" className="py-3 text-center">Số lượng</th>
                      <th scope="col" className="py-3 text-end">Thành tiền</th>
                      <th scope="col" className="py-3 text-center">Xoá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((cart) => (
                      <tr key={cart.cart_item_id}>
                        {/* Ảnh và tên */}
                        <td className="py-3 px-4 text-start">
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={formatImagePath(cart.image_url1)}
                              alt={cart.name}
                              className="rounded border object-fit-contain bg-light p-1"
                              style={{ width: "65px", height: "65px" }}
                            />
                            <div>
                              <h6 className="mb-1 text-dark fw-bold" style={{ fontSize: "14px" }}>
                                {cart.name}
                              </h6>
                              <div className="d-flex flex-wrap gap-2 small text-muted">
                                {cart.color && (
                                  <span className="badge bg-light text-dark border">
                                    Màu: {cart.color}
                                  </span>
                                )}
                                {cart.size && (
                                  <span className="badge bg-light text-dark border">
                                    Phân loại: {cart.size}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Đơn giá */}
                        <td className="py-3 text-center fw-medium text-dark">
                          {formatCurrency(cart.price)}
                        </td>

                        {/* Tăng giảm số lượng */}
                        <td className="py-3 text-center">
                          <div className="d-inline-flex align-items-center border rounded-pill bg-light p-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-white rounded-circle p-0"
                              style={{ width: "28px", height: "28px" }}
                              onClick={() => updateQuantity(cart, "decrease")}
                              disabled={updatingId === cart.cart_item_id}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span className="px-3 fw-bold small">
                              {cart.quantity}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-white rounded-circle p-0"
                              style={{ width: "28px", height: "28px" }}
                              onClick={() => updateQuantity(cart, "increase")}
                              disabled={updatingId === cart.cart_item_id || (cart.stock && cart.quantity >= cart.stock)}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </td>

                        {/* Thành tiền */}
                        <td className="py-3 text-end fw-bold text-danger">
                          {formatCurrency(cart.price * cart.quantity)}
                        </td>

                        {/* Nút xoá */}
                        <td className="py-3 text-center">
                          <button
                            type="button"
                            className="btn btn-link text-danger p-0 border-0"
                            onClick={() => deleteCartItem(cart.cart_item_id, cart.name)}
                            disabled={updatingId === cart.cart_item_id}
                            title="Xoá khỏi giỏ"
                          >
                            <i className="bi bi-trash3 fs-5"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cột Tóm tắt đơn hàng & Checkout */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: "90px" }}>
              <h5 className="fw-bold mb-3 text-dark">Tóm Tắt Đơn Hàng</h5>

              <div className="d-flex justify-content-between mb-2 small text-secondary">
                <span>Tạm tính ({cartItems.length} món):</span>
                <span className="fw-medium text-dark">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 small text-secondary">
                <span>Phí vận chuyển:</span>
                <span className="text-success fw-medium">Tính khi thanh toán</span>
              </div>

              <hr className="my-3" />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5 text-dark">Tổng cộng:</span>
                <span className="fw-bold fs-4 text-danger">{formatCurrency(cartTotal)}</span>
              </div>

              <button
                type="button"
                className="btn btn-success btn-lg w-100 rounded-pill fw-bold py-3 shadow"
                onClick={() => navigate("/checkout")}
              >
                Tiến Hành Thanh Toán <i className="bi bi-arrow-right ms-1"></i>
              </button>

              <div className="mt-3 text-center small text-muted">
                <i className="bi bi-shield-check text-success me-1"></i>
                Bảo mật thanh toán 100%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carts;
