import { FollowButton, IconButton } from "@/components";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { FollowerProfile } from "@/types/profile";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FollowingScreen() {
  const [following, setFollowing] = useState<FollowerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    if (userId && typeof userId === "string") {
      loadFollowing(userId);
    }
  }, [userId]);

  const loadFollowing = async (targetUserId: string, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      // Get current user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      // Query following with profile data
      const { data: followingData, error } = await supabase
        .from("followers")
        .select(
          `
          created_at,
          profiles!followers_following_id_fkey (
            id,
            full_name,
            avatar_url,
            followers_count,
            following_count
          )
        `,
        )
        .eq("follower_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Check which users the current user is following
      const followingIds =
        followingData?.map((f: any) => f.profiles.id).filter(Boolean) || [];

      let followingStatus: Record<string, boolean> = {};
      if (currentUserId && followingIds.length > 0) {
        const { data: statusData } = await supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", currentUserId)
          .in("following_id", followingIds);

        statusData?.forEach((f: any) => {
          followingStatus[f.following_id] = true;
        });
      }

      // Map to expected format
      const mappedFollowing: FollowerProfile[] =
        followingData?.map((item: any) => ({
          id: item.profiles.id,
          full_name: item.profiles.full_name,
          avatar_url: item.profiles.avatar_url,
          followers_count: item.profiles.followers_count || 0,
          following_count: item.profiles.following_count || 0,
          is_following: followingStatus[item.profiles.id] || false,
          followed_at: item.created_at,
        })) || [];

      setFollowing(mappedFollowing);
    } catch (error) {
      console.error("Error loading following:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (userId && typeof userId === "string") {
      loadFollowing(userId, true);
    }
  };

  const handleFollowChange = (
    followingUserId: string,
    isFollowing: boolean,
  ) => {
    // Update local state
    setFollowing((prev) =>
      prev.map((user) =>
        user.id === followingUserId
          ? { ...user, is_following: isFollowing }
          : user,
      ),
    );
  };

  const navigateToProfile = (followingId: string) => {
    router.push(`/(home)/playerProfile?id=${followingId}`);
  };

  const renderFollowing = ({ item }: { item: FollowerProfile }) => (
    <Pressable
      style={styles.followingItem}
      onPress={() => navigateToProfile(item.id)}
    >
      <View style={styles.followingInfo}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.full_name?.charAt(0) || "?"}
            </Text>
          </View>
        )}
        <View style={styles.followingDetails}>
          <Text style={styles.followingName}>
            {item.full_name || "Unknown"}
          </Text>
          <Text style={styles.followingStats}>
            {item.followers_count} pratioca · {item.following_count} praćenje
          </Text>
        </View>
      </View>
      <FollowButton
        userId={item.id}
        isFollowing={item.is_following}
        onFollowChange={(isFollowing) =>
          handleFollowChange(item.id, isFollowing)
        }
        variant="small"
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Praćenje</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : following.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ne pratite nikog</Text>
        </View>
      ) : (
        <FlatList
          data={following}
          renderItem={renderFollowing}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.refreshIndicator}
              colors={[colors.refreshIndicator]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    headerPlaceholder: {
      width: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: "center",
    },
    listContent: {
      paddingVertical: 12,
    },
    followingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.background,
    },
    followingInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 12,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },
    avatarPlaceholder: {
      backgroundColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    followingDetails: {
      flex: 1,
    },
    followingName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    followingUsername: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    followingStats: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
