import { ClubFollowButton, FollowButton, IconButton } from "@/components";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { FollowingItem } from "@/types/profile";
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
  const [following, setFollowing] = useState<FollowingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const { userId, clubId } = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const isClub = !!clubId;

  useEffect(() => {
    if (userId && typeof userId === "string") {
      loadFollowing(userId);
    } else if (clubId && typeof clubId === "string") {
      loadClubFollowing(clubId);
    }
  }, [userId, clubId]);

  const loadFollowing = async (targetUserId: string, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      // Get current user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const currentUserIdTemp = user?.id;
      setCurrentUserId(currentUserIdTemp || null);

      // 1. Query user followings
      const { data: userFollowingData, error: userError } = await supabase
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

      if (userError) throw userError;

      // 2. Query club followings (get club IDs first)
      const { data: clubFollowsData, error: clubFollowsError } = await supabase
        .from("club_follows")
        .select("club_id, created_at")
        .eq("follower_id", targetUserId)
        .eq("follower_type", "user")
        .order("created_at", { ascending: false })
        .limit(50);

      if (clubFollowsError) {
        console.error("Error loading club follows:", clubFollowsError);
      }

      // 3. Fetch club details separately
      let clubFollowingData: any[] = [];
      if (clubFollowsData && clubFollowsData.length > 0) {
        const clubIds = clubFollowsData.map((f) => f.club_id);
        const { data: clubsData, error: clubsError } = await supabase
          .from("clubs")
          .select(
            "id, name, image, address, courts, followers_count, following_count",
          )
          .in("id", clubIds);

        if (clubsError) {
          console.error("Error loading clubs:", clubsError);
        } else if (clubsData) {
          // Merge club data with created_at from club_follows
          clubFollowingData = clubFollowsData
            .map((follow) => {
              const club = clubsData.find((c) => c.id === follow.club_id);
              return {
                created_at: follow.created_at,
                clubs: club,
              };
            })
            .filter((item) => item.clubs); // Filter out any missing clubs
        }
      }

      // 4. Check which users the current user is following
      const userFollowingIds =
        userFollowingData?.map((f: any) => f.profiles.id).filter(Boolean) || [];

      let userFollowingStatus: Record<string, boolean> = {};
      if (currentUserIdTemp && userFollowingIds.length > 0) {
        const { data: statusData } = await supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", currentUserIdTemp)
          .in("following_id", userFollowingIds);

        statusData?.forEach((f: any) => {
          userFollowingStatus[f.following_id] = true;
        });
      }

      // Check which clubs the current user is following
      const clubFollowingIds =
        clubFollowingData?.map((f: any) => f.clubs.id).filter(Boolean) || [];

      let clubFollowingStatus: Record<string, boolean> = {};
      if (currentUserIdTemp && clubFollowingIds.length > 0) {
        const { data: statusData } = await supabase
          .from("club_follows")
          .select("club_id")
          .eq("follower_id", currentUserIdTemp)
          .eq("follower_type", "user")
          .in("club_id", clubFollowingIds);

        statusData?.forEach((f: any) => {
          clubFollowingStatus[f.club_id] = true;
        });
      }

      // Map users to FollowingItem format
      const mappedUsers: FollowingItem[] =
        userFollowingData?.map((item: any) => ({
          id: item.profiles.id,
          type: "user" as const,
          full_name: item.profiles.full_name,
          avatar_url: item.profiles.avatar_url,
          followers_count: item.profiles.followers_count || 0,
          following_count: item.profiles.following_count || 0,
          is_following: userFollowingStatus[item.profiles.id] || false,
          followed_at: item.created_at,
        })) || [];

      // Map clubs to FollowingItem format
      const mappedClubs: FollowingItem[] =
        clubFollowingData?.map((item: any) => ({
          id: item.clubs.id,
          type: "club" as const,
          full_name: item.clubs.name,
          avatar_url: item.clubs.image,
          followers_count: item.clubs.followers_count || 0,
          following_count: item.clubs.following_count || 0,
          is_following: clubFollowingStatus[item.clubs.id] || false,
          followed_at: item.created_at,
          club_info: {
            address: item.clubs.address,
            courts: item.clubs.courts,
          },
        })) || [];

      // Combine and sort by followed_at
      const allFollowing = [...mappedUsers, ...mappedClubs].sort(
        (a, b) =>
          new Date(b.followed_at).getTime() - new Date(a.followed_at).getTime(),
      );

      setFollowing(allFollowing);
    } catch (error) {
      console.error("Error loading following:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadClubFollowing = async (targetClubId: string, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      // Convert clubId to UUID format if needed
      const clubUuid =
        targetClubId.length < 36
          ? `00000000-0000-0000-0000-${targetClubId.padStart(12, "0")}`
          : targetClubId;

      // Get current user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const currentUserIdTemp = user?.id;
      setCurrentUserId(currentUserIdTemp || null);

      // Query what this club is following (club_follows where follower_id = clubId and follower_type = 'club')
      const { data: clubFollowingData, error: clubFollowingError } =
        await supabase
          .from("club_follows")
          .select("club_id, created_at")
          .eq("follower_id", clubUuid)
          .eq("follower_type", "club")
          .order("created_at", { ascending: false })
          .limit(50);

      if (clubFollowingError) {
        console.error("Error loading club following:", clubFollowingError);
      }

      // Fetch details of clubs/users this club is following
      let followingItems: FollowingItem[] = [];
      if (clubFollowingData && clubFollowingData.length > 0) {
        const targetIds = clubFollowingData.map((f) => f.club_id);

        // Try fetching as clubs first
        const { data: clubsData } = await supabase
          .from("clubs")
          .select(
            "id, name, image, address, courts, followers_count, following_count",
          )
          .in("id", targetIds);

        // Try fetching as users
        const { data: usersData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, followers_count, following_count")
          .in("id", targetIds);

        // Check which ones current user is following
        let userFollowingStatus: Record<string, boolean> = {};
        let clubFollowingStatus: Record<string, boolean> = {};

        if (currentUserIdTemp && (usersData?.length || clubsData?.length)) {
          if (usersData?.length) {
            const userIds = usersData.map((u) => u.id);
            const { data: followingData } = await supabase
              .from("followers")
              .select("following_id")
              .eq("follower_id", currentUserIdTemp)
              .in("following_id", userIds);
            followingData?.forEach((f: any) => {
              userFollowingStatus[f.following_id] = true;
            });
          }

          if (clubsData?.length) {
            const clubIds = clubsData.map((c) => c.id);
            const { data: followingData } = await supabase
              .from("club_follows")
              .select("club_id")
              .eq("follower_id", currentUserIdTemp)
              .eq("follower_type", "user")
              .in("club_id", clubIds);
            followingData?.forEach((f: any) => {
              clubFollowingStatus[f.club_id] = true;
            });
          }
        }

        // Map users
        const mappedUsers: FollowingItem[] = (usersData || []).map((user) => {
          const follow = clubFollowingData.find((f) => f.club_id === user.id);
          return {
            id: user.id,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            followers_count: user.followers_count || 0,
            following_count: user.following_count || 0,
            is_following: userFollowingStatus[user.id] || false,
            followed_at: follow?.created_at || new Date().toISOString(),
            type: "user",
          };
        });

        // Map clubs
        const mappedClubs: FollowingItem[] = (clubsData || []).map((club) => {
          const follow = clubFollowingData.find((f) => f.club_id === club.id);
          return {
            id: club.id,
            full_name: club.name,
            avatar_url: club.image,
            followers_count: club.followers_count || 0,
            following_count: club.following_count || 0,
            is_following: clubFollowingStatus[club.id] || false,
            followed_at: follow?.created_at || new Date().toISOString(),
            type: "club",
            club_info: {
              address: club.address,
              courts: club.courts,
            },
          };
        });

        followingItems = [...mappedUsers, ...mappedClubs].sort(
          (a, b) =>
            new Date(b.followed_at).getTime() -
            new Date(a.followed_at).getTime(),
        );
      }

      setFollowing(followingItems);
    } catch (error) {
      console.error("Error loading club following:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (userId && typeof userId === "string") {
      loadFollowing(userId, true);
    } else if (clubId && typeof clubId === "string") {
      loadClubFollowing(clubId, true);
    }
  };

  const handleFollowChange = (
    followingUserId: string,
    isFollowing: boolean,
  ) => {
    if (!isFollowing) {
      // Remove from list when unfollowed
      setFollowing((prev) =>
        prev.filter((user) => user.id !== followingUserId),
      );
    } else {
      // Update local state when followed
      setFollowing((prev) =>
        prev.map((user) =>
          user.id === followingUserId
            ? { ...user, is_following: isFollowing }
            : user,
        ),
      );
    }
  };

  const navigateToProfile = (item: FollowingItem) => {
    if (item.type === "club") {
      router.push(`/(home)/clubProfile?id=${item.id}`);
    } else {
      router.push(`/(home)/playerProfile?id=${item.id}`);
    }
  };

  const renderFollowing = ({ item }: { item: FollowingItem }) => (
    <Pressable
      style={styles.followingItem}
      onPress={() => navigateToProfile(item)}
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
          {item.type === "club" && item.club_info ? (
            <Text style={styles.followingStats}>
              {item.club_info.courts || 0} terena
              {item.club_info.address
                ? ` · ${item.club_info.address.split(",")[0]}`
                : ""}
            </Text>
          ) : (
            <Text style={styles.followingStats}>
              {item.followers_count} pratioca · {item.following_count} praćenje
            </Text>
          )}
        </View>
      </View>
      {item.type === "club" ? (
        <ClubFollowButton
          clubId={item.id}
          isFollowing={item.is_following}
          onFollowChange={(isFollowing) =>
            handleFollowChange(item.id, isFollowing)
          }
          variant="small"
        />
      ) : (
        currentUserId !== item.id && (
          <FollowButton
            userId={item.id}
            isFollowing={item.is_following}
            onFollowChange={(isFollowing) =>
              handleFollowChange(item.id, isFollowing)
            }
            variant="small"
          />
        )
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <IconButton icon="chevron-left" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>
          {isClub ? "Praćenje kluba" : "Praćenje"}
        </Text>
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
      paddingHorizontal: 10,
      paddingVertical: 10,
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
