import React from 'react';
import '../css/attendance.css';

interface AttendanceProps {
  onClose: () => void;
  isReceived: boolean;
  onReceive: () => void;
}

const DailyAttendance: React.FC<AttendanceProps> = ({ onClose, isReceived, onReceive }) => {
  const rewards = [
    { day: 1, amount: '10 xu' },
    { day: 2, amount: '10 xu' },
    { day: 3, amount: '10 xu' },
    { day: 4, amount: '10 xu' },
    { day: 5, amount: '20 xu' },
    { day: 6, amount: '20 xu' },
    { day: 7, amount: '30 xu' },
  ];

  return (
    <div className="attendance-panel">
      <button className="attendance-close" onClick={onClose}>
        <i className="fa-solid fa-xmark"></i>
      </button>

      <h2 className="attendance-title">ĐIỂM DANH HÀNG NGÀY</h2>

      <div className="attendance-grid">
        {rewards.map((reward, index) => (
          <div key={index} className={`attendance-item ${isReceived && index === 0 ? 'received' : ''}`}>
            <div className="reward-icon">
              <i className="fa-solid fa-coins"></i>
            </div>
            <span className="reward-amount">{reward.amount}</span>
          </div>
        ))}
      </div>

      <button 
        className={`attendance-receive-btn ${isReceived ? 'received' : ''}`} 
        onClick={onReceive}
        disabled={isReceived}
      >
        {isReceived ? 'Đã nhận' : 'Nhận'}
      </button>
    </div>
  );
};

export default DailyAttendance;
