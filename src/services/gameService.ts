import axiosInstance from '../api/axiosInstance';
import type { GameRoom, ChatMessage, MostVotedResult } from '../types/models';

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
  corruptPlayer: async (roomId: string, targetId: number): Promise<void> => {
    await axiosInstance.post(`/rooms/${roomId}/corrupt`, { targetId });
  },

  /**
   * Thực hiện bình chọn người chơi.
   */
  votePlayer: async (roomId: string, targetId: number): Promise<void> => {
    await axiosInstance.post(`/rooms/${roomId}/vote`, { targetId });
  }
};
