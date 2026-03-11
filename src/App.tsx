import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from './store/authStore';
import { useAuth } from './hooks/useAuth';
import Login from './pages/tsx/Login';
import Register from './pages/tsx/Register';
import Rules from './pages/tsx/Rules';
import bg from '../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg';
import './pages/css/home.css';
import './pages/css/rules.css';

// ─── SCALE HOOK ──────────────────────────────────────────────────────────────
// Co toàn bộ trang 1440×1024 vừa khít màn hình bằng transform: scale
const PAGE_W = 1440;
const PAGE_H = 1024;

function usePageScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function update() {
      const scaleX = window.innerWidth / PAGE_W;
      const scaleY = window.innerHeight / PAGE_H;
      setScale(Math.min(scaleX, scaleY));
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return scale;
}

// ─── SCALED PAGE WRAPPER ─────────────────────────────────────────────────────
function ScaledPage({ children }: { children: React.ReactNode }) {
  const scale = usePageScale();

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
      }}
    >
      <div
        style={{
          width: PAGE_W,
          height: PAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
const Home = () => {
  const [showRules, setShowRules] = useState(false);
  return (
    <ScaledPage>
      <div
        className="page page-home"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        }}
      >
        <div className="title-floating">
          <div className="title-back">
            <span className="luckiest back">KHÔNG PHAI TÔI</span>
            <span className="luckiest back comma">,</span>
          </div>
          <div className="title-front">
            <span className="luckiest front">KHÔNG PHAI TÔI</span>
            <span className="luckiest front comma">,</span>
          </div>
        </div>

        <div className="home-actions">
          <Link to="/login" className="action-text">Đăng nhập</Link>
          <Link to="/register" className="action-text">Đăng ký</Link>
        </div>

        <div className="home-help">
          <button className="help-box" onClick={() => setShowRules(true)}>?</button>
        </div>

        {showRules && (
          <div className="rules-modal">
            <div className="rules-panel">
              <h1 className="rules-title">LUẬT CHƠI</h1>
              <div className="rules-content">
                <p>Game “Không phải tôi” là trò chơi mang tính suy luận và tương tác nhóm, trong đó người chơi phải sử dụng khả năng quan sát, tư duy logic và kỹ năng giao tiếp để tìm ra nhân vật gián điệp đang ẩn mình trong nhóm. Trò chơi bắt đầu khi người chơi tham gia vào một phòng chơi và hệ thống tiến hành phân vai ngẫu nhiên cho từng người. Phần lớn người chơi sẽ thuộc vai trò dân thường và được cung cấp cùng một từ khóa hoặc chủ đề bí mật. Ngược lại, người giữ vai trò gián điệp sẽ không nhận được từ khóa này và phải dựa vào các thông tin được chia sẻ trong quá trình chơi để suy đoán nội dung mà những người khác đang biết.</p>
          <p>Sau khi phân vai, trò chơi bước vào vòng thảo luận. Ở mỗi lượt, từng người chơi lần lượt mô tả hoặc đưa ra ý kiến liên quan đến từ khóa bằng những câu nói gián tiếp, tránh nói quá rõ ràng để không tiết lộ trực tiếp nội dung cho gián điệp. Trong quá trình này, gián điệp phải khéo léo đặt câu trả lời sao cho không bị nghi ngờ, đồng thời cố gắng suy luận ra từ khóa dựa trên các phát biểu của dân thường. Người chơi còn lại sẽ quan sát, so sánh và phân tích câu trả lời của nhau nhằm phát hiện ra những biểu hiện bất thường.</p>
          <p>Sau khi kết thúc các lượt thảo luận, trò chơi tiến hành giai đoạn bỏ phiếu. Mỗi người chơi sẽ lựa chọn một người mà mình nghi ngờ là gián điệp. Người nhận được số phiếu cao nhất sẽ bị loại khỏi trò chơi. Nếu người bị loại là gián điệp, dân thường sẽ giành chiến thắng. Ngược lại, nếu dân thường bị loại hoặc gián điệp tồn tại đến cuối trò chơi, gián điệp sẽ chiến thắng. Trò chơi kết thúc khi điều kiện thắng của một trong hai phe được thỏa mãn.</p>
              </div>
              <button className="rules-close" onClick={() => setShowRules(false)}>×</button>
            </div>
          </div>
        )}
      </div>
    </ScaledPage>
  );
};

// ─── LOBBY ───────────────────────────────────────────────────────────────────
const Lobby = () => {
  const { user } = useAuthStore();
  const { logout, loading } = useAuth();

  return (
    <ScaledPage>
      <div
        className="page page-home"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        }}
      >
        <div className="lobby-center">
          <h1 className="lobby-greeting">Chào mừng, {user?.display_name}!</h1>
          <p className="lobby-sub">Bạn đã sẵn sàng để bắt đầu trò chơi chưa?</p>
          <div className="lobby-actions">
            <button className="lobby-btn">Tạo phòng</button>
            <button className="lobby-btn secondary">Vào phòng</button>
          </div>
          <button onClick={logout} disabled={loading} className="lobby-logout">
            {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      </div>
    </ScaledPage>
  );
};

// ─── PLACEHOLDER PAGES ───────────────────────────────────────────────────────
const Room = () => (
  <ScaledPage>
    <div className="page page-home" style={{ backgroundImage: `url(${bg})`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' }}>
      <div className="lobby-center"><h1 className="lobby-greeting">Phòng chờ</h1></div>
    </div>
  </ScaledPage>
);

const Game = () => (
  <ScaledPage>
    <div className="page page-home" style={{ backgroundImage: `url(${bg})`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' }}>
      <div className="lobby-center"><h1 className="lobby-greeting">Trong ván chơi</h1></div>
    </div>
  </ScaledPage>
);

// ─── ROUTE GUARDS ────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/lobby" /> : <>{children}</>;
};

// ─── APP ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/login"      element={<AuthRoute><ScaledPage><Login /></ScaledPage></AuthRoute>} />
        <Route path="/register"   element={<AuthRoute><ScaledPage><Register /></ScaledPage></AuthRoute>} />
        <Route path="/rules"      element={<ScaledPage><Rules /></ScaledPage>} />
        <Route path="/lobby"      element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/room/:code" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/game/:id"   element={<ProtectedRoute><Game /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
