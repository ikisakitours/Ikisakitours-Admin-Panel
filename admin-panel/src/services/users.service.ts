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

export interface UpdateUserStatusPayload {
  isVip?: boolean;
  hasAccess?: boolean;
}

export const UsersService = {
  // GET /api/auth/users
  getAll: () => fetcher<User[]>('/auth/users'),

  // PATCH /api/auth/users/:id/status (Toggle VIP or Active Access)
  updateStatus: (userId: string, payload: UpdateUserStatusPayload) =>
    fetcher<User>(`/auth/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};