import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import axiosInstance from '../../api/axiosInstance';
import '../css/home.css'; // Reusing some base styles if available
import type { Role } from '../../types';

interface Stats {
  total_users: number;
  active_rooms: number;
  total_matches: number;
  total_keywords: number;
}

interface AdminUser {
  user_id: number;
  username: string;
  display_name: string;
  email: string;
  role: Role;
  active: boolean;
}

interface AdminRoom {
  id: string;
  roomCode: string;
  hostId: string;
  currentPlayers: number;
  maxPlayers: number;
  status: string;
}

interface KeywordPair {
  id: string;
  keyword1: string;
  keyword2: string;
  category: string;
}

interface GameSettings {
  maxPlayers: number;
  minPlayers: number;
  spiesCount: number;
  describeDuration: number;
  discussDuration: number;
  voteDuration: number;
  roleCheckDuration: number;
  roleCheckResultDuration: number;
}

const Admin: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'rooms' | 'keywords' | 'settings'>('stats');
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [keywords, setKeywords] = useState<KeywordPair[]>([]);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Keyword form state
  const [newKeyword, setNewKeyword] = useState({ keyword1: '', keyword2: '', category: '' });

  useEffect(() => {
    const isAdmin = user?.role === 'ROLE_ADMIN'
    if (!user || !isAdmin) {
      navigate('/lobby');
      return;
    }
    fetchData();
  }, [user, navigate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
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
        setKeywords(res.data);
      } else if (activeTab === 'settings') {
        const res = await axiosInstance.get('/admin/settings');
        setSettings(res.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    // Map camelCase to snake_case for backend
    const payload = {
      max_players: settings.maxPlayers,
      min_players: settings.minPlayers,
      spies_count: settings.spiesCount,
      describe_duration: settings.describeDuration,
      discuss_duration: settings.discussDuration,
      vote_duration: settings.voteDuration,
      role_check_duration: settings.roleCheckDuration,
      role_check_result_duration: settings.roleCheckResultDuration,
    };

    try {
      await axiosInstance.patch('/admin/settings', payload);
      alert('Cập nhật cài đặt thành công!');
    } catch (error) {
      alert('Không thể cập nhật cài đặt');
    }
  };

  const handleBanUser = async (id: number, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/admin/users/${id}/ban`, { active: !currentStatus });
      fetchData();
    } catch (error) {
      alert('Không thể cập nhật trạng thái người dùng');
    }
  };

  const handleUpdateRole = async (id: number, newRole: Role) => {
    try {
      await axiosInstance.patch(`/admin/users/${id}/role`, { role: newRole });
      fetchData();
    } catch (error) {
      alert('Không thể cập nhật vai trò');
    }
  };

  const handleResetPassword = async (id: number) => {
    const newPassword = prompt('Nhập mật khẩu mới:');
    if (!newPassword) return;
    try {
      await axiosInstance.post(`/admin/users/${id}/reset-password`, { new_password: newPassword });
      alert('Đã đổi mật khẩu thành công');
    } catch (error) {
      alert('Không thể đổi mật khẩu');
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      await axiosInstance.delete(`/admin/rooms/${id}`);
      fetchData();
    } catch (error) {
      alert('Không thể xóa phòng');
    }
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/admin/keywords', newKeyword);
      setNewKeyword({ keyword1: '', keyword2: '', category: '' });
      fetchData();
    } catch (error) {
      alert('Không thể thêm từ khóa');
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (!window.confirm('Xóa từ khóa này?')) return;
    try {
      await axiosInstance.delete(`/admin/keywords/${id}`);
      fetchData();
    } catch (error) {
      alert('Không thể xóa từ khóa');
    }
  };

  return (
    <div className="admin-page" style={{ 
      padding: '40px', 
      color: 'white', 
      background: 'rgba(0,0,0,0.85)', 
      height: '100%', 
      overflowY: 'auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', color: '#ffcc00', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          ADMIN DASHBOARD
        </h1>
        <button 
          onClick={() => navigate('/lobby')}
          style={{ 
            padding: '10px 20px', 
            background: '#444', 
            border: 'none', 
            color: 'white', 
            borderRadius: '8px', 
            cursor: 'pointer' 
          }}
        >
          Quay lại Lobby
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        {(['stats', 'users', 'rooms', 'keywords', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 25px',
              background: activeTab === tab ? '#ffcc00' : '#333',
              color: activeTab === tab ? '#000' : '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'stats' && 'Thống kê'}
            {tab === 'users' && 'Người dùng'}
            {tab === 'rooms' && 'Phòng chơi'}
            {tab === 'keywords' && 'Từ khóa'}
            {tab === 'settings' && 'Cài đặt game'}
          </button>
        ))}
      </div>

      <div className="admin-content" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '25px' }}>
        {loading && <p>Đang tải...</p>}

        {activeTab === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Tổng người dùng', value: stats.total_users, color: '#4facfe' },
              { label: 'Phòng đang hoạt động', value: stats.active_rooms, color: '#00f2fe' },
              { label: 'Tổng số trận', value: stats.total_matches, color: '#f093fb' },
              { label: 'Bộ từ khóa', value: stats.total_keywords, color: '#f6d365' },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: `1px solid ${item.color}44` }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '14px' }}>{item.label}</h3>
                <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Username</th>
                <th style={{ padding: '12px' }}>Tên hiển thị</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Trạng thái</th>
                <th style={{ padding: '12px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '12px' }}>{u.user_id}</td>
                  <td style={{ padding: '12px' }}>{u.username}</td>
                  <td style={{ padding: '12px' }}>{u.display_name}</td>
                  <td style={{ padding: '12px' }}>
                    <select 
                      value={u.role} 
                      onChange={(e) => handleUpdateRole(u.user_id, e.target.value as Role)}
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        background: u.role === 'ROLE_ADMIN' ? '#ff4d4d' : '#444', 
                        color: 'white',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="ROLE_USER">USER</option>
                      <option value="ROLE_ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: u.active ? '#4cd137' : '#e84118' }}>
                      {u.active ? 'Hoạt động' : 'Bị chặn'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleBanUser(u.user_id, u.active)}
                      style={{ padding: '6px 12px', background: u.active ? '#e84118' : '#4cd137', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                    >
                      {u.active ? 'Chặn' : 'Bỏ chặn'}
                    </button>
                    <button 
                      onClick={() => handleResetPassword(u.user_id)}
                      style={{ padding: '6px 12px', background: '#444', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                    >
                      Reset Pass
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'rooms' && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Mã phòng</th>
                <th style={{ padding: '12px' }}>Host ID</th>
                <th style={{ padding: '12px' }}>Người chơi</th>
                <th style={{ padding: '12px' }}>Trạng thái</th>
                <th style={{ padding: '12px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '12px' }}>{r.roomCode}</td>
                  <td style={{ padding: '12px' }}>{r.hostId}</td>
                  <td style={{ padding: '12px' }}>{r.currentPlayers}/{r.maxPlayers}</td>
                  <td style={{ padding: '12px' }}>{r.status}</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleDeleteRoom(r.id)}
                      style={{ padding: '6px 12px', background: '#e84118', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'settings' && settings && (
          <form onSubmit={handleUpdateSettings} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'grid', gap: '20px' }}>
              {[
                { label: 'Số người chơi tối đa', key: 'maxPlayers', min: 2, max: 20 },
                { label: 'Số người chơi tối thiểu', key: 'minPlayers', min: 2, max: 10 },
                { label: 'Số lượng gián điệp', key: 'spiesCount', min: 1, max: 5 },
                { label: 'Thời gian mô tả (giây)', key: 'describeDuration', min: 10, max: 300 },
                { label: 'Thời gian thảo luận (giây)', key: 'discussDuration', min: 10, max: 300 },
                { label: 'Thời gian bỏ phiếu (giây)', key: 'voteDuration', min: 10, max: 120 },
                { label: 'Thời gian kiểm tra vai (giây)', key: 'roleCheckDuration', min: 5, max: 60 },
                { label: 'Thời gian hiện kết quả vai (giây)', key: 'roleCheckResultDuration', min: 5, max: 60 },
              ].map(field => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ color: '#ccc', fontSize: '14px' }}>{field.label}</label>
                    <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>{settings[field.key as keyof GameSettings]}</span>
                  </div>
                  <input 
                    type="range" 
                    min={field.min} 
                    max={field.max} 
                    value={settings[field.key as keyof GameSettings]}
                    onChange={e => setSettings({...settings, [field.key]: parseInt(e.target.value)})}
                    style={{ width: '100%', accentColor: '#ffcc00' }}
                  />
                </div>
              ))}
              <button 
                type="submit" 
                style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  background: '#ffcc00', 
                  color: '#000', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                Lưu cài đặt
              </button>
            </div>
          </form>
        )}

        {activeTab === 'keywords' && (
          <div>
            <form onSubmit={handleAddKeyword} style={{ display: 'flex', gap: '10px', marginBottom: '25px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <input 
                type="text" 
                placeholder="Từ khóa 1" 
                value={newKeyword.keyword1}
                onChange={e => setNewKeyword({...newKeyword, keyword1: e.target.value})}
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                required
              />
              <input 
                type="text" 
                placeholder="Từ khóa 2" 
                value={newKeyword.keyword2}
                onChange={e => setNewKeyword({...newKeyword, keyword2: e.target.value})}
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                required
              />
              <input 
                type="text" 
                placeholder="Thể loại" 
                value={newKeyword.category}
                onChange={e => setNewKeyword({...newKeyword, category: e.target.value})}
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                required
              />
              <button type="submit" style={{ padding: '10px 20px', background: '#4cd137', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                Thêm
              </button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Từ khóa 1</th>
                  <th style={{ padding: '12px' }}>Từ khóa 2</th>
                  <th style={{ padding: '12px' }}>Thể loại</th>
                  <th style={{ padding: '12px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map(k => (
                  <tr key={k.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '12px' }}>{k.keyword1}</td>
                    <td style={{ padding: '12px' }}>{k.keyword2}</td>
                    <td style={{ padding: '12px' }}>{k.category}</td>
                    <td style={{ padding: '12px' }}>
                      <button 
                        onClick={() => handleDeleteKeyword(k.id)}
                        style={{ padding: '6px 12px', background: '#e84118', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
