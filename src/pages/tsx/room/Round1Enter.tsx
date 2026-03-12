// =============================================
// Round1Enter.tsx
// Màn hình vào vòng 1 – [Toại]
// Route: /game/:roomId/round1
// Figma: 1440×1024 (ScaledPage wrap ở App.tsx)
// =============================================

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/room/bg.jpg';
import '../../css/room/round1-enter.css';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: number;
  senderName: string;       // tên hiển thị người gửi
  nameClass: 'cu' | 'toi' | 'cho' | 'meo'; // màu tên (mở rộng sau)
  text: string;
}

interface Player {
  id: number;
  displayName: string;      // tên hiển thị trong phòng
  emoji: string;            // avatar emoji tạm, thay bằng avatarUrl sau
  bgColor: string;          // màu nền avatar
  isMe?: boolean;           // đánh dấu người chơi hiện tại
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — XÓA KHI BE SẴN SÀNG
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_PLAYERS: Player[] = [
  { id: 1, displayName: 'Cú',   emoji: '🦉', bgColor: 'linear-gradient(135deg,#8B5E3C,#5C3A1C)', isMe: false },
  { id: 2, displayName: 'Mèo',  emoji: '🐱', bgColor: 'linear-gradient(135deg,#C8A882,#9A7050)', isMe: false },
  { id: 3, displayName: 'Chó',  emoji: '🐶', bgColor: 'linear-gradient(135deg,#D4956A,#A06030)', isMe: false },
  { id: 4, displayName: 'Chim', emoji: '🐦', bgColor: 'linear-gradient(135deg,#7FB3D3,#4A8FAD)', isMe: false },
  { id: 5, displayName: 'Cáo',  emoji: '🦊', bgColor: 'linear-gradient(135deg,#E8845C,#C4552C)', isMe: false },
  { id: 6, displayName: 'Gấu',  emoji: '🐻', bgColor: 'linear-gradient(135deg,#9B7B5A,#705030)', isMe: true  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, senderName: 'Cú:',  nameClass: 'cu',  text: 'helu mấy cưng' },
  { id: 2, senderName: 'Tôi:', nameClass: 'toi', text: '' },
  { id: 3, senderName: 'Chó:', nameClass: 'cho', text: '' },
  { id: 4, senderName: 'Mèo:', nameClass: 'meo', text: '' },
];

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR POSITIONS — pixel-perfect từ Figma (Group 21: left=345, top=110)
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_POSITIONS = [
  { top: 0,   left: 303 },
  { top: 192, left: 572 },
  { top: 481, left: 592 },
  { top: 656, left: 303 },
  { top: 481, left: 0   },
  { top: 192, left: 0   },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const Round1Enter: React.FC = () => {

  // ── [BE] Lấy roomId từ URL params ─────────────────────────────────────────
  // BE cần: roomId khớp với rooms.room_code trong DB (bảng rooms)
  const { roomId } = useParams<{ roomId: string }>();

  // ── Auto-chuyển sang DescribeNotify sau 3 giây ─────────────────────────────
  // [BE] Xóa timer này khi BE push GameState = DESCRIBING qua WebSocket
  // Ref: System Design §1.4 WAITING → ROLE_ASSIGN → DESCRIBING
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/game/${roomId}/describe/notify`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [roomId, navigate]);

  // ── [BE] Lấy thông tin phòng & danh sách người chơi ──────────────────────
  // BE cần: WebSocket subscribe topic: /topic/room/{roomId}
  // Payload mẫu: { roomCode, players: [{ id, displayName, avatarUrl, color }] }
  // Ref: System Design §3.3 GET /rooms + WebSocket /topic/room/{roomId}
  const [players] = useState<Player[]>(MOCK_PLAYERS); // TODO: replace với useRoom() hook

  // ── [BE] Tên người chơi hiện tại ──────────────────────────────────────────
  // BE cần: Lấy từ JWT token đã decode → user.display_name
  // Ref: System Design §2.2 bảng users.display_name
  const myDisplayName = 'Tôi'; // TODO: replace với useAuthStore().user?.display_name

  // ── [BE] Chat messages ────────────────────────────────────────────────────
  // BE cần: WebSocket subscribe topic: /topic/room/{roomId}/chat
  // Payload mẫu: { id, senderId, senderName, text, timestamp }
  // Ref: System Design §3.x WebSocket /topic/room/{roomId}
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);

  // ── Local state ───────────────────────────────────────────────────────────
  const [inputVal, setInputVal] = useState('');
  const [nextId, setNextId]     = useState(MOCK_MESSAGES.length + 1);
  const messagesEndRef          = useRef<HTMLDivElement>(null);

  // Auto-scroll xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── [BE] Gửi tin nhắn ────────────────────────────────────────────────────
  // BE cần: WebSocket publish destination: /app/room/{roomId}/chat
  // Payload gửi lên: { text: string }
  // Ref: System Design §WebSocket STOMP
  const handleSend = () => {
    const text = inputVal.trim();
    if (!text) return;

    // TODO: thay bằng stompClient.publish():
    // stompClient.publish({
    //   destination: `/app/room/${roomId}/chat`,
    //   body: JSON.stringify({ text }),
    // });

    // Tạm thời hiển thị local (xóa khi có WebSocket thật)
    setMessages(prev => [
      ...prev,
      { id: nextId, senderName: 'Tôi:', nameClass: 'toi', text },
    ]);
    setNextId(n => n + 1);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  // ── [BE] Chuyển sang phase tiếp theo ─────────────────────────────────────
  // BE cần: WebSocket lắng nghe /topic/room/{roomId}/state
  // Khi nhận GameState = DESCRIBING → navigate('/game/:roomId/describe/notify')
  // Ref: System Design §1.4 Game State Machine: WAITING → ROLE_ASSIGN → DESCRIBING

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="r1-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
    >

      {/* HEADER */}
      <header className="r1-header">
        {/*
          [BE] myDisplayName → useAuthStore().user?.display_name
          [BE] roomId        → useParams() (đã kết nối)
        */}
        <h1 className="r1-header__title">{myDisplayName}</h1>
        <div className="r1-room-badge">
          <span className="r1-room-badge__text">Phòng: {roomId}</span>
        </div>
      </header>

      {/* AVATAR GRID */}
      {/*
        [BE] players → nhận từ WebSocket /topic/room/{roomId}
        Mỗi player cần: { id, displayName, avatarUrl }
        Thay emoji bằng <img src={player.avatarUrl} /> khi BE trả về avatarUrl
      */}
      <div className="r1-avatars">
        {players.map((player, idx) => {
          const pos = AVATAR_POSITIONS[idx] ?? { top: 0, left: 0 };
          return (
            <div
              key={player.id}
              className="r1-avatar"
              style={{ top: pos.top, left: pos.left, background: player.bgColor }}
              title={player.displayName}
            >
              {/* TODO: đổi thành <img src={player.avatarUrl} alt={player.displayName} /> */}
              <span style={{ fontSize: 72 }}>{player.emoji}</span>
            </div>
          );
        })}
      </div>

      {/* VÒNG 1 BOX */}
      <div className="r1-vong1-box">
        <span className="r1-vong1-text">Vòng 1</span>
      </div>

      {/* CHAT PANEL */}
      {/*
        [BE] messages → nhận từ WebSocket /topic/room/{roomId}/chat
        [BE] handleSend → publish tới /app/room/{roomId}/chat
      */}
      <div className="r1-chat">

        {/* Danh sách tin nhắn */}
        <div className="r1-chat__messages">
          {messages.map(msg => (
            <div key={msg.id} className="r1-chat-row">
              <span className={`r1-chat-name r1-chat-name--${msg.nameClass}`}>
                {msg.senderName}
              </span>
              {msg.text && (
                <span className="r1-chat-msg">{msg.text}</span>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input gửi tin nhắn */}
        <div className="r1-chat__input-bar">
          <input
            className="r1-chat__input"
            type="text"
            placeholder="Nhắn tin..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {/* Nút gửi */}
          <button
            className="r1-chat__btn"
            title="Gửi"
            onClick={handleSend}
            aria-label="gửi"
          >
            <svg viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 8L41 23L5 38V26L32 23L5 20V8Z"
                fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

      </div>

    </div>
  );
};

export default Round1Enter;