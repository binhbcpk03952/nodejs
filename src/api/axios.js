import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Interceptor tự động gắn JWT Token vào header
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('badminton_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Không thể truy xuất token từ localStorage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý response và thông báo lỗi tập trung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Bắt lỗi 401 (hết hạn hoặc chưa đăng nhập)
    if (error.response?.status === 401) {
      // Xóa token nếu server báo token không hợp lệ
      if (error.response?.data?.error?.includes('hết hạn') || error.response?.data?.error?.includes('không hợp lệ')) {
        try {
          localStorage.removeItem('badminton_token');
          localStorage.removeItem('badminton_user');
        } catch {
          // Bỏ qua
        }
      }
    }

    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Lỗi kết nối máy chủ';
    console.warn('[API Error]:', message);
    return Promise.reject(error);
  }
);

export default api;