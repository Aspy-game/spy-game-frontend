// =============================================
// WaitingView.tsx
// Màn chờ — hiển thị text lớn ở giữa màn hình,
// render trực tiếp lên nền game (không có overlay tối).
// Dùng cho: "Vòng 2", "Vòng 2 sắp bắt đầu!", v.v.
// =============================================

import React from 'react';

interface Props {
  text: string;
  subText?: string;
}

const WaitingView: React.FC<Props> = ({ text, subText }) => {
  return (
    <div className="rf-waiting-wrap">
      <div className="rf-waiting-banner">
        <span className="rf-waiting-text">{text}</span>
        {subText && <p className="rf-waiting-subtext">{subText}</p>}
      </div>
    </div>
  );
};

export default WaitingView;