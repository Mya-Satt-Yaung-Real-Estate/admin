import { apiRequest } from './base';
import { AppSetting, UpdateAppSettingPayload } from '@/types';

export const appSettingsAPI = {
  getAll: () => apiRequest<AppSetting[]>('/app-settings'),
  getOne: (platform: 'android' | 'ios') => apiRequest<AppSetting>(`/app-settings/${platform}`),
  update: (platform: 'android' | 'ios', payload: UpdateAppSettingPayload) =>
    apiRequest<AppSetting>(`/app-settings/${platform}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

