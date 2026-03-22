// =============================================
// GhostChatView.tsx
// Màn game chính — hiển thị đầy đủ scene:
//   avatar grid, chat, tab AI/Manual, countdown, input.
//
// ── Keyword badge màu theo phe ──────────────
//   canUseAI=true  (spy gốc)    → 1 badge ĐỎ   + spy keyword
//   isCorrupted=true            → 2 badge ĐỎ+VÀNG (thấy cả 2 từ khoá)
//   canUseAI=false, !corrupted  → 1 badge VÀNG  + civilian keyword
// =============================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import useAuthStore from '../../../../../store/authStore';
import bgImage from '../../../../../assets/room/bg.jpg';
import '../../../../css/room/describe-notify.css';
import DescribeDiscussionFlow, { PlayerBubble } from '../common/DescribeDiscussionFlow';
import { gameService } from '../../../../../services';
import { useWebSocket } from '../../../../../hooks/useWebSocket';
import type { Player, ChatMessage, GameFlowPhase } from '../../../../../types/models';

// ── Props ────────────────────────────────────────────────────
interface Props {
  roomId?: string;
  roundLabel?: string;
  keyword?: string;
  civilianKeyword?: string;
  totalSeconds?: number;
  onSendDescription?: (text: string) => void;
  onComplete?: () => void;
  initialTab?: TabType;
  canUseAI?: boolean;
  isCorrupted?: boolean;
  corruptedPlayerId?: number | null;
}

type TabType = 'AI' | 'MANUAL';

// ── Layout constants ─────────────────────────────────────────
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

