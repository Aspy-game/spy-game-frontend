import { useState, useEffect, useCallback } from 'react';

export type GameFlowPhase = 'INTRO' | 'DESCRIBING' | 'TIMES_UP_DESC' | 'DISCUSSING' | 'TIMES_UP_DISC' | 'COMPLETED';

interface UseDescribeDiscussionProps {
  descriptionTime?: number;
  discussionTime?: number;
  onPhaseChange?: (phase: GameFlowPhase) => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

export const useDescribeDiscussion = ({
  descriptionTime = 30,
  discussionTime = 30,
  onPhaseChange,
  onComplete,
  autoStart = true,
}: UseDescribeDiscussionProps = {}) => {
  const [phase, setPhase] = useState<GameFlowPhase>(autoStart ? 'INTRO' : 'COMPLETED');
  const [countdown, setCountdown] = useState(descriptionTime);

  const transitionTo = useCallback((nextPhase: GameFlowPhase) => {
    setPhase(nextPhase);
    onPhaseChange?.(nextPhase);
  }, [onPhaseChange]);

  // Phase transitions
  useEffect(() => {
    if (phase === 'INTRO') {
      const timer = setTimeout(() => transitionTo('DESCRIBING'), 3000);
      return () => clearTimeout(timer);
    }

    if (phase === 'TIMES_UP_DESC') {
      const timer = setTimeout(() => {
        setCountdown(discussionTime);
        transitionTo('DISCUSSING');
      }, 2500);
      return () => clearTimeout(timer);
    }

    if (phase === 'TIMES_UP_DISC') {
      const timer = setTimeout(() => {
        transitionTo('COMPLETED');
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase, discussionTime, transitionTo, onComplete]);

  // Countdown logic
  useEffect(() => {
    if (phase !== 'DESCRIBING' && phase !== 'DISCUSSING') return;

    if (countdown <= 0) {
      if (phase === 'DESCRIBING') transitionTo('TIMES_UP_DESC');
      if (phase === 'DISCUSSING') transitionTo('TIMES_UP_DISC');
      return;
    }

    const timer = setTimeout(() => setCountdown(n => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, phase, transitionTo]);

  return {
    phase,
    countdown,
    setPhase: transitionTo,
    setCountdown,
  };
};
