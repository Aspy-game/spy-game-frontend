// =============================================
// CorruptedNotifyView.tsx
// Màn thông báo cho người vừa bị tha hóa.
// Hiển thị 2 khối từ khóa riêng biệt: Phe người thường và Phe gián điệp.
// =============================================

import React, { useEffect, useState } from 'react';

interface Props {
  onDone: () => void;
  autoAdvanceMs?: number;
}

const CorruptedNotifyView: React.FC<Props> = ({ 
  onDone, 
  autoAdvanceMs = 8000, 
}) => {
  const [remaining, setRemaining] = useState(Math.ceil(autoAdvanceMs / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); onDone(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="rf-overlay" style={{ background: 'rgba(0,0,0,0.8)', overflowY: 'auto' }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        margin: '40px auto',
        background: 'rgba(30, 10, 10, 0.95)',
        border: '3px solid #FF3B30',
        borderRadius: '36px',
        padding: '40px 20px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 12px 48px rgba(255,59,48,0.4)',
        animation: 'dn-boxPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        {/* Countdown Badge */}
        <div style={{
          position: 'absolute',
          top: '-25px', left: '50%', transform: 'translateX(-50%)',
          width: '50px', height: '50px',
          background: '#FF3B30', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', fontWeight: 800, color: '#fff',
          border: '3px solid #fff',
          zIndex: 10,
        }}>
          {remaining}
        </div>

        <h2 style={{
          fontFamily: "'Baloo Bhaijaan', sans-serif",
          fontSize: '36px', color: '#FF3B30', margin: '0 0 24px'
        }}>
          BẠN BỊ THA HÓA!
        </h2>

        <p style={{
          color: '#FFFFFF',
          fontSize: '18px',
          fontFamily: "'Roboto', sans-serif",
          lineHeight: '1.6',
          marginBottom: '32px',
          padding: '0 20px'
        }}>
          Hệ thống đã phát hiện sự bất thường. Bạn hiện đã thuộc về phe gián điệp. 
          Hãy quan sát các từ khóa mới ở thanh trạng thái phía dưới.
        </p>

        <button
          onClick={onDone}
          style={{
            marginTop: '32px',
            padding: '12px 60px',
            borderRadius: '30px',
            fontSize: '20px',
            fontWeight: 700,
            background: '#FF3B30',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,59,48,0.3)',
          }}
        >
          TIẾP TỤC
        </button>
      </div>
    </div>
  );
};

export default CorruptedNotifyView;
