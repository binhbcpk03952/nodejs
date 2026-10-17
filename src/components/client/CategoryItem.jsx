import React from "react";
import { Link, useSearchParams } from "react-router-dom";

const CategoryItem = ({ category }) => {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category");
  const isActive = String(currentCategory) === String(category.category_id);

  return (
    <li className="list-unstyled">
      <Link
        to={`/products?page=1&category=${category.category_id}`}
        className={`d-flex align-items-center justify-content-between p-2 rounded-3 text-decoration-none small fw-medium transition-all ${
          isActive
            ? "bg-success text-white shadow-sm fw-bold"
            : "text-secondary hover-green"
        }`}
      >
        <span>{category.name}</span>
        {category.children && category.children.length > 0 && (
          <i className={`bi bi-chevron-down small ${isActive ? "text-white" : "text-muted"}`}></i>
        )}
      </Link>

      {category.children && category.children.length > 0 && (
        <ul className="list-unstyled ps-3 mt-1 d-flex flex-column gap-1 border-start ms-2">
          {category.children.map((child) => (
            <CategoryItem key={child.category_id} category={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CategoryItem;
