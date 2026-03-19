import React, { useState, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import bg from '../../../img/Gemini_Generated_Image_4oqsgs4oqsgs4oqs.png';
import '../css/lobby.css';
import Profile from './Profile';
import DailyAttendance from './DailyAttendance';
import Settings from './Settings';
import ChangePassword from './ChangePassword';
import CreateRoom from './CreateRoom';

interface FlyingCoin {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  midX: number;
  midY: number;
  delay: number;
}


const Lobby: React.FC = () => {
  const { user } = useAuthStore();
  const logoutStore = useAuthStore((state) => state.logout);
  // const { logout, loading } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showAttendance, setShowAttendance] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const [isReceived, setIsReceived] = useState(false);
  const [coins, setCoins] = useState(100);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  
  const coinBoxRef = useRef<HTMLDivElement>(null);

  const handleReceiveAttendance = (amount: number, event: React.MouseEvent) => {
    if (!coinBoxRef.current) return;

    const boxRect = coinBoxRef.current.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const endX = boxRect.left + boxRect.width / 2 - startX;
    const endY = boxRect.top + boxRect.height / 2 - startY;

    const newCoins: FlyingCoin[] = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      startX,
      startY,
      endX,
      endY,
      midX: endX / 2 + (Math.random() - 0.5) * 200,
      midY: endY / 2 - 100 - Math.random() * 100,
      delay: i * 0.1,
    }));

    setFlyingCoins(newCoins);
    setIsReceived(true);

    // Delay the coin addition and shake until animation finishes
    setTimeout(() => {
      setCoins(prev => prev + amount);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setFlyingCoins([]);
    }, 1200);
  };

  const handleLogout = () => {
    logoutStore();
  };

  const rooms = [
    { id: 'CK001', name: 'Phòng: CK001', players: '1/6' },
    { id: 'CK028', name: 'Phòng: CK028', players: '5/6' },
    { id: 'RT163', name: 'Phòng: RT163', players: '2/6' },
  ];

  const isModalOpen = showSettings || showChangePassword || showAttendance || showProfile || showCreateRoom;


  return (
    <div
      className="page-lobby"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* ─── TOP LEFT USER ─── */}
      <div className="lobby-user-top-left" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
        <div className="lobby-user-avatar">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="User Avatar" />
          ) : (
            <span className="avatar-placeholder">
              {user?.display_name?.charAt(0) || 'C'}
            </span>
          )}
        </div>
        <span className="lobby-user-name">{user?.display_name || 'Cáo'}</span>
      </div>

      {/* ─── TOP RIGHT NAV ─── */}
      <div className="lobby-nav-top-right">
        {/* <div className="nav-icon-btn" onClick={() => setShowFriends(true)} style={{ cursor: 'pointer' }}>
          <i className="fa-solid fa-user-group"></i>
        </div> */}
        <div className="nav-icon-btn" onClick={() => setShowAttendance(true)} style={{ cursor: 'pointer' }}>
          <i className="fa-regular fa-calendar-days"></i>
        </div>
        <div className={`coin-box-lobby ${isShaking ? 'shake' : ''}`} ref={coinBoxRef}>
          <i className="fa-solid fa-coins" style={{ color: '#FFCC00', fontSize: '30px' }}></i>
          <span className="coin-amount">{coins}</span>
          <span className="coin-plus">+</span>
        </div>
        <div className="nav-icon-btn" onClick={() => setShowSettings(true)} style={{ cursor: 'pointer' }}>
          <i className="fa-solid fa-gear"></i>
        </div>
      </div>

      {!isModalOpen && (
        <>
          {/* ─── SIDEBAR LEFT (LEADERBOARD) ─── */}
          <aside className="lobby-sidebar-left-new">
            {[1, 2, 3, 4, 5].map((rank) => (
              <div key={rank} className="rank-item">
                <div className="rank-avatar">
                  {/* Avatar placeholder */}
                </div>
                {rank <= 3 && (
                  <span className={`rank-num rank-${rank}-text`}>{rank}</span>
                )}
              </div>
            ))}
          </aside>

          {/* ─── MAIN CONTENT AREA ─── */}
          <div className="lobby-main-content">
            {/* SEARCH BAR */}
            <div className="lobby-search-bar-new">
              <span className="search-label-new">Tìm phòng:</span>
              <input 
                type="text" 
                className="search-input-new" 
                placeholder="Nhập mã phòng..."
              />
              <i className="fa-solid fa-magnifying-glass search-icon-new"></i>
            </div>

            {/* CREATE ROOM BUTTON */}
            <button className="lobby-create-btn-new" onClick={() => setShowCreateRoom(true)}>
              <span className="create-text-new">Tạo phòng</span>
            </button>

            {/* ROOM LIST BOX */}
            <div className="lobby-room-box-new">
              {rooms.map((room) => (
                <div key={room.id} className="room-item-new">
                  <span className="room-name-new">{room.name}</span>
                  <div className="room-right-new">
                    <span className="room-players-new">{room.players}</span>
                    <span className="room-join-btn-new">
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
 
      {/* ─── PROFILE MODAL ─── */}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
      {showAttendance && (
        <DailyAttendance 
          onClose={() => setShowAttendance(false)} 
          isReceived={isReceived}
          onReceive={handleReceiveAttendance}
        />
      )}
      {showSettings && (
        <Settings 
          onClose={() => setShowSettings(false)} 
          onLogout={handleLogout}
          onChangePassword={() => {
            setShowSettings(false);
            setShowChangePassword(true);
          }} 
        />
      )}
      {showChangePassword && (
        <ChangePassword 
          onClose={() => setShowChangePassword(false)}
          onSubmit={(oldP, newP) => {
            console.log('Change password:', oldP, newP);
            setShowChangePassword(false);
          }}
        />
      )}
      {showCreateRoom && (
        <CreateRoom 
          onClose={() => setShowCreateRoom(false)}
          onConfirm={(data) => {
            console.log('Create room with:', data);
            setShowCreateRoom(false);
          }}
        />
      )}

      {/* ─── FLYING COINS ─── */}
      {flyingCoins.map((coin) => (
        <i
          key={coin.id}
          className="fa-solid fa-coins flying-coin"
          style={{
            left: coin.startX,
            top: coin.startY,
            '--end-x': `${coin.endX}px`,
            '--end-y': `${coin.endY}px`,
            '--mid-x': `${coin.midX}px`,
            '--mid-y': `${coin.midY}px`,
            animationDelay: `${coin.delay}s`,
          } as React.CSSProperties}
        />
      ))}

    </div>
  );
};

export default Lobby;