import type { Player, ChatMessage, GameRoom } from '../types/models';

export const MOCK_OTHER_PLAYERS: Player[] = [
  { id: 1, displayName: 'Cú',   emoji: '🦉', bgColor: 'linear-gradient(135deg,#8B5E3C,#5C3A1C)', seatIndex: 0, role: 'CIVILIAN' },
  { id: 2, displayName: 'Mèo',  emoji: '🐱', bgColor: 'linear-gradient(135deg,#C8A882,#9A7050)', seatIndex: 1, role: 'CIVILIAN' },
  { id: 3, displayName: 'Chó',  emoji: '🐶', bgColor: 'linear-gradient(135deg,#D4956A,#A06030)', seatIndex: 2, role: 'CIVILIAN' },
  { id: 4, displayName: 'Chim', emoji: '🐦', bgColor: 'linear-gradient(135deg,#7FB3D3,#4A8FAD)', seatIndex: 3, role: 'CIVILIAN' },
  { id: 5, displayName: 'Cáo',  emoji: '🦊', bgColor: 'linear-gradient(135deg,#E8845C,#C4552C)', seatIndex: 4, role: 'CIVILIAN' },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, senderName: 'Cú:',  nameClass: 'cu',  text: 'helu mấy cưng' },
  { id: 2, senderName: 'Tôi:', nameClass: 'toi', text: '' },
  { id: 3, senderName: 'Chó:', nameClass: 'cho', text: '' },
  { id: 4, senderName: 'Mèo:', nameClass: 'meo', text: '' },
];

export const MOCK_ROOM: GameRoom = {
  id: 'dev123',
  status: 'in_game',
  hasAI: true,
  keyword: 'Hospital',
  civilianKeyword: 'Hospital',
  players: [
    ...MOCK_OTHER_PLAYERS,
    {
      id: 6,
      displayName: 'Tôi',
      emoji: '🐻',
      bgColor: 'linear-gradient(135deg,#9B7B5A,#705030)',
      isMe: true,
      avatarUrl: null,
      seatIndex: 5,
      role: 'SPY'
    },
  ],
  corruptedPlayerId: null,
};
