// =============================================
// GhostChatView.tsx
// Màn Vòng 2 khi spy dùng AI — hiển thị đầy đủ game scene:
//   avatar grid, chat panel, tab "Chat giùm / Tự nói",
//   badge AI gắn vào avatar spy, countdown + input bar
//   căn giữa tâm hexagon (giống DescribeNotify Phase 2).
// [BE] Thay MOCK_* bằng dữ liệu WebSocket thực tế.
// =============================================

import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../../../../store/authStore';
import bgImage from '../../../../../assets/room/bg.jpg';
import '../../../../css/room/describe-notify.css';
import DescribeDiscussionFlow, { PlayerBubble } from '../common/DescribeDiscussionFlow';
import type { GameFlowPhase } from '../common/DescribeDiscussionFlow';


// ── Types ────────────────────────────────────────────────────
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
  seatIndex: number;
  isTyping?: boolean;
  description?: string;
}

// ── Layout constants (giống DescribeNotify) ──────────────────
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

// ── Mock data [BE] ───────────────────────────────────────────
const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, senderName: 'Cú:',  nameClass: 'cu',  text: 'helu mấy cưng' },
  { id: 2, senderName: 'Tôi:', nameClass: 'toi', text: '' },
  { id: 3, senderName: 'Chó:', nameClass: 'cho', text: '' },
  { id: 4, senderName: 'Mèo:', nameClass: 'meo', text: '' },
];

const MOCK_OTHER_PLAYERS: Omit<Player, 'id'>[] = [
  { displayName: 'Cú',   emoji: '🦉', bgColor: 'linear-gradient(135deg,#8B5E3C,#5C3A1C)', seatIndex: 0 },
  { displayName: 'Mèo',  emoji: '🐱', bgColor: 'linear-gradient(135deg,#C8A882,#9A7050)', seatIndex: 1 },
  { displayName: 'Chó',  emoji: '🐶', bgColor: 'linear-gradient(135deg,#D4956A,#A06030)', seatIndex: 2 },
  { displayName: 'Chim', emoji: '🐦', bgColor: 'linear-gradient(135deg,#7FB3D3,#4A8FAD)', seatIndex: 3 },
  { displayName: 'Cáo',  emoji: '🦊', bgColor: 'linear-gradient(135deg,#E8845C,#C4552C)', seatIndex: 4 },
];

// ── Props ────────────────────────────────────────────────────
interface Props {
  roomId?: string;
  keyword?: string;        // [BE] từ khoá vòng 2
  totalSeconds?: number;
  onSendDescription?: (text: string) => void;
  onComplete?: () => void;
  initialTab?: TabType;
  canUseAI?: boolean;
}

type TabType = 'AI' | 'MANUAL';

