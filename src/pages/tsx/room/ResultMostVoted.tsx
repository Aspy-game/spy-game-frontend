// =============================================
// ResultMostVoted.tsx
// Màn hình thông báo người bị vote nhiều nhất.
// Nhận data + onDone callback từ flow cha.
// =============================================

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import bgImage from '../../../assets/room/bg.jpg';
import '../../css/room/result-most-voted.css';

const DEV_ROOM_ID = 'dev123';

interface MostVotedPlayer {
  displayName: string;
  emoji: string;
  bgColor: string;
  voteCount: number;
  avatarUrl?: string | null;
}

interface Props {
  /** [BE] Người bị vote nhiều nhất */
  player?: MostVotedPlayer;
  /** Số vòng hiển thị. Mặc định 1. */
  round?: number;
  /** Gọi sau autoAdvanceMs */
  onDone?: () => void;
  autoAdvanceMs?: number;
}

const DEFAULT_PLAYER: MostVotedPlayer = {
  displayName: 'Mèo',
  emoji: '🐱',
  bgColor: 'linear-gradient(135deg,#C8A882,#9A7050)',
  voteCount: 4,
  avatarUrl: null,
};

const ResultMostVoted: React.FC<Props> = ({
  player = DEFAULT_PLAYER,
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
        <div className="rmv-container">
          <span className="rmv-title">NGƯỜI BỊ VOTE NHIỀU NHẤT</span>
          <div className="rmv-avatar-card">
            <div className="rmv-avatar-circle" style={{ background: player.bgColor }}>
              {player.avatarUrl ? (
                <img src={player.avatarUrl} alt={player.displayName} className="rmv-avatar-img" />
              ) : (
                <span className="rmv-avatar-emoji">{player.emoji}</span>
              )}
            </div>
            <span className="rmv-player-name">{player.displayName}</span>
            <div className="rmv-vote-count">
              <span className="rmv-count-num">{player.voteCount}</span>
              <span className="rmv-count-label">VOTES</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultMostVoted;