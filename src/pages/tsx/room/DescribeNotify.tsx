// =============================================
// DescribeNotify.tsx
// Số thứ tự avatar: theo seatIndex từ BE (0-5),
//   map sang số hiển thị 1-6 từ trái→phải.
// [BE] Player.seatIndex: server gán khi join room,
//   cố định suốt ván chơi.
// =============================================

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/room/bg.jpg';
import '../../css/room/describe-notify.css';
import useAuthStore from '../../../store/authStore';

interface ChatMessage {
  id: number;
  senderName: string;
  nameClass: 'cu' | 'toi' | 'cho' | 'meo';
  text: string;
}

interface Player {
  id: number;
  displayName: string;
  emoji: string;
  bgColor: string;
  isMe?: boolean;
  avatarUrl?: string | null;
  isTyping?: boolean;
  description?: string;
  // [BE] seatIndex: 0-5, server gán khi player join room.
  // Frontend dùng để xác định vị trí avatar + số thứ tự hiển thị.
  seatIndex: number;
}

// Vị trí avatar theo seatIndex (0-5)
const AVATAR_POSITIONS: Record<number, { top: number; left: number }> = {
  0: { top: 0,   left: 303 }, // top center
  1: { top: 192, left: 572 }, // right top
  2: { top: 481, left: 592 }, // right bot
  3: { top: 656, left: 303 }, // bot center
  4: { top: 481, left: 0   }, // left bot
  5: { top: 192, left: 0   }, // left top
};

// Số thứ tự hiển thị 1-6 từ trái → phải (theo x rồi y):
//   seat5(x=0,y=192)→1, seat4(x=0,y=481)→2,
//   seat0(x=303,y=0)→3, seat3(x=303,y=656)→4,
//   seat1(x=572,y=192)→5, seat2(x=592,y=481)→6
const SEAT_DISPLAY_ORDER: Record<number, number> = {
  5: 1,
  4: 2,
  0: 3,
  3: 4,
  1: 5,
  2: 6,
};

// Typing bubble offset theo seatIndex
const TYPING_OFFSETS: Record<number, { top: number; left: number }> = {
  0: { top: 43, left: 156  }, // top    → bubble phải
  1: { top: 43, left: 156  }, // r-top  → bubble phải
  2: { top: 43, left: 156  }, // r-bot  → bubble phải
  3: { top: 43, left: 156  }, // bot    → bubble phải
  4: { top: 43, left: -288 }, // l-bot  → bubble trái
  5: { top: 43, left: -288 }, // l-top  → bubble trái
};

const BUBBLE_OFFSETS: Record<number, { top: number; left: number }> = {
  0: { top: 43, left: 156  },
  1: { top: 43, left: 156  },
  2: { top: 43, left: 156  },
  3: { top: 43, left: 156  },
  4: { top: 43, left: -288 },
  5: { top: 43, left: -288 },
};

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, senderName: 'Cú:',  nameClass: 'cu',  text: 'helu mấy cưng' },
  { id: 2, senderName: 'Tôi:', nameClass: 'toi', text: '' },
  { id: 3, senderName: 'Chó:', nameClass: 'cho', text: '' },
  { id: 4, senderName: 'Mèo:', nameClass: 'meo', text: '' },
];

const DEV_ROOM_ID = 'dev123';

// ── Mock players với seatIndex cố định từ "server" ───────────────
// [BE] Thay bằng dữ liệu WebSocket /topic/room/{roomId}/players
const MOCK_OTHER_PLAYERS: Omit<Player, 'id'>[] = [
  { displayName: 'Cú',   emoji: '🦉', bgColor: 'linear-gradient(135deg,#8B5E3C,#5C3A1C)', isTyping: true,  description: 'có ở khắp nơi', seatIndex: 0 },
  { displayName: 'Mèo',  emoji: '🐱', bgColor: 'linear-gradient(135deg,#C8A882,#9A7050)', isTyping: false, description: 'trên trái đất',  seatIndex: 1 },
  { displayName: 'Chó',  emoji: '🐶', bgColor: 'linear-gradient(135deg,#D4956A,#A06030)', isTyping: true,  description: 'mặn',            seatIndex: 2 },
  { displayName: 'Chim', emoji: '🐦', bgColor: 'linear-gradient(135deg,#7FB3D3,#4A8FAD)', isTyping: false, description: '',               seatIndex: 3 },
  { displayName: 'Cáo',  emoji: '🦊', bgColor: 'linear-gradient(135deg,#E8845C,#C4552C)', isTyping: true,  description: 'mát mẻ lắm',    seatIndex: 4 },
];

