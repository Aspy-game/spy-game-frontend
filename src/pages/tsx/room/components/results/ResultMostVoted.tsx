// =============================================
// ResultMostVoted.tsx
// Màn hình thông báo người bị vote nhiều nhất.
// Nhận data + onDone callback từ flow cha.
// =============================================

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import bgImage from '../../../../../assets/room/bg.jpg';
import '../../../../css/room/result-most-voted.css';
import { gameService } from '../../../../../services';

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

const ResultMostVoted: React.FC<Props> = ({
  player: initialPlayer,
  round: initialRound = 1,
  onDone,
  autoAdvanceMs = 4000,
}) => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const roomId = paramRoomId ?? '';

  const [player, setPlayer] = useState<MostVotedPlayer | undefined>(initialPlayer);
  const [round, setRound]   = useState<number>(initialRound);
  const [isLoading, setIsLoading] = useState(!initialPlayer);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (initialPlayer) return;

    const fetchData = async () => {
      if (!roomId) {
        setError('Không tìm thấy ID phòng chơi.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = await gameService.getMostVotedResult(roomId);
        if (result && result.player) {
          setPlayer(result.player);
          setRound(result.round);
        } else {
          setError('Không có dữ liệu người bị loại.');
        }
      } catch (err) {
        console.error('Failed to fetch most voted result', err);
        setError('Không thể tải kết quả bình chọn.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roomId, initialPlayer]);

  useEffect(() => {
    if (!onDone) return;
    const timer = setTimeout(onDone, autoAdvanceMs);
    return () => clearTimeout(timer);
  }, [onDone, autoAdvanceMs]);

  if (isLoading) {
    return (
      <div className="dn-screen" style={{ backgroundImage: `url(${bgImage})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#fff', fontSize: '24px', fontFamily: "'Baloo Bhaijaan 2', cursive" }}>Đang tải kết quả...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="dn-screen" style={{ backgroundImage: `url(${bgImage})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ff4d4d', fontSize: '24px', fontFamily: "'Baloo Bhaijaan 2', cursive", marginBottom: '20px' }}>{error || 'Đã xảy ra lỗi không xác định.'}</div>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#CF9325', color: '#fff', cursor: 'pointer' }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

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
          <span className="rmv-title">THÔNG BÁO LOẠI</span>
          <div className="rmv-avatar-card">
            <div className="rmv-avatar-circle" style={{ background: player.bgColor }}>
              {player.avatarUrl ? (
                <img src={player.avatarUrl} alt={player.displayName} className="rmv-avatar-img" />
              ) : (
                <span className="rmv-avatar-emoji">{player.emoji}</span>
              )}
            </div>
            <span className="rmv-player-name">Người chơi {player.displayName} đã bị loại!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultMostVoted;