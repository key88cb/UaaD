import api from '../axios';
import { normalizeUserRole, type UserProfile, type UserRole } from '../../types';

interface BackendPayload<T> {
  code: number;
  message: string;
  data: T;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user_id: number;
  role: UserRole;
  username: string;
}

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
  const response = await api.post<BackendPayload<LoginResponse>>('/auth/login', payload);
  const data = response.data.data;

  return {
    ...data,
    role: normalizeUserRole(data.role),
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
