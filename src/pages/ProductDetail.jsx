import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatImagePath } from "../utils/image";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState({});
  const [productRelated, setProductRelated] = useState([]);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProductRelated = useCallback(async (productId) => {
    try {
      const res = await api.get(`/products/related/${productId}`);
      setProductRelated(res.data || []);
    } catch (error) {
      console.warn("Lỗi tải sản phẩm liên quan:", error);
    }
  }, []);

  const fetchProduct = useCallback(async (productId) => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${productId}`);
      const data = res.data;

      setProduct(data.product || {});
      setImages(data.images || []);
      setVariants(data.variants || []);

      if (data.images && data.images.length > 0) {
        const main = data.images.find((img) => img.is_main === 1) || data.images[0];
        setMainImage(main.image_url);
      }

      if (data.variants && data.variants.length > 0) {
        const firstColor = data.variants[0].color;
        setSelectedColor(firstColor);
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết sản phẩm:", error);
      if (error.response && error.response.status === 404) {
        setIsNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchProductRelated(id);
      window.scrollTo(0, 0);
    }
  }, [id, fetchProduct, fetchProductRelated]);

  // Danh sách màu sắc duy nhất
  const uniqueColors = [...new Set(variants.map((v) => v.color))];

  // Danh sách kích thước theo màu sắc được chọn
  const uniqueSizes = useMemo(() => {
    const sizesByColor = variants
      .filter((v) => v.color === selectedColor)
      .map((v) => v.size);
    return [...new Set(sizesByColor)];
  }, [variants, selectedColor]);

  // Set kích thước đầu tiên khi màu thay đổi
  useEffect(() => {
    if (uniqueSizes.length > 0) {
      setSelectedSize(uniqueSizes[0]);
    } else {
      setSelectedSize(null);
    }
  }, [uniqueSizes]);

  // Thông tin biến thể hiện tại
  const selectedVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const handleQuantityChange = (delta) => {
    const maxStock = selectedVariant ? selectedVariant.stock : 99;
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxStock) {
        showToast(`Kho chỉ còn ${maxStock} sản phẩm`, 'warning');
        return maxStock;
      }
      return next;
    });
  };

  const handleAddToCart = async (goToCheckout = false) => {
    if (!selectedVariant) {
      showToast("Vui lòng chọn màu sắc và phân loại sản phẩm trước khi thêm", "warning");
      return;
    }
    if (selectedVariant.stock <= 0) {
      showToast("Sản phẩm đã tạm hết hàng trong kho", "warning");
      return;
    }

    try {
      setAdding(true);
      const res = await api.post("/cart", {
        variant_id: selectedVariant.variant_id,
        quantity: quantity,
      });

      if (res.status === 200 || res.status === 201) {
        await fetchCart(); // Cập nhật ngay badge giỏ hàng
        if (goToCheckout) {
          navigate("/checkout");
        } else {
          showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, "success");
        }
      }
    } catch {
      showToast("Không thể thêm vào giỏ hàng lúc này", "error");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <span className="spinner-border text-success" role="status"></span>
        <p className="mt-2 text-muted">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="container text-center py-5 mt-4">
        <div className="display-1 fw-bold text-success opacity-50">404</div>
        <h2 className="mb-3 fw-bold">Không Tìm Thấy Sản Phẩm</h2>
        <p className="text-secondary mb-4">
          Sản phẩm bạn đang tìm kiếm có thể đã tạm hết hàng hoặc đường dẫn không chính xác.
        </p>
        <Link to="/products" className="btn btn-success rounded-pill px-4 py-2">
          <i className="bi bi-arrow-left me-2"></i> Quay lại danh mục sản phẩm
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.price || 0;
  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;

  return (
    <div className="product-detail-page py-3">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/products" className="text-secondary text-decoration-none">Sản phẩm</Link></li>
          <li className="breadcrumb-item active text-dark fw-medium" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* Cột trái: Hình ảnh sản phẩm */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-3">
            <div style={{ height: "380px" }} className="d-flex align-items-center justify-content-center">
              <img
                src={formatImagePath(mainImage)}
                alt={product.name}
                className="img-fluid object-fit-contain"
                style={{ maxHeight: "360px", maxWidth: "100%" }}
              />
            </div>
          </div>

          {/* Thumbnails */}
          {images && images.length > 1 && (
            <div className="d-flex gap-2 overflow-auto py-2">
              {images.map((image) => (
                <button
                  key={image.image_id}
                  type="button"
                  onClick={() => setMainImage(image.image_url)}
                  className={`btn p-1 border rounded-3 bg-white ${
                    mainImage === image.image_url ? "border-success border-2 shadow-sm" : "border-light-subtle"
                  }`}
                  style={{ width: "70px", height: "70px" }}
                >
                  <img
                    src={formatImagePath(image.image_url)}
                    alt="thumbnail"
                    className="w-100 h-100 object-fit-contain rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cột phải: Thông tin sản phẩm & Đặt mua */}
        <div className="col-lg-6">
          <div className="ps-lg-2">
            <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill small fw-semibold mb-2">
              🏸 100% CHÍNH HÃNG NÚI XANH
            </span>
            <h1 className="h3 fw-bold text-dark mb-2">{product.name}</h1>

            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="text-warning small">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <span className="text-secondary ms-1">(4.9/5 dựa trên 120+ lượt mua)</span>
              </div>
            </div>

            {/* Giá sản phẩm */}
            <div className="bg-light p-3 rounded-4 mb-4 d-flex align-items-baseline gap-3">
              <span className="text-danger fw-bold fs-3">
                {formatCurrency(currentPrice)}
              </span>
              <span className="text-muted text-decoration-line-through small">
                {formatCurrency(currentPrice * 1.15)}
              </span>
              <span className="badge bg-danger small">Tiết kiệm 15%</span>
            </div>

            {/* Chọn Màu Sắc */}
            {uniqueColors.length > 0 && (
              <div className="mb-4">
                <label className="form-label fw-bold small text-secondary text-uppercase d-block mb-2">
                  Màu sắc: <strong className="text-dark">{selectedColor}</strong>
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-2 ${
                        selectedColor === color
                          ? "btn-success shadow-sm"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chọn Kích Thước / Phân Loại */}
            {uniqueSizes.length > 0 && (
              <div className="mb-4">
                <label className="form-label fw-bold small text-secondary text-uppercase d-block mb-2">
                  Kích thước / Trọng lượng: <strong className="text-dark">{selectedSize}</strong>
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-2 ${
                        selectedSize === size
                          ? "btn-success shadow-sm"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trạng thái kho */}
            <div className="mb-4">
              {selectedVariant ? (
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${selectedVariant.stock > 0 ? "bg-success" : "bg-danger"}`}>
                    {selectedVariant.stock > 0 ? "Còn hàng" : "Hết hàng"}
                  </span>
                  <small className="text-muted">
                    {selectedVariant.stock > 0
                      ? `(Còn ${selectedVariant.stock} sản phẩm sẵn có)`
                      : "Sản phẩm tạm thời hết hàng"}
                  </small>
                </div>
              ) : (
                <small className="text-muted">Vui lòng chọn biến thể để kiểm tra kho</small>
              )}
            </div>

            {/* Số lượng */}
            <div className="mb-4">
              <label className="form-label fw-bold small text-secondary text-uppercase d-block mb-2">
                Số lượng:
              </label>
              <div className="d-flex align-items-center gap-2">
                <div className="btn-group border rounded-pill bg-white p-1" role="group">
                  <button
                    type="button"
                    className="btn btn-sm btn-light rounded-circle"
                    style={{ width: "36px", height: "36px" }}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <span className="d-flex align-items-center justify-content-center px-3 fw-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-light rounded-circle"
                    style={{ width: "36px", height: "36px" }}
                    onClick={() => handleQuantityChange(1)}
                    disabled={isOutOfStock}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Nút Mua hàng & Thêm giỏ */}
            <div className="row g-2 mb-4">
              <div className="col-sm-6">
                <button
                  type="button"
                  className="btn btn-outline-success btn-lg w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  onClick={() => handleAddToCart(false)}
                  disabled={adding || isOutOfStock}
                >
                  <i className="bi bi-cart-plus fs-5"></i>
                  {adding ? "Đang thêm..." : "Thêm Vào Giỏ"}
                </button>
              </div>
              <div className="col-sm-6">
                <button
                  type="button"
                  className="btn btn-success btn-lg w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                  onClick={() => handleAddToCart(true)}
                  disabled={adding || isOutOfStock}
                >
                  <i className="bi bi-lightning-charge-fill"></i> Mua Ngay
                </button>
              </div>
            </div>

            {/* Chính sách ưu đãi tại Núi Xanh */}
            <div className="border rounded-4 p-3 bg-light-subtle small text-secondary">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-shield-check text-success fs-5"></i>
                <span>Cam kết chính hãng 100% - Bảo hành khung vợt 90 ngày</span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-tools text-primary fs-5"></i>
                <span>Tặng 01 lần căng cước hoặc quấn cán chính hãng</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-truck text-warning-emphasis fs-5"></i>
                <span>Miễn phí giao hàng đơn từ 1.000.000đ toàn quốc</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thông số kỹ thuật & Mô tả chi tiết */}
      <div className="mt-5">
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <h4 className="fw-bold mb-4 text-dark border-bottom pb-3">Mô Tả & Thông Số Kỹ Thuật</h4>
          <div className="row g-4">
            <div className="col-lg-7">
              <p className="text-secondary leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                {product.description || "Sản phẩm cầu lông chính hãng phân phối tại hệ thống Núi Xanh Badminton. Thiết kế hiện đại, bền bỉ, hỗ trợ tối đa cho từng pha đập cầu uy lực và điều cầu chính xác."}
              </p>
            </div>
            <div className="col-lg-5">
              <div className="bg-light p-4 rounded-4">
                <h6 className="fw-bold text-dark mb-3">Thông số tham khảo:</h6>
                <table className="table table-sm table-borderless small mb-0">
                  <tbody>
                    <tr>
                      <td className="text-secondary">Trọng lượng / Chu vi cán:</td>
                      <td className="fw-semibold">3U/4U - G5</td>
                    </tr>
                    <tr>
                      <td className="text-secondary">Độ cứng đũa vợt:</td>
                      <td className="fw-semibold">Trung bình (Medium)</td>
                    </tr>
                    <tr>
                      <td className="text-secondary">Điểm cân bằng:</td>
                      <td className="fw-semibold">295 ± 3mm (Hơi nặng đầu)</td>
                    </tr>
                    <tr>
                      <td className="text-secondary">Sức căng khuyến nghị:</td>
                      <td className="fw-semibold text-danger">20 - 28 LBS (9 - 12.5kg)</td>
                    </tr>
                    <tr>
                      <td className="text-secondary">Lối đánh phù hợp:</td>
                      <td className="fw-semibold text-success">Công thủ toàn diện / Tấn công</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sản phẩm tương tự */}
      {productRelated && productRelated.length > 0 && (
        <div className="mt-5">
          <h4 className="fw-bold text-dark mb-4">Sản Phẩm Tương Tự Bạn Có Thể Thích</h4>
          <div className="row g-4">
            {productRelated.map((item) => (
              <div className="col-6 col-md-4 col-lg-3" key={item.product_id}>
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card bg-white">
                  <Link
                    to={`/products/${item.product_id}`}
                    className="p-3 text-center d-block bg-light"
                    style={{ height: "200px" }}
                  >
                    <img
                      src={formatImagePath(item.image_url)}
                      alt={item.name}
                      className="w-100 h-100 object-fit-contain"
                    />
                  </Link>
                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="card-title fw-bold text-dark text-truncate mb-1" title={item.name}>
                        <Link to={`/products/${item.product_id}`} className="text-dark text-decoration-none">
                          {item.name}
                        </Link>
                      </h6>
                      <p className="card-text text-danger fw-bold mb-3">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <Link
                      to={`/products/${item.product_id}`}
                      className="btn btn-outline-success btn-sm rounded-pill w-100"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
