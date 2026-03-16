import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuthStore from '../store/authStore';
import type { LoginResponse, RegisterResponse, User } from '../types';

// ─────────────────────────────────────────────────────────────
//  ĐỔI THÀNH false KHI CÓ BACKEND THẬT
const USE_MOCK = true;
// ─────────────────────────────────────────────────────────────

const MOCK_USERS = [
  {
    username: 'admin',
    password: '123456',
    user_id: '1',
    display_name: 'Admin',
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  },
  {
    username: 'player1',
    password: '123456',
    user_id: '2',
    display_name: 'Cáo Nâu',
    access_token: 'mock-access-token-2',
    refresh_token: 'mock-refresh-token-2',
  },
];

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500)); // giả lập độ trễ mạng
        const found = MOCK_USERS.find(
          (u) => u.username === username && u.password === password
        );
        if (!found) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        const user: User = { user_id: Number(found.user_id), username: found.username, display_name: found.display_name };
        setAuth(user, found.access_token, found.refresh_token);
        return true;
      }

      const response = await axiosInstance.post<LoginResponse>('/auth/login', { username, password });
      const { user_id, display_name, access_token, refresh_token } = response.data;
      const user: User = { user_id, username, display_name };
      setAuth(user, access_token, refresh_token);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Đăng nhập thất bại.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const register = useCallback(async (data: { username: string; email: string; password: string; display_name: string }) => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500));
        const exists = MOCK_USERS.find((u) => u.username === data.username);
        if (exists) throw new Error('Tên đăng nhập đã tồn tại');
        const user: User = { user_id: Number('999'), username: data.username, display_name: data.display_name };
        setAuth(user, 'mock-access-token-new', 'mock-refresh-token-new');
        return true;
      }

      const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
      const { user_id, username, display_name, access_token, refresh_token } = response.data;
      const user: User = { user_id, username, display_name };
      setAuth(user, access_token, refresh_token);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Đăng ký thất bại.';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (!USE_MOCK) {
        await axiosInstance.post('/auth/logout');
      }
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      logoutStore();
      setLoading(false);
    }
  }, [logoutStore]);

  return { login, register, logout, loading, error };
};