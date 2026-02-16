export type UserRole = "player" | "coach" | "admin";

export interface Profile {
  id: string; // matches auth.users.id
  email: string;
  full_name: string | null;
  phone_number: string | null;
  birth_date: string | null;
  location: string | null;
  role: UserRole;
  score: number | null;
  rating: number | null;
  matches_played: number;
  win_rate: number | null;
  avatar_url: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
  username: string | null;
  // Privacy & Security
  is_private: boolean;
  show_online_status: boolean;
  last_seen: string | null;
  is_online: boolean;
  // Social
  followers_count: number;
  following_count: number;
  // Subscription
  subscription_plan?: "free" | "premium";
  subscription_status?: "active" | "inactive" | "trial" | "cancelled";
  subscription_expires_at?: string | null;
  trial_ends_at?: string | null;
}

export interface Follower {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowerProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  followed_at: string;
}

// Extended type for following list that can include both users and clubs
export interface FollowingItem extends FollowerProfile {
  type: "user" | "club";
  club_info?: {
    address?: string | null;
    courts?: number;
  };
}

export interface FollowStatus {
  authenticated: boolean;
  is_own_profile: boolean;
  is_following: boolean;
  is_followed_by: boolean;
  is_private: boolean;
  can_view_profile: boolean;
  followers_count: number;
  following_count: number;
}

export interface CreateProfileInput {
  id: string;
  email: string;
  role?: UserRole;
}
