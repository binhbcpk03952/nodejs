import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { formatImagePath } from "../utils/image";
import { useToast } from "../context/ToastContext";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, confirm } = useToast();
  const productId = Number(id);

  // Negative counter for new unsaved items
  const tempCounterRef = useRef(-1);
  const getTempId = () => {
    const nextId = tempCounterRef.current;
    tempCounterRef.current -= 1;
    return nextId;
  };

  const [productData, setProductData] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [newImageFile, setNewImageFile] = useState(null);
  const [currentMainImageId, setCurrentMainImageId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [warningVariant, setWarningVariant] = useState("");

  const [imageDelete, setImageDelete] = useState([]);
  const [variantDelete, setVariantDelete] = useState([]);

  // Fetch product data
  const fetchProduct = useCallback(async (pid) => {
    if (!pid) return;
    try {
      const res = await api.get(`/products/${pid}`);
      if (res.data) {
        setProductData(res.data);
        const mainImg = res.data.images?.find((img) => img.is_main === 1);
        setCurrentMainImageId(
          mainImg?.image_id || res.data.images?.[0]?.image_id || null
        );
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết sản phẩm:", err);
      showToast("Không tìm thấy thông tin sản phẩm!", "danger");
    }
  }, [showToast]);

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/categories`);
      setCategoryItems(res.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchProduct(productId);
    fetchCategories();
  }, [productId, fetchProduct]);

  // Handle basic fields
  const handleBasicInfoChange = (field, value) => {
    setProductData((prev) => ({
      ...prev,
      product: {
        ...prev.product,
        [field]: value,
      },
    }));
  };

  // Check duplicate variants
  useEffect(() => {
    if (!productData || !productData.variants) return;
    setWarningVariant("");
    const variants = productData.variants;

    for (let i = 0; i < variants.length; i++) {
      for (let j = i + 1; j < variants.length; j++) {
        const a = variants[i];
        const b = variants[j];
        if (
          a.color?.trim().toLowerCase() === b.color?.trim().toLowerCase() &&
          a.size?.trim().toLowerCase() === b.size?.trim().toLowerCase()
        ) {
          setWarningVariant(`⚠️ Trùng màu "${a.color}" và size "${a.size}"!`);
          return;
        }
      }
    }
  }, [productData]);

  const addVariant = () => {
    const newVariant = {
      variant_id: getTempId(),
      product_id: productId,
      color: "",
      size: "",
      price: productData?.product?.price || 0,
      stock: 0,
      is_new: true,
    };

    setProductData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant],
    }));
  };

  const removeVariant = (variantId) => {
    confirm("Bạn có chắc chắn muốn xóa biến thể này?", () => {
      if (variantId > 0) {
        setVariantDelete((prev) => [...prev, variantId]);
      }
      setProductData((prev) => ({
        ...prev,
        variants: prev.variants.filter((v) => v.variant_id !== variantId),
      }));
      showToast("Đã xóa biến thể khỏi danh sách", "info");
    });
  };

  const handleVariantChange = (variantId, field, value) => {
    setProductData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.variant_id === variantId ? { ...v, [field]: value } : v
      ),
    }));
  };

  // Logic images
  const handleImageUpload = () => {
    if (!newImageFile || !productData) return;

    const tempUrl = URL.createObjectURL(newImageFile);
    const newId = getTempId();
    const isFirstImage = !productData.images || productData.images.length === 0;

    if (isFirstImage) setCurrentMainImageId(newId);

    const newImage = {
      image_id: newId,
      product_id: productId,
      image_url: tempUrl,
      is_main: isFirstImage ? 1 : 0,
      file_object: newImageFile,
      is_new: true,
    };

    setProductData((prev) => ({
      ...prev,
      images: [...(prev.images || []), newImage],
    }));

    setNewImageFile(null);
    const fileInput = document.getElementById("newImage");
    if (fileInput) fileInput.value = "";
    showToast("Đã tải ảnh lên bộ nhớ tạm, nhấn Lưu để hoàn tất", "info");
  };

  const handleRemoveImage = (imageId) => {
    confirm("Bạn có chắc chắn muốn xóa hình ảnh này?", () => {
      if (imageId > 0) {
        setImageDelete((prev) => [...prev, imageId]);
      }

      setProductData((prev) => {
        const updatedImages = prev.images.filter((img) => img.image_id !== imageId);
        if (currentMainImageId === imageId) {
          const nextMain = updatedImages[0]?.image_id || null;
          setCurrentMainImageId(nextMain);
        }
        return { ...prev, images: updatedImages };
      });
      showToast("Đã xóa ảnh", "info");
    });
  };

  // Submit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!productData) return;

    if (warningVariant) {
      showToast("Vui lòng xử lý trùng lặp biến thể trước khi lưu!", "warning");
      return;
    }

    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("name", productData.product.name);
      formData.append("description", productData.product.description || "");
      formData.append("price", productData.product.price);
      formData.append("category_id", productData.product.category_id);

      const newVariants = productData.variants.filter((v) => v.is_new);
      const oldVariants = productData.variants.filter((v) => !v.is_new);

      formData.append("variants_old", JSON.stringify(oldVariants));
      formData.append("variants_new", JSON.stringify(newVariants));
      formData.append("variant_delete", JSON.stringify(variantDelete));

      const newImgs = productData.images.filter((img) => img.is_new && img.file_object);
      newImgs.forEach((img) => {
        formData.append("images", img.file_object);
      });

      formData.append("delete_images", JSON.stringify(imageDelete));

      if (currentMainImageId) {
        formData.append("main_image_id", currentMainImageId);
      }

      await api.post(`/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Cập nhật sản phẩm thành công!", "success");
      setImageDelete([]);
      setVariantDelete([]);
      await fetchProduct(productId);
    } catch (error) {
      console.error("Lỗi:", error);
      showToast(error.response?.data?.error || "Cập nhật sản phẩm thất bại.", "danger");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!productData) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Đang tải dữ liệu sản phẩm...</div>
      </div>
    );
  }

  const { product, variants = [], images = [] } = productData;

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Cập Nhật Sản Phẩm</h3>
          <p className="text-muted small mb-0">Chỉnh sửa thông tin, hình ảnh và phân loại biến thể</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/admin/products")}
        >
          <i className="bi bi-arrow-left me-1"></i> Quay lại danh sách
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="row g-4">
        {/* LEFT COLUMN */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-header bg-white py-3 fw-bold border-bottom">
              <i className="bi bi-info-circle text-primary me-2"></i> Thông Tin Chung
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold">Tên Sản Phẩm *</label>
                <input
                  type="text"
                  className="form-control"
                  value={product.name}
                  onChange={(e) => handleBasicInfoChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Danh Mục</label>
                <select
                  className="form-select"
                  value={product.category_id || ""}
                  onChange={(e) => handleBasicInfoChange("category_id", Number(e.target.value))}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categoryItems.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Giá Bán Niêm Yết (VNĐ) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={product.price}
                    onChange={(e) => handleBasicInfoChange("price", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-0">
                <label className="form-label fw-semibold">Mô Tả Chi Tiết</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={product.description || ""}
                  onChange={(e) => handleBasicInfoChange("description", e.target.value)}
                  placeholder="Nhập thông số kỹ thuật, mô tả vợt hoặc phụ kiện..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* VARIANTS */}
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
              <span className="fw-bold">
                <i className="bi bi-palette text-success me-2"></i> Danh Sách Biến Thể ({variants.length})
              </span>
              <button type="button" className="btn btn-sm btn-success rounded-pill px-3" onClick={addVariant}>
                <i className="bi bi-plus-lg me-1"></i> Thêm biến thể
              </button>
            </div>
            <div className="card-body p-0">
              {warningVariant && (
                <div className="alert alert-warning m-3 py-2">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {warningVariant}
                </div>
              )}
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "30%" }}>Màu Sắc</th>
                      <th style={{ width: "25%" }}>Kích Cỡ / Trọng Lượng</th>
                      <th style={{ width: "25%" }}>Giá Biến Thể (VNĐ)</th>
                      <th style={{ width: "15%" }}>Tồn Kho</th>
                      <th style={{ width: "5%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          Chưa có biến thể nào. Vui lòng thêm ít nhất 1 biến thể.
                        </td>
                      </tr>
                    ) : (
                      variants.map((v) => (
                        <tr key={v.variant_id}>
                          <td>
                            <input
                              className="form-control form-control-sm"
                              placeholder="Trắng/Đỏ, Xanh..."
                              value={v.color || ""}
                              onChange={(e) => handleVariantChange(v.variant_id, "color", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className="form-control form-control-sm"
                              placeholder="3U-G5, 4U-G5..."
                              value={v.size || ""}
                              onChange={(e) => handleVariantChange(v.variant_id, "size", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={v.price}
                              onChange={(e) => handleVariantChange(v.variant_id, "price", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={v.stock}
                              onChange={(e) => handleVariantChange(v.variant_id, "stock", e.target.value)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger border-0"
                              onClick={() => removeVariant(v.variant_id)}
                              title="Xóa biến thể"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - IMAGES */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-header bg-white py-3 fw-bold border-bottom">
              <i className="bi bi-images text-info me-2"></i> Hình Ảnh Sản Phẩm ({images.length})
            </div>
            <div className="card-body p-3">
              <div className="mb-3">
                <input
                  type="file"
                  id="newImage"
                  accept="image/*"
                  className="form-control mb-2"
                  onChange={(e) => setNewImageFile(e.target.files[0])}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary w-100"
                  disabled={!newImageFile}
                  onClick={handleImageUpload}
                >
                  <i className="bi bi-cloud-arrow-up me-1"></i> Tải Thêm Ảnh Này
                </button>
              </div>

              <div className="row g-2">
                {images.map((img) => (
                  <div key={img.image_id} className="col-6 position-relative">
                    <div
                      className={`border rounded-3 p-1 position-relative ${
                        currentMainImageId === img.image_id ? "border-primary border-2 shadow-sm" : ""
                      }`}
                    >
                      <img
                        src={img.is_new ? img.image_url : formatImagePath(img.image_url)}
                        className="img-fluid rounded"
                        style={{ height: "110px", width: "100%", objectFit: "cover" }}
                        alt="Product"
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle py-0 px-2 shadow"
                        onClick={() => handleRemoveImage(img.image_id)}
                        title="Xóa ảnh"
                      >
                        &times;
                      </button>
                      <div className="text-center mt-2 small">
                        <label className="d-flex align-items-center justify-content-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="mainImg"
                            checked={currentMainImageId === img.image_id}
                            onChange={() => setCurrentMainImageId(img.image_id)}
                          />
                          <span className={currentMainImageId === img.image_id ? "text-primary fw-bold" : "text-muted"}>
                            Ảnh đại diện
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-3 p-3">
            <button type="submit" className="btn btn-primary btn-lg w-100 mb-2 fw-bold" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Đang lưu thay đổi...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-1"></i> Lưu Thay Đổi
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-light w-100 text-muted"
              onClick={() => navigate("/admin/products")}
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;