import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import bg from '../../../img/Gemini_Generated_Image_4oqsgs4oqsgs4oqs.png';
import '../css/lobby.css';
import Profile from './Profile';
import DailyAttendance from './DailyAttendance';
import Settings from './Settings';
import ChangePassword from './ChangePassword';
import CreateRoom from './CreateRoom';
import axiosInstance from '../../api/axiosInstance';
import { useWebSocket } from '../../hooks/useWebSocket';

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
  const navigate = useNavigate();
  const logoutStore = useAuthStore((state) => state.logout);
  // const { logout, loading } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const [isReceived, setIsReceived] = useState(false);
  const [checkinStreak, setCheckinStreak] = useState(1);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const setUser = useAuthStore(state => state.setUser);

  const [rooms, setRooms] = useState<any[]>([]);
  const [leaderboardType, setLeaderboardType] = useState('balance'); // 'balance', 'spy', 'civilian'
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const { connect, disconnect, subscribe, connected } = useWebSocket();

  const coinBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
    fetchUserProfile();
    fetchLeaderboard('balance');
    checkCheckinStatus();
    connect();
    return () => disconnect();
  }, []);

  const checkCheckinStatus = async () => {
    try {
      const res = await axiosInstance.get('/economy/daily-checkin/status');
      if (res.data.canCheckin) {
        setShowAttendance(true);
        setIsReceived(false);
      } else {
        setIsReceived(true);
      }
      setCheckinStreak(res.data.streak || 1);
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái điểm danh:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
    }
  };

  useEffect(() => {
    if (connected) {
      subscribe('/topic/rooms/lobby', (event: any) => {
        const { type, room_id, room_code, current_players, max_players, status, is_private } = event;

        setRooms(prevRooms => {
          if (type === 'ROOM_DELETED') {
            return prevRooms.filter(r => r.room_id !== room_id);
          }

          if (type === 'ROOM_UPDATED') {
            const index = prevRooms.findIndex(r => r.room_id === room_id);
            const updatedRoom = { room_id, room_code, current_players, max_players, status, is_private };

            if (index !== -1) {
              const newRooms = [...prevRooms];
              newRooms[index] = updatedRoom;
              return newRooms;
            } else if (!is_private && status === 'waiting') {
              return [...prevRooms, updatedRoom];
            }
          }
          return prevRooms;
        });
      });
    }
  }, [connected, subscribe]);

  const fetchLeaderboard = async (type: string) => {
    try {
      const response = await axiosInstance.get(`/economy/leaderboard?type=${type}`);
      setLeaderboardData(response.data || []);
    } catch (error) {
      console.error('Lỗi khi tải bảng xếp hạng:', error);
    }
  };

  useEffect(() => {
    if (leaderboardType) {
      fetchLeaderboard(leaderboardType);
    }
  }, [leaderboardType]);

  const fetchRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const response = await axiosInstance.get('/rooms');
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleJoinRoom = async (roomCode: string) => {
    try {
      const response = await axiosInstance.post(`/rooms/${roomCode}/join`);
      const { room_id } = response.data;
      navigate(`/room/${room_id}`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Không thể tham gia phòng.';
      alert(errorMsg);
    }
  };

  const handleSearchAndJoin = async () => {
    if (!searchCode.trim()) return;
    handleJoinRoom(searchCode.trim().toUpperCase());
  };

  const handleReceiveAttendance = async (amount: number, event: React.MouseEvent) => {
    if (!coinBoxRef.current) return;

    try {
      // Gọi API điểm danh trước
      const res = await axiosInstance.post('/economy/daily-checkin');
      const { amount: receivedAmount, streak: newStreak } = res.data;
      setCheckinStreak(newStreak);
      setIsReceived(true);
      // Có thể dùng receivedAmount từ BE thay vì amount từ component truyền lên
      amount = receivedAmount || amount;
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Điểm danh thất bại.';
      alert(errorMsg);
      return;
    }

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
      fetchUserProfile(); // Cập nhật lại số dư từ server
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setFlyingCoins([]);
    }, 1200);
  };

  const handleLogout = () => {
    logoutStore();
  };

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
          <span className="coin-amount">{user?.balance || 0}</span>
          <span className="coin-plus">+</span>
        </div>
        <div className="nav-icon-btn" onClick={() => setShowSettings(true)} style={{ cursor: 'pointer' }}>
          <i className="fa-solid fa-gear"></i>
        </div>
      </div>

      {!isModalOpen && (
        <>
          {/* ─── SIDEBAR LEFT (LEADERBOARD) ─── */}
          <aside className={`lobby-sidebar-left-new ${isSidebarExpanded ? 'expanded' : ''}`}>
            {/* TOGGLE BUTTON */}
            <div className="sidebar-toggle-btn" onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}>
              <i className={`fa-solid ${isSidebarExpanded ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
            </div>

            <div className="leaderboard-tabs">
              <div 
                className={`leaderboard-tab ${leaderboardType === 'balance' ? 'active' : ''}`}
                onClick={() => setLeaderboardType('balance')}
                title="Xếp hạng theo xu"
              >
                <i className="fa-solid fa-coins"></i>
                {isSidebarExpanded && <span className="tab-label">Xu</span>}
              </div>
              <div 
                className={`leaderboard-tab ${leaderboardType === 'spy' ? 'active' : ''}`}
                onClick={() => setLeaderboardType('spy')}
                title="Xếp hạng theo ván thắng Spy"
              >
                <i className="fa-solid fa-user-secret"></i>
                {isSidebarExpanded && <span className="tab-label">Spy</span>}
              </div>
              <div 
                className={`leaderboard-tab ${leaderboardType === 'civilian' ? 'active' : ''}`}
                onClick={() => setLeaderboardType('civilian')}
                title="Xếp hạng theo ván thắng Dân thường"
              >
                <i className="fa-solid fa-users"></i>
                {isSidebarExpanded && <span className="tab-label">Dân</span>}
              </div>
            </div>

            <div className="leaderboard-list">
              {leaderboardData.slice(0, 10).map((item, index) => (
                <div key={index} className={`rank-item ${isSidebarExpanded ? 'expanded' : ''}`} title={`${item.display_name}: ${item.score}`}>
                  <div className="rank-avatar-wrapper">
                    <div className="rank-avatar">
                      {item.avatar_url ? (
                        <img src={item.avatar_url} alt="Avatar" />
                      ) : (
                        <span className="rank-avatar-placeholder">
                          {item.display_name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    {index < 3 && (
                      <span className={`rank-num rank-${index + 1}-text`}>{index + 1}</span>
                    )}
                  </div>

                  {isSidebarExpanded ? (
                    <div className="rank-info-expanded">
                      <span className="rank-name">{item.display_name}</span>
                      <span className="rank-score-text">
                        {item.score} {leaderboardType === 'balance' ? 'xu' : 'ván'}
                      </span>
                    </div>
                  ) : (
                    <span className="rank-score-minimal">{item.score}</span>
                  )}
                </div>
              ))}
              {leaderboardData.length === 0 && (
                <p className="no-rank-data">Trống</p>
              )}
            </div>
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
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchAndJoin()}
              />
              <i className="fa-solid fa-magnifying-glass search-icon-new" onClick={handleSearchAndJoin}></i>
            </div>

            {/* CREATE ROOM BUTTON */}
            <button className="lobby-create-btn-new" onClick={() => setShowCreateRoom(true)}>
              <span className="create-text-new">Tạo phòng</span>
            </button>

            {/* ROOM LIST BOX */}
            <div className="lobby-room-box-new">
              {isLoadingRooms ? (
                <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Đang tải danh sách phòng...</div>
              ) : rooms.length === 0 ? (
                <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Chưa có phòng công khai nào.</div>
              ) : (
                rooms.map((room) => (
                  <div key={room.room_id} className="room-item-new">
                    <span className="room-name-new">Phòng: {room.room_code}</span>
                    <div className="room-right-new">
                      <span className="room-players-new">{room.current_players}/{room.max_players}</span>
                      <span className="room-join-btn-new" onClick={() => handleJoinRoom(room.room_code)}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      </span>
                    </div>
                  </div>
                ))
              )}
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
          streak={checkinStreak}
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