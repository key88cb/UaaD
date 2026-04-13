import api from '../axios';
import type { AuthRole, AuthSession } from '../../types/auth';
import { normalizeUserRole, type UserProfile } from '../../types/user';

interface BackendPayload<T> {
  code: number;
  message: string;
  data: T;
}

interface LoginResponseDTO {
  token: string;
  expires_at: string;
  user_id: number;
  role: AuthRole;
  username: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export type LoginResponse = AuthSession;

export interface RegisterRequest {
  username: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  user_id: number;
  phone: string;
  username: string;
}

interface UserProfilePayload {
  user_id: number;
  phone: string;
  username: string;
  role: string;
  created_at: string;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<BackendPayload<LoginResponseDTO>>('/auth/login', payload);
  const { token, expires_at: expiresAt, user_id: userId, role, username } = response.data.data;

  return {
    token,
    expiresAt,
    userId,
    role: normalizeUserRole(role),
    username,
  };
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await api.post<BackendPayload<RegisterResponse>>('/auth/register', payload);
  return response.data.data;
}

export async function getProfile(): Promise<UserProfile> {
  const response = await api.get<BackendPayload<UserProfilePayload>>('/auth/profile');
  const profile = response.data.data;

  return {
    userId: profile.user_id,
    phone: profile.phone,
    username: profile.username,
    role: normalizeUserRole(profile.role),
    createdAt: profile.created_at,
  };
}
