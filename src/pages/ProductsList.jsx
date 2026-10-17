import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { formatImagePath } from "../utils/image";
import CategoryList from "../components/client/CategoryList";

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("all");

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";

  const fetchProducts = useCallback(async (page, category, search, sort, range) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/products?page=${page}&category=${category}&search=${encodeURIComponent(search)}&sortBy=${sort}&priceRange=${range}`
      );

      const items = res.data.products || res.data.data || [];
      setProducts(items);
      setTotalPage(res.data.totalPages || 1);
      setTotalProducts(res.data.totalProducts || 0);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, currentCategory, currentSearch, sortBy, priceRange);
  }, [currentPage, currentCategory, currentSearch, sortBy, priceRange, fetchProducts]);

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const params = Object.fromEntries(prev);
      return { ...params, page: newPage };
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
    setSearchParams((prev) => {
      const params = Object.fromEntries(prev);
      return { ...params, page: 1 };
    });
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setSearchParams((prev) => {
      const params = Object.fromEntries(prev);
      return { ...params, page: 1 };
    });
  };

  const handleClearFilter = () => {
    setSearchParams({});
    setPriceRange("all");
    setSortBy("default");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  return (
    <div className="product-list-page pb-5">
      {/* Title & Filter Summary */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 my-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            🏸 Danh Sách Sản Phẩm
            {totalProducts > 0 && (
              <span className="text-secondary fs-6 fw-normal ms-2">
                ({totalProducts} sản phẩm)
              </span>
            )}
          </h2>
          {currentSearch && (
            <small className="text-muted">
              Kết quả tìm kiếm cho: "<strong>{currentSearch}</strong>"{" "}
              <button className="btn btn-link btn-sm text-danger p-0 ms-2" onClick={handleClearFilter}>
                Xoá tìm kiếm
              </button>
            </small>
          )}
        </div>

        {/* Bộ lọc sắp xếp & giá */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Lọc khoảng giá */}
          <select
            className="form-select form-select-sm rounded-pill shadow-none"
            style={{ width: "170px" }}
            value={priceRange}
            onChange={(e) => handlePriceRangeChange(e.target.value)}
          >
            <option value="all">Tất cả mức giá</option>
            <option value="under1m">Dưới 1 triệu</option>
            <option value="1m-2m">1 triệu - 2 triệu</option>
            <option value="2m-3m">2 triệu - 3 triệu</option>
            <option value="over3m">Trên 3 triệu</option>
          </select>

          {/* Sắp xếp */}
          <select
            className="form-select form-select-sm rounded-pill shadow-none"
            style={{ width: "160px" }}
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="default">Mới nhất</option>
            <option value="priceAsc">Giá tăng dần</option>
            <option value="priceDesc">Giá giảm dần</option>
            <option value="nameAsc">Tên A-Z</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {/* Cột trái: Cây Danh mục */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white sticky-top" style={{ top: "85px" }}>
            <h5 className="fw-bold text-dark border-bottom pb-2 mb-2">
              <i className="bi bi-grid-fill text-success me-2"></i> Danh Mục
            </h5>
            <CategoryList />
          </div>
        </div>

        {/* Cột phải: Lưới sản phẩm */}
        <div className="col-lg-9">
          {loading ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm">
              <span className="spinner-border text-success" role="status"></span>
              <p className="text-muted mt-2 small">Đang tải sản phẩm...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="row g-4">
                {products.map((product) => (
                  <div className="col-6 col-md-4" key={product.product_id}>
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card bg-white position-relative">
                      <Link
                        to={`/products/${product.product_id}`}
                        className="text-decoration-none d-block overflow-hidden p-3 bg-light text-center"
                        style={{ height: "220px" }}
                      >
                        <img
                          src={formatImagePath(product.image_url)}
                          alt={product.name}
                          className="w-100 h-100 object-fit-contain transition-transform"
                        />
                      </Link>

                      <div className="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                          {product.category_name && (
                            <span className="badge bg-light text-secondary border small mb-1">
                              {product.category_name}
                            </span>
                          )}
                          <h6 className="card-title fw-bold text-dark text-truncate mb-2" title={product.name}>
                            <Link to={`/products/${product.product_id}`} className="text-dark text-decoration-none">
                              {product.name}
                            </Link>
                          </h6>
                          <p className="card-text text-danger fw-bold fs-5 mb-3">
                            {formatCurrency(product.price)}
                          </p>
                        </div>

                        <Link
                          to={`/products/${product.product_id}`}
                          className="btn btn-outline-success btn-sm w-100 rounded-pill fw-medium d-flex align-items-center justify-content-center gap-1"
                        >
                          <i className="bi bi-eye"></i> Xem Chi Tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phân trang */}
              {totalPage > 1 && (
                <nav aria-label="Page navigation" className="d-flex justify-content-center mt-5">
                  <ul className="pagination pagination-sm gap-1">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link rounded-pill px-3" onClick={() => handlePageChange(currentPage - 1)}>
                        <i className="bi bi-chevron-left me-1"></i> Trước
                      </button>
                    </li>

                    {[...Array(totalPage)].map((_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                        <button
                          className={`page-link rounded-circle ${currentPage === i + 1 ? "bg-success border-success text-white" : ""}`}
                          style={{ width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPage ? "disabled" : ""}`}>
                      <button className="page-link rounded-pill px-3" onClick={() => handlePageChange(currentPage + 1)}>
                        Sau <i className="bi bi-chevron-right ms-1"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <i className="bi bi-box-seam display-3 text-muted mb-3 opacity-50"></i>
              <h5 className="fw-bold text-dark mb-1">Không tìm thấy sản phẩm nào</h5>
              <p className="text-secondary small mb-4">
                Thử thay đổi bộ lọc mức giá hoặc chọn danh mục khác xem sao nhé!
              </p>
              <div>
                <button className="btn btn-outline-success rounded-pill px-4" onClick={handleClearFilter}>
                  Đặt lại tất cả bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
