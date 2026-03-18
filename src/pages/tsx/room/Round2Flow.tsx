// =============================================
// Round2Flow.tsx
// Controller component for the entire Round 2 flow.
// =============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import bgImage from '../../../assets/room/bg.jpg';
import '../../css/room/round2-flow.css';

// --- Child Components ---
import GuessingView from './components/round2/GuessingView';
import GuessCorrectNotify from './components/round2/GuessCorrectNotify';
import ManipulationView from './components/round2/ManipulationView';
import WaitingView from './components/round2/WaitingView';
import GhostChatView from './components/round2/GhostChatView';
import AfterR1View from './components/round2/AfterR1View';
import TypingAfterR1View from './components/round2/TypingAfterR1View';

// --- Types ---
type GameState =
  | 'SELF_GUESSING'           // Tất cả người chơi tự đoán vai trò
  | 'GUESS_CORRECT_NOTIFY'    // Thông báo đoán đúng (chỉ hiện với spy đoán đúng + còn AI)
  | 'PROMPTING_MANIPULATION'  // Hỏi có muốn điều khiển AI không
  | 'ROUND_2_STARTING'        // Màn 2 bắt đầu (Banner "Vòng 2")
  | 'GHOST_CHATTING_AI'       // Vòng 2 với quyền dùng AI
  | 'GHOST_CHATTING_MANUAL'   // Vòng 2 không dùng AI (tự nói)
  | 'AFTER_R1'                // Màn hình sau vòng 1
  | 'TYPING_AFTER_R1';        // Màn đang nhập sau vòng 1

// --- Mock game context (replace with real context/store in production) ---
interface MockPlayer {
  id: string;
  name: string;
  role: 'SPY' | 'CIVILIAN';
  isMe: boolean;
}

interface MockRoom {
  hasAI: boolean;           // Còn AI trong phòng hay không
  players: MockPlayer[];
}

const MOCK_ROOM: MockRoom = {
  hasAI: true,
  players: [
    { id: '1', name: 'Tôi', role: 'SPY', isMe: true },
    { id: '2', name: 'Cú', role: 'CIVILIAN', isMe: false },
    { id: '3', name: 'Tôi (Chó)', role: 'CIVILIAN', isMe: false },
    { id: '4', name: 'Chó', role: 'CIVILIAN', isMe: false },
  ],
};

// --- Main Controller Component ---
const Round2Flow: React.FC = () => {
  const { roomId = 'dev123' } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('SELF_GUESSING');

  // The current player (me)
  const myPlayer = MOCK_ROOM.players.find((p) => p.isMe)!;

  /**
   * Kiểm tra điều kiện để hiển thị màn chọn điều khiển AI:
   *  1. Người chơi có vai trò là SPY
   *  2. Người chơi đoán đúng vai trò của mình (role === guess)
   *  3. Trong phòng vẫn còn AI
   */
  const canControlAI = (guess: 'SPY' | 'CIVILIAN'): boolean => {
    const isCorrectGuess = myPlayer.role === guess;
    const isSpy = myPlayer.role === 'SPY';
    const hasAI = MOCK_ROOM.hasAI;
    return isCorrectGuess && isSpy && hasAI;
  };

  // Tự động chuyển từ Banner "Vòng 2" sang màn hình Chat sau 1 giây
  useEffect(() => {
    if (gameState === 'ROUND_2_STARTING') {
      const timer = setTimeout(() => {
        setGameState('GHOST_CHATTING_MANUAL');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // --- Handlers ---
  const handleRound2Complete = () => {
    // Khi kết thúc miêu tả/tranh luận vòng 2 -> Chuyển sang màn kết quả/bình chọn
    navigate(`/game/${roomId}/vote/notify`);
  };

  const handleSelfGuessSubmit = (guess: 'SPY' | 'CIVILIAN') => {
    console.log(`[Round2Flow] Player guessed: ${guess}, actual role: ${myPlayer.role}`);

    const isCorrect = myPlayer.role === guess;

    if (!isCorrect) {
      // Đoán sai → Vẫn được vào ván (Manual)
      setGameState('ROUND_2_STARTING');
      return;
    }

    if (canControlAI(guess)) {
      setGameState('GUESS_CORRECT_NOTIFY');
    } else {
      // Đoán đúng nhưng là Civilian hoặc không còn AI → Vẫn được vào ván (Manual)
      setGameState('ROUND_2_STARTING');
    }
  };

  const handleCorrectNotifyDone = () => {
    setGameState('PROMPTING_MANIPULATION');
  };

  const handleManipulationChoice = (choice: 'CHATBOT' | 'MANUAL') => {
    console.log(`[Round2Flow] Manipulation choice: ${choice}`);
    if (choice === 'CHATBOT') {
      setGameState('GHOST_CHATTING_AI');
    } else {
      // Chọn "Tự nói" (không dùng AI) → Vẫn được vào ván (Manual)
      setGameState('ROUND_2_STARTING');
    }
  };

  // --- Render Logic ---
  const renderContent = () => {
    // Màn hình Chat Vòng 2 (Full scene)
    if (gameState === 'GHOST_CHATTING_AI') {
      return (
        <GhostChatView
          roomId={roomId}
          canUseAI={true}
          initialTab="AI"
          onComplete={handleRound2Complete}
        />
      );
    }
    if (gameState === 'GHOST_CHATTING_MANUAL') {
      return (
        <GhostChatView
          roomId={roomId}
          canUseAI={false}
          initialTab="MANUAL"
          onComplete={handleRound2Complete}
        />
      );
    }

    // Các màn hình dạng Overlay
    return (
      <div className="dn-screen" style={{ backgroundImage: `url(${bgImage})` }}>
        <header className="dn-header">
          <div className="dn-round-badge">
            <span className="dn-round-badge__text">Vòng 2</span>
          </div>
          <div className="dn-room-badge">
            <span className="dn-room-badge__text">Phòng: {roomId}</span>
          </div>
        </header>

        {gameState === 'SELF_GUESSING'        && <GuessingView onSubmit={handleSelfGuessSubmit} />}
        {gameState === 'GUESS_CORRECT_NOTIFY' && <GuessCorrectNotify onDone={handleCorrectNotifyDone} />}
        {gameState === 'PROMPTING_MANIPULATION' && <ManipulationView onChoice={handleManipulationChoice} />}
        {gameState === 'AFTER_R1'             && <AfterR1View />}
        {gameState === 'TYPING_AFTER_R1'      && <TypingAfterR1View />}
        {gameState === 'ROUND_2_STARTING'     && <WaitingView text="Vòng 2" />}
      </div>
    );
  };

  return <>{renderContent()}</>;
};

export default Round2Flow;
