const db = require('../demo_db_connection');

exports.createContact = (req, res) => {
  const { name, phone, email, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Họ tên, số điện thoại và nội dung tin nhắn là bắt buộc' });
  }

  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
    return res.status(400).json({ error: 'Số điện thoại không đúng định dạng Việt Nam' });
  }

  const sql = `
    INSERT INTO contact_messages (name, phone, email, message, status, created_at)
    VALUES (?, ?, ?, ?, 'new', NOW())
  `;

  db.query(sql, [name.trim(), phone.trim(), email ? email.trim() : null, message.trim()], (err, result) => {
    if (err) return res.status(500).json({ error: 'Không thể lưu tin nhắn: ' + err.message });
    return res.status(201).json({
      message: 'Cảm ơn bạn! Chúng tôi đã nhận được thông tin và chuyên viên sẽ liên hệ lại sớm nhất.',
      id: result.insertId
    });
  });
};

exports.getContacts = (req, res) => {
  // Chỉ admin mới được xem danh sách tin nhắn liên hệ
  db.query('SELECT * FROM contact_messages ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.status(200).json(rows || []);
  });
};
