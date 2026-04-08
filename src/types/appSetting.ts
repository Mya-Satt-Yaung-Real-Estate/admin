export interface AppSetting {
  id: number;
  platform: 'android' | 'ios';
  min_version: string;
  latest_version: string;
  is_force_update: boolean;
  is_maintenance: boolean;
  update_url: string;
  message_my: string | null;
  message_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateAppSettingPayload {
  min_version: string;
  latest_version: string;
  is_force_update: boolean;
  is_maintenance: boolean;
  update_url: string;
  message_my?: string | null;
  message_en?: string | null;
}

