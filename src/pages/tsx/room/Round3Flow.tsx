// =============================================
// Round3Flow.tsx
// Controller cho Vòng 3 — 3 góc nhìn:
//
// ── DEV: Test bằng URL ──────────────────────
//   /dev/round3               → Gián điệp gốc (mặc định)
//   /dev/round3?role=spy      → Gián điệp gốc
//   /dev/round3?role=corrupted → Người vừa bị tha hóa
//   /dev/round3?role=civilian  → Thường dân
//
// ── Flow theo từng role ─────────────────────
//   spy:       CORRUPT_SELECT → ROUND_3_STARTING → PLAYING(canUseAI=true)
//   corrupted: CORRUPTED_NOTIFY → ROUND_3_STARTING → PLAYING(canUseAI=false, isCorrupted=true)
//   civilian:  ROUND_3_STARTING → PLAYING(canUseAI=false, isCorrupted=false)
// =============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import bgImage from '../../../assets/room/bg.jpg';
import '../../css/room/describe-notify.css';
import '../../css/room/round2-flow.css';

import CorruptSelectView   from './components/round2/CorruptSelectView';
import CorruptedNotifyView from './components/round2/CorruptedNotifyView';
import GhostChatView       from './components/round2/GhostChatView';
import WaitingView         from './components/round2/WaitingView';

import useAuthStore from '../../../store/authStore';
import { gameService } from '../../../services';
import { useWebSocket } from '../../../hooks/useWebSocket';
import type { GameRoom } from '../../../types/models';

// ── Types ─────────────────────────────────────────────────────
type Role      = 'spy' | 'corrupted' | 'civilian';
type GameState =
  | 'CORRUPT_SELECT'    // Spy gốc chọn người tha hóa
  | 'CORRUPTED_NOTIFY'  // Người bị tha hóa nhận thông báo
  | 'ROUND_3_STARTING'  // Banner "Vòng 3"
  | 'PLAYING';          // Game chính

// ── Xác định trạng thái ban đầu theo role ─────────────────────
function getInitialState(role: Role): GameState {
  if (role === 'spy')       return 'CORRUPT_SELECT';
  if (role === 'corrupted') return 'CORRUPTED_NOTIFY';
  return 'ROUND_3_STARTING';
}

// ── Component ─────────────────────────────────────────────────
const Round3Flow: React.FC = () => {
  const { roomId = '' } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // [BE] Production: lấy role từ WebSocket/store thay vì URL
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') as Role | null;
  const initialRole: Role = (roleParam === 'civilian' || roleParam === 'corrupted')
    ? roleParam
    : 'spy'; // mặc định spy

  const [role, setRole]           = useState<Role>(initialRole);
  const [gameState, setGameState] = useState<GameState>(getInitialState(initialRole));
  const [corruptedPlayerId, setCorruptedPlayerId] = useState<number | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connect, disconnect, subscribe, connected } = useWebSocket();

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await gameService.getRoomDetail(roomId);
        setRoom(data);
      } catch (err) {
        console.error('Failed to fetch room detail', err);
        setError('Không thể tải thông tin phòng chơi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  // WebSocket connection
  useEffect(() => {
    if (!roomId) return;
    connect();
    return () => disconnect();
  }, [roomId, connect, disconnect]);

  // WebSocket subscriptions
  useEffect(() => {
    if (connected && roomId) {
      // Subscribe to infection event
      const infectionSub = subscribe(`/user/queue/infection`, (data: { corruptedPlayerId: number }) => {
        console.log('[WS] You have been corrupted!');
        setRole('corrupted');
        setGameState('CORRUPTED_NOTIFY');
        setCorruptedPlayerId(data.corruptedPlayerId);
      });

      // Subscribe to general room state
      const stateSub = subscribe(`/topic/room/${roomId}/state`, (message: any) => {
        if (message.state === 'ROUND_3_STARTING' || message === 'ROUND_3_STARTING') {
          setGameState('ROUND_3_STARTING');
        }
      });

      return () => {
        infectionSub?.unsubscribe();
        stateSub?.unsubscribe();
      };
    }
  }, [connected, roomId, subscribe]);

  // Spy gốc xác nhận chọn xong
  const handleCorruptDone = async (playerId: number) => {
    setCorruptedPlayerId(playerId);
    setGameState('ROUND_3_STARTING');
    setTimeout(() => setGameState('PLAYING'), 2000);
  };

  // Người bị tha hóa đã xem xong thông báo
  const handleCorruptedNotifyDone = () => {
    setGameState('ROUND_3_STARTING');
    setTimeout(() => setGameState('PLAYING'), 2000);
  };

  // ── Keyword Badge Logic for Header ─────────────────────────
  const spyKeyword = room?.keyword || "";
  const civilianKeyword = room?.civilianKeyword || "";

  const renderKeywordBadges = () => {
    if (role === 'corrupted') {
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="dn-keyword-badge" style={{ background: 'rgba(160, 0, 0, 0.9)' }}>
            <span className="dn-keyword-badge__text">{spyKeyword}</span>
          </div>
          <div className="dn-keyword-badge" style={{ background: 'rgba(207, 147, 37, 0.9)' }}>
            <span className="dn-keyword-badge__text">{civilianKeyword}</span>
          </div>
        </div>
      );
    }
    const kw = role === 'spy' ? spyKeyword : civilianKeyword;
    const bgColor = role === 'spy' ? 'rgba(160, 0, 0, 0.9)' : 'rgba(207, 147, 37, 0.9)';
    return (
      <div className="dn-keyword-badge" style={{ background: bgColor }}>
        <span className="dn-keyword-badge__text">{kw}</span>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────

  if (gameState === 'CORRUPT_SELECT') {
    return (
      <CorruptSelectView
        roomId={roomId}
        round={3}
        selectSeconds={15}
        onComplete={handleCorruptDone}
      />
    );
  }

  if (gameState === 'CORRUPTED_NOTIFY') {
    return (
      <div className="dn-screen" style={{ backgroundImage: `url(${bgImage})` }}>
        <header className="dn-header">
          <div className="dn-round-badge">
            <span className="dn-round-badge__text">Vòng 3</span>
          </div>
          {renderKeywordBadges()}
          <div className="dn-room-badge">
            <span className="dn-room-badge__text">Phòng: {roomId}</span>
          </div>
        </header>
        <CorruptedNotifyView onDone={handleCorruptedNotifyDone} />
      </div>
    );
  }

  // Game hoàn tất → vote
  const handleRound3Complete = () => {
    navigate(`/game/${roomId}/vote/notify`);
  };

  if (gameState === 'PLAYING') {
    return (
      <GhostChatView
        roomId={roomId}
        roundLabel="Vòng 3"
        keyword={spyKeyword}              // [BE] từ khoá phe gián điệp
        civilianKeyword={civilianKeyword}   // [BE] từ khoá phe dân thường
        totalSeconds={30}
        canUseAI={role === 'spy'}    // Chỉ spy gốc mới có AI
        initialTab={role === 'spy' ? 'AI' : 'MANUAL'}
        isCorrupted={role === 'corrupted'}   // ← người bị tha hóa thấy cả 2 từ khoá
        onComplete={handleRound3Complete}
        corruptedPlayerId={corruptedPlayerId}
      />
    );
  }

  // Banner "Vòng 3"
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
          <span className="dn-round-badge__text">Vòng 3</span>
        </div>
        {renderKeywordBadges()}
        <div className="dn-room-badge">
          <span className="dn-room-badge__text">Phòng: {roomId}</span>
        </div>
      </header>
      <WaitingView text="Vòng 3" />
    </div>
  );
};

export default Round3Flow;