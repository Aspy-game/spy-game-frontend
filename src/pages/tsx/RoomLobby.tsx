import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import axiosInstance from '../../api/axiosInstance';
import { gameService } from '../../services/gameService';
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
import { gameApi } from '../../api/gameApi';

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
  const setUser = useAuthStore(state => state.setUser);

  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRoomDetail();
    fetchUserProfile(); // Lấy số dư mới nhất
    connect(() => {
      // Send addUser when connected
      if (roomId) {
        sendMessage(`/app/game.addUser/${roomId}`, {});
      }
    });
    return () => disconnect();
  }, [roomId]);

  useEffect(() => {
    if (connected && roomId) {
      console.log(`[WS-SUBSCRIBE]: Subscribing to /topic/room/${roomId}`);
      // Subscribe to room updates
      subscribe(`/topic/room/${roomId}`, (update: any) => {
        console.log('[WS-EVENT]: Received update:', update);
        const type = update.type || update.status; // Support both naming conventions

        if (['PLAYER_JOIN', 'PLAYER_LEAVE', 'ROOM_UPDATE', 'JOIN', 'waiting'].includes(type)) {
          fetchRoomDetail();
        } else if (type === 'SPECIAL_ROUND_ENABLED') {
          setRoomInfo((prev: any) => ({ ...prev, is_special_round: true }));
          alert('Trưởng phòng đã kích hoạt Vòng chơi Đặc biệt! Bạn sẽ nhận được mô tả thay vì từ khóa.');
        } else if (type === 'PLAYER_KICKED') {
          if (update.target_user_id === user?.user_id) {
            alert('Bạn đã bị mời ra khỏi phòng!');
            navigate('/lobby');
          } else {
            fetchRoomDetail();
          }
        } else if (type === 'CHAT' || update.content) {
          // If it has content and sender, it's likely a chat message even if type is missing
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: update.sender || 'Hệ thống',
            text: update.content || update.text || '',
            color: update.sender === user?.display_name ? '#FFCC00' : '#FFD700'
          }]);
        } else if (type === 'GAME_START' || type === 'started') {
          const matchId = update.matchId || update.match_id || update.match_ID;
          if (matchId) {
            console.log('[WS-NAVIGATE]: Moving to game with matchId:', matchId);
            navigate(`/game/${matchId}`);
          } else {
            console.error('[WS-ERROR]: GAME_START received but match_id is missing!');
          }
        }
      });

      // Subscribe to private role information
      subscribe(`/user/queue/role`, (roleInfo: any) => {
        console.log('Private Role Info:', roleInfo);
        // Store this in a game state or context
      });

      // Subscribe to room-specific events (e.g., being kicked)
      subscribe(`/user/queue/room-events`, (event: any) => {
        console.log('[WS-EVENT]: Received room-event:', event);
        if (event.type === 'KICKED') {
          alert('Bạn đã bị mời ra khỏi phòng!');
          navigate('/lobby');
        }
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

  const fetchUserProfile = async () => {
    try {
      const [profileRes, invRes] = await Promise.all([
        axiosInstance.get('/auth/me'),
        gameApi.getInventory()
      ]);
      if (profileRes.data) {
        setUser({ ...profileRes.data, inventory: invRes.data });
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
    }
  };

  const handleStartGame = async () => {
    if (isHost) {
      if (players.length < 3) {
        alert('Cần ít nhất 3 người chơi để bắt đầu game!');
        return;
      }
      try {
        const response = await axiosInstance.post(`/rooms/${roomId}/start`);
        const { match_id } = response.data;
        console.log('Game started with match_id:', match_id);
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Không thể bắt đầu trò chơi.';
        if (errorMsg.toLowerCase().includes('balance')) {
          alert(`Số dư không đủ! \n\n${errorMsg}\n\n(Admin có thể sử dụng Menu Admin > Tặng Xu để nạp thêm)`);
        } else {
          alert(errorMsg);
        }
      }
    } else {
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

  const handleTransferHost = async (targetUserId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn nhường quyền Trưởng phòng?')) {
      try {
        await axiosInstance.post(`/rooms/${roomId}/transfer-host`, { user_id: targetUserId });
      } catch (error: any) {
        alert(error.response?.data?.error || 'Lỗi khi nhường quyền Trưởng phòng.');
      }
    }
  };

  const handleSetSpy = async (targetUserId: number, targetName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn chọn ${targetName} làm Gián điệp?`)) {
      try {
        await gameService.setSpy(roomId!, String(targetUserId));
        alert(`Đã chọn ${targetName} làm Gián điệp!`);
        fetchRoomDetail();
      } catch (error: any) {
        alert(error.response?.data?.error || error.response?.data?.message || 'Lỗi khi chọn Gián điệp.');
      }
    }
  };

  const handleKickPlayer = async (targetUserId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn mời người chơi này ra khỏi phòng?')) {
      try {
        await axiosInstance.post(`/rooms/${roomId}/kick`, { user_id: targetUserId });
      } catch (error: any) {
        alert(error.response?.data?.error || 'Lỗi khi mời người chơi ra khỏi phòng.');
      }
    }
  };

  const handleUseSpecialRound = async () => {
    if (!window.confirm('Bạn có muốn kích hoạt Vòng chơi Đặc biệt cho trận này? (Tiêu tốn 1 kỹ năng trong kho đồ)')) return;
    try {
      await gameApi.useSpecialRound(roomId!);
      // WS will update
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi kích hoạt vòng đặc biệt.');
    }
  };

  const hasSpecialRoundSkill = user?.inventory && user.inventory['SPECIAL_ROUND'] > 0;

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    sendMessage(`/app/game.sendMessage/${roomId}`, { content: inputMessage, sender: user?.display_name });
    setInputMessage('');
  };

  const isHost = String(roomInfo?.host_id) === String(user?.user_id);

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
      <div className="room-top-right-group">
        {user?.balance !== undefined && (
          <div className="user-balance-box">
            <i className="fa-solid fa-coins"></i>
            <span>{user.balance}</span>
          </div>
        )}
        <div className="room-code-box-new">
          <span className="room-code-text">Mã: {roomInfo?.room_code || '...'}</span>
        </div>
      </div>

      {/* ─── PLAYERS CIRCLE ─── */}
      <div className="players-container-new">
        {Array.from({ length: 6 }).map((_, index) => {
          const player = players[index];
          return (
            <div key={index} className={`player-avatar-slot pos-${index}`}>
              <div
                className="player-avatar-circle"
                onClick={() => {
                  if (isHost && player) {
                    setSelectedPlayerId(prev => prev === player.user_id ? null : player.user_id);
                  }
                }}
                style={{ cursor: isHost && player ? 'pointer' : 'default' }}
              >
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
                <div className="player-info-container">
                  <span className="player-name-new">
                    {String(player.user_id) === String(user?.user_id) ? 'Tôi' : player.display_name}
                    {String(player.user_id) === String(roomInfo?.host_id) && ' 👑'}
                  </span>

                  {/* Host Actions: Chỉ hiển thị cho Host */}
                  {isHost && selectedPlayerId === player.user_id && (
                    <div className="host-actions-overlay always-visible-host">
                      <button
                        className="host-action-btn spy-select"
                        onClick={(e) => { e.stopPropagation(); handleSetSpy(player.user_id, player.display_name); setSelectedPlayerId(null); }}
                        title="Chọn làm Gián điệp (Host only)"
                      >
                        <i className="fa-solid fa-mask"></i>
                      </button>

                      {/* Các nút Kick và Transfer chỉ hiện cho người chơi KHÁC */}
                      {String(player.user_id) !== String(user?.user_id) && (
                        <>
                          <button
                            className="host-action-btn kick"
                            onClick={(e) => { e.stopPropagation(); handleKickPlayer(player.user_id); setSelectedPlayerId(null); }}
                            title="Kick người chơi"
                          >
                            <i className="fa-solid fa-user-minus"></i>
                          </button>
                          <button
                            className="host-action-btn transfer"
                            onClick={(e) => { e.stopPropagation(); handleTransferHost(player.user_id); setSelectedPlayerId(null); }}
                            title="Nhường quyền trưởng phòng"
                          >
                            <i className="fa-solid fa-crown"></i>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ─── CENTER READY BUTTON ─── */}
        <div className="lobby-center-actions">
          {isHost && hasSpecialRoundSkill && !roomInfo?.is_special_round && (
            <button className="lobby-skill-btn special-round-btn animate-pop-in" onClick={handleUseSpecialRound}>
              <i className="fa-solid fa-star"></i> VÒNG ĐẶC BIỆT ({user?.inventory?.['SPECIAL_ROUND']})
            </button>
          )}
          {roomInfo?.is_special_round && (
            <div className="special-round-indicator animate-pop-in">
              <i className="fa-solid fa-circle-check"></i> ĐÃ BẬT VÒNG ĐẶC BIỆT
            </div>
          )}
          <button
            className="center-ready-btn"
            onClick={handleStartGame}
            disabled={roomInfo?.host_id !== user?.user_id && players.length < 3}
          >
            {roomInfo?.host_id === user?.user_id ? 'Bắt đầu' : 'Chờ...'}
          </button>
        </div>
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
