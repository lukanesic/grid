import { fetchAllClubs } from "@/lib/clubApi";
import { fetchTopPlayers, searchPlayers } from "@/lib/profileApi";
import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";

type TabType = "players" | "clubs";

export default function CommunityScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("players");

  // Fetch top players
  const { data: topPlayers = [], isLoading: playersLoading } = useQuery({
    queryKey: ["topPlayers"],
    queryFn: () => fetchTopPlayers(10),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: activeTab === "players" && !searchQuery,
  });

  // Search players
  const { data: searchedPlayers = [], isLoading: searchPlayersLoading } =
    useQuery({
      queryKey: ["searchPlayers", searchQuery],
      queryFn: () => searchPlayers(searchQuery),
      enabled: activeTab === "players" && searchQuery.length > 0,
      staleTime: 1000 * 30, // 30 seconds
    });

  // Fetch clubs from database
  const { data: clubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["clubs"],
    queryFn: fetchAllClubs,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: activeTab === "clubs",
  });

  const displayedPlayers = searchQuery.trim() ? searchedPlayers : topPlayers;
  const isPlayersLoading = searchQuery.trim()
    ? searchPlayersLoading
    : playersLoading;

  // Filter clubs based on search query
  const filteredClubs = clubs.filter((club) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      club.name?.toLowerCase().includes(query) ||
      club.address?.toLowerCase().includes(query) ||
      club.location?.toLowerCase().includes(query)
    );
  });

  // Display only top 10 clubs when not searching
  const displayedClubs = searchQuery.trim()
    ? filteredClubs
    : clubs.slice(0, 10);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <TouchableOpacity onPress={() => router.push("/viewMap")}>
          <Text style={styles.viewMap}>View map</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "players" && styles.tabActive]}
          onPress={() => {
            setActiveTab("players");
            setSearchQuery("");
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "players" && styles.tabTextActive,
            ]}
          >
            Igrači
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "clubs" && styles.tabActive]}
          onPress={() => {
            setActiveTab("clubs");
            setSearchQuery("");
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "clubs" && styles.tabTextActive,
            ]}
          >
            Klubovi
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === "players"
                ? "Pretraži igrače..."
                : "Pretraži klubove..."
            }
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <FontAwesome
                name="times"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Players Tab Content */}
        {activeTab === "players" ? (
          <>
            {!searchQuery && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top igrači</Text>
              </View>
            )}
            {isPlayersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : displayedPlayers.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {searchQuery
                    ? `Nema rezultata za "${searchQuery}"`
                    : "Nema dostupnih igrača"}
                </Text>
              </View>
            ) : (
              <View style={styles.playersGrid}>
                {displayedPlayers.map((player) => (
                  <Pressable
                    key={player.id}
                    style={styles.playerCard}
                    onPress={() =>
                      router.push(`/playerProfile?id=${player.id}`)
                    }
                  >
                    <Image
                      source={{
                        uri:
                          player.avatar_url ||
                          "https://i.pravatar.cc/150?img=47",
                      }}
                      style={styles.playerAvatar}
                    />
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName} numberOfLines={1}>
                        {player.full_name || "Nepoznato ime"}
                      </Text>
                      {player.username && (
                        <Text style={styles.playerUsername} numberOfLines={1}>
                          @{player.username}
                        </Text>
                      )}
                      {player.rating && (
                        <View style={styles.playerRating}>
                          <FontAwesome
                            name="star"
                            size={12}
                            color={isDark ? "#B8FF00" : colors.blue}
                          />
                          <Text style={styles.playerRatingText}>
                            {player.rating.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            {/* Clubs Tab Content */}
            {!searchQuery && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top klubovi</Text>
              </View>
            )}
            {clubsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : displayedClubs.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {searchQuery
                    ? `Nema rezultata za "${searchQuery}"`
                    : "Nema dostupnih klubova"}
                </Text>
              </View>
            ) : (
              displayedClubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={styles.clubCard}
                  onPress={() => router.push(`/clubProfile?id=${club.id}`)}
                >
                  <ImageBackground
                    source={{ uri: club.image }}
                    style={styles.clubImage}
                  >
                    <View style={styles.imageOverlay} />
                    <View style={styles.clubImageOverlay}>
                      <View style={styles.clubInfo}>
                        <Text style={styles.clubName}>{club.name}</Text>
                        <Text style={styles.clubPrice}>
                          {club.price || "N/A"}
                        </Text>
                      </View>
                      <Text style={styles.clubFrom}>{club.distance || ""}</Text>
                    </View>
                  </ImageBackground>

                  {/* Club Details */}
                  <View style={styles.clubDetails}>
                    <Text style={styles.clubLocation}>
                      {club.distance || "N/A"} •{" "}
                      {club.location || club.address || "N/A"}
                    </Text>
                    <View style={styles.timeSlotsContainer}>
                      {(club.timeSlots || club.time_slots || [])
                        .slice(0, 4)
                        .map((slot, index) => (
                          <TouchableOpacity key={index} style={styles.timeSlot}>
                            <Text style={styles.timeSlotText}>{slot}</Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
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
    viewMap: {
      color: colors.blue,
      fontSize: 15,
      fontWeight: "500",
    },
    tabsContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      marginBottom: 16,
      gap: 12,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: "center",
    },
    tabActive: {
      backgroundColor: isDark ? "#B8FF00" : colors.blue,
    },
    tabText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    tabTextActive: {
      color: isDark ? "#0B0B0B" : "#FFFFFF",
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    sectionHeader: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 48,
    },
    errorContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    errorText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
    },
    playersGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    playerCard: {
      width: "48%",
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      gap: 8,
    },
    playerAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: isDark ? "#B8FF00" : colors.blue,
    },
    playerInfo: {
      width: "100%",
      alignItems: "center",
      gap: 4,
    },
    playerName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
    },
    playerUsername: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },
    playerRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    playerRatingText: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? "#B8FF00" : colors.blue,
    },
    clubCard: {
      marginBottom: 16,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: colors.cardBackground,
    },
    clubImage: {
      width: "100%",
      height: 240,
      justifyContent: "flex-end",
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    clubImageOverlay: {
      padding: 16,
      position: "relative",
    },
    clubInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 4,
    },
    clubName: {
      color: "#F2F2F2",
      fontSize: 20,
      fontWeight: "700",
    },
    clubPrice: {
      color: "#F2F2F2",
      fontSize: 20,
      fontWeight: "700",
    },
    clubFrom: {
      color: "#F2F2F2",
      fontSize: 13,
      opacity: 0.8,
    },
    clubDetails: {
      padding: 16,
      backgroundColor: colors.surface,
    },
    clubLocation: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 12,
    },
    timeSlotsContainer: {
      flexDirection: "row",
      gap: 8,
    },
    timeSlot: {
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    timeSlotText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "500",
    },
  });
