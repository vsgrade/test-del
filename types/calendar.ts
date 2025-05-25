
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  location?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventFormData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
  location?: string;
  reminder_minutes?: number;
}
