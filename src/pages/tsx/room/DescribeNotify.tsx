// =============================================
// DescribeNotify.tsx
// Số thứ tự avatar: theo seatIndex từ BE (0-5),
//   map sang số hiển thị 1-6 từ trái→phải.
// [BE] Player.seatIndex: server gán khi join room,
//   cố định suốt ván chơi.
// =============================================

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/room/bg.jpg';
import '../../css/room/describe-notify.css';
import useAuthStore from '../../../store/authStore';
import DescribeDiscussionFlow from './components/common/DescribeDiscussionFlow';
import { PlayerBubble } from './components/common/DescribeDiscussionFlow';
import { gameService } from '../../../services';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { Player, ChatMessage, GameFlowPhase } from '../../../types/models';

// Vị trí avatar theo seatIndex (0-5)
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

const DescribeNotify: React.FC = () => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const roomId = paramRoomId ?? '';

  const { user } = useAuthStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatExpanded, setChatExpanded] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<GameFlowPhase>('INTRO');
  const [hasSent, setHasSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { connect, disconnect, subscribe, connected } = useWebSocket();

  const [keyword, setKeyword] = useState<string>('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) {
        setError('Không tìm thấy ID phòng chơi.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const [roomData, msgData] = await Promise.all([
          gameService.getRoomDetail(roomId),
          gameService.getMessages(roomId)
        ]);

        if (roomData) {
          setKeyword(roomData.keyword || '');
          
          // Trưởng phòng (host) luôn ở trên cùng (index 0 trong AVATAR_POSITIONS)
          const sortedPlayers = [...roomData.players].sort((a: any, b: any) => {
            if (a.isHost) return -1;
            if (b.isHost) return 1;
            return 0;
          });

          const mappedPlayers = sortedPlayers.map(p => ({
            ...p,
            isMe: p.id === user?.user_id || p.displayName === (user?.display_name ?? 'Tôi'),
            role: p.id === user?.user_id ? p.role : 'unknown', // Chỉ hiện vai trò của mình, ẩn người khác
            isTyping: false
          }));
          setPlayers(mappedPlayers);
        }

        setMessages(msgData || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Không thể tải dữ liệu phòng chơi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [roomId, user?.user_id, user?.display_name]);

  // WebSocket connection
  useEffect(() => {
    if (!roomId) return;
    connect();
    return () => disconnect();
  }, [roomId, connect, disconnect]);

  // WebSocket subscriptions
  useEffect(() => {
    if (connected && roomId) {
      // Subscribe to messages
      const msgSub = subscribe(`/topic/room/${roomId}/messages`, (msg: ChatMessage) => {
        setMessages(prev => {
          // Tránh duplicate tất cả các tin nhắn theo ID
          if (prev.some(p => p.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      // Subscribe to descriptions
      const descSub = subscribe(`/topic/room/${roomId}/descriptions`, (data: { playerId: number, text: string }) => {
        setPlayers(prev => prev.map(p => p.id === data.playerId ? { ...p, description: data.text } : p));
      });

      // Subscribe to typing status
      const typingSub = subscribe(`/topic/room/${roomId}/typing`, (data: { playerId: number, isTyping: boolean }) => {
        setPlayers(prev => prev.map(p => p.id === data.playerId ? { ...p, isTyping: data.isTyping } : p));
      });

      return () => {
        msgSub?.unsubscribe();
        descSub?.unsubscribe();
        typingSub?.unsubscribe();
      };
    }
  }, [connected, roomId, subscribe, user?.display_name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text) return;
    try {
      const newMessage = await gameService.sendMessage(roomId, {
        senderName: 'Tôi:',
        nameClass: 'toi',
        text
      });
      setMessages(prev => [...prev, newMessage]);
      setChatInput('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleChatSend();
  };

  // ── Filter AI messages ──
  const isAiMessage = useCallback((msg: ChatMessage) => {
    const senderNameClean = msg.senderName.replace(':', '').trim();
    return players.some(p => p.isAI && (p.displayName === senderNameClean || p.displayName + ':' === msg.senderName));
  }, [players]);

  const filteredMessages = useMemo(() => {
    return messages.filter((msg, index, self) => {
      const isAI = isAiMessage(msg);

      // 1. Ở vòng thảo luận không cần AI chat
      if (currentPhase === 'DISCUSSING' && isAI) {
        return false;
      }

      // 2. Ở vòng miêu tả thì chỉ được chat 1 lần
      if (currentPhase === 'DESCRIBING' && isAI) {
        // Tìm xem trước đó AI này đã chat chưa trong danh sách tin nhắn hiện tại
        const firstMsgIndex = self.findIndex(m => m.senderName === msg.senderName);
        return firstMsgIndex === index;
      }

      return true;
    });
  }, [messages, currentPhase, isAiMessage]);

  const handleDescribeSend = (text: string) => {
    setPlayers(prev => prev.map(p => p.isMe ? { ...p, description: text } : p));
    setHasSent(true);
  };

  const handleFlowComplete = () => {
    navigate(`/game/${roomId}/vote/notify`);
  };

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

      <header className="dn-header">
        <div className="dn-round-badge">
          <span className="dn-round-badge__text">Vòng 1</span>
        </div>
        <div className="dn-keyword-badge">
          <span className="dn-keyword-badge__text">{keyword}</span>
        </div>
        <div className="dn-room-badge">
          <span className="dn-room-badge__text">Phòng: {roomId}</span>
        </div>
      </header>

      {/* AVATAR GRID */}
      <div className="dn-avatars">
        {players.map(player => {
          const seat   = player.seatIndex;
          const pos    = AVATAR_POSITIONS[seat]  ?? { top: 0, left: 0 };
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

              <PlayerBubble
                player={player}
                currentPhase={currentPhase}
                isMe={player.isMe}
                myDescriptionSent={hasSent}
              />

              {/* Name tag: số thứ tự + tên */}
              <div className={`dn-name-tag${player.isMe ? ' dn-name-tag--me' : ''}`}>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      <DescribeDiscussionFlow
        keyword={keyword}
        roundLabel="Vòng 1"
        onDescriptionSubmit={handleDescribeSend}
        onPhaseChange={setCurrentPhase}
        onComplete={handleFlowComplete}
      />

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
            {filteredMessages.map(msg => (
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
