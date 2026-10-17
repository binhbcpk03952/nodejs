import React, { useState, useEffect } from "react";
import { formatImagePath } from "../../utils/image";

const ProductDetailModal = ({ showBox, product, onCloseBox }) => {
  const [currentDisplayImage, setCurrentDisplayImage] = useState(null);

  // Format tiền
  const formatCurrency = (value) => {
    if (isNaN(Number(value)) || value === null) return "0 VND";
    return Number(value).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Khi product thay đổi → set ảnh chính
  useEffect(() => {
    if (product?.images?.length) {
      const mainImg =
        product.images.find((img) => img.is_main === 1) || product.images[0];
      setCurrentDisplayImage(mainImg);
    } else {
      setCurrentDisplayImage(null);
    }
  }, [product]);

  const handleThumbnailClick = (img) => {
    setCurrentDisplayImage(img);
  };

  if (!showBox || !product) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-3 p-4 pt-2">
          <div className="modal-header">
            <h5 className="modal-title text-primary fw-bold">
              <i className="bi bi-eye me-2"></i> Chi tiết sản phẩm (Admin)
            </h5>
            <button className="btn-close" onClick={onCloseBox}></button>
          </div>

          <div className="modal-body p-0">
            <div className="row">
              {/* Ảnh */}
              <div className="col-md-5 my-3">
                <div className="main-img border rounded mb-2 p-2 text-center">
                  {currentDisplayImage && (
                    <img
                      src={formatImagePath(currentDisplayImage.image_url)}
                      alt={product.name}
                      className="img-fluid rounded-1"
                      style={{ maxHeight: "350px" }}
                    />
                  )}
                </div>

                <div className="thumbnail-list d-flex gap-2 overflow-auto">
                  {product.images?.map((img) => (
                    <img
                      key={img.image_id}
                      src={formatImagePath(img.image_url)}
                      onClick={() => handleThumbnailClick(img)}
                      className={`img-thumbnail rounded-3 ${
                        img.image_id === currentDisplayImage?.image_id
                          ? "border-success border-2"
                          : ""
                      }`}
                      style={{
                        width: 70,
                        height: 70,
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      alt="thumb"
                    />
                  ))}
                </div>
              </div>

              {/* Thông tin */}
              <div className="col-md-7 mt-3">
                <h4 className="fw-bold">{product.name}</h4>

                <div className="price mb-3">
                  <span className="text-danger fw-bolder fs-3">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                <p>
                  <strong>ID:</strong> {product.product_id}
                </p>
                <p>
                  <strong>Danh mục:</strong> {product.category_name}
                </p>
                <p>
                  <strong>Ngày tạo:</strong> {product.created_at}
                </p>

                <h6 className="fw-bold">Mô tả:</h6>
                <p className="small text-muted">{product.description}</p>

                <h6 className="fw-bold text-primary mt-3">
                  Biến thể ({product.variants?.length || 0})
                </h6>

                <div
                  className="border rounded p-3"
                  style={{ maxHeight: 200, overflowY: "auto" }}
                >
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Màu</th>
                        <th>Size</th>
                        <th className="text-end">Giá</th>
                        <th className="text-end">Kho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants?.map((v) => (
                        <tr key={v.variant_id}>
                          <td><strong>#{v.variant_id}</strong></td>
                          <td>{v.color}</td>
                          <td>{v.size}</td>
                          <td className="text-end">
                            {formatCurrency(v.price)}
                          </td>
                          <td className="text-end">
                            <span
                              className={`fw-bold ${
                                v.stock === 0 ? "text-danger" : "text-success"
                              }`}
                            >
                              {v.stock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
