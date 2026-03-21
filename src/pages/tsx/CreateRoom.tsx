import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import '../css/create-room.css';

interface CreateRoomProps {
  onClose: () => void;
  onConfirm: (roomData: any) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onClose, onConfirm }) => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomCode] = useState(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  });
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      // Gọi API tạo phòng
      const response = await axiosInstance.post('/rooms', {
        is_private: isPrivate,
        password: password,
        room_code: roomCode
      });
      
      const generatedRoomId = response.data.room_id;
      
      onConfirm({ isPrivate, roomCode: response.data.room_code, password });
      navigate(`/room/${generatedRoomId}`);
    } catch (error) {
      console.error('Lỗi khi tạo phòng:', error);
      alert('Không thể tạo phòng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-room-panel">
      {/* Nút quay lại */}
      <button className="create-room-back" onClick={onClose}>
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <h1 className="create-room-title">Tạo phòng</h1>

      <div className="create-room-content">
        <div className="room-info-box">
          <span className="room-code-label">Mã phòng : {roomCode}</span>
        </div>

        <div className="room-settings">
          <div className="setting-dropdown" onClick={() => setIsPrivate(!isPrivate)}>
            <span className="setting-value">{isPrivate ? 'Riêng tư' : 'Công khai'}</span>
            <i className={`fa-solid fa-chevron-${isPrivate ? 'up' : 'down'} dropdown-icon`}></i>
          </div>

          {isPrivate && (
            <div className="password-input-container">
              <span className="password-label">Mật mã:</span>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="room-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật mã..."
                />
                <i 
                  className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle-icon`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </div>
          )}
        </div>

        <button 
          className="create-room-confirm-btn" 
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
