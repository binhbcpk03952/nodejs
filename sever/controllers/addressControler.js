const db = require('../demo_db_connection');

exports.getAddresses = (req, res) => {
  // Lấy user_id từ token xác thực
  const userId = req.user ? req.user.user_id : null;
  if (!userId) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để xem danh sách địa chỉ' });
  }

  db.query(
    'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, address_id DESC',
    [userId],
    (err, data) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(data || []);
    }
  );
};

exports.createAddress = (req, res) => {
  const userId = req.user ? req.user.user_id : null;
  if (!userId) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để thêm địa chỉ' });
  }

  const { recipient_name, phone, address_line, ward, district, province, is_default } = req.body;

  // Validation
  if (!recipient_name || !phone || !address_line || !ward || !district || !province) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin địa chỉ nhận hàng' });
  }

  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
    return res.status(400).json({ error: 'Số điện thoại không đúng định dạng Việt Nam' });
  }

  const defaultVal = is_default ? 1 : 0;

  const insertSql = `
    INSERT INTO addresses (user_id, recipient_name, phone, address_line, ward, district, province, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  // Nếu đặt là mặc định, reset các địa chỉ cũ của user trước
  if (defaultVal === 1) {
    db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId], (errReset) => {
      if (errReset) console.warn("Lỗi reset địa chỉ mặc định:", errReset);

      db.query(
        insertSql,
        [userId, recipient_name.trim(), phone.trim(), address_line.trim(), ward.trim(), district.trim(), province.trim(), defaultVal],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: 'Thêm địa chỉ thành công', address_id: result.insertId });
        }
      );
    });
  } else {
    // Nếu đây là địa chỉ đầu tiên của user, tự động đặt làm mặc định
    db.query('SELECT COUNT(*) AS count FROM addresses WHERE user_id = ?', [userId], (errCount, countRes) => {
      const isFirst = countRes && countRes[0] && countRes[0].count === 0;
      const finalDefault = isFirst ? 1 : 0;

      db.query(
        insertSql,
        [userId, recipient_name.trim(), phone.trim(), address_line.trim(), ward.trim(), district.trim(), province.trim(), finalDefault],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: 'Thêm địa chỉ thành công', address_id: result.insertId });
        }
      );
    });
  }
};