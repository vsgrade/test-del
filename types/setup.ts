
export interface SetupConfig {
  database: DatabaseConfig;
  admin: AdminConfig;
  isComplete: boolean;
}

export interface DatabaseConfig {
  type: 'supabase' | 'mysql';
  url?: string;
  apiKey?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}

export interface AdminConfig {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}
