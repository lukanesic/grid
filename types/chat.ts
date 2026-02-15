export interface Chat {
  chat_id: string;
  other_user_id: string;
  other_user_name: string | null;
  other_user_avatar: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
}

export interface Message {
  message_id: string;
  sender_id: string;
  sender_name: string | null;
  sender_avatar: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}
