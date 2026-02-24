import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { FollowStatus, Profile } from "@/types/profile";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FollowButton, IconButton } from "../../components";
import VersusMatchCard from "../../components/VersusMatchCard";
import { InfoCard, StatItem } from "../../components/playerProfile";

export default function PlayerProfileScreen() {
  const [activeTab, setActiveTab] = useState<"activity" | "info" | "stats">(
    "activity",
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, fonts } = useTheme();

  // Load profile and follow status from database
  useEffect(() => {
    if (id && typeof id === "string") {
      loadProfileData(id);
    }
  }, [id]);

  const loadProfileData = async (userId: string) => {
    try {
      setLoading(true);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load follow status
      const { data: statusData, error: statusError } = await supabase.rpc(
        "check_follow_status",
        { target_user_id: userId },
      );

      if (statusError) throw statusError;
      setFollowStatus(statusData);

      // Check if user is blocked
      const { data: blockedData, error: blockedError } = await supabase.rpc(
        "is_user_blocked",
        { target_user_id: userId },
      );

      if (!blockedError) {
        setIsBlocked(blockedData || false);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data without showing loading spinner (Instagram-style)
  const refreshProfileData = async (userId: string) => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load follow status
      const { data: statusData, error: statusError } = await supabase.rpc(
        "check_follow_status",
        { target_user_id: userId },
      );

      if (statusError) throw statusError;
      setFollowStatus(statusData);

      // Check if user is blocked
      const { data: blockedData, error: blockedError } = await supabase.rpc(
        "is_user_blocked",
        { target_user_id: userId },
      );

      if (!blockedError) {
        setIsBlocked(blockedData || false);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (id && typeof id === "string") {
      setRefreshing(true);
      await refreshProfileData(id);
    }
  };

  const handleFollowChange = (isFollowing: boolean) => {
    // Update follow status locally
    if (followStatus) {
      setFollowStatus({
        ...followStatus,
        is_following: isFollowing,
        followers_count: isFollowing
          ? followStatus.followers_count + 1
          : followStatus.followers_count - 1,
      });
    }
    // Refresh to get accurate counts (without loading spinner)
    if (id && typeof id === "string") {
      refreshProfileData(id);
    }
  };

  const handleBlockUser = async () => {
    if (!id || typeof id !== "string") return;

    try {
      const { data, error } = await supabase.rpc("block_user", {
        target_user_id: id,
        block_reason: "Blokiran iz profila",
      });

      if (error) throw error;

      if (data.success) {
        setIsBlocked(true);
        Alert.alert(
          "Uspešno",
          "Korisnik je blokiran. Možete ga odblokirti u Postavke → Privatnost i bezbednost → Blokirani korisnici.",
        );
      } else {
        Alert.alert("Greška", data.error || "Nije moguće blokirti korisnika");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      Alert.alert("Greška", "Nije moguće blokirti korisnika");
    }
  };

  const handleUnblockUser = async () => {
    if (!id || typeof id !== "string") return;

    try {
      const { data, error } = await supabase.rpc("unblock_user", {
        target_user_id: id,
      });

      if (error) throw error;

      if (data.success) {
        setIsBlocked(false);
        Alert.alert("Uspešno", "Korisnik je odblokiran");
      } else {
        Alert.alert("Greška", data.error || "Nije moguće odblokirti korisnika");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      Alert.alert("Greška", "Nije moguće odblokirti korisnika");
    }
  };

  const handleMessagePress = async () => {
    if (!id || typeof id !== "string" || !profile) return;

    try {
      // Get or create chat with this user
      const { data: chatId, error } = await supabase.rpc("get_or_create_chat", {
        other_user_id: id,
      });

      if (error) throw error;

      // Navigate to chat screen with user info
      router.push({
        pathname: "/(home)/chat",
        params: {
          chatId: chatId,
          otherUserId: id,
          name: profile.full_name || "Unknown",
          avatar: profile.avatar_url || "https://i.pravatar.cc/150?img=1",
        },
      });
    } catch (error) {
      console.error("Error opening chat:", error);
      Alert.alert("Greška", "Nije moguće otvoriti chat");
    }
  };

  const handleOptionsPress = () => {
    const blockOption = isBlocked
      ? {
          text: "Odblokiraj korisnika",
          onPress: () => {
            Alert.alert(
              "Odblokiraj korisnika",
              "Da li ste sigurni da želite da odblokirate " +
                (profile?.full_name || "ovog korisnika") +
                "?",
              [
                { text: "Otkaži", style: "cancel" },
                {
                  text: "Odblokiraj",
                  onPress: handleUnblockUser,
                },
              ],
            );
          },
        }
      : {
          text: "Blokiraj korisnika",
          onPress: () => {
            Alert.alert(
              "Blokiraj korisnika",
              "Da li ste sigurni da želite da blokirate " +
                (profile?.full_name || "ovog korisnika") +
                "?",
              [
                { text: "Otkaži", style: "cancel" },
                {
                  text: "Blokiraj",
                  style: "destructive",
                  onPress: handleBlockUser,
                },
              ],
            );
          },
          style: "destructive" as const,
        };

    Alert.alert("Opcije", "Izaberite akciju", [
      blockOption,
      {
        text: "Otkaži",
        style: "cancel",
      },
    ]);
  };

  const styles = createStyles(colors, fonts);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state - profile not found
  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Igrač nije pronađen</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate user age from birth_date
  const userAge = profile.birth_date
    ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
    : null;

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
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="chevron-left" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Profil igrača</Text>
          <IconButton icon="ellipsis-v" onPress={handleOptionsPress} />
        </View>

        {/* Profile Image & Match Percentage */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: profile.avatar_url || "https://i.pravatar.cc/150?img=47",
              }}
              style={styles.profileImage}
            />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                {profile.rating?.toFixed(1) || "0.0"}
              </Text>
            </View>
            <View style={styles.matchCircle}>
              <Text style={styles.matchPercentage}>
                {profile.win_rate?.toFixed(0) || "0"}%
              </Text>
            </View>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.name}>{profile.full_name || "Korisnik"}</Text>

        {/* Username & Info */}
        <Text style={styles.userInfo}>
          @{profile.username || profile.email?.split("@")[0] || "user"}
          {userAge && " · " + userAge + " god"} · {profile.location || "Srbija"}
        </Text>

        {/* Bio */}
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>
            {profile.full_name || "Korisnik"} igra na ovoj platformi.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatItem
            number={profile.matches_played || 0}
            label="Mečevi"
            onPress={() => {
              // TODO: Navigate to matches list
            }}
          />
          <StatItem
            number={followStatus?.followers_count || 0}
            label="Pratioci"
            onPress={() => {
              router.push(`/(home)/followers?userId=${profile.id}`);
            }}
          />
          <StatItem
            number={followStatus?.following_count || 0}
            label="Praćenje"
            onPress={() => {
              router.push(`/(home)/following?userId=${profile.id}`);
            }}
          />
        </View>

        {/* Action Buttons */}
        {!followStatus?.is_own_profile && (
          <>
            {followStatus?.is_private && !followStatus?.can_view_profile ? (
              // Private profile: Show only Follow button (full width)
              <View style={styles.privateFollowButton}>
                <FollowButton
                  userId={profile.id}
                  isFollowing={followStatus?.is_following || false}
                  onFollowChange={handleFollowChange}
                  variant="default"
                />
              </View>
            ) : (
              // Public profile or already following: Show both buttons
              <View style={styles.actionButtons}>
                <View style={styles.buttonHalf}>
                  <FollowButton
                    userId={profile.id}
                    isFollowing={followStatus?.is_following || false}
                    onFollowChange={handleFollowChange}
                    variant="default"
                  />
                </View>
                <View style={styles.buttonHalf}>
                  <Pressable
                    style={styles.playButton}
                    onPress={handleMessagePress}
                  >
                    <FontAwesome name="comment" size={14} color="#111111" />
                    <Text style={styles.playButtonText}>Poruka</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        )}

        {/* Private Profile Placeholder */}
        {followStatus?.is_private && !followStatus?.can_view_profile && (
          <View style={styles.privateProfileContainer}>
            <FontAwesome name="lock" size={48} color={colors.textSecondary} />
            <Text style={styles.privateProfileTitle}>Privatni profil</Text>
            <Text style={styles.privateProfileText}>
              Ovaj profil je privatan. Pratite ovog korisnika da biste videli
              njegov sadržaj.
            </Text>
          </View>
        )}

        {/* Content - Only show if can view profile */}
        {(!followStatus?.is_private || followStatus?.can_view_profile) && (
          <>
            {/* Sports Tags */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sportsScroll}
              contentContainerStyle={styles.sportsContent}
            >
              <View style={[styles.sportTag, styles.sportTagActive]}>
                <Text style={styles.sportTagTextActive}>
                  Tenis {profile.rating?.toFixed(1) || "0.0"}
                </Text>
              </View>
            </ScrollView>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <Pressable
                style={[
                  styles.tab,
                  activeTab === "activity" && styles.tabActive,
                ]}
                onPress={() => setActiveTab("activity")}
              >
                <Text
                  style={
                    activeTab === "activity"
                      ? styles.tabActiveText
                      : styles.tabText
                  }
                >
                  Aktivnost
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === "info" && styles.tabActive]}
                onPress={() => setActiveTab("info")}
              >
                <Text
                  style={
                    activeTab === "info" ? styles.tabActiveText : styles.tabText
                  }
                >
                  Lični podaci
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === "stats" && styles.tabActive]}
                onPress={() => setActiveTab("stats")}
              >
                <Text
                  style={
                    activeTab === "stats"
                      ? styles.tabActiveText
                      : styles.tabText
                  }
                >
                  Istorija mečeva
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Tab Content - Only show if can view profile */}
        {(!followStatus?.is_private || followStatus?.can_view_profile) && (
          <>
            {activeTab === "activity" ? (
              <View style={styles.activityList}>
                {/* Empty state for no activities */}
                <View style={styles.emptyState}>
                  <FontAwesome
                    name="inbox"
                    size={48}
                    color={colors.textSecondary}
                    style={{ marginBottom: 16 }}
                  />
                  <Text style={styles.emptyStateTitle}>Nema aktivnosti</Text>
                  <Text style={styles.emptyStateText}>
                    Korisnik još uvek nema nikakvu aktivnost
                  </Text>
                </View>
              </View>
            ) : activeTab === "info" ? (
              <View style={styles.infoSection}>
                <View style={styles.infoGrid}>
                  <InfoCard
                    icon="hand-pointer-o"
                    title="Dominantna ruka"
                    value="Desna"
                    subtitle="Backhand dvema rukama"
                  />
                  <InfoCard
                    icon="map-marker"
                    title="Pozicija"
                    value="Univerzalna"
                    subtitle="Sve pozicije"
                  />
                </View>

                <View style={styles.infoGrid}>
                  <InfoCard
                    icon="line-chart"
                    title="Procenat pobeda"
                    value={`${profile.win_rate?.toFixed(0) || "0"}%`}
                    subtitle={`Od ukupno ${profile.matches_played || 0} mečeva`}
                    variant="small"
                  />
                  <InfoCard
                    icon="calendar"
                    title="Odigrani mečevi"
                    value={`${profile.matches_played || 0}`}
                    subtitle={`Rejting: ${profile.rating?.toFixed(1) || "0.0"}`}
                    variant="small"
                  />
                </View>

                <InfoCard
                  icon="area-chart"
                  title="Forma"
                  value="Stabilna"
                  subtitle="Trenutni učinak"
                  variant="wide"
                  badge={`${profile.win_rate && profile.win_rate > 50 ? "+" : ""}${profile.win_rate?.toFixed(0) || "0"}%`}
                >
                  <View style={styles.infoDots}>
                    {Array.from({ length: 24 }).map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.infoDot,
                          index % 6 === 0 && styles.infoDotActive,
                        ]}
                      />
                    ))}
                  </View>
                </InfoCard>

                <InfoCard
                  icon="bullseye"
                  title="Statistika servisa"
                  variant="wide"
                >
                  <View style={styles.infoRowBetween}>
                    <Text style={styles.infoValue}>Asovi</Text>
                    <Text style={styles.infoValue}>-</Text>
                  </View>
                  <View style={styles.infoRowBetween}>
                    <Text style={styles.infoValue}>Dvostruke greške</Text>
                    <Text style={styles.infoValue}>-</Text>
                  </View>
                  <View style={styles.infoRowBetween}>
                    <Text style={styles.infoValue}>Prvi servis</Text>
                    <Text style={styles.infoValue}>-</Text>
                  </View>
                </InfoCard>

                <InfoCard icon="tags" title="Stil igre" variant="wide">
                  <View style={styles.infoTags}>
                    <View style={styles.infoTag}>
                      <Text style={styles.infoTagText}>Univerzalan</Text>
                    </View>
                  </View>
                </InfoCard>
              </View>
            ) : activeTab === "stats" ? (
              <View style={styles.historyList}>
                {[
                  {
                    id: "1",
                    type: "ZAVRŠEN MEČ",
                    time: "15:00",
                    date: "Sri, 2. feb",
                    club: profile.location || "Teniski klub",
                    matchType: "2v2" as const,
                    teamA: [
                      {
                        name: profile.full_name || "User",
                        avatar: profile.avatar_url || undefined,
                        level: profile.rating?.toFixed(1) || "0.0",
                      },
                      {
                        name: "Partner",
                        level: "1.2",
                      },
                    ],
                    teamB: [
                      {
                        name: "Protivnik 1",
                        level: "1.1",
                      },
                      {
                        name: "Protivnik 2",
                        level: "1.3",
                      },
                    ],
                    score: "6:4, 6:3",
                    duration: "1h 30min",
                    isFinished: true,
                    gameMode: "competitive" as const,
                  },
                  {
                    id: "2",
                    type: "ZAVRŠEN MEČ",
                    time: "18:00",
                    date: "Čet, 3. feb",
                    club: profile.location || "Teniski klub",
                    matchType: "2v2" as const,
                    teamA: [
                      {
                        name: profile.full_name || "User",
                        avatar: profile.avatar_url || undefined,
                        level: profile.rating?.toFixed(1) || "0.0",
                      },
                      {
                        name: "Partner",
                        level: "1.1",
                      },
                    ],
                    teamB: [
                      {
                        name: "Protivnik 3",
                        level: "1.4",
                      },
                      {
                        name: "Protivnik 4",
                        level: "1.2",
                      },
                    ],
                    score: "4:6, 7:6, 3:6",
                    duration: "2h 15min",
                    isFinished: true,
                    gameMode: "friendly" as const,
                  },
                  {
                    id: "3",
                    type: "ZAVRŠEN MEČ",
                    time: "20:00",
                    date: "Pet, 4. feb",
                    club: profile.location || "Sportski centar",
                    matchType: "2v2" as const,
                    teamA: [
                      {
                        name: profile.full_name || "User",
                        avatar: profile.avatar_url || undefined,
                        level: profile.rating?.toFixed(1) || "0.0",
                      },
                      {
                        name: "Partner",
                        level: "1.3",
                      },
                    ],
                    teamB: [
                      {
                        name: "Protivnik 5",
                        level: "1.0",
                      },
                      {
                        name: "Protivnik 6",
                        level: "1.2",
                      },
                    ],
                    score: "6:2, 6:1",
                    duration: "1h 45min",
                    isFinished: true,
                    gameMode: "competitive" as const,
                  },
                ].map((match) => (
                  <VersusMatchCard key={match.id} {...match} fullWidth />
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, fonts: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 50,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      color: colors.text,
      fontSize: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    profileSection: {
      alignItems: "center",
      marginBottom: 20,
    },
    profileImageContainer: {
      position: "relative",
    },
    profileImage: {
      width: 140,
      height: 140,
      borderRadius: 70,
    },
    levelBadge: {
      position: "absolute",
      top: 0,
      left: 0,
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    levelText: {
      color: "#111111",
      fontSize: 14,
      fontWeight: "700",
    },
    matchCircle: {
      position: "absolute",
      right: -20,
      top: 20,
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "#1E1F23",
      borderWidth: 2,
      borderColor: "#B8FF00",
      alignItems: "center",
      justifyContent: "center",
    },
    matchPercentage: {
      color: "#B8FF00",
      fontSize: 20,
      fontWeight: "700",
    },
    name: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 8,
    },
    userInfo: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      marginBottom: 20,
    },
    bioSection: {
      marginBottom: 28,
    },
    bioText: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 8,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 28,
      paddingVertical: 20,
    },
    privateFollowButton: {
      marginBottom: 28,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 28,
    },
    buttonHalf: {
      flex: 1,
    },
    followingButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 24,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.accent,
    },
    followingButtonText: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: "600",
    },
    playButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 24,
      backgroundColor: colors.accent,
    },
    playButtonText: {
      color: "#111111",
      fontSize: 16,
      fontWeight: "600",
    },
    sportsScroll: {
      marginHorizontal: -20,
      marginBottom: 28,
    },
    sportsContent: {
      paddingHorizontal: 20,
      gap: 12,
    },
    sportTag: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    sportTagActive: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.cardBackground,
    },
    sportTagText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    sportTagTextActive: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    tabsContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 24,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
    },
    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.text,
    },
    tabActiveText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    tabText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    postList: {
      gap: 16,
    },
    postCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
    },
    postHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    postAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.border,
    },
    postHeaderText: {
      flex: 1,
      marginLeft: 12,
    },
    postName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    postMeta: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    postImage: {
      width: "100%",
      height: 220,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    postActions: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    postActionsLeft: {
      flexDirection: "row",
      gap: 16,
    },
    postLikes: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
      marginTop: 10,
    },
    postCaption: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 6,
    },
    postCaptionName: {
      color: colors.text,
      fontWeight: "600",
    },
    infoSection: {
      gap: 16,
    },
    infoGrid: {
      flexDirection: "row",
      gap: 12,
    },
    infoRowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    infoValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    infoDots: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    infoDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    infoDotActive: {
      backgroundColor: colors.text,
    },
    infoTags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    infoTag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },
    infoTagText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    historyList: {
      paddingTop: 8,
    },
    activityList: {
      gap: 12,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyStateTitle: {
      color: colors.text,
      fontSize: 18,
      fontFamily: fonts.semiBold,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyStateText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontFamily: fonts.regular,
      textAlign: "center",
      lineHeight: 20,
    },
    contentPlaceholder: {
      padding: 40,
      alignItems: "center",
    },
    placeholderText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    privateProfileContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      paddingHorizontal: 20,
      marginTop: 20,
      marginBottom: 40,
    },
    privateProfileTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
      marginTop: 16,
      marginBottom: 8,
    },
    privateProfileText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
    },
  });
