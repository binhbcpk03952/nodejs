const db = require('../demo_db_connection');

// Helper lấy hoặc tự động tạo giỏ hàng cho user
function getUserCartId(userId, cb) {
  if (!userId) {
    return cb(new Error("Yêu cầu thông tin người dùng"), null);
  }
  db.query('SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1', [userId], (err, rows) => {
    if (err) return cb(err, null);
    if (rows && rows.length > 0) {
      return cb(null, rows[0].cart_id);
    }
    // Chưa có thì tạo mới
    db.query('INSERT INTO carts (user_id, created_at) VALUES (?, NOW())', [userId], (errInsert, result) => {
      if (errInsert) return cb(errInsert, null);
      return cb(null, result.insertId);
    });
  });
}

exports.getCartItems = (req, res) => {
  // Lấy user_id từ token đã xác thực
  const userId = req.user ? req.user.user_id : null;

  if (!userId) {
    // Nếu khách vãng lai chưa đăng nhập, trả về giỏ rỗng an toàn
    return res.status(200).json([]);
  }

  getUserCartId(userId, (errCart, cartId) => {
    if (errCart) return res.status(500).json({ error: 'Không thể truy cập giỏ hàng: ' + errCart.message });

    const sql = `
      SELECT  
        ca_item.cart_item_id, 
        MIN(p_img.image_url) AS image_url1, 
        p.product_id,
        p.name, 
        p.category_id, 
        p_va.color,      
        p_va.size,
        p_va.price,
        p_va.variant_id,
        ca_item.quantity,
        p_va.stock
      FROM carts ca
      JOIN cart_items ca_item ON ca.cart_id = ca_item.cart_id
      JOIN product_variants p_va ON ca_item.variant_id = p_va.variant_id
      JOIN products p ON p_va.product_id = p.product_id
      LEFT JOIN product_images p_img ON p.product_id = p_img.product_id
      WHERE ca.cart_id = ?
      GROUP BY
        ca_item.cart_item_id,
        p.product_id,
        p.name,
        p.category_id,
        p_va.color,
        p_va.size,
        p_va.price,
        p_va.variant_id,
        ca_item.quantity,
        p_va.stock
      ORDER BY ca_item.added_at DESC;
    `;

    db.query(sql, [cartId], (err, data) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(data || []);
    });
  });
};

exports.addToCart = (req, res) => {
  const userId = req.user ? req.user.user_id : null;
  if (!userId) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' });
  }

  const { variant_id, quantity } = req.body;
  const numVariantId = parseInt(variant_id, 10);
  const numQuantity = parseInt(quantity, 10);

  if (!numVariantId || isNaN(numQuantity) || numQuantity <= 0) {
    return res.status(400).json({ error: 'Thông tin biến thể hoặc số lượng không hợp lệ' });
  }

  // 1. Kiểm tra biến thể và tồn kho
  db.query('SELECT variant_id, stock, price FROM product_variants WHERE variant_id = ?', [numVariantId], (errVar, vars) => {
    if (errVar) return res.status(500).json({ error: errVar.message });
    if (!vars || vars.length === 0) {
      return res.status(404).json({ error: 'Biến thể sản phẩm không tồn tại' });
    }

    const currentStock = vars[0].stock;
    if (currentStock <= 0) {
      return res.status(400).json({ error: 'Sản phẩm đã tạm hết hàng' });
    }

    // 2. Lấy giỏ hàng của chính user
    getUserCartId(userId, (errCart, cartId) => {
      if (errCart) return res.status(500).json({ error: errCart.message });

      // 3. Kiểm tra sản phẩm đã có trong giỏ chưa
      const checkQuery = 'SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?';
      db.query(checkQuery, [cartId, numVariantId], (errCheck, rows) => {
        if (errCheck) return res.status(500).json({ error: errCheck.message });

        if (rows && rows.length > 0) {
          const newQty = rows[0].quantity + numQuantity;
          if (newQty > currentStock) {
            return res.status(400).json({
              error: `Số lượng yêu cầu (${newQty}) vượt quá tồn kho hiện có (${currentStock})`
            });
          }
          db.query('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [newQty, rows[0].cart_item_id], (errUpd) => {
            if (errUpd) return res.status(500).json({ error: errUpd.message });
            return res.status(200).json({ message: 'Đã cập nhật số lượng trong giỏ hàng', cart_item_id: rows[0].cart_item_id });
          });
        } else {
          if (numQuantity > currentStock) {
            return res.status(400).json({
              error: `Số lượng yêu cầu (${numQuantity}) vượt quá tồn kho hiện có (${currentStock})`
            });
          }
          db.query('INSERT INTO cart_items (cart_id, variant_id, quantity, added_at) VALUES (?, ?, ?, NOW())', [cartId, numVariantId, numQuantity], (errIns, insRes) => {
            if (errIns) return res.status(500).json({ error: errIns.message });
            return res.status(201).json({ message: 'Đã thêm sản phẩm vào giỏ hàng', cart_item_id: insRes.insertId });
          });
        }
      });
    });
  });
};

exports.updateCartItem = (req, res) => {
  const userId = req.user ? req.user.user_id : null;
  if (!userId) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để cập nhật giỏ hàng' });
  }

  const cartItemId = parseInt(req.params.id, 10);
  const { quantity } = req.body;
  const numQuantity = parseInt(quantity, 10);

  if (!cartItemId || isNaN(numQuantity)) {
    return res.status(400).json({ error: 'Dữ liệu cập nhật không hợp lệ' });
  }

  // Xác minh cart_item thuộc giỏ hàng của chính user này (Ownership Check)
  const verifySql = `
    SELECT ci.cart_item_id, ci.quantity, pv.stock 
    FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.cart_id
    JOIN product_variants pv ON ci.variant_id = pv.variant_id
    WHERE ci.cart_item_id = ? AND c.user_id = ?
  `;

  db.query(verifySql, [cartItemId, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Mặt hàng trong giỏ không tồn tại hoặc bạn không có quyền sửa đổi' });
    }

    if (numQuantity <= 0) {
      db.query('DELETE FROM cart_items WHERE cart_item_id = ?', [cartItemId], (errDel) => {
        if (errDel) return res.status(500).json({ error: errDel.message });
        return res.status(200).json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
      });
      return;
    }

    const stock = rows[0].stock;
    if (numQuantity > stock) {
      return res.status(400).json({ error: `Số lượng trong kho chỉ còn ${stock} sản phẩm` });
    }

    db.query('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [numQuantity, cartItemId], (errUpd) => {
      if (errUpd) return res.status(500).json({ error: errUpd.message });
      return res.status(200).json({ message: 'Cập nhật số lượng thành công' });
    });
  });
};

exports.deleteCartItem = (req, res) => {
  const userId = req.user ? req.user.user_id : null;
  if (!userId) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để thao tác' });
  }

  const cartItemId = parseInt(req.params.id, 10);
  if (!cartItemId) {
    return res.status(400).json({ error: 'ID mặt hàng không hợp lệ' });
  }

  // Ràng buộc ownership: Chỉ xóa nếu thuộc giỏ hàng của user
  const deleteSql = `
    DELETE ci FROM cart_items ci
    JOIN carts c ON ci.cart_id = c.cart_id
    WHERE ci.cart_item_id = ? AND c.user_id = ?
  `;

  db.query(deleteSql, [cartItemId, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mặt hàng không tồn tại hoặc bạn không có quyền xóa' });
    }
    return res.status(200).json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  });
};