const db = require('../demo_db_connection');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const productCache = new NodeCache({ stdTTL: 60 });

// Helper xóa cache theo pattern
const clearCachePattern = (prefix) => {
  const keys = productCache.keys();
  const keysToDelete = keys.filter(key => key.includes(prefix));
  if (keysToDelete.length > 0) {
    productCache.del(keysToDelete);
  }
};

// Helper xóa danh sách file đã upload tạm thời khi có lỗi
const deleteUploadedFiles = (files) => {
  if (!files || !Array.isArray(files)) return;
  files.forEach(file => {
    if (file && file.path) {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (e) {
        console.warn("Không thể xóa file tạm:", file.path, e.message);
      }
    }
  });
};

/**
 * Lấy sản phẩm phân trang cũ (/by-page)
 */
exports.getProductByPage = (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  const limit = 9;
  if (page < 1) page = 1;
  const offset = (page - 1) * limit;

  const cacheKey = `products/by-page?page=${page}`;
  const cachedData = productCache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  db.query("SELECT COUNT(*) AS total FROM products", (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    if (page > totalPages && total > 0) {
      return res.status(404).json({ error: "Trang không tồn tại" });
    }

    const sql = `
      SELECT p.*, p_img.image_url 
      FROM products p 
      LEFT JOIN product_images p_img ON p.product_id = p_img.product_id AND p_img.is_main = 1
      ORDER BY p.product_id DESC 
      LIMIT ? OFFSET ?
    `;

    db.query(sql, [limit, offset], (errList, data) => {
      if (errList) return res.status(500).json({ error: errList.message });

      const result = {
        currentPage: page,
        totalPages,
        totalProducts: total,
        limit,
        data: data || []
      };

      productCache.set(cacheKey, result);
      return res.json(result);
    });
  });
};

/**
 * Lấy chi tiết sản phẩm kèm hình ảnh và biến thể
 */
exports.getProductById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "ID sản phẩm không hợp lệ" });

  const cacheKey = `products/${id}`;
  const cachedData = productCache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  db.query("SELECT * FROM products WHERE product_id = ?", [id], (err, productRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!productRows || productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productRows[0];

    db.query("SELECT * FROM product_images WHERE product_id = ? ORDER BY is_main DESC, image_id ASC", [id], (errImg, images) => {
      if (errImg) return res.status(500).json({ error: errImg.message });

      db.query("SELECT * FROM product_variants WHERE product_id = ? ORDER BY variant_id ASC", [id], (errVar, variants) => {
        if (errVar) return res.status(500).json({ error: errVar.message });

        const result = {
          product,
          images: images || [],
          variants: variants || []
        };

        productCache.set(cacheKey, result);
        return res.json(result);
      });
    });
  });
};

/**
 * Lấy sản phẩm liên quan
 */
exports.getProductRelated = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const limit = 4;
  if (!id) return res.status(400).json({ error: "ID sản phẩm không hợp lệ" });

  db.query("SELECT category_id FROM products WHERE product_id = ?", [id], (err, productRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!productRows || productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const categoryId = productRows[0].category_id;
    const sql = `
      SELECT 
        p.product_id,
        p.name,
        p.price,
        MIN(pi.image_url) AS image_url
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.product_id
      WHERE p.category_id = ? AND p.product_id != ?
      GROUP BY p.product_id, p.name, p.price
      LIMIT ?
    `;

    db.query(sql, [categoryId, id, limit], (errRel, data) => {
      if (errRel) return res.status(500).json({ error: errRel.message });
      return res.json(data || []);
    });
  });
};

/**
 * Lấy sản phẩm bán chạy nhất
 */
