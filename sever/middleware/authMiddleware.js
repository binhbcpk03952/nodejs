const { verifyToken } = require('../utils/authHelper');

/**
 * Middleware bắt buộc phải đăng nhập
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để thực hiện thao tác này' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ' });
  }

  req.user = payload;
  next();
}

/**
 * Middleware tùy chọn đăng nhập (nếu có token thì giải mã, không có thì req.user = null)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
      return next();
    }
  }
  req.user = null;
  next();
}

/**
 * Middleware bắt buộc quyền Quản Trị Viên (Admin)
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Quyền truy cập bị từ chối: Yêu cầu quyền Quản Trị Viên' });
  }
  next();
}

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin
};
