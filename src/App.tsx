import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from './store/authStore';
import { useAuth } from './hooks/useAuth';
import Login from './pages/tsx/Login';
import Register from './pages/tsx/Register';
import bg from '../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg';
import './pages/css/home.css';

// ── Room screens ──────────────────────────────────────────────────────────────
import Round1Enter    from './pages/tsx/room/Round1Enter';
import DescribeNotify from './pages/tsx/room/DescribeNotify';
import VoteNotify     from './pages/tsx/room/VoteNotify';
import VoteSelect     from './pages/tsx/room/VoteSelect';
import VoteSent       from './pages/tsx/room/VoteSent';
import VoteTimeout    from './pages/tsx/room/VoteTimeout';
import ResultVote     from './pages/tsx/room/ResultVote';
import ResultMostVoted from './pages/tsx/room/ResultMostVoted';
import ResultSpySafe  from './pages/tsx/room/ResultSpySafe';
// import DescribeStart  from './pages/tsx/room/DescribeStart';  // TODO
// import DescribeSent   from './pages/tsx/room/DescribeSent';   // TODO

// ─── SCALE HOOK ──────────────────────────────────────────────────────────────
const PAGE_W = 1440;
const PAGE_H = 1024;

function usePageScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    function update() {
      // Tính scale vừa khít màn hình, không bao giờ > 1
      const scaleX = window.innerWidth  / PAGE_W;
      const scaleY = window.innerHeight / PAGE_H;
      setScale(Math.min(scaleX, scaleY, 1)); // ← thêm giới hạn max = 1
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

  // transform: scale() không thu nhỏ layout space thực tế
  // → dùng margin âm để bù lại phần không gian thừa sau khi scale
  const scaledW = PAGE_W * scale;
  const scaledH = PAGE_H * scale;
  const marginX = (scaledW - PAGE_W) / 2;
  const marginY = (scaledH - PAGE_H) / 2;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
      }}
    >
      <div
        style={{
          width: PAGE_W,
          height: PAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          // Margin âm bù lại layout space dư ra sau khi scale
          marginTop: marginY,
          marginBottom: marginY,
          marginLeft: marginX,
          marginRight: marginX,
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
const Home = () => (
  <ScaledPage>
    <div className="page page-home" style={{ backgroundImage: `url(${bg})`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' }}>
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
        <div className="help-box">?</div>
      </div>
    </div>
  </ScaledPage>
);

// ─── LOBBY ───────────────────────────────────────────────────────────────────
const Lobby = () => {
  const { user } = useAuthStore();
  const { logout, loading } = useAuth();
  return (
    <ScaledPage>
      <div className="page page-home" style={{ backgroundImage: `url(${bg})`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' }}>
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
        {/* ── Public ── */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<AuthRoute><ScaledPage><Login /></ScaledPage></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><ScaledPage><Register /></ScaledPage></AuthRoute>} />

        {/* ── Protected ── */}
        <Route path="/lobby"      element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/room/:code" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/game/:id"   element={<ProtectedRoute><Game /></ProtectedRoute>} />

        {/* ── DEV ONLY — xóa trước khi nộp ── */}
        <Route path="/dev/round1"          element={<ScaledPage><Round1Enter /></ScaledPage>} />
        <Route path="/dev/describe-notify" element={<ScaledPage><DescribeNotify /></ScaledPage>} />
        <Route path="/dev/vote-notify"     element={<ScaledPage><VoteNotify /></ScaledPage>} />
        <Route path="/dev/vote-select"     element={<ScaledPage><VoteSelect /></ScaledPage>} />
        <Route path="/dev/vote-sent"       element={<ScaledPage><VoteSent /></ScaledPage>} />
        <Route path="/dev/vote-timeout"    element={<ScaledPage><VoteTimeout /></ScaledPage>} />
        <Route path="/dev/result-vote"     element={<ScaledPage><ResultVote /></ScaledPage>} />
        <Route path="/dev/result-most-voted" element={<ScaledPage><ResultMostVoted /></ScaledPage>} />
        <Route path="/dev/result-spy-safe" element={<ScaledPage><ResultSpySafe /></ScaledPage>} />

        {/* ── Room game screens ── */}
        <Route path="/game/:roomId/round1"
          element={<ProtectedRoute><ScaledPage><Round1Enter /></ScaledPage></ProtectedRoute>}
        />
        <Route path="/game/:roomId/describe/notify"
          element={<ProtectedRoute><ScaledPage><DescribeNotify /></ScaledPage></ProtectedRoute>}
        />

        {/* TODO: uncomment khi làm xong từng màn hình
        <Route path="/game/:roomId/describe/start"    element={<ProtectedRoute><ScaledPage><DescribeStart /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/describe/sent"     element={<ProtectedRoute><ScaledPage><DescribeSent /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/describe/end"      element={<ProtectedRoute><ScaledPage><DescribeEnd /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/describe/view-all" element={<ProtectedRoute><ScaledPage><DescribeNotify /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/vote/notify"       element={<ProtectedRoute><ScaledPage><VoteNotify /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/vote/select"       element={<ProtectedRoute><ScaledPage><VoteSelect /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/vote/sent"         element={<ProtectedRoute><ScaledPage><VoteSent /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/vote/timeout"      element={<ProtectedRoute><ScaledPage><VoteTimeout /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/result/vote"       element={<ProtectedRoute><ScaledPage><ResultVote /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/result/most-voted" element={<ProtectedRoute><ScaledPage><ResultMostVoted /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/result/spy-safe"   element={<ProtectedRoute><ScaledPage><ResultSpySafe /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/round2"                  element={<ProtectedRoute><ScaledPage><Round2Enter /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/round2/rolecheck"        element={<ProtectedRoute><ScaledPage><Round2RoleCheck /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/round2/role-correct"     element={<ProtectedRoute><ScaledPage><Round2RoleCorrect /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/round2/manipulate"       element={<ProtectedRoute><ScaledPage><Round2Manipulate /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/round2/ghost-chat"       element={<ProtectedRoute><ScaledPage><Round2GhostChat /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/round2/ghost-chat-input" element={<ProtectedRoute><ScaledPage><Round2GhostChatInput /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/round2/typing"           element={<ProtectedRoute><ScaledPage><Round2Typing /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/round2/after-r1"         element={<ProtectedRoute><ScaledPage><Round2AfterR1 /></ScaledPage></ProtectedRoute>} />
        */}
      </Routes>
    </Router>
  );
}

export default App;