const db = require('../demo_db_connection');

const buildTree = (categoryList, parentId = null) => {
  const tree = [];
  if (!Array.isArray(categoryList)) return tree;

  for (const item of categoryList) {
    if (item.parent_id === parentId) {
      const children = buildTree(categoryList, item.category_id);
      if (children.length > 0) {
        item.children = children;
      }
      tree.push(item);
    }
  }
  return tree;
};

exports.getCategory = (req, res) => {
  db.query('SELECT * FROM categories ORDER BY parent_id ASC, category_id ASC', (err, data) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn danh mục: ' + err.message });
    const categoryTree = buildTree(data || []);
    res.json(categoryTree);
  });
};