import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { formatImagePath } from "../utils/image";
import { useToast } from "../context/ToastContext";

const OrderManagement = () => {
  const { showToast, showConfirm } = useToast();

  // --- State Management ---
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- Helper Functions ---
  const formatCurrency = (value) => {
    if (isNaN(Number(value))) return "0 VND";
    return Number(value).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const formatDate = (str) => {
    if (!str) return "";
    try {
      return new Date(str).toLocaleDateString("vi-VN");
    } catch {
      return str;
    }
  };

  const formatOrderId = (id) => {
    if (!id) return "Đang tải...";
    return `NXB-${id}`;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao hàng";
      case "completed":
        return "Hoàn tất";
      case "cancelled":
        return "Đã hủy";
      case "paid":
        return "Thanh toán VNPay";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning text-dark";
      case "confirmed":
        return "bg-info text-white";
      case "shipping":
        return "bg-primary text-white";
      case "completed":
        return "bg-success text-white";
      case "cancelled":
        return "bg-danger text-white";
      case "refunded":
        return "bg-secondary text-white";
      case "paid":
        return "bg-success-subtle text-dark";
      default:
        return "bg-light text-dark";
    }
  };

  // --- Side Effects (Fetch Data) ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/order/all?page=${currentPage}`);
        if (res.data && res.data.data) {
          setOrders(res.data.data);
          setTotalPages(res.data.pagination?.totalPages || 1);
        } else if (Array.isArray(res.data)) {
          setOrders(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách đơn hàng:", error);
      }
    };
    fetchOrders();
  }, [currentPage]);

  // --- Handlers ---
  const updateStatus = async (orderId, status) => {
    const isConfirm = await showConfirm(
      "Xác nhận cập nhật trạng thái",
      `Bạn có chắc chắn muốn cập nhật trạng thái thành "${getStatusLabel(status)}"?`
    );
    if (!isConfirm) return;

    try {
      await api.put(`/order/${orderId}`, { status: status });
      showToast(`Đã chuyển trạng thái đơn hàng sang "${getStatusLabel(status)}"`, 'success');

      // Cập nhật state React một cách bất biến (Immutable update)
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status: status } : order
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      showToast(error.response?.data?.error || 'Không thể cập nhật trạng thái đơn hàng', 'error');
    }
  };

  const showDetail = (order) => {
    setSelectedOrder(order);
  };

  // --- Render ---
  return (
    <div className="p-1 p-md-2">
      <h1 className="h2 fw-semibold mb-4 text-primary">Quản lí đơn hàng</h1>


      {/* Tìm kiếm, lọc */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input 
              type="text" 
              className="form-control" 
            placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-primary" type="button">
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <div className="input-group">
            <select 
              className="form-select" 
              aria-label="Default select example" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="completed">Hoàn tất</option>
              <option value="cancelled">Đã hủy</option>
              <option value="refunded">Đã hoàn tiền</option>
              {/* <option value="paid">Thanh toán VNPay</option> */}
            </select>
          </div>
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <div className="table-responsive shadow rounded-3 bg-white">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead className="table-light">
            <tr className="text-secondary text-uppercase small">
              <th scope="col" className="py-3 px-4">
                Mã đơn
              </th>
              <th scope="col" className="py-3 px-4">
                Khách hàng
              </th>
              <th scope="col" className="py-3 px-4">
                Ngày đặt
              </th>
              <th scope="col" className="py-3 px-4">
                Tổng tiền
              </th>
              <th scope="col" className="py-3 px-4">
                Trạng thái
              </th>
              <th scope="col" className="py-3 px-4">
                Chi tiết
              </th>
              <th scope="col" className="py-3 px-4 text-center">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {orders
              .filter((order) => {
                const matchesStatus = filterStatus === "all" || order.status === filterStatus;
                const lowerSearch = searchTerm.toLowerCase();
                const matchesSearch = 
                  formatOrderId(order.order_id).toLowerCase().includes(lowerSearch) ||
                  (order.name && order.name.toLowerCase().includes(lowerSearch));
                
                return matchesStatus && matchesSearch;
              })
              // .sort((a, b) => a.final_amount - b.final_amount)
              .map((order) => (
              <tr key={order.order_id}>
                <td className="py-3 px-4 fw-bold">
                  #{formatOrderId(order.order_id)}
                </td>
                <td className="py-3 px-4">{order.name}</td>
                <td className="py-3 px-4">{formatDate(order.created_at)}</td>
                <td className="py-3 px-4">
                  {formatCurrency(order.final_amount)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`badge rounded-pill ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    className="btn btn-link btn-sm text-primary p-0"
                    onClick={() => showDetail(order)}
                  >
                    Xem chi tiết
                  </button>
                </td>

                <td className="py-3 px-4 text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
                    {/* Xác nhận đơn */}
                    {(order.status === "pending" ||
                      order.status === "paid") && (
                      <button
                        onClick={() =>
                          updateStatus(order.order_id, "confirmed")
                        }
                        className="btn btn-sm btn-success"
                      >
                        Xác nhận
                      </button>
                    )}

                    {/* Chuyển sang đang giao */}
                    {order.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(order.order_id, "shipping")}
                        className="btn btn-sm btn-primary"
                      >
                        Giao hàng
                      </button>
                    )}

                    {/* Hoàn tất đơn */}
                    {order.status === "shipping" && (
                      <button
                        onClick={() =>
                          updateStatus(order.order_id, "completed")
                        }
                        className="btn btn-sm btn-success"
                      >
                        Hoàn tất
                      </button>
                    )}

                    {/* Hoàn tiền */}
                    {order.status === "completed" && (
                      <button
                        onClick={() => updateStatus(order.order_id, "refunded")}
                        className="btn btn-sm btn-secondary"
                      >
                        Hoàn tiền
                      </button>
                    )}

                    {/* Hủy đơn */}
                    {["pending", "confirmed", "paid", "shipping"].includes(
                      order.status
                    ) && (
                      <button
                        onClick={() =>
                          updateStatus(order.order_id, "cancelled")
                        }
                        className="btn btn-sm btn-danger"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Hiển thị thông báo nếu không có đơn hàng */}
        {orders.length === 0 && (
          <div className="p-4 text-center text-muted">
            Không tìm thấy đơn hàng nào.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav aria-label="Page navigation">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Trước</button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Sau</button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Popup chi tiết đơn (Modal) */}
      {selectedOrder && (
        <div
          className="modal d-block modal-open fade show"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title">
                  Chi tiết đơn hàng #
                  {formatOrderId(
                    selectedOrder.order_id,
                    selectedOrder.created_at
                  )}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>
              <div className="modal-body small pb-0">
                <p>
                  <strong>Khách hàng:</strong> {selectedOrder.recipient_name}
                </p>
                <p>
                  <strong>Ngày đặt:</strong>{" "}
                  {formatDate(selectedOrder.created_at)}
                </p>
                <hr className="my-2" />

                <p>
                  <strong>Tổng tiền:</strong>
                  <span className="fw-bold text-success ms-1">
                    {formatCurrency(selectedOrder.final_amount)}
                  </span>
                </p>
                <p>
                  <strong>Phí vận chuyển:</strong>{" "}
                  {formatCurrency(selectedOrder.shipping_fee)}
                </p>
                <p>
                  <strong>Giảm giá:</strong>{" "}
                  {formatCurrency(selectedOrder.discount_amount ?? 0)}
                </p>
                <p>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {selectedOrder.payment_method}
                </p>
                <p>
                  <strong>Trạng thái: </strong>
                  <span
                    className={`badge rounded-pill ${getStatusClass(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </p>
                <hr className="my-2" />
                <p>
                  <strong>Địa chỉ giao hàng:</strong>
                  {` ${selectedOrder.address_line}, ${selectedOrder.ward}, ${selectedOrder.district}, ${selectedOrder.province}`}
                </p>
                <p>
                  <strong>Ghi chú:</strong> {selectedOrder.note || "Không có"}
                </p>
              </div>

              <div
                className="list-product"
                style={{ height: "28vh", overflowY: "auto" }}
              >
                {selectedOrder.order_items.map((prod) => (
                  <div
                    className="list-item d-flex align-items-center justify-content-between border-bottom p-2"
                    key={prod.order_item_id || Math.random()}
                  >
                    {/* Bên trái: ảnh + thông tin */}
                    <div className="d-flex align-items-center">
                      <div className="image">
                        {/* Lưu ý: Đường dẫn ảnh cần được xử lý tùy thuộc vào cấu trúc dự án React của bạn */}
                        <img
                          src={formatImagePath(prod.image_url)}
                          alt="image_product"
                          className="img-thumbnail me-2"
                          style={{ width: "80px", objectFit: "cover" }}
                        />
                      </div>
                      <div className="infor small">
                        <p className="fw-bold mb-1">{prod.name}</p>
                        {prod.color && (
                          <p className="mb-0">
                            <strong>Màu sắc:</strong> {prod.color}
                          </p>
                        )}
                        {prod.size && (
                          <p className="mb-0">
                            <strong>Kích thước:</strong> {prod.size}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bên phải: số lượng */}
                    <div className="text-end">
                      <span className="text-muted">
                                {formatCurrency(prod.price)} 
                                <br />
                                x {prod.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
