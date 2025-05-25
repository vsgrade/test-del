
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

export interface CalendarEventFormData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type: string;
}
