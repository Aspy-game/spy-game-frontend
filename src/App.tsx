import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';

// UI Components
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
      <h2 className="text-3xl font-bold text-center mb-6">Đăng Nhập</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
          <input
            type="text"
            className="w-full p-2 bg-slate-900 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full p-2 bg-slate-900 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Chưa có tài khoản? <Link to="/register" className="text-blue-400 hover:underline">Đăng ký ngay</Link>
      </p>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    display_name: ''
  });
  const { register, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
      <h2 className="text-3xl font-bold text-center mb-6">Đăng Ký</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên hiển thị</label>
          <input
            type="text"
            className="w-full p-2 bg-slate-900 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tên đăng nhập</label>
          <input
            type="text"
            className="w-full p-2 bg-slate-900 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 bg-slate-900 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full p-2 bg-slate-900 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-600 hover:bg-green-700 rounded font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng Ký'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Đã có tài khoản? <Link to="/login" className="text-blue-400 hover:underline">Đăng nhập</Link>
      </p>
    </div>
  );
};

const Lobby = () => {
  const { user } = useAuthStore();
  const { logout, loading } = useAuth();
  
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-black mb-4">Chào mừng, {user?.display_name}!</h1>
      <p className="text-slate-400 mb-8">Bạn đã sẵn sàng để bắt đầu trò chơi chưa?</p>
      <div className="flex justify-center gap-4">
        <button className="px-6 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-colors">Tạo phòng</button>
        <button className="px-6 py-2 bg-slate-700 rounded-lg font-bold hover:bg-slate-600 transition-colors">Vào phòng</button>
      </div>
      <button 
        onClick={logout}
        disabled={loading}
        className="mt-12 text-sm text-red-400 hover:text-red-300 underline"
      >
        {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
      </button>
    </div>
  );
};
const Room = () => <div className="p-10 text-center"><h1 className="text-3xl font-bold">Phòng chờ</h1></div>;
const Game = () => <div className="p-10 text-center"><h1 className="text-3xl font-bold">Trong ván chơi</h1></div>;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/lobby" /> : <>{children}</> ;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <Link to="/" className="text-2xl font-black text-blue-500">KEYWORD SPY</Link>
          <nav className="space-x-4">
            {/* Nav items here */}
          </nav>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            } />
            <Route path="/register" element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            } />
            
            <Route path="/lobby" element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            } />
            
            <Route path="/room/:code" element={
              <ProtectedRoute>
                <Room />
              </ProtectedRoute>
            } />
            
            <Route path="/game/:id" element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/lobby" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
