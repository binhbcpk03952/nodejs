import React, { Suspense, lazy } from "react";
import { Routes, Route, Link } from "react-router-dom";

// Layouts
import ClientLayout from "./layouts/ClientLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";

// Core Client Pages
import HomeView from "./pages/HomeView";
import ProductList from "./pages/ProductsList";
import ProductDetail from "./pages/ProductDetail";
import Carts from "./pages/Carts";
import Checkout from "./pages/Checkout";

// Lazy-loaded Client Pages
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const AddAddress = lazy(() => import("./pages/AddAddress"));
const Login = lazy(() => import("./pages/Login"));

// Lazy-loaded Admin Pages (Tách biệt bundle quản trị và thư viện biểu đồ)
const DashboardAdmin = lazy(() => import("./pages/DashboardAdmin"));
const ProductListAdmin = lazy(() => import("./pages/ProductListAdmin"));
const CreateProductAdmin = lazy(() => import("./pages/CreateProductAdmin"));
const UpdateProduct = lazy(() => import("./pages/UpdateProduct"));
const OrderManagement = lazy(() => import("./pages/OrderManagement"));

// Component hiển thị khi đang tải trang lười (Suspense Fallback)
const PageLoader = () => (
  <div className="container py-5 text-center my-5">
    <div className="spinner-border text-success" role="status"></div>
    <div className="mt-2 text-muted small">Đang tải trang...</div>
  </div>
);

// 404 Not Found Component
const NotFound = () => (
  <div className="container py-5 text-center my-5">
    <div className="display-1 fw-bold text-success mb-3">404</div>
    <h2 className="fw-bold mb-3 text-dark">Không Tìm Thấy Trang</h2>
    <p className="text-muted mb-4">
      Trang bạn đang tìm kiếm có thể đã bị xóa hoặc đường dẫn không chính xác.
    </p>
    <Link to="/" className="btn btn-success rounded-pill px-4 py-2">
      <i className="bi bi-house-door me-2"></i> Trở về Trang Chủ
    </Link>
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<HomeView />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="carts" element={<Carts />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order_history" element={<OrderHistory />} />
          <Route path="order_success" element={<OrderSuccess />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="add_address" element={<AddAddress />} />
          <Route path="login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="products" element={<ProductListAdmin />} />
          <Route path="add_products" element={<CreateProductAdmin />} />
          <Route path="update_product/:id" element={<UpdateProduct />} />
          <Route path="order_management" element={<OrderManagement />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
