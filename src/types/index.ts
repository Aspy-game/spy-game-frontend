export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  user_id: number;
  username: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
  role?: Role;
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
