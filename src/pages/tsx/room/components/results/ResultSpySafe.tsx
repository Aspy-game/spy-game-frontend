// =============================================
// ResultSpySafe.tsx
// Màn hình thông báo gián điệp chưa bị loại.
// Nhận onDone callback từ flow cha.
// =============================================

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import bgImage from '../../../../../assets/room/bg.jpg';
import '../../../../css/room/result-spy-safe.css';

const DEV_ROOM_ID = 'dev123';

interface Props {
  round?: number;
  onDone?: () => void;
  autoAdvanceMs?: number;
}

const ResultSpySafe: React.FC<Props> = ({
  round = 1,
  onDone,
  autoAdvanceMs = 4000,
}) => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const roomId = paramRoomId ?? DEV_ROOM_ID;

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
        <div className="dn-room-badge">
          <span className="dn-room-badge__text">Phòng: {roomId}</span>
        </div>
      </header>

      <div className="dn-timesup-overlay">
        <div className="rss-container">
          <div className="rss-spy-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2C10.8954 2 10 2.89543 10 4V5H14V4C14 2.89543 13.1046 2 12 2Z" fill="white"/>
              <path d="M6 10C6 6.68629 8.68629 4 12 4C15.3137 4 18 6.68629 18 10V11H6V10Z" fill="white"/>
              <path d="M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12V13C20 17.4183 16.4183 21 12 21C7.58172 21 4 17.4183 4 13V12Z" fill="white"/>
              <path d="M12 14C11.4477 14 11 14.4477 11 15V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V15C13 14.4477 12.5523 14 12 14Z" fill="rgba(0,0,0,0.5)"/>
            </svg>
          </div>
          <span className="rss-title">GIÁN ĐIỆP CHƯA BỊ LOẠI</span>
          <span className="rss-sub">Trò chơi vẫn tiếp tục...</span>
        </div>
      </div>
    </div>
  );
};

export default ResultSpySafe;