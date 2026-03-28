import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Thêm interceptor để gắn token vào request nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    // Luôn đảm bảo có header ngrok để bypass warning
    config.headers['ngrok-skip-browser-warning'] = 'true';

    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      const { state } = JSON.parse(storage);
      if (state.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý refresh token khi gặp lỗi 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 hoặc 403 và không phải là request refresh token
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      
      const storage = localStorage.getItem('auth-storage');
      if (storage) {
        const { state } = JSON.parse(storage);
        const refreshToken = state.refreshToken;
        
        if (refreshToken) {
          try {
            const response = await axios.post(`${axiosInstance.defaults.baseURL}/auth/refresh`, {
              refresh_token: refreshToken
            }, {
              headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            
            const { access_token } = response.data;
            
            // Cập nhật lại store (giả định store sẽ tự cập nhật localStorage)
            // Trong thực tế, bạn có thể gọi useAuthStore.getState().setAuth(...) 
            // nhưng ở đây ta cập nhật trực tiếp localStorage để các request tiếp theo lấy được
            const newState = { ...state, accessToken: access_token };
            localStorage.setItem('auth-storage', JSON.stringify({ state: newState, version: 0 }));
            
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // Nếu refresh cũng lỗi thì logout
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
