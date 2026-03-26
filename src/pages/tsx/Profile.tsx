import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import axiosInstance from '../../api/axiosInstance';
import '../css/profile.css';

// Import các hình ảnh avatar từ thư mục img
import avt1 from '../../../img/soi.jpg';
import avt2 from '../../../img/Gemini_Generated_Image_59nsf059nsf059ns.png';
import avt3 from '../../../img/Gemini_Generated_Image_8nnqwq8nnqwq8nnq.png';
import avt4 from '../../../img/hinhcao.jpg';
import avt5 from '../../../img/Gemini_Generated_Image_jhisy6jhisy6jhis.png';
import avt6 from '../../../img/Gemini_Generated_Image_mz01hgmz01hgmz01.png';
import avt7 from '../../../img/Gemini_Generated_Image_olvekholvekholve.png';
import avt8 from '../../../img/chon.jpg';

interface ProfileProps {
  onClose: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChoosingAvatar, setIsChoosingAvatar] = useState(false);
  const [newName, setNewName] = useState(user?.display_name || 'Cáo');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user?.avatar_url || null);
  const [history, setHistory] = useState<any[]>([]);
  const [totalGames, setTotalGames] = useState(user?.stats?.total_games || 0);

  React.useEffect(() => {
    fetchHistory();
    fetchFullProfile();
  }, []);

  const fetchFullProfile = async () => {
    try {
      const res = await axiosInstance.get('/users/me');
      if (res.data && res.data.stats) {
        setTotalGames(res.data.stats.total_games);
        // Cập nhật store nếu cần, nhưng ở đây chỉ cần cho Profile
      }
    } catch (error) {
      console.error("Lỗi tải thông tin chi tiết:", error);
    }
  };

  const handleCopyId = () => {
    if (user?.user_id) {
      navigator.clipboard.writeText(String(user.user_id));
      // Có thể thêm toast thông báo ở đây nếu cần
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get('/matches/history');
      setHistory(res.data || []);
    } catch (error) {
      console.error("Lỗi tải lịch sử đấu:", error);
    }
  };

  const avatars = [avt1, avt2, avt3, avt4, avt5, avt6, avt7, avt8];


  const handleConfirm = async () => {
    if (isChoosingAvatar) {
      if (user && selectedAvatar) {
        try {
          await axiosInstance.put('/users/me', { avatar_url: selectedAvatar });
          setUser({ ...user, avatar_url: selectedAvatar });
        } catch (error) {
          console.error("Lỗi cập nhật avatar:", error);
        }
      }
      setIsChoosingAvatar(false);
      return;
    }

    if (isEditing) {
      if (user && newName) {
        try {
          await axiosInstance.put('/users/me', { display_name: newName });
          setUser({ ...user, display_name: newName });
        } catch (error) {
          console.error("Lỗi cập nhật tên:", error);
        }
      }
      setIsEditing(false);
      return;
    }

    onClose();
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <h1 className="profile-header-title">
          {isChoosingAvatar ? 'Chọn ảnh đại diện' : 'Thông tin cá nhân'}
        </h1>

        {isChoosingAvatar ? (
          <div className="avatar-selection-grid">
            {avatars.map((avt, index) => (
              <div
                key={index}
                className={`avatar-item-option ${selectedAvatar === avt ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(avt)}
              >
                <img src={avt} alt={`Avatar ${index + 1}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-content">
            <div className="profile-left-col">
              <div
                className="profile-avatar-large clickable"
                onClick={() => setIsChoosingAvatar(true)}
              >
                {selectedAvatar || user?.avatar_url ? (
                  <img src={selectedAvatar || user?.avatar_url} alt="User Avatar" />
                ) : (
                  <span className="profile-avatar-placeholder">
                    {user?.display_name?.charAt(0) || 'C'}
                  </span>
                )}
              </div>

              <div className="profile-details">
                <div className="profile-field">
                  <span className="field-label">ID:</span>
                  <div className="id-display-group">
                    <span className="field-value">
                      {user?.user_id ? (
                        (() => {
                          const idStr = String(user.user_id);
                          return idStr.length > 5 ? idStr.substring(0, 5) + "..." : idStr;
                        })()
                      ) : '---'}
                    </span>
                    <i
                      className="fa-regular fa-copy copy-icon"
                      title="Copy ID"
                      onClick={handleCopyId}
                    ></i>
                  </div>
                </div>
                <div className="profile-field">
                  <span className="field-label">Tên:</span>
                  {isEditing ? (
                    <div className="edit-name-container">
                      <input
                        type="text"
                        className="edit-name-input"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="name-display-group">
                      <span className="field-value">{user?.display_name || 'Cáo'}</span>
                      <i
                        className="fa-solid fa-pen-to-square edit-icon"
                        onClick={() => setIsEditing(true)}
                      ></i>
                    </div>
                  )}
                </div>
                <div className="profile-field">
                  <span className="field-label">Đã chơi:</span>
                  <span className="field-value">{totalGames}</span>
                </div>
              </div>
            </div>

            {/* --- GAME HISTORY --- */}
            <div className="profile-history-section">
              <h3 className="history-title">Lịch sử 20 trận gần nhất</h3>
              <div className="history-list">
                {history.length > 0 ? (
                  history.map((match, idx) => (
                    <div key={idx} className="history-item">
                      <span className={`history-role ${match.role}`}>
                        {match.role === 'spy' ? 'Spy' : match.role === 'infected' ? 'Bị tha hóa' : 'Dân'}
                      </span>
                      <span className={`history-result ${(match.status || (match.did_win ? 'WIN' : 'LOSE')).toLowerCase()}`}>
                        {match.status === 'AFK' ? 'AFK' : (match.did_win ? 'Thắng' : 'Thua')}
                      </span>
                      <span className="history-date">
                        {match.started_at ? new Date(match.started_at).toLocaleDateString('vi-VN') : '---'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-history">Chưa có dữ liệu trận đấu.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="profile-actions">
          <button className="btn-confirm-profile" onClick={handleConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
