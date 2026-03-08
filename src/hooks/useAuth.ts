import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuthStore from '../store/authStore';
import type { LoginResponse, RegisterResponse, User } from '../types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post<LoginResponse>('/auth/login', { username, password });
      const { user_id, display_name, access_token, refresh_token } = response.data;
      
      const user: User = { user_id, username, display_name };
      setAuth(user, access_token, refresh_token);
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const register = useCallback(async (data: { username: string, email: string, password: string, display_name: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
      const { user_id, username, display_name, access_token, refresh_token } = response.data;
      
      const user: User = { user_id, username, display_name };
      setAuth(user, access_token, refresh_token);
      return true;
    } catch (err: any) {
      console.error('Registration error:', err);
      const message = err.response?.data?.message || err.message || 'Đăng ký thất bại. Tên người dùng hoặc email có thể đã tồn tại.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      logoutStore();
      setLoading(false);
    }
  }, [logoutStore]);

  return { login, register, logout, loading, error };
};
