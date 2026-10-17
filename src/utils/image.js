const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3030';

/**
 * Format image path to full URL safely
 * @param {string} path - image path or filename from database
 * @returns {string} accessible URL for image
 */
export function formatImagePath(path) {
  if (!path) {
    return 'https://placehold.co/400x400/f1f5f9/475569?text=Nui+Xanh+Badminton';
  }

  // Chuỗi URL đầy đủ hoặc Blob / Data URI
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Nếu là file upload
  if (path.startsWith('/uploads')) {
    return `${SERVER_URL}${path}`;
  }
  if (path.startsWith('uploads/')) {
    return `${SERVER_URL}/${path}`;
  }

  // Nếu path có tiền tố /sever/ (tương thích ngược)
  if (path.startsWith('/sever/') || path.startsWith('sever/')) {
    const clean = path.replace(/^\/?sever/, '');
    return `${SERVER_URL}${clean}`;
  }

  // Nếu có tiền tố /assets/
  if (path.startsWith('/assets/')) {
    return `${SERVER_URL}${path}`;
  }

  // Tên file ảnh thông thường trong assets/images
  return `${SERVER_URL}/assets/images/${path}`;
}

export default formatImagePath;
