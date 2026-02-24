import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, IconButton } from "../../../components";
import VersusMatchCard from "../../../components/VersusMatchCard";
import { PROFILE_INFO_STATS, PROFILE_POSTS } from "../../../constants/data";
import { useTheme } from "../../../contexts/ThemeContext";

export default function ProfileScreen() {
  const { colors, isDark, fonts } = useTheme();
  const { profile, refreshProfile } = useAuth();
  const styles = getStyles(colors, isDark, fonts);
  const accentColor = isDark ? "#B8FF00" : colors.blue;
  const [activeTab, setActiveTab] = useState<"activity" | "info" | "stats">(
    "activity",
  );
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // Load unread notifications count
  useEffect(() => {
    if (!profile?.id) return;

    loadUnreadCount();

    // Real-time subscription
    const channel = supabase
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          console.log("🔔 New notification received!");
          loadUnreadCount();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          console.log("✅ Notification marked as read!");
          loadUnreadCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const loadUnreadCount = async () => {
    try {
      const { data, error } = await supabase.rpc(
        "get_unread_notifications_count",
      );

      if (error) throw error;
      setUnreadCount(data || 0);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    console.log(
      "🔄 Profile refresh - refreshIndicator:",
      colors.refreshIndicator,
    );
    await Promise.all([refreshProfile(), loadUnreadCount()]);
    setRefreshing(false);
  };

  // Fallback values if profile not loaded
  const userName = profile?.full_name || "Korisnik";
  const userLocation = profile?.location || "Srbija";
  const userAge = profile?.birth_date
    ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
    : null;
  const userAvatar = profile?.avatar_url || "https://i.pravatar.cc/150?img=47";
  const userRating = profile?.rating?.toFixed(1) || "0.0";
  const userMatches = profile?.matches_played || 0;
  const userWinRate = profile?.win_rate?.toFixed(0) || "0";
  const userFollowers = profile?.followers_count || 0;
  const userFollowing = profile?.following_count || 0;

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
          <Image
            source={require("../../../assets/logo/home-icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.headerActions}>
            <View>
              <IconButton
                icon="bell"
                onPress={() => router.push("/notification")}
              />
              {unreadCount > 0 && <Badge count={unreadCount} />}
            </View>
            <IconButton icon="bars" onPress={() => router.push("/menu")} />
          </View>
        </View>

        {/* Profile Image & Match Percentage */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: userAvatar }} style={styles.profileImage} />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userRating}</Text>
            </View>
            <View style={styles.matchCircle}>
              <Text style={styles.matchPercentage}>{userWinRate}%</Text>
            </View>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.name}>{userName}</Text>

        {/* Username & Info */}
        <Text style={styles.userInfo}>
          @{profile?.email?.split("@")[0] || "user"}
          {userAge ? ` · ${userAge} god` : ""} · {userLocation}
        </Text>

        {/* Bio */}
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>
            Strastveni padel igrač koji voli competitive mečeve i druženje na
            terenu. 🎾
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Pressable
            style={styles.statItem}
            onPress={() => {
              // TODO: Navigate to matches list
            }}
          >
            <Text style={styles.statNumber}>{userMatches}</Text>
            <Text style={styles.statLabel}>Mečevi</Text>
          </Pressable>
          <Pressable
            style={styles.statItem}
            onPress={() => {
              if (profile?.id) {
                router.push(`/(home)/followers?userId=${profile.id}`);
              }
            }}
          >
            <Text style={styles.statNumber}>{userFollowers}</Text>
            <Text style={styles.statLabel}>Pratioci</Text>
          </Pressable>
          <Pressable
            style={styles.statItem}
            onPress={() => {
              if (profile?.id) {
                router.push(`/(home)/following?userId=${profile.id}`);
              }
            }}
          >
            <Text style={styles.statNumber}>{userFollowing}</Text>
            <Text style={styles.statLabel}>Praćenje</Text>
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.buttonHalf}>
            <Pressable
              style={styles.followingButton}
              onPress={() => router.push("/menu")}
            >
              <FontAwesome name="cog" size={16} color={accentColor} />
              <Text style={styles.followingButtonText}>Podešavanja</Text>
            </Pressable>
          </View>
          <View style={styles.buttonHalf}>
            <Pressable
              style={styles.playButton}
              onPress={() => router.push("/(home)/createMatchNew")}
            >
              <FontAwesome
                name="play"
                size={14}
                color={isDark ? "#111111" : "#FFFFFF"}
              />
              <Text style={styles.playButtonText}>Igraj</Text>
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === "activity" && styles.tabActive]}
            onPress={() => setActiveTab("activity")}
          >
            <Text
              style={
                activeTab === "activity" ? styles.tabActiveText : styles.tabText
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
                activeTab === "stats" ? styles.tabActiveText : styles.tabText
              }
            >
              Istorija mečeva
            </Text>
          </Pressable>
        </View>

        {activeTab === "activity" ? (
          <View style={styles.postList}>
            {PROFILE_POSTS.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome
                  name="image"
                  size={48}
                  color={colors.textSecondary}
                  style={{ marginBottom: 16 }}
                />
                <Text style={styles.emptyStateTitle}>Nema aktivnosti</Text>
                <Text style={styles.emptyStateText}>
                  Podelite svoje mečeve i fotografije sa zajednicom
                </Text>
                <Pressable
                  style={styles.emptyStateButton}
                  onPress={() => {
                    // TODO: Navigate to create post screen
                    console.log("Create new post");
                  }}
                >
                  <FontAwesome
                    name="plus"
                    size={16}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.emptyStateButtonText}>
                    Dodajte novi post
                  </Text>
                </Pressable>
              </View>
            ) : (
              PROFILE_POSTS.map((post, index) => (
                <View key={index} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.postAvatar} />
                    <View style={styles.postHeaderText}>
                      <Text style={styles.postName}>{post.name}</Text>
                      <Text style={styles.postMeta}>{post.meta}</Text>
                    </View>
                    <FontAwesome
                      name="ellipsis-h"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </View>

                  <Image
                    source={{
                      uri: post.image,
                    }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />

                  <View style={styles.postActions}>
                    <View style={styles.postActionsLeft}>
                      <FontAwesome
                        name="heart-o"
                        size={18}
                        color={colors.text}
                      />
                      <FontAwesome
                        name="comment-o"
                        size={18}
                        color={colors.text}
                      />
                      <FontAwesome
                        name="paper-plane-o"
                        size={18}
                        color={colors.text}
                      />
                    </View>
                    <FontAwesome
                      name="bookmark-o"
                      size={18}
                      color={colors.text}
                    />
                  </View>

                  <Text style={styles.postLikes}>{post.likes}</Text>
                  <Text style={styles.postCaption}>
                    <Text style={styles.postCaptionName}>@agarcia</Text>{" "}
                    {post.caption}
                  </Text>
                </View>
              ))
            )}
          </View>
        ) : activeTab === "info" ? (
          <View style={styles.infoSection}>
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoTitleRow}>
                  <FontAwesome
                    name="hand-pointer-o"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.infoTitle}>Dominantna ruka</Text>
                </View>
                <Text style={styles.infoValue}>
                  {PROFILE_INFO_STATS.dominantHand.value}
                </Text>
                <Text style={styles.infoSub}>
                  {PROFILE_INFO_STATS.dominantHand.sub}
                </Text>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.infoTitleRow}>
                  <FontAwesome
                    name="map-marker"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.infoTitle}>Pozicija</Text>
                </View>
                <Text style={styles.infoValue}>
                  {PROFILE_INFO_STATS.position.value}
                </Text>
                <Text style={styles.infoSub}>
                  {PROFILE_INFO_STATS.position.sub}
                </Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoCardSmall}>
                <View style={styles.infoTitleRow}>
                  <FontAwesome
                    name="line-chart"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.infoTitle}>Procenat pobeda</Text>
                </View>
                <Text style={styles.infoValueLarge}>
                  {PROFILE_INFO_STATS.winPercentage.value}
                </Text>
                <Text style={styles.infoSub}>
                  {PROFILE_INFO_STATS.winPercentage.sub}
                </Text>
              </View>
              <View style={styles.infoCardSmall}>
                <View style={styles.infoTitleRow}>
                  <FontAwesome
                    name="calendar"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.infoTitle}>Odigrani mečevi</Text>
                </View>
                <Text style={styles.infoValueLarge}>
                  {PROFILE_INFO_STATS.matchesPlayed.value}
                </Text>
                <Text style={styles.infoSub}>
                  {PROFILE_INFO_STATS.matchesPlayed.sub}
                </Text>
              </View>
            </View>

            <View style={styles.infoCardWide}>
              <View style={styles.infoRowBetween}>
                <View>
                  <View style={styles.infoTitleRow}>
                    <FontAwesome
                      name="area-chart"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.infoTitle}>Forma</Text>
                  </View>
                  <Text style={styles.infoValue}>Stabilna</Text>
                </View>
                <Text style={styles.infoBadge}>+8%</Text>
              </View>
              <Text style={styles.infoSub}>U odnosu na prošli mesec</Text>
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
            </View>

            <View style={styles.infoCardWide}>
              <View style={styles.infoTitleRow}>
                <FontAwesome
                  name="bullseye"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.infoTitle}>Statistika servisa</Text>
              </View>
              <View style={styles.infoRowBetween}>
                <Text style={styles.infoValue}>Asovi</Text>
                <Text style={styles.infoValue}>18</Text>
              </View>
              <View style={styles.infoRowBetween}>
                <Text style={styles.infoValue}>Dvostruke greške</Text>
                <Text style={styles.infoValue}>6</Text>
              </View>
              <View style={styles.infoRowBetween}>
                <Text style={styles.infoValue}>Prvi servis</Text>
                <Text style={styles.infoValue}>71%</Text>
              </View>
            </View>

            <View style={styles.infoCardWide}>
              <View style={styles.infoTitleRow}>
                <FontAwesome
                  name="tags"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.infoTitle}>Stil igre</Text>
              </View>
              <View style={styles.infoTags}>
                <View style={styles.infoTag}>
                  <Text style={styles.infoTagText}>Agresivan</Text>
                </View>
                <View style={styles.infoTag}>
                  <Text style={styles.infoTagText}>Kontranapad</Text>
                </View>
                <View style={styles.infoTag}>
                  <Text style={styles.infoTagText}>Brz tempo</Text>
                </View>
              </View>
            </View>
          </View>
        ) : activeTab === "stats" ? (
          <View style={styles.historyList}>
            {[
              {
                id: "1",
                type: "ZAVRŠEN MEČ",
                time: "15:00",
                date: "Sri, 2. feb",
                club: "Polideportivo de la Concepción",
                matchType: "2v2" as const,
                teamA: [
                  {
                    name: profile?.full_name || "Alejandra",
                    avatar: profile?.avatar_url,
                    level: "1.1",
                  },
                  {
                    name: "Marija",
                    level: "1.2",
                  },
                ],
                teamB: [
                  {
                    name: "JR. Sara",
                    level: "1.0",
                  },
                  {
                    name: "Pedro",
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
                club: "Club de Tenis La Moraleja",
                matchType: "2v2" as const,
                teamA: [
                  {
                    name: profile?.full_name || "Alejandra",
                    avatar: profile?.avatar_url,
                    level: "2.0",
                  },
                  {
                    name: "Emma",
                    level: "1.8",
                  },
                ],
                teamB: [
                  {
                    name: "Carlos",
                    level: "2.1",
                  },
                  {
                    name: "Luis",
                    level: "1.9",
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
                club: "Pádel Indoor Centro",
                matchType: "2v2" as const,
                teamA: [
                  {
                    name: profile?.full_name || "Alejandra",
                    avatar: profile?.avatar_url,
                    level: "1.5",
                  },
                  {
                    name: "Ana",
                    level: "1.4",
                  },
                ],
                teamB: [
                  {
                    name: "Sofia",
                    level: "1.6",
                  },
                  {
                    name: "Marta",
                    level: "1.3",
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
        ) : (
          <View style={styles.contentPlaceholder}>
            <Text style={styles.placeholderText}>
              Lični podaci dolaze uskoro...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean, fonts: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 50,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    logoImage: {
      width: 48,
      height: 48,
    },
    headerActions: {
      flexDirection: "row",
      gap: 12,
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
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? "transparent" : "#B8FF00",
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
      backgroundColor: isDark ? "#1E1F23" : "#1E1F23",
      borderWidth: 2,
      borderColor: isDark ? "#B8FF00" : "#B8FF00",
      alignItems: "center",
      justifyContent: "center",
    },
    matchPercentage: {
      color: isDark ? "#B8FF00" : "#B8FF00",
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
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 8,
    },
    seeMoreLink: {
      color: "#3867FF",
      fontSize: 14,
      fontWeight: "600",
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 28,
      paddingVertical: 20,
    },
    statItem: {
      alignItems: "center",
    },
    statNumber: {
      color: colors.text,
      fontSize: 32,
      fontWeight: "700",
      marginBottom: 4,
    },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 14,
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
      borderColor: isDark ? "#B8FF00" : colors.blue,
    },
    followingButtonText: {
      color: isDark ? "#B8FF00" : colors.blue,
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
      backgroundColor: isDark ? "#B8FF00" : colors.blue,
    },
    playButtonText: {
      color: isDark ? "#111111" : "#FFFFFF",
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
      backgroundColor: isDark ? "#1E1F23" : colors.surface,
      borderColor: isDark ? "#1E1F23" : colors.surface,
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
      borderBottomColor: isDark ? colors.text : colors.blue,
    },
    tabActiveText: {
      color: isDark ? colors.text : colors.blue,
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
      marginBottom: 24,
      lineHeight: 20,
    },
    emptyStateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#3867FF",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    emptyStateButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontFamily: fonts.semiBold,
    },
    postCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
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
      backgroundColor: isDark ? "#1E1F23" : colors.border,
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
    infoCard: {
      flex: 1,
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 16,
      padding: 16,
      minHeight: 110,
      justifyContent: "space-between",
    },
    infoCardSmall: {
      flex: 1,
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 16,
      padding: 16,
      minHeight: 110,
      justifyContent: "space-between",
    },
    infoCardWide: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    infoTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    infoTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    infoValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    infoValueLarge: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "700",
    },
    infoSub: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    infoRowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    infoBadge: {
      color: isDark ? "#B8FF00" : colors.blue,
      fontSize: 14,
      fontWeight: "700",
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
      backgroundColor: isDark ? "#1E1F23" : colors.border,
    },
    infoTagText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    historyList: {
      paddingTop: 8,
    },
    historyCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    historyType: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    historyDate: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    historyLocation: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    historyMetaRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    historyTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: isDark ? "#1E1F23" : colors.border,
    },
    historyTagText: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },
    resultTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    resultWin: {
      backgroundColor: "rgba(184, 255, 0, 0.15)",
    },
    resultLoss: {
      backgroundColor: "rgba(255, 68, 68, 0.15)",
    },
    resultTagText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "700",
    },
    historyTeams: {
      gap: 6,
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    teamDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? "#B8FF00" : colors.blue,
    },
    teamDotMuted: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    teamName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
    },
    teamNameMuted: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    contentPlaceholder: {
      padding: 40,
      alignItems: "center",
    },
    placeholderText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
  });
