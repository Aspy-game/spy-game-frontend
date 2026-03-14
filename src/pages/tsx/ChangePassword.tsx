import React, { useState } from 'react';
import '../css/change-password.css';

interface ChangePasswordProps {
  onClose: () => void;
  onSubmit: (oldPwd: string, newPwd: string) => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    onSubmit(oldPassword, newPassword);
  };

  return (
    <div className="change-password-panel">
      <button className="cp-close" onClick={onClose}>
        <i className="fa-solid fa-xmark"></i>
      </button>

      <h1 className="cp-title">Đổi mật khẩu</h1>

      <form className="cp-form" onSubmit={handleSubmit}>
        <div className="cp-field-row">
          <label className="cp-label">Mật khẩu cũ:</label>
          <div className="cp-input-wrapper">
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <button type="button" className="cp-eye" onClick={() => setShowOld(!showOld)}>
              <i className={showOld ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
            </button>
          </div>
        </div>

        <div className="cp-field-row">
          <label className="cp-label">Mật khẩu mới:</label>
          <div className="cp-input-wrapper">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="button" className="cp-eye" onClick={() => setShowNew(!showNew)}>
              <i className={showNew ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
            </button>
          </div>
        </div>

        <div className="cp-field-row">
          <label className="cp-label">Xác nhận mật khẩu mới:</label>
          <div className="cp-input-wrapper">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="button" className="cp-eye" onClick={() => setShowConfirm(!showConfirm)}>
              <i className={showConfirm ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
            </button>
          </div>
        </div>

        <button type="submit" className="cp-submit-btn">
          Xác nhận
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
