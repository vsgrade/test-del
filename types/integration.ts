
export interface Integration {
  id: string;
  name: string;
  type: 'telegram' | 'whatsapp' | 'email' | 'api' | 'webhook';
  config: Record<string, any>;
  is_active: boolean;
  user_id?: string;
  department_id?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationFormData {
  name: string;
  type: 'telegram' | 'whatsapp' | 'email' | 'api' | 'webhook';
  config: Record<string, any>;
  is_active: boolean;
  department_id?: string;
}

export interface TelegramChat {
  id: string;
  chat_id: string;
  user_id: string;
  username: string;
  ticket_id: string;
  created_at: string;
  updated_at: string;
}
