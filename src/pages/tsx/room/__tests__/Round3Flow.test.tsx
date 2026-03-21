import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Round3Flow from '../Round3Flow';
import React from 'react';
import { gameService } from '../../../../services';

// Mock gameService
vi.mock('../../../../services', () => ({
  gameService: {
    getRoomDetail: vi.fn().mockResolvedValue({
      id: 'dev123',
      keyword: 'Beach',
      civilianKeyword: 'Hospital',
      players: []
    }),
    getMessages: vi.fn().mockResolvedValue([])
  }
}));

// Mock các component con để tập trung test logic Round3Flow
vi.mock('../components/round2/CorruptedNotifyView', () => ({
  default: ({ onDone }: { onDone: () => void }) => (
    <div data-testid="corrupted-notify">
      Corrupted Notify
      <button onClick={onDone}>Done</button>
    </div>
  )
}));

vi.mock('../components/round2/GhostChatView', () => ({
  default: () => <div data-testid="ghost-chat">Ghost Chat</div>
}));

vi.mock('../components/round2/CorruptSelectView', () => ({
  default: ({ onComplete }: { onComplete: (id: number) => void }) => (
    <div data-testid="corrupt-select">
      Corrupt Select
      <button onClick={() => onComplete(1)}>Select 1</button>
    </div>
  )
}));

vi.mock('../../../../store/authStore', () => ({
  default: () => ({ user: { user_id: 6, display_name: 'Tôi' } })
}));

describe('Round3Flow Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('c) Event “tha_hóa” trigger đúng listener (giả lập qua timeout)', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/game/dev123/round3?role=civilian']}>
          <Routes>
            <Route path="/game/:roomId/round3" element={<Round3Flow />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(await screen.findByText(/Vòng 3/i)).toBeDefined();

    // Chờ 5 giây để giả lập event tha hóa
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Phải hiển thị màn hình thông báo tha hóa
    expect(screen.getByTestId('corrupted-notify')).toBeDefined();
  });

  it('d) Không crash khi thay đổi trạng thái (giả lập rotate/background)', async () => {
    let result: any;
    await act(async () => {
      result = render(
        <MemoryRouter initialEntries={['/game/dev123/round3?role=spy']}>
          <Routes>
            <Route path="/game/:roomId/round3" element={<Round3Flow />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const { rerender } = result;
    expect(await screen.findByTestId('corrupt-select')).toBeDefined();

    // Rerender giả lập việc component bị mount lại hoặc thay đổi props/context
    await act(async () => {
      rerender(
        <MemoryRouter initialEntries={['/game/dev123/round3?role=spy']}>
          <Routes>
            <Route path="/game/:roomId/round3" element={<Round3Flow />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(await screen.findByTestId('corrupt-select')).toBeDefined();
  });
});
