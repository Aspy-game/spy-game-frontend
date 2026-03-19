// =============================================
// AfterR1View.tsx
// Màn hiển thị sau khi Vòng 1 kết thúc.
// Thông báo vòng 1 xong, chuẩn bị chuyển sang Vòng 2.
// =============================================

import React from 'react';

interface Props {
  onContinue?: () => void;
}

const AfterR1View: React.FC<Props> = ({ onContinue }) => {
  return (
    <div className="rf-overlay rf-after-r1-overlay">
      <div className="rf-after-r1-box">
        <div className="rf-after-r1-icon">🏁</div>
        <h2 className="rf-after-r1-title">Vòng 1 kết thúc!</h2>
        <p className="rf-after-r1-sub">Chuẩn bị cho Vòng 2 — thử thách thực sự bắt đầu</p>

        {onContinue && (
          <button className="rf-btn rf-btn--continue" onClick={onContinue}>
            Tiếp tục →
          </button>
        )}
      </div>
    </div>
  );
};

export default AfterR1View;