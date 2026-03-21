# Spy Game Frontend

Chào mừng bạn đến với dự án Frontend của trò chơi **Keyword Spy**. Dự án này được xây dựng bằng React, TypeScript và Vite.

## 🚀 Công nghệ sử dụng

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Quản lý trạng thái:** [Zustand](https://github.com/pmndrs/zustand) (với middleware persist để lưu trữ token)
- **HTTP Client:** [Axios](https://axios-http.com/) (có cấu hình interceptors cho JWT và Refresh Token)
- **Routing:** [React Router Dom v7](https://reactrouter.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **WebSocket:** [@stomp/stompjs](https://github.com/stomp-js/stompjs) & [sockjs-client](https://github.com/sockjs/sockjs-client)

## 🛠 Hướng dẫn cài đặt

Sau khi clone dự án về máy, hãy thực hiện các bước sau:

### 1. Cài đặt các gói phụ thuộc (Dependencies)

Mở terminal tại thư mục gốc của dự án và chạy:

```bash
npm install
```

### 2. Cấu hình biến môi trường

Tạo một file `.env` tại thư mục gốc của dự án (nếu chưa có) và copy nội dung sau:

```env
# Địa chỉ API của Backend
VITE_API_URL=http://localhost:8080/api

# Địa chỉ WebSocket của Backend
VITE_WS_URL=ws://localhost:8080/ws-game

# Cấu hình nguồn dữ liệu: mock | api
VITE_DATA_SOURCE=mock
```

*Lưu ý: Nếu Backend chạy ở cổng khác 8080, hãy cập nhật lại các giá trị trên.*

### 3. Chạy Offline (Chế độ Mock)

Nếu bạn không có Backend chạy thật, hãy đảm bảo `VITE_DATA_SOURCE=mock` trong file `.env`. Ứng dụng sẽ sử dụng dữ liệu giả lập từ thư mục `src/mocks/` và mô phỏng độ trễ mạng (300ms - 800ms).

```bash
npm run dev
```

### 4. Chạy dự án ở chế độ phát triển (Kết nối API thật)

Đổi `VITE_DATA_SOURCE=api` và cập nhật `VITE_API_URL` tương ứng.

Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:5173/`

## 📁 Cấu trúc thư mục chính

- `src/api`: Cấu hình Axios instance và interceptors.
- `src/hooks`: Các Custom Hooks (Xác thực, WebSocket, ...).
- `src/store`: Quản lý trạng thái ứng dụng (Zustand).
- `src/types`: Định nghĩa các Interface và Type của TypeScript.
- `src/App.tsx`: File chính chứa định tuyến (Routes) và giao diện cơ bản.

## 🔑 Các luồng quan trọng

1. **Xác thực (Auth):**
   - Đăng ký: `/register`
   - Đăng nhập: `/login` (Token được tự động lưu vào localStorage và gắn vào header của các request tiếp theo).
   - Tự động Refresh Token: Khi Access Token hết hạn (401), hệ thống sẽ tự động gọi API refresh để lấy token mới.

2. **WebSocket:**
   - Sử dụng hook `useWebSocket` để kết nối và nhận tin nhắn thời gian thực từ Backend.

## 📝 Lưu ý cho thành viên

- Luôn kiểm tra xem Backend đã được cấu hình **CORS** cho phép cổng `5173` chưa để tránh lỗi kết nối.
- Khi thêm các thư viện mới, hãy sử dụng `npm install`.
- Trước khi commit code, hãy chạy `npm run build` để đảm bảo không có lỗi TypeScript.
