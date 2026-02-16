export type SurfaceType = "hard" | "clay" | "grass" | "carpet" | "indoor_hard";

export type PaymentStatus = "pending" | "paid" | "cancelled" | "refunded";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface Court {
  id: string;
  club_id: string;
  name: string;
  court_number: number | null;
  surface_type: SurfaceType;
  is_indoor: boolean;
  has_lights: boolean;
  is_available: boolean;
  hourly_rate: number | null;
  currency: string;
  description: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourtOperatingHours {
  id: string;
  court_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  open_time: string; // HH:MM format
  close_time: string; // HH:MM format
  is_closed: boolean;
  created_at: string;
}

export interface CourtReservation {
  id: string;
  court_id: string;
  user_id: string;
  match_id: string | null;
  reservation_date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  duration_minutes: number;
  total_price: number | null;
  currency: string;
  payment_status: PaymentStatus;
  status: ReservationStatus;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  invited_players: string[] | null; // Array of user IDs
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time_slot: string; // HH:MM format
  is_available: boolean;
}

export interface CourtWithAvailability extends Court {
  operating_hours?: CourtOperatingHours[];
  available_slots?: TimeSlot[];
}

export interface CreateReservationPayload {
  court_id: string;
  reservation_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration_minutes: number;
  total_price?: number;
  currency?: string;
  notes?: string;
  invited_players?: string[];
}
