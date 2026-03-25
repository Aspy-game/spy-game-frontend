import React, { useState } from 'react';
import '../css/change-password.css';

interface ChangePasswordProps {
  onClose: () => void;
  onSubmit: (oldPwd: string, newPwd: string) => Promise<void>; // Make it async
  loading: boolean;
  error: string | null;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onClose, onSubmit, loading, error }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (oldPassword.length < 6 || newPassword.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('Mật khẩu mới không khớp!');
      return;
    }
    onSubmit(oldPassword, newPassword);
  };

  const displayError = localError || error;

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

        {displayError && <p className="cp-error">{displayError}</p>}

        <button type="submit" className="cp-submit-btn" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Xác nhận'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
