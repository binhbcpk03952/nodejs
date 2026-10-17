import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { Link, useSearchParams } from "react-router-dom";
import CategoryItem from "./CategoryItem";

const CategoryList = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category");

  const fetchCategoryList = async () => {
    try {
      const res = await api.get("/categories");
      setCategoryList(res.data || []);
    } catch (error) {
      console.warn("Lỗi tải danh mục:", error);
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  return (
    <div className="category-menu">
      <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
        <li>
          <Link
            className={`d-flex align-items-center justify-content-between p-2 rounded-3 text-decoration-none small fw-semibold ${
              !currentCategory ? "bg-success text-white shadow-sm" : "text-dark hover-light"
            }`}
            to="/products?page=1"
          >
            <span>🏸 Tất cả sản phẩm</span>
          </Link>
        </li>
        {categoryList && categoryList.length > 0 &&
          categoryList.map((category) => (
            <CategoryItem key={category.category_id} category={category} />
          ))}
      </ul>
    </div>
  );
};

export default CategoryList;