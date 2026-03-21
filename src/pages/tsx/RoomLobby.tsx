import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import axiosInstance from '../../api/axiosInstance';
import { useWebSocket } from '../../hooks/useWebSocket';
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
  user_id: number;
  display_name: string;
  avatar_url?: string;
  isMe?: boolean;
  isHost?: boolean;
  isReady?: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  color: string;
}

const avatarMap: { [key: number]: string } = {
  0: avatar1,
  1: avatar2,
  2: avatar3,
  3: avatar4,
  4: avatar5,
  5: avatar6,
};

const RoomLobby: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { connect, disconnect, subscribe, sendMessage, connected } = useWebSocket();
  
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRoomDetail();
    connect(() => {
      // Subscriptions will be handled when connected changes
    });
    return () => disconnect();
  }, [roomId]);

  useEffect(() => {
    if (connected && roomId) {
      // Subscribe to room updates
      subscribe(`/topic/room/${roomId}`, (update: any) => {
        if (update.type === 'PLAYER_JOIN' || update.type === 'PLAYER_LEAVE' || update.type === 'ROOM_UPDATE') {
          fetchRoomDetail();
        } else if (update.type === 'CHAT') {
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: update.sender,
            text: update.content,
            color: update.sender === user?.display_name ? '#FFCC00' : '#FFD700'
          }]);
        } else if (update.type === 'GAME_START') {
          navigate(`/game/${roomId}/round1`);
        }
      });

      // Subscribe to private role information
      subscribe(`/user/queue/role`, (roleInfo: any) => {
        console.log('Private Role Info:', roleInfo);
        // Store this in a game state or context
      });

      // Subscribe to role check result
      subscribe(`/user/queue/role-check-result`, (result: any) => {
        console.log('Role Check Result:', result);
      });

      // Subscribe to infection
      subscribe(`/user/queue/infection`, (infectionInfo: any) => {
        console.log('Infection Info:', infectionInfo);
      });
    }
  }, [connected, roomId, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchRoomDetail = async () => {
    try {
      const response = await axiosInstance.get(`/rooms/${roomId}`);
      setRoomInfo(response.data);
      setPlayers(response.data.players || []);
    } catch (error) {
      console.error('Lỗi khi tải thông tin phòng:', error);
      alert('Không thể tải thông tin phòng.');
      navigate('/lobby');
    }
  };

  const handleStartGame = () => {
    if (roomInfo?.host_id === user?.user_id) {
      sendMessage(`/app/room/${roomId}/start`, {});
    } else {
      // Logic for ready status if implemented in BE
      // sendMessage(`/app/room/${roomId}/ready`, { ready: true });
      alert('Chỉ chủ phòng mới có thể bắt đầu game!');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await axiosInstance.post(`/rooms/${roomId}/leave`);
      navigate('/lobby');
    } catch (error) {
      console.error('Lỗi khi rời phòng:', error);
      navigate('/lobby');
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    sendMessage(`/app/room/${roomId}/chat`, { content: inputMessage });
    setInputMessage('');
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
        <span className="room-code-text">Mã: {roomInfo?.room_code || '...'}</span>
      </div>

      {/* ─── PLAYERS CIRCLE ─── */}
      <div className="players-container-new">
        {Array.from({ length: 6 }).map((_, index) => {
          const player = players[index];
          return (
            <div key={index} className={`player-avatar-slot pos-${index}`}>
              <div className="player-avatar-circle">
                {player ? (
                  player.avatar_url ? (
                    <img src={player.avatar_url} alt={player.display_name} className="player-avatar-img" />
                  ) : (
                    <img src={avatarMap[index % 6]} alt={player.display_name} className="player-avatar-img" />
                  )
                ) : (
                  <div className="avatar-placeholder-new">
                    <i className="fa-solid fa-user" style={{ color: 'rgba(255,255,255,0.2)' }}></i>
                  </div>
                )}
              </div>
              {player && (
                <span className="player-name-new">
                  {player.user_id === user?.user_id ? 'Tôi' : player.display_name}
                  {player.user_id === roomInfo?.host_id && ' 👑'}
                </span>
              )}
            </div>
          );
        })}

        {/* ─── CENTER READY BUTTON ─── */}
        <button 
          className="center-ready-btn" 
          onClick={handleStartGame}
          disabled={roomInfo?.host_id !== user?.user_id && players.length < 3}
        >
          {roomInfo?.host_id === user?.user_id ? 'Bắt đầu' : 'Chờ...'}
        </button>
      </div>

      {/* ─── BOTTOM LEFT CHAT ─── */}
      <div className="room-lobby-chat-new">
        <div className="chat-messages-new">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className="chat-msg-new">
              <span className="msg-sender" style={{ color: msg.color }}>{msg.sender}:</span>
              <span className="msg-text">{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-container-new">
          <input 
            type="text" 
            placeholder="Nhập tin nhắn..." 
            className="chat-input-new"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button className="chat-send-btn-new" onClick={handleSendMessage}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;
