import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatImagePath } from "../utils/image";
import { useToast } from "../context/ToastContext";
import ProductDetailModal from "../components/admin/ProductDetailModal";

const ProductListAdmin = () => {
  const { showToast, showConfirm } = useToast();
  const [products, setProducts] = useState([]);
  const [showBox, setShowBox] = useState(false);
  const [product, setProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);

  // State cho bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get(
        `/products?page=${page}&search=${encodeURIComponent(searchTerm)}&category=${selectedCategory}`
      );
      setProducts(res.data.products || res.data.data || []);
      setTotalPage(res.data.totalPages || 0);
      setPage(res.data.currentPage || page);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    }
  }, [page, searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (error) {
      console.warn("Lỗi tải danh mục:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Gọi danh mục 1 lần khi mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Xử lý tìm kiếm (Enter hoặc bấm nút)
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const formatCurrency = (value) => {
    if (isNaN(Number(value)) || value === null) return "0 VND";
    return Number(value).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Handle delete product
  const handleDeleteProduct = (productId) => async () => {
    const isConfirm = await showConfirm(
      "Xác nhận xoá sản phẩm",
      "Bạn có chắc chắn muốn xóa sản phẩm này cùng toàn bộ biến thể và hình ảnh liên quan?"
    );
    if (!isConfirm) return;
    try {
      await api.delete(`/products/${productId}`);
      showToast("Đã xóa sản phẩm thành công!", "success");
      fetchProducts();
    } catch (error) {
      console.error(error);
      showToast("Không thể xóa sản phẩm lúc này", "error");
    }
  };

  return (
    <>
      <ProductDetailModal showBox={showBox} product={product} onCloseBox={() => setShowBox(false)} />
      <h1>Quản lí sản phẩm</h1>

      {/* Thanh công cụ: Tìm kiếm, Lọc, Thêm mới */}
      <div className="card p-3 mb-4 shadow-sm">
        <div className="row g-3">
          <div className="col-md-4">
            <form onSubmit={handleSearch} className="d-flex">
              <input 
                type="text" 
                className="form-control me-2" 
                placeholder="Tìm tên sản phẩm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-primary" type="submit"><i className="bi bi-search"></i></button>
            </form>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              value={selectedCategory} 
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            >
              <option value="">-- Tất cả danh mục --</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-5 text-end">
            <Link to="/admin/add_products" className="btn btn-primary"><i className="bi bi-plus-lg"></i> Thêm sản phẩm</Link>
          </div>
        </div>
      </div>

      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th width="100px">Hình ảnh</th>
            <th width="300px">Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th></th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products ?
            products.map((product) => (
              <tr key={product.product_id}>
                <td><strong>#{product.product_id}</strong></td>
                <td>
                  <img src={formatImagePath(product.image_url)} alt={product.name} width="100px" />
                </td>
                <td>{product.name}</td>
                <td>
                  <small className="bg-success text-white px-1 rounded">{product.category_name}</small>
                  
                </td>
                <td>
                  {product.price > 50000 ? (
                    <span className="bg-success">
                      {formatCurrency(product.price)}

                    </span>
                  )
                    : (<span>
                      {formatCurrency(product.price)}

                    </span>
                  )}
                </td>
                <td>
                  <button className="btn btn-outline-success btn-sm"
                    onClick={() => {
                      setShowBox(true);
                      setProduct(product);
                    }}
                  >
                    Xem chi tiết
                  </button>
                </td>
                <td>
                  <div className="d-flex">
                    <Link to={`/admin/update_product/${product.product_id}`} className="btn btn-outline-primary btn-sm me-3">Edit</Link>
                    <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteProduct(product.product_id)}>Delete</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-muted">
                  <strong>Không có sản phẩm nào</strong>
                </td>
              </tr>
            )}
        </tbody>
      </table>

      {/* Phân trang */}
      {totalPage > 1 && (
        <nav aria-label="Page navigation" className="d-flex justify-content-center mt-4">
          <ul className="pagination">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(prev => Math.max(prev - 1, 1))}>
                Trước
              </button>
            </li>
            
            {[...Array(totalPage)].map((_, index) => (
              <li key={index + 1} className={`page-item ${page === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${page === totalPage ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(prev => Math.min(prev + 1, totalPage))}>
                Sau
              </button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default ProductListAdmin;
