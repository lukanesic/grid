import { supabase } from "./supabase";

/**
 * Mark messages as read for the current user in a specific chat
 */
export async function markMessagesAsRead(
  chatId: string,
  userId: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("chat_id", chatId)
      .neq("sender_id", userId) // Don't mark own messages as read
      .eq("is_read", false); // Only mark unread messages

    if (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }

    console.log("✅ Messages marked as read for chat:", chatId);
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    // Don't throw - this is not critical functionality
  }
}

/**
 * Send a new message in a chat
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  content: string,
): Promise<void> {
  try {
    const { error } = await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: senderId,
      content: content.trim(),
      is_read: false,
    });

    if (error) {
      console.error("Error sending message:", error);
      throw error;
    }

    console.log("✅ Message sent successfully");
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}
