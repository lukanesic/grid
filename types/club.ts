export interface Club {
  id: string;
  managed_by?: string | null;
  name: string;
  image?: string | null;
  price?: string | null;
  distance?: string | null;
  location?: string | null;
  address?: string | null;
  rating?: number | null;
  reviews?: number;
  description?: string | null;
  courts?: number;
  amenities?: Array<{ icon: string; label: string }>;
  opening_hours?: string | null;
  time_slots?: string[];
  followers_count: number;
  following_count: number;
  created_at?: string;
  updated_at?: string;
  // CamelCase aliases for compatibility
  openingHours?: string | null;
  timeSlots?: string[];
}

export interface ClubFollowStatus {
  is_following: boolean;
  followers_count: number;
  following_count: number;
}
