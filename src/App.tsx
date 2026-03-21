<<<<<<< Updated upstream
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
=======
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

>>>>>>> Stashed changes
import useAuthStore from './store/authStore';
import Login from './pages/tsx/Login';
import Register from './pages/tsx/Register';
import Forgot from './pages/tsx/Forgot';
import Reset from './pages/tsx/Reset';
import Admin from './pages/tsx/Admin';

 import Lobby from './pages/tsx/Lobby';
import RoomLobby from './pages/tsx/RoomLobby';

import bg from '../img/185eff45-e478-44e3-ae2c-26ed58d907e5.jpg';
import './pages/css/home.css';
import './pages/css/rules.css';
// import "./App.css"
// ── Room screens ──────────────────────────────────────────────────────────────
<<<<<<< Updated upstream
=======
// import Round1Enter from './pages/tsx/room/Round1Enter';
// import DescribeNotify      from './pages/tsx/room/DescribeNotify';      // TODO
// import DescribeStart       from './pages/tsx/room/DescribeStart';       // TODO
// ... thêm dần các màn hình khác vào đây
import useSettingStore from './store/settingStore';
import bgMusic from './assets/nhacnen.mp3';
>>>>>>> Stashed changes
import Round1Enter    from './pages/tsx/room/Round1Enter';
import DescribeNotify from './pages/tsx/room/DescribeNotify';
import VoteFlow       from './pages/tsx/room/VoteFlow';
import Round2Flow     from './pages/tsx/room/Round2Flow';
import ResultVote     from './pages/tsx/room/components/results/ResultVote';
import ResultMostVoted from './pages/tsx/room/components/results/ResultMostVoted';
import ResultSpySafe  from './pages/tsx/room/components/results/ResultSpySafe';
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
import Round3Flow from './pages/tsx/room/Round3Flow';
>>>>>>> Stashed changes
// import DescribeStart  from './pages/tsx/room/DescribeStart';  // TODO
// import DescribeSent   from './pages/tsx/room/DescribeSent';   // TODO
=======
import Round3Flow from './pages/tsx/room/Round3Flow';
>>>>>>> Stashed changes

