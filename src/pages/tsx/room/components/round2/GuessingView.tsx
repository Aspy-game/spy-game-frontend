// components/round2/GuessingView.tsx
import React from 'react';

interface Props {
  onSubmit: (role: 'SPY' | 'CIVILIAN') => void;
}

const GuessingView: React.FC<Props> = ({ onSubmit }) => {
  return (
    <div className="rf-prompt-overlay">
      <div className="rf-prompt-box" style={{ width: '900px', background: 'rgba(167, 114, 83, 0.85)', borderRadius: '30px', padding: '60px 40px' }}>
        <h2 className="rf-prompt-title" style={{ fontSize: '48px', marginBottom: '60px', color: '#800000', fontWeight: 'bold' }}>Bạn nghĩ vai trò của bạn là gì?</h2>
        
        <div className="rf-prompt-actions" style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
          <button 
            className="rf-btn" 
            style={{ 
              minWidth: '300px', height: '100px', borderRadius: '50px', fontSize: '36px', 
              background: '#D4956A', color: 'white', border: 'none', fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)', cursor: 'pointer'
            }}
            onClick={() => onSubmit('SPY')}
          >
            Gián điệp
          </button>
          <button 
            className="rf-btn" 
            style={{ 
              minWidth: '300px', height: '100px', borderRadius: '50px', fontSize: '36px', 
              background: '#D4956A', color: 'white', border: 'none', fontWeight: 'bold',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)', cursor: 'pointer'
            }}
            onClick={() => onSubmit('CIVILIAN')}
          >
            Thường dân
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessingView;
