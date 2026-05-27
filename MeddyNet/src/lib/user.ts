/**
 * User Profile API Service
 */
import apiClient from './api';

export interface UserProfile {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get('/users/me');
  return data;
}

export async function updateProfile(payload: Partial<Pick<UserProfile, 'name' | 'email'>>): Promise<UserProfile> {
  const { data } = await apiClient.patch('/users/me', payload);
  return data;
}

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
