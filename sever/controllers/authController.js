const db = require('../demo_db_connection');
const { hashPassword, verifyPassword, generateToken } = require('../utils/authHelper');

exports.register = (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Họ tên, email và mật khẩu là bắt buộc' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Định dạng email không hợp lệ' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có tối thiểu 6 ký tự' });
  }

  // 1. Kiểm tra email đã tồn tại hay chưa
  db.query('SELECT user_id FROM users WHERE email = ?', [cleanEmail], (err, users) => {
    if (err) return res.status(500).json({ error: 'Lỗi kiểm tra tài khoản: ' + err.message });
    if (users && users.length > 0) {
      return res.status(409).json({ error: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác' });
    }

    // 2. Băm mật khẩu
    let hashedPassword;
    try {
      hashedPassword = hashPassword(password);
    } catch {
      return res.status(500).json({ error: 'Lỗi mã hóa mật khẩu' });
    }

    // 3. Tạo người dùng mới
    const insertSql = `
      INSERT INTO users (name, email, password, phone, role, avatar, created_at)
      VALUES (?, ?, ?, ?, 'customer', ?, NOW())
    `;
    const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

    db.query(insertSql, [name.trim(), cleanEmail, hashedPassword, phone || null, defaultAvatar], (errInsert, result) => {
      if (errInsert) return res.status(500).json({ error: 'Không thể tạo tài khoản: ' + errInsert.message });

      const newUserId = result.insertId;

      // 4. Tạo giỏ hàng gắn liền với user_id mới
      db.query('INSERT INTO carts (user_id, created_at) VALUES (?, NOW())', [newUserId], (errCart, cartResult) => {
        if (errCart) console.warn("Lỗi tạo giỏ hàng ban đầu:", errCart);

        const cartId = cartResult ? cartResult.insertId : null;
        const userPayload = {
          user_id: newUserId,
          name: name.trim(),
          email: cleanEmail,
          role: 'customer',
          avatar: defaultAvatar,
          cart_id: cartId
        };

        const token = generateToken(userPayload);

        return res.status(201).json({
          message: 'Đăng ký tài khoản thành công',
          token,
          user: userPayload
        });
      });
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu' });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  db.query('SELECT * FROM users WHERE email = ?', [cleanEmail], (err, users) => {
    if (err) return res.status(500).json({ error: 'Lỗi máy chủ khi đăng nhập: ' + err.message });

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    const user = users[0];
    const isPasswordValid = verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác' });
    }

    // Đảm bảo user có giỏ hàng trong database
    db.query('SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1', [user.user_id], (errCart, carts) => {
      let cartId = null;
      if (!errCart && carts && carts.length > 0) {
        cartId = carts[0].cart_id;
      }

      const issueToken = (finalCartId) => {
        const userPayload = {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          cart_id: finalCartId
        };

        const token = generateToken(userPayload);

        return res.status(200).json({
          message: 'Đăng nhập thành công',
          token,
          user: userPayload
        });
      };

      if (!cartId) {
        // Tự động tạo giỏ hàng nếu chưa có
        db.query('INSERT INTO carts (user_id, created_at) VALUES (?, NOW())', [user.user_id], (errInsertCart, newCart) => {
          const createdCartId = newCart ? newCart.insertId : null;
          issueToken(createdCartId);
        });
      } else {
        issueToken(cartId);
      }
    });
  });
};

exports.getMe = (req, res) => {
  const userId = req.user.user_id;

  db.query('SELECT user_id, name, email, phone, role, avatar, created_at FROM users WHERE user_id = ?', [userId], (err, users) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn thông tin: ' + err.message });
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const user = users[0];
    // Lấy kèm cart_id
    db.query('SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1', [userId], (errCart, carts) => {
      const cartId = (!errCart && carts && carts.length > 0) ? carts[0].cart_id : null;
      return res.json({
        user: { ...user, cart_id: cartId }
      });
    });
  });
};
