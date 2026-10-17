import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatImagePath } from "../utils/image";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const OrderHistory = () => {
  const { showToast, showConfirm } = useToast();
  const { user } = useAuth();

  // --- State Management ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Order Detail State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showBoxOrderDetail, setShowBoxOrderDetail] = useState(false);

  // --- API Functions ---
  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/order');
      setOrders(res.data || []);
      setError(null);
    } catch {
      setError("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Gọi API danh sách đơn hàng khi component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (id) => {
    const isConfirm = await showConfirm(
      "Xác nhận huỷ đơn",
      "Bạn chắc chắn muốn hủy đơn hàng này?"
    );
    if (!isConfirm) return;

    try {
      const res = await api.put(`/order/${id}`, {
        status: "cancelled",
      });
      if (res.status === 200) {
        setShowBoxOrderDetail(false);
        fetchOrders();
        showToast("Hủy đơn hàng thành công!", "success");
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || "Không thể hủy đơn hàng lúc này";
      showToast(msg, "error");
    }
  };

  const formatOrderId = (id, createdAt) => {
    if (!id) return "Đang tải...";
    if (!createdAt) return `NXB-${id}`;
    try {
      const d = new Date(createdAt);
      if (isNaN(d.getTime())) return `NXB-${id}`;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `NXB-${day}${month}${year}-${id}`;
    } catch {
      return `NXB-${id}`;
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { label: "Chờ xác nhận", class: "bg-warning text-dark" };
      case "confirmed":
        return { label: "Đã xác nhận", class: "bg-info text-dark" };
      case "shipping":
        return { label: "Đang giao hàng", class: "bg-primary" };
      case "completed":
        return { label: "Hoàn tất", class: "bg-success" };
      case "cancelled":
        return { label: "Đã hủy", class: "bg-danger" };
      case "paid":
        return { label: "Thanh toán VNPay", class: "bg-secondary" };
      case "refunded":
        return { label: "Đã hoàn tiền", class: "bg-dark" };
      default:
        return { label: "Không xác định", class: "bg-secondary" };
    }
  };
  const viewOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowBoxOrderDetail(true);
  };

  // --- Render ---

  return (
    <>
      <div className="row">
        <div className="col-md-3 py-4">
          <aside
            className="border rounded-2 py-4"
            style={{ position: "sticky" }}
          >
            <ul>
              <li className="list-group-item">
                <Link to="/order_history" className="">
                  Lịch sử đơn hàng
                </Link>
              </li>
            </ul>
          </aside>
        </div>
        <div className="col-md-9 py-4">
          <h2 className="fw-bold mb-4">Lịch sử đơn hàng</h2>

          {/* Trạng thái tải */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center text-muted py-5">
              Bạn chưa có đơn hàng nào.
            </div>
          )}

          {/* Danh sách đơn hàng */}
          {!loading && !error && orders.length > 0 && (
            <div className="row g-3">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <div key={order.order_id} className="col-md-6 col-lg-12">
                    <div className="card rounded-1 shadow-sm border h-100">
                      <div className="card-body">
                        <h5 className="card-title mb-2">
                          Đơn hàng{" "}
                          <span className="text-success">
                            #{formatOrderId(order.order_id, order.created_at)}
                          </span>
                        </h5>
                        <p className="mb-1">
                          <strong>Người nhận:</strong> {order.recipient_name}
                        </p>
                        <p className="mb-1">
                          <strong>Địa chỉ:</strong> {order.address_line},{" "}
                          {order.ward}, {order.district}, {order.province}
                        </p>
                        <p className="mb-1">
                          <strong>SĐT:</strong> {order.phone}
                        </p>
                        <p className="mb-1">
                          <strong>Ngày đặt:</strong>{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                        <p className="mb-1">
                          <strong>Thanh toán:</strong>{" "}
                          {order.payment_method?.toUpperCase()}
                        </p>
                        <p className="mb-1">
                          <strong>Trạng thái: </strong>
                          <span className={`badge ${statusInfo.class}`}>
                            {statusInfo.label}
                          </span>
                        </p>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <strong className="text-primary fs-5">
                            {Number(order.final_amount).toLocaleString("vi-VN")}
                            ₫
                          </strong>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => viewOrderDetail(order)}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal chi tiết đơn hàng */}
          {/* Modal chi tiết đơn hàng */}
          {showBoxOrderDetail && selectedOrder && (
            <div
              className="modal d-block fade show"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 11 }}
            >
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                  {/* Header */}
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Chi tiết đơn hàng{" "}
                      <span className="text-success">
                        #
                        {formatOrderId(
                          selectedOrder.order_id,
                          selectedOrder.created_at
                        )}
                      </span>
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowBoxOrderDetail(false)}
                    ></button>
                  </div>

                  {/* Body */}
                  <div className="modal-body">
                    {/* Loading */}
                    {!selectedOrder.order_items ? (
                      <div className="text-center text-muted py-3">
                        Đang tải danh sách sản phẩm...
                      </div>
                    ) : (
                      <>
                        {/* TABLE LIST PRODUCT */}
                        <table className="table table-bordered align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Hình ảnh</th>
                              <th>Sản phẩm</th>
                              <th>Phân loại</th>
                              <th>Số lượng</th>
                              <th>Giá</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.order_items.map((item) => (
                              <tr key={item.order_item_id}>
                                <td style={{ width: "80px" }}>
                                  <img
                                    src={formatImagePath(item.image_url)}
                                    className="img-fluid rounded"
                                    alt={item.name}
                                  />
                                </td>

                                <td>{item.name}</td>

                                <td>
                                  {item.color || "Không"} /{" "}
                                  {item.size || "Không"}
                                </td>

                                <td>{item.quantity}</td>

                                <td>
                                  {Number(item.price).toLocaleString("vi-VN")}₫
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Tổng */}
                        <div className="text-end mt-3">
                          <p>
                            <strong>Tạm tính:</strong>{" "}
                            {Number(selectedOrder.total_amount).toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </p>

                          <p>
                            <strong>Phí vận chuyển:</strong>{" "}
                            {Number(selectedOrder.shipping_fee).toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </p>

                          <p className="fs-5 fw-bold text-primary">
                            Tổng cộng:{" "}
                            {Number(selectedOrder.final_amount).toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowBoxOrderDetail(false)}
                    >
                      Đóng
                    </button>

                    {/* Hủy đơn hàng */}
                    {selectedOrder.status === "pending" && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() =>
                          handleCancelOrder(selectedOrder.order_id)
                        }
                      >
                        Hủy đơn hàng
                      </button>
                    )}

                    {/* Mua lại */}
                    {["completed", "cancelled", "refunded"].includes(
                      selectedOrder.status
                    ) && (
                      <Link
                        to={`/checkout?buyBack=${selectedOrder.order_id}`}
                        className="btn btn-success"
                      >
                        Mua lại
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
