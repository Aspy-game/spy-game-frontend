// =============================================
// Round1Enter.tsx
// Route: /game/:roomId/round1
//        /dev/round1  (dev)
// =============================================

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/room/bg.jpg';
import '../../css/room/round1-enter.css';
import useAuthStore from '../../../store/authStore';

interface Player {
  id: number;
  displayName: string;
  emoji: string;
  bgColor: string;
  isMe?: boolean;
  avatarUrl?: string | null;
}

// ── Mock players khác (chưa có BE) ──
// [BE] Thay bằng WebSocket /topic/room/{roomId}/players
const OTHER_PLAYERS: Omit<Player, 'id'>[] = [
  { displayName: 'Cú',   emoji: '🦉', bgColor: 'linear-gradient(135deg,#8B5E3C,#5C3A1C)' },
  { displayName: 'Mèo',  emoji: '🐱', bgColor: 'linear-gradient(135deg,#C8A882,#9A7050)' },
  { displayName: 'Chó',  emoji: '🐶', bgColor: 'linear-gradient(135deg,#D4956A,#A06030)' },
  { displayName: 'Chim', emoji: '🐦', bgColor: 'linear-gradient(135deg,#7FB3D3,#4A8FAD)' },
  { displayName: 'Cáo',  emoji: '🦊', bgColor: 'linear-gradient(135deg,#E8845C,#C4552C)' },
];

// Vị trí pixel-perfect từ Figma (relative to .r1-avatars left=345, top=110)
const AVATAR_POSITIONS = [
  { top: 0,   left: 303 }, // a0 – top center
  { top: 192, left: 572 }, // a1 – right top
  { top: 481, left: 592 }, // a2 – right bot
  { top: 656, left: 303 }, // a3 – bot center
  { top: 481, left: 0   }, // a4 – left bot
  { top: 192, left: 0   }, // a5 – left top (= "Tôi")
];

// Số thứ tự 1-6 từ trái → phải (theo x rồi y)
const AVATAR_ORDER: Record<number, number> = {
  5: 1, // a5 left=0,   top=192
  4: 2, // a4 left=0,   top=481
  0: 3, // a0 left=303, top=0
  3: 4, // a3 left=303, top=656
  1: 5, // a1 left=572, top=192
  2: 6, // a2 left=592, top=481
};

const DEV_ROOM_ID = 'dev123';

const Round1Enter: React.FC = () => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const roomId = paramRoomId ?? DEV_ROOM_ID;

  // [BE] Lấy từ authStore (user đã login)
  const { user } = useAuthStore();
  const myDisplayName = user?.display_name ?? 'Tôi';
  const myAvatarUrl   = user?.avatar_url   ?? null;

  // [BE] Thay bằng WebSocket /topic/room/{roomId}/players
  const players: Player[] = [
    ...OTHER_PLAYERS.map((p, i) => ({ ...p, id: i + 1 })),
    {
      id: 6,
      displayName: myDisplayName,
      emoji: '🐻',
      bgColor: 'linear-gradient(135deg,#9B7B5A,#705030)',
      isMe: true,
      avatarUrl: myAvatarUrl,
    },
  ];

  // [BE] Xóa timer này, dùng WebSocket /topic/room/{roomId}/state
  useEffect(() => {
    const timer = setTimeout(
      () => navigate(`/game/${roomId}/describe/notify`),
      3000
    );
    return () => clearTimeout(timer);
  }, [roomId, navigate]);

  return (
    <div className="r1-screen" style={{ backgroundImage: `url(${bgImage})` }}>

      {/* ── HEADER ── */}
      <header className="r1-header">
        <div className="r1-room-badge">
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