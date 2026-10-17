import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('badminton_user');
      const savedToken = localStorage.getItem('badminton_token');
      if (savedUser && savedToken) {
        return JSON.parse(savedUser);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('badminton_token') || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Xác thực token và lấy thông tin người dùng mới nhất từ backend
  const verifySession = useCallback(async () => {
    const savedToken = localStorage.getItem('badminton_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.status === 200 && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('badminton_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Phiên đăng nhập không hợp lệ hoặc đã hết hạn:', err.response?.data?.error || err.message);
      // Xóa phiên nếu token không còn hợp lệ
      localStorage.removeItem('badminton_token');
      localStorage.removeItem('badminton_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token && res.data?.user) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('badminton_token', res.data.token);
      localStorage.setItem('badminton_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error('Dữ liệu đăng nhập không hợp lệ từ máy chủ');
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    if (res.data?.token && res.data?.user) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('badminton_token', res.data.token);
      localStorage.setItem('badminton_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error('Đăng ký không thành công');
  };

  const logout = () => {
    try {
      localStorage.removeItem('badminton_token');
      localStorage.removeItem('badminton_user');
    } catch (e) {
      console.warn('LocalStorage error on logout:', e);
    }
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        loading,
        login,
        register,
        logout,
        refreshUser: verifySession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
