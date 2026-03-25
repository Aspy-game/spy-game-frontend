export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  user_id: number;
  username: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
  role?: Role;
  balance?: number;
  stats?: UserStats;
}

export interface UserStats {
  total_games: number;
  wins_civilian: number;
  wins_spy: number;
  wins_infected: number;
  times_as_spy: number;
  times_infected: number;
  correct_votes: number;
}

export type RoomStatus = 'waiting' | 'in_game' | 'finished';

export interface RegisterResponse {
  user_id: number;
  username: string;
  display_name: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginResponse {
  user_id: number;
  username: string;
  display_name: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  role?: Role;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface Room {
  id: string;
  roomCode: string;
  hostId: string;
  maxPlayers: number;
  currentPlayers: number;
  status: RoomStatus;
  isPrivate: boolean;
}
