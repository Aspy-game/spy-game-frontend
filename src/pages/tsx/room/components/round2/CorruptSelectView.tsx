// =============================================
// CorruptSelectView.tsx
// Màn chọn người để tha hóa (Round 3 mở đầu).
// Chỉ Spy mới thấy màn này.
// Layout: full scene avatar như VoteFlow,
//   click avatar → chọn → xác nhận → hiện thông báo → onComplete
// =============================================

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import bgImage from '../../../../../assets/room/bg.jpg';
import '../../../../css/room/describe-notify.css';
import '../../../../css/room/corrupt-select.css';
import { gameService } from '../../../../../services';
import useAuthStore from '../../../../../store/authStore';
import type { Player } from '../../../../../types/models';

// ── Layout (giống DescribeNotify) ─────────────────────────────
const AVATAR_POSITIONS: Record<number, { top: number; left: number }> = {
  0: { top: 0,   left: 303 },
  1: { top: 192, left: 572 },
  2: { top: 481, left: 592 },
  3: { top: 656, left: 303 },
  4: { top: 481, left: 0   },
  5: { top: 192, left: 0   },
};

const SEAT_DISPLAY_ORDER: Record<number, number> = {
  5: 1, 4: 2, 0: 3, 3: 4, 1: 5, 2: 6,
};

// ── Props ─────────────────────────────────────────────────────
interface Props {
  roomId?: string;
  round?: number;
  /** Giây đếm ngược để chọn. Mặc định 15. */
  selectSeconds?: number;
  /** Gọi sau khi xác nhận + thông báo → flow cha xử lý tiếp */
  onComplete?: (corruptedPlayerId: number) => void;
}

type Phase = 'SELECTING' | 'CONFIRMING' | 'CONFIRMED' | 'TIMEOUT';

