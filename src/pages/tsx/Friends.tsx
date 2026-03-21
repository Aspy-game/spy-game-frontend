import React, { useState } from 'react';
import '../css/friends.css';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

interface Suggestion {
  id: string;
  name: string;
  avatar: string;
}

interface FriendsProps {
  onClose: () => void;
}

const Friends: React.FC<FriendsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'suggestions'>('friends');

  const friends: Friend[] = [
    { id: '1', name: 'Nguyễn Văn A', avatar: '', status: 'online' },
    { id: '2', name: 'Trần Thị B', avatar: '', status: 'offline' },
    { id: '3', name: 'Lê Văn C', avatar: '', status: 'online' },
    { id: '4', name: 'Phạm Thị D', avatar: '', status: 'online' },
  ];

  const suggestions: Suggestion[] = [
    { id: '5', name: 'Hoàng Văn E', avatar: '' },
    { id: '6', name: 'Đặng Thị F', avatar: '' },
    { id: '7', name: 'Bùi Văn G', avatar: '' },
  ];

  return (
    <div className="friends-overlay" onClick={onClose}>
      <div className="friends-modal" onClick={(e) => e.stopPropagation()}>
        <button className="friends-close-btn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="friends-tabs">
          <div 
            className={`friends-tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            BẠN BÈ
          </div>
          <div 
            className={`friends-tab ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            GỢI Ý
          </div>
        </div>

        <div className="friends-content">
          {activeTab === 'friends' ? (
            <div className="friends-list">
              {friends.map((friend) => (
                <div key={friend.id} className="friend-item">
                  <div className="friend-avatar">
                    <div className={`status-dot ${friend.status}`}></div>
                  </div>
                  <span className="friend-name">{friend.name}</span>
                  <button className="friend-action-btn invite">
                    Mời
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="friends-list">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="friend-item">
                  <div className="friend-avatar"></div>
                  <span className="friend-name">{suggestion.name}</span>
                  <button className="friend-action-btn add">
                    Kết bạn
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