// ── Component ────────────────────────────────────────────────
const GhostChatView: React.FC<Props> = ({
  roomId = '',
  roundLabel = 'Vòng 2',
  keyword: initialKeyword = '',
  civilianKeyword: initialCivilianKeyword = '',
  totalSeconds = 30,
  onSendDescription,
  onComplete,
  initialTab = 'AI',
  canUseAI = true,
  isCorrupted = false,
  corruptedPlayerId = null,
}) => {
  const { user } = useAuthStore();
  const myDisplayName = user?.display_name ?? 'Tôi';
  const myAvatarUrl   = user?.avatar_url   ?? null;
  const mySeatIndex   = 5; // [BE] nhận từ WebSocket player.seatIndex

  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]       = useState('');
  const [chatExpanded, setChatExpanded] = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const messagesEndRef                  = useRef<HTMLDivElement>(null);

  const { connect, disconnect, subscribe, connected } = useWebSocket();

  const [currentPhase, setCurrentPhase]           = useState<GameFlowPhase>('INTRO');
  const [activeTab, setActiveTab]                 = useState<TabType>(initialTab);
  const [myDescriptionSent, setMyDescriptionSent] = useState(false);

  const [keyword, setKeyword] = useState(initialKeyword);
  const [civilianKeyword, setCivilianKeyword] = useState(initialCivilianKeyword);
  const [isMeCorrupted, setIsMeCorrupted] = useState(isCorrupted);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [roomData, msgData] = await Promise.all([
          gameService.getRoomDetail(roomId),
          gameService.getMessages(roomId)
        ]);

        if (roomData) {
          setKeyword(roomData.keyword || initialKeyword);
          setCivilianKeyword(roomData.civilianKeyword || initialCivilianKeyword);
          
          if (roomData.corruptedPlayerId === user?.user_id) {
            setIsMeCorrupted(true);
          }

          const mappedPlayers = roomData.players.map(p => ({
            ...p,
            isMe: p.id === user?.user_id || p.displayName === myDisplayName,
            isTyping: false
          }));
          setPlayers(mappedPlayers);
        }

        setMessages(msgData || []);
      } catch (err) {
        console.error('Failed to fetch data for GhostChatView', err);
        setError('Không thể tải dữ liệu phòng chơi. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roomId, user?.user_id, myDisplayName, initialKeyword, initialCivilianKeyword]);

  // WebSocket connection
  useEffect(() => {
    if (!roomId) return;
    connect();
    return () => disconnect();
  }, [roomId, connect, disconnect]);

  // WebSocket subscriptions
  useEffect(() => {
    if (connected && roomId) {
      const msgSub = subscribe(`/topic/room/${roomId}/messages`, (msg: ChatMessage) => {
        setMessages(prev => {
          if (msg.senderName === 'Tôi:' || msg.senderName === (user?.display_name + ':')) {
             if (prev.some(p => p.id === msg.id)) return prev;
          }
          return [...prev, msg];
        });
      });

      const typingSub = subscribe(`/topic/room/${roomId}/typing`, (data: { playerId: number, isTyping: boolean }) => {
        setPlayers(prev => prev.map(p => p.id === data.playerId ? { ...p, isTyping: data.isTyping } : p));
      });

      // Lắng nghe thông báo tha hóa
      const privateSub = subscribe('/queue/private', (data: any) => {
        if (data.type === 'INFECTED') {
          setIsMeCorrupted(true);
          if (data.spyKeyword) {
            setKeyword(data.spyKeyword);
          }
        }
      });

      return () => {
        msgSub?.unsubscribe();
        typingSub?.unsubscribe();
        privateSub?.unsubscribe();
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
      if (activeTab === 'AI' && canUseAI) {
        // Thao túng AI
        const res = await gameService.useAbility(roomId, text);
        if (res.is_manipulated) {
          // BE sẽ tự gửi tin nhắn AI qua socket, FE không cần thêm manual ở đây
          // Nhưng có thể hiện thông báo "Đã gửi qua AI (+30 xu)"
        }
      } else {
        const newMessage = await gameService.sendMessage(roomId, {
          senderName: 'Tôi:',
          nameClass: 'toi',
          text
        });
        setMessages(prev => [...prev, newMessage]);
      }
      setChatInput('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleDescSubmit = (text: string) => {
    setPlayers(prev => prev.map(p => p.isMe ? { ...p, description: text } : p));
    setMyDescriptionSent(true);
    onSendDescription?.(text);
  };

  // ── Quyết định hiện badge nào ─────────────────────────────
  const keywordsToShow = useMemo(() => {
    if (isMeCorrupted) {
      return [
        { text: keyword,         type: 'spy'      }, // Đỏ — phe gián điệp
        { text: civilianKeyword, type: 'civilian' }, // Vàng — phe dân thường
      ];
    }
    return canUseAI
      ? [{ text: keyword,         type: 'spy'      }]
      : [{ text: civilianKeyword, type: 'civilian' }];
  }, [isMeCorrupted, canUseAI, keyword, civilianKeyword]);

  // Keyword dùng cho DescribeDiscussionFlow
  const displayKeyword = isMeCorrupted ? keyword : keywordsToShow[0].text;

  const showKeywordBadge = true;

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
          <span className="dn-round-badge__text">{roundLabel}</span>
        </div>

        {/* Keyword badge(s) - 1 badge: center; 2 badges: fit between round-badge and room-badge */}
        {showKeywordBadge && (
          <div style={{
            position: 'absolute',
            left: '220px',
            right: '350px',
            top: '20px',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            zIndex: 10,
            animation: 'dn-fadeDown 0.4s ease both',
          }}>
            {keywordsToShow.map((kw, idx) => (
              <div
                key={idx}
                style={{
                  flexShrink: 0,
                  height: '82px',
                  padding: '0 24px',
                  borderRadius: '30px',
                  boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: kw.type === 'spy'
                    ? 'rgba(160, 0, 0, 0.95)'
                    : 'rgba(207, 147, 37, 0.86)',
                }}
              >
                <span style={{
                  fontFamily: "'Jaini Purva', cursive",
                  fontSize: '52px',
                  fontWeight: 400,
                  lineHeight: 1.314,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                }}>{kw.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="dn-room-badge">
          <span className="dn-room-badge__text">Phòng: {roomId}</span>
        </div>
      </header>

      {/* ── Avatar grid ── */}
      <div className="dn-avatars">
        {players.map(player => {
          const pos          = AVATAR_POSITIONS[player.seatIndex] ?? { top: 0, left: 0 };
          const order        = SEAT_DISPLAY_ORDER[player.seatIndex] ?? (player.seatIndex + 1);
          const label        = player.isMe ? `${order}. Tôi` : `${order}. ${player.displayName}`;
          const isCorrPlayer = (corruptedPlayerId !== null && player.id === corruptedPlayerId) || (player.isMe && isMeCorrupted);
          const isSpyTeam    = (player.isMe && (canUseAI || isMeCorrupted)) || isCorrPlayer;

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

              {/* Badge "Bị tha hóa" */}
              {isCorrPlayer && (
                <div style={{
                  position: 'absolute',
                  top: '-38px', left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(180, 0, 0, 0.92)',
                  border: '2px solid #FF3B30',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  whiteSpace: 'nowrap', zIndex: 50,
                  boxShadow: '0 2px 12px rgba(255,59,48,0.5)',
                  animation: 'dn-fadeDown 0.4s ease both',
                }}>
                  <span style={{ fontSize: '14px' }}>☠️</span>
                  <span style={{
                    fontFamily: "'Baloo Bhaijaan 2', sans-serif",
                    fontSize: '16px', fontWeight: 700, color: '#fff',
                  }}>Bị tha hóa</span>
                </div>
              )}

              {/* Tab AI + badge — chỉ spy gốc */}
              {player.seatIndex === 0 && canUseAI && (
                <>
                  <div style={{
                    position: 'absolute', top: '20px', right: '110%',
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    zIndex: 100, width: 'max-content',
                  }}>
                    <button onClick={() => setActiveTab('AI')} style={{
                      background: activeTab === 'AI' ? '#FF843D' : 'rgba(0,0,0,0.5)',
                      color: 'white', border: 'none', borderRadius: '12px',
                      padding: '6px 12px', fontSize: '13px', fontWeight: 'bold',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>Trò chuyện giùm</button>
                    <button onClick={() => setActiveTab('MANUAL')} style={{
                      background: activeTab === 'MANUAL' ? '#5B4133' : 'rgba(0,0,0,0.5)',
                      color: 'white', border: 'none', borderRadius: '12px',
                      padding: '6px 12px', fontSize: '13px', fontWeight: 'bold',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>Tự nói</button>
                  </div>
                  {activeTab === 'AI' && (
                    <div style={{
                      position: 'absolute', top: '-10px', right: '-10px',
                      background: '#A020F0', color: 'white',
                      width: '28px', height: '28px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 'bold',
                      border: '2px solid white', zIndex: 101,
                    }}>AI</div>
                  )}
                </>
              )}

              <PlayerBubble
                player={player}
                currentPhase={currentPhase}
                isMe={player.isMe}
                myDescriptionSent={myDescriptionSent}
              />

              <div className={`dn-name-tag${isSpyTeam ? ' dn-name-tag--spy' : ' dn-name-tag--civilian'}`}>
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Game flow ── */}
      <DescribeDiscussionFlow
        keyword={displayKeyword}
        roundLabel={roundLabel}
        descriptionTime={totalSeconds}
        onDescriptionSubmit={handleDescSubmit}
        onPhaseChange={setCurrentPhase}
        onComplete={onComplete}
      />

      {/* ── Chat panel ── */}
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