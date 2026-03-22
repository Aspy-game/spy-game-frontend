import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axiosInstance from '../api/axiosInstance';
import { gameService } from '../services/gameService';
import './AdminMenu.css';

const AdminMenu: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const { matchId: paramMatchId } = useParams<{ matchId: string }>();

  // Extract room and match IDs from path if not in params
  const roomIdFromPath = location.pathname.startsWith('/room/') 
    ? location.pathname.split('/')[2] 
    : null;
  const matchIdFromPath = location.pathname.startsWith('/game/') 
    ? location.pathname.split('/')[2] 
    : null;
  const roomId = paramRoomId || roomIdFromPath;
  const matchId = paramMatchId || matchIdFromPath;

  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'rooms' | 'keywords' | 'stats'>('settings');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [matchState, setMatchState] = useState<any>(null);
  const [durations, setDurations] = useState({
    describe_duration: 60,
    discuss_duration: 120,
    vote_duration: 30,
    role_check_duration: 15,
    role_check_result_duration: 10
  });

  const fetchAdminData = async () => {
    try {
      if (activeTab === 'stats') {
        const res = await axiosInstance.get('/admin/stats');
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await axiosInstance.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'rooms') {
        const res = await axiosInstance.get('/admin/rooms');
        setRooms(res.data);
      } else if (activeTab === 'keywords') {
        const res = await axiosInstance.get('/admin/keywords');
        setKeywords(Array.isArray(res.data) ? res.data : (res.data.keywords || []));
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu admin:', error);
    }
  };

  const fetchMatchState = async (mId: string) => {
    try {
      const res = await axiosInstance.get(`/game/${mId}/state`);
      setMatchState(res.data);
    } catch (error) {
      console.error('Lỗi khi tải trạng thái trận đấu:', error);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      await axiosInstance.patch(`/admin/settings`, durations);
      alert('Cập nhật cài đặt thành công!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi cập nhật cài đặt.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN' && (isOpen || showSettings)) {
      fetchAdminData();
    }
  }, [isOpen, showSettings, activeTab, user?.role]);

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN' && isOpen && matchId) {
      fetchMatchState(matchId);
    }
  }, [isOpen, matchId, user?.role]);

  if (user?.role !== 'ROLE_ADMIN') return null;

  const isInRoom = !!roomId && location.pathname.startsWith('/room/');
  const isInMatch = !!matchId && location.pathname.startsWith('/game/');
  const isGameOver = isInMatch && (matchState?.phase === 'GAME_OVER' || matchState?.status === 'GAME_OVER');

  const handleBanUser = async (id: number, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/admin/users/${id}/ban`, { active: !currentStatus });
      fetchAdminData();
    } catch (error) {
      alert('Không thể cập nhật trạng thái người dùng');
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      await axiosInstance.delete(`/admin/rooms/${id}`);
      fetchAdminData();
    } catch (error) {
      alert('Không thể xóa phòng');
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (!window.confirm('Xóa từ khóa này?')) return;
    try {
      await axiosInstance.delete(`/admin/keywords/${id}`);
      fetchAdminData();
    } catch (error) {
      alert('Không thể xóa từ khóa');
    }
  };

  const handleSkipPhase = async () => {
    if (!matchId || isProcessing) return;
    try {
      setIsProcessing(true);
      await axiosInstance.post(`/admin/matches/${matchId}/skip-phase`);
      alert('Đã bỏ qua phase hiện tại thành công!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi bỏ qua phase.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAskAI = async () => {
    if (isProcessing) return;
    const prompt = window.prompt('Nhập câu hỏi (prompt) để kiểm tra AI:');
    if (!prompt) return;

    try {
      setIsProcessing(true);
      const response = await axiosInstance.post(`/admin/ai-test`, { prompt });
      const { status, prompt: sentPrompt, response: aiResponse } = response.data;
      
      if (status === 'success') {
        alert(`GPT Phản hồi:\n\nPrompt: ${sentPrompt}\n\nResponse: ${aiResponse}`);
      } else {
        alert('AI Phản hồi:\n' + (aiResponse || 'Lỗi không xác định'));
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi kiểm tra AI.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!roomId || isProcessing) return;
    
    // Prompt for identifier (Username/Email) to add
    const identifier = window.prompt('Nhập Username hoặc Email người chơi muốn thêm vào phòng (Test):');
    if (!identifier) return;

    try {
      setIsProcessing(true);
      await axiosInstance.post(`/admin/rooms/${roomId}/add-player`, { identifier: identifier });
      alert('Đã thêm người chơi thành công!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi thêm người chơi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCoins = async () => {
    if (isProcessing) return;
    
    const identifier = window.prompt('Nhập Username hoặc Email muốn tặng xu:', user?.username);
    if (!identifier) return;

    const amountStr = window.prompt('Nhập số xu muốn tặng (ví dụ: 1000):', '1000');
    if (!amountStr) return;

    const amount = parseInt(amountStr);
    if (isNaN(amount)) {
      alert('Số xu phải là một số!');
      return;
    }

    try {
      setIsProcessing(true);
      await axiosInstance.post(`/admin/users/add-coins`, { 
        identifier: identifier,
        amount: amount 
      });
      alert(`Đã tặng ${amount} xu cho ${identifier} thành công!`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Lỗi khi tặng xu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetSpy = async () => {
    if ((!matchId && !roomId) || isProcessing) return;
    
    const userIdStr = window.prompt('Nhập User ID muốn đặt làm Gián điệp (Spy):', String(user?.user_id));
    if (!userIdStr) return;

    try {
      setIsProcessing(true);
      const targetId = roomId || matchId; // Use room ID primarily
      await gameService.setSpy(targetId!, userIdStr);
      alert(`Đã đặt User ID ${userIdStr} làm Gián điệp thành công! (Chỉ profile DEV)`);
      if (matchId) fetchMatchState(matchId);
    } catch (error: any) {
      alert(error.response?.data?.message || error.response?.data?.error || 'Lỗi khi đặt Gián điệp.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`admin-floating-menu ${isOpen ? 'open' : ''} ${showSettings ? 'wide' : ''}`}>
      <div className="admin-external-buttons">
        {isInMatch && !isOpen && (
          <button className="admin-mini-btn skip" onClick={handleSkipPhase} disabled={isProcessing} title="Bỏ qua Phase">
            <i className="fa-solid fa-forward-step"></i>
          </button>
        )}
      </div>

      <button className="admin-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-user-shield'}`}></i>
        <span className="toggle-text">Admin</span>
      </button>

      <div className="admin-menu-content">
        {!showSettings ? (
          <>
            <div className="admin-menu-header">
              <i className="fa-solid fa-shield-halved"></i>
              <span>Admin Dashboard</span>
            </div>

            {stats && (
              <div className="admin-quick-stats">
                <div className="stat-pill" title="Người dùng"><i className="fa-solid fa-users"></i> {stats.total_users}</div>
                <div className="stat-pill" title="Phòng chờ"><i className="fa-solid fa-door-open"></i> {stats.active_rooms}</div>
                <div className="stat-pill" title="Trận đấu"><i className="fa-solid fa-gamepad"></i> {stats.total_matches}</div>
                <div className="stat-pill" title="Từ khóa"><i className="fa-solid fa-key"></i> {stats.total_keywords || keywords.length}</div>
              </div>
            )}
            
            {isInMatch && (
              <div style={{ display: 'flex', gap: '8px', padding: '0 12px' }}>
                <button className="admin-menu-item highlight danger next-btn-fixed" style={{ flex: 1 }} onClick={handleSkipPhase} disabled={isProcessing}>
                  <i className="fa-solid fa-forward-step"></i>
                  <span>{isProcessing ? 'SKIP...' : 'BỎ QUA PHASE'}</span>
                </button>
                <button className="admin-menu-item highlight spy-btn-fixed" style={{ flex: 1, backgroundColor: '#A00000', borderColor: '#FF3B30', color: '#fff' }} onClick={handleSetSpy} disabled={isProcessing}>
                  <i className="fa-solid fa-user-ninja"></i>
                  <span>SET SPY</span>
                </button>
              </div>
            )}

            <div className="admin-menu-scrollable">
              <button className="admin-menu-item" onClick={() => setShowSettings(true)}>
                <i className="fa-solid fa-gears"></i>
                <span>Cài đặt chi tiết</span>
              </button>

              <button className="admin-menu-item highlight" onClick={handleAddCoins} disabled={isProcessing}>
                <i className="fa-solid fa-coins"></i>
                <span>{isProcessing ? 'Đang xử lý...' : 'Tặng Xu (Test)'}</span>
              </button>

              <button className="admin-menu-item" onClick={handleAskAI} disabled={isProcessing}>
                <i className="fa-solid fa-robot"></i>
                <span>Check AI</span>
              </button>

              {isInRoom && (
                <button className="admin-menu-item highlight" onClick={handleAddPlayer} disabled={isProcessing}>
                  <i className="fa-solid fa-user-plus"></i>
                  <span>{isProcessing ? 'Đang thêm...' : 'Thêm Người Chơi (Test)'}</span>
                </button>
              )}
            </div>

            <div className="admin-menu-footer">
              Chế độ Admin đang bật
            </div>
          </>
        ) : (
          <div className="admin-integrated-settings animate-pop-in">
            <div className="modal-header">
              <h2>CÀI ĐẶT CHI TIẾT</h2>
              <button className="close-btn" onClick={() => setShowSettings(false)}>×</button>
            </div>
            
            <div className="modal-tabs">
              {(['settings', 'users', 'rooms', 'keywords', 'stats'] as const).map(tab => (
                <button 
                  key={tab} 
                  className={activeTab === tab ? 'active' : ''} 
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'settings' && 'Phase'}
                  {tab === 'users' && 'User'}
                  {tab === 'rooms' && 'Room'}
                  {tab === 'keywords' && 'Key'}
                  {tab === 'stats' && 'Stat'}
                </button>
              ))}
            </div>

            <div className="modal-body">
              {activeTab === 'settings' && (
                <form className="admin-settings-form" onSubmit={handleUpdateSettings}>
                  <div className="settings-grid">
                    <label>Mô tả: <input type="number" value={durations.describe_duration} onChange={e => setDurations({...durations, describe_duration: parseInt(e.target.value)})} /></label>
                    <label>Thảo luận: <input type="number" value={durations.discuss_duration} onChange={e => setDurations({...durations, discuss_duration: parseInt(e.target.value)})} /></label>
                    <label>Vote: <input type="number" value={durations.vote_duration} onChange={e => setDurations({...durations, vote_duration: parseInt(e.target.value)})} /></label>
                    <label>Đoán vai: <input type="number" value={durations.role_check_duration} onChange={e => setDurations({...durations, role_check_duration: parseInt(e.target.value)})} /></label>
                    <label>Kết quả vai: <input type="number" value={durations.role_check_result_duration} onChange={e => setDurations({...durations, role_check_result_duration: parseInt(e.target.value)})} /></label>
                  </div>
                  <button type="submit" disabled={isProcessing}>LƯU CÀI ĐẶT</button>
                </form>
              )}

              {activeTab === 'users' && (
                <div className="admin-table-container">
                  <table>
                    <thead>
                      <tr><th>User</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.user_id}>
                          <td className="user-name-td">{u.username}</td>
                          <td>
                            <button onClick={() => handleBanUser(u.user_id, u.active)} className={u.active ? 'ban' : 'unban'}>
                              {u.active ? 'Ban' : 'Ok'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'rooms' && (
                <div className="admin-table-container">
                  <table>
                    <thead>
                      <tr><th>Code</th><th>Del</th></tr>
                    </thead>
                    <tbody>
                      {rooms.map(r => (
                        <tr key={r.id}>
                          <td>{r.roomCode}</td>
                          <td><button onClick={() => handleDeleteRoom(r.id)} className="delete">×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'keywords' && (
                <div className="admin-table-container">
                  <table>
                    <thead>
                      <tr><th>Key 1</th><th>Key 2</th><th>×</th></tr>
                    </thead>
                    <tbody>
                      {keywords.map((k: any) => (
                        <tr key={k.id || k._id}>
                          <td>{k.keyword1 || k.keyword_1}</td>
                          <td>{k.keyword2 || k.keyword_2}</td>
                          <td><button onClick={() => handleDeleteKeyword(k.id || k._id)} className="delete">×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'stats' && stats && (
                <div className="admin-stats-grid">
                  <div className="stat-item"><span>User:</span> <strong>{stats.total_users}</strong></div>
                  <div className="stat-item"><span>Phòng:</span> <strong>{stats.active_rooms}</strong></div>
                  <div className="stat-item"><span>Trận:</span> <strong>{stats.total_matches}</strong></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMenu;
