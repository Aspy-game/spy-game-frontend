import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import useAuthStore from '../store/authStore';
import type { LoginResponse, RegisterResponse, Role, User, RegisterRequest } from '../types';

// ─────────────────────────────────────────────────────────────
//  ĐỔI THÀNH false KHI CÓ BACKEND THẬT
const USE_MOCK = false;
// ─────────────────────────────────────────────────────────────

const MOCK_USERS = [
  {
    username: 'admin',
    password: '123456',
    user_id: '1',
    display_name: 'Admin',
    role: 'ROLE_ADMIN',
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  },
  {
    username: 'player1',
    password: '123456',
    user_id: '2',
    display_name: 'Cáo Nâu',
    role: 'ROLE_USER',
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
        const user: User = {
          user_id: Number(found.user_id),
          username: found.username,
          display_name: found.display_name,
          role: found.role as Role
        };
        setAuth(user, found.access_token, found.refresh_token);
        return true;
      }

      const response = await axiosInstance.post<LoginResponse & { avatar_url?: string, role?: string }>('/auth/login', { username, password });
      const { user_id, display_name, avatar_url, access_token, refresh_token, role } = response.data;

      // Normalize role to include ROLE_ prefix if missing
      let normalizedRole: Role = 'ROLE_USER';
      if (role) {
        normalizedRole = (role.startsWith('ROLE_') ? role : `ROLE_${role}`) as Role;
      }

      const user: User = {
        user_id,
        username,
        display_name,
        avatar_url,
        role: normalizedRole
      };

      setAuth(user, access_token, refresh_token);
      return true;
    } catch (err: any) {
      const status = err.response?.status;
      const message =
        status === 401
          ? 'Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.'
          : err.response?.data?.message || err.message || 'Đăng nhập thất bại.';

      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 500));
        const exists = MOCK_USERS.find((u) => u.username === data.username);
        if (exists) throw new Error('Tên đăng nhập đã tồn tại');
        const user: User = {
          user_id: Number('999'),
          username: data.username,
          display_name: data.display_name,
          role: 'ROLE_USER' as Role
        };
        // setAuth(user, 'mock-access-token-new', 'mock-refresh-token-new');
        return true;
      }

      const response = await axiosInstance.post<RegisterResponse & { avatar_url?: string, role?: string }>('/auth/register', data);
      const { user_id, username, display_name, avatar_url, access_token, refresh_token, role: roleStr } = response.data;

      // Normalize role to include ROLE_ prefix if missing
      let normalizedRole: Role = 'ROLE_USER';
      if (roleStr) {
        normalizedRole = (roleStr.startsWith('ROLE_') ? roleStr : `ROLE_${roleStr}`) as Role;
      }

      const user: User = {
        user_id,
        username,
        display_name,
        avatar_url,
        role: normalizedRole
      };

      // setAuth(user, access_token, refresh_token);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Đăng ký thất bại.';

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

  const forgotPassword = useCallback(async (username: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { username, email });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Gửi mã thất bại.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyResetToken = useCallback(async (username: string, email: string, token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/verify-reset-token', { username, email, token });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Mã xác nhận sai.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (username: string, email: string, token: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/reset-password', { username, email, token, newPassword });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Đặt lại mật khẩu thất bại.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/change-password', { oldPassword, newPassword });
      return { success: true, message: response.data.message };
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Đổi mật khẩu thất bại.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, register, logout, forgotPassword, verifyResetToken, resetPassword, changePassword, loading, error };
};