// =============================================
// DescribeDiscussionFlow.tsx
// Component tái sử dụng cho các vòng chơi có phần Miêu tả và Tranh luận.
// Dựa trên DescribeNotify.tsx — PlayerBubble khớp hoàn toàn với DescribeNotify.
// =============================================

import React, { useState, useEffect } from 'react';

export type GameFlowPhase = 'INTRO' | 'DESCRIBING' | 'TIMES_UP_DESC' | 'DISCUSSING' | 'TIMES_UP_DISC' | 'COMPLETED';

interface Props {
  keyword: string;
  roundLabel?: string;
  descriptionTime?: number;
  discussionTime?: number;
  onDescriptionSubmit?: (text: string) => void;
  onPhaseChange?: (phase: GameFlowPhase) => void;
  onComplete?: () => void;
}

const DescribeDiscussionFlow: React.FC<Props> = ({
  keyword,
  roundLabel = 'Vòng chơi',
  descriptionTime = 30,
  discussionTime = 30,
  onDescriptionSubmit,
  onPhaseChange,
  onComplete,
}) => {
  const [phase, setPhase] = useState<GameFlowPhase>('INTRO');
  const [countdown, setCountdown] = useState(descriptionTime);
  const [describeInput, setDescribeInput] = useState('');
  const [hasSent, setHasSent] = useState(false);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  // Phase 1: Intro Banner (3s)
  useEffect(() => {
    const timer = setTimeout(() => setPhase('DESCRIBING'), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Phase 2: Describing Countdown
  useEffect(() => {
    if (phase !== 'DESCRIBING') return;
    if (countdown <= 0) { setPhase('TIMES_UP_DESC'); return; }
    const timer = setTimeout(() => setCountdown(n => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, phase]);

  // Phase 3a: Times Up Overlay (2.5s) → Discussing
  useEffect(() => {
    if (phase !== 'TIMES_UP_DESC') return;
    const timer = setTimeout(() => {
      setPhase('DISCUSSING');
      setCountdown(discussionTime);
    }, 2500);
    return () => clearTimeout(timer);
  }, [phase, discussionTime]);

  // Phase 3b: Discussing Countdown
  useEffect(() => {
    if (phase !== 'DISCUSSING') return;
    if (countdown <= 0) { setPhase('TIMES_UP_DISC'); return; }
    const timer = setTimeout(() => setCountdown(n => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, phase]);

  // Phase 4: Times Up Discussion (2.5s) → Complete
  useEffect(() => {
    if (phase !== 'TIMES_UP_DISC') return;
    const timer = setTimeout(() => {
      setPhase('COMPLETED');
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  const handleSend = () => {
    const text = describeInput.trim();
    if (!text || hasSent) return;
    onDescriptionSubmit?.(text);
    setHasSent(true);
    setDescribeInput('');
  };

  return (
    <>
      {/* 1. BANNER GIỚI THIỆU */}
      {phase === 'INTRO' && (
        <div className="dn-banner">
          <span className="dn-banner__text">
            {roundLabel}: Bạn có {descriptionTime}s miêu tả từ
            <span className="dn-banner__keyword"> {keyword}</span>
          </span>
        </div>
      )}

      {/* 2. Ô NHẬP MÔ TẢ */}
      {phase === 'DESCRIBING' && (
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
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                autoFocus
              />
              <button className="dn-send-btn" onClick={handleSend} aria-label="gửi mô tả">
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

      {/* 3a. OVERLAY HẾT GIỜ MIÊU TẢ */}
      {phase === 'TIMES_UP_DESC' && (
        <div className="dn-timesup-overlay">
          <div className="dn-timesup-box">
            <span className="dn-timesup-text">Hết thời gian miêu tả</span>
          </div>
        </div>
      )}

      {/* 3b. PANEL TRANH LUẬN */}
      {phase === 'DISCUSSING' && (
        <div className="dn-discuss-wrap">
          <div className="dn-discuss-countdown">
            <span className="dn-countdown-badge__icon">⏳</span>
            <span className="dn-countdown-badge__num">{countdown}</span>
          </div>
          <div className="dn-discuss-panel">
            <span className="dn-discuss-panel__text">Thời gian tranh luận</span>
          </div>
        </div>
      )}

      {/* 4. OVERLAY HẾT GIỜ TRANH LUẬN */}
      {phase === 'TIMES_UP_DISC' && (
        <div className="dn-discuss-timesup-overlay">
          <div className="dn-discuss-timesup-box">
            <span className="dn-discuss-timesup-text">Hết thời gian tranh luận</span>
          </div>
        </div>
      )}
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// PlayerBubble — khớp hoàn toàn với renderBubble() trong DescribeNotify.tsx
// ─────────────────────────────────────────────────────────────

// Offset lấy thẳng từ BUBBLE_OFFSETS + TYPING_OFFSETS của DescribeNotify
const BUBBLE_OFFSETS: Record<number, { top: number; left: number }> = {
  0: { top: 43, left: 156  }, // top center   → bubble bên PHẢI
  1: { top: 43, left: 156  }, // right top    → bubble bên PHẢI  ← đã fix (trước là -288)
  2: { top: 43, left: 156  }, // right bot    → bubble bên PHẢI  ← đã fix (trước là -288)
  3: { top: 43, left: 156  }, // bot center   → bubble bên PHẢI
  4: { top: 43, left: -288 }, // left bot     → bubble bên TRÁI
  5: { top: 43, left: -288 }, // left top     → bubble bên TRÁI
};

export const PlayerBubble: React.FC<{
  player: { seatIndex: number; isTyping?: boolean; description?: string };
  currentPhase: GameFlowPhase;
  isMe?: boolean;
  myDescriptionSent?: boolean;
}> = ({ player, currentPhase, isMe, myDescriptionSent }) => {
  const seat = player.seatIndex;
  const bOff = BUBBLE_OFFSETS[seat] ?? { top: 43, left: 156 };

  // ── Typing bubble — chỉ hiện khi DESCRIBING, người khác đang nhập ──
  if (currentPhase === 'DESCRIBING' && player.isTyping && !isMe) {
    return (
      <div
        className={`dn-typing-bubble dn-typing-bubble--${seat}`}
        style={{ top: bOff.top, left: bOff.left }}
      >
        <span className="dn-typing-bubble__text">Đang nhập...</span>
      </div>
    );
  }

  // ── Speech bubble — giống hệt renderBubble() trong DescribeNotify ──
  //
  // Trường hợp 1: Phase DISCUSSING / TIMES_UP_DISC → hiện TẤT CẢ bubble
  //   (kể cả người không có description → hiện "[ ]")
  const showAllBubbles =
    currentPhase === 'DISCUSSING' || currentPhase === 'TIMES_UP_DISC';

  if (showAllBubbles) {
    const raw   = player.description ?? '';
    const label = raw.trim() === '' ? '[ ]' : raw;
    return (
      <div
        className={`dn-speech-bubble dn-speech-bubble--${seat}`}
        style={{ top: bOff.top, left: bOff.left }}
      >
        <span className="dn-speech-bubble__text">{label}</span>
      </div>
    );
  }

  // Trường hợp 2: Bản thân vừa gửi xong (hasSent) → hiện bubble của mình trước
  if (isMe && myDescriptionSent && player.description) {
    return (
      <div
        className={`dn-speech-bubble dn-speech-bubble--${seat}`}
        style={{ top: bOff.top, left: bOff.left }}
      >
        <span className="dn-speech-bubble__text">{player.description}</span>
      </div>
    );
  }

  return null;
};

export default DescribeDiscussionFlow;