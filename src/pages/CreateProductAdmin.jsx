import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const initialProductState = {
  nameProduct: "",
  price: 0,
  description: "",
  category_id: null,
  images: [], // Lưu trữ File objects
  imagePreview: [], // Lưu trữ URL preview
  variants: [
    {
      color: "",
      sizes: [{ size: "", stock: 0, price: 0 }],
    },
  ],
};

const CreateProductAdmin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(initialProductState);
  const [error, setError] = useState({});
  const fileInputRef = useRef(null); // Ref cho input file

  // --- API Calls ---

  const handleFetchCategories = useCallback(async () => {
    try {
      const res = await api.get(`/categories`);

      if (res.status === 200 && res.data) {
        setCategories(res.data);
      } else {
        console.error("Không thể lấy dữ liệu danh mục");
      }
    } catch (err) {
      console.error("Lỗi khi gọi API categories:", err);
    }
  }, []);

  useEffect(() => {
    handleFetchCategories();
  }, [handleFetchCategories]);

  // --- Form Handlers ---

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!product.nameProduct) {
      newErrors.nameProduct = "Tên sản phẩm là bắt buộc.";
      isValid = false;
    }
    if (!product.price || product.price <= 0) {
      newErrors.price = "Giá sản phẩm phải lớn hơn 0.";
      isValid = false;
    }
    if (!product.category_id) {
      newErrors.category_id = "Vui lòng chọn danh mục sản phẩm.";
      isValid = false;
    }
    if (!product.images || product.images.length === 0) {
      newErrors.images = "Vui lòng tải lên ít nhất một hình ảnh.";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Xử lý giá trị number
    const newValue = name === "price" ? parseFloat(value) : value;

    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: newValue,
    }));
  };

  const handleCategoryChange = (e) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      category_id: parseInt(e.target.value), // Đảm bảo là number
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    // Tạo URLs preview và lưu trữ File objects
    const previewUrls = files.map((file) => URL.createObjectURL(file));

    setProduct((prevProduct) => ({
      ...prevProduct,
      images: files,
      imagePreview: previewUrls,
    }));
  };

  // Clean up preview URLs khi component unmount
  useEffect(() => {
    return () => {
      product.imagePreview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [product.imagePreview]);

  // --- Variants Handlers ---

  const handleVariantChange = (vIndex, field, value) => {
    const newVariants = [...product.variants];
    newVariants[vIndex][field] = value;
    setProduct((prevProduct) => ({
      ...prevProduct,
      variants: newVariants,
    }));
  };

  const handleSizeChange = (vIndex, sIndex, field, value) => {
    const newVariants = [...product.variants];
    // Xử lý giá trị number cho stock và price
    const newValue =
      field === "stock" || field === "price" ? parseInt(value) : value;

    newVariants[vIndex].sizes[sIndex][field] = newValue;
    setProduct((prevProduct) => ({
      ...prevProduct,
      variants: newVariants,
    }));
  };

  const addVariant = () => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      variants: [
        ...prevProduct.variants,
        {
          color: "",
          sizes: [{ size: "", stock: 0, price: 0 }],
        },
      ],
    }));
  };

  const removeSize = (vIndex, sIndex) => {
    const newVariants = [...product.variants];
    newVariants[vIndex].sizes.splice(sIndex, 1);
    setProduct((prevProduct) => ({
      ...prevProduct,
      variants: newVariants,
    }));
  };

  const addSize = (vIndex) => {
    const newVariants = [...product.variants];
    newVariants[vIndex].sizes.push({ size: "", stock: 0, price: 0 });
    setProduct((prevProduct) => ({
      ...prevProduct,
      variants: newVariants,
    }));
  };

  // --- Submit Handler ---

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("name", product.nameProduct);
    formData.append("price", product.price);
    formData.append("description", product.description);
    formData.append("category_id", product.category_id);
    // Chuyển đổi object variants thành chuỗi JSON
    formData.append("variants", JSON.stringify(product.variants));
    // Thêm các file hình ảnh
      product.images.forEach((img) => formData.append("images", img));
      // console.log(formData);
      console.log('Dữ liệu FormData đã chuẩn bị để gửi đi:');
    for (let [key, value] of formData.entries()) {
        console.log(`- ${key}:`, value);
    }
    try {
      const response = await api.post(`/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        showToast("Thêm sản phẩm mới thành công!", "success");
        navigate("/admin/products");
      } else {
        showToast("Đã xảy ra lỗi khi thêm sản phẩm", "error");
      }
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm:", err);
      showToast(err.response?.data?.error || "Đã xảy ra lỗi khi thêm sản phẩm", "error");
    }
  };

  // --- Render (JSX) ---

  const renderCategories = (items) => {
    return items.map((cat) => (
      <li key={cat.category_id} className="mb-2">
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            id={`cat-${cat.category_id}`}
            name="category_id"
            value={cat.category_id}
            checked={product.category_id === parseInt(cat.category_id)}
            onChange={handleCategoryChange}
          />
          <label
            className="form-check-label fw-semibold"
            htmlFor={`cat-${cat.category_id}`}
          >
            {cat.name}
          </label>
        </div>

        {cat.children && cat.children.length > 0 && (
          <ul className="ms-4 list-unstyled">
            {cat.children.map((child) => (
              <li key={child.category_id} className="mt-1">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id={`child-${child.category_id}`}
                    name="category_id"
                    value={child.category_id}
                    checked={
                      product.category_id === parseInt(child.category_id)
                    }
                    onChange={handleCategoryChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`child-${child.category_id}`}
                  >
                    {child.name}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <div className="container mt-4 mb-5">
      <h3 className="fw-bold text-primary mb-4">
        <i className="bi bi-plus-circle me-2"></i> Thêm sản phẩm mới
      </h3>

      <form onSubmit={handleAddProduct} className="row g-4">
        {/* THÔNG TIN CƠ BẢN */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white fw-semibold">
              <i className="bi bi-info-circle me-1"></i> Thông tin cơ bản
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Tên sản phẩm</label>
                <input
                  name="nameProduct"
                  value={product.nameProduct}
                  onChange={handleInputChange}
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên sản phẩm"
                />
                {error.nameProduct && (
                  <small className="text-danger">{error.nameProduct}</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Giá sản phẩm (₫)</label>
                <input
                  name="price"
                  value={product.price}
                  onChange={handleInputChange}
                  type="number"
                  className="form-control"
                  placeholder="Nhập giá sản phẩm"
                />
                {error.price && (
                  <small className="text-danger">{error.price}</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Mô tả sản phẩm</label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="4"
                  placeholder="Nhập mô tả chi tiết..."
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Danh mục sản phẩm</label>
                <div
                  className="border rounded p-3 bg-light"
                  style={{ maxHeight: "250px", overflowY: "auto" }}
                >
                  <ul className="list-unstyled mb-0">
                    {renderCategories(categories)}
                  </ul>
                </div>
                {error.category_id && (
                  <small className="text-danger">{error.category_id}</small>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* HÌNH ẢNH & BIẾN THỂ */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-success text-white fw-semibold">
              <i className="bi bi-images me-1"></i> Hình ảnh sản phẩm
            </div>
            <div className="card-body">
              <input
                type="file"
                multiple
                className="form-control mb-3"
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
              {product.imagePreview.length > 0 && (
                <div className="d-flex flex-wrap gap-2">
                  {product.imagePreview.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="rounded shadow-sm"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
              )}
            {error.images && (
                  <small className="text-danger">{error.images}</small>
                )}
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-warning fw-semibold">
              <i className="bi bi-palette me-1"></i> Biến thể sản phẩm
            </div>
            <div className="card-body">
              {product.variants.map((variant, vIndex) => (
                <div key={vIndex} className="mb-4 p-3 border rounded bg-light">
                  <div className="mb-2">
                    <label className="form-label">Màu sắc</label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) =>
                        handleVariantChange(vIndex, "color", e.target.value)
                      }
                      className="form-control"
                      placeholder="VD: Đỏ, Xanh..."
                    />
                  </div>

                  <table className="table table-sm align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th>Kích thước</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variant.sizes.map((size, sIndex) => (
                        <tr key={sIndex}>
                          <td>
                            <input
                              type="text"
                              value={size.size}
                              onChange={(e) =>
                                handleSizeChange(
                                  vIndex,
                                  sIndex,
                                  "size",
                                  e.target.value
                                )
                              }
                              className="form-control"
                              placeholder="VD: M, L, XL"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={size.stock}
                              onChange={(e) =>
                                handleSizeChange(
                                  vIndex,
                                  sIndex,
                                  "stock",
                                  e.target.value
                                )
                              }
                              className="form-control"
                              placeholder="Tồn kho"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={size.price}
                              onChange={(e) =>
                                handleSizeChange(
                                  vIndex,
                                  sIndex,
                                  "price",
                                  e.target.value
                                )
                              }
                              className="form-control"
                              placeholder="Giá"
                            />
                          </td>
                          <td>
                            {/* React dùng onClick và chuyển function vào */}
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeSize(vIndex, sIndex)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => addSize(vIndex)}
                  >
                    <i className="bi bi-plus-lg me-1"></i> Thêm kích thước
                  </button>
                </div>
              ))}

              <div className="text-end">
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={addVariant}
                >
                  <i className="bi bi-plus-circle me-1"></i> Thêm biến thể mới
                </button>
              </div>
            </div>
          </div>

          <div className="text-end mt-4">
            <button type="submit" className="btn btn-lg btn-primary px-4">
              <i className="bi bi-save me-1"></i> Lưu sản phẩm
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProductAdmin;
