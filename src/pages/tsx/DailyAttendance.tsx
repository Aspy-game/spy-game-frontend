import React from 'react';
import '../css/attendance.css';

interface AttendanceProps {
  onClose: () => void;
  isReceived: boolean;
  streak: number; // Ngày hiện tại trong chuỗi (1-7)
  onReceive: (amount: number, event: React.MouseEvent) => void;
}

const DailyAttendance: React.FC<AttendanceProps> = ({ onClose, isReceived, streak, onReceive }) => {
  const rewards = [
    { day: 1, amount: '10 xu', value: 10 },
    { day: 2, amount: '10 xu', value: 10 },
    { day: 3, amount: '10 xu', value: 10 },
    { day: 4, amount: '10 xu', value: 10 },
    { day: 5, amount: '20 xu', value: 20 },
    { day: 6, amount: '20 xu', value: 20 },
    { day: 7, amount: '30 xu', value: 30 },
  ];

  const currentDayIndex = (streak > 0 && streak <= 7) ? streak - 1 : 0;

  const handleReceive = (e: React.MouseEvent) => {
    onReceive(rewards[currentDayIndex].value, e);
  };

  return (
    <div className="attendance-panel">
      <button className="attendance-close" onClick={onClose}>
        <i className="fa-solid fa-xmark"></i>
      </button>

      <h2 className="attendance-title">ĐIỂM DANH HÀNG NGÀY</h2>

      <div className="attendance-grid">
        {rewards.map((reward, index) => {
          // Một ô được coi là 'đã nhận' nếu:
          // 1. Chỉ số ngày (index + 1) nhỏ hơn streak hiện tại
          // 2. Chỉ số ngày bằng streak hiện tại VÀ isReceived là true
          const dayReceived = (index + 1 < streak) || (index + 1 === streak && isReceived);
          const isCurrentDay = index + 1 === streak;

          return (
            <div key={index} className={`attendance-item ${dayReceived ? 'received' : ''} ${isCurrentDay && !isReceived ? 'current' : ''}`}>
              <div className="reward-icon">
                <i className="fa-solid fa-coins"></i>
              </div>
              <span className="reward-day">Ngày {reward.day}</span>
              <span className="reward-amount">{reward.amount}</span>
            </div>
          );
        })}
      </div>

      <button 
        className={`attendance-receive-btn ${isReceived ? 'received' : ''}`} 
        onClick={handleReceive}
        disabled={isReceived}
      >
        {isReceived ? 'Đã nhận' : 'Nhận'}
      </button>
    </div>
  );
};

export default DailyAttendance;
