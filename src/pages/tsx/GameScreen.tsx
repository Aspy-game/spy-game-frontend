import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { gameApi } from '../../api/gameApi';
import axiosInstance from '../../api/axiosInstance';
import { useWebSocket } from '../../hooks/useWebSocket';
import bg from '../../../img/Gemini_Generated_Image_fkpdh6fkpdh6fkpd.png';
import '../css/game-screen.css';

// Import Avatars
import avatar1 from '../../../img/Gemini_Generated_Image_mz01hgmz01hgmz01.png';
import avatar2 from '../../../img/Gemini_Generated_Image_olvekholvekholve.png';
import avatar3 from '../../../img/hinhcao.jpg';
import avatar4 from '../../../img/Gemini_Generated_Image_jhisy6jhisy6jhis.png';
import avatar5 from '../../../img/Gemini_Generated_Image_8nnqwq8nnqwq8nnq.png';
import avatar6 from '../../../img/Gemini_Generated_Image_59nsf059nsf059ns.png';
import avatar7 from '../../../img/chon.jpg';
import avatar8 from '../../../img/soi.jpg';

const avatarMap: { [key: number]: string } = {
  0: avatar1,
  1: avatar2,
  2: avatar3,
  3: avatar4,
  4: avatar5,
  5: avatar6,
  6: avatar7,
  7: avatar8,
};

// Helper for color mapping in anonymous mode
const getPlayerColor = (displayName: string, colorCode?: string) => {
  const color = (colorCode || "").toLowerCase();
  const colors: { [key: string]: string } = {
    red: '#FF4136',
    blue: '#0074D9',
    green: '#2ECC40',
    yellow: '#FFDC00',
    purple: '#B10DC9',
    orange: '#FF851B',
    pink: '#F012BE',
    cyan: '#7FDBFF',
    brown: '#85144b',
    gray: '#AAAAAA',
    white: '#FFFFFF',
    black: '#111111'
  };

  if (colors[color]) return colors[color];

  // Fallback for name parsing if colorCode is missing
  const nameToColor: { [key: string]: string } = {
    'mèo béo': 'red', 'cún con': 'blue', 'gấu trúc': 'green', 'vịt vàng': 'yellow',
    'cáo nhỏ': 'purple', 'hổ con': 'orange', 'thỏ ngọc': 'pink', 'chim cánh cụt': 'cyan',
    'sóc chuột': 'brown', 'voi con': 'gray', 'ngựa vằn': 'white', 'cá heo': 'black'
  };

  const lowerName = displayName?.toLowerCase() || '';
  for (const [key, val] of Object.entries(nameToColor)) {
    if (lowerName.includes(key)) return colors[val];
  }

  // Legacy regex check
  const match = displayName?.match(/Người chơi (\w+)/i);
  if (match && colors[match[1].toLowerCase()]) return colors[match[1].toLowerCase()];

  return undefined;
};

const getPlayerAvatarByColor = (displayName: string, colorCode?: string) => {
  const color = (colorCode || "").toLowerCase();
  const colorToAvatar: { [key: string]: string } = {
    red: avatar1, blue: avatar2, green: avatar3, yellow: avatar4,
    purple: avatar5, orange: avatar6, pink: avatar7, cyan: avatar8,
    brown: avatar1, gray: avatar2, white: avatar3, black: avatar4
  };

  if (colorToAvatar[color]) return colorToAvatar[color];

  // Fallback animal name mapping
  const nameToColor: { [key: string]: string } = {
    'mèo béo': 'red', 'cún con': 'blue', 'gấu trúc': 'green', 'vịt vàng': 'yellow',
    'cáo nhỏ': 'purple', 'hổ con': 'orange', 'thỏ ngọc': 'pink', 'chim cánh cụt': 'cyan',
    'sóc chuột': 'brown', 'voi con': 'gray', 'ngựa vằn': 'white', 'cá heo': 'black'
  };

  const lowerName = displayName?.toLowerCase() || '';
  for (const [key, val] of Object.entries(nameToColor)) {
    if (lowerName.includes(key)) return colorToAvatar[val];
  }

  const match = displayName?.match(/Người chơi (\w+)/i);
  if (match) return colorToAvatar[match[1].toLowerCase()];

  return null;
};