// ── Component ────────────────────────────────────────────────
const GhostChatView: React.FC<Props> = ({
  roomId = 'dev123',
  keyword = 'Hospital',
  totalSeconds = 30,
  onSendDescription,
  onComplete,
  initialTab = 'AI',
  canUseAI = true,
}) => {
  const { user } = useAuthStore();
  const myDisplayName = user?.display_name ?? 'Tôi';
  const myAvatarUrl   = user?.avatar_url   ?? null;
  const mySeatIndex   = 5; // [BE] nhận từ WebSocket

  const [players, setPlayers] = useState<Player[]>([
    ...MOCK_OTHER_PLAYERS.map((p, i) => ({ ...p, id: i + 1, isTyping: Math.random() > 0.5 })),
    {
      id: 6,
      displayName: myDisplayName,
      emoji: '🐻',
      bgColor: 'linear-gradient(135deg,#9B7B5A,#705030)',
      isMe: true,
      avatarUrl: myAvatarUrl,
      seatIndex: mySeatIndex,
      isTyping: false,
      description: undefined,
    },
  ]);

  // Chat
  const [messages, setMessages]         = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [chatInput, setChatInput]       = useState('');
  const [nextId, setNextId]               = useState(MOCK_MESSAGES.length + 1);

  const [chatExpanded, setChatExpanded] = useState(false);
  const messagesEndRef                  = useRef<HTMLDivElement>(null);

  // Flow State
  const [currentPhase, setCurrentPhase] = useState<GameFlowPhase>('INTRO');
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [myDescriptionSent, setMyDescriptionSent] = useState(false);

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

  const handleDescSubmit = (text: string) => {
    setPlayers(prev => prev.map(p => p.isMe ? { ...p, description: text } : p));
    setMyDescriptionSent(true);
    onSendDescription?.(text);
  };

  const handleFlowComplete = () => {
     console.log('[GhostChatView] Flow complete');
     onComplete?.();
   };

  return (
    <div className="dn-screen" style={{ backgroundImage: `url(${bgImage})` }}>

      {/* ── Header — giống DescribeNotify ── */}
      <header className="dn-header">
        <div className="dn-round-badge">
          <span className="dn-round-badge__text">Vòng 2</span>
        </div>
        {(myDescriptionSent || ['TIMES_UP_DESC', 'DISCUSSING', 'TIMES_UP_DISC', 'COMPLETED'].includes(currentPhase)) && (
          <div className="dn-keyword-badge">
            <span className="dn-keyword-badge__text">{keyword}</span>
          </div>
        )}
        <div className="dn-room-badge">
          <span className="dn-room-badge__text">Phòng: {roomId}</span>
        </div>
      </header>

      {/* ── Avatar grid — giống DescribeNotify ── */}
      <div className="dn-avatars">
        {players.map(player => {
          const pos   = AVATAR_POSITIONS[player.seatIndex] ?? { top: 0, left: 0 };
          const order = SEAT_DISPLAY_ORDER[player.seatIndex] ?? (player.seatIndex + 1);
          const label = player.isMe ? `${order}. Tôi` : `${order}. ${player.displayName}`;

          return (
            <div
              key={player.id}
              className={`dn-avatar dn-avatar--a${player.seatIndex}`}
              style={{ top: pos.top, left: pos.left, background: player.bgColor }}
            >
              {player.avatarUrl ? (
                <img src={player.avatarUrl} alt={player.displayName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 72 }}>{player.emoji}</span>
              )}

              {/* Tab "Chat giùm / Tự nói" + badge AI */}
              {player.seatIndex === 0 && canUseAI && (
                <>
                  <div className="rf-ghost-spy-controls" style={{ 
                    position: 'absolute', 
                    // Nếu là số 3 (seatIndex 0) thì nằm bên trái, ngược lại nằm trên đầu
                    top: player.seatIndex === 0 ? '20px' : 'auto',
                    bottom: player.seatIndex === 0 ? 'auto' : '110%',
                    left: player.seatIndex === 0 ? 'auto' : '50%',
                    right: player.seatIndex === 0 ? '110%' : 'auto',
                    transform: player.seatIndex === 0 ? 'none' : 'translateX(-50%)',
                    display: 'flex', 
                    flexDirection: player.seatIndex === 0 ? 'column' : 'row', 
                    gap: '8px', 
                    zIndex: 100, 
                    width: 'max-content'
                  }}>
                    <button
                      className={`rf-ghost-tab${activeTab === 'AI' ? ' active' : ''}`}
                      onClick={() => setActiveTab('AI')}
                      style={{
                        background: activeTab === 'AI' ? '#FF843D' : 'rgba(0,0,0,0.5)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        padding: '6px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Trò chuyện giùm
                    </button>
                    <button
                      className={`rf-ghost-tab${activeTab === 'MANUAL' ? ' active' : ''}`}
                      onClick={() => setActiveTab('MANUAL')}
                      style={{
                        background: activeTab === 'MANUAL' ? '#5B4133' : 'rgba(0,0,0,0.5)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        padding: '6px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Tự nói
                    </button>
                  </div>
                  {activeTab === 'AI' && (
                    <div className="rf-ghost-ai-badge" style={{
                      position: 'absolute', top: '-10px', right: '-10px',
                      background: '#A020F0', color: 'white', width: '28px', height: '28px',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 'bold', border: '2px solid white', zIndex: 101
                    }}>
                      AI
                    </div>
                  )}
                </>
              )}

              {/* Dùng component PlayerBubble mới để hiển thị nội dung chat/typing */}
              <PlayerBubble
                player={player}
                currentPhase={currentPhase}
                isMe={player.isMe}
                myDescriptionSent={myDescriptionSent}
              />

              <div className={`dn-name-tag${player.isMe ? ' dn-name-tag--me' : ''}`}>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Game Flow Controller (Miêu tả & Tranh luận) ── */}
      {/* Chỉ hiện input miêu tả nếu activeTab là AI (hoặc nếu là Civilian thì luôn hiện) */}
      <DescribeDiscussionFlow
        keyword={keyword}
        roundLabel="Vòng 2"
        descriptionTime={totalSeconds}
        onDescriptionSubmit={handleDescSubmit}
        onPhaseChange={setCurrentPhase}
        onComplete={handleFlowComplete}
      />

      {/* ── Chat panel — giống DescribeNotify ── */}
      <div className={`dn-chat${chatExpanded ? ' dn-chat--expanded' : ''}`}>
        <div className="dn-chat__messages-wrap">
          <button
            className="dn-chat__expand-btn"
            onClick={() => setChatExpanded(v => !v)}
            aria-label={chatExpanded ? 'Thu nhỏ' : 'Mở rộng'}
          >
            {chatExpanded ? (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 15H9V19M19 9H15V5M9 5V9H5M15 19V15H19"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            onKeyDown={e => { if (e.key === 'Enter') handleChatSend(); }}
          />
          <button className="dn-chat__btn" onClick={handleChatSend} aria-label="gửi">
            <svg viewBox="0 0 46 46" fill="none">
              <path d="M5 8L41 23L5 38V26L32 23L5 20V8Z"
                fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default GhostChatView;