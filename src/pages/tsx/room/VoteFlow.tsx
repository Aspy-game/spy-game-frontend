// =============================================
// VoteFlow.tsx - Final
// =============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/room/bg.jpg';
import '../../css/room/vote-flow.css';
import useAuthStore from '../../../store/authStore';

type VoteStatus = 'notify' | 'select' | 'sent' | 'timeout';

interface Player {
  id: number;
  displayName: string;
  emoji: string;
  bgColor: string;
  isMe?: boolean;
  avatarUrl?: string | null;
}

interface ChatMessage {
  id: number;
  senderName: string;
  nameClass: 'cu' | 'toi' | 'cho' | 'meo';
  text: string;
}

const OTHER_PLAYERS: Omit<Player, 'id'>[] = [
  { displayName: 'Cú',   emoji: '🦉', bgColor: 'linear-gradient(135deg,#8B5E3C,#5C3A1C)' },
  { displayName: 'Mèo',  emoji: '🐱', bgColor: 'linear-gradient(135deg,#C8A882,#9A7050)' },
  { displayName: 'Chó',  emoji: '🐶', bgColor: 'linear-gradient(135deg,#D4956A,#A06030)' },
  { displayName: 'Chim', emoji: '🐦', bgColor: 'linear-gradient(135deg,#7FB3D3,#4A8FAD)' },
  { displayName: 'Cáo',  emoji: '🦊', bgColor: 'linear-gradient(135deg,#E8845C,#C4552C)' },
];

const AVATAR_POSITIONS = [
  { top: 192, left: 0   }, // 0 → 1. Tôi   (trái trên)
  { top: 0,   left: 303 }, // 1 → 2. Cú    (top center)
  { top: 192, left: 572 }, // 2 → 3. Mèo   (phải trên)
  { top: 481, left: 592 }, // 3 → 4. Chó   (phải dưới)
  { top: 656, left: 303 }, // 4 → 5. Chim  (dưới giữa)
  { top: 481, left: 0   }, // 5 → 6. Cáo   (trái dưới)
];

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, senderName: 'Cú:',  nameClass: 'cu',  text: 'helu mấy cưng' },
  { id: 2, senderName: 'Tôi:', nameClass: 'toi', text: '' },
  { id: 3, senderName: 'Chó:', nameClass: 'cho', text: '' },
  { id: 4, senderName: 'Mèo:', nameClass: 'meo', text: '' },
];

const DEV_ROOM_ID = 'dev123';

// ── Sub-components ──────────────────────────────────────────

const NotifyView: React.FC = () => (
  <div className="dn-timesup-overlay">
    <div className="dn-timesup-box">
      <span className="dn-timesup-text">BẠN CÓ 10S ĐỂ VOTE</span>
    </div>
  </div>
);

const TimeoutView: React.FC = () => (
  <div className="dn-timesup-overlay">
    <div
      className="dn-timesup-box"
      style={{
        borderColor: '#E74C3C',
        background: 'rgba(20,10,10,0.82)',
        boxShadow: '0 0 40px rgba(231,76,60,0.55)',
      }}
    >
      <span className="dn-timesup-text" style={{ color: '#E74C3C' }}>
        HẾT THỜI GIAN VOTE!
      </span>
    </div>
  </div>
);

const SentView: React.FC = () => (
  <div className="vf-center">
    <div className="vf-check-circle">
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke="#34C759" strokeWidth="3" fill="rgba(52,199,89,0.12)"/>
        <path d="M13 25L20 32L35 17" stroke="#34C759" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="vf-sent-label">✓ Đã hoàn thành vote</div>
    <div className="vf-waiting-sub">Đang đợi những người chơi khác...</div>
    <div className="vf-loading-bar"><div className="vf-loading-bar__fill" /></div>
  </div>
);

// ── Main Component ──────────────────────────────────────────

