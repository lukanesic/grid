export interface BlockedUser {
  id: string;
  blocked_user_id: string;
  blocked_user_name: string | null;
  blocked_user_avatar: string | null;
  reason: string | null;
  blocked_at: string;
}
