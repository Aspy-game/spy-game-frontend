import React from 'react';
import '../css/settings.css';

interface SettingsProps {
  onClose: () => void;
  onLogout: () => void;
  onChangePassword: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose, onLogout, onChangePassword }) => {
  return (
    <div className="settings-panel">
      <button className="settings-close" onClick={onClose}>
        <i className="fa-solid fa-xmark"></i>
      </button>

      <h1 className="settings-title">Cài đặt</h1>

      <div className="settings-content">
        <button className="settings-btn change-password-btn" onClick={onChangePassword}>
          <div className="btn-icon">
            <i className="fa-solid fa-key"></i>
          </div>
          <span className="btn-text"> Đổi mật khẩu</span>
        </button>

        <button className="settings-btn logout-btn" onClick={onLogout}>
          <div className="btn-icon">
            <i className="fa-solid fa-right-from-bracket"></i>
          </div>
          <span className="btn-text">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