const PAGE_W = 1440;
const PAGE_H = 1080;

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
  const location = useLocation();
  const navigate = useNavigate();
  
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
        position: 'relative',
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
        {/* 1. Nút Quay lại — Đặt TRƯỚC khung "Vòng" trong container scaled */}
        {!location.pathname.endsWith('/') && location.pathname !== '/lobby' && (
          <button
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              top: '20px',
              left: '21px', 
              width: '82px',
              height: '82px',
              borderRadius: '50%', 
              background: 'rgba(207, 147, 37, 0.9)', // Màu vàng đồng nhất với các badge khác
              border: 'none',
              cursor: 'pointer',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(207, 147, 37, 1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(207, 147, 37, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Quay lại"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
<<<<<<< Updated upstream
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
// const Lobby = () => {
//   const { user } = useAuthStore();
//   // const { logout, loading } = useAuth();
//   return (
//     <ScaledPage>
//       <div className="page page-home" style={{ backgroundImage: `url(${bg})`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' }}>
//         <div className="lobby-center">
//           <h1 className="lobby-greeting">Chào mừng, {user?.display_name}!</h1>
//           <p className="lobby-sub">Bạn đã sẵn sàng để bắt đầu trò chơi chưa?</p>
//           <div className="lobby-actions">
//             <button className="lobby-btn">Tạo phòng</button>
//             <button className="lobby-btn secondary">Vào phòng</button>

//           </div>
//         </div>

//         <div className="home-actions">
//           <Link to="/login" className="action-text">Đăng nhập</Link>
//           <Link to="/register" className="action-text">Đăng ký</Link>
//         </div>

//         {/* <div className="home-help">
//           <button className="help-box" onClick={() => setShowRules(true)}>?</button>
//         </div> */}

//         {/* {showRules && (
//           <div className="rules-modal">
//             <div className="rules-panel">
//               <h1 className="rules-title">LUẬT CHƠI</h1>
//               <div className="rules-content">
//                 <p>Game “Không phải tôi” là trò chơi mang tính suy luận và tương tác nhóm, trong đó người chơi phải sử dụng khả năng quan sát, tư duy logic và kỹ năng giao tiếp để tìm ra nhân vật gián điệp đang ẩn mình trong nhóm. Trò chơi bắt đầu khi người chơi tham gia vào một phòng chơi và hệ thống tiến hành phân vai ngẫu nhiên cho từng người. Phần lớn người chơi sẽ thuộc vai trò dân thường và được cung cấp cùng một từ khóa hoặc chủ đề bí mật. Ngược lại, người giữ vai trò gián điệp sẽ không nhận được từ khóa này và phải dựa vào các thông tin được chia sẻ trong quá trình chơi để suy đoán nội dung mà những người khác đang biết.</p>
//           <p>Sau khi phân vai, trò chơi bước vào vòng thảo luận. Ở mỗi lượt, từng người chơi lần lượt mô tả hoặc đưa ra ý kiến liên quan đến từ khóa bằng những câu nói gián tiếp, tránh nói quá rõ ràng để không tiết lộ trực tiếp nội dung cho gián điệp. Trong quá trình này, gián điệp phải khéo léo đặt câu trả lời sao cho không bị nghi ngờ, đồng thời cố gắng suy luận ra từ khóa dựa trên các phát biểu của dân thường. Người chơi còn lại sẽ quan sát, so sánh và phân tích câu trả lời của nhau nhằm phát hiện ra những biểu hiện bất thường.</p>
//           <p>Sau khi kết thúc các lượt thảo luận, trò chơi tiến hành giai đoạn bỏ phiếu. Mỗi người chơi sẽ lựa chọn một người mà mình nghi ngờ là gián điệp. Người nhận được số phiếu cao nhất sẽ bị loại khỏi trò chơi. Nếu người bị loại là gián điệp, dân thường sẽ giành chiến thắng. Ngược lại, nếu dân thường bị loại hoặc gián điệp tồn tại đến cuối trò chơi, gián điệp sẽ chiến thắng. Trò chơi kết thúc khi điều kiện thắng của một trong hai phe được thỏa mãn.</p>
//               </div>
//               <button className="rules-close" onClick={() => setShowRules(false)}>×</button>
//             </div>
//           </div> */}
//         {/* )} */}
//       </div>
//     </ScaledPage>
//   );
// };
=======
const Home = () => {
  const [showRules, setShowRules] = useState(false);
  return (
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
        <div className="home-help" onClick={() => setShowRules(true)} style={{ cursor: 'pointer' }}>
          <div className="help-box">?</div>
        </div>
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
    </ScaledPage>
  );
};

// ─── LOBBY ───────────────────────────────────────────────────────────────────
// Đã chuyển code Lobby sang src/pages/tsx/Lobby.tsx
>>>>>>> Stashed changes

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

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuthStore();
  return isAuthenticated && user?.role === 'ROLE_ADMIN' ? <>{children}</> : <Navigate to="/lobby" />;
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
<Route path="/forgot" element={<AuthRoute><ScaledPage><Forgot /></ScaledPage></AuthRoute>} />
<Route path="/reset" element={<AuthRoute><ScaledPage><Reset /></ScaledPage></AuthRoute>} />

{/* ── Protected ── */}
<Route path="/lobby" element={<ProtectedRoute><ScaledPage><Lobby /></ScaledPage></ProtectedRoute>} />
<Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

        <Route path="/room/:roomId" element={<ProtectedRoute><ScaledPage><RoomLobby /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:id"   element={<ProtectedRoute><Game /></ProtectedRoute>} />

        {/* ── DEV ONLY — xóa trước khi nộp ── */}
        <Route path="/dev/round1"          element={<ScaledPage><Round1Enter /></ScaledPage>} />
        <Route path="/dev/describe-notify" element={<ScaledPage><DescribeNotify /></ScaledPage>} />
        <Route path="/dev/vote"            element={<ScaledPage><VoteFlow /></ScaledPage>} />
        <Route path="/dev/round2"          element={<ScaledPage><Round2Flow /></ScaledPage>} />
        <Route path="/dev/result-vote"     element={<ScaledPage><ResultVote /></ScaledPage>} />

        <Route path="/dev/result-most-voted" element={<ScaledPage><ResultMostVoted /></ScaledPage>} />
<<<<<<< Updated upstream
        <Route path="/dev/result-spy-safe" element={<ScaledPage><ResultSpySafe /></ScaledPage>} /> 

=======
        <Route path="/dev/result-spy-safe" element={<ScaledPage><ResultSpySafe /></ScaledPage>} />
        <Route path="/dev/round3"            element={<ScaledPage><Round3Flow /></ScaledPage>} />
        
        
>>>>>>> Stashed changes
        {/* ── Room game screens ── */}
        <Route path="/game/:roomId/round1"
          element={<ProtectedRoute><ScaledPage><Round1Enter /></ScaledPage></ProtectedRoute>}
        />
        <Route path="/game/:roomId/describe/notify"
          element={<ProtectedRoute><ScaledPage><DescribeNotify /></ScaledPage></ProtectedRoute>}
        />
{/* Vote (dùng chung mọi vòng — truyền round qua state hoặc query) */}
        <Route path="/game/:roomId/vote/notify"
          element={<ProtectedRoute><ScaledPage><VoteFlow /></ScaledPage></ProtectedRoute>} />
 
        {/* Kết quả (dùng chung mọi vòng) */}
        <Route path="/game/:roomId/result/vote"
          element={<ProtectedRoute><ScaledPage><ResultVote /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/result/most-voted"
          element={<ProtectedRoute><ScaledPage><ResultMostVoted /></ScaledPage></ProtectedRoute>} />
        <Route path="/game/:roomId/result/spy-safe"
          element={<ProtectedRoute><ScaledPage><ResultSpySafe /></ScaledPage></ProtectedRoute>} />
 
        {/* Vòng 2 */}
        <Route path="/game/:roomId/round2"
          element={<ProtectedRoute><ScaledPage><Round2Flow /></ScaledPage></ProtectedRoute>} />
 
        {/* Vòng 3 */}
        <Route path="/game/:roomId/round3"
          element={<ProtectedRoute><ScaledPage><Round3Flow /></ScaledPage></ProtectedRoute>} />
        {/* <Route path="/game/:roomId/vote"            element={<ProtectedRoute><ScaledPage><VoteFlow /></ScaledPage></ProtectedRoute>} />
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
        <Route path="/game/:roomId/round2/after-r1"         element={<ProtectedRoute><ScaledPage><Round2AfterR1 /></ScaledPage></ProtectedRoute>} /> */}
      </Routes>
    </Router>
  );
}

export default App;