const DescribeNotify: React.FC = () => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const roomId = paramRoomId ?? DEV_ROOM_ID;

  const keyword = 'Hospital'; // [BE] WebSocket

  const { user } = useAuthStore();
  const myDisplayName = user?.display_name ?? 'Tôi';
  const myAvatarUrl   = user?.avatar_url   ?? null;

  // [BE] seatIndex của bản thân do server gán, nhận qua WebSocket
  const mySeatIndex = 5;

  const [players, setPlayers] = useState<Player[]>([
    ...MOCK_OTHER_PLAYERS.map((p, i) => ({ ...p, id: i + 1 })),
    {
      id: 6,
      displayName: myDisplayName,
      emoji: '🐻',
      bgColor: 'linear-gradient(135deg,#9B7B5A,#705030)',
      isMe: true,
      avatarUrl: myAvatarUrl,
      isTyping: false,
      description: undefined,
      seatIndex: mySeatIndex,
    },
  ]);

  const [messages, setMessages]           = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [chatInput, setChatInput]         = useState('');
  const [describeInput, setDescribeInput] = useState('');
  const [nextId, setNextId]               = useState(MOCK_MESSAGES.length + 1);
  const [chatExpanded, setChatExpanded]   = useState(false);
  const messagesEndRef                    = useRef<HTMLDivElement>(null);

  const [showInput, setShowInput]               = useState(false);
  const [hasSent, setHasSent]                   = useState(false);
  const [timeUp, setTimeUp]                     = useState(false);
  const [showOverlay, setShowOverlay]           = useState(false);
  const [showBubbles, setShowBubbles]           = useState(false);
  const [discussTimeUp, setDiscussTimeUp]       = useState(false);
  const [showDiscussOverlay, setShowDiscussOverlay] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowInput(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const [countdown, setCountdown] = useState(30);
  useEffect(() => {
    if (!showInput || timeUp) return;
    if (countdown <= 0) { setTimeUp(true); setShowOverlay(true); return; }
    const t = setTimeout(() => setCountdown(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, showInput, timeUp]);

  useEffect(() => {
    if (!showOverlay) return;
    const t = setTimeout(() => { setShowOverlay(false); setShowBubbles(true); }, 2500);
    return () => clearTimeout(t);
  }, [showOverlay]);

  const [countdown2, setCountdown2] = useState(30);
  useEffect(() => {
    if (!showBubbles || discussTimeUp) return;
    if (countdown2 <= 0) { setDiscussTimeUp(true); setShowDiscussOverlay(true); return; }
    const t = setTimeout(() => setCountdown2(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown2, showBubbles, discussTimeUp]);

  useEffect(() => {
    if (!showDiscussOverlay) return;
    const t = setTimeout(() => {
      setShowDiscussOverlay(false);
      navigate(`/game/${roomId}/vote/notify`);
    }, 2500);
    return () => clearTimeout(t);
  }, [showDiscussOverlay, roomId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSend = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: nextId, senderName: 'Tôi:', nameClass: 'toi', text }]);
    setNextId(n => n + 1);
    setChatInput('');
  };
  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleChatSend();
  };

  const handleDescribeSend = () => {
    const text = describeInput.trim();
    if (!text || hasSent) return;
    setPlayers(prev => prev.map(p => p.isMe ? { ...p, description: text } : p));
    setHasSent(true);
    setDescribeInput('');
  };
  const handleDescribeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleDescribeSend();
  };

  const renderBubble = (player: Player) => {
    const bOff = BUBBLE_OFFSETS[player.seatIndex] ?? { top: 43, left: 156 };
    if (showBubbles) {
      const raw   = player.description ?? '';
      const label = raw.trim() === '' ? '[ ]' : raw;
      return (
        <div className={`dn-speech-bubble dn-speech-bubble--${player.seatIndex}`} style={{ top: bOff.top, left: bOff.left }}>
          <span className="dn-speech-bubble__text">{label}</span>
        </div>
      );
    }
    if (player.isMe && hasSent && player.description) {
      return (
        <div className="dn-speech-bubble" style={{ top: bOff.top, left: bOff.left }}>
          <span className="dn-speech-bubble__text">{player.description}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dn-screen" style={{ backgroundImage: `url(${bgImage})` }}>

      <header className="dn-header">
        <div className="dn-round-badge">
          <span className="dn-round-badge__text">Vòng 1</span>
        </div>
        {(hasSent || timeUp) && (
          <div className="dn-keyword-badge">
            <span className="dn-keyword-badge__text">{keyword}</span>
          </div>
        )}
        <div className="dn-room-badge">
          <span className="dn-room-badge__text">Phòng: {roomId}</span>
        </div>
      </header>

      {/* AVATAR GRID */}
      <div className="dn-avatars">
        {players.map(player => {
          const seat   = player.seatIndex;
          const pos    = AVATAR_POSITIONS[seat]  ?? { top: 0, left: 0 };
          const tOff   = TYPING_OFFSETS[seat]    ?? { top: 43, left: 0 };
          const order  = SEAT_DISPLAY_ORDER[seat] ?? (seat + 1);
          const label  = player.isMe
            ? `${order}. Tôi`
            : `${order}. ${player.displayName}`;

          return (
            <div
              key={player.id}
              className={`dn-avatar dn-avatar--a${seat}`}
              style={{ top: pos.top, left: pos.left, background: player.bgColor }}
              title={player.displayName}
            >
              {player.avatarUrl ? (
                <img src={player.avatarUrl} alt={player.displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 72 }}>{player.emoji}</span>
              )}

              {showInput && !timeUp && player.isTyping && (
                <div className={`dn-typing-bubble dn-typing-bubble--${seat}`} style={{ top: tOff.top, left: tOff.left }}>
                  <span className="dn-typing-bubble__text">Đang nhập...</span>
                </div>
              )}

              {renderBubble(player)}

              {/* Name tag: số thứ tự + tên */}
              <div className={`dn-name-tag${player.isMe ? ' dn-name-tag--me' : ''}`}>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PHASE 1: Banner ── */}
      {!showInput && (
        <div className="dn-banner">
          <span className="dn-banner__text">
            Bạn có 30s miêu tả từ
            <span className="dn-banner__keyword"> {keyword}</span>
          </span>
        </div>
      )}

      {/* ── PHASE 2: countdown + ô nhập ── */}
      {showInput && !timeUp && (
        <div className="dn-describe-input-wrap">
          <div className="dn-countdown-badge-inline">
            <span className="dn-countdown-badge__icon">⏳</span>
            <span className="dn-countdown-badge__num">{countdown}</span>
          </div>
          {!hasSent ? (
            <div className="dn-describe-input-bar">
              <input
                className="dn-describe-input"
                type="text"
                placeholder="Nhập mô tả..."
                value={describeInput}
                onChange={e => setDescribeInput(e.target.value)}
                onKeyDown={handleDescribeKeyDown}
                autoFocus
              />
              <button className="dn-send-btn" onClick={handleDescribeSend} aria-label="gửi mô tả">
                <svg viewBox="0 0 46 46" fill="none">
                  <path d="M5 8L41 23L5 38V26L32 23L5 20V8Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="dn-sent-label">✓ Đã gửi mô tả</div>
          )}
        </div>
      )}

      {/* ── PHASE 3a: Overlay "Hết thời gian miêu tả" ── */}
      {showOverlay && (
        <div className="dn-timesup-overlay">
          <div className="dn-timesup-box">
            <span className="dn-timesup-text">Hết thời gian miêu tả</span>
          </div>
        </div>
      )}

      {/* ── PHASE 3b: Countdown tranh luận + panel ── */}
      {showBubbles && !discussTimeUp && (
        <div className="dn-discuss-wrap">
          <div className="dn-discuss-countdown">
            <span className="dn-countdown-badge__icon">⏳</span>
            <span className="dn-countdown-badge__num">{countdown2}</span>
          </div>
          <div className="dn-discuss-panel">
            <span className="dn-discuss-panel__text">Thời gian tranh luận</span>
          </div>
        </div>
      )}

      {/* ── Overlay "Hết thời gian tranh luận" ── */}
      {showDiscussOverlay && (
        <div className="dn-discuss-timesup-overlay">
          <div className="dn-discuss-timesup-box">
            <span className="dn-discuss-timesup-text">Hết thời gian tranh luận</span>
          </div>
        </div>
      )}

      {/* CHAT PANEL */}
      <div className={`dn-chat${chatExpanded ? ' dn-chat--expanded' : ''}`}>
        <div className="dn-chat__messages-wrap">
          <button
            className="dn-chat__expand-btn"
            onClick={() => setChatExpanded(v => !v)}
            aria-label={chatExpanded ? 'Thu nhỏ chat' : 'Mở rộng chat'}
          >
            {chatExpanded ? (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 15H9V19M19 9H15V5M9 5V9H5M15 19V15H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <div className="dn-chat__messages">
            {messages.map(msg => (
              <div key={msg.id} className="dn-chat-row">
                <span className={`dn-chat-name dn-chat-name--${msg.nameClass}`}>{msg.senderName}</span>
                {msg.text && <span className="dn-chat-msg">{msg.text}</span>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="dn-chat__input-bar">
          <input
            className="dn-chat__input"
            type="text"
            placeholder="Nhắn tin..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={handleChatKeyDown}
          />
          <button className="dn-chat__btn" onClick={handleChatSend} aria-label="gửi">
            <svg viewBox="0 0 46 46" fill="none">
              <path d="M5 8L41 23L5 38V26L32 23L5 20V8Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescribeNotify;