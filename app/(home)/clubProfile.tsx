import { FontAwesome } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { StatItem } from "../../components/playerProfile";
import VersusMatchCard from "../../components/VersusMatchCard";
import { FINISHED_MATCHES } from "../../constants/data";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
    fetchClubById,
    fetchClubFollowStatus,
    followClub,
    unfollowClub,
} from "../../lib/clubApi";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = 400;

export default function ClubProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const { profile: currentUserProfile } = useAuth();
  const styles = getStyles(colors, isDark);
  const queryClient = useQueryClient();

  const clubId = id as string;

  // Animated scroll position
  const scrollY = React.useRef(new Animated.Value(0)).current;

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 120, HEADER_HEIGHT - 40],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerIconColor = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 120, HEADER_HEIGHT - 40],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Fetch club data
  const {
    data: club,
    isLoading: clubLoading,
    error: clubError,
  } = useQuery({
    queryKey: ["club", clubId],
    queryFn: () => fetchClubById(clubId),
    enabled: !!clubId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch follow status
  const { data: followStatus, isLoading: followStatusLoading } = useQuery({
    queryKey: ["clubFollowStatus", clubId],
    queryFn: () => fetchClubFollowStatus(clubId),
    enabled: !!clubId && !!currentUserProfile?.id,
    staleTime: 1000 * 60, // 1 minute
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async (isFollowing: boolean) => {
      if (isFollowing) {
        await unfollowClub(clubId);
      } else {
        await followClub(clubId);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch follow status
      queryClient.invalidateQueries({ queryKey: ["clubFollowStatus", clubId] });
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
    },
    onError: (error) => {
      console.error("Error toggling follow:", error);
    },
  });

  const handleFollowToggle = () => {
    if (!currentUserProfile?.id || !followStatus) return;
    followMutation.mutate(followStatus.is_following);
  };

  const openMap = () => {
    const address = club?.address || "Belgrade, Serbia";
    if (Platform.OS === "ios") {
      // Apple Maps for iOS
      const url = `http://maps.apple.com/?q=${encodeURIComponent(address)}`;
      Linking.openURL(url);
    } else {
      // OpenStreetMap for Android
      const url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
      Linking.openURL(url);
    }
  };

  const loading = clubLoading || followStatusLoading;

  if (clubError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Greška pri učitavanju kluba</Text>
      </View>
    );
  }

  if (clubLoading || !club) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header with Animation */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <Pressable
          style={styles.stickyBackButton}
          onPress={() => router.back()}
        >
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.stickyHeaderContent}>
          <Text style={styles.stickyHeaderTitle} numberOfLines={1}>
            {club?.name}
          </Text>
          <View style={styles.headerRightButtons}>
            <Pressable style={styles.iconButton}>
              <FontAwesome name="share-alt" size={20} color={colors.text} />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={handleFollowToggle}
              disabled={followMutation.isPending || loading}
            >
              {followMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <FontAwesome
                  name={followStatus?.is_following ? "heart" : "heart-o"}
                  size={22}
                  color={followStatus?.is_following ? "#FF385C" : colors.text}
                />
              )}
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* Transparent Header Buttons - Fixed */}
      <Animated.View
        style={[
          styles.headerButtons,
          {
            opacity: scrollY.interpolate({
              inputRange: [HEADER_HEIGHT - 120, HEADER_HEIGHT - 40],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        <Pressable
          style={[
            styles.iconButton,
            {
              paddingHorizontal: 0,
            },
          ]}
          onPress={() => router.back()}
        >
          <FontAwesome name="chevron-left" size={20} color="white" />
        </Pressable>
        <View style={styles.headerRightButtons}>
          <Pressable style={styles.iconButton}>
            <FontAwesome name="share-alt" size={20} color="white" />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={handleFollowToggle}
            disabled={followMutation.isPending || loading}
          >
            {followMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <FontAwesome
                name={followStatus?.is_following ? "heart" : "heart-o"}
                size={22}
                color={followStatus?.is_following ? "#FF385C" : "white"}
              />
            )}
          </Pressable>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {/* Hero Image with Parallax */}
        <Animated.Image
          source={{
            uri:
              club.image ||
              "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
          }}
          style={[
            styles.heroImage,
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                    outputRange: [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.5],
                  }),
                },
                {
                  scale: scrollY.interpolate({
                    inputRange: [-HEADER_HEIGHT, 0],
                    outputRange: [2, 1],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        />

        {/* Content Sheet */}
        <View style={styles.sheetContent}>
          {/* Club Title */}
          <Text style={styles.clubTitle}>{club.name}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {club.address?.split(",")[1] || "Beograd"}, Srbija
          </Text>
          <Text style={styles.details}>
            {club.courts || 6} terena · {(club.amenities || []).length} sadržaja
            · Otvoreno svaki dan
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <StatItem
              number={club.courts || 6}
              label="Tereni"
              onPress={() => {
                router.push(`/(home)/clubCourts?clubId=${clubId}`);
              }}
            />
            <StatItem
              number={followStatus?.followers_count || 0}
              label="Pratioci"
              onPress={() => {
                router.push(`/(home)/followers?clubId=${clubId}`);
              }}
            />
            <StatItem
              number={followStatus?.following_count || 0}
              label="Praćenje"
              onPress={() => {
                router.push(`/(home)/following?clubId=${clubId}`);
              }}
            />
          </View>

          {/* Follow Button */}
          <Pressable
            style={styles.followButton}
            onPress={handleFollowToggle}
            disabled={followMutation.isPending || loading}
          >
            {followMutation.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.followButtonText}>
                {followStatus?.is_following ? "Otprati" : "Zaprati"}
              </Text>
            )}
          </Pressable>

          {/* Description */}
          <Text style={styles.descriptionText}>{club.description}</Text>

          {/* Separator */}
          <View style={styles.separator} />

          {/* What this place offers */}
          <Text style={styles.sectionTitle}>Šta nudi</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.amenitiesScroll}
            contentContainerStyle={styles.amenitiesScrollContent}
          >
            <View style={styles.amenityCard}>
              <FontAwesome name="car" size={28} color={colors.text} />
              <Text style={styles.amenityText}>Parking</Text>
            </View>
            <View style={styles.amenityCard}>
              <FontAwesome name="wifi" size={28} color={colors.text} />
              <Text style={styles.amenityText}>WiFi</Text>
            </View>
            <View style={styles.amenityCard}>
              <FontAwesome name="cutlery" size={28} color={colors.text} />
              <Text style={styles.amenityText}>Restoran</Text>
            </View>
            <View style={styles.amenityCard}>
              <FontAwesome name="lock" size={28} color={colors.text} />
              <Text style={styles.amenityText}>Ormarići</Text>
            </View>
            <View style={styles.amenityCard}>
              <FontAwesome name="shower" size={28} color={colors.text} />
              <Text style={styles.amenityText}>Tuš</Text>
            </View>
            <View style={styles.amenityCard}>
              <FontAwesome name="snowflake-o" size={28} color={colors.text} />
              <Text style={styles.amenityText}>Klima</Text>
            </View>
          </ScrollView>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Location Section */}
          <Text style={styles.sectionTitle}>Lokacija kluba</Text>
          <Text style={styles.locationAddress}>
            {club.address || "Beograd, Srbija"}
          </Text>
          <Pressable style={styles.mapContainer} onPress={openMap}>
            <Image
              source={{
                uri: `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(club.address || "Belgrade, Serbia")}&zoom=15&size=600x300&markers=color:red|${encodeURIComponent(club.address || "Belgrade, Serbia")}`,
              }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.mapOverlay}>
              <View style={styles.mapOverlayContent}>
                <FontAwesome name="map-marker" size={24} color="white" />
                <Text style={styles.mapOverlayText}>Prikaži na mapi</Text>
              </View>
            </View>
          </Pressable>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Things to know */}
          <Text style={styles.sectionTitle}>Stvari koje treba znati</Text>

          {/* Cancellation policy */}
          <Pressable style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <FontAwesome name="calendar" size={24} color={colors.text} />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>Pravila otkazivanja</Text>
                <Text style={styles.infoCardText}>
                  Besplatno otkazivanje do 24h pre rezervacije. Otkaži pre toga
                  za pun povraćaj novca.
                </Text>
              </View>
            </View>
          </Pressable>

          {/* House rules */}
          <Pressable style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <FontAwesome name="list" size={24} color={colors.text} />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>Pravila terena</Text>
                <Text style={styles.infoCardText}>
                  Dolazak nakon {club.opening_hours?.split("-")[0] || "08:00"}
                </Text>
                <Text style={styles.infoCardText}>
                  Odlazak pre {club.opening_hours?.split("-")[1] || "22:00"}
                </Text>
                <Text style={styles.infoCardText}>
                  Maksimalno 4 igrača po terenu
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Safety */}
          <Pressable style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <FontAwesome name="shield" size={24} color={colors.text} />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>Bezbednost</Text>
                <Text style={styles.infoCardText}>Garderobu zaključavajte</Text>
                <Text style={styles.infoCardText}>
                  Koristan je u svako doba
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Finished Matches */}
          <Text style={styles.sectionTitle}>Poslednje završeni mečevi</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.matchesScroll}
            contentContainerStyle={styles.matchesScrollContent}
          >
            {FINISHED_MATCHES.slice(0, 3).map((match, index) => {
              // Transform score object to string for VersusMatchCard
              const scoreString = match.score.sets.join(", ");
              const formattedTime = match.time.replace("h", "").trim();

              return (
                <VersusMatchCard
                  key={match.id || index}
                  id={match.id}
                  type={match.type}
                  time={formattedTime}
                  date={match.date}
                  club={match.club}
                  matchType={match.matchType}
                  gameMode={match.gameMode}
                  teamA={match.teamA}
                  teamB={match.teamB}
                  score={scoreString}
                  duration={match.duration}
                  isFinished={true}
                  onPress={() =>
                    router.push(`/(home)/matchScreen?id=${match.id}`)
                  }
                />
              );
            })}
          </ScrollView>

          {/* Bottom Padding */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{club.price || "1200RSD"}</Text>
          <Text style={styles.priceUnit}>po satu</Text>
        </View>
        <Pressable
          style={styles.reserveButton}
          onPress={() =>
            router.push(
              `/(home)/createMatchNew?clubId=${club.id}&clubName=${encodeURIComponent(club.name)}`,
            )
          }
        >
          <Text style={styles.reserveButtonText}>Rezervišite</Text>
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    errorText: {
      color: colors.text,
      fontSize: 16,
      textAlign: "center",
      marginTop: 20,
    },
    heroImage: {
      width: SCREEN_WIDTH,
      height: HEADER_HEIGHT,
    },
    stickyHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#333" : "#E5E7EB",
      paddingTop: 75,
      paddingBottom: 12,
      paddingHorizontal: 24,
      zIndex: 20,
      flexDirection: "row",
      alignItems: "center",
    },
    stickyBackButton: {
      paddingVertical: 8,
      marginRight: 12,
    },
    stickyHeaderContent: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    stickyHeaderTitle: {
      flex: 1,
      marginRight: 16,
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    headerButtons: {
      position: "absolute",
      top: 75,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      zIndex: 10,
    },
    headerRightButtons: {
      flexDirection: "row",
      gap: 16,
    },
    iconButton: {
      padding: 8,
    },
    sheetContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -40,
      padding: 24,
      paddingTop: 32,
    },
    clubTitle: {
      color: colors.text,
      fontSize: 26,
      fontWeight: "700",
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 16,
      marginBottom: 4,
      textAlign: "center",
    },
    details: {
      color: colors.textSecondary,
      fontSize: 16,
      marginBottom: 24,
      textAlign: "center",
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 24,
    },
    followButton: {
      backgroundColor: "#4A90E2",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 24,
    },
    followButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    separator: {
      height: 1,
      backgroundColor: isDark ? "#333" : "#E5E7EB",
      marginVertical: 24,
    },
    descriptionText: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "600",
      marginBottom: 20,
    },
    amenitiesScroll: {
      marginHorizontal: -24,
    },
    amenitiesScrollContent: {
      paddingHorizontal: 24,
      gap: 12,
    },
    amenityCard: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: isDark ? "#333" : "#E5E7EB",
      backgroundColor: colors.background,
      minWidth: 110,
      gap: 12,
    },
    amenityText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    },
    locationAddress: {
      color: colors.textSecondary,
      fontSize: 16,
      marginBottom: 16,
    },
    mapContainer: {
      width: "100%",
      height: 300,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 16,
      position: "relative",
    },
    mapImage: {
      width: "100%",
      height: "100%",
    },
    mapOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
    mapOverlayContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    mapOverlayText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    infoCard: {
      marginBottom: 20,
    },
    infoCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
    },
    infoCardContent: {
      flex: 1,
      gap: 8,
    },
    infoCardTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 4,
    },
    infoCardText: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 20,
    },
    matchesScroll: {
      marginHorizontal: -24,
    },
    matchesScrollContent: {
      paddingHorizontal: 24,
      gap: 12,
    },
    bottomBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 32,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#333" : "#E5E7EB",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    priceText: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
    },
    priceUnit: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    reserveButton: {
      backgroundColor: "#FF385C",
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 8,
    },
    reserveButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
