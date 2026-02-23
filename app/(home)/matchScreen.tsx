import { EvilIcons, FontAwesome } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FINISHED_MATCHES,
  OPEN_MATCHES,
  UPCOMING_MATCHES,
} from "../../constants/data";
import { useTheme } from "../../contexts/ThemeContext";
import {
  cancelReservation,
  fetchReservationById,
  joinReservation,
  leaveReservation,
  removePlayerFromReservation,
} from "../../lib/courtApi";
import { supabase } from "../../lib/supabase";

const HERO_IMAGE_HEIGHT = 320;

export default function MatchScreenNew() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const [isJoined, setIsJoined] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  // Animated scroll position
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [HERO_IMAGE_HEIGHT - 120, HERO_IMAGE_HEIGHT - 40],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Check if ID is a UUID (from database) or a sample ID (from constants)
  const isUUID =
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Fetch reservation from database if it's a UUID
  const {
    data: reservation,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => fetchReservationById(id as string),
    enabled: isUUID,
    staleTime: 0,
    refetchInterval: 1000 * 3,
  });

  // For sample data, find in hardcoded arrays
  const allMatches = [...UPCOMING_MATCHES, ...OPEN_MATCHES];
  const sampleMatch = !isUUID ? allMatches.find((m) => m.id === id) : null;

  // Check if this is a finished match (sample data)
  const isFinishedMatch = typeof id === "string" && id.startsWith("finished-");
  const finishedMatch = isFinishedMatch
    ? FINISHED_MATCHES.find((m) => m.id === id)
    : null;

  // Transform reservation to match format
  let match: any = null;
  let isCreator = false;
  let hasJoinedMatch = false;

  if (isUUID && reservation) {
    const shortenName = (fullName: string) => {
      if (!fullName) return "Korisnik";
      const parts = fullName.trim().split(" ");
      if (parts.length === 1) return parts[0];
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    };

    const resDate = new Date(
      `${reservation.reservation_date}T${reservation.start_time}`,
    );
    const dayNames = ["Ned", "Pon", "Uto", "Sre", "Čet", "Pet", "Sub"];
    const monthNames = [
      "jan",
      "feb",
      "mar",
      "apr",
      "maj",
      "jun",
      "jul",
      "avg",
      "sep",
      "okt",
      "nov",
      "dec",
    ];

    const participants: any[] = [];

    // Add creator
    participants.push({
      name: shortenName(reservation.user?.full_name),
      avatar: reservation.user?.avatar_url || null,
      userId: reservation.user_id,
    });

    // Add invited players
    if (reservation.invited_players_profiles) {
      reservation.invited_players_profiles.forEach((player: any) => {
        participants.push({
          name: shortenName(player.full_name),
          avatar: player.avatar_url || null,
          userId: player.id,
        });
      });
    }

    const formattedDate = `${dayNames[resDate.getDay()]}, ${resDate.getDate()}. ${monthNames[resDate.getMonth()]} ${resDate.getFullYear()}`;
    const formattedTime = `${reservation.start_time.substring(0, 5)} - ${reservation.end_time.substring(0, 5)}h`;

    match = {
      id: reservation.id,
      type: reservation.is_open_match ? "Otvoren meč" : "Zatvoren meč",
      isOpenMatch: reservation.is_open_match,
      gameMode: reservation.match_type || "friendly",
      date: formattedDate,
      time: formattedTime,
      clubName: reservation.court?.clubs?.name || "Klub",
      clubImage: reservation.court?.clubs?.image || null,
      courtName: reservation.court?.name || "Teren",
      location: reservation.court?.clubs?.address || "",
      duration: `${reservation.duration_minutes} min`,
      price: Math.round(reservation.total_price || 0),
      participants: participants,
      user_id: reservation.user_id,
      invited_players: reservation.invited_players || [],
      creator: {
        full_name: reservation.user?.full_name || "Korisnik",
        avatar_url: reservation.user?.avatar_url || null,
      },
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      reservation_date: reservation.reservation_date,
    };

    isCreator = !!(currentUserId && match.user_id === currentUserId);
    hasJoinedMatch = !!(
      currentUserId && match.invited_players?.includes(currentUserId)
    );
  } else if (finishedMatch) {
    // Transform finished match data to match format
    const allPlayers = [...finishedMatch.teamA, ...finishedMatch.teamB];
    const participants = allPlayers.map((player: any) => ({
      name: player.name,
      avatar: player.avatar || null,
      userId: null, // Sample data doesn't have real user IDs
    }));

    // Parse start time from "14:30h" format
    const startTimeStr = finishedMatch.time.replace("h", "").trim();

    // Calculate end time based on duration (e.g., "2h 15min")
    const durationMatch = finishedMatch.duration?.match(/(\d+)h\s*(\d+)?min/);
    let endTimeStr = "16:00";
    if (durationMatch && startTimeStr) {
      const [hours, minutes] = startTimeStr.split(":").map(Number);
      const durationHours = parseInt(durationMatch[1]) || 0;
      const durationMinutes = parseInt(durationMatch[2]) || 0;

      const endTotalMinutes =
        hours * 60 + minutes + durationHours * 60 + durationMinutes;
      const endHours = Math.floor(endTotalMinutes / 60);
      const endMinutes = endTotalMinutes % 60;
      endTimeStr = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
    }

    match = {
      id: finishedMatch.id,
      type: finishedMatch.type,
      isOpenMatch: false,
      gameMode: finishedMatch.gameMode,
      date: finishedMatch.date,
      time: finishedMatch.time,
      clubName: finishedMatch.club,
      clubImage: null,
      courtName: "Teren",
      location: finishedMatch.club,
      duration: finishedMatch.duration || "90 min",
      price: 0,
      participants: participants,
      user_id: null,
      invited_players: [],
      creator: {
        full_name: allPlayers[0]?.name || "Organizator",
        avatar_url: allPlayers[0]?.avatar || null,
      },
      start_time: startTimeStr || "14:00",
      end_time: endTimeStr,
      reservation_date: new Date().toISOString().split("T")[0],
      // Add finished match specific data
      isFinished: true,
      matchType: finishedMatch.matchType,
      teamA: finishedMatch.teamA,
      teamB: finishedMatch.teamB,
      score: finishedMatch.score,
    };
    isCreator = false;
    hasJoinedMatch = false;
  } else if (sampleMatch) {
    const sample = sampleMatch as any;
    match = {
      ...sampleMatch,
      creator: sample.creator || {
        full_name: sample.author || "Korisnik",
        avatar_url: null,
      },
    };
    isCreator = false;
    hasJoinedMatch = false;
  }

  useEffect(() => {
    if (hasJoinedMatch !== undefined) {
      setIsJoined(hasJoinedMatch);
    }
  }, [hasJoinedMatch]);

  // Loading state - show for all cases until we have the data
  if ((isUUID && isLoading) || !currentUserId || (isUUID && !reservation)) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.loadingHeader}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color={colors.text} />
          </Pressable>
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3867FF" />
          <Text style={styles.loadingText}>Učitavanje meča...</Text>
        </View>
      </View>
    );
  }

  // Error or not found
  if (
    (isUUID && error) ||
    (!isUUID && !isFinishedMatch && !sampleMatch) ||
    !match
  ) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color={colors.text} />
          </Pressable>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <FontAwesome
            name="exclamation-circle"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>Meč nije pronađen</Text>
          <Text style={styles.emptyText}>
            Ovaj meč više nije dostupan ili je obrisan.
          </Text>
        </View>
      </View>
    );
  }

  // Actions
  const handleCancelReservation = () => {
    Alert.alert(
      "Otkaži rezervaciju",
      "Da li si siguran da želiš da otkažeš rezervaciju? Ova akcija se ne može poništiti.",
      [
        { text: "Ne", style: "cancel" },
        {
          text: "Otkaži rezervaciju",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelReservation(id as string);
              queryClient.invalidateQueries({ queryKey: ["openReservations"] });
              queryClient.invalidateQueries({ queryKey: ["userReservations"] });
              Alert.alert("Uspešno", "Rezervacija je otkazana.", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert(
                "Greška",
                error.message || "Greška prilikom otkazivanja.",
              );
            }
          },
        },
      ],
    );
  };

  const handleJoin = async () => {
    if (isJoined) {
      Alert.alert(
        "Napusti meč",
        "Da li si siguran da želiš da napustiš ovaj meč?",
        [
          { text: "Otkaži", style: "cancel" },
          {
            text: "Napusti",
            style: "destructive",
            onPress: async () => {
              try {
                await leaveReservation(id as string);
                setIsJoined(false);
                queryClient.invalidateQueries({
                  queryKey: ["reservation", id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["openReservations"],
                });
                Alert.alert("Uspešno", "Napustili ste meč.", [
                  {
                    text: "OK",
                    onPress: () => router.replace("/(home)/(tabs)"),
                  },
                ]);
              } catch (error: any) {
                Alert.alert(
                  "Greška",
                  error.message || "Nije moguće napustiti meč",
                );
              }
            },
          },
        ],
      );
    } else {
      // Calculate price per player for the alert
      const currentParticipants = match.participants.filter(
        (p: any) => p.name,
      ).length;
      const totalPlayers = currentParticipants + 1;
      const pricePerPlayer = match.price
        ? Math.round(match.price / totalPlayers)
        : 0;

      Alert.alert(
        "Priključi se meču",
        `Da li želiš da se priključiš ovom meču${pricePerPlayer ? ` za ${pricePerPlayer} RSD` : ""}?`,
        [
          { text: "Otkaži", style: "cancel" },
          {
            text: "Priključi se",
            onPress: async () => {
              try {
                await joinReservation(id as string);
                setIsJoined(true);
                queryClient.invalidateQueries({
                  queryKey: ["reservation", id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["openReservations"],
                });
                Alert.alert("Uspešno", "Pridružili ste se meču!");
              } catch (error: any) {
                Alert.alert(
                  "Greška",
                  error.message || "Nije moguće priključiti se",
                );
              }
            },
          },
        ],
      );
    }
  };

  const handleInvitePlayer = () => {
    router.push({
      pathname: "/(home)/addPlayers",
      params: {
        reservationId: id,
        currentPlayers: [match.user_id, ...match.invited_players].join(","),
      },
    });
  };

  const handleRemovePlayer = (playerId: string, playerName: string) => {
    Alert.alert(
      "Ukloni igrača",
      `Da li želiš da ukloniš ${playerName} iz meča?`,
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Ukloni",
          style: "destructive",
          onPress: async () => {
            try {
              await removePlayerFromReservation(id as string, playerId);
              queryClient.invalidateQueries({ queryKey: ["reservation", id] });
              Alert.alert("Uspešno", "Igrač je uklonjen iz meča.");
            } catch (error: any) {
              Alert.alert(
                "Greška",
                error.message || "Nije moguće ukloniti igrača",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header with Animation */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <SafeAreaView edges={["top"]} style={styles.stickyHeaderSafeArea}>
          <View style={styles.stickyHeaderContent}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <FontAwesome name="chevron-left" size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.stickyHeaderTitle} numberOfLines={1}>
              {match.clubName}
            </Text>
            <Pressable style={styles.iconButton}>
              <FontAwesome name="share-alt" size={20} color={colors.text} />
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Transparent Header Buttons - Fixed */}
      <Animated.View
        style={[
          styles.headerButtons,
          {
            opacity: scrollY.interpolate({
              inputRange: [HERO_IMAGE_HEIGHT - 120, HERO_IMAGE_HEIGHT - 40],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        <SafeAreaView edges={["top"]} style={styles.headerButtonsSafeArea}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color="white" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <FontAwesome name="share-alt" size={20} color="white" />
          </Pressable>
        </SafeAreaView>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Image with Parallax */}
        {match.clubImage ? (
          <Animated.Image
            source={{ uri: match.clubImage }}
            style={[
              styles.heroImage,
              {
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [-HERO_IMAGE_HEIGHT, 0, HERO_IMAGE_HEIGHT],
                      outputRange: [
                        -HERO_IMAGE_HEIGHT / 2,
                        0,
                        HERO_IMAGE_HEIGHT * 0.5,
                      ],
                    }),
                  },
                  {
                    scale: scrollY.interpolate({
                      inputRange: [-HERO_IMAGE_HEIGHT, 0],
                      outputRange: [2, 1],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroImagePlaceholder}>
            <FontAwesome name="image" size={64} color={colors.textSecondary} />
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Location & Badge */}
          <View style={styles.titleSection}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationSubtitle}>{match.clubName}</Text>
            </View>
            <Text style={styles.mainTitle}>{match.courtName}</Text>
            <View style={styles.badgeRow}>
              {match.isFinished ? (
                <View style={styles.finishedBadge}>
                  <FontAwesome
                    name="flag-checkered"
                    size={14}
                    color="#9F7AEA"
                  />
                  <Text style={styles.finishedText}>Završeno</Text>
                </View>
              ) : (
                <View style={styles.confirmedBadge}>
                  <FontAwesome name="check-circle" size={14} color="#10B981" />
                  <Text style={styles.confirmedText}>Potvrđeno</Text>
                </View>
              )}
              {match.gameMode && (
                <View
                  style={[
                    styles.gameModeBadge,
                    match.gameMode === "competitive" &&
                      styles.gameModeBadgeCompetitive,
                    match.gameMode === "friendly" &&
                      styles.gameModeBadgeFriendly,
                    match.gameMode === "training" &&
                      styles.gameModeBadgeTraining,
                  ]}
                >
                  <FontAwesome
                    name={
                      match.gameMode === "competitive"
                        ? "trophy"
                        : match.gameMode === "training"
                          ? "line-chart"
                          : "smile-o"
                    }
                    size={12}
                    color={
                      match.gameMode === "competitive"
                        ? "#F59E0B"
                        : match.gameMode === "training"
                          ? "#3B82F6"
                          : "#10B981"
                    }
                  />
                  <Text
                    style={[
                      styles.gameModeBadgeText,
                      match.gameMode === "competitive" &&
                        styles.gameModeBadgeTextCompetitive,
                      match.gameMode === "friendly" &&
                        styles.gameModeBadgeTextFriendly,
                      match.gameMode === "training" &&
                        styles.gameModeBadgeTextTraining,
                    ]}
                  >
                    {match.gameMode === "competitive"
                      ? "Kompetativan"
                      : match.gameMode === "training"
                        ? "Trening"
                        : "Prijateljski"}
                  </Text>
                </View>
              )}
              <View style={styles.matchTypeBadge}>
                <Text style={styles.matchTypeText}>{match.type}</Text>
              </View>
            </View>
          </View>

          {/* Check In / Check Out Times */}
          <View style={styles.checkTimesSection}>
            <View style={styles.checkTimeCard}>
              <Text style={styles.checkTimeLabel}>Početak</Text>
              <Text style={styles.checkTimeValue}>
                {match.start_time?.substring(0, 5) || "10:00"}
              </Text>
              <Text style={styles.checkTimeDate}>{match.date}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.checkTimeCard}>
              <Text style={styles.checkTimeLabel}>Kraj</Text>
              <Text style={styles.checkTimeValue}>
                {match.end_time?.substring(0, 5) || "12:00"}
              </Text>
              <Text style={styles.checkTimeDate}>{match.date}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsSection}>
            <Pressable style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <FontAwesome name="search" size={18} color={colors.text} />
              </View>
              <Text style={styles.actionButtonText}>Upustva za dolazak</Text>
              <FontAwesome
                name="chevron-right"
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>

            <Pressable style={styles.actionButton}>
              <View style={styles.actionButtonIcon}>
                <FontAwesome name="map-marker" size={18} color={colors.text} />
              </View>
              <Text style={styles.actionButtonText}>Dobij putanju</Text>
              <FontAwesome
                name="chevron-right"
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          {/* Reservation Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Detalji rezervacije</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Igrači</Text>
              <Text style={styles.detailValue}>
                {(match.participants || []).length} igrača
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trajanje</Text>
              <Text style={styles.detailValue}>{match.duration}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cena</Text>
              <Text style={styles.detailValue}>
                {match.price ? `${match.price} RSD` : "Besplatno"}
              </Text>
            </View>
          </View>

          {/* Match Result Section - Only for Finished Matches */}
          {match.isFinished && match.score && (
            <View style={styles.resultSection}>
              <View style={styles.resultHeader}>
                <FontAwesome name="trophy" size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Rezultat meča</Text>
              </View>

              <View style={styles.resultScoreCard}>
                <View style={styles.resultTeamSection}>
                  <Text style={styles.resultTeamLabel}>Tim A</Text>
                  <View style={styles.resultTeamPlayers}>
                    {match.teamA?.map((player: any, idx: number) => (
                      <Text key={idx} style={styles.resultPlayerName}>
                        {player.name}
                      </Text>
                    ))}
                  </View>
                </View>

                <View style={styles.resultScoreCenter}>
                  <View style={styles.resultMainScore}>
                    <Text
                      style={[
                        styles.resultScoreNumber,
                        match.score.teamA > match.score.teamB &&
                          styles.resultScoreWinner,
                      ]}
                    >
                      {match.score.teamA}
                    </Text>
                    <Text style={styles.resultScoreDivider}>:</Text>
                    <Text
                      style={[
                        styles.resultScoreNumber,
                        match.score.teamB > match.score.teamA &&
                          styles.resultScoreWinner,
                      ]}
                    >
                      {match.score.teamB}
                    </Text>
                  </View>
                  <View style={styles.resultSetsContainer}>
                    {match.score.sets?.map((set: string, idx: number) => (
                      <View key={idx} style={styles.resultSetBadge}>
                        <Text style={styles.resultSetText}>{set}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.resultTeamSection}>
                  <Text style={styles.resultTeamLabel}>Tim B</Text>
                  <View style={styles.resultTeamPlayers}>
                    {match.teamB?.map((player: any, idx: number) => (
                      <Text key={idx} style={styles.resultPlayerName}>
                        {player.name}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>

              {match.score.teamA !== match.score.teamB && (
                <View style={styles.winnerBanner}>
                  <FontAwesome name="trophy" size={16} color="#FFD700" />
                  <Text style={styles.winnerText}>
                    {match.score.teamA > match.score.teamB
                      ? "Tim A je pobedio!"
                      : "Tim B je pobedio!"}
                  </Text>
                  <FontAwesome name="trophy" size={16} color="#FFD700" />
                </View>
              )}
            </View>
          )}

          {/* Participants List */}
          <View style={styles.participantsSection}>
            <View style={styles.participantsHeader}>
              <Text style={styles.sectionTitle}>
                Igrači ({(match.participants || []).length}/4)
              </Text>
            </View>

            <View style={styles.playersList}>
              {(match.participants || []).map(
                (participant: any, index: number) => (
                  <Pressable
                    key={index}
                    style={styles.playerRow}
                    onPress={() => {
                      if (participant.userId) {
                        router.push(
                          `/(home)/playerProfile?id=${participant.userId}`,
                        );
                      }
                    }}
                  >
                    {participant.avatar ? (
                      <Image
                        source={{ uri: participant.avatar }}
                        style={styles.playerAvatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.playerAvatar,
                          styles.playerAvatarPlaceholder,
                        ]}
                      >
                        <Text style={styles.playerAvatarText}>
                          {participant.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.playerName}>{participant.name}</Text>

                    {!match.isFinished &&
                      participant.userId === match.user_id && (
                        <View style={styles.organizerBadge}>
                          <FontAwesome name="star" size={10} color="#F59E0B" />
                          <Text style={styles.organizerText}>Organizator</Text>
                        </View>
                      )}

                    {!match.isFinished &&
                      isCreator &&
                      participant.userId !== match.user_id && (
                        <Pressable
                          style={styles.removePlayerButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRemovePlayer(
                              participant.userId,
                              participant.name,
                            );
                          }}
                        >
                          <EvilIcons
                            name="close"
                            size={26}
                            color={colors.textSecondary}
                          />
                        </Pressable>
                      )}
                  </Pressable>
                ),
              )}

              {/* Empty Slots - Only show for non-finished matches */}
              {!match.isFinished &&
                Array.from({
                  length: 4 - (match.participants || []).length,
                }).map((_, index) => (
                  <Pressable
                    key={`empty-${index}`}
                    style={styles.emptySlotCard}
                    onPress={isCreator ? handleInvitePlayer : undefined}
                  >
                    <View style={styles.emptySlotIcon}>
                      <FontAwesome
                        name="plus"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </View>
                    <Text style={styles.emptySlotCardText}>
                      Dodaj novog igrača
                    </Text>
                    <FontAwesome
                      name="chevron-right"
                      size={14}
                      color={colors.textSecondary}
                      style={{ marginLeft: "auto" }}
                    />
                  </Pressable>
                ))}
            </View>

            {/* Match Start Disclaimer - Only show for non-finished matches */}
            {!match.isFinished && (
              <View style={styles.matchDisclaimerContainer}>
                <FontAwesome
                  name="info-circle"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.matchDisclaimerText}>
                  Meč se može započeti 15 minuta pre zakazanog termina
                </Text>
              </View>
            )}
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Button */}
      {/* Only show action button if: open match OR (closed match AND user is participant) AND NOT finished */}
      {!match.isFinished &&
        currentUserId &&
        (match.isOpenMatch || isCreator || hasJoinedMatch) && (
          <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
            {isCreator ? (
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancelReservation}
              >
                <Text style={styles.cancelButtonText}>
                  Otkažite rezervaciju
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.joinButton, isJoined && styles.joinedButton]}
                onPress={handleJoin}
              >
                <Text style={styles.joinButtonText}>
                  {isJoined ? "Napustite meč" : "Pridružite se meču"}
                </Text>
                {!isJoined &&
                  match.price &&
                  (() => {
                    // Calculate price per player based on current participants
                    const currentParticipants = match.participants.filter(
                      (p: any) => p.name,
                    ).length;
                    const totalPlayers = currentParticipants + 1; // +1 for the joining player
                    const pricePerPlayer = Math.round(
                      match.price / totalPlayers,
                    );
                    return (
                      <Text style={styles.joinButtonPrice}>
                        {" "}
                        · {pricePerPlayer} RSD
                      </Text>
                    );
                  })()}
              </Pressable>
            )}
          </SafeAreaView>
        )}
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingBottom: 0,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
    },
    loadingHeader: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    backButton: {
      alignItems: "center",
      justifyContent: "center",
    },
    closeButton: {
      alignItems: "center",
      justifyContent: "center",
    },

    // Hero Image Section
    heroImage: {
      width: "100%",
      height: HERO_IMAGE_HEIGHT,
    },
    heroImagePlaceholder: {
      width: "100%",
      height: HERO_IMAGE_HEIGHT,
      backgroundColor: isDark ? "#1a1a1a" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
    },

    // Sticky Header with Animation
    stickyHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    stickyHeaderSafeArea: {
      flex: 1,
    },
    stickyHeaderContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    stickyHeaderTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      marginHorizontal: 16,
    },

    // Transparent Header Buttons
    headerButtons: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 90,
    },
    headerButtonsSafeArea: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    iconButton: {
      padding: 8,
    },

    // Main Content
    mainContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },

    // Title Section
    titleSection: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 20,
    },
    locationHeader: {
      marginBottom: 4,
    },
    locationSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    mainTitle: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
      lineHeight: 38,
    },
    badgeRow: {
      flexDirection: "row",
      gap: 8,
    },
    confirmedBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#064E3B" : "#D1FAE5",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      gap: 6,
    },
    confirmedText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#10B981",
    },
    finishedBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#44337A" : "#EDE9FE",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      gap: 6,
    },
    finishedText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#9F7AEA",
    },
    matchTypeBadge: {
      backgroundColor: isDark ? "#1a1a1a" : "#F3F4F6",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
    },
    matchTypeText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    gameModeBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      gap: 6,
    },
    gameModeBadgeCompetitive: {
      backgroundColor: isDark ? "#78350F" : "#FEF3C7",
    },
    gameModeBadgeFriendly: {
      backgroundColor: isDark ? "#064E3B" : "#D1FAE5",
    },
    gameModeBadgeTraining: {
      backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE",
    },
    gameModeBadgeText: {
      fontSize: 13,
      fontWeight: "600",
    },
    gameModeBadgeTextCompetitive: {
      color: "#F59E0B",
    },
    gameModeBadgeTextFriendly: {
      color: "#10B981",
    },
    gameModeBadgeTextTraining: {
      color: "#3B82F6",
    },

    // Check Times Section
    checkTimesSection: {
      flexDirection: "row",
      paddingHorizontal: 24,
      paddingVertical: 24,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: isDark ? "#2a2a2a" : "#E5E7EB",
      gap: 24,
    },
    checkTimeCard: {
      flex: 1,
    },
    checkTimeLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    checkTimeValue: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    checkTimeDate: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    divider: {
      width: 1,
      backgroundColor: isDark ? "#2a2a2a" : "#E5E7EB",
    },

    // Action Buttons Section
    actionButtonsSection: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      gap: 0,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      gap: 12,
    },
    actionButtonIcon: {
      width: 24,
      alignItems: "center",
    },
    actionButtonText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },

    // Details Section
    detailsSection: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      borderTopWidth: 1,
      borderColor: isDark ? "#2a2a2a" : "#E5E7EB",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 20,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    detailLabel: {
      fontSize: 16,
      color: colors.text,
    },
    detailValue: {
      fontSize: 16,
      color: colors.textSecondary,
    },

    // Result Section (for finished matches)
    resultSection: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      borderTopWidth: 1,
      borderColor: isDark ? "#2a2a2a" : "#E5E7EB",
      backgroundColor: isDark ? "#1a1a1a" : "#F9FAFB",
    },
    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 20,
    },
    resultScoreCard: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    resultTeamSection: {
      flex: 1,
      alignItems: "center",
    },
    resultTeamLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    resultTeamPlayers: {
      alignItems: "center",
      gap: 4,
    },
    resultPlayerName: {
      fontSize: 14,
      color: colors.text,
      textAlign: "center",
    },
    resultScoreCenter: {
      alignItems: "center",
      paddingHorizontal: 20,
    },
    resultMainScore: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    resultScoreNumber: {
      fontSize: 40,
      fontWeight: "700",
      color: colors.textSecondary,
    },
    resultScoreWinner: {
      color: colors.accent,
    },
    resultScoreDivider: {
      fontSize: 32,
      color: colors.textSecondary,
    },
    resultSetsContainer: {
      flexDirection: "row",
      gap: 8,
    },
    resultSetBadge: {
      backgroundColor: isDark ? "#2a2a2a" : "#E5E7EB",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    resultSetText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
    winnerBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    winnerText: {
      fontSize: 16,
      fontWeight: "700",
      color: isDark ? "#60A5FA" : "#1E40AF",
    },

    // Participants Section
    participantsSection: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      borderTopWidth: 1,
      borderColor: isDark ? "#2a2a2a" : "#E5E7EB",
    },
    participantsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    playersList: {
      gap: 16,
    },
    playerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: isDark ? "#1a1a1a" : "#FFFFFF",
      padding: 16,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    playerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    playerAvatarPlaceholder: {
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    playerAvatarText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    playerName: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    organizerBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#78350F" : "#FEF3C7",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      gap: 4,
    },
    organizerText: {
      fontSize: 11,
      fontWeight: "600",
      color: "#F59E0B",
    },
    removePlayerButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    emptySlotCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: isDark ? "#1a1a1a" : "#F9FAFB",
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDark ? "#333" : "#E5E7EB",
      borderStyle: "dashed",
    },
    emptySlotIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "#2a2a2a" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
    },
    emptySlotCardText: {
      flex: 1,
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    matchDisclaimerContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: isDark ? "#1E3A8A15" : "#EFF6FF",
      padding: 12,
      borderRadius: 8,
      gap: 10,
      marginTop: 16,
    },
    matchDisclaimerText: {
      flex: 1,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },

    // Teams Section
    teamsSection: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      borderTopWidth: 1,
      borderColor: isDark ? "#2a2a2a" : "#E5E7EB",
    },
    teamsSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginTop: 4,
      marginBottom: 20,
    },
    teamsGrid: {
      gap: 16,
    },
    teamContainer: {
      backgroundColor: isDark ? "#1E3A8A15" : "#DBEAFE",
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: isDark ? "#1E40AF" : "#3B82F6",
    },
    teamBContainer: {
      backgroundColor: isDark ? "#B91C1C15" : "#FEE2E2",
      borderColor: isDark ? "#B91C1C" : "#EF4444",
    },
    teamHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 10,
    },
    teamBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? "#1E40AF" : "#3B82F6",
      alignItems: "center",
      justifyContent: "center",
    },
    teamBadgeB: {
      backgroundColor: isDark ? "#B91C1C" : "#EF4444",
    },
    teamBadgeText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    teamTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    teamCountBadge: {
      backgroundColor: colors.background,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    teamCountText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
    },
    teamPlayersList: {
      gap: 10,
    },
    teamPlayerCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 10,
      gap: 10,
    },
    teamPlayerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    teamPlayerAvatarPlaceholder: {
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    teamPlayerAvatarText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    teamPlayerName: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
    },
    removeFromTeamButton: {
      padding: 4,
    },
    teamEmptySlot: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 10,
      gap: 10,
      opacity: 0.5,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
      borderStyle: "dashed",
    },
    teamEmptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontStyle: "italic",
    },
    unassignedContainer: {
      marginTop: 20,
      padding: 16,
      backgroundColor: isDark ? "#2a1a1a" : "#FEF3C7",
      borderRadius: 16,
      borderWidth: 2,
      borderColor: isDark ? "#FCD34D30" : "#F59E0B",
    },
    unassignedHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    unassignedTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: isDark ? "#FCD34D" : "#92400E",
    },
    unassignedSubtitle: {
      fontSize: 14,
      color: isDark ? "#FCD34D" : "#92400E",
      marginBottom: 16,
      opacity: 0.8,
    },
    unassignedPlayerCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      gap: 10,
    },
    unassignedAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    unassignedAvatarPlaceholder: {
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    unassignedAvatarText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    unassignedPlayerName: {
      flex: 1,
      fontSize: 15,
      fontWeight: "500",
      color: colors.text,
    },
    assignButtonsContainer: {
      flexDirection: "row",
      gap: 8,
    },
    assignButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      minWidth: 60,
      alignItems: "center",
    },
    assignButtonA: {
      backgroundColor: isDark ? "#1E40AF" : "#3B82F6",
    },
    assignButtonB: {
      backgroundColor: isDark ? "#B91C1C" : "#EF4444",
    },
    assignButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#FFFFFF",
    },

    // Bottom Bar
    bottomBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#2a2a2a" : "#E5E7EB",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    joinButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#3867FF",
      borderRadius: 8,
      paddingVertical: 16,
    },
    joinedButton: {
      backgroundColor: "#FF3B30",
    },
    joinButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    joinButtonPrice: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    cancelButton: {
      backgroundColor: "#FF3B30",
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
