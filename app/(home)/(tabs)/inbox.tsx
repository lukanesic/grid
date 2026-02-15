import { supabase } from "@/lib/supabase";
import { Chat } from "@/types/chat";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatItem } from "../../../components";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";

export default function InboxScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { profile } = useAuth();
  const { colors } = useTheme();

  const styles = getStyles(colors);

  useEffect(() => {
    loadChats();
  }, []);

  // Reload chats when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, []),
  );

  useEffect(() => {
    if (!profile?.id) return;

    // Real-time subscription for new messages
    const channel = supabase
      .channel("inbox-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          console.log("📨 New message received!");
          loadChats();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chats",
        },
        () => {
          console.log("💬 Chat updated!");
          loadChats();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const loadChats = async () => {
    try {
      const { data, error } = await supabase.rpc("get_user_chats");

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChats();
  };

  const getTimeLabel = (timestamp: string | null): string => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);

    // Check for invalid date
    if (isNaN(messageDate.getTime())) return "";

    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Sada";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "Juče";
    if (diffDays < 7) return `${diffDays}d`;
    return messageDate.toLocaleDateString("sr-RS", {
      day: "numeric",
      month: "short",
    });
  };

  const filteredChats = chats.filter((chat) => {
    const query = searchQuery.toLowerCase();
    return (
      chat.other_user_name?.toLowerCase().includes(query) ||
      chat.last_message?.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity onPress={() => router.push("/(home)/newChat")}>
          <FontAwesome name="edit" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome
          name="search"
          size={16}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Pretraži"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <FontAwesome
              name="times-circle"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.refreshIndicator}
              colors={[colors.refreshIndicator]}
            />
          }
        >
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => {
              const userName = chat.other_user_name || "Unknown";
              const lastMessage = chat.last_message || "Nema poruka";
              const timeLabel = getTimeLabel(chat.last_message_at) || "";
              const avatarUrl =
                chat.other_user_avatar || "https://i.pravatar.cc/150?img=1";
              const unreadCount = chat.unread_count || 0;

              return (
                <ChatItem
                  key={chat.chat_id}
                  name={userName}
                  message={lastMessage}
                  time={timeLabel}
                  avatar={avatarUrl}
                  unreadCount={unreadCount}
                  isOnline={false}
                  isRead={unreadCount === 0}
                  onPress={() =>
                    router.push({
                      pathname: "/(home)/chat",
                      params: {
                        chatId: chat.chat_id,
                        otherUserId: chat.other_user_id,
                        name: userName,
                        avatar: avatarUrl,
                      },
                    })
                  }
                />
              );
            })
          ) : chats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome
                name="comments-o"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>Nema poruka</Text>
              <Text style={styles.emptySubtext}>
                Započnite razgovor sa nekim
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <FontAwesome
                name="search"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={styles.emptyText}>Nema rezultata</Text>
              <Text style={styles.emptySubtext}>
                Pokušajte sa drugim pojmom
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "700",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      marginHorizontal: 20,
      marginBottom: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 4,
    },
    clearButton: {
      padding: 4,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
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
  });
