import type { RoomStatus } from './index';

export interface Player {
  id: number;
  displayName: string;
  emoji: string;
  bgColor: string;
  isMe?: boolean;
  avatarUrl?: string | null;
  seatIndex: number;
  isTyping?: boolean;
  description?: string;
  role?: 'SPY' | 'CIVILIAN';
}

export interface ChatMessage {
  id: number;
  senderName: string;
  nameClass: 'cu' | 'toi' | 'cho' | 'meo';
  text: string;
}

export interface GameRoom {
  id: string;
  status: RoomStatus;
  hasAI: boolean;
  keyword?: string;
  civilianKeyword?: string;
  players: Player[];
  corruptedPlayerId?: number | null;
}

export interface MostVotedResult {
  player: Player & { voteCount: number };
  round: number;
}

export type GameFlowPhase = 'INTRO' | 'DESCRIBING' | 'TIMES_UP_DESC' | 'DISCUSSING' | 'TIMES_UP_DISC' | 'COMPLETED';
