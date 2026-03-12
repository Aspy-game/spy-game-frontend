import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from './store/authStore';
import { useAuth } from './hooks/useAuth';
import Login from './pages/tsx/Login';
import Register from './pages/tsx/Register';
import Lobby from './pages/tsx/Lobby';
import bg from '../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg';
import './pages/css/home.css';

// ── Room screens ──────────────────────────────────────────────────────────────
import Round1Enter from './pages/tsx/room/Round1Enter';
// import DescribeNotify      from './pages/tsx/room/DescribeNotify';      // TODO
// import DescribeStart       from './pages/tsx/room/DescribeStart';       // TODO
// ... thêm dần các màn hình khác vào đây

const PAGE_W = 1440;
const PAGE_H = 1080;

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
const Home = () => (
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
        <div className="help-box">?</div>
      </div>
    </div>
  </ScaledPage>
);

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
<Route path="/" element={<Home />} />
<Route path="/login" element={<AuthRoute><ScaledPage><Login /></ScaledPage></AuthRoute>} />
<Route path="/register" element={<AuthRoute><ScaledPage><Register /></ScaledPage></AuthRoute>} />

{/* ── Protected ── */}
<Route path="/lobby" element={<ProtectedRoute><ScaledPage><Lobby /></ScaledPage></ProtectedRoute>} />
        <Route path="/room/:code" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/game/:id"   element={<ProtectedRoute><Game /></ProtectedRoute>} />

        {/* ── Room game screens  ── */}
        <Route path="/dev/round1" element={<ScaledPage><Round1Enter /></ScaledPage>} />
        {/*
          Tất cả màn hình trong game đều nằm dưới /game/:roomId/...
          Được bảo vệ bởi ProtectedRoute
        */}
        <Route
          path="/game/:roomId/round1"
          element={
            <ProtectedRoute>
              <ScaledPage>
                <Round1Enter />
              </ScaledPage>
            </ProtectedRoute>
          }
        />

        {/*
          Thêm dần các màn hình khác vào đây theo đúng thứ tự:

          <Route path="/game/:roomId/describe/notify"   element={<ProtectedRoute><ScaledPage><DescribeNotify /></ScaledPage></ProtectedRoute>} />
          <Route path="/game/:roomId/describe/start"    element={<ProtectedRoute><ScaledPage><DescribeStart /></ScaledPage></ProtectedRoute>} />
          <Route path="/game/:roomId/describe/sent"     element={<ProtectedRoute><ScaledPage><DescribeSent /></ScaledPage></ProtectedRoute>} />
          <Route path="/game/:roomId/describe/end"      element={<ProtectedRoute><ScaledPage><DescribeEnd /></ScaledPage></ProtectedRoute>} />
          <Route path="/game/:roomId/describe/view-all" element={<ProtectedRoute><ScaledPage><DescribeViewAll /></ScaledPage></ProtectedRoute>} />

          <Route path="/game/:roomId/vote/notify"   element={<ProtectedRoute><ScaledPage><VoteNotify /></ScaledPage></ProtectedRoute>} />
          <Route path="/game/:roomId/vote/select"   element={<ProtectedRoute><ScaledPage><VoteSelect /></ScaledPage></ProtectedRoute>} />
          <Route path="/game/:roomId/vote/sent"     element={<ProtectedRoute><ScaledPage><VoteSent /></ScaledPage></ProtectedRoute>} />
          <Route path="/game/:roomId/vote/timeout"  element={<ProtectedRoute><ScaledPage><VoteTimeout /></ScaledPage></ProtectedRoute>} />

          <Route path="/game/:roomId/discuss/describe" element={<ProtectedRoute><ScaledPage><DiscussDescribe /></ScaledPage></ProtectedRoute>} />
          <Route path="/game/:roomId/discuss/notify"   element={<ProtectedRoute><ScaledPage><DiscussNotify /></ScaledPage></ProtectedRoute>} />
          <Route path="/game/:roomId/discuss/chat"     element={<ProtectedRoute><ScaledPage><DiscussChat /></ScaledPage></ProtectedRoute>} />
          <Route path="/game/:roomId/discuss/end"      element={<ProtectedRoute><ScaledPage><DiscussEnd /></ScaledPage></ProtectedRoute>} />

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