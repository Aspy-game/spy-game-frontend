// =============================================
// ResultVote.tsx
// Màn hình kết quả Vote khi bản thân bị loại.
// Nhận onDone callback từ flow cha — không tự navigate cứng.
// =============================================

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import bgImage from '../../../../../assets/room/bg.jpg';
import '../../../../css/room/result-vote.css';
import useAuthStore from '../../../../../store/authStore';

interface Props {
  /** Số vòng hiển thị trên header badge. Mặc định 1. */
  round?: number;
  /** Gọi sau autoAdvanceMs, để flow cha quyết định đi đâu tiếp. */
  onDone?: () => void;
  /** Thời gian tự động chuyển (ms). Mặc định 4000. */
  autoAdvanceMs?: number;
}

const ResultVote: React.FC<Props> = ({
  round = 1,
  onDone,
  autoAdvanceMs = 4000,
}) => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const roomId = paramRoomId ?? '';

  const { user } = useAuthStore();
  const myDisplayName = user?.display_name ?? 'Tôi';
  const myAvatarUrl   = user?.avatar_url   ?? null;

  useEffect(() => {
    if (!onDone) return;
    const timer = setTimeout(onDone, autoAdvanceMs);
    return () => clearTimeout(timer);
  }, [onDone, autoAdvanceMs]);

  return (
    <div className="dn-screen" style={{ backgroundImage: `url(${bgImage})` }}>
      <header className="dn-header">
        <div className="dn-round-badge">
          <span className="dn-round-badge__text">Vòng {round}</span>
        </div>
        <div className="dn-header__title">KẾT QUẢ</div>
        <div className="dn-room-badge">
          <span className="dn-room-badge__text">Phòng: {roomId}</span>
        </div>
      </header>

      <div className="dn-timesup-overlay">
        <div className="rv-container">
          <div className="rv-eliminated-avatar">
            <div className="rv-avatar-wrap">
              {myAvatarUrl ? (
                <img src={myAvatarUrl} alt={myDisplayName} className="rv-avatar__img" />
              ) : (
                <span className="rv-avatar__emoji">🐻</span>
              )}
              <div className="rv-ghost-effect"></div>
              <div className="rv-cross-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18"
                    stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <span className="rv-avatar__name">{myDisplayName}</span>
          </div>
          <span className="rv-text">BẠN ĐÃ BỊ LOẠI!</span>
          <span className="rv-sub">Mọi người nghĩ bạn là Gián điệp...</span>
        </div>
      </div>
    </div>
  );
};

export default ResultVote;