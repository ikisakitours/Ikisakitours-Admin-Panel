// src/services/users.service.ts
import { fetcher } from '@/lib/api-client';

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  country: string;
  avatarUrl: string | null;
  isVerified: boolean;
  isVip: boolean;
  hasAccess: boolean;
  createdAt: string;
}

export const UsersService = {
  // GET /api/auth/users
  getAll: () => fetcher<User[]>('/auth/users'),
};