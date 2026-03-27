// =============================================
// ManipulationView.tsx
// Màn hình hỏi người chơi có muốn sử dụng AI hay không
// =============================================

import React from 'react';

interface Props {
  onChoice: (choice: 'CHATBOT' | 'MANUAL') => void;
}

const ManipulationView: React.FC<Props> = ({ onChoice }) => {
  return (
    <div className="rf-prompt-overlay">
      <div className="rf-prompt-box" style={{ width: '800px', background: 'rgba(167, 114, 83, 0.9)', borderRadius: '30px', padding: '50px' }}>
        <h2 className="rf-prompt-title" style={{ fontSize: '40px', marginBottom: '40px', color: '#800000', fontWeight: 'bold' }}>
          BẠN CÓ MUỐN SỬ DỤNG KỸ NĂNG THAO TÚNG KHÔNG?
        </h2>
        
        <div className="rf-prompt-actions" style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
          <button 
            className="rf-btn" 
            style={{ 
              minWidth: '250px', height: '80px', borderRadius: '40px', fontSize: '28px', 
              background: '#D4956A', color: 'white', border: 'none', fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)', cursor: 'pointer'
            }}
            onClick={() => onChoice('CHATBOT')}
          >
            CÓ
          </button>
          <button 
            className="rf-btn" 
            style={{ 
              minWidth: '250px', height: '80px', borderRadius: '40px', fontSize: '28px', 
              background: '#5D4037', color: 'white', border: 'none', fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)', cursor: 'pointer'
            }}
            onClick={() => onChoice('MANUAL')}
          >
            KHÔNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManipulationView;