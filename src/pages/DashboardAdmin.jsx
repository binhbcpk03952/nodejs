import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import MonthlyRevenueChart from "../components/charts/MonthlyRevenueChart";
import TopProductChart from "../components/charts/TopProductChart";
import PaymentMethodChart from "../components/charts/PaymentMethodChart";

const DashboardAdmin = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchDataChart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/order/dashboard");
      setData(res.data || {});
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataChart();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);
  };

  const totalRevenue = data.monthlyRevenue?.reduce((sum, item) => sum + (Number(item.total_revenue) || 0), 0) || 0;
  const totalSold = data.topProducts?.reduce((sum, item) => sum + (Number(item.total_sold) || 0), 0) || 0;

  return (
    <div className="admin-dashboard pb-5">
      {/* Title & Quick Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            📊 Tổng Quan Kinh Doanh ({data.year || new Date().getFullYear()})
          </h2>
          <p className="text-secondary small mb-0">
            Báo cáo thống kê doanh thu, đơn hàng và các dòng sản phẩm bán chạy nhất tại Núi Xanh Badminton
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/add_products" className="btn btn-success btn-sm rounded-pill px-3 py-2 shadow-sm">
            <i className="bi bi-plus-circle me-1"></i> Thêm Sản Phẩm
          </Link>
          <Link to="/admin/order_management" className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2">
            <i className="bi bi-receipt me-1"></i> Quản Lý Đơn Hàng
          </Link>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium text-uppercase">Tổng Doanh Thu</span>
              <div className="p-2 bg-success-subtle text-success rounded-3">
                <i className="bi bi-cash-stack fs-5"></i>
              </div>
            </div>
            <h4 className="fw-bold text-dark mb-1">{formatCurrency(totalRevenue)}</h4>
            <small className="text-success fw-medium">
              <i className="bi bi-arrow-up-right me-1"></i> Doanh thu đã thanh toán
            </small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium text-uppercase">Top Hàng Đã Bán</span>
              <div className="p-2 bg-primary-subtle text-primary rounded-3">
                <i className="bi bi-bag-check fs-5"></i>
              </div>
            </div>
            <h4 className="fw-bold text-dark mb-1">{totalSold} cái</h4>
            <small className="text-primary fw-medium">
              Từ top sản phẩm bán chạy
            </small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium text-uppercase">Kênh Thanh Toán</span>
              <div className="p-2 bg-warning-subtle text-warning-emphasis rounded-3">
                <i className="bi bi-credit-card-2-front fs-5"></i>
              </div>
            </div>
            <h4 className="fw-bold text-dark mb-1">{data.paymentRevenue?.length || 2} phương thức</h4>
            <small className="text-muted">COD & VNPay</small>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small fw-medium text-uppercase">Trạng Thái Hệ Thống</span>
              <div className="p-2 bg-info-subtle text-info-emphasis rounded-3">
                <i className="bi bi-shield-check fs-5"></i>
              </div>
            </div>
            <h4 className="fw-bold text-success mb-1">Ổn Định 100%</h4>
            <small className="text-muted">Node.js Express + MySQL</small>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <span className="spinner-border text-success" role="status"></span>
          <p className="mt-2 text-muted small">Đang tổng hợp dữ liệu thống kê...</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Biểu đồ doanh thu theo tháng */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-bar-chart-line-fill text-success me-2"></i>
                  Doanh Thu Theo Tháng (VND)
                </h5>
                <span className="badge bg-light text-secondary border">Năm {data.year}</span>
              </div>
              <MonthlyRevenueChart data={data.monthlyRevenue} />
            </div>
          </div>

          {/* Doanh thu theo phương thức thanh toán */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold text-dark mb-3">
                <i className="bi bi-pie-chart-fill text-primary me-2"></i>
                Phương Thức Thanh Toán
              </h5>
              <div className="d-flex align-items-center justify-content-center p-2" style={{ maxHeight: "300px" }}>
                <PaymentMethodChart data={data.paymentRevenue} />
              </div>
            </div>
          </div>

          {/* Top 5 sản phẩm bán chạy nhất */}
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-trophy-fill text-warning me-2"></i>
                  Top 5 Sản Phẩm Bán Chạy Nhất
                </h5>
                <Link to="/admin/products" className="text-success text-decoration-none small fw-semibold">
                  Xem tất cả sản phẩm
                </Link>
              </div>
              <TopProductChart data={data.topProducts} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;
