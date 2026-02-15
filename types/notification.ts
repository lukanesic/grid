export type NotificationType =
  | "follow"
  | "unfollow"
  | "match_invite"
  | "match_accepted"
  | "match_declined"
  | "message";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_avatar: string | null;
}

export interface NotificationSection {
  title: string;
  items: Notification[];
}