exports.getProdctBestSeller = (req, res) => {
  const limit = 4;
  const sql = `
    SELECT 
      p.product_id,
      p.name,
      p.price,
      MIN(p_img.image_url) AS image_url,
      COALESCE(SUM(o_it.quantity), 0) AS stock_selling
    FROM products p
    LEFT JOIN product_variants p_va ON p_va.product_id = p.product_id
    LEFT JOIN order_items o_it ON o_it.variant_id = p_va.variant_id
    LEFT JOIN product_images p_img ON p_img.product_id = p.product_id AND p_img.is_main = 1
    GROUP BY p.product_id, p.name, p.price
    ORDER BY stock_selling DESC, p.product_id DESC
    LIMIT ?
  `;

  db.query(sql, [limit], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data || []);
  });
};

/**
 * Danh sách sản phẩm có tìm kiếm, danh mục, lọc giá, sắp xếp và phân trang nhất quán
 */
exports.getProducts = async (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  const search = (req.query.search || "").trim();
  const category = (req.query.category || "").trim();
  const sortBy = req.query.sortBy || "default";
  const priceRange = req.query.priceRange || "all";
  const limit = 12;

  if (page < 1) page = 1;
  const offset = (page - 1) * limit;

  const cacheKey = `products?page=${page}&search=${search}&cat=${category}&sort=${sortBy}&range=${priceRange}`;
  const cachedData = productCache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  // Xây dựng điều kiện lọc chung
  const conditions = [];
  const queryParams = [];

  // Lọc tìm kiếm theo tên
  if (search) {
    conditions.push("p.name LIKE ?");
    queryParams.push(`%${search}%`);
  }

  // Lọc theo khoảng giá
  if (priceRange === "under1m") {
    conditions.push("p.price < 1000000");
  } else if (priceRange === "1m-2m") {
    conditions.push("p.price >= 1000000 AND p.price <= 2000000");
  } else if (priceRange === "2m-3m") {
    conditions.push("p.price >= 2000000 AND p.price <= 3000000");
  } else if (priceRange === "over3m") {
    conditions.push("p.price > 3000000");
  }

  // Xử lý thứ tự sắp xếp (Allowlist an toàn)
  let orderByClause = "ORDER BY p.product_id DESC";
  if (sortBy === "priceAsc") {
    orderByClause = "ORDER BY p.price ASC, p.product_id DESC";
  } else if (sortBy === "priceDesc") {
    orderByClause = "ORDER BY p.price DESC, p.product_id DESC";
  } else if (sortBy === "nameAsc") {
    orderByClause = "ORDER BY p.name ASC, p.product_id DESC";
  }

  const categoryIdNum = parseInt(category, 10);
  const hasCategory = !isNaN(categoryIdNum) && categoryIdNum > 0;

  let ctePrefix = "";
  let categoryFilterClause = "";
  const cteParams = [];

  if (hasCategory) {
    ctePrefix = `
      WITH RECURSIVE subcategories AS (
        SELECT category_id FROM categories WHERE category_id = ?
        UNION ALL
        SELECT c.category_id FROM categories c 
        INNER JOIN subcategories sc ON c.parent_id = sc.category_id
      )
    `;
    categoryFilterClause = "p.category_id IN (SELECT category_id FROM subcategories)";
    cteParams.push(categoryIdNum);
  }

  const allConditions = [...conditions];
  if (categoryFilterClause) {
    allConditions.push(categoryFilterClause);
  }

  const whereClause = allConditions.length > 0 ? `WHERE ${allConditions.join(" AND ")}` : "";

  // 1. Câu lệnh đếm COUNT(*)
  const countSql = `
    ${ctePrefix}
    SELECT COUNT(DISTINCT p.product_id) AS total 
    FROM products p
    ${whereClause}
  `;

  const countParams = [...cteParams, ...queryParams];

  db.query(countSql, countParams, (err, countResult) => {
    if (err) return res.status(500).json({ error: "Lỗi đếm số lượng: " + err.message });

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Luôn trả về object chuẩn nếu không có sản phẩm nào
    if (total === 0) {
      const emptyResult = {
        currentPage: page,
        totalPages: 0,
        totalProducts: 0,
        limit,
        products: []
      };
      productCache.set(cacheKey, emptyResult);
      return res.json(emptyResult);
    }

    // 2. Câu lệnh lấy danh sách sản phẩm phân trang
    const listSql = `
      ${ctePrefix}
      SELECT 
        p.product_id,
        p.category_id,
        p.name,
        p.description,
        p.price,
        p.created_at,
        MIN(p_img.image_url) AS image_url,
        cat.name AS category_name
      FROM products p
      LEFT JOIN product_images p_img ON p.product_id = p_img.product_id
      LEFT JOIN categories cat ON cat.category_id = p.category_id
      ${whereClause}
      GROUP BY p.product_id, p.category_id, p.name, p.description, p.price, p.created_at, cat.name
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const listParams = [...cteParams, ...queryParams, limit, offset];

    db.query(listSql, listParams, (errList, products) => {
      if (errList) return res.status(500).json({ error: "Lỗi truy vấn sản phẩm: " + errList.message });

      if (!products || products.length === 0) {
        return res.json({
          currentPage: page,
          totalPages,
          totalProducts: total,
          limit,
          products: []
        });
      }

      // 3. Tải kèm variants và images cho từng sản phẩm trong trang
      const tasks = products.map(product => {
        return new Promise((resolve, reject) => {
          db.query("SELECT * FROM product_variants WHERE product_id = ?", [product.product_id], (errVar, variants) => {
            if (errVar) return reject(errVar);
            product.variants = variants || [];

            db.query("SELECT * FROM product_images WHERE product_id = ?", [product.product_id], (errImg, images) => {
              if (errImg) return reject(errImg);
              product.images = images || [];
              resolve();
            });
          });
        });
      });

      Promise.all(tasks)
        .then(() => {
          const responseData = {
            currentPage: page,
            totalPages,
            totalProducts: total,
            limit,
            products
          };
          productCache.set(cacheKey, responseData);
          return res.json(responseData);
        })
        .catch(errTasks => res.status(500).json({ error: errTasks.message }));
    });
  });
};

/**
 * Thêm sản phẩm mới kèm ảnh và biến thể (Transactional Atomic)
 */
exports.createProduct = async (req, res) => {
  let { name, description, price, category_id, variants } = req.body;
  const files = req.files || [];

  // Parse variants JSON
  try {
    if (typeof variants === 'string') {
      variants = JSON.parse(variants);
    }
  } catch {
    deleteUploadedFiles(files);
    return res.status(400).json({ error: "Định dạng JSON của biến thể (variants) không hợp lệ" });
  }

  const numPrice = parseFloat(price);
  const numCategoryId = parseInt(category_id, 10);

  if (!name || isNaN(numPrice) || numPrice <= 0 || !numCategoryId || !Array.isArray(variants) || variants.length === 0) {
    deleteUploadedFiles(files);
    return res.status(400).json({ error: "Vui lòng điền đầy đủ tên, danh mục, giá hợp lệ và danh sách biến thể" });
  }

  // Validate ảnh với Sharp
  const MIN_WIDTH = 100;
  try {
    for (const file of files) {
      const meta = await sharp(file.path).metadata();
      if (!meta.width || meta.width < MIN_WIDTH) {
        throw new Error(`Chiều rộng ảnh phải lớn hơn hoặc bằng ${MIN_WIDTH}px`);
      }
    }
  } catch (err) {
    deleteUploadedFiles(files);
    return res.status(400).json({ error: err.message || "File ảnh không hợp lệ hoặc bị hỏng" });
  }

  let connWrapper;
  try {
    connWrapper = await db.getConnectionAsync();
  } catch (e) {
    deleteUploadedFiles(files);
    return res.status(500).json({ error: "Không thể kết nối cơ sở dữ liệu: " + e.message });
  }

  try {
    await connWrapper.beginTransaction();

    // 1. Insert product
    const insertProdSql = "INSERT INTO products (category_id, name, description, price, created_at) VALUES (?, ?, ?, ?, NOW())";
    const prodRes = await connWrapper.query(insertProdSql, [numCategoryId, name.trim(), description || '', numPrice]);
    const productId = prodRes.insertId;

    // 2. Insert images
    if (files.length > 0) {
      const imgValues = files.map((file, idx) => [
        productId,
        `/uploads/${path.basename(file.path)}`,
        idx === 0 ? 1 : 0
      ]);
      await connWrapper.query("INSERT INTO product_images (product_id, image_url, is_main, created_at) VALUES ?", [
        imgValues.map(v => [...v, new Date()])
      ]);
    }

    // 3. Insert variants
    const variantValues = [];
    variants.forEach(v => {
      if (Array.isArray(v.sizes)) {
        v.sizes.forEach(s => {
          variantValues.push([
            productId,
            v.color || 'Tiêu chuẩn',
            s.size || 'Tiêu chuẩn',
            parseInt(s.stock, 10) || 0,
            parseFloat(s.price) || numPrice,
            new Date()
          ]);
        });
      } else {
        variantValues.push([
          productId,
          v.color || 'Tiêu chuẩn',
          v.size || 'Tiêu chuẩn',
          parseInt(v.stock, 10) || 0,
          parseFloat(v.price) || numPrice,
          new Date()
        ]);
      }
    });

    if (variantValues.length > 0) {
      await connWrapper.query(
        "INSERT INTO product_variants (product_id, color, size, stock, price, created_at) VALUES ?",
        [variantValues]
      );
    }

    await connWrapper.commit();
    connWrapper.release();

    clearCachePattern('products');

    return res.status(201).json({
      message: "Tạo sản phẩm mới thành công",
      productId,
      product: { name, price: numPrice, category_id: numCategoryId }
    });

  } catch (err) {
    if (connWrapper) {
      try { await connWrapper.rollback(); } catch (_eRollback) { /* ignore rollback failure */ }
      connWrapper.release();
    }
    deleteUploadedFiles(files);
    console.error("Lỗi tạo sản phẩm:", err);
    return res.status(500).json({ error: "Lỗi khi lưu sản phẩm: " + err.message });
  }
};

/**
 * Cập nhật sản phẩm, ảnh và biến thể (Xóa ảnh có ràng buộc product_id, dọn dẹp file post-commit)
 */
exports.updateProduct = async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const files = req.files || [];
  const {
    name,
    description,
    price,
    category_id,
    variants_old,
    variants_new,
    variant_delete,
    delete_images,
    main_image_id
  } = req.body;

  if (!productId) {
    deleteUploadedFiles(files);
    return res.status(400).json({ error: "Mã sản phẩm không hợp lệ" });
  }

  let variantsOld = [];
  let variantsNew = [];
  let variantDelete = [];
  let deleteImages = [];

  try {
    if (typeof variants_old === 'string') variantsOld = JSON.parse(variants_old);
    else if (Array.isArray(variants_old)) variantsOld = variants_old;

    if (typeof variants_new === 'string') variantsNew = JSON.parse(variants_new);
    else if (Array.isArray(variants_new)) variantsNew = variants_new;

    if (variant_delete) {
      if (typeof variant_delete === 'string') variantDelete = JSON.parse(variant_delete);
      else if (Array.isArray(variant_delete)) variantDelete = variant_delete;
    }

    if (delete_images) {
      if (typeof delete_images === 'string') deleteImages = JSON.parse(delete_images);
      else if (Array.isArray(delete_images)) deleteImages = delete_images;
    }
  } catch {
    deleteUploadedFiles(files);
    return res.status(400).json({ error: "Định dạng JSON trong dữ liệu cập nhật không hợp lệ" });
  }

  // Validate ảnh mới với Sharp
  const MIN_WIDTH = 100;
  try {
    for (const file of files) {
      const meta = await sharp(file.path).metadata();
      if (!meta.width || meta.width < MIN_WIDTH) {
        throw new Error(`Chiều rộng ảnh phải lớn hơn hoặc bằng ${MIN_WIDTH}px`);
      }
    }
  } catch (err) {
    deleteUploadedFiles(files);
    return res.status(400).json({ error: err.message || "Ảnh tải lên không hợp lệ hoặc quá nhỏ" });
  }

  let connWrapper;
  try {
    connWrapper = await db.getConnectionAsync();
  } catch (e) {
    deleteUploadedFiles(files);
    return res.status(500).json({ error: "Lỗi kết nối database: " + e.message });
  }

  const filesToDeletePostCommit = [];

  try {
    await connWrapper.beginTransaction();

    // 1. Kiểm tra sản phẩm tồn tại
    const existing = await connWrapper.query("SELECT product_id FROM products WHERE product_id = ?", [productId]);
    if (!existing || existing.length === 0) {
      throw new Error("Sản phẩm không tồn tại để cập nhật");
    }

    // 2. Cập nhật thông tin cơ bản
    const numPrice = parseFloat(price);
    const numCatId = parseInt(category_id, 10);
    await connWrapper.query(
      "UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, updated_at = NOW() WHERE product_id = ?",
      [numCatId, name.trim(), description || '', numPrice, productId]
    );

    // 3. XÓA ẢNH ĐƯỢC CHỌN (BẮT BUỘC RÀNG BUỘC product_id VÀ CHỈ LƯU TÊN FILE VÀO MẢNG POST-COMMIT)
    if (Array.isArray(deleteImages) && deleteImages.length > 0) {
      const imgPlaceholders = deleteImages.map(() => '?').join(',');
      // Chỉ lấy ảnh THUỘC VỀ SẢN PHẨM NÀY
      const rows = await connWrapper.query(
        `SELECT image_id, image_url FROM product_images WHERE image_id IN (${imgPlaceholders}) AND product_id = ?`,
        [...deleteImages, productId]
      );

      for (const r of rows) {
        const filePath = path.join(__dirname, '../uploads/', path.basename(r.image_url));
        filesToDeletePostCommit.push(filePath);
      }

      await connWrapper.query(
        `DELETE FROM product_images WHERE image_id IN (${imgPlaceholders}) AND product_id = ?`,
        [...deleteImages, productId]
      );
    }

    // 4. Thêm ảnh mới tải lên
    if (files.length > 0) {
      for (const file of files) {
        const imageUrl = `/uploads/${path.basename(file.path)}`;
        await connWrapper.query(
          "INSERT INTO product_images (product_id, image_url, is_main, created_at) VALUES (?, ?, 0, NOW())",
          [productId, imageUrl]
        );
      }
    }

    // 5. Cập nhật ảnh chính (is_main)
    await connWrapper.query("UPDATE product_images SET is_main = 0 WHERE product_id = ?", [productId]);

    let mainId = null;
    if (main_image_id) {
      const mid = Number(main_image_id);
      if (mid > 0) {
        const checkMain = await connWrapper.query(
          "SELECT image_id FROM product_images WHERE image_id = ? AND product_id = ?",
          [mid, productId]
        );
        if (checkMain.length > 0) mainId = mid;
      }
    }

    if (!mainId) {
      const firstImg = await connWrapper.query(
        "SELECT image_id FROM product_images WHERE product_id = ? ORDER BY image_id ASC LIMIT 1",
        [productId]
      );
      if (firstImg.length > 0) mainId = firstImg[0].image_id;
    }

    if (mainId) {
      await connWrapper.query("UPDATE product_images SET is_main = 1 WHERE image_id = ? AND product_id = ?", [mainId, productId]);
    }

    // 6. Cập nhật biến thể cũ
    for (const v of variantsOld) {
      if (v.variant_id) {
        await connWrapper.query(
          "UPDATE product_variants SET color = ?, size = ?, stock = ?, price = ? WHERE variant_id = ? AND product_id = ?",
          [v.color || '', v.size || '', parseInt(v.stock, 10) || 0, parseFloat(v.price) || numPrice, v.variant_id, productId]
        );
      }
    }

    // 7. Xóa biến thể được yêu cầu xóa (ràng buộc product_id)
    if (variantDelete && variantDelete.length > 0) {
      const vPlaceholders = variantDelete.map(() => '?').join(',');
      await connWrapper.query(
        `DELETE FROM product_variants WHERE variant_id IN (${vPlaceholders}) AND product_id = ?`,
        [...variantDelete, productId]
      );
    }

    // 8. Thêm biến thể mới
    if (variantsNew && variantsNew.length > 0) {
      const toInsert = [];
      for (const v of variantsNew) {
        toInsert.push([
          productId,
          v.color || '',
          v.size || '',
          parseInt(v.stock, 10) || 0,
          parseFloat(v.price) || numPrice,
          new Date()
        ]);
      }
      if (toInsert.length > 0) {
        await connWrapper.query(
          "INSERT INTO product_variants (product_id, color, size, stock, price, created_at) VALUES ?",
          [toInsert]
        );
      }
    }

    // COMMIT GIAO DỊCH
    await connWrapper.commit();
    connWrapper.release();

    // CHỈ XÓA FILE TRÊN ĐĨA SAU KHI DB ĐÃ COMMIT THÀNH CÔNG (Post-commit Cleanup)
    filesToDeletePostCommit.forEach(fPath => {
      try {
        if (fs.existsSync(fPath)) fs.unlinkSync(fPath);
      } catch (errUnlink) {
        console.warn("Không thể xóa file ảnh cũ sau commit:", fPath, errUnlink.message);
      }
    });

    clearCachePattern('products');
    productCache.del(`products/${productId}`);

    return res.json({ message: "Cập nhật sản phẩm thành công", productId });

  } catch (err) {
    if (connWrapper) {
      try { await connWrapper.rollback(); } catch (_eRollback) { /* ignore rollback failure */ }
      connWrapper.release();
    }
    // Rollback DB: Không xóa ảnh cũ, chỉ xóa file mới tải lên bị lỗi
    deleteUploadedFiles(files);
    console.error("Lỗi cập nhật sản phẩm:", err);
    return res.status(500).json({ error: err.message || "Lỗi khi cập nhật sản phẩm" });
  }
};

/**
 * Xóa sản phẩm và dọn dẹp ảnh liên quan (Transactional Atomic)
 */
exports.deleteProduct = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: "ID sản phẩm không hợp lệ" });

  let connWrapper;
  try {
    connWrapper = await db.getConnectionAsync();
  } catch (e) {
    return res.status(500).json({ error: "Lỗi kết nối cơ sở dữ liệu: " + e.message });
  }

  const filesToDelete = [];

  try {
    await connWrapper.beginTransaction();

    // 1. Lấy danh sách đường dẫn ảnh của sản phẩm
    const images = await connWrapper.query("SELECT image_url FROM product_images WHERE product_id = ?", [id]);
    images.forEach(img => {
      const filePath = path.join(__dirname, '../uploads/', path.basename(img.image_url));
      filesToDelete.push(filePath);
    });

    // 2. Xóa các biến thể và ảnh trong DB (hoặc ON DELETE CASCADE)
    await connWrapper.query("DELETE FROM product_images WHERE product_id = ?", [id]);
    await connWrapper.query("DELETE FROM product_variants WHERE product_id = ?", [id]);
    await connWrapper.query("DELETE FROM products WHERE product_id = ?", [id]);

    await connWrapper.commit();
    connWrapper.release();

    // Post-commit: Dọn dẹp file vật lý
    filesToDelete.forEach(fPath => {
      try {
        if (fs.existsSync(fPath)) fs.unlinkSync(fPath);
      } catch (e) {
        console.warn("Không thể xóa file ảnh của sản phẩm đã xóa:", fPath, e.message);
      }
    });

    clearCachePattern('products');
    productCache.del(`products/${id}`);

    return res.status(200).json({ message: "Xóa sản phẩm thành công", productId: id });

  } catch (err) {
    if (connWrapper) {
      try { await connWrapper.rollback(); } catch (_eRollback) { /* ignore rollback failure */ }
      connWrapper.release();
    }
    console.error("Lỗi xóa sản phẩm:", err);
    return res.status(500).json({ error: "Lỗi khi xóa sản phẩm: " + err.message });
  }
};
