// =============================================
// TypingAfterR1View.tsx
// Màn nhập mô tả / từ khoá ngay sau khi Vòng 1 kết thúc.
// Người chơi nhập xong bấm "Gửi" để chuyển màn.
// =============================================

import React, { useState } from 'react';

interface Props {
  onSubmit?: (text: string) => void;
}

const TypingAfterR1View: React.FC<Props> = ({ onSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter hoặc Cmd+Enter để gửi nhanh
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="rf-overlay rf-typing-r1-overlay">
      <div className="rf-input-box">
        <h2 className="rf-input-title">Nhập mô tả của bạn</h2>

        <textarea
          className="rf-textarea"
          placeholder="Viết mô tả về từ khoá của bạn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        <button
          className="rf-btn rf-btn--submit"
          onClick={handleSubmit}
          disabled={!text.trim()}
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default TypingAfterR1View;