import axiosInstance from './axiosInstance';

export const gameApi = {
  // SECTION 1: GAME SETUP
  startGame: (roomId: string) => 
    axiosInstance.post(`/rooms/${roomId}/start`),

  getGameState: (matchId: string) => 
    axiosInstance.get(`/game/${matchId}/state`),

  // SECTION 2: PHASE ACTIONS
  submitDescription: (matchId: string, content: string) => 
    axiosInstance.post(`/game/${matchId}/describe`, { content }),

  submitChat: (matchId: string, content: string) => 
    axiosInstance.post(`/game/${matchId}/chat`, { content }),

  // SECTION 3: ROLE CHECK
  submitRoleGuess: (matchId: string, role: 'spy' | 'civilian') => 
    axiosInstance.post(`/game/${matchId}/rolecheck`, { guessed_role: role }),

  confirmSpyAbility: (matchId: string, abilityType: string) => 
    axiosInstance.post(`/game/${matchId}/rolecheck/confirm-ability`, { ability_type: abilityType }),

  // SECTION 4: SPY ABILITIES
  useAbility: (matchId: string, content: string) => 
    axiosInstance.post(`/game/${matchId}/ability/fake-message`, { content }),

  infectPlayer: (matchId: string, targetUserId: string) => 
    axiosInstance.post(`/game/${matchId}/ability/infect`, { target_user_id: targetUserId }),

  // SECTION 5: VOTING
  submitVote: (matchId: string, targetId: string) => 
    axiosInstance.post(`/game/${matchId}/vote`, { target_user_id: targetId }),

  // DEBUG / ADMIN
  setGameState: (matchId: string, state: string) => 
    axiosInstance.post(`/game/${matchId}/set-state`, { state }),

  adjustRewards: (matchId: string, rewards: { civilian?: number, spy?: number, infected?: number }) => 
    axiosInstance.post(`/game/${matchId}/admin/adjust-rewards`, rewards),

  setSpy: (roomId: string, userId: string) => 
    axiosInstance.post(`/rooms/${roomId}/admin/set-spy`, { user_id: userId }),
};
