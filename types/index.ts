export type TicketStatus = 'new' | 'open' | 'in_progress' | 'waiting_customer' | 'waiting_internal' | 'resolved' | 'closed' | 'reopened';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketChannel = 'web' | 'email' | 'phone' | 'telegram' | 'whatsapp' | 'vk';
export type UserRole = 'admin' | 'manager' | 'support_agent' | 'sales_agent' | 'read_only';
export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

// Enum objects for use in forms
export const TicketStatusEnum = {
  NEW: 'new' as const,
  OPEN: 'open' as const,
  IN_PROGRESS: 'in_progress' as const,
  WAITING_CUSTOMER: 'waiting_customer' as const,
  WAITING_INTERNAL: 'waiting_internal' as const,
  RESOLVED: 'resolved' as const,
  CLOSED: 'closed' as const,
  REOPENED: 'reopened' as const,
} as const;

export const TicketPriorityEnum = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  CRITICAL: 'critical' as const,
} as const;

export const TicketChannelEnum = {
  WEB: 'web' as const,
  EMAIL: 'email' as const,
  PHONE: 'phone' as const,
  TELEGRAM: 'telegram' as const,
  WHATSAPP: 'whatsapp' as const,
  VK: 'vk' as const,
} as const;

export const UserRoleEnum = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  SUPPORT_AGENT: 'support_agent' as const,
  SALES_AGENT: 'sales_agent' as const,
  READ_ONLY: 'read_only' as const,
} as const;

export const DealStageEnum = {
  LEAD: 'lead' as const,
  QUALIFIED: 'qualified' as const,
  PROPOSAL: 'proposal' as const,
  NEGOTIATION: 'negotiation' as const,
  CLOSED_WON: 'closed_won' as const,
  CLOSED_LOST: 'closed_lost' as const,
} as const;

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  assigned_to?: string;
  assigned_group?: string;
  client_id?: string;
  company_id?: string;
  tags: string[];
  due_date?: string;
  resolved_at?: string;
  closed_at?: string;
  related_tickets: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  channel?: TicketChannel;
  assigned_to?: string;
  assigned_group?: string;
  client_id?: string;
  company_id?: string;
  tags?: string[];
  due_date?: string;
}

export interface UpdateTicketData {
  subject?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  channel?: TicketChannel;
  assigned_to?: string;
  assigned_group?: string;
  client_id?: string;
  company_id?: string;
  tags?: string[];
  due_date?: string;
  resolved_at?: string;
  closed_at?: string;
  updated_at?: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  author_type: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: any[];
  phone: any[];
  position?: string;
  source?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  responsible_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  address?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  primary_contact_id?: string;
  responsible_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  name: string;
  amount: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expected_close_date?: string;
  client_id?: string;
  company_id?: string;
  responsible_user_id?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  is_active: boolean;
  department_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
