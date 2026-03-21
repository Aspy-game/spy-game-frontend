// =============================================
// VoteFlow.tsx - Final
// =============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bgImage from '../../../assets/room/bg.jpg';
import '../../css/room/vote-flow.css';
import useAuthStore from '../../../store/authStore';
import { gameService } from '../../../services';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { Player, ChatMessage } from '../../../types/models';

type VoteStatus = 'notify' | 'select' | 'sent' | 'timeout';

const AVATAR_POSITIONS: Record<number, { top: number; left: number }> = {
  0: { top: 192, left: 0   }, // 0 → 1. Tôi   (trái trên)
  1: { top: 0,   left: 303 }, // 1 → 2. Cú    (top center)
  2: { top: 192, left: 572 }, // 2 → 3. Mèo   (phải trên)
  3: { top: 481, left: 592 }, // 3 → 4. Chó   (phải dưới)
  4: { top: 656, left: 303 }, // 4 → 5. Chim  (dưới giữa)
  5: { top: 481, left: 0   }, // 5 → 6. Cáo   (trái dưới)
};

// ── Sub-components ──────────────────────────────────────────
const NotifyView = () => (
  <div className="dn-timesup-overlay">
    <div className="dn-timesup-card">
      <div className="dn-timesup-icon">🗳️</div>
      <div className="dn-timesup-title">THỜI GIAN BÌNH CHỌN</div>
      <div className="dn-timesup-sub">Hãy chọn người mà bạn nghi ngờ là Gián điệp nhất!</div>
    </div>
  </div>
);

const SentView = () => (
  <div className="vf-center">
    <div className="vf-check-circle">
      <svg viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="56" stroke="#34C759" strokeWidth="8"/>
        <path d="M35 60L52 77L85 44" stroke="#34C759" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div className="vf-sent-label">ĐÃ GỬI BÌNH CHỌN</div>
    <div className="vf-waiting-sub">Vui lòng chờ mọi người hoàn tất...</div>
    <div className="vf-loading-bar">
      <div className="vf-loading-bar__fill"></div>
    </div>
  </div>
);

const TimeoutView = () => (
  <div className="dn-timesup-overlay">
    <div className="dn-timesup-card" style={{ background: 'rgba(231, 76, 60, 0.9)' }}>
      <div className="dn-timesup-icon">⏰</div>
      <div className="dn-timesup-title">HẾT GIỜ!</div>
      <div className="dn-timesup-sub">Bạn đã không kịp bình chọn...</div>
    </div>
  </div>
);

// ── Main Component ──────────────────────────────────────────
const VoteFlow: React.FC = () => {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const roomId = paramRoomId ?? '';

  const { user } = useAuthStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voteStatus, setVoteStatus] = useState<VoteStatus>('notify');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [votedPlayerId, setVotedPlayerId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connect, disconnect, subscribe, connected } = useWebSocket();

  // ── Chat state ──
  const [chatInput, setChatInput] = useState('');
  const [chatExpanded, setChatExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

        if (roomData && roomData.players) {
          const mappedPlayers = roomData.players.map(p => ({
            ...p,
            isMe: p.id === user?.user_id || p.displayName === (user?.display_name ?? 'Tôi')
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
          if (msg.senderName === 'Tôi:' || msg.senderName === (user?.display_name + ':')) {
             if (prev.some(p => p.id === msg.id)) return prev;
          }
          return [...prev, msg];
        });
      });

      // Subscribe to votes (giả sử server gửi event khi có ai đó vote)
      const voteSub = subscribe(`/topic/room/${roomId}/votes`, (data: { voterId: number, targetId: number }) => {
        console.log(`[WS] Player ${data.voterId} voted for ${data.targetId}`);
        // Cập nhật UI nếu cần (ví dụ hiện icon đã vote trên avatar)
      });

      // Subscribe to room state (để tự động chuyển sang kết quả khi hết giờ)
      const stateSub = subscribe(`/topic/room/${roomId}/state`, (message: any) => {
        if (message.state === 'VOTE_RESULT' || message === 'VOTE_RESULT') {
          navigate(`/game/${roomId}/result/vote`);
        }
      });

      return () => {
        msgSub?.unsubscribe();
        voteSub?.unsubscribe();
        stateSub?.unsubscribe();
      };
    }
  }, [connected, roomId, subscribe, user?.display_name, navigate]);

  const handleVote = useCallback(async (id: number) => {
    console.log(`Voted for player ${id} in room ${roomId}`);
    try {
      setVotedPlayerId(id);
      // Gọi API thật đến Backend
      await gameService.votePlayer(roomId, id);
      setVoteStatus('sent');
    } catch (err) {
      console.error('Failed to vote', err);
      // Có thể thêm thông báo lỗi cho người dùng ở đây
      setVotedPlayerId(null);
    }
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
  }, [voteStatus, countdown, roomId, navigate]);

  // ── Auto scroll chat ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Chat handlers ──
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

      {/* HEADER – giống DescribeNotify */}
      <header className="dn-header">
        <div className="dn-round-badge">
          <span className="dn-round-badge__text">Vòng 1</span>
        </div>
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