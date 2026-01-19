export interface Profile {
  id: string
  full_name: string
  avatar_color: string
  created_at: string
}

export interface Appointment {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  color: string | null
  created_by: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  color?: string
  createdBy: string
  creatorName: string
  creatorColor: string
}
