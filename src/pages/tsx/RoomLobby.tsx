import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import bg from '../../../img/Gemini_Generated_Image_fkpdh6fkpdh6fkpd.png';

// Import Avatars
import avatar1 from '../../../img/Gemini_Generated_Image_mz01hgmz01hgmz01.png';
import avatar2 from '../../../img/Gemini_Generated_Image_olvekholvekholve.png';
import avatar3 from '../../../img/Gemini_Generated_Image_v515kev515kev515.png';
import avatar4 from '../../../img/Gemini_Generated_Image_jhisy6jhisy6jhis.png';
import avatar5 from '../../../img/Gemini_Generated_Image_8nnqwq8nnqwq8nnq.png';
import avatar6 from '../../../img/Gemini_Generated_Image_59nsf059nsf059ns.png';

import '../../pages/css/room-lobby.css';

interface Player {
  id: number;
  displayName: string;
  avatarUrl?: string;
  isMe: boolean;
  isHost: boolean;
  isReady: boolean;
}

const RoomLobby: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [players, setPlayers] = useState<Player[]>([
    { id: user?.user_id || 1, displayName: user?.display_name || 'Cáo', isMe: true, isHost: true, isReady: true, avatarUrl: avatar1 },
    { id: 2, displayName: 'Cú', isMe: false, isHost: false, isReady: false, avatarUrl: avatar2 },
    { id: 3, displayName: 'Mèo', isMe: false, isHost: false, isReady: false, avatarUrl: avatar3 },
    { id: 4, displayName: 'Chó', isMe: false, isHost: false, isReady: false, avatarUrl: avatar4 },
    { id: 5, displayName: 'Gấu', isMe: false, isHost: false, isReady: false, avatarUrl: avatar5 },
    { id: 6, displayName: 'Boy', isMe: false, isHost: false, isReady: false, avatarUrl: avatar6 },
  ]);

  const [chatMessages] = useState([
    { id: 1, sender: 'Cú', text: 'helu mấy cưng', color: '#FF0000' },
    { id: 2, sender: 'Tôi', text: '', color: '#FFCC00' },
    { id: 3, sender: 'Chó', text: '', color: '#FFD700' },
    { id: 4, sender: 'Mèo', text: '', color: '#00FF00' },
  ]);

  const handleStartGame = () => {
    navigate(`/game/${roomId}/round1`);
  };

  const handleLeaveRoom = () => {
    navigate('/lobby');
  };

  return (
    <div 
      className="room-lobby-container-new"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center'
      }}
    >
      {/* ─── TOP LEFT BACK ─── */}
      <button className="room-lobby-back-btn" onClick={handleLeaveRoom}>
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      {/* ─── TOP RIGHT ROOM CODE ─── */}
      <div className="room-code-box-new">
        <span className="room-code-text">Phòng: {roomId}</span>
      </div>

      {/* ─── PLAYERS CIRCLE ─── */}
      <div className="players-container-new">
        {players.map((player, index) => (
          <div key={index} className={`player-avatar-slot pos-${index}`}>
            <div className="player-avatar-circle">
              {player.avatarUrl ? (
                <img src={player.avatarUrl} alt={player.displayName} className="player-avatar-img" />
              ) : (
                <div className="avatar-placeholder-new">
                  {player.displayName === 'Cáo' || player.isMe ? '🦊' : 
                   player.displayName === 'Cú' ? '🦉' :
                   player.displayName === 'Mèo' ? '🐱' :
                   player.displayName === 'Chó' ? '🐶' :
                   player.displayName === 'Gấu' ? '🐻' : '👦'}
                </div>
              )}
            </div>
            {player.isMe && <span className="player-name-new">Tôi</span>}
          </div>
        ))}

        {/* ─── CENTER READY BUTTON ─── */}
        <button className="center-ready-btn" onClick={handleStartGame}>
          Sẵn sàng
        </button>
      </div>

      {/* ─── BOTTOM LEFT CHAT ─── */}
      <div className="room-lobby-chat-new">
        <div className="chat-messages-new">
          {chatMessages.map((msg) => (
            <div key={msg.id} className="chat-msg-new">
              <span className="msg-sender" style={{ color: msg.color }}>{msg.sender}:</span>
              <span className="msg-text">{msg.text}</span>
            </div>
          ))}
        </div>
        <div className="chat-input-container-new">
          <input type="text" placeholder="" className="chat-input-new" />
          <button className="chat-send-btn-new">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;
