import React, { useState } from 'react';
import useSettingStore from '../../store/settingStore';
import '../css/settings.css';

interface SettingsProps {
  onClose: () => void;
  onLogout: () => void;
  onChangePassword: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose, onLogout, onChangePassword }) => {
  const { isMusicPlaying, toggleMusic, musicVolume, setMusicVolume } = useSettingStore();
  const [showRules, setShowRules] = useState(false);

  if (showRules) {
    return (
      <div className="rules-modal" style={{ zIndex: 3000 }}>
        <div className="rules-panel">
          <h1 className="rules-title">LUẬT CHƠI</h1>
          <div className="rules-content">
            <p>Game “Không phải tôi” là trò chơi mang tính suy luận và tương tác nhóm, trong đó người chơi phải sử dụng khả năng quan sát, tư duy logic và kỹ năng giao tiếp để tìm ra nhân vật gián điệp đang ẩn mình trong nhóm. Trò chơi bắt đầu khi người chơi tham gia vào một phòng chơi và hệ thống tiến hành phân vai ngẫu nhiên cho từng người. Phần lớn người chơi sẽ thuộc vai trò dân thường và được cung cấp cùng một từ khóa hoặc chủ đề bí mật. Ngược lại, người giữ vai trò gián điệp sẽ không nhận được từ khóa này và phải dựa vào các thông tin được chia sẻ trong quá trình chơi để suy đoán nội dung mà những người khác đang biết.</p>
            <p>Sau khi phân vai, trò chơi bước vào vòng thảo luận. Ở mỗi lượt, từng người chơi lần lượt mô tả hoặc đưa ra ý kiến liên quan đến từ khóa bằng những câu nói gián tiếp, tránh nói quá rõ ràng để không tiết lộ trực tiếp nội dung cho gián điệp. Trong quá trình này, gián điệp phải khéo léo đặt câu trả lời sao cho không bị nghi ngờ, đồng thời cố gắng suy luận ra từ khóa dựa trên các phát biểu của dân thường. Người chơi còn lại sẽ quan sát, so sánh và phân tích câu trả lời của nhau nhằm phát hiện ra những biểu hiện bất thường.</p>
            <p>Sau khi kết thúc các lượt thảo luận, trò chơi tiến hành giai đoạn bỏ phiếu. Mỗi người chơi sẽ lựa chọn một người mà mình nghi ngờ là gián điệp. Người nhận được số phiếu cao nhất sẽ bị loại khỏi trò chơi. Nếu người bị loại là gián điệp, dân thường sẽ giành chiến thắng. Ngược lại, nếu dân thường bị loại hoặc gián điệp tồn tại đến cuối trò chơi, gián điệp sẽ chiến thắng. Trò chơi kết thúc khi điều kiện thắng của một trong hai phe được thỏa mãn.</p>
          </div>
          <button className="rules-close" onClick={() => setShowRules(false)}>×</button>
        </div>
      </div>
    );
  }

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

        <button className="settings-btn" onClick={() => setShowRules(true)} style={{ background: '#2E8B57' }}>
          <div className="btn-icon">
            <i className="fa-solid fa-scroll"></i>
          </div>
          <span className="btn-text">Luật chơi</span>
        </button>

        <button className="settings-btn logout-btn" onClick={onLogout}>
          <div className="btn-icon">
            <i className="fa-solid fa-right-from-bracket"></i>
          </div>
          <span className="btn-text">Đăng xuất</span>
        </button>

        <div className="music-control-group">
          <button className="music-btn" onClick={toggleMusic}>
            <i className={`fa-solid ${isMusicPlaying ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
          </button>

          <input
            type="range"
            className="volume-slider"
            min="0" max="1" step="0.01"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            disabled={!isMusicPlaying}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