// ── Component ─────────────────────────────────────────────────
const CorruptSelectView: React.FC<Props> = ({
  roomId: roomIdProp,
  round = 3,
  selectSeconds = 15,
  onComplete,
}) => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const roomId = roomIdProp ?? paramRoomId ?? '';

  const { user } = useAuthStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!roomId) {
        setError('Không tìm thấy ID phòng chơi.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const roomData = await gameService.getRoomDetail(roomId);
        // Chỉ hiển thị những người chơi khác, không phải mình
        const otherPlayers = roomData.players.filter(p => p.id !== user?.user_id && p.displayName !== (user?.display_name ?? 'Tôi'));
        setPlayers(otherPlayers);
      } catch (err) {
        console.error('Failed to fetch players for corruption', err);
        setError('Không thể tải danh sách người chơi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayers();
  }, [roomId, user?.user_id, user?.display_name]);

  const [phase, setPhase]               = useState<Phase>('SELECTING');
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const [countdown, setCountdown]       = useState(selectSeconds);

  // Đếm ngược khi SELECTING
  useEffect(() => {
    if (phase !== 'SELECTING') return;
    if (countdown <= 0) {
      setPhase('TIMEOUT');
      return;
    }
    const t = setTimeout(() => setCountdown(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, phase]);

  // Timeout → tự chọn random rồi onComplete sau 3s
  useEffect(() => {
    if (phase !== 'TIMEOUT') return;
    const others = players.filter(p => !p.isMe);
    const random = others[Math.floor(Math.random() * others.length)];
    const t = setTimeout(() => onComplete?.(random.id), 3000);
    return () => clearTimeout(t);
  }, [phase, players, onComplete]);

  // CONFIRMED → onComplete sau 2s
  useEffect(() => {
    if (phase !== 'CONFIRMED') return;
    const t = setTimeout(() => onComplete?.(selectedId!), 2000);
    return () => clearTimeout(t);
  }, [phase, selectedId, onComplete]);

  const handleAvatarClick = (player: Player) => {
    if (player.isMe || phase !== 'SELECTING') return;
    setSelectedId(player.id);
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    try {
      await gameService.infectPlayer(roomId, selectedId);
      setPhase('CONFIRMED');
    } catch (err) {
      console.error('Failed to infect player', err);
    }
  };

  const selectedPlayer = players.find(p => p.id === selectedId);

  if (isLoading) {
    return (
      <div className="dn-screen" style={{ backgroundImage: `url(${bgImage})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#fff', fontSize: '24px', fontFamily: "'Baloo Bhaijaan 2', cursive" }}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dn-screen" style={{ backgroundImage: `url(${bgImage})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ff4d4d', fontSize: '24px', fontFamily: "'Baloo Bhaijaan 2', cursive", marginBottom: '20px' }}>{error}</div>
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

      {/* ── Header ── */}
      <header className="dn-header">
        <div className="dn-round-badge">
          <span className="dn-round-badge__text">Vòng {round}</span>
        </div>
        <div className="dn-room-badge">
          <span className="dn-room-badge__text">Phòng: {roomId}</span>
        </div>
      </header>

      {/* ── Instruction badge ── */}
      {phase === 'SELECTING' && (
        <div className="cs-instruction-badge">
          <span className="cs-instruction-icon">☠️</span>
          <span className="cs-instruction-text">Chọn người để tha hóa</span>
        </div>
      )}

      {/* ── Countdown ── */}
      {phase === 'SELECTING' && (
        <div className="cs-countdown-badge">
          <span className="dn-countdown-badge__icon">⏳</span>
          <span className="dn-countdown-badge__num">{countdown}</span>
        </div>
      )}

      {/* ── Avatar grid ── */}
      {(phase === 'SELECTING' || phase === 'CONFIRMING') && (
        <div className="dn-avatars">
          {players.map(player => {
            const pos      = AVATAR_POSITIONS[player.seatIndex] ?? { top: 0, left: 0 };
            const order    = SEAT_DISPLAY_ORDER[player.seatIndex] ?? (player.seatIndex + 1);
            const label    = player.isMe ? `${order}. Tôi` : `${order}. ${player.displayName}`;
            const isSelected = selectedId === player.id;
            const isMe     = !!player.isMe;

            return (
              <div
                key={player.id}
                className={[
                  `dn-avatar dn-avatar--a${player.seatIndex}`,
                  isSelected          ? 'cs-avatar--selected'  : '',
                  !isMe && !isSelected ? 'cs-avatar--hoverable' : '',
                  isMe                ? 'cs-avatar--me'         : '',
                ].filter(Boolean).join(' ')}
                style={{
                  top: pos.top,
                  left: pos.left,
                  background: player.bgColor,
                  cursor: isMe ? 'default' : 'pointer',
                }}
                onClick={() => handleAvatarClick(player)}
              >
                {player.avatarUrl ? (
                  <img src={player.avatarUrl} alt={player.displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 72 }}>{player.emoji}</span>
                )}

                {/* Icon tha hóa khi được chọn */}
                {isSelected && (
                  <div className="cs-corrupt-badge">☠️</div>
                )}

                {/* Mờ avatar mình ra */}
                {isMe && (
                  <div className="cs-me-overlay" />
                )}

                <div className={`dn-name-tag${isMe ? ' dn-name-tag--me' : ''}`}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Nút xác nhận ── */}
      {phase === 'SELECTING' && (
        <div className="cs-confirm-wrap">
          <button
            className={`cs-confirm-btn${!selectedId ? ' cs-confirm-btn--disabled' : ''}`}
            disabled={!selectedId}
            onClick={handleConfirm}
          >
            {selectedId
              ? `☠️ Tha hóa ${selectedPlayer?.displayName}`
              : 'Chọn một người chơi'}
          </button>
        </div>
      )}

      {/* ── Overlay xác nhận ── */}
      {phase === 'CONFIRMED' && selectedPlayer && (
        <div className="dn-timesup-overlay">
          <div className="cs-confirmed-box">
            <div className="cs-confirmed-icon">☠️</div>
            <h2 className="cs-confirmed-title">Đã tha hóa!</h2>
            <div
              className="cs-confirmed-avatar"
              style={{ background: selectedPlayer.bgColor }}
            >
              {selectedPlayer.avatarUrl ? (
                <img src={selectedPlayer.avatarUrl} alt={selectedPlayer.displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <span style={{ fontSize: 52 }}>{selectedPlayer.emoji}</span>
              )}
            </div>
            <p className="cs-confirmed-name">{selectedPlayer.displayName}</p>
            <p className="cs-confirmed-sub">sẽ trở thành Gián điệp trong vòng này</p>
          </div>
        </div>
      )}

      {/* ── Overlay timeout ── */}
      {phase === 'TIMEOUT' && (
        <div className="dn-timesup-overlay">
          <div className="dn-timesup-box">
            <span className="dn-timesup-text">⏱ Hết thời gian!</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default CorruptSelectView;