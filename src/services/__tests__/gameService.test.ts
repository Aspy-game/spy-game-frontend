import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gameService } from '../gameService';
import axiosInstance from '../../api/axiosInstance';

vi.mock('../../api/axiosInstance');

describe('gameService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API calls', () => {
    it('getRoomDetail nên gọi API đúng endpoint', async () => {
      const mockData = { id: 'test-room', players: [] };
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: mockData });

      const result = await gameService.getRoomDetail('test-room');
      expect(axiosInstance.get).toHaveBeenCalledWith('/rooms/test-room');
      expect(result).toEqual(mockData);
    });

    it('getMessages nên gọi API đúng endpoint', async () => {
      const mockData = [{ id: 1, text: 'hello' }];
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({ data: mockData });

      const result = await gameService.getMessages('test-room');
      expect(axiosInstance.get).toHaveBeenCalledWith('/rooms/test-room/messages');
      expect(result).toEqual(mockData);
    });

    it('sendMessage nên gọi API đúng endpoint và payload', async () => {
      const message = { senderName: 'Tôi:', nameClass: 'toi' as const, text: 'hi' };
      const mockResponse = { ...message, id: 123 };
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await gameService.sendMessage('test-room', message);
      expect(axiosInstance.post).toHaveBeenCalledWith('/rooms/test-room/messages', message);
      expect(result).toEqual(mockResponse);
    });

    it('corruptPlayer nên gọi API đúng endpoint và payload', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({});

      await gameService.corruptPlayer('test-room', 1);
      expect(axiosInstance.post).toHaveBeenCalledWith('/rooms/test-room/corrupt', { targetId: 1 });
    });

    it('votePlayer nên gọi API đúng endpoint và payload', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({});

      await gameService.votePlayer('test-room', 2);
      expect(axiosInstance.post).toHaveBeenCalledWith('/rooms/test-room/vote', { targetId: 2 });
    });
  });
});
