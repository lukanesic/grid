import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CourtSearchBar from "../../../components/CourtSearchBar";
import HorizontalCalendar from "../../../components/HorizontalCalendar";
import LocationFilterModal from "../../../components/LocationFilterModal";
import { SUGGESTED_CLUBS, SUGGESTED_FRIENDS } from "../../../constants/data";
import { useTheme } from "../../../contexts/ThemeContext";
import { fetchAllClubs } from "../../../lib/clubApi";
import {
  fetchAvailableTimeSlots,
  fetchCourtsByClub,
} from "../../../lib/courtApi";
import type { TimeSlot } from "../../../types/court";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 320;

export default function CommunityScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString("en-CA").split("T")[0],
  );
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Animated scroll position for parallax effect
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch all clubs from the database
  const {
    data: clubs = [],
    isLoading: clubsLoading,
    error: clubsError,
  } = useQuery({
    queryKey: ["allClubs"],
    queryFn: fetchAllClubs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use static suggested friends and clubs data
  const suggestedPeople = SUGGESTED_FRIENDS;
  const suggestedClubs = SUGGESTED_CLUBS.slice(0, 3);

  // Combine people and clubs, interleaving them
  const combinedList = [];
  const maxLength = Math.max(suggestedPeople.length, suggestedClubs.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < suggestedPeople.length) {
      combinedList.push({ type: "person", data: suggestedPeople[i], index: i });
    }
    if (i < suggestedClubs.length) {
      combinedList.push({ type: "club", data: suggestedClubs[i], index: i });
    }
  }

  const handleFollow = (userId: string) => {
    setFollowingIds((prev) => [...prev, userId]);
  };

  const handleRemove = (userId: string) => {
    // Handle remove logic
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  // Filter clubs by location and search query
  const filteredClubs = clubs.filter((club) => {
    const matchesLocation = selectedLocation
      ? club.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      : true;
    const matchesSearch = searchQuery
      ? club.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesLocation && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {/* Hero Image Placeholder */}
        {!imageLoaded && <View style={styles.imagePlaceholder} />}

        {/* Hero Image with Parallax */}
        <Animated.Image
          source={require("../../../assets/images/community.jpg")}
          onLoad={() => setImageLoaded(true)}
          style={[
            styles.heroImage,
            {
              opacity: imageLoaded ? 1 : 0,
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

        {/* Text over the image - Absolute positioned */}
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroText}>Rezerviši termin</Text>
        </View>

        {/* Horizontal Calendar below the image - Absolute positioned */}
        <View style={styles.calendarOverlay}>
          <HorizontalCalendar onDateSelect={handleDateSelect} />
        </View>

        {/* Content Sheet with rounded corners */}
        <View style={styles.sheetContent}>
          {/* Search Bar */}
          <CourtSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFilterPress={() => setFilterModalVisible(true)}
          />

          {/* Loading State */}
          {clubsLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Učitavanje klubova...</Text>
            </View>
          )}

          {/* Error State */}
          {clubsError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Greška pri učitavanju klubova
              </Text>
            </View>
          )}

          {/* Clubs List with Available Time Slots */}
          {!clubsLoading &&
            !clubsError &&
            filteredClubs.map((club, index) => (
              <ClubWithAvailability
                key={club.id}
                club={club}
                selectedDate={selectedDate}
                isLast={index === filteredClubs.length - 1}
                onPress={() => router.push(`/(home)/clubProfile?id=${club.id}`)}
              />
            ))}

          {/* Empty state for filtered results */}
          {!clubsLoading && !clubsError && filteredClubs.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIconContainer}>
                <FontAwesome
                  name="map-marker"
                  size={48}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyStateTitle}>
                Nema klubova na ovoj lokaciji
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                Pokušajte sa drugom lokacijom ili uklonite filter
              </Text>
              {selectedLocation && (
                <Pressable
                  style={styles.resetFilterButton}
                  onPress={() => setSelectedLocation(null)}
                >
                  <Text style={styles.resetFilterButtonText}>
                    Ukloni filter
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Contacts Section */}
          <View style={styles.contactsSection}>
            <View style={styles.contactsLeft}>
              <View style={styles.contactsIcon}>
                <FontAwesome name="phone" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.contactsTextContainer}>
                <Text style={styles.contactsTitle}>Kontakti</Text>
                <Text style={styles.contactsSubtitle}>
                  Pronađite svoje kontakte
                </Text>
              </View>
            </View>
            <Pressable style={styles.findButton}>
              <Text style={styles.findButtonText}>Pronađi</Text>
            </Pressable>
          </View>

          {/* Suggested People & Clubs */}
          {combinedList.map((item, idx) => {
            if (item.type === "person") {
              const person = item.data as (typeof SUGGESTED_FRIENDS)[0];
              const isFollowing = followingIds.includes(person.id.toString());
              const suggestionTypes = [
                "People you may know",
                "Shared with you",
                "Followed by",
              ];
              const suggestionType =
                suggestionTypes[item.index % suggestionTypes.length];

              return (
                <View key={`person-${person.id}`} style={styles.personCard}>
                  <Pressable
                    onPress={() =>
                      router.push(`/(home)/playerProfile?id=${person.id}`)
                    }
                  >
                    <Image
                      source={{
                        uri: person.avatar,
                      }}
                      style={styles.personAvatar}
                    />
                  </Pressable>
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{person.name}</Text>
                    {suggestionType === "Followed by" ? (
                      <View style={styles.followedByContainer}>
                        <Text style={styles.followedByText}>Followed by </Text>
                        <View style={styles.miniAvatarsContainer}>
                          <Image
                            source={{
                              uri: `https://i.pravatar.cc/150?img=${(item.index + 1) % 50}`,
                            }}
                            style={styles.miniAvatar}
                          />
                          <Image
                            source={{
                              uri: `https://i.pravatar.cc/150?img=${(item.index + 2) % 50}`,
                            }}
                            style={[styles.miniAvatar, { marginLeft: -8 }]}
                          />
                          <View
                            style={[
                              styles.miniAvatar,
                              styles.miniAvatarMore,
                              { marginLeft: -8 },
                            ]}
                          >
                            <Text style={styles.miniAvatarMoreText}>+1</Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.personSubtitle}>
                        {suggestionType}
                      </Text>
                    )}
                    <View style={styles.actionsContainer}>
                      {!isFollowing ? (
                        <>
                          <Pressable
                            style={styles.removeButton}
                            onPress={() => handleRemove(person.id.toString())}
                          >
                            <Text style={styles.removeButtonText}>Remove</Text>
                          </Pressable>
                          <Pressable
                            style={styles.followButton}
                            onPress={() => handleFollow(person.id.toString())}
                          >
                            <Text style={styles.followButtonText}>Follow</Text>
                          </Pressable>
                        </>
                      ) : (
                        <Pressable
                          style={styles.followingButton}
                          onPress={() =>
                            setFollowingIds((prev) =>
                              prev.filter((id) => id !== person.id.toString()),
                            )
                          }
                        >
                          <Text style={styles.followingButtonText}>
                            Following
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              );
            } else {
              // Club
              const club = item.data as (typeof SUGGESTED_CLUBS)[0];
              const isFollowing = followingIds.includes(`club-${club.id}`);

              return (
                <View key={`club-${club.id}`} style={styles.personCard}>
                  <Pressable
                    onPress={() =>
                      router.push(`/(home)/clubProfile?id=${club.id}`)
                    }
                  >
                    <Image
                      source={{
                        uri: club.image,
                      }}
                      style={styles.personAvatar}
                    />
                  </Pressable>
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{club.name}</Text>
                    <Text style={styles.personSubtitle}>
                      Sports club · {club.distance}
                    </Text>
                    <View style={styles.actionsContainer}>
                      {!isFollowing ? (
                        <>
                          <Pressable
                            style={styles.removeButton}
                            onPress={() => handleRemove(`club-${club.id}`)}
                          >
                            <Text style={styles.removeButtonText}>Remove</Text>
                          </Pressable>
                          <Pressable
                            style={styles.followButton}
                            onPress={() => handleFollow(`club-${club.id}`)}
                          >
                            <Text style={styles.followButtonText}>Follow</Text>
                          </Pressable>
                        </>
                      ) : (
                        <Pressable
                          style={styles.followingButton}
                          onPress={() =>
                            setFollowingIds((prev) =>
                              prev.filter((id) => id !== `club-${club.id}`),
                            )
                          }
                        >
                          <Text style={styles.followingButtonText}>
                            Following
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              );
            }
          })}
        </View>
      </Animated.ScrollView>

      {/* Location Filter Modal */}
      <LocationFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        colors={colors}
        isDark={isDark}
      />
    </View>
  );
}

// Sub-component to display club with available time slots
function ClubWithAvailability({
  club,
  selectedDate,
  onPress,
  isLast,
}: {
  club: any;
  selectedDate: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const { colors } = useTheme();

  // Fetch courts for this club
  const { data: courts = [] } = useQuery({
    queryKey: ["courts", club.id],
    queryFn: () => fetchCourtsByClub(club.id),
    staleTime: 1000 * 60 * 5,
  });

  // Fetch available time slots for the first court (or all courts)
  const { data: timeSlots = [], isLoading: timeSlotsLoading } = useQuery<
    TimeSlot[]
  >({
    queryKey: ["timeSlots", club.id, courts[0]?.id, selectedDate],
    queryFn: () =>
      courts[0]
        ? fetchAvailableTimeSlots(courts[0].id, selectedDate)
        : Promise.resolve([]),
    enabled: courts.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Get available time slots (only show first few)
  const availableSlots = timeSlots
    .filter((slot) => slot.is_available)
    .slice(0, 5)
    .map((slot) => slot.time_slot);

  return (
    <View
      style={{
        marginBottom: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
        paddingBottom: isLast ? 0 : 16,
      }}
    >
      <Pressable
        style={{
          flexDirection: "row",
          backgroundColor: colors.cardBackground,
          borderRadius: 16,
          padding: 16,
          marginHorizontal: 20,
          gap: 16,
        }}
        onPress={onPress}
      >
        <View style={{ flex: 1, gap: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "700", color: colors.text }}
            >
              {club.name}
            </Text>
            {club.courts && (
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: colors.textSecondary,
                }}
              >
                {club.courts} {club.courts === 1 ? "teren" : "terena"}
              </Text>
            )}
          </View>

          {club.address && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <FontAwesome
                name="map-marker"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                {club.address}
              </Text>
            </View>
          )}

          {timeSlotsLoading ? (
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Učitavanje termina...
            </Text>
          ) : availableSlots.length > 0 ? (
            <View style={{ marginTop: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginBottom: 12,
                  marginTop: 8,
                }}
              >
                Slobodni termini:
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {availableSlots.map((time, index) => (
                  <View
                    key={`${time}-${index}`}
                    style={{
                      backgroundColor: "#007AFF",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#FFFFFF",
                      }}
                    >
                      {time}
                    </Text>
                  </View>
                ))}
                {timeSlots.filter((slot) => slot.is_available).length > 5 && (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: colors.textSecondary,
                      }}
                    >
                      +
                      {timeSlots.filter((slot) => slot.is_available).length - 5}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                fontStyle: "italic",
              }}
            >
              Nema slobodnih termina
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const getStyles = (colors: any) =>
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
    userAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: "#00D9FF",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    content: {
      flex: 1,
    },
    divider: {
      height: 8,
      backgroundColor: colors.surface,
      marginVertical: 24,
    },
    heroImage: {
      width: SCREEN_WIDTH,
      height: HEADER_HEIGHT,
      resizeMode: "cover",
    },
    imagePlaceholder: {
      position: "absolute",
      top: 0,
      width: SCREEN_WIDTH,
      height: HEADER_HEIGHT,
      backgroundColor: "#808080",
      zIndex: 0,
    },
    heroTextContainer: {
      position: "absolute",
      top: HEADER_HEIGHT - 210,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      zIndex: 5,
    },
    heroText: {
      fontSize: 28,
      fontWeight: "700",
      color: "#FFFFFF",
      lineHeight: 34,
    },
    calendarOverlay: {
      position: "absolute",
      top: HEADER_HEIGHT - 152,
      left: 0,
      right: 0,
      paddingHorizontal: 0,
      zIndex: 10,
    },
    sheetContent: {
      backgroundColor: colors.background,
      marginTop: 0,
      paddingTop: 20,
    },
    contactsSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginBottom: 8,
    },
    contactsLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 16,
    },
    contactsIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#2ECC71",
      justifyContent: "center",
      alignItems: "center",
    },
    contactsTextContainer: {
      flex: 1,
    },
    contactsTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 2,
    },
    contactsSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    findButton: {
      backgroundColor: "#FF2D55",
      paddingHorizontal: 40,
      paddingVertical: 12,
      borderRadius: 24,
    },
    findButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    personCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 16,
    },
    personAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    personInfo: {
      flex: 1,
      gap: 8,
    },
    personName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    personSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    followedByContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    followedByText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    miniAvatarsContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    miniAvatar: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.background,
    },
    miniAvatarMore: {
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    miniAvatarMoreText: {
      fontSize: 9,
      fontWeight: "600",
      color: colors.text,
    },
    actionsContainer: {
      flexDirection: "row",
      gap: 8,
      marginTop: 4,
      width: "100%",
    },
    removeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      alignItems: "center",
    },
    removeButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    followButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      backgroundColor: "#FF2D55",
      alignItems: "center",
    },
    followButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    followingButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    followingButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    loadingContainer: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
    },
    errorContainer: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      fontSize: 14,
      color: colors.error || "#FF3B30",
      textAlign: "center",
    },
    emptyStateContainer: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    emptyStateIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    emptyStateSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    resetFilterButton: {
      marginTop: 8,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: "#007AFF",
      borderRadius: 24,
    },
    resetFilterButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });
