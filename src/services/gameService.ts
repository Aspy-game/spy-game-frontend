import axiosInstance from '../api/axiosInstance';
import type { GameRoom, ChatMessage, MostVotedResult, RoleCheckResult } from '../types/models';

export const gameService = {
  /**
   * Lấy thông tin chi tiết của phòng game.
   */
  getRoomDetail: async (roomId: string): Promise<GameRoom> => {
    const response = await axiosInstance.get<GameRoom>(`/rooms/${roomId}`);
    return response.data;
  },

  /**
   * Lấy kết quả bình chọn cao nhất.
   */
  getMostVotedResult: async (roomId: string): Promise<MostVotedResult> => {
    const response = await axiosInstance.get<MostVotedResult>(`/rooms/${roomId}/result/most-voted`);
    return response.data;
  },

  /**
   * Lấy danh sách tin nhắn chat trong phòng.
   */
  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    const response = await axiosInstance.get<ChatMessage[]>(`/rooms/${roomId}/messages`);
    return response.data;
  },

  /**
   * Gửi tin nhắn chat mới.
   */
  sendMessage: async (roomId: string, message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> => {
    const response = await axiosInstance.post<ChatMessage>(`/rooms/${roomId}/messages`, message);
    return response.data;
  },

  /**
   * Tha hóa một người chơi.
   */
  infectPlayer: async (matchId: string, targetId: number): Promise<void> => {
    await axiosInstance.post(`/game/${matchId}/infect`, { target_id: targetId });
  },

  /**
   * Sử dụng kỹ năng đặc biệt (ví dụ: Thao túng AI).
   */
  useAbility: async (matchId: string, content: string): Promise<{ is_manipulated: boolean }> => {
    const response = await axiosInstance.post(`/game/${matchId}/use-ability`, { content });
    return response.data;
  },

  /**
   * Thực hiện bình chọn người chơi.
   */
  votePlayer: async (roomId: string, targetId: number): Promise<void> => {
    await axiosInstance.post(`/rooms/${roomId}/vote`, { targetId });
  },

  /**
   * Gửi dự đoán vai trò.
   */
  guessRole: async (matchId: string, role: 'SPY' | 'CIVILIAN'): Promise<RoleCheckResult> => {
    const response = await axiosInstance.post<RoleCheckResult>(`/game/${matchId}/guess-role`, { role });
    return response.data;
  },

  /**
   * Đặt người chơi làm Spy (Debug).
   */
  setSpy: async (roomId: string, userId: string): Promise<void> => {
    await axiosInstance.post(`/rooms/${roomId}/admin/set-spy`, { user_id: userId });
  }
};
