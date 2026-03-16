import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/create-room.css';

interface CreateRoomProps {
  onClose: () => void;
  onConfirm: (roomData: any) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({ onClose, onConfirm }) => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const roomCode = "CK123"; // Mock room code as seen in Figma
  const navigate = useNavigate();

  const handleConfirm = () => {
    onConfirm({ isPrivate, roomCode, password });
    navigate(`/room/${roomCode}`);
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
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
};

export default CreateRoom;
