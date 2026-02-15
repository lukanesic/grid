import { supabase } from "@/lib/supabase";
import {
    NotificationSection as INotificationSection,
    Notification,
} from "@/types/notification";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotificationItem, NotificationSection } from "../../components";
import { useTheme } from "../../contexts/ThemeContext";

const NOTIFICATION_STATUS = {
  follow: { color: "#B8FF00", icon: "user-plus" },
  unfollow: { color: "#FF6B6B", icon: "user-times" },
  match_invite: { color: "#4F7DFF", icon: "plus" },
  match_accepted: { color: "#34C759", icon: "check" },
  match_declined: { color: "#FF6B6B", icon: "times" },
  message: { color: "#B8FF00", icon: "comment" },
} as const;

export default function NotificationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    loadNotifications();

    // Real-time subscription with user filter
    const channel = supabase
      .channel("notifications-screen")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log("🔔 New notification received in notification screen!");
          loadNotifications();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Update viewed timestamp when screen is focused (resets badge)
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        updateViewedTimestamp();
      }
    }, [userId]),
  );

  const updateViewedTimestamp = async () => {
    try {
      const { data, error } = await supabase.rpc("update_notifications_viewed");
      if (error) throw error;
      console.log("✅ Notifications viewed timestamp updated");
    } catch (error) {
      console.error("Error updating viewed timestamp:", error);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark this specific notification as read
      const { error } = await supabase.rpc("mark_notification_read", {
        notification_id: notification.id,
      });
      if (error) throw error;

      console.log("✅ Notification marked as read:", notification.id);

      // Reload notifications to update UI immediately
      await loadNotifications();

      // Navigate to the user's profile if actor_id exists
      if (notification.actor_id) {
        router.push(`/playerProfile?id=${notification.actor_id}`);
      }
    } catch (error) {
      console.error("Error handling notification press:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase.rpc("get_user_notifications", {
        page_limit: 50,
        page_offset: 0,
      });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
  };

  const groupNotificationsByTime = (): INotificationSection[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sections: INotificationSection[] = [
      { title: "Novo", items: [] },
      { title: "Danas", items: [] },
      { title: "Juče", items: [] },
      { title: "Ranije", items: [] },
    ];

    notifications.forEach((notification) => {
      const createdAt = new Date(notification.created_at);
      const timeDiff = now.getTime() - createdAt.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);

      // Read notifications don't go to "Novo", they go to time-based sections
      if (!notification.is_read && hoursDiff < 1) {
        sections[0].items.push(notification);
      } else if (createdAt >= today) {
        sections[1].items.push(notification);
      } else if (createdAt >= yesterday) {
        sections[2].items.push(notification);
      } else {
        sections[3].items.push(notification);
      }
    });

    return sections.filter((section) => section.items.length > 0);
  };

  const getTimeLabel = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const sections = groupNotificationsByTime();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.refreshIndicator}
            colors={[colors.refreshIndicator]}
          />
        }
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Notifikacije</Text>
        </View>

        {sections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome
              name="bell-slash"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>Nema notifikacija</Text>
          </View>
        ) : (
          sections.map((section) => (
            <NotificationSection key={section.title} title={section.title}>
              {section.items.map((item, index) => {
                const status = NOTIFICATION_STATUS[item.type];

                return (
                  <NotificationItem
                    key={item.id}
                    name={item.actor_name || "Korisnik"}
                    message={item.message}
                    timeLabel={getTimeLabel(item.created_at)}
                    statusColor={status.color}
                    statusIcon={status.icon}
                    showDivider={index !== section.items.length - 1}
                    isRead={item.is_read}
                    avatarUrl={item.actor_avatar}
                    onPress={() => handleNotificationPress(item)}
                  />
                );
              })}
            </NotificationSection>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    backButton: {
      padding: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginTop: 16,
    },
  });
