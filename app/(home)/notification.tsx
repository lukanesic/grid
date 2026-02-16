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
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const NOTIFICATION_STATUS = {
  follow: { color: "#B8FF00", icon: "user-plus" },
  unfollow: { color: "#FF6B6B", icon: "user-times" },
  match_invite: { color: "#4F7DFF", icon: "plus" },
  match_accepted: { color: "#34C759", icon: "check" },
  match_declined: { color: "#FF6B6B", icon: "times" },
  match_joined: { color: "#34C759", icon: "user-plus" },
  match_left: { color: "#FF6B6B", icon: "user-times" },
  match_cancelled: { color: "#FF6B6B", icon: "ban" },
  message: { color: "#B8FF00", icon: "comment" },
} as const;

export default function NotificationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile } = useAuth();
  const styles = getStyles(colors);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = profile?.id;

  useEffect(() => {
    if (!userId) return;

    console.log("🔔 Setting up notifications for user:", userId);
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
          console.log("🔄 Reloading notifications...");
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

      // Navigation logic based on notification type
      const matchTypes = [
        "match_invite",
        "match_joined",
        "match_left",
        "match_cancelled",
      ];

      if (matchTypes.includes(notification.type)) {
        // For match notifications, find the relevant reservation
        await handleMatchNotificationNavigation(notification);
      } else if (notification.actor_id) {
        // Navigate to player profile for follow/other notifications
        router.push(`/playerProfile?id=${notification.actor_id}`);
      }
    } catch (error) {
      console.error("Error handling notification press:", error);
    }
  };

  const handleMatchNotificationNavigation = async (
    notification: Notification,
  ) => {
    try {
      console.log(
        "🔍 Finding reservation for match notification:",
        notification.type,
      );

      // Find recent reservations involving the actor and current user
      const { data: reservations, error } = await supabase
        .from("court_reservations")
        .select("id, user_id, invited_players, created_at")
        .or(`user_id.eq.${userId},user_id.eq.${notification.actor_id}`)
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ) // Last 7 days
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error finding reservations:", error);
        // Fallback to player profile
        if (notification.actor_id) {
          router.push(`/playerProfile?id=${notification.actor_id}`);
        }
        return;
      }

      // Find the most relevant reservation
      let targetReservation = null;

      for (const reservation of reservations || []) {
        const isUserCreator = reservation.user_id === userId;
        const isActorCreator = reservation.user_id === notification.actor_id;
        const isUserInvited = reservation.invited_players?.includes(userId);
        const isActorInvited = reservation.invited_players?.includes(
          notification.actor_id,
        );

        // Logic based on notification type
        if (
          notification.type === "match_invite" &&
          isActorCreator &&
          isUserInvited
        ) {
          targetReservation = reservation;
          break;
        } else if (
          notification.type === "match_joined" &&
          isUserCreator &&
          isActorInvited
        ) {
          targetReservation = reservation;
          break;
        } else if (
          notification.type === "match_left" &&
          isUserCreator &&
          !isActorInvited
        ) {
          targetReservation = reservation;
          break;
        } else if (notification.type === "match_cancelled" && isActorCreator) {
          targetReservation = reservation;
          break;
        }
      }

      if (targetReservation) {
        console.log(
          "✅ Found reservation, navigating to match screen:",
          targetReservation.id,
        );
        router.replace(`/matchScreen?id=${targetReservation.id}`);
      } else {
        console.log(
          "❌ No matching reservation found, going to player profile",
        );
        if (notification.actor_id) {
          router.push(`/playerProfile?id=${notification.actor_id}`);
        }
      }
    } catch (error) {
      console.error("Error navigating from match notification:", error);
      // Fallback to player profile
      if (notification.actor_id) {
        router.push(`/playerProfile?id=${notification.actor_id}`);
      }
    }
  };

  const loadNotifications = async () => {
    try {
      console.log("🔄 Loading notifications...");

      // Use direct query instead of RPC to get all notification types
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          id,
          type,
          message,
          is_read,
          created_at,
          actor_id,
          actor:profiles!actor_id(
            full_name,
            avatar_url
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform data to match expected format
      const transformedData =
        data?.map((notification) => ({
          id: notification.id,
          type: notification.type,
          message: notification.message,
          is_read: notification.is_read,
          created_at: notification.created_at,
          actor_id: notification.actor_id,
          reservation_id: null, // Will be populated after SQL migration
          actor_name: notification.actor?.full_name || null,
          actor_avatar: notification.actor?.avatar_url || null,
        })) || [];

      console.log("📱 Loaded notifications:", transformedData.length);
      setNotifications(transformedData);
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
