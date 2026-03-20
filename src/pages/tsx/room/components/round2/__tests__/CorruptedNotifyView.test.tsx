import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CorruptedNotifyView from '../CorruptedNotifyView';
import React from 'react';

describe('CorruptedNotifyView', () => {
  const mockOnDone = vi.fn();

  it('a) Hiển thị thông báo bị tha hóa', () => {
    render(
      <CorruptedNotifyView onDone={mockOnDone} />
    );

    expect(screen.getByText(/BẠN BỊ THA HÓA!/i)).toBeDefined();
    expect(screen.getByText(/Hệ thống đã phát hiện sự bất thường/i)).toBeDefined();
  });
});
