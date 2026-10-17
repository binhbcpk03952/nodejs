const db = require('../demo_db_connection');

/**
 * Lấy danh sách đơn hàng của người dùng hiện tại (Customer)
 */
exports.getOrders = (req, res) => {
  const userId = req.user ? req.user.user_id : null;
  if (!userId) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để xem lịch sử đơn hàng' });
  }

  const sql = `
    SELECT 
      o.order_id,
      o.user_id,
      u.name,
      adr.recipient_name,
      adr.phone,
      adr.address_line,
      adr.ward,
      adr.district,
      adr.province,
      o.total_amount,
      o.shipping_fee,
      o.discount_amount,
      o.final_amount,
      o.payment_method,
      o.payment_status,
      o.note,
      o.status,
      o.created_at,
      o.promotion_id
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    LEFT JOIN addresses adr ON adr.address_id = o.address_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [userId], (err, orders) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn đơn hàng: ' + err.message });
    if (!orders || orders.length === 0) {
      return res.status(200).json([]);
    }

    const tasks = orders.map(order => {
      return new Promise((resolve, reject) => {
        const sqlOrderItems = `
          SELECT 
            oi.order_item_id,
            MIN(pi.image_url) AS image_url,
            p.name,
            pv.color,
            pv.size,
            oi.price,
            oi.variant_id,
            oi.quantity
          FROM order_items oi
          JOIN product_variants pv ON pv.variant_id = oi.variant_id
          JOIN products p ON p.product_id = pv.product_id
          LEFT JOIN product_images pi ON pi.product_id = p.product_id
          WHERE oi.order_id = ?
          GROUP BY 
            oi.order_item_id,
            p.name,
            pv.color,
            pv.size,
            oi.price,
            oi.variant_id,
            oi.quantity
        `;

        db.query(sqlOrderItems, [order.order_id], (errItems, items) => {
          if (errItems) return reject(errItems);
          order.order_items = items || [];
          resolve();
        });
      });
    });

    Promise.all(tasks)
      .then(() => res.status(200).json(orders))
      .catch(errTasks => res.status(500).json({ error: errTasks.message }));
  });
};

/**
 * Lấy chi tiết một đơn hàng theo ID (có kiểm tra quyền sở hữu)
 */
exports.getOrderById = (req, res) => {
  const userId = req.user ? req.user.user_id : null;
  const isAdmin = req.user?.role === 'admin';
  const orderId = parseInt(req.params.id, 10);

  if (!orderId) {
    return res.status(400).json({ error: 'Mã đơn hàng không hợp lệ' });
  }

  const sql = `
    SELECT 
      o.order_id,
      o.user_id,
      u.name,
      adr.recipient_name,
      adr.phone,
      adr.address_line,
      adr.ward,
      adr.district,
      adr.province,
      o.total_amount,
      o.shipping_fee,
      o.discount_amount,
      o.final_amount,
      o.payment_method,
      o.payment_status,
      o.note,
      o.status,
      o.created_at,
      o.promotion_id
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    LEFT JOIN addresses adr ON adr.address_id = o.address_id
    WHERE o.order_id = ?
  `;

  db.query(sql, [orderId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    const order = rows[0];

    // Ownership check: Chỉ chủ đơn hàng hoặc Admin mới được xem
    if (!isAdmin && order.user_id !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền truy cập đơn hàng này' });
    }

    const sqlOrderItems = `
      SELECT 
        oi.order_item_id,
        MIN(pi.image_url) AS image_url,
        p.name,
        pv.color,
        pv.size,
        oi.price,
        oi.variant_id,
        oi.quantity
      FROM order_items oi
      JOIN product_variants pv ON pv.variant_id = oi.variant_id
      JOIN products p ON p.product_id = pv.product_id
      LEFT JOIN product_images pi ON pi.product_id = p.product_id
      WHERE oi.order_id = ?
      GROUP BY 
        oi.order_item_id,
        p.name,
        pv.color,
        pv.size,
        oi.price,
        oi.variant_id,
        oi.quantity
    `;

    db.query(sqlOrderItems, [order.order_id], (errItems, items) => {
      if (errItems) return res.status(500).json({ error: errItems.message });
      order.order_items = items || [];
      return res.status(200).json(order);
    });
  });
};

/**
 * Lấy toàn bộ danh sách đơn hàng cho Admin (có phân trang & lọc)
 */
exports.getAllOrders = (req, res) => {
  let page = parseInt(req.query.page, 10) || 1;
  const limit = 10;
  if (page < 1) page = 1;
  const offset = (page - 1) * limit;

  const statusFilter = req.query.status || '';
  const searchFilter = req.query.search || '';

  let whereClauses = [];
  let queryParams = [];

  if (statusFilter && statusFilter !== 'all') {
    whereClauses.push('o.status = ?');
    queryParams.push(statusFilter);
  }

  if (searchFilter) {
    whereClauses.push('(o.order_id = ? OR u.name LIKE ? OR adr.recipient_name LIKE ? OR adr.phone LIKE ?)');
    const idVal = parseInt(searchFilter, 10) || 0;
    const likeVal = `%${searchFilter}%`;
    queryParams.push(idVal, likeVal, likeVal, likeVal);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) AS total 
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    LEFT JOIN addresses adr ON adr.address_id = o.address_id
    ${whereSql}
  `;

  db.query(countSql, queryParams, (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const listSql = `
      SELECT 
        o.order_id,
        o.user_id,
        u.name,
        adr.recipient_name,
        adr.phone,
        adr.address_line,
        adr.ward,
        adr.district,
        adr.province,
        o.total_amount,
        o.shipping_fee,
        o.discount_amount,
        o.final_amount,
        o.payment_method,
        o.payment_status,
        o.note,
        o.status,
        o.created_at,
        o.promotion_id
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN addresses adr ON adr.address_id = o.address_id
      ${whereSql}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    db.query(listSql, [...queryParams, limit, offset], (errList, data) => {
      if (errList) return res.status(500).json({ error: errList.message });

      if (!data || data.length === 0) {
        return res.json({
          data: [],
          pagination: { currentPage: page, totalPages, totalOrders: total, limit }
        });
      }

      const tasks = data.map(order => {
        return new Promise((resolve, reject) => {
          const sqlOrderItems = `
            SELECT 
              oi.order_item_id,
              MIN(pi.image_url) AS image_url,
              p.name,
              pv.color,
              pv.size,
              oi.price,
              oi.variant_id,
              oi.quantity
            FROM order_items oi
            JOIN product_variants pv ON pv.variant_id = oi.variant_id
            JOIN products p ON p.product_id = pv.product_id
            LEFT JOIN product_images pi ON pi.product_id = p.product_id
            WHERE oi.order_id = ?
            GROUP BY 
              oi.order_item_id,
              p.name,
              pv.color,
              pv.size,
              oi.price,
              oi.variant_id,
              oi.quantity
          `;

          db.query(sqlOrderItems, [order.order_id], (errItems, items) => {
            if (errItems) return reject(errItems);
            order.order_items = items || [];
            resolve();
          });
        });
      });

      Promise.all(tasks)
        .then(() => {
          res.status(200).json({
            data,
            pagination: { currentPage: page, totalPages, totalOrders: total, limit }
          });
        })
        .catch(errTasks => res.status(500).json({ error: errTasks.message }));
    });
  });
};

/**
 * Đặt hàng an toàn (Server-Side Price Calculation, Stock Check, Transaction Atomic)
 */
exports.addOrder = async (req, res) => {
  const userId = req.user ? req.user.user_id : null;
  if (!userId) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để hoàn tất đặt hàng' });
  }

  const {
    address_id,
    payment_method = 'cod',
    note = '',
    promotion_id = null,
    items
  } = req.body;

  if (!address_id) {
    return res.status(400).json({ error: 'Vui lòng chọn địa chỉ giao hàng' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Giỏ hàng của bạn đang trống' });
  }

  // 1. Xác thực địa chỉ giao hàng thuộc về chính user đang đăng nhập
  const addressRows = await new Promise((resolve, reject) => {
    db.query('SELECT address_id FROM addresses WHERE address_id = ? AND user_id = ?', [address_id, userId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  }).catch(e => {
    console.error("Lỗi kiểm tra địa chỉ:", e);
    return null;
  });

  if (!addressRows || addressRows.length === 0) {
    return res.status(400).json({ error: 'Địa chỉ nhận hàng không hợp lệ hoặc không thuộc về bạn' });
  }

  let connWrapper;
  try {
    connWrapper = await db.getConnectionAsync();
  } catch (errPool) {
    return res.status(500).json({ error: 'Không thể kết nối cơ sở dữ liệu: ' + errPool.message });
  }

  try {
    await connWrapper.beginTransaction();

    let serverSubtotal = 0;
    const validatedItems = [];

    // 2. Duyệt qua từng sản phẩm, khóa dòng kiểm tra giá thật và tồn kho thật trong DB
    for (const item of items) {
      const vId = parseInt(item.variant_id, 10);
      const qty = parseInt(item.quantity, 10);

      if (!vId || isNaN(qty) || qty <= 0) {
        throw new Error('Dữ liệu mặt hàng không hợp lệ');
      }

      // Khóa dòng biến thể để tránh oversell trong các request đồng thời
      const variantRows = await connWrapper.query(
        `SELECT pv.variant_id, pv.product_id, pv.stock, pv.price, p.name 
         FROM product_variants pv 
         JOIN products p ON pv.product_id = p.product_id 
         WHERE pv.variant_id = ? 
         FOR UPDATE`,
        [vId]
      );

      if (!variantRows || variantRows.length === 0) {
        throw new Error(`Sản phẩm mã biến thể #${vId} không còn tồn tại`);
      }

      const vData = variantRows[0];
      if (vData.stock < qty) {
        throw new Error(`Sản phẩm "${vData.name}" chỉ còn ${vData.stock} sản phẩm trong kho (bạn chọn ${qty})`);
      }

      const verifiedPrice = Number(vData.price);
      serverSubtotal += verifiedPrice * qty;

      validatedItems.push({
        variant_id: vId,
        quantity: qty,
        price: verifiedPrice
      });
    }

    // 3. Tính toán khuyến mãi trên Server
    let discountAmount = 0;
    let promoId = null;

    if (promotion_id) {
      const pId = parseInt(promotion_id, 10);
      if (pId > 0) {
        const promoRows = await connWrapper.query(
          'SELECT * FROM promotions WHERE promotion_id = ? AND is_active = 1',
          [pId]
        );

        if (promoRows && promoRows.length > 0) {
          const promo = promoRows[0];
          const now = new Date();
          const isValidDate = (!promo.start_date || new Date(promo.start_date) <= now) &&
                              (!promo.end_date || new Date(promo.end_date) >= now);

          if (isValidDate && serverSubtotal >= Number(promo.min_order_amount || 0)) {
            promoId = promo.promotion_id;
            if (promo.discount_type === 'percent') {
              discountAmount = Math.round(serverSubtotal * (Number(promo.discount_value) / 100));
              if (promo.max_discount && discountAmount > Number(promo.max_discount)) {
                discountAmount = Number(promo.max_discount);
              }
            } else {
              discountAmount = Number(promo.discount_value);
            }
          }
        }
      }
    }

    if (discountAmount > serverSubtotal) {
      discountAmount = serverSubtotal;
    }

    // 4. Phí vận chuyển (Chính sách: Miễn phí nếu subtotal >= 2.000.000đ, ngược lại 30.000đ)
    const shippingFee = serverSubtotal >= 2000000 ? 0 : 30000;
    const finalAmount = Math.max(0, serverSubtotal + shippingFee - discountAmount);

    // 5. Thêm bản ghi đơn hàng
    const sqlOrder = `
      INSERT INTO orders 
      (user_id, address_id, total_amount, shipping_fee, discount_amount, final_amount, promotion_id, payment_method, payment_status, note, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?, 'pending', NOW())
    `;

    const orderRes = await connWrapper.query(sqlOrder, [
      userId,
      address_id,
      serverSubtotal,
      shippingFee,
      discountAmount,
      finalAmount,
      promoId,
      payment_method,
      note
    ]);

    const orderId = orderRes.insertId;

    // 6. Ghi chi tiết đơn hàng và trừ kho ngay lập tức
    for (const vItem of validatedItems) {
      await connWrapper.query(
        'INSERT INTO order_items (order_id, variant_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, vItem.variant_id, vItem.quantity, vItem.price]
      );

      // Trừ kho nguyên tử
      await connWrapper.query(
        'UPDATE product_variants SET stock = stock - ? WHERE variant_id = ?',
        [vItem.quantity, vItem.variant_id]
      );
    }

    // 7. Xóa các sản phẩm trong giỏ hàng của chính user
    await connWrapper.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.cart_id
       WHERE c.user_id = ?`,
      [userId]
    );

    // Commit toàn bộ giao dịch
    await connWrapper.commit();
    connWrapper.release();

    return res.status(201).json({
      message: 'Đặt hàng thành công',
      order_id: orderId,
      total_amount: serverSubtotal,
      shipping_fee: shippingFee,
      discount_amount: discountAmount,
      final_amount: finalAmount
    });

  } catch (err) {
    if (connWrapper) {
      try {
        await connWrapper.rollback();
      } catch (eRollback) {
        console.error("Lỗi rollback transaction:", eRollback);
      }
      connWrapper.release();
    }
    console.error("Lỗi tạo đơn hàng:", err);
    return res.status(400).json({ error: err.message || 'Không thể tạo đơn hàng' });
  }
};

/**
 * Cập nhật trạng thái đơn hàng (Có phân quyền và quản lý chuyển đổi trạng thái)
 */
exports.updateOrderStatus = async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { status } = req.body;
  const userId = req.user ? req.user.user_id : null;
  const isAdmin = req.user?.role === 'admin';

  if (!orderId || !status) {
    return res.status(400).json({ error: 'Dữ liệu cập nhật trạng thái không hợp lệ' });
  }

  const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Trạng thái đơn hàng không hợp lệ' });
  }

  let connWrapper;
  try {
    connWrapper = await db.getConnectionAsync();
  } catch (errPool) {
    return res.status(500).json({ error: errPool.message });
  }

  try {
    await connWrapper.beginTransaction();

    // 1. Khóa và lấy thông tin đơn hàng hiện tại
    const rows = await connWrapper.query(
      'SELECT order_id, user_id, status FROM orders WHERE order_id = ? FOR UPDATE',
      [orderId]
    );

    if (!rows || rows.length === 0) {
      throw new Error('Đơn hàng không tồn tại');
    }

    const currentOrder = rows[0];
    const currentStatus = currentOrder.status;

    // 2. Phân quyền và kiểm tra quy tắc chuyển trạng thái
    if (!isAdmin) {
      // Khách hàng thông thường: CHỈ ĐƯỢC HỦY ĐƠN của chính mình và CHỈ KHI đơn đang ở trạng thái 'pending'
      if (currentOrder.user_id !== userId) {
        throw new Error('Bạn không có quyền thay đổi trạng thái đơn hàng này');
      }
      if (status !== 'cancelled') {
        throw new Error('Khách hàng chỉ có thể yêu cầu hủy đơn hàng');
      }
      if (currentStatus !== 'pending') {
        throw new Error('Đơn hàng đã được xác nhận hoặc đang vận chuyển, không thể tự hủy');
      }
    } else {
      // Admin: Kiểm tra ma trận chuyển đổi hợp lệ
      if (currentStatus === 'completed') {
        throw new Error('Đơn hàng đã hoàn tất thành công, không thể thay đổi trạng thái nữa');
      }
      if (currentStatus === 'cancelled') {
        throw new Error('Đơn hàng đã bị hủy, không thể thay đổi trạng thái');
      }
    }

    // 3. Nếu chuyển sang 'cancelled', hoàn trả tồn kho về product_variants
    if (status === 'cancelled' && currentStatus !== 'cancelled') {
      const orderItems = await connWrapper.query(
        'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      );
      for (const item of orderItems) {
        await connWrapper.query(
          'UPDATE product_variants SET stock = stock + ? WHERE variant_id = ?',
          [item.quantity, item.variant_id]
        );
      }
    }

    // 4. Nếu chuyển sang 'completed', cập nhật payment_status = 'paid' (nếu là COD)
    let paymentUpdate = '';
    if (status === 'completed') {
      paymentUpdate = ", payment_status = 'paid'";
    }

    await connWrapper.query(
      `UPDATE orders SET status = ? ${paymentUpdate}, updated_at = NOW() WHERE order_id = ?`,
      [status, orderId]
    );

    await connWrapper.commit();
    connWrapper.release();

    return res.status(200).json({
      message: 'Cập nhật trạng thái đơn hàng thành công',
      order_id: orderId,
      old_status: currentStatus,
      new_status: status
    });

  } catch (err) {
    if (connWrapper) {
      try { await connWrapper.rollback(); } catch (_eRollback) { /* ignore rollback failure */ }
      connWrapper.release();
    }
    return res.status(400).json({ error: err.message || 'Lỗi cập nhật trạng thái đơn hàng' });
  }
};

/**
 * Thống kê Dashboard kinh doanh cho Admin (sử dụng final_amount doanh thu thực)
 */
exports.getDashboardStatistic = (req, res) => {
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();

  // 1. Doanh thu thực tế theo tháng
  const sqlMonthly = `
    SELECT 
      MONTH(created_at) AS month,
      SUM(final_amount) AS total_revenue
    FROM orders
    WHERE status = 'completed' OR payment_status = 'paid'
      AND YEAR(created_at) = ?
    GROUP BY MONTH(created_at)
    ORDER BY MONTH(created_at)
  `;

  db.query(sqlMonthly, [year], (err, monthlyRevenue) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Doanh thu theo phương thức thanh toán
    const sqlPayment = `
      SELECT 
        payment_method,
        SUM(final_amount) AS total_revenue
      FROM orders
      WHERE status = 'completed' OR payment_status = 'paid'
        AND YEAR(created_at) = ?
      GROUP BY payment_method
    `;

    db.query(sqlPayment, [year], (errPay, paymentRevenue) => {
      if (errPay) return res.status(500).json({ error: errPay.message });

      // 3. Top 5 sản phẩm bán chạy nhất
      const sqlTop = `
        SELECT 
          p.name AS product_name,
          SUM(oi.quantity) AS total_sold
        FROM order_items oi
        JOIN product_variants pv ON pv.variant_id = oi.variant_id
        JOIN products p ON p.product_id = pv.product_id
        JOIN orders o ON o.order_id = oi.order_id
        WHERE (o.status = 'completed' OR o.payment_status = 'paid')
          AND YEAR(o.created_at) = ?
        GROUP BY p.product_id, p.name
        ORDER BY total_sold DESC
        LIMIT 5
      `;

      db.query(sqlTop, [year], (errTop, topProducts) => {
        if (errTop) return res.status(500).json({ error: errTop.message });

        return res.json({
          year,
          monthlyRevenue: monthlyRevenue || [],
          paymentRevenue: paymentRevenue || [],
          topProducts: topProducts || []
        });
      });
    });
  });
};