const VoteFlow: React.FC = () => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const roomId = paramRoomId ?? DEV_ROOM_ID;

  const { user } = useAuthStore();
  const myDisplayName = user?.display_name ?? 'Tôi';
  const myAvatarUrl   = user?.avatar_url   ?? null;

  const [voteStatus, setVoteStatus]         = useState<VoteStatus>('notify');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [votedPlayerId, setVotedPlayerId]   = useState<number | null>(null);
  const [countdown, setCountdown]           = useState(10);

  // ── Chat state (giống DescribeNotify) ──
  const [messages, setMessages]         = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [chatInput, setChatInput]       = useState('');
  const [nextId, setNextId]             = useState(MOCK_MESSAGES.length + 1);
  const [chatExpanded, setChatExpanded] = useState(false);
  const messagesEndRef                  = useRef<HTMLDivElement>(null);

  const players: Player[] = [
    { id: 1, displayName: myDisplayName, emoji: '🐻', bgColor: 'linear-gradient(135deg,#9B7B5A,#705030)', isMe: true, avatarUrl: myAvatarUrl },
    ...OTHER_PLAYERS.map((p, i) => ({ ...p, id: i + 2 })),
  ];

  const handleVote = useCallback((id: number) => {
    console.log(`Voted for player ${id} in room ${roomId}`);
    setVotedPlayerId(id);
  }, [roomId]);

  // ── Vote timer ──
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    switch (voteStatus) {
      case 'notify':
        timer = window.setTimeout(() => setVoteStatus('select'), 3000);
        break;
      case 'select':
        if (countdown <= 0) {
          window.setTimeout(() => setVoteStatus('timeout'), 0);
          return;
        }
        timer = window.setTimeout(() => setCountdown(n => n - 1), 1000);
        break;
      case 'sent':
        timer = window.setTimeout(() => navigate(`/game/${roomId}/result/vote`), 5000);
        break;
      case 'timeout':
        timer = window.setTimeout(() => navigate(`/game/${roomId}/result/vote`), 3000);
        break;
    }
    return () => clearTimeout(timer);
  }, [voteStatus, countdown, selectedPlayerId, votedPlayerId, roomId, navigate, handleVote]);

  // ── Auto scroll chat ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Chat handlers ──
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

  const hasVoted = votedPlayerId !== null;

  const renderContent = () => {
    switch (voteStatus) {
      case 'notify':
        return <NotifyView />;

      case 'select':
        return (
          <>
            <div className="vf-countdown-badge">
              <span className="vf-countdown-badge__icon">⏳</span>
              <span className="vf-countdown-badge__num">{countdown}</span>
            </div>

            <div className="dn-avatars">
              {players.map((player, idx) => {
                const pos        = AVATAR_POSITIONS[idx] ?? { top: 0, left: 0 };
                const isSelected = selectedPlayerId === player.id;
                const isVoted    = votedPlayerId === player.id;
                const isMe       = !!player.isMe;

                return (
                  <div
                    key={player.id}
                    className={[
                      `dn-avatar dn-avatar--a${idx}`,
                      isVoted                           ? 'vf-avatar--voted'    : '',
                      isSelected && !isVoted            ? 'vf-avatar--selected' : '',
                      !isMe && !isSelected && !hasVoted ? 'vf-avatar--hoverable': '',
                    ].filter(Boolean).join(' ')}
                    style={{
                      top: pos.top, left: pos.left,
                      background: player.bgColor,
                      cursor: isMe || hasVoted ? 'default' : 'pointer',
                    }}
                    onClick={() => !isMe && !hasVoted && setSelectedPlayerId(player.id)}
                  >
                    {player.avatarUrl
                      ? <img src={player.avatarUrl} alt={player.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                      : <span style={{ fontSize: 72 }}>{player.emoji}</span>
                    }

                    <div className="vf-player-name-tag">
                      {player.isMe ? `${idx + 1}. Tôi` : `${idx + 1}. ${player.displayName}`}
                    </div>

                    {isVoted && (
                      <div className="vf-selected-check vf-voted-check">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}

                    {isSelected && !isVoted && (
                      <div className="vf-selected-check">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="vf-confirm-wrap">
              {hasVoted ? (
                <button className="vf-confirm-btn vf-confirm-btn--done" disabled>
                  ✓ Đã gửi mã lệnh
                </button>
              ) : (
                <button
                  className={`vf-confirm-btn${!selectedPlayerId ? ' vf-confirm-btn--disabled' : ''}`}
                  disabled={!selectedPlayerId}
                  onClick={() => selectedPlayerId && handleVote(selectedPlayerId)}
                >
                  XÁC NHẬN VOTE
                </button>
              )}
            </div>
          </>
        );

      case 'sent':
        return <SentView />;

      case 'timeout':
        return <TimeoutView />;

      default:
        return null;
    }
  };

  return (
    <div className="dn-screen" style={{ backgroundImage: `url(${bgImage})` }}>

      {/* HEADER – giống DescribeNotify */}
      <header className="dn-header">
        <div className="dn-round-badge"><span className="dn-round-badge__text">Vòng 1</span></div>
        <div className="dn-room-badge"><span className="dn-room-badge__text">Phòng: {roomId}</span></div>
      </header>

      {/* NỘI DUNG VOTE */}
      {renderContent()}

      {/* CHAT PANEL – copy y chang từ DescribeNotify */}
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

export default VoteFlow;