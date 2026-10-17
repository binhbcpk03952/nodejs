const db = require('../demo_db_connection');

exports.getPromotions = (req, res) => {
  // Chỉ lấy các mã khuyến mãi đang kích hoạt
  const sqlPromos = "SELECT * FROM promotions WHERE is_active = 1 ORDER BY created_at DESC";

  db.query(sqlPromos, (err, promotions) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn khuyến mãi: ' + err.message });

    if (!promotions || promotions.length === 0) {
      return res.status(200).json([]);
    }

    const tasks = promotions.map(promo => {
      return new Promise((resolve, reject) => {
        const sqlCats = `
          SELECT c.category_id, c.name
          FROM promotion_categories pc
          JOIN categories c ON pc.category_id = c.category_id
          WHERE pc.promotion_id = ?
        `;

        db.query(sqlCats, [promo.promotion_id], (errCats, categories) => {
          if (errCats) return reject(errCats);
          promo.categories = categories || [];
          resolve();
        });
      });
    });

    Promise.all(tasks)
      .then(() => res.status(200).json(promotions))
      .catch(errTasks => res.status(500).json({ error: errTasks.message }));
  });
};