const GameScreen: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { connect, disconnect, subscribe, connected } = useWebSocket();

  const [gameState, setGameState] = useState<any>(null);
  const gameStateRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phaseMessage, setPhaseMessage] = useState<string | null>(null);
  const [hasEnteredResultPhase, setHasEnteredResultPhase] = useState(false);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const prevPhaseRef = useRef<string | null>(null);

  // Sync ref with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Helper to parse backend date accurately
  const parseServerDate = (dateStr: string) => {
    if (!dateStr) return 0;
    // Xử lý chuỗi date có nanoseconds (9 chữ số sau dấu chấm) mà JS Date có thể không hiểu
    const sanitizedDate = dateStr.includes('.')
      ? dateStr.split('.')[0] + 'Z'
      : dateStr;
    return new Date(sanitizedDate).getTime();
  };

  const fetchState = async () => {
    if (!matchId) return;

    // Fetch inventory
    try {
      const invResponse = await gameApi.getInventory();
      setGameState((prev: any) => ({ ...prev, inventory: invResponse.data }));
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }

    // Stop fetching if game is already over
    const currentPhase = gameStateRef.current?.phase || gameStateRef.current?.status;
    if (currentPhase === 'GAME_OVER') {
      console.log('[FETCH-STATE]: Game already over, skipping fetch.');
      return;
    }

    try {
      const response = await gameApi.getGameState(matchId);
      console.log('[GET-GAME-STATE]:', response.data);
      const state = response.data;

      // Map your_keyword & your_description từ API
      state.keyword = state.your_keyword || state.yourKeyword || state.keyword;
      state.description = state.your_description || state.yourDescription || state.description;

      // Map your_role sang state.role nếu có
      state.role = state.your_role || state.yourRole || state.role;

      // Map is_special_round & is_anonymous_voting
      if (state.is_special_round !== undefined) {
        state.isSpecialRound = state.is_special_round;
      }
      if (state.is_anonymous_voting !== undefined) {
        state.isAnonymousVoting = state.is_anonymous_voting;
      }

      // Ưu tiên dùng remaining_seconds từ BE (Mới)
      if (state.remaining_seconds !== undefined) {
        state.timer = state.remaining_seconds;
      } else if (state.phase_end_at) {
        const endTime = parseServerDate(state.phase_end_at);
        const now = new Date().getTime();
        state.timer = Math.max(0, Math.floor((endTime - now) / 1000));
      }

      setGameState((prev: any) => {
        if (!prev) return state;
        const mergedState = { ...state };
        
        // Cần giữ lại các local state (như done_with_panel, acknowledged) 
        // để không bị bung modal ra lặp lại khi fetch đè state
        if (prev.personal_role_check_result) {
           mergedState.personal_role_check_result = {
             ...(state.personal_role_check_result || {}),
             ...prev.personal_role_check_result
           };
        }
        
        // Giữ lại messages nếu server ko trả về mảng chat
        if (!mergedState.messages && prev.messages) {
          mergedState.messages = prev.messages;
        }
        
        return mergedState;
      });
      setLoading(false);
    } catch (err: any) {
      console.error('Lỗi khi tải trạng thái game:', err);
      
      // Nếu đã có gameState rồi thì không hiển thị màn hình lỗi cứng
      if (gameStateRef.current) {
        console.warn('Sử dụng dữ liệu game hiện tại do lỗi fetch mới.');
        // Nếu lỗi 404 hoặc 403 sau khi ván đấu đã bắt đầu, có thể ván đấu đã kết thúc
        if (err.response?.status === 404 || err.response?.status === 403) {
          setGameState((prev: any) => prev ? { ...prev, phase: 'GAME_OVER' } : prev);
        }
        setLoading(false);
        return;
      }

      // Nếu lỗi 404/403 ở lần fetch đầu tiên, có thể do match đã kết thúc hoặc không tồn tại
      if (err.response?.status === 404 || err.response?.status === 403) {
        setError('Ván chơi đã kết thúc hoặc bạn không có quyền truy cập.');
      } else {
        setError(err.response?.data?.message || 'Không thể tải trạng thái game.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    connect();
    return () => disconnect();
  }, [matchId]);

  useEffect(() => {
    if (gameState) {
      console.log('[AFK-DEBUG] Current GameState:', gameState);
    }
  }, [gameState]);

  // Local timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prev: any) => {
        if (prev && prev.timer > 0) {
          return { ...prev, timer: prev.timer - 1 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync remaining_seconds when it updates from BE
  useEffect(() => {
    if (gameState?.remaining_seconds !== undefined) {
      setGameState((prev: any) => ({ ...prev, timer: gameState.remaining_seconds }));
    }
  }, [gameState?.remaining_seconds]);

  // Phase transition notifications
  useEffect(() => {
    const phase = gameState?.phase || gameState?.status;
    if (phase && phase !== prevPhaseRef.current) {
      // Đánh dấu nếu đã từng vào phase kết quả
      if (phase === 'ROLE_CHECK_RESULT') {
        setHasEnteredResultPhase(true);
        setFallbackTriggered(false); // Reset fallback flag for this phase
      }

      // Clear old round data when entering a new DESCRIBING phase
      if (phase === 'DESCRIBING') {
        setGameState((prev: any) => {
          if (!prev) return prev;
          const resetPlayers = prev.players.map((p: any) => ({ ...p, description: null }));
          // Chỉ clear kết quả đoán role nếu đây là vòng sau (không phải ngay sau khi đoán)
          // Hoặc đơn giản là không clear ở đây, để nó tự hết khi qua phase khác
          return { ...prev, players: resetPlayers, eliminated_result: null };
        });
      }

      let msg = '';
      switch (phase) {
        case 'ROLE_ASSIGN': msg = 'Bắt đầu: Xem vai trò & Từ khóa'; break;
        case 'DESCRIBING': msg = 'Bắt đầu: Vòng mô tả'; break;
        case 'DISCUSSING': msg = 'Bắt đầu: Vòng thảo luận'; break;
        case 'VOTING': msg = 'Bắt đầu: Vòng bỏ phiếu'; break;
        case 'VOTE_TIE': msg = 'Hòa phiếu! Không ai bị loại vòng này.'; break;
        case 'ROUND_RESULT': msg = 'Kết quả vòng chơi'; break;
        case 'ROLE_CHECK': msg = 'Vòng kiểm tra vai trò!'; break;
        case 'ROLE_CHECK_RESULT': msg = 'Kết quả kỹ năng!'; break;
        case 'GAME_OVER': msg = 'TRÒ CHƠI KẾT THÚC!'; break;
        default: msg = `Chuyển sang: ${phase}`;
      }

      setPhaseMessage(msg);
      const timeout = setTimeout(() => setPhaseMessage(null), 3000);
      prevPhaseRef.current = phase;
      return () => clearTimeout(timeout);
    }
  }, [gameState?.phase, gameState?.status]);

  useEffect(() => {
    if (connected && matchId) {
      console.log(`[WS-SUBSCRIBE]: match topic for ${matchId}`);

      // 1. Subscribe to match updates (Timer, Phase, Players)
      // Chỉ lắng nghe topic gốc, không lắng nghe sub-topics để tránh nhận dữ liệu rác (votes, chat)
      subscribe(`/topic/match/${matchId}`, (update: any) => {
        console.log('[WS-GAME-UPDATE]:', update);
        update.keyword = update.your_keyword || update.yourKeyword || update.keyword;
        update.description = update.your_description || update.yourDescription || update.description;
        update.role = update.your_role || update.yourRole || update.role;

        // Cập nhật is_special_round & is_anonymous_voting từ WS
        if (update.is_special_round !== undefined) update.isSpecialRound = update.is_special_round;
        if (update.is_anonymous_voting !== undefined) update.isAnonymousVoting = update.is_anonymous_voting;

        // Dùng remaining_seconds hoặc phase_end_at từ Server
        if (update.remaining_seconds !== undefined) {
          update.timer = update.remaining_seconds;
        } else if (update.phase_end_at) {
          const endTime = parseServerDate(update.phase_end_at);
          const now = new Date().getTime();
          update.timer = Math.max(0, Math.floor((endTime - now) / 1000));
        }

        setGameState((prev: any) => ({ ...prev, ...update }));
      });

      // 1b. Subscribe to Skill activation events
      subscribe(`/topic/match/${matchId}/skills`, (event: any) => {
        console.log('[WS-SKILL-EVENT]:', event);
        if (event.type === 'ANONYMOUS_VOTING_ENABLED') {
          setGameState((prev: any) => ({ ...prev, isAnonymousVoting: true }));
          setPhaseMessage('Kỹ năng Ẩn danh đã được kích hoạt!');
          setTimeout(() => setPhaseMessage(null), 3000);
        }
      });

      // 2. Subscribe to private role information
      subscribe(`/user/queue/role`, (roleInfo: any) => {
        console.log('[WS-PRIVATE-ROLE]:', roleInfo);
        // roleInfo structure: { role: 'SPY'|'CIVILIAN', keyword: '...', description: '...' }
        setGameState((prev: any) => ({
          ...prev,
          role: roleInfo.role || roleInfo.your_role || roleInfo.yourRole,
          keyword: roleInfo.keyword || roleInfo.your_keyword || roleInfo.yourKeyword,
          description: roleInfo.description || roleInfo.your_description || roleInfo.yourDescription
        }));
      });

      // 2.1 Subscribe to private role check result
      subscribe(`/user/queue/role-check-result`, (result: any) => {
        console.log('[WS-ROLE-CHECK-RESULT]:', result);
        // result structure: { correct: boolean, message: string, coins_gained: number, ability_available: string }
        setGameState((prev: any) => ({
          ...prev,
          personal_role_check_result: result
        }));
      });

      // 2.2 Subscribe to private infection/system messages
      subscribe(`/user/queue/private`, (msg: any) => {
        console.log('[WS-PRIVATE-MSG]:', msg);
        // msg could be { type: 'infection', message: string, new_role: 'SPY_ALLY', keyword: '...' }
        if (msg.type === 'infection') {
          alert(`THÔNG BÁO QUAN TRỌNG:\n${msg.message}`);
          setGameState((prev: any) => ({
            ...prev,
            role: msg.new_role || 'SPY_ALLY',
            keyword: msg.keyword || prev.keyword,
            is_infected: true
          }));
        } else if (msg.message) {
          alert(`Hệ thống: ${msg.message}`);
        }
      });

      // 2.2.1 Subscribe to infection specifically
      subscribe(`/user/queue/infection`, (msg: any) => {
        console.log('[WS-INFECTION]:', msg);
        // msg: { type: 'INFECTED', spy_keyword: '...', message: '...' }
        alert(`BẠN ĐÃ BỊ THA HÓA!\n\n${msg.message || 'Bạn hiện thuộc phe Gián điệp.'}`);
        setGameState((prev: any) => ({
          ...prev,
          role: 'infected',
          keyword: msg.spy_keyword || prev.keyword,
          is_infected: true
        }));
      });

      // 2.2.2 Subscribe to role check result
      const handleRoleResult = (result: any) => {
        console.log('[WS-ROLE-RESULT]:', result);
        // result: { type: "ROLE_CHECK_RESULT", correct: boolean, actual_role: string, reward_coins: boolean, abilities_available: [...] }
        setGameState((prev: any) => ({
          ...prev,
          role: result.actual_role || prev.role,
          personal_role_check_result: result,
          // Nếu bị tha hóa, cập nhật luôn trạng thái infected
          is_infected: result.actual_role === 'infected' || prev.is_infected
        }));
      };

      subscribe(`/user/queue/role-check-result`, handleRoleResult);
      subscribe(`/user/queue/role-result`, handleRoleResult);

      // 2.3 Subscribe to ability results
      subscribe(`/user/queue/ability-result`, (result: any) => {
        console.log('[WS-ABILITY-RESULT]:', result);
        // result structure: { success: boolean, message: string, coins_gained: number, type: 'fake_message'|'infection' }
        if (result.message) {
          alert(`Kỹ năng: ${result.message}`);
        }
        if (result.coins_gained) {
          setGameState((prev: any) => ({
            ...prev,
            personal_role_check_result: {
              ...(prev.personal_role_check_result || {}),
              coins_gained: (prev.personal_role_check_result?.coins_gained || 0) + result.coins_gained
            }
          }));
        }
      });

      // 3. Subscribe to chat
      subscribe(`/topic/match/${matchId}/chat`, (chatMsg: any) => {
        console.log('[WS-CHAT-UPDATE]:', chatMsg);
        setGameState((prev: any) => {
          if (!prev) return prev;
          // Tránh duplicate tin nhắn theo ID hoặc nội dung + sender nếu không có ID
          const isDuplicate = prev.messages?.some((m: any) => 
            (m.id && m.id === chatMsg.id) || 
            (m.content === chatMsg.content && m.sender_id === chatMsg.sender_id && Math.abs(m.timestamp - chatMsg.timestamp) < 1000)
          );
          if (isDuplicate) return prev;
          
          const newMessages = [...(prev.messages || []), chatMsg];
          return { ...prev, messages: newMessages };
        });
      });

      // 4. Subscribe to votes (Số lượng phiếu bầu thời gian thực)
      subscribe(`/topic/match/${matchId}/votes`, (voteUpdate: any) => {
        console.log('[WS-VOTES-UPDATE]:', voteUpdate);
        // Trong chế độ ẩn, FE chỉ nhận danh sách ai đã vote, không nhận số lượng cụ thể
        // voteUpdate structure: { user_id_1: true, user_id_2: true }
        setGameState((prev: any) => ({ ...prev, voteCounts: voteUpdate }));
      });

      // 5. Subscribe to descriptions (Danh sách mô tả từ khóa)
      subscribe(`/topic/match/${matchId}/descriptions`, (descUpdate: any) => {
        console.log('[WS-DESCRIPTIONS-UPDATE]:', descUpdate);

        // New structure: { descriptions: [{ user_id, content, ... }], all_submitted: boolean }
        if (descUpdate.descriptions && Array.isArray(descUpdate.descriptions)) {
          setGameState((prev: any) => {
            if (!prev) return prev;

            // Map descriptions to existing players
            const updatedPlayers = prev.players.map((p: any) => {
              const d = descUpdate.descriptions.find((item: any) => String(item.user_id) === String(p.user_id));
              return d ? { ...p, description: d.content } : p;
            });

            return {
              ...prev,
              players: updatedPlayers,
              all_submitted: descUpdate.all_submitted
            };
          });
        }
        // Fallback for old single update format
        else if (descUpdate.user_id && descUpdate.content) {
          setGameState((prev: any) => {
            if (!prev) return prev;
            const updatedPlayers = prev.players.map((p: any) =>
              String(p.user_id) === String(descUpdate.user_id) ? { ...p, description: descUpdate.content } : p
            );
            return { ...prev, players: updatedPlayers };
          });
        }
      });

      // 6. Subscribe to round result (Ai bị loại sau bỏ phiếu)
      subscribe(`/topic/match/${matchId}/round-result`, (result: any) => {
        console.log('[WS-ROUND-RESULT]:', result);
        // result có thể là { eliminated_display_name: '...', role: '...' }
        setGameState((prev: any) => ({ ...prev, eliminated_result: result }));
      });

      // 7. Subscribe to game over (Kết quả cuối cùng)
      subscribe(`/topic/match/${matchId}/game-over`, (finalResult: any) => {
        console.log('[WS-GAME-OVER]:', finalResult);
        // Map winner_role sang winner để đồng nhất logic
        const mappedWinner = finalResult.winner_role === 'civilians' ? 'CIVILIAN' : 'SPY';

        setGameState((prev: any) => ({
          ...prev,
          ...finalResult,
          phase: 'GAME_OVER', // Ép chuyển phase ngay lập tức
          winner: mappedWinner
        }));
      });
    }
  }, [connected, matchId]);

  // Tự động gọi lại state khi timer về 0 (để đồng bộ phase mới)
  useEffect(() => {
    const isEnd = gameState?.phase === 'GAME_OVER' || gameState?.status === 'GAME_OVER';
    if (gameState?.timer === 0 && !isEnd) {
      const timeout = setTimeout(fetchState, 500);
      return () => clearTimeout(timeout);
    }
  }, [gameState?.timer, gameState?.phase, gameState?.status]);

  const result = gameState?.personal_role_check_result;

  // Cơ chế Fallback cấp cao: Nếu đã vào phase kết quả mà chưa có data, chủ động gọi API
  useEffect(() => {
    // Chỉ kích hoạt fallback nếu đang ở phase ROLE_CHECK_RESULT hoặc đã từng vào mà chưa có result
    const phase = (gameState?.phase || gameState?.status || '').toUpperCase();
    const isInResultPhase = phase === 'ROLE_CHECK_RESULT' || phase === 'ROLE_RESULT';

    if ((isInResultPhase || hasEnteredResultPhase) && !result && !fallbackTriggered && matchId) {
      const timer = setTimeout(() => {
        console.log('[GameScreen] ROLE_CHECK_RESULT data missing, triggering global fallback...');
        fetchState();
        setFallbackTriggered(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasEnteredResultPhase, result, fallbackTriggered, matchId, gameState?.phase, gameState?.status]);

  if (loading) return <div className="game-loading">Đang tải ván chơi...</div>;
  if (error) return <div className="game-error">Lỗi: {error}</div>;
  if (!gameState) return <div className="game-error">Không tìm thấy ván chơi.</div>;

  const renderPhase = () => {
    const phase = (gameState.phase || gameState.status || '').toUpperCase();

    switch (phase) {
      case 'ROLE_ASSIGN':
        return <RoleAssignView gameState={gameState} user={user} />;
      case 'DESCRIBING':
        return (
          <DescribingView
            matchId={matchId!}
            gameState={gameState}
            user={user}
            isSpy={isSpy}
            selectedAbility={selectedAbility}
            onFakeMessageSubmit={handleFakeMessageSubmit}
          />
        );
      case 'DISCUSSING':
        return (
          <DiscussingView
            matchId={matchId!}
            gameState={gameState}
            user={user}
            isSpy={isSpy}
            selectedAbility={selectedAbility}
            onFakeMessageSubmit={handleFakeMessageSubmit}
          />
        );
      case 'VOTING':
        return <VotingView matchId={matchId!} gameState={gameState} user={user} />;
      case 'VOTE_TIE':
        return <RoundResultView gameState={gameState} user={user} />;
      case 'ROLE_CHECK':
        return (
          <>
            <PlayerCircle
              players={gameState.players}
              user={user}
              isSpy={isSpy}
              selectedAbility={selectedAbility}
              matchId={matchId!}
            />
            <RoleCheckView matchId={matchId!} gameState={gameState} user={user} />
          </>
        );
      case 'ROLE_CHECK_RESULT':
      case 'ROLE_RESULT':
        return (
          <PlayerCircle
            players={gameState.players}
            user={user}
            isSpy={isSpy}
            selectedAbility={selectedAbility}
            matchId={matchId!}
          />
        );
      case 'ROUND_RESULT':
        return <RoundResultView gameState={gameState} user={user} />;
      case 'GAME_OVER':
        return <GameOverView gameState={gameState} navigate={navigate} />;
      default:
        return <div className="phase-placeholder">Đang chờ: {phase}</div>;
    }
  };

  // Hiển thị Modal Result nếu:
  // 1. Đang ở phase kết quả và chưa xác nhận (tất cả mọi người)
  // HOẶC
  // 2. Đã qua phase kết quả NHƯNG là Spy (có kỹ năng) và chưa chọn xong kỹ năng
  const currentPhaseUpper = (gameState?.phase || gameState?.status || '').toUpperCase();
  const isInResultPhase = currentPhaseUpper === 'ROLE_CHECK_RESULT' || currentPhaseUpper === 'ROLE_RESULT';
  const hasAbilitiesToSelect = result?.abilities_available && result.abilities_available.length > 0;
  
  const showRoleResultModal = 
    (isInResultPhase && !result?.acknowledged) || 
    (hasEnteredResultPhase && !result?.acknowledged && hasAbilitiesToSelect);

  // Modal cho người bị Tha Hóa (Infected)
  const showInfectionModal = gameState?.role?.toLowerCase() === 'infected' && !gameState?.infected_acknowledged;

  const handleAcknowledgeInfection = () => {
    setGameState((prev: any) => ({ ...prev, infected_acknowledged: true }));
  };

  const handleFakeMessageSubmit = async (content: string) => {
    if (!matchId) return;
    try {
      await gameApi.useAbility(matchId, content);
      // Optional: Show success toast
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi gửi thao túng.');
      throw err;
    }
  };

  const isSpy = gameState?.role?.toLowerCase() === 'spy' || gameState?.role?.toLowerCase() === 'infected';
  const selectedAbility = gameState?.selected_ability || gameState?.personal_role_check_result?.confirmed_ability;

  const handleLeave = async () => {
    console.log('[AFK-DEBUG] handleLeave clicked');
    const isGameOver = gameState?.phase === 'GAME_OVER';
    if (!isGameOver) {
      const confirmed = window.confirm('Bạn có chắc muốn thoát ván đấu đang diễn ra? Bạn sẽ bị tính là AFK.');
      if (!confirmed) return;
    }

    try {
      if (gameState?.room_id) {
        const leaveUrl = `/rooms/${gameState.room_id}/leave`;
        console.log('[AFK-DEBUG] Calling leave API:', leaveUrl);
        await axiosInstance.post(leaveUrl);
      } else {
        console.warn('[AFK-DEBUG] Cannot leave room: room_id is missing in gameState', gameState);
      }
      navigate('/lobby');
    } catch (err) {
      console.error('Lỗi khi rời phòng:', err);
      navigate('/lobby'); // Vẫn chuyển hướng nếu lỗi
    }
  };

  return (
    <div
      className={`game-screen-container ${gameState?.role?.toLowerCase() === 'infected' ? 'infected-theme' : ''}`}
      style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="game-top-bar">
        <button className="room-lobby-back-btn" onClick={handleLeave}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
      </div>

      <div className="game-timer">
        <i className="fa-solid fa-clock"></i>
        <span>{gameState?.timer || 0}s</span>
      </div>

      <div className="game-match-info">Mã phòng: {gameState?.room_code || '...'}</div>

      {/* Pass common props to views if needed, or just let them access gameState */}
      {renderPhase()}

      {/* Role Result Modal: Phủ lên trên khi đã chuyển sang phase khác (ví dụ DESCRIBING) nhưng chưa chọn xong skill */}
      {showRoleResultModal && (
        <div className="role-result-modal-overlay">
          <RoleCheckResultView matchId={matchId!} gameState={gameState} user={user} setGameState={setGameState} isModal={true} />
        </div>
      )}

      {/* Infection Notification Modal */}
      {showInfectionModal && (
        <div className="infection-modal-overlay animate-pop-in">
          <div className="infection-modal-card">
            <div className="infection-icon">
              <i className="fa-solid fa-virus"></i>
            </div>
            <h2>BẠN ĐÃ BỊ THA HÓA!</h2>
            <p>Bạn hiện thuộc phe <strong>Gián điệp</strong>.</p>
            <p className="infection-hint">Hãy giúp Gián điệp chiến thắng bằng cách bảo vệ họ và đánh lạc hướng Dân thường!</p>
            <button className="infection-confirm-btn" onClick={handleAcknowledgeInfection}>TÔI ĐÃ HIỂU</button>
          </div>
        </div>
      )}

      {phaseMessage && (
        <div className="phase-notification-overlay animate-pop-in">
          <div className="phase-notification-card">
            {phaseMessage}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for ROLE_ASSIGN phase
const RoleAssignView: React.FC<{ gameState: any, user: any }> = ({ gameState, user }) => {
  const me = gameState.players?.find((p: any) => String(p.user_id) === String(user?.user_id));
  const keyword = me?.keyword || gameState.keyword || '???';
  const description = me?.description || gameState.description;
  const timer = gameState.timer || 0;
  const isInfected = me?.role?.toLowerCase() === 'infected' || gameState.role?.toLowerCase() === 'infected';
  const isSpecialRound = gameState.isSpecialRound;

  return (
    <div className={`role-assign-container ${isInfected ? 'infected' : ''}`}>
      <div className={`role-assign-card animate-pop-in ${isInfected ? 'infected' : ''} ${isSpecialRound ? 'special-round' : ''}`}>
        <h2 className="role-assign-title">
          {isInfected ? 'BẠN ĐÃ BỊ THA HÓA' : 'HÃY MÔ TẢ TỪ KHÓA'}
        </h2>

        <div className={`role-badge ${isInfected ? 'infected' : 'unknown'}`}>
          {isInfected ? 'PHE GIÁN ĐIỆP 🕵️‍♂️' : 'ĐANG GIẤU MẶT 🎭'}
        </div>

        <div className="keyword-section">
          {!isSpecialRound ? (
            <>
              <p className="keyword-label">Từ khóa của bạn là:</p>
              <div className="keyword-box">{keyword}</div>
            </>
          ) : description && (
            <div className="description-section animate-fade-in">
              <p className="description-label">Mô tả đặc biệt của bạn:</p>
              <div className="description-box">{description}</div>
            </div>
          )}
        </div>

        <p className="role-assign-hint">
          {isSpecialRound 
            ? 'Bạn đang trong vòng đặc biệt. Hãy sử dụng mô tả trên để diễn đạt khéo léo!'
            : isInfected
              ? 'Bạn hiện thuộc phe Gián điệp. Hãy giúp Gián điệp chiến thắng!'
              : 'Hãy mô tả từ khóa của bạn khéo léo. Vai trò thực sự sẽ được tiết lộ sau!'}
        </p>

        <div className="timer-section">
          Bắt đầu sau <span className="timer-count">{timer}</span> giây...
        </div>
      </div>
    </div>
  );
};

// Sub-component for DESCRIBING phase
const DescribingView: React.FC<{
  matchId: string,
  gameState: any,
  user: any,
  isSpy?: boolean,
  selectedAbility?: string,
  onFakeMessageSubmit?: (content: string) => Promise<void>
}> = ({ matchId, gameState, user, isSpy, selectedAbility, onFakeMessageSubmit }) => {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find me and my current status
  const me = gameState.players?.find((p: any) => String(p.user_id) === String(user?.user_id));
  const hasSubmitted = !!me?.description;
  const isAlive = me?.is_alive !== false;

  // Robust turn check (handle string vs number comparison)
  const myTurn = gameState.current_turn_user_id && user?.user_id &&
    String(gameState.current_turn_user_id) === String(user.user_id);

  const currentTurnPlayer = gameState.players?.find((p: any) =>
    String(p.user_id) === String(gameState.current_turn_user_id)
  );
  const isAiTurn = currentTurnPlayer && String(currentTurnPlayer.user_id).startsWith('ai_');

  const handleSubmit = async () => {
    // Removed !myTurn check as requested by user - can submit anytime in DESCRIBING phase
    if (!description.trim() || isSubmitting || hasSubmitted) return;
    try {
      setIsSubmitting(true);
      await gameApi.submitDescription(matchId, description);
      setDescription('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi gửi mô tả.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="describing-container">
      <div className={`my-keyword-badge animate-pop-in ${gameState.isSpecialRound ? 'special-round' : ''}`}>
        {!gameState.isSpecialRound ? (
          <div className="keyword-info">
            <i className="fa-solid fa-key"></i>
            <span>Từ khóa: </span>
            <span className="keyword-value">{gameState.keyword || '???'}</span>
          </div>
        ) : gameState.description && (
          <div className="special-description animate-fade-in">
            <i className="fa-solid fa-file-lines"></i>
            <span>Mô tả: </span>
            <span className="description-value">{gameState.description}</span>
          </div>
        )}
      </div>
      <PlayerCircle
        players={gameState.players}
        user={user}
        currentTurnId={gameState.current_turn_user_id}
        isSpy={isSpy}
        selectedAbility={selectedAbility}
        onFakeMessageSubmit={onFakeMessageSubmit}
        matchId={matchId}
        isAnonymousVoting={gameState.isAnonymousVoting}
      />

      {!isAlive ? (
        <div className="submitted-state">
          <p className="input-hint error">Bạn đã bị loại. Vui lòng theo dõi trận đấu.</p>
        </div>
      ) : !hasSubmitted ? (
        <div className="input-group">
          <input
            type="text"
            placeholder="Nhập mô tả của bạn (1-30 từ)..."
            value={description}
            autoFocus
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !description.trim()}
            className="btn-active"
          >
            {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-regular fa-paper-plane"></i>}
          </button>
        </div>
      ) : (
        <div className="submitted-state">
          <div className="my-description">
            <span className="label">Mô tả của bạn:</span>
            <p className="content">"{me?.description}"</p>
          </div>
          <p className="input-hint success">Đang chờ những người khác...</p>
        </div>
      )}
    </div>
  );
};

// Sub-component for DISCUSSING phase
const DiscussingView: React.FC<{
  matchId: string,
  gameState: any,
  user: any,
  isSpy?: boolean,
  selectedAbility?: string,
  onFakeMessageSubmit?: (content: string) => Promise<void>
}> = ({ matchId, gameState, user, isSpy, selectedAbility, onFakeMessageSubmit }) => {
  const [chat, setChat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const me = gameState.players?.find((p: any) => String(p.user_id) === String(user?.user_id));
  const isAlive = me?.is_alive !== false;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.messages]);

  const handleChat = async () => {
    if (!chat.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await gameApi.submitChat(matchId, chat);
      setChat('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi gửi chat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseAnonymousVote = async () => {
    if (!window.confirm('Bạn có muốn sử dụng kỹ năng Ẩn danh Bỏ phiếu? (Tiêu tốn 1 kỹ năng trong kho đồ)')) return;
    try {
      await gameApi.useAnonymousVote(matchId);
      // WS will update the state
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi sử dụng kỹ năng ẩn danh.');
    }
  };

  const hasAnonymousSkill = gameState.inventory && gameState.inventory['ANONYMOUS_VOTE'] > 0;

  return (
    <div className="discussing-container">
      <div className={`my-keyword-badge animate-pop-in ${gameState.isSpecialRound ? 'special-round' : ''}`}>
        <i className="fa-solid fa-key"></i>
        <span>{gameState.isSpecialRound ? 'Mô tả đặc biệt: ' : 'Từ khóa: '}</span>
        <span className="keyword-value">{gameState.keyword || '???'}</span>
      </div>
      <PlayerCircle
        players={gameState.players || []}
        user={user}
        isSpy={isSpy}
        selectedAbility={selectedAbility}
        onFakeMessageSubmit={onFakeMessageSubmit}
        matchId={matchId}
        isAnonymousVoting={gameState.isAnonymousVoting}
      />

      {isAlive && hasAnonymousSkill && !gameState.isAnonymousVoting && (
        <button className="use-skill-btn anonymous-vote-btn animate-pop-in" onClick={handleUseAnonymousVote}>
          <i className="fa-solid fa-mask"></i> ẨN DANH BỎ PHIẾU ({gameState.inventory['ANONYMOUS_VOTE']})
        </button>
      )}

      <div className={`discussion-panel ${isChatExpanded ? 'expanded' : 'minimized'}`}>
        <button
          className="chat-toggle-btn"
          onClick={() => setIsChatExpanded(!isChatExpanded)}
          title={isChatExpanded ? "Thu nhỏ chat" : "Mở rộng chat"}
        >
          <i className={isChatExpanded ? "fa-solid fa-compress" : "fa-solid fa-comments"}></i>
        </button>

        {isChatExpanded && (
          <div className="chat-area">
            {gameState.messages?.filter((msg: any) => {
              const senderPlayer = gameState.players?.find((p: any) => String(p.user_id) === String(msg.sender_id));
              const isAi = senderPlayer && String(senderPlayer.user_id).startsWith('ai_');
              return !isAi; // Filter out AI messages in discussion phase
            }).map((msg: any, idx: number) => {
              const senderPlayer = gameState.players?.find((p: any) => String(p.user_id) === String(msg.sender_id));
              const color = senderPlayer ? getPlayerColor(senderPlayer.display_name, senderPlayer.color) : null;
              return (
                <div key={idx} className={`chat-bubble ${String(msg.sender_id) === String(user?.user_id) ? 'mine' : ''}`}>
                  <span className="sender" style={color ? { color: color } : {}}>
                    {String(msg.sender_id) === String(user?.user_id) ? 'Tôi' : (msg.sender_name || 'Người chơi')}:
                  </span>
                  <span className="text">{msg.content}</span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}

        <div className="chat-input-group">
          <input
            type="text"
            placeholder={!isAlive ? "Bạn đã bị loại, không thể chat..." : (isChatExpanded ? "Thảo luận tự do..." : "Chat...")}
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
            disabled={!isAlive || isSubmitting}
          />
          <button onClick={handleChat} disabled={!isAlive || isSubmitting}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for VOTING phase
const VotingView: React.FC<{ matchId: string, gameState: any, user: any }> = ({ matchId, gameState, user }) => {
  const [votedId, setVotedId] = useState<string | null>(null);

  const me = gameState.players?.find((p: any) => String(p.user_id) === String(user?.user_id));
  const isAlive = me?.is_alive !== false;

  // Reset votedId if phase changes (for re-voting in VOTE_TIE)
  useEffect(() => {
    setVotedId(null);
  }, [gameState.phase, gameState.round]);

  // Xáo trộn danh sách người chơi để vote cho nhất quán với PlayerCircle
  const votingPlayers = useMemo(() => {
    if (!gameState.players) return [];
    
    const aliveOthers = gameState.players.filter((p: any) => p.user_id !== user?.user_id && p.is_alive);
    
    // Sử dụng matchId làm seed để xáo trộn tương tự PlayerCircle
    const seed = matchId ? matchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    
    return [...aliveOthers].sort((a, b) => {
      const hashA = (String(a.user_id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + seed) % 100;
      const hashB = (String(b.user_id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + seed) % 100;
      return hashA - hashB;
    });
  }, [gameState.players, matchId, user?.user_id]);

  const handleVote = async (targetUserId: string) => {
    if (!isAlive || votedId || targetUserId === user?.user_id) return;
    try {
      await gameApi.submitVote(matchId, targetUserId);
      setVotedId(targetUserId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi bỏ phiếu.');
    }
  };

  return (
    <div className="voting-container">
      <h2 className="voting-title">{gameState.phase === 'VOTE_TIE' ? 'HÒA PHIẾU! HÃY BẦU LẠI' : 'AI LÀ GIÁN ĐIỆP?'}</h2>
      
      {votedId && (
        <div className="voting-sent-overlay animate-pop-in">
          <div className="sent-content">
            <i className="fa-solid fa-circle-check"></i>
            <h3>ĐÃ GỬI BÌNH CHỌN</h3>
            <p>Đang chờ những người chơi khác...</p>
            <button className="change-vote-btn" onClick={() => setVotedId(null)}>
              ĐỔI LỰA CHỌN
            </button>
          </div>
        </div>
      )}

      <div className="voting-players">
        {votingPlayers.map((p: any) => {
          const color = gameState.isAnonymousVoting ? '#808080' : getPlayerColor(p.display_name, p.color);
          const isAI = String(p.user_id).startsWith('ai_');
          // Show checkmark if user has voted for someone, or if server says this user has voted
          // In hide mode, voteCounts only indicates who has voted
          const playerHasVoted = gameState.voteCounts && !!gameState.voteCounts[p.user_id];
          const displayName = gameState.isAnonymousVoting ? 'Người chơi bí ẩn' : p.display_name;

          return (
            <div
              key={p.user_id}
              className={`voting-card ${votedId === p.user_id ? 'voted' : ''} ${!isAlive ? 'disabled' : ''} ${gameState.isAnonymousVoting ? 'anonymous' : ''}`}
              onClick={() => handleVote(p.user_id)}
              style={!isAlive ? { cursor: 'not-allowed', opacity: 0.7 } : {}}
            >
              <div
                className="avatar-circle"
                style={color ? {
                  borderColor: '#FFF',
                  boxShadow: gameState.isAnonymousVoting ? 'none' : `0 0 15px ${color}`,
                  filter: gameState.isAnonymousVoting ? 'grayscale(100%)' : 'none'
                } : {}}
              >
                <img
                  src={getPlayerAvatarByColor(p.display_name, p.color) || avatarMap[(p.seat_index || 0) % 8]}
                  alt={displayName}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
              <div className="player-name" style={color ? { color: color, textShadow: '0 0 10px rgba(0,0,0,0.8)' } : {}}>
                {displayName}
              </div>

              {votedId === p.user_id && <div className="voted-badge">ĐÃ CHỌN</div>}
            </div>
          );
        })}
      </div>
      <p className="voting-hint">
        {!isAlive
          ? 'Bạn đã bị loại, không thể tham gia bỏ phiếu.'
          : (votedId ? 'Bạn đã chọn người này. Bạn có thể chọn người khác nếu muốn đổi ý.' : 'Hãy chọn người bạn nghi ngờ nhất!')}
      </p>
    </div>
  );
};

// Sub-component for ROLE_CHECK phase
const RoleCheckView: React.FC<{ matchId: string, gameState: any, user: any }> = ({ matchId, gameState, user }) => {
  const [guessedRole, setGuessedRole] = useState<'spy' | 'civilian' | null>(null);

  const handleGuess = async (role: 'spy' | 'civilian') => {
    if (guessedRole) return;
    try {
      await gameApi.submitRoleGuess(matchId, role);
      setGuessedRole(role);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi chọn vai trò.');
    }
  };

  return (
    <div className="role-check-container animate-pop-in">
      <h2 className="role-check-title">XÁC NHẬN VAI TRÒ</h2>
      <p className="role-check-hint">Bạn là ai trong trận đấu này?</p>
      <div className="role-check-actions">
        <button
          className={`role-btn civilian ${guessedRole === 'civilian' ? 'selected' : ''}`}
          onClick={() => handleGuess('civilian')}
          disabled={!!guessedRole}
        >
          DÂN THƯỜNG
        </button>
        <button
          className={`role-btn spy ${guessedRole === 'spy' ? 'selected' : ''}`}
          onClick={() => handleGuess('spy')}
          disabled={!!guessedRole}
        >
          GIÁN ĐIỆP
        </button>
      </div>
      {guessedRole && <p className="waiting-msg">Đã gửi xác nhận. Đang chờ kết quả...</p>}
    </div>
  );
};

// Sub-component for ROLE_CHECK_RESULT phase
const RoleCheckResultView: React.FC<{
  matchId: string,
  gameState: any,
  user: any,
  setGameState: any,
  isModal?: boolean
}> = ({ matchId, gameState, user, setGameState, isModal }) => {
  const result = gameState.personal_role_check_result;
  const [abilityContent, setAbilityContent] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedAbilityType, setConfirmedAbilityType] = useState<string | null>(null);

  // Đồng bộ hóa dữ liệu từ gameState (trường hợp nhận qua API Fallback) vào personal_role_check_result
  useEffect(() => {
    // Ưu tiên dữ liệu từ gameState nếu có role_check_correct (Fallback API)
    if (!result && gameState.role_check_correct !== undefined) {
      const role = (gameState.actual_role || gameState.role || '').toLowerCase();
      const isCorrect = gameState.role_check_correct;

      let roleDisplay = 'Dân Thường';
      if (role === 'spy') roleDisplay = 'Gián Điệp';
      else if (role === 'infected') roleDisplay = 'Kẻ Bị Tha Hóa';

      setGameState((prev: any) => ({
        ...prev,
        personal_role_check_result: {
          type: "ROLE_CHECK_RESULT",
          correct: isCorrect,
          actual_role: role,
          can_use_ability: prev.can_use_ability ?? false,
          message: prev.message || (isCorrect
            ? `Bạn là ${roleDisplay}`
            : "Bạn đã đoán nhầm vai trò."),
          reward_coins: prev.reward_coins ?? true,
          abilities_available: prev.abilities || prev.abilities_available || [],
          alive_humans: prev.alive_humans || []
        }
      }));
    }
  }, [gameState.role_check_correct, gameState.actual_role, gameState.role, gameState.can_use_ability, gameState.abilities, gameState.abilities_available, gameState.alive_humans, gameState.message, gameState.reward_coins, result, setGameState]);

  const handleConfirmAbility = async (abilityType: string) => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      const response = await gameApi.confirmSpyAbility(matchId, abilityType);
      if (response.data.confirmed) {
        setConfirmedAbilityType(abilityType);
        // Cập nhật trạng thái vào gameState để renderPhase biết đã xong
        setGameState((prev: any) => ({
          ...prev,
          personal_role_check_result: {
            ...prev.personal_role_check_result,
            confirmed_ability: abilityType,
            acknowledged: true, // Đánh dấu đã xem xong (Spy có skill)
            done_with_panel: true // Thay vì abilityType === 'none', đóng luôn panel
          }
        }));
        if (abilityType === 'none') {
          // No alert needed, it will just disappear
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xác nhận kỹ năng.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcknowledgeResult = () => {
    // Dùng cho Civilian hoặc Spy đoán sai, chỉ cần đóng modal
    setGameState((prev: any) => ({
      ...prev,
      personal_role_check_result: {
        ...prev.personal_role_check_result,
        acknowledged: true,
        done_with_panel: true
      }
    }));
  };

  const handleUseAbility = async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      if (confirmedAbilityType === 'fake_message') {
        if (!abilityContent.trim()) return;
        await gameApi.useAbility(matchId, abilityContent);
        alert('Đã gửi tin nhắn thao túng!');
      } else if (confirmedAbilityType === 'infection') {
        if (!selectedTarget) return;
        await gameApi.infectPlayer(matchId, selectedTarget);
        alert('Đã thực hiện tha hóa người chơi!');
      }

      // Update state to hide the panel after successful usage
      setGameState((prev: any) => ({
        ...prev,
        personal_role_check_result: {
          ...prev.personal_role_check_result,
          done_with_panel: true
        }
      }));

      // Clear after use
      setAbilityContent('');
      setSelectedTarget(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi sử dụng kỹ năng.');
    } finally {
      setIsProcessing(false);
    }
  };

  const abilities = result?.abilities_available || [];
  const hasAbilities = abilities.length > 0;
  const actualRole = result?.actual_role || 'unknown';
  const isSpyOrInfected = actualRole === 'spy' || actualRole === 'infected';

  // Làm sạch message để tránh lặp lại "Chính xác!" nếu header đã hiển thị
  const cleanMessage = result?.message
    ? result.message.replace(/^(Chính xác!|Sai rồi!|Rất tiếc!|Bạn đã đoán nhầm vai trò\.)\s*/i, '')
    : '';

  return (
    <>
      {result ? (
        <div className={`personal-result-card animate-pop-in ${actualRole}`} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <p className={`result-status ${result.correct ? 'correct' : 'incorrect'}`}>
            {result.correct ? 'CHÍNH XÁC!' : 'SAI RỒI!'}
          </p>
          <p className="result-msg">{cleanMessage}</p>

          {result.reward_coins && (
            <div className={`coins-reward-text ${!result.correct ? 'incorrect' : ''}`}>
              <i className="fa-solid fa-coins"></i>
              <span>{result.correct ? '+' : '-'} {result.reward_amount || 10} xu</span>
            </div>
          )}

          {isSpyOrInfected && (
            <div className="role-theme-indicator">
              <i className="fa-solid fa-user-ninja"></i>
              <span>PHE GIÁN ĐIỆP</span>
            </div>
          )}

          {hasAbilities && !result?.done_with_panel && (
            <div className="ability-panel animate-slide-up">
              <h3 className="ability-title">
                <i className="fa-solid fa-wand-magic-sparkles"></i> KỸ NĂNG ĐẶC BIỆT
              </h3>

              {!confirmedAbilityType ? (
                <div className="ability-selection">
                  <p className="ability-intro-text">Hãy chọn 1 kỹ năng để sử dụng trong trận đấu:</p>
                  <div className="ability-cards-list">
                    {abilities
                      .filter((v: any, i: number, a: any[]) => a.findIndex(t => t.type === v.type) === i)
                      .map((ability: any) => (
                      /* Tạm thời ẩn kỹ năng Tha Hóa theo yêu cầu */
                      ability.type === 'infection' ? null : (
                      <div key={ability.type} className="ability-card" onClick={() => handleConfirmAbility(ability.type)}>
                        <div className="ability-card-icon">
                          <i className={`fa-solid ${ability.type === 'fake_message' ? 'fa-robot' : 'fa-virus'}`}></i>
                        </div>
                        <div className="ability-card-info">
                          <h4 className="ability-name">{ability.name}</h4>
                          <p className="ability-desc">{ability.description}</p>
                        </div>
                        <div className="ability-select-hint">CHỌN</div>
                      </div>
                      )
                    ))}
                    <div className="ability-card skip-card" onClick={() => handleConfirmAbility('none')}>
                      <div className="ability-card-icon">
                        <i className="fa-solid fa-ban"></i>
                      </div>
                      <div className="ability-card-info">
                        <h4 className="ability-name">Không sử dụng</h4>
                        <p className="ability-desc">Bỏ qua quyền lợi kỹ năng vòng này.</p>
                      </div>
                      <div className="ability-select-hint">CHỌN</div>
                    </div>
                  </div>
                </div>
              ) : null /* (
                <div className="ability-usage-form">
                  {confirmedAbilityType === 'fake_message' ? (
                    <div className="ability-usage">
                      <p className="ability-usage-title">Kỹ năng: Thao túng</p>
                      <p className="ability-usage-desc">Bạn có thể nhập nội dung để KeywordSpy nói thay bạn.</p>
                      <input
                        type="text"
                        placeholder="Nhập nội dung muốn nói..."
                        value={abilityContent}
                        onChange={(e) => setAbilityContent(e.target.value)}
                        autoFocus
                      />
                      <div className="ability-actions">
                        <button className="use-ability-btn" onClick={handleUseAbility} disabled={isProcessing || !abilityContent.trim()}>
                          {isProcessing ? 'ĐANG GỬI...' : 'SỬ DỤNG NGAY'}
                        </button>
                        <button className="dismiss-ability-btn" onClick={() => setGameState((prev: any) => ({
                          ...prev,
                          personal_role_check_result: { ...prev.personal_role_check_result, done_with_panel: true }
                        }))}>
                          ĐỂ SAU
                        </button>
                      </div>
                      <p className="ability-usage-note">* Bạn có thể dùng kỹ năng này ở các vòng miêu tả sau tại ô của KeywordSpy.</p>
                    </div>
                  ) : confirmedAbilityType === 'infection' ? (
                    <div className="ability-usage">
                      <p className="ability-usage-title">Kỹ năng: Tha Hóa</p>
                      <p className="ability-usage-desc">Chọn 1 người chơi để biến thành đồng minh bí mật:</p>
                      <div className="infect-list">
                        {(result.alive_humans || []).map((p: any) => (
                          <button
                            key={p.user_id}
                            className={`infect-btn ${selectedTarget === p.user_id ? 'selected' : ''}`}
                            onClick={() => setSelectedTarget(p.user_id)}
                            style={{ borderColor: p.color, color: p.color }}
                          >
                            <span className="dot" style={{ backgroundColor: p.color }}></span>
                            {p.display_name}
                          </button>
                        ))}
                      </div>
                      <button onClick={handleUseAbility} disabled={isProcessing || !selectedTarget} className="confirm-infect-btn">
                        {isProcessing ? 'ĐANG THỰC HIỆN...' : 'XÁC NHẬN THA HÓA'}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) */}
            </div>
          )}

          {/* Nút đóng cho Civilian hoặc Spy đoán sai */}
          {/* {!hasAbilities && (
            <div className="modal-footer">
              <button className="modal-close-btn" onClick={handleAcknowledgeResult}>XÁC NHẬN</button>
            </div>
          )} */}
        </div>
      ) : (
        <p className="waiting-msg animate-pop-in">Đang tổng hợp kết quả...</p>
      )}
    </>
  );
};


// Sub-component for ROUND_RESULT phase
const RoundResultView: React.FC<{ gameState: any, user: any }> = ({ gameState, user }) => {
  const result = gameState.eliminated_result || gameState.eliminated_player;

  // Nếu phase là ROUND_RESULT nhưng chưa có kết quả nào (đang đợi)
  if (!result && gameState.phase === 'ROUND_RESULT') {
    return <div className="round-result-container"><p className="waiting-msg">Đang tổng hợp kết quả...</p></div>;
  }

  const name = result?.eliminated_display_name || result?.display_name;
  const isTie = !result?.eliminated_user_id && (result?.message?.includes('Hòa') || !name);
  const color = name ? getPlayerColor(name, result?.color) : null;

  return (
    <div className="round-result-container animate-pop-in">
      {!isTie && name ? (
        <div className="eliminated-card">
          <p className="eliminated-text">Kết quả bỏ phiếu:</p>
          <div
            className="eliminated-name"
            style={color ? { color: color } : {}}
          >
            {result.eliminated_user_id === user?.user_id ? 'Bạn' : name} đã bị loại!
          </div>
          <p className="eliminated-hint">Vai trò của người này vẫn là một ẩn số...</p>
        </div>
      ) : (
        <div className="tie-card animate-pop-in">
          <i className="fa-solid fa-scale-unbalanced-flip tie-icon"></i>
          <p className="no-one-eliminated">Không có ai bị loại vòng này (Hòa phiếu)</p>
          <p className="tie-hint">Hãy cẩn thận hơn ở vòng tiếp theo!</p>
        </div>
      )}
    </div>
  );
};

// Sub-component for GAME_OVER phase
const GameOverView: React.FC<{ gameState: any, navigate: any }> = ({ gameState, navigate }) => {
  const winner = (gameState.winner || gameState.winner_role || '').toLowerCase();

  return (
    <div className="game-over-container animate-pop-in">
      <h1 className="game-over-title">TRÒ CHƠI KẾT THÚC</h1>
      <div className={`winner-badge ${winner.includes('spy') ? 'spy' : 'civilian'}`}>
        {winner.includes('spy') ? 'GIÁN ĐIỆP' : 'DÂN THƯỜNG'} CHIẾN THẮNG
      </div>

      <div className="keywords-summary">
        <div className="keyword-item civilian">
          <span className="label">Từ khóa Dân thường:</span>
          <span className="value">{gameState.civilian_keyword}</span>
          {(gameState.isSpecialRound || gameState.is_special_round) && gameState.civilian_description && (
            <div className="description-value-box">{gameState.civilian_description}</div>
          )}
        </div>
        <div className="keyword-item spy">
          <span className="label">Từ khóa Gián điệp:</span>
          <span className="value">{gameState.spy_keyword}</span>
          {(gameState.isSpecialRound || gameState.is_special_round) && gameState.spy_description && (
            <div className="description-value-box">{gameState.spy_description}</div>
          )}
        </div>
      </div>

      <div className="final-scores-table">
        <div className="score-header">
          <span>Người chơi</span>
          <span>Vai trò</span>
          <span>Điểm số</span>
        </div>
        {gameState.players.map((p: any) => {
          const roleUpper = p.role?.toUpperCase();
          const isActualSpy = (gameState.spy_user_id && String(p.user_id) === String(gameState.spy_user_id)) ||
            roleUpper === 'SPY' ||
            roleUpper === 'SPY_ALLY' ||
            roleUpper === 'INFECTED';
          return (
            <div key={p.user_id} className="score-row">
              <span className="player-name">
                {p.username || p.display_name}
                {isActualSpy && <span className="spy-tag"> (PHE GIÁN ĐIỆP)</span>}
              </span>
              <span className={`player-role ${isActualSpy ? 'spy' : 'civilian'}`}>
                {isActualSpy ? (roleUpper === 'INFECTED' ? 'Bị tha hóa' : 'Gián điệp') : 'Dân thường'}
              </span>
              <span className={`player-score ${(p.score_gained || 0) < 0 ? 'negative' : 'positive'}`} style={{ color: (p.score_gained || 0) < 0 ? '#ff4d4f' : '#34C759' }}>
                {(p.score_gained || 0) > 0 ? `+${p.score_gained}` : (p.score_gained || 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Common Player Circle Component
const PlayerCircle: React.FC<{
  players: any[],
  user: any,
  currentTurnId?: any,
  isSpy?: boolean,
  selectedAbility?: string,
  onFakeMessageSubmit?: (content: string) => Promise<void>,
  matchId?: string,
  isAnonymousVoting?: boolean
}> = ({ players, user, currentTurnId, isSpy, selectedAbility, onFakeMessageSubmit, matchId, isAnonymousVoting }) => {
  const [fakeMsg, setFakeMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xáo trộn vị trí hiển thị ngẫu nhiên dựa trên matchId để đảm bảo vị trí cố định trong suốt trận nhưng khác với Lobby
  const randomizedPlayers = useMemo(() => {
    if (!players || players.length === 0) return [];
    
    // Sử dụng matchId làm seed đơn giản để xáo trộn
    const seed = matchId ? matchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    
    return [...players].sort((a, b) => {
      // Kết hợp user_id và seed để tạo ra một giá trị "ngẫu nhiên" nhưng nhất quán cho matchId này
      const hashA = (String(a.user_id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + seed) % 100;
      const hashB = (String(b.user_id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + seed) % 100;
      return hashA - hashB;
    });
  }, [players, matchId]);

  const handleFakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fakeMsg.trim() || isSubmitting || !onFakeMessageSubmit) return;
    try {
      setIsSubmitting(true);
      await onFakeMessageSubmit(fakeMsg);
      setFakeMsg('');
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`players-circle count-${randomizedPlayers.length} ${isAnonymousVoting ? 'anonymous-mode' : ''}`}>
      {randomizedPlayers.map((p, idx) => {
        const isMe = String(p.user_id) === String(user?.user_id);
        const displayName = isAnonymousVoting ? (isMe ? 'Tôi (Bí ẩn)' : 'Người chơi bí ẩn') : p.display_name;
        const color = isAnonymousVoting ? '#808080' : getPlayerColor(p.display_name, p.color);
        
        const isActive = currentTurnId && p.user_id && String(currentTurnId) === String(p.user_id);
        const roleUpper = p.role?.toUpperCase();
        const isInfected = roleUpper === 'INFECTED' || roleUpper === 'SPY_ALLY';
        const isAi = String(p.user_id).startsWith('ai_');

        return (
          <div
            key={p.user_id}
            className={`player-slot pos-${idx} ${isActive ? 'active' : ''} ${!p.is_alive ? 'dead' : ''} ${isInfected ? 'infected' : ''}`}
          >
            <div
              className="avatar-circle"
              style={{
                borderColor: isAnonymousVoting ? '#666' : (isInfected ? '#FF3B30' : '#FFF'),
                boxShadow: isAnonymousVoting ? 'none' : (isInfected ? '0 0 20px #FF3B30' : `0 0 20px ${color}`),
                backgroundColor: 'rgba(0,0,0,0.3)',
                filter: isAnonymousVoting ? 'grayscale(100%)' : 'none'
              }}
            >
              <img
                src={getPlayerAvatarByColor(p.display_name, p.color) || avatarMap[(p.seat_index || 0) % 8]}
                alt={displayName}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
              {isActive && <div className="active-indicator">ĐANG NÓI...</div>}
            </div>
            <div className="player-name" style={{ color: color, textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
              {isMe && !isAnonymousVoting ? 'Tôi' : displayName}
            </div>

            {/* Show description if exists, otherwise show status if active */}
            {p.description ? (
              <div className="player-bubble">{p.description}</div>
            ) : isActive ? (
              <div className="player-bubble status">
                Đang mô tả...
              </div>
            ) : null}

            {/* AI Manipulation Input for Spy */}
            {isAi && isSpy && selectedAbility === 'fake_message' && !isAnonymousVoting && (
              <div className="ai-manipulation-input animate-pop-in">
                <form onSubmit={handleFakeSubmit}>
                  <input
                    type="text"
                    placeholder="Nhập nội dung KeywordSpy nói..."
                    value={fakeMsg}
                    onChange={(e) => setFakeMsg(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button type="submit" disabled={isSubmitting || !fakeMsg.trim()}>
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GameScreen;
