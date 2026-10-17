const crypto = require('crypto');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
} catch {
  // Bỏ qua
}

const JWT_SECRET = process.env.JWT_SECRET || 'nui_xanh_badminton_secret_key_change_in_production_2026';
const JWT_EXPIRES_DAYS = 7;

/**
 * Băm mật khẩu sử dụng crypto.scrypt (OWASP / NIST approved)
 * @param {string} password 
 * @returns {string} định dạng salt:hash
 */
function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Mật khẩu không hợp lệ');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Xác thực mật khẩu so với hash đã lưu
 * @param {string} password 
 * @param {string} storedHash 
 * @returns {boolean}
 */
function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  // Trường hợp hash dạng salt:hash
  if (storedHash.includes(':')) {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    try {
      const derivedKey = crypto.scryptSync(password, salt, 64);
      const keyBuffer = Buffer.from(key, 'hex');
      return crypto.timingSafeEqual(derivedKey, keyBuffer);
    } catch {
      return false;
    }
  }

  // Fallback nếu database cũ có plain password hoặc định dạng cũ
  if (password === storedHash) {
    return true;
  }

  return false;
}

/**
 * Base64Url encode helper
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64Url decode helper
 */
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * Ký và tạo JWT Token
 * @param {object} payload 
 * @param {number|null} expiresInSeconds Thời gian hết hạn tính bằng giây (mặc định 7 ngày)
 * @returns {string} jwt token
 */
function generateToken(payload, expiresInSeconds = null) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const duration = (typeof expiresInSeconds === 'number')
    ? expiresInSeconds
    : (JWT_EXPIRES_DAYS * 24 * 60 * 60);
  const exp = Math.floor(Date.now() / 1000) + duration;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Xác thực và giải mã JWT Token
 * @param {string} token 
 * @returns {object|null}
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  // Xác thực chữ ký
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSignature) {
    return null; // Chữ ký không hợp lệ
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    // Kiểm tra thời hạn hết hạn
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token đã hết hạn
    }
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
};
