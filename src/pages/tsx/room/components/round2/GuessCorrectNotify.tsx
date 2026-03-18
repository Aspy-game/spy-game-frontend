// =============================================
// GuessCorrectNotify.tsx
// Màn thông báo "Đoán đúng rồi" hiện ra trước khi chuyển sang
// màn hỏi điều khiển AI. Tự động chuyển sau 3 giây hoặc khi
// người chơi bấm nút.
// =============================================

import React, { useEffect, useState } from 'react';

interface Props {
  /** Gọi khi hết thời gian hoặc người chơi bấm tiếp tục */
  onDone: () => void;
  /** Thời gian tự động chuyển (ms). Mặc định 3000ms */
  autoAdvanceMs?: number;
}

const GuessCorrectNotify: React.FC<Props> = ({ onDone, autoAdvanceMs = 3000 }) => {
  const [remaining, setRemaining] = useState(Math.ceil(autoAdvanceMs / 1000));

  useEffect(() => {
    // Đếm ngược và tự chuyển màn
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="rf-overlay rf-correct-notify-overlay" onClick={onDone}>
      <div
        className="rf-correct-notify-box"
        onClick={(e) => e.stopPropagation()} // Ngăn click nền đóng ngay
      >
        {/* Countdown badge */}
        <div className="rf-correct-notify-timer">{remaining}</div>

        {/* Main message */}
        <h2 className="rf-correct-notify-title">Chúc mừng bạn đã chọn đúng</h2>
        <p className="rf-correct-notify-sub">Bạn sẽ được khả năng thao túng AI</p>
        <p className="rf-correct-notify-hint">Hãy sử dụng một cách thông minh nhé</p>

        {/* Manual skip button */}
        <button className="rf-btn rf-btn--continue" onClick={onDone}>
          Tiếp tục →
        </button>
      </div>
    </div>
  );
};

export default GuessCorrectNotify;