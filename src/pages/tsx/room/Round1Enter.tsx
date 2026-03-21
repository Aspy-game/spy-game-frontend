// =============================================
// Round1Enter.tsx
// Route: /game/:roomId/round1
//        /dev/round1  (dev)
// =============================================

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/room/bg.jpg';
import '../../css/room/round1-enter.css';
import useAuthStore from '../../../store/authStore';
import { gameService } from '../../../services';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { Player } from '../../../types/models';

// Vị trí pixel-perfect từ Figma (relative to .r1-avatars left=345, top=110)
const AVATAR_POSITIONS: Record<number, { top: number; left: number }> = {
  0: { top: 0,   left: 303 }, // a0 – top center
  1: { top: 192, left: 572 }, // a1 – right top
  2: { top: 481, left: 592 }, // a2 – right bot
  3: { top: 656, left: 303 }, // a3 – bot center
  4: { top: 481, left: 0   }, // a4 – left bot
  5: { top: 192, left: 0   }, // a5 – left top (= "Tôi")
};

// Số thứ tự 1-6 từ trái → phải (theo x rồi y)
const AVATAR_ORDER: Record<number, number> = {
  5: 1, 4: 2, 0: 3, 3: 4, 1: 5, 2: 6,
};

const Round1Enter: React.FC = () => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const roomId = paramRoomId ?? '';

  const { user } = useAuthStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connect, disconnect, subscribe, connected } = useWebSocket();

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
        if (!roomData || !roomData.players) {
          setError('Không có dữ liệu người chơi.');
          return;
        }

        const mappedPlayers = roomData.players.map(p => ({
          ...p,
          isMe: p.id === user?.user_id || p.displayName === (user?.display_name ?? 'Tôi')
        }));
        setPlayers(mappedPlayers);
      } catch (err) {
        console.error('Failed to fetch players', err);
        setError('Không thể tải danh sách người chơi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayers();
  }, [roomId, user?.user_id, user?.display_name]);

  // WebSocket connection and state listener
  useEffect(() => {
    if (!roomId) return;

    connect(() => {
      console.log(`[WS] Connected to room ${roomId}`);
    });

    return () => {
      disconnect();
    };
  }, [roomId, connect, disconnect]);

  useEffect(() => {
    if (connected && roomId) {
      const sub = subscribe(`/topic/room/${roomId}/state`, (message: any) => {
        console.log('[WS] Received state update:', message);
        // Giả sử server gửi state 'DESCRIBING' để bắt đầu miêu tả
        if (message.state === 'DESCRIBING' || message === 'DESCRIBING') {
          navigate(`/game/${roomId}/describe/notify`);
        }
      });

      return () => {
        sub?.unsubscribe();
      };
    }
  }, [connected, roomId, subscribe, navigate]);

  if (isLoading) {
    return (
      <div className="r1-screen" style={{ backgroundImage: `url(${bgImage})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#fff', fontSize: '24px', fontFamily: "'Baloo Bhaijaan 2', cursive" }}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="r1-screen" style={{ backgroundImage: `url(${bgImage})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    <div className="r1-screen" style={{ backgroundImage: `url(${bgImage})` }}>

      {/* ── HEADER ── */}
      <header className="r1-header" style={{ display: 'flex', justifyContent: 'flex-start', padding: '20px 21px', gap: '12px' }}>
        <div style={{ width: '82px', height: '82px' }}></div> {/* Spacer cho nút Home từ App.tsx */}
        <div className="r1-round-badge" style={{
          background: 'rgba(207, 147, 37, 0.9)',
          borderRadius: '24px',
          padding: '4px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          minWidth: '185px',
          height: '82px',
        }}>
          <span style={{ fontFamily: "'Baloo Bhaijaan 2', cursive", fontSize: '24px', color: '#fff', fontWeight: 800 }}>Vòng 1</span>
        </div>
        <div className="r1-room-badge" style={{ marginLeft: 'auto' }}>
          <span className="r1-room-badge__text">Phòng: {roomId}</span>
        </div>
      </header>

      {/* ── AVATAR GRID ── */}
      <div className="r1-avatars">
        {players.map((player, idx) => {
          const pos   = AVATAR_POSITIONS[idx] ?? { top: 0, left: 0 };
          const order = AVATAR_ORDER[idx] ?? (idx + 1);
          const label = player.isMe
            ? `${order}. Tôi`
            : `${order}. ${player.displayName}`;

          return (
            <div
              key={player.id}
              className={`r1-avatar r1-avatar--a${idx}`}
              style={{ top: pos.top, left: pos.left, background: player.bgColor }}
              title={player.displayName}
            >
              {/* Avatar: ảnh thật nếu có (user.avatar_url), fallback emoji */}
              {/* [BE] player.avatarUrl sẽ được fill từ WebSocket khi có server */}
              {player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.displayName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '16px',
                  }}
                />
              ) : (
                <span style={{ fontSize: 72 }}>{player.emoji}</span>
              )}

              {/* Name tag: số thứ tự + tên */}
              <div className={`r1-name-tag${player.isMe ? ' r1-name-tag--me' : ''}`}>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── VÒNG 1 BANNER ── */}
      <div className="r1-vong1-box">
        <span className="r1-vong1-text">Vòng 1</span>
      </div>

    </div>
  );
};

export default Round1Enter;