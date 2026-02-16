import { FontAwesome } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatItem } from "../../components/playerProfile";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  fetchClubById,
  fetchClubFollowStatus,
  followClub,
  unfollowClub,
} from "../../lib/clubApi";

export default function ClubProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const { profile: currentUserProfile } = useAuth();
  const styles = getStyles(colors, isDark);
  const queryClient = useQueryClient();

  const clubId = id as string;

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

  const loading = clubLoading || followStatusLoading;

  if (clubError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Greška pri učitavanju kluba</Text>
      </SafeAreaView>
    );
  }

  if (clubLoading || !club) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <ImageBackground
          source={{
            uri:
              club.image ||
              "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
          }}
          style={styles.headerImage}
        >
          <View style={styles.imageOverlay} />
          <View style={styles.headerOverlay}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.content}>
          {/* Club Info */}
          <View style={styles.infoSection}>
            <Text style={styles.clubName}>{club.name}</Text>
            <View style={styles.ratingRow}>
              <FontAwesome
                name="star"
                size={16}
                color={isDark ? colors.accent : colors.blue}
              />
              <Text style={styles.ratingText}>
                {club.rating} ({club.reviews} recenzija)
              </Text>
            </View>
            <View style={styles.locationRow}>
              <FontAwesome
                name="map-marker"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.locationText}>{club.address}</Text>
            </View>
            <View style={styles.distanceRow}>
              <Text style={styles.distanceText}>{club.distance} od vas</Text>
              <Text style={styles.priceText}>{club.price}/sat</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <StatItem
              number={club.courts || 0}
              label="Tereni"
              onPress={() => {
                // Could show courts details
              }}
            />
            <StatItem
              number={followStatus?.followers_count || 0}
              label="Pratioci"
              onPress={() => {
                router.push(`/(home)/followers?clubId=${club.id}`);
              }}
            />
            <StatItem
              number={followStatus?.following_count || 0}
              label="Praćenje"
              onPress={() => {
                router.push(`/(home)/following?clubId=${club.id}`);
              }}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <View style={styles.buttonHalf}>
              {currentUserProfile && followStatus && (
                <Pressable
                  style={[
                    styles.followActionButton,
                    followStatus.is_following && styles.followingActionButton,
                  ]}
                  onPress={handleFollowToggle}
                  disabled={followMutation.isPending || loading}
                >
                  {followMutation.isPending ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        followStatus.is_following ? colors.text : "#FFFFFF"
                      }
                    />
                  ) : (
                    <>
                      <FontAwesome
                        name={followStatus.is_following ? "check" : "plus"}
                        size={14}
                        color={
                          followStatus.is_following ? colors.text : "#FFFFFF"
                        }
                      />
                      <Text
                        style={[
                          styles.followActionButtonText,
                          followStatus.is_following &&
                            styles.followingActionButtonText,
                        ]}
                      >
                        {followStatus.is_following ? "Otprati" : "Prati"}
                      </Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
            <View style={styles.buttonHalf}>
              <Pressable
                style={styles.playButton}
                onPress={() =>
                  router.push(
                    `/(home)/createMatch?clubId=${club.id}&clubName=${encodeURIComponent(club.name)}`,
                  )
                }
              >
                <FontAwesome
                  name="play"
                  size={14}
                  color={isDark ? "#0B0B0B" : "#FFFFFF"}
                />
                <Text style={styles.playButtonText}>Igraj</Text>
              </Pressable>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>O klubu</Text>
            <Text style={styles.description}>{club.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sadržaji</Text>
            <View style={styles.amenitiesGrid}>
              {(club.amenities || []).map((amenity: any, index: number) => (
                <View key={index} style={styles.amenityCard}>
                  <FontAwesome
                    name={amenity.icon}
                    size={20}
                    color={isDark ? colors.accent : colors.blue}
                  />
                  <Text style={styles.amenityLabel}>{amenity.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Courts Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tereni</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <FontAwesome
                  name="circle"
                  size={16}
                  color={isDark ? colors.accent : colors.blue}
                />
                <Text style={styles.infoText}>
                  {club.courts} terena dostupno
                </Text>
              </View>
              <View style={styles.infoRow}>
                <FontAwesome
                  name="clock-o"
                  size={16}
                  color={isDark ? colors.accent : colors.blue}
                />
                <Text style={styles.infoText}>{club.openingHours}</Text>
              </View>
            </View>
          </View>

          {/* Available Times */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dostupni termini danas</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.timeSlotsScroll}
            >
              {(club.timeSlots || []).map((slot: string, index: number) => (
                <Pressable key={index} style={styles.timeSlot}>
                  <Text style={styles.timeSlotText}>{slot}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Reviews Preview */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Recenzije</Text>
              <Pressable>
                <Text style={[styles.seeAllLink, { color: colors.blue }]}>
                  Vidi sve
                </Text>
              </Pressable>
            </View>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=12" }}
                  style={styles.reviewAvatar}
                />
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewName}>Carlos Mendoza</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesome
                        key={star}
                        name="star"
                        size={12}
                        color={isDark ? colors.accent : colors.blue}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>pre 2 dana</Text>
              </View>
              <Text style={styles.reviewText}>
                Odličan klub! Tereni su u perfektnom stanju, osoblje prijatno.
                Definitivno preporučujem.
              </Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
        </View>
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
    headerImage: {
      width: "100%",
      height: 300,
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    headerOverlay: {
      padding: 20,
      paddingTop: 10,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      padding: 20,
    },
    infoSection: {
      marginBottom: 24,
    },
    clubName: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "700",
      marginBottom: 8,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },
    ratingText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    locationText: {
      color: colors.textSecondary,
      fontSize: 14,
      flex: 1,
    },
    distanceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    distanceText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    priceText: {
      color: isDark ? colors.accent : colors.blue,
      fontSize: 20,
      fontWeight: "700",
    },
    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 12,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    amenitiesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    amenityCard: {
      width: "30%",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      gap: 8,
    },
    amenityLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    infoText: {
      color: colors.text,
      fontSize: 15,
    },
    timeSlotsScroll: {
      marginHorizontal: -20,
      paddingHorizontal: 20,
    },
    timeSlot: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      marginRight: 8,
    },
    timeSlotText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    reviewsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    seeAllLink: {
      fontSize: 14,
      fontWeight: "600",
    },
    reviewCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    reviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    reviewAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    reviewInfo: {
      flex: 1,
    },
    reviewName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    reviewStars: {
      flexDirection: "row",
      gap: 2,
    },
    reviewDate: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    reviewText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 28,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 28,
    },
    buttonHalf: {
      flex: 1,
    },
    followActionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 24,
      backgroundColor: isDark ? colors.accent : colors.blue,
    },
    followingActionButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    followActionButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    followingActionButtonText: {
      color: colors.text,
    },
    playButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 24,
      backgroundColor: isDark ? colors.accent : colors.blue,
    },
    playButtonText: {
      color: isDark ? "#0B0B0B" : "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  });
