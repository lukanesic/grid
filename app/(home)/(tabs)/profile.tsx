import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, IconButton } from "../../../components";
import {
    PROFILE_INFO,
    PROFILE_INFO_STATS,
    PROFILE_POSTS,
    PROFILE_SPORTS,
} from "../../../constants/data";

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<"activity" | "info" | "stats">(
    "activity",
  );
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
              <Badge count={20} />
            </View>
            <IconButton icon="bars" onPress={() => router.push("/menu")} />
          </View>
        </View>

        {/* Profile Image & Match Percentage */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: PROFILE_INFO.avatar }}
              style={styles.profileImage}
            />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{PROFILE_INFO.level}</Text>
            </View>
            <View style={styles.matchCircle}>
              <Text style={styles.matchPercentage}>
                {PROFILE_INFO.matchPercentage}%
              </Text>
            </View>
          </View>
        </View>

        {/* Name */}
        <Text style={styles.name}>{PROFILE_INFO.name}</Text>

        {/* Username & Info */}
        <Text style={styles.userInfo}>
          @{PROFILE_INFO.username} · {PROFILE_INFO.age} god ·{" "}
          {PROFILE_INFO.location}
        </Text>

        {/* Bio */}
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{PROFILE_INFO.bio}</Text>
          <Pressable>
            <Text style={styles.seeMoreLink}>Vidi više</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{PROFILE_INFO.stats.matches}</Text>
            <Text style={styles.statLabel}>Mečevi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {PROFILE_INFO.stats.followers}
            </Text>
            <Text style={styles.statLabel}>Pratioci</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {PROFILE_INFO.stats.following}
            </Text>
            <Text style={styles.statLabel}>Praćenje</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.buttonHalf}>
            <Pressable style={styles.followingButton}>
              <FontAwesome name="users" size={16} color="#B8FF00" />
              <Text style={styles.followingButtonText}>Zapratite</Text>
            </Pressable>
          </View>
          <View style={styles.buttonHalf}>
            <Pressable style={styles.playButton}>
              <FontAwesome name="play" size={14} color="#111111" />
              <Text style={styles.playButtonText}>Igraj</Text>
            </Pressable>
          </View>
        </View>

        {/* Sports Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sportsScroll}
          contentContainerStyle={styles.sportsContent}
        >
          {PROFILE_SPORTS.map((sport, index) => (
            <View
              key={index}
              style={[styles.sportTag, sport.active && styles.sportTagActive]}
            >
              <Text
                style={
                  sport.active ? styles.sportTagTextActive : styles.sportTagText
                }
              >
                {sport.name} {sport.level || ""}
              </Text>
            </View>
          ))}
        </ScrollView>

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
            {PROFILE_POSTS.map((post, index) => (
              <View key={index} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.postAvatar} />
                  <View style={styles.postHeaderText}>
                    <Text style={styles.postName}>{post.name}</Text>
                    <Text style={styles.postMeta}>{post.meta}</Text>
                  </View>
                  <FontAwesome name="ellipsis-h" size={16} color="#8B8B8B" />
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
                    <FontAwesome name="heart-o" size={18} color="#F2F2F2" />
                    <FontAwesome name="comment-o" size={18} color="#F2F2F2" />
                    <FontAwesome
                      name="paper-plane-o"
                      size={18}
                      color="#F2F2F2"
                    />
                  </View>
                  <FontAwesome name="bookmark-o" size={18} color="#F2F2F2" />
                </View>

                <Text style={styles.postLikes}>{post.likes}</Text>
                <Text style={styles.postCaption}>
                  <Text style={styles.postCaptionName}>@agarcia</Text>{" "}
                  {post.caption}
                </Text>
              </View>
            ))}
          </View>
        ) : activeTab === "info" ? (
          <View style={styles.infoSection}>
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoTitleRow}>
                  <FontAwesome
                    name="hand-pointer-o"
                    size={14}
                    color="#8B8B8B"
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
                  <FontAwesome name="map-marker" size={14} color="#8B8B8B" />
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
                  <FontAwesome name="line-chart" size={14} color="#8B8B8B" />
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
                  <FontAwesome name="calendar" size={14} color="#8B8B8B" />
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
                    <FontAwesome name="area-chart" size={14} color="#8B8B8B" />
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
                <FontAwesome name="bullseye" size={14} color="#8B8B8B" />
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
                <FontAwesome name="tags" size={14} color="#8B8B8B" />
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
                type: "ZAVRSEN MEC 🎾",
                date: "Sri 2. feb · 15:00h",
                location: "Polideportivo de la Concepción · 6km",
                duration: "90 MIN",
                level: "1.1",
                result: "W 6-4 6-3",
                win: true,
                teamA: "Alejandra / Marija",
                teamB: "JR. Sara / Pedro",
              },
              {
                type: "ZAVRSEN MEC 🏐",
                date: "Čet 3. feb · 18:00h",
                location: "Club de Tenis La Moraleja · 3km",
                duration: "60 MIN",
                level: "2.0",
                result: "L 4-6 7-6",
                win: false,
                teamA: "Alejandra / Emma",
                teamB: "Carlos / Luis",
              },
              {
                type: "ZAVRSEN MEC 🎾",
                date: "Pet 4. feb · 20:00h",
                location: "Pádel Indoor Centro · 8km",
                duration: "120 MIN",
                level: "1.5",
                result: "W 6-2 6-1",
                win: true,
                teamA: "Alejandra / Ana",
                teamB: "Sofia / Marta",
              },
            ].map((match, index) => (
              <View key={index} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyType}>{match.type}</Text>
                  <Text style={styles.historyDate}>{match.date}</Text>
                </View>
                <Text style={styles.historyLocation}>{match.location}</Text>

                <View style={styles.historyMetaRow}>
                  <View style={styles.historyTag}>
                    <Text style={styles.historyTagText}>{match.duration}</Text>
                  </View>
                  <View style={styles.historyTag}>
                    <Text style={styles.historyTagText}>{match.level}</Text>
                  </View>
                  <View
                    style={[
                      styles.resultTag,
                      match.win ? styles.resultWin : styles.resultLoss,
                    ]}
                  >
                    <Text style={styles.resultTagText}>{match.result}</Text>
                  </View>
                </View>

                <View style={styles.historyTeams}>
                  <View style={styles.teamRow}>
                    <View style={styles.teamDot} />
                    <Text style={styles.teamName}>{match.teamA}</Text>
                  </View>
                  <View style={styles.teamRow}>
                    <View style={styles.teamDotMuted} />
                    <Text style={styles.teamNameMuted}>{match.teamB}</Text>
                  </View>
                </View>
              </View>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
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
    color: "#F2F2F2",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  userInfo: {
    color: "#8B8B8B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  bioSection: {
    marginBottom: 28,
  },
  bioText: {
    color: "#D1D1D1",
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
    color: "#F2F2F2",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    color: "#8B8B8B",
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
    borderColor: "#B8FF00",
  },
  followingButtonText: {
    color: "#B8FF00",
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
    backgroundColor: "#B8FF00",
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
    borderColor: "#2C2C2C",
  },
  sportTagActive: {
    backgroundColor: "#1E1F23",
    borderColor: "#1E1F23",
  },
  sportTagText: {
    color: "#8B8B8B",
    fontSize: 14,
    fontWeight: "600",
  },
  sportTagTextActive: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1E1F23",
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#F2F2F2",
  },
  tabActiveText: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
  },
  tabText: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  postList: {
    gap: 16,
  },
  postCard: {
    backgroundColor: "#121418",
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
    backgroundColor: "#2C2C2C",
  },
  postHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  postName: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
  },
  postMeta: {
    color: "#8B8B8B",
    fontSize: 12,
    marginTop: 2,
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#1E1F23",
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
    color: "#F2F2F2",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },
  postCaption: {
    color: "#D1D1D1",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  postCaptionName: {
    color: "#F2F2F2",
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
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    justifyContent: "space-between",
  },
  infoCardSmall: {
    flex: 1,
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    justifyContent: "space-between",
  },
  infoCardWide: {
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoTitle: {
    color: "#8B8B8B",
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
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
  },
  infoValueLarge: {
    color: "#F2F2F2",
    fontSize: 28,
    fontWeight: "700",
  },
  infoSub: {
    color: "#8B8B8B",
    fontSize: 12,
  },
  infoRowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoBadge: {
    color: "#B8FF00",
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
    backgroundColor: "#2C2C2C",
  },
  infoDotActive: {
    backgroundColor: "#F2F2F2",
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
    backgroundColor: "#1E1F23",
  },
  infoTagText: {
    color: "#F2F2F2",
    fontSize: 12,
    fontWeight: "600",
  },
  historyList: {
    gap: 16,
  },
  historyCard: {
    backgroundColor: "#121418",
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
    color: "#F2F2F2",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  historyDate: {
    color: "#8B8B8B",
    fontSize: 12,
  },
  historyLocation: {
    color: "#8B8B8B",
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
    backgroundColor: "#1E1F23",
  },
  historyTagText: {
    color: "#8B8B8B",
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
    color: "#F2F2F2",
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
    backgroundColor: "#B8FF00",
  },
  teamDotMuted: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2C2C2C",
  },
  teamName: {
    color: "#F2F2F2",
    fontSize: 13,
    fontWeight: "600",
  },
  teamNameMuted: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  contentPlaceholder: {
    padding: 40,
    alignItems: "center",
  },
  placeholderText: {
    color: "#8B8B8B",
    fontSize: 16,
  },
});
