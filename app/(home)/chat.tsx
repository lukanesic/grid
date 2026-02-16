import { supabase } from "@/lib/supabase";
import { Message } from "@/types/chat";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function ChatScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const pendingStatusColor = isDark ? colors.textSecondary : "#C3C9D3";
  const readStatusColor = isDark ? colors.blue : colors.accent;
  const { chatId, otherUserId, name, avatar } = useLocalSearchParams();
  const { profile } = useAuth();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Convert params to strings
  const avatarUrl = Array.isArray(avatar) ? avatar[0] : avatar;
  const userName = Array.isArray(name) ? name[0] : name;

  // Reload messages when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (chatId && typeof chatId === "string") {
        setMessages([]);
        setOffset(0);
        setHasMore(true);
        loadMessages(chatId, 0);
        markChatAsRead(chatId);
      }
    }, [chatId]),
  );

  // Real-time subscription for new messages
  useEffect(() => {
    if (!chatId || typeof chatId !== "string") return;

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log("📨 New message received in real-time!");
          const newMessage = {
            message_id: payload.new.id,
            sender_id: payload.new.sender_id,
            sender_name: null,
            sender_avatar: null,
            content: payload.new.content,
            is_read: payload.new.is_read,
            created_at: payload.new.created_at,
          };
          // Add new message at the beginning (DESC order) only if it doesn't exist
          setMessages((prev) => {
            const exists = prev.some(
              (msg) => msg.message_id === newMessage.message_id,
            );
            if (exists) return prev;
            setOffset((prevOffset) => prevOffset + 1);
            return [newMessage as Message, ...prev];
          });

          // Auto-mark messages as read if received from other user while in chat
          if (
            payload.new.sender_id !== profile?.id &&
            typeof chatId === "string"
          ) {
            console.log("📖 Auto-marking message as read...");
            setTimeout(() => {
              markChatAsRead(chatId);
            }, 1000); // 1 second delay to ensure user saw the message
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const loadMessages = async (chatIdParam: string, currentOffset: number) => {
    try {
      const { data, error } = await supabase.rpc("get_chat_messages", {
        p_chat_id: chatIdParam,
        page_limit: 10,
        page_offset: currentOffset,
      });

      if (error) throw error;

      const newMessages = data || [];
      if (newMessages.length < 10) {
        setHasMore(false);
      }

      if (currentOffset === 0) {
        // First load: messages are in DESC order (newest first)
        setMessages(newMessages);
      } else {
        // Load more: append older messages, but avoid duplicates
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.message_id));
          const uniqueNewMessages = newMessages.filter(
            (msg: Message) => !existingIds.has(msg.message_id),
          );
          return [...prev, ...uniqueNewMessages];
        });
      }

      setOffset(currentOffset + newMessages.length);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || loading) return;

    setLoadingMore(true);
    if (chatId && typeof chatId === "string") {
      await loadMessages(chatId, offset);
    }
  };

  const markChatAsRead = async (chatIdParam: string) => {
    try {
      const { error } = await supabase.rpc("mark_chat_as_read", {
        p_chat_id: chatIdParam,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === "" || !chatId || typeof chatId !== "string")
      return;

    const messageContent = inputText.trim();
    setInputText("");

    try {
      const { data, error } = await supabase.rpc("send_message", {
        p_chat_id: chatId,
        p_content: messageContent,
      });

      if (error) throw error;

      if (data.success) {
        // Message will be added via real-time subscription
        console.log("✅ Message sent successfully");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setInputText(messageContent); // Restore message on error
    }
  };

  const getTimeLabel = (timestamp: string): string => {
    const messageDate = new Date(timestamp);
    return messageDate.toLocaleTimeString("sr-RS", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChatOptions = () => {
    router.push({
      pathname: "/(home)/chatInfo",
      params: {
        chatId: chatId,
        otherUserId: otherUserId,
        name: userName || "Unknown",
        avatar: avatarUrl || "https://i.pravatar.cc/150?img=1",
      },
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === profile?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMine ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {!isMine && (
          <Image
            source={{
              uri:
                item.sender_avatar ||
                avatarUrl ||
                "https://i.pravatar.cc/150?img=1",
            }}
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.timestamp,
                isMine ? styles.myTimestamp : styles.theirTimestamp,
              ]}
            >
              {getTimeLabel(item.created_at)}
            </Text>
            {isMine && (
              <View style={styles.statusIcon}>
                {item.is_read ? (
                  <View style={styles.doubleCheck}>
                    <FontAwesome
                      name="check"
                      size={12}
                      color={readStatusColor}
                      style={styles.checkIcon}
                    />
                    <FontAwesome
                      name="check"
                      size={12}
                      color={readStatusColor}
                      style={styles.checkIcon2}
                    />
                  </View>
                ) : (
                  <FontAwesome
                    name="check"
                    size={12}
                    color={pendingStatusColor}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <FontAwesome name="chevron-left" size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerCenter}
            onPress={handleChatOptions}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: avatarUrl || "https://i.pravatar.cc/150?img=1",
                }}
                style={styles.headerAvatar}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName}>{userName || "Unknown"}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleChatOptions}
            >
              <FontAwesome name="ellipsis-v" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.message_id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            inverted
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator
                    size="small"
                    color={colors.textSecondary}
                  />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FontAwesome
                  name="comments-o"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyText}>Nema poruka</Text>
                <Text style={styles.emptySubtext}>Pošaljite prvu poruku</Text>
              </View>
            }
          />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <FontAwesome name="plus-circle" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Napišite poruku..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <FontAwesome name="smile-o" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Pressable
            onPress={handleSend}
            style={[
              styles.sendButton,
              inputText.trim() === "" && styles.sendButtonDisabled,
            ]}
            disabled={inputText.trim() === ""}
          >
            <FontAwesome
              name="send"
              size={18}
              color={
                inputText.trim() === ""
                  ? colors.textSecondary
                  : colors.background
              }
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 4,
    },
    headerCenter: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 12,
    },
    avatarContainer: {
      position: "relative",
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    headerTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    headerName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    headerButton: {
      padding: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    messagesList: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    messageContainer: {
      flexDirection: "row",
      marginBottom: 16,
      maxWidth: "80%",
    },
    myMessageContainer: {
      alignSelf: "flex-end",
      flexDirection: "row-reverse",
    },
    theirMessageContainer: {
      alignSelf: "flex-start",
    },
    messageAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    messageBubble: {
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxWidth: "100%",
    },
    myMessageBubble: {
      backgroundColor: isDark ? colors.accent : colors.blue,
      borderBottomRightRadius: 4,
    },
    theirMessageBubble: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
    },
    myMessageText: {
      color: colors.background,
    },
    theirMessageText: {
      color: colors.text,
    },
    messageFooter: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      gap: 4,
    },
    timestamp: {
      fontSize: 11,
    },
    myTimestamp: {
      color: colors.background,
      opacity: 0.6,
    },
    theirTimestamp: {
      color: colors.textSecondary,
    },
    statusIcon: {
      marginLeft: 2,
    },
    doubleCheck: {
      flexDirection: "row",
      position: "relative",
    },
    checkIcon: {
      position: "relative",
    },
    checkIcon2: {
      position: "absolute",
      left: 4,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    attachButton: {
      padding: 8,
      marginRight: 8,
      marginBottom: 4,
    },
    inputWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingLeft: 16,
      paddingRight: 12,
      paddingVertical: 8,
      minHeight: 40,
      maxHeight: 100,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      paddingVertical: 4,
      maxHeight: 84,
    },
    emojiButton: {
      padding: 4,
      marginLeft: 8,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    sendButtonDisabled: {
      backgroundColor: colors.surface,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
    },
    emptySubtext: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 8,
    },
    loadingMoreContainer: {
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
  });
