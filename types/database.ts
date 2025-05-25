
export interface DatabaseConfig {
  type: 'supabase' | 'mysql';
  url?: string;
  apiKey?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

export interface DatabaseStatus {
  isConnected: boolean;
  lastChecked: Date | null;
  error?: string;
}
