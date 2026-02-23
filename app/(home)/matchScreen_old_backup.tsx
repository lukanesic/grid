import { FontAwesome } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components";
import { OPEN_MATCHES, UPCOMING_MATCHES } from "../../constants/data";
import { useTheme } from "../../contexts/ThemeContext";
import {
    cancelReservation,
    fetchReservationById,
    joinReservation,
    leaveReservation,
    removePlayerFromReservation,
} from "../../lib/courtApi";
import { supabase } from "../../lib/supabase";

export default function MatchScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const [isJoined, setIsJoined] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [team1Players, setTeam1Players] = useState<any[]>([]);
  const [team2Players, setTeam2Players] = useState<any[]>([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState<any[]>([]);
  const [draggedPlayer, setDraggedPlayer] = useState<any>(null);
  const [hoveredTeam, setHoveredTeam] = useState<"team1" | "team2" | null>(
    null,
  );
  const [isHoveredTeamFull, setIsHoveredTeamFull] = useState(false);
  const team1Ref = useRef<View>(null);
  const team2Ref = useRef<View>(null);
  const [team1Layout, setTeam1Layout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [team2Layout, setTeam2Layout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const iconColor = isDark ? colors.accent : colors.blue;
  const screenDimensions = Dimensions.get("window");

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
    staleTime: 0, // Always consider data stale for real-time updates
    refetchInterval: 1000 * 3, // Auto-refresh every 3 seconds
    refetchOnFocus: true,
    refetchOnMount: true,
  });

  // For sample data, find in hardcoded arrays
  const allMatches = [...UPCOMING_MATCHES, ...OPEN_MATCHES];
  const sampleMatch = !isUUID ? allMatches.find((m) => m.id === id) : null;

  // Transform reservation to match format for UI compatibility
  let match: any = null;
  let isOpenMatch = false;
  let openMatch: any = null;
  let isCreator = false;
  let hasJoinedMatch = false;

  if (isUUID && reservation) {
    // Helper function to shorten name
    const shortenName = (fullName: string) => {
      if (!fullName) return "Korisnik";
      const parts = fullName.trim().split(" ");
      if (parts.length === 1) return parts[0];
      const firstName = parts[0];
      const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
      return `${firstName} ${lastInitial}.`;
    };

    // Format date
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

    // Build participants array (creator + invited players)
    const participants: any[] = [];

    // Add creator
    participants.push({
      name: shortenName(reservation.user?.full_name),
      level: "1.0",
      avatar: reservation.user?.avatar_url || null,
      userId: reservation.user_id,
    });

    // Add invited players
    if (reservation.invited_players_profiles) {
      reservation.invited_players_profiles.forEach((player: any) => {
        participants.push({
          name: shortenName(player.full_name),
          level: "1.0",
          avatar: player.avatar_url || null,
          userId: player.id,
        });
      });
    }

    // Fill remaining slots (max 4 total)
    while (participants.length < 4) {
      participants.push({ name: "", level: "+", avatar: null, userId: null });
    }

    const formattedDate = `${dayNames[resDate.getDay()]} ${resDate.getDate()}. ${monthNames[resDate.getMonth()]} · ${reservation.start_time.substring(0, 5)} - ${reservation.end_time.substring(0, 5)}h`;

    match = {
      id: reservation.id,
      type: "OTVORENI MEČ",
      date: formattedDate,
      location: `${reservation.court?.clubs?.name || "Klub"} · ${reservation.court?.clubs?.address || ""}`,
      duration: `${reservation.duration_minutes} MIN`,
      level: "1.0-2.0",
      author: shortenName(reservation.user?.full_name),
      participants: participants,
      price: `${Math.round(reservation.total_price || 0)} RSD`,
      user_id: reservation.user_id,
      club_id: reservation.court?.club_id,
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      invited_players: reservation.invited_players || [],
      creator: {
        full_name: reservation.user?.full_name || "Korisnik",
        avatar_url: reservation.user?.avatar_url || null,
      },
    };

    isOpenMatch = "author" in match;
    openMatch = isOpenMatch ? match : null;
    isCreator = currentUserId && match.user_id === currentUserId;
    hasJoinedMatch =
      currentUserId && openMatch?.invited_players?.includes(currentUserId);
  } else if (sampleMatch) {
    match = sampleMatch;
    isOpenMatch = "author" in match;
    openMatch = isOpenMatch ? match : null;
    isCreator = false;
    hasJoinedMatch = false;
  }

  // Use state to track UI changes, but initialize from match data
  useEffect(() => {
    if (hasJoinedMatch !== undefined) {
      setIsJoined(hasJoinedMatch);
    }
  }, [hasJoinedMatch]);

  // Initialize team selection with all real players unassigned
  useEffect(() => {
    if (openMatch?.participants) {
      const realPlayers = openMatch.participants.filter(
        (p: any) => p.name !== "",
      );

      // Only update if the players actually changed
      const currentPlayerIds = unassignedPlayers.map((p) => p.userId).join(",");
      const newPlayerIds = realPlayers.map((p) => p.userId).join(",");

      if (currentPlayerIds !== newPlayerIds) {
        setUnassignedPlayers(realPlayers);
        setTeam1Players([]);
        setTeam2Players([]);
      }
    }
  }, [
    openMatch?.participants?.length,
    openMatch?.participants?.map((p: any) => p.userId).join(","),
  ]);

  // Team management functions
  const movePlayerToTeam1 = (player: any) => {
    if (team1Players.length >= 2) return; // Max 2 players per team

    setUnassignedPlayers((prev) =>
      prev.filter((p) => p.userId !== player.userId),
    );
    setTeam2Players((prev) => prev.filter((p) => p.userId !== player.userId));
    setTeam1Players((prev) => [...prev, player]);
  };

  const movePlayerToTeam2 = (player: any) => {
    if (team2Players.length >= 2) return; // Max 2 players per team

    setUnassignedPlayers((prev) =>
      prev.filter((p) => p.userId !== player.userId),
    );
    setTeam1Players((prev) => prev.filter((p) => p.userId !== player.userId));
    setTeam2Players((prev) => [...prev, player]);
  };

  const movePlayerToUnassigned = (player: any) => {
    setTeam1Players((prev) => prev.filter((p) => p.userId !== player.userId));
    setTeam2Players((prev) => prev.filter((p) => p.userId !== player.userId));
    setUnassignedPlayers((prev) => [...prev, player]);
  };

  const canStartMatch = team1Players.length > 0 && team2Players.length > 0;

  const handleHoverChange = (
    team: "team1" | "team2" | null,
    isFull: boolean,
  ) => {
    setHoveredTeam(team);
    setIsHoveredTeamFull(isFull);
  };

  // Loading state
  if (isUUID && isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Učitavanje...</Text>
          <View style={{ width: 20 }} />
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3867FF" />
        </View>
      </SafeAreaView>
    );
  }

  // Error or not found
  if ((isUUID && error) || (!isUUID && !sampleMatch) || !match) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Meč nije pronađen</Text>
          <View style={{ width: 20 }} />
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
            Ovaj meč više nije dostupan.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert(
                "Greška",
                error.message ||
                  "Došlo je do greške prilikom otkazivanja rezervacije.",
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
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({
                  queryKey: ["reservation", id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["openReservations"],
                });
                Alert.alert("Uspešno", "Napustili ste meč.", [
                  {
                    text: "OK",
                    onPress: () => {
                      // Return to home screen after leaving match
                      router.replace("/(home)/(tabs)");
                    },
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
      Alert.alert(
        "Priključi se meču",
        `Da li želiš da se priključiš ovom meču${openMatch ? ` za ${openMatch.price}` : ""}?`,
        [
          { text: "Otkaži", style: "cancel" },
          {
            text: "Priključi se",
            onPress: async () => {
              try {
                await joinReservation(id as string);
                setIsJoined(true);
                // Invalidate queries to refresh data
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
                  error.message || "Nije moguće priključiti se meču",
                );
              }
            },
          },
        ],
      );
    }
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
              // Invalidate queries to refresh data
              queryClient.invalidateQueries({
                queryKey: ["reservation", id],
              });
              queryClient.invalidateQueries({
                queryKey: ["openReservations"],
              });
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

  const handleStartMatch = () => {
    if (!canStartMatch) {
      Alert.alert(
        "Nepotpuni timovi",
        "Molimo postavite oba tima pre početka meča. Svaki tim mora imati najmanje jednog igrača.",
      );
      return;
    }

    const message = `Timovi su postavljeni:\nTim 1: ${team1Players.map((p) => p.name).join(", ")}\nTim 2: ${team2Players.map((p) => p.name).join(", ")}\n\nDa li ste spremni za početak meča?`;

    Alert.alert("Započni meč", message, [
      { text: "Otkaži", style: "cancel" },
      {
        text: "Započni",
        onPress: () => {
          // Navigate to live match with team data
          if (canStartMatch) {
            const teamData = {
              team1: team1Players,
              team2: team2Players,
            };
            router.push({
              pathname: `/(home)/liveMatch_NEW`,
              params: {
                id: id as string,
                teams: JSON.stringify(teamData),
              },
            });
          } else {
            router.push(`/(home)/liveMatch_NEW?id=${id}`);
          }
        },
      },
    ]);
  };

  const handleInvitePlayer = () => {
    if (!isCreator) return;

    // Get list of current players (creator + invited)
    const currentPlayerIds = [match.user_id];
    if (openMatch?.invited_players) {
      currentPlayerIds.push(...openMatch.invited_players);
    }

    router.push({
      pathname: "/(home)/addPlayers",
      params: {
        reservationId: id,
        currentPlayers: currentPlayerIds.join(","),
      },
    });
  };

  const getSportIcon = (type: string) => {
    if (type.includes("🎾")) return "circle";
    if (type.includes("🏐")) return "circle-o";
    return "circle";
  };

  const getSportName = (type: string) => {
    if (type.includes("🎾")) return "Padel";
    if (type.includes("🏐")) return "Padel";
    return "Padel";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Detalji meča</Text>
        <Pressable onPress={() => {}}>
          <FontAwesome name="share-alt" size={20} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match Title */}
        <View style={styles.matchTitleContainer}>
          <Text style={styles.matchTypeTitle}>{match.type}</Text>
          <Text style={[styles.sportLabel, { color: iconColor }]}>
            {getSportName(match.type)}
          </Text>
        </View>

        {/* Match Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailCard}>
            <FontAwesome name="calendar" size={20} color={iconColor} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Datum i vreme</Text>
              <Text style={styles.detailValue}>{match.date}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <FontAwesome name="map-marker" size={20} color={iconColor} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Lokacija</Text>
              <Text style={styles.detailValue}>{match.location}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <FontAwesome name="clock-o" size={20} color={iconColor} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Trajanje</Text>
              <Text style={styles.detailValue}>{match.duration}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <FontAwesome name="bar-chart" size={20} color={iconColor} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>Nivo igre</Text>
              <Text style={styles.detailValue}>{match.level}</Text>
            </View>
          </View>

          {openMatch && (
            <View style={styles.detailCard}>
              <FontAwesome name="credit-card" size={20} color={iconColor} />
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>Cena za termin</Text>
                <Text style={styles.detailValue}>{openMatch.price}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Creator Section */}
        {openMatch && match.creator && (
          <View style={styles.creatorSection}>
            <Text style={styles.sectionTitle}>Kreirao</Text>
            <View style={styles.creatorCard}>
              {match.creator.avatar_url ? (
                <Image
                  source={{ uri: match.creator.avatar_url }}
                  style={styles.creatorAvatar}
                />
              ) : (
                <View
                  style={[styles.creatorAvatar, { backgroundColor: "#3867FF" }]}
                >
                  <Text style={styles.creatorInitials}>
                    {match.creator.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </Text>
                </View>
              )}
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>
                  {match.creator.full_name}
                </Text>
                {openMatch.time && (
                  <Text style={styles.creatorTime}>{openMatch.time}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Participants Section */}
        {openMatch && (
          <View style={styles.participantsSection}>
            <View style={styles.participantsSectionHeader}>
              <Text style={styles.sectionTitle}>
                Igrači (
                {
                  openMatch.participants.filter((p: any) => p.name !== "")
                    .length
                }
                /4)
              </Text>
            </View>

            <View style={styles.teamSelectionContainer}>
              {/* Invite Players Button - only show for creators when there are open spots */}
              {isCreator &&
                openMatch.participants.filter((p: any) => p.name === "")
                  .length > 0 && (
                  <View style={styles.inviteSection}>
                    <Pressable
                      style={styles.inviteButton}
                      onPress={handleInvitePlayer}
                    >
                      <FontAwesome name="plus" size={16} color={colors.blue} />
                      <Text style={styles.inviteButtonText}>Pozovi igrače</Text>
                    </Pressable>
                  </View>
                )}

              {/* Unassigned Players */}
              {unassignedPlayers.length > 0 && (
                <View style={styles.unassignedSection}>
                  <Text style={styles.teamSectionTitle}>Dostupni igrači</Text>
                  <View style={styles.unassignedPlayers}>
                    {unassignedPlayers.map((player: any, index: number) => (
                      <DraggablePlayer
                        key={player.userId || index}
                        player={player}
                        onDropInTeam1={() => movePlayerToTeam1(player)}
                        onDropInTeam2={() => movePlayerToTeam2(player)}
                        team1Layout={team1Layout}
                        team2Layout={team2Layout}
                        screenDimensions={screenDimensions}
                        styles={styles}
                        team1Players={team1Players}
                        team2Players={team2Players}
                        onHoverChange={handleHoverChange}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Teams */}
              <View style={styles.teamsContainer}>
                {/* Team 1 */}
                <View
                  ref={team1Ref}
                  style={[
                    styles.teamZone,
                    { borderColor: "#4F7DFF" },
                    hoveredTeam === "team1" &&
                      (isHoveredTeamFull
                        ? styles.teamZoneFull
                        : styles.teamZoneHighlight),
                  ]}
                  onLayout={(event) => {
                    team1Ref.current?.measureInWindow((x, y, width, height) => {
                      setTeam1Layout({ x, y, width, height });
                    });
                  }}
                >
                  <Text style={[styles.teamZoneTitle, { color: "#4F7DFF" }]}>
                    TIM 1 ({team1Players.length}/2)
                  </Text>
                  <View style={styles.teamZonePlayers}>
                    {team1Players.map((player: any, index: number) => (
                      <View
                        key={player.userId || index}
                        style={styles.teamZonePlayer}
                      >
                        {player.avatar ? (
                          <Image
                            source={{ uri: player.avatar }}
                            style={styles.teamZonePlayerAvatar}
                          />
                        ) : (
                          <View
                            style={[
                              styles.teamZonePlayerAvatar,
                              { backgroundColor: "#3867FF" },
                            ]}
                          >
                            <Text style={styles.teamPlayerInitials}>
                              {player.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.teamZonePlayerName}>
                          {player.name}
                        </Text>
                        <Pressable
                          style={styles.removePlayerButton}
                          onPress={() => movePlayerToUnassigned(player)}
                        >
                          <FontAwesome name="times" size={12} color="#FF3B30" />
                        </Pressable>
                      </View>
                    ))}
                    {team1Players.length === 0 && (
                      <Text style={styles.emptyTeamText}>Nema igrača</Text>
                    )}
                  </View>
                </View>

                {/* Team 2 */}
                <View
                  ref={team2Ref}
                  style={[
                    styles.teamZone,
                    { borderColor: "#FF6B6B" },
                    hoveredTeam === "team2" &&
                      (isHoveredTeamFull
                        ? styles.teamZoneFull
                        : styles.teamZoneHighlight),
                  ]}
                  onLayout={(event) => {
                    team2Ref.current?.measureInWindow((x, y, width, height) => {
                      setTeam2Layout({ x, y, width, height });
                    });
                  }}
                >
                  <Text style={[styles.teamZoneTitle, { color: "#FF6B6B" }]}>
                    TIM 2 ({team2Players.length}/2)
                  </Text>
                  <View style={styles.teamZonePlayers}>
                    {team2Players.map((player: any, index: number) => (
                      <View
                        key={player.userId || index}
                        style={styles.teamZonePlayer}
                      >
                        {player.avatar ? (
                          <Image
                            source={{ uri: player.avatar }}
                            style={styles.teamZonePlayerAvatar}
                          />
                        ) : (
                          <View
                            style={[
                              styles.teamZonePlayerAvatar,
                              { backgroundColor: "#3867FF" },
                            ]}
                          >
                            <Text style={styles.teamPlayerInitials}>
                              {player.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.teamZonePlayerName}>
                          {player.name}
                        </Text>
                        <Pressable
                          style={styles.removePlayerButton}
                          onPress={() => movePlayerToUnassigned(player)}
                        >
                          <FontAwesome name="times" size={12} color="#FF3B30" />
                        </Pressable>
                      </View>
                    ))}
                    {team2Players.length === 0 && (
                      <Text style={styles.emptyTeamText}>Nema igrača</Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Team Selection Status */}
              {!canStartMatch && (
                <View style={styles.teamSelectionWarning}>
                  <FontAwesome
                    name="exclamation-triangle"
                    size={16}
                    color="#FF9500"
                  />
                  <Text style={styles.teamSelectionWarningText}>
                    Oba tima moraju imati najmanje jednog igrača
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Match Info */}
        {!isOpenMatch && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>O meču</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Ovo je kompletno organizovan meč. Svi detalji su već definisani
                uključujući vreme, lokaciju i trajanje. Pridruži se i uživaj u
                igri!
              </Text>
            </View>
          </View>
        )}

        {/* Location Info */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Informacije o objektu</Text>
          <Pressable
            style={styles.locationCard}
            onPress={() => {
              if (match.club_id) {
                router.push(`/(home)/clubProfile?id=${match.club_id}`);
              }
            }}
          >
            <Image
              source={{
                uri: "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
              }}
              style={styles.locationImage}
            />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>
                {match.location.split(" · ")[0]}
              </Text>
              <Text style={styles.locationDistance}>
                {match.location.split(" · ")[1]}
              </Text>
              <View style={styles.locationFeatures}>
                <FontAwesome
                  name="car"
                  size={14}
                  color={colors.textSecondary}
                />
                <FontAwesome
                  name="coffee"
                  size={14}
                  color={colors.textSecondary}
                />
                <FontAwesome
                  name="wifi"
                  size={14}
                  color={colors.textSecondary}
                />
              </View>
            </View>
            <Pressable
              onPress={() => {
                if (match.club_id) {
                  router.push(`/(home)/clubProfile?id=${match.club_id}`);
                }
              }}
            >
              <FontAwesome
                name="chevron-right"
                size={16}
                color={colors.textSecondary}
              />
            </Pressable>
          </Pressable>
        </View>

        {/* Rules Section */}
        <View style={styles.rulesSection}>
          <Text style={styles.sectionTitle}>Pravila i uslovi</Text>
          <View style={styles.rulesCard}>
            <View style={styles.ruleItem}>
              <FontAwesome name="clock-o" size={16} color={iconColor} />
              <Text style={styles.ruleText}>
                Dolaz 10 minuta pre početka meča
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <FontAwesome name="ban" size={16} color={iconColor} />
              <Text style={styles.ruleText}>
                Otkazivanje do 2 sata pre početka
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <FontAwesome name="users" size={16} color={iconColor} />
              <Text style={styles.ruleText}>
                Poštovanje svih igrača obavezno
              </Text>
            </View>
            {openMatch && (
              <View style={styles.ruleItem}>
                <FontAwesome name="credit-card" size={16} color={iconColor} />
                <Text style={styles.ruleText}>
                  Plaćanje na licu mesta ili unapred
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        {isCreator ? (
          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={handleCancelReservation}
              >
                <Text style={styles.secondaryButtonText}>Otkaži</Text>
              </Pressable>
              <View style={styles.buttonSpacer} />
              <Pressable
                style={[
                  styles.primaryButton,
                  !canStartMatch && styles.disabledPrimaryButton,
                ]}
                onPress={handleStartMatch}
                disabled={!canStartMatch}
              >
                <FontAwesome name="play" size={16} color={colors.background} />
                <Text style={styles.primaryButtonText}>
                  {!canStartMatch ? "Postavite timove" : "Započni meč"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : isJoined ? (
          <Button
            title="Napusti meč"
            onPress={handleJoin}
            variant="secondary"
          />
        ) : (
          <Button
            title={
              openMatch
                ? `Priključi se • ${openMatch.price}`
                : "Priključi se meču"
            }
            onPress={handleJoin}
            variant="primary"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Draggable Player Component
interface DraggablePlayerProps {
  player: any;
  onDropInTeam1: () => void;
  onDropInTeam2: () => void;
  team1Layout: { x: number; y: number; width: number; height: number };
  team2Layout: { x: number; y: number; width: number; height: number };
  screenDimensions: { width: number; height: number };
  styles: any; // Pass styles from parent
  team1Players: any[];
  team2Players: any[];
  onHoverChange?: (team: "team1" | "team2" | null, isFull: boolean) => void;
}

const DraggablePlayer = ({
  player,
  onDropInTeam1,
  onDropInTeam2,
  team1Layout,
  team2Layout,
  screenDimensions,
  styles,
  team1Players,
  team2Players,
  onHoverChange,
}: DraggablePlayerProps) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [isDragging, setIsDragging] = useState(false);
  const [hoveringTeam, setHoveringTeam] = useState<"team1" | "team2" | null>(
    null,
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
        listener: (evt, gestureState) => {
          const { pageX, pageY } = evt.nativeEvent;

          // Check if hovering over teams for visual feedback
          if (
            pageX >= team1Layout.x &&
            pageX <= team1Layout.x + team1Layout.width &&
            pageY >= team1Layout.y &&
            pageY <= team1Layout.y + team1Layout.height
          ) {
            setHoveringTeam("team1");
            onHoverChange?.("team1", team1Players.length >= 2);
          } else if (
            pageX >= team2Layout.x &&
            pageX <= team2Layout.x + team2Layout.width &&
            pageY >= team2Layout.y &&
            pageY <= team2Layout.y + team2Layout.height
          ) {
            setHoveringTeam("team2");
            onHoverChange?.("team2", team2Players.length >= 2);
          } else {
            setHoveringTeam(null);
            onHoverChange?.(null, false);
          }
        },
      }),
      onPanResponderRelease: (evt, gestureState) => {
        const { pageX, pageY } = evt.nativeEvent;

        // Check if dropped in Team 1 zone
        if (
          pageX >= team1Layout.x &&
          pageX <= team1Layout.x + team1Layout.width &&
          pageY >= team1Layout.y &&
          pageY <= team1Layout.y + team1Layout.height &&
          team1Players.length < 2
        ) {
          onDropInTeam1();
        }
        // Check if dropped in Team 2 zone
        else if (
          pageX >= team2Layout.x &&
          pageX <= team2Layout.x + team2Layout.width &&
          pageY >= team2Layout.y &&
          pageY <= team2Layout.y + team2Layout.height &&
          team2Players.length < 2
        ) {
          onDropInTeam2();
        }

        // Reset position and scale
        setIsDragging(false);
        setHoveringTeam(null);
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale },
          ],
          zIndex: isDragging ? 1000 : 1,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View
        style={[styles.draggablePlayer, isDragging && styles.draggingPlayer]}
      >
        {player.avatar ? (
          <Image
            source={{ uri: player.avatar }}
            style={styles.teamPlayerAvatar}
          />
        ) : (
          <View
            style={[styles.teamPlayerAvatar, { backgroundColor: "#3867FF" }]}
          >
            <Text style={styles.teamPlayerInitials}>
              {player.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </Text>
          </View>
        )}
        <Text style={styles.teamPlayerName}>{player.name}</Text>
        <Text style={styles.teamPlayerLevel}>Nivo: {player.level}</Text>
        {isDragging && (
          <Text
            style={[
              styles.dragHintText,
              hoveringTeam === "team1" &&
                team1Players.length >= 2 && { color: "#FF3B30" },
              hoveringTeam === "team2" &&
                team2Players.length >= 2 && { color: "#FF3B30" },
            ]}
          >
            {hoveringTeam === "team1" && team1Players.length >= 2
              ? "Tim 1 je pun"
              : hoveringTeam === "team2" && team2Players.length >= 2
                ? "Tim 2 je pun"
                : hoveringTeam
                  ? `Pustite u ${hoveringTeam === "team1" ? "Tim 1" : "Tim 2"}`
                  : "Povucite u tim"}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

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
    headerTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "600",
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    matchTitleContainer: {
      marginBottom: 32,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    matchTypeTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 8,
    },
    sportLabel: {
      fontSize: 16,
      fontWeight: "600",
    },
    detailsSection: {
      marginBottom: 32,
    },
    detailCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    detailContent: {
      marginLeft: 16,
      flex: 1,
    },
    detailTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 4,
    },
    detailValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    creatorSection: {
      marginBottom: 32,
    },
    creatorCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    creatorAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginRight: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    creatorInitials: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "700",
    },
    creatorInfo: {
      flex: 1,
    },
    creatorName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    creatorTime: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    participantsSection: {
      marginBottom: 32,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },
    participantsList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    participantCard: {
      width: "48%",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
    },
    participantAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginBottom: 8,
    },
    emptySlot: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
      borderWidth: 2,
      borderColor: colors.blue,
      borderStyle: "dashed",
    },
    participantName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    emptySlotText: {
      color: colors.blue,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    participantLevel: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    removePlayerButton: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: "rgba(255, 59, 48, 0.1)",
      borderRadius: 6,
      gap: 4,
    },
    removePlayerText: {
      color: "#FF3B30",
      fontSize: 12,
      fontWeight: "600",
    },
    infoSection: {
      marginBottom: 32,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    infoText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    locationSection: {
      marginBottom: 32,
    },
    locationCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    locationImage: {
      width: 56,
      height: 56,
      borderRadius: 8,
      marginRight: 12,
    },
    locationInfo: {
      flex: 1,
    },
    locationName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    locationDistance: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 8,
    },
    locationFeatures: {
      flexDirection: "row",
      gap: 12,
    },
    rulesSection: {
      marginBottom: 100,
    },
    rulesCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    ruleItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    ruleText: {
      color: colors.text,
      fontSize: 14,
      marginLeft: 12,
      flex: 1,
    },
    bottomAction: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    buttonContainer: {
      width: "100%",
    },
    buttonRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    buttonSpacer: {
      width: 12,
    },
    secondaryButton: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    primaryButton: {
      flex: 2,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    primaryButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "700",
    },
    disabledPrimaryButton: {
      backgroundColor: colors.textSecondary + "88", // Add transparency
    },
    participantsSectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    teamToggleButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    teamToggleText: {
      color: colors.blue,
      fontSize: 12,
      fontWeight: "600",
    },
    teamSelectionContainer: {
      gap: 20,
    },
    inviteSection: {
      marginBottom: 16,
    },
    inviteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: colors.blue,
      borderStyle: "dashed",
    },
    inviteButtonText: {
      color: colors.blue,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    unassignedSection: {
      marginBottom: 16,
    },
    teamSectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
    },
    unassignedPlayers: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    draggablePlayer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      minWidth: 100,
      flex: 1,
      maxWidth: "45%",
    },
    teamPlayerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginBottom: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    teamPlayerInitials: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
    teamPlayerName: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 4,
    },
    teamPlayerLevel: {
      color: colors.textSecondary,
      fontSize: 10,
      textAlign: "center",
      marginBottom: 8,
    },
    teamButtonsContainer: {
      flexDirection: "row",
      gap: 4,
    },
    teamMoveButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      minWidth: 35,
      alignItems: "center",
    },
    team1Button: {
      backgroundColor: "#4F7DFF",
    },
    team2Button: {
      backgroundColor: "#FF6B6B",
    },
    teamMoveButtonText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "600",
    },
    disabledButton: {
      backgroundColor: colors.textSecondary,
      opacity: 0.5,
    },
    teamsContainer: {
      flexDirection: "row",
      gap: 12,
    },
    teamZone: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: "dashed",
      padding: 12,
      minHeight: 120,
    },
    teamZoneTitle: {
      fontSize: 14,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 12,
    },
    teamZonePlayers: {
      gap: 8,
    },
    teamZonePlayer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 8,
      gap: 8,
    },
    teamZonePlayerAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
    },
    teamZonePlayerName: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "500",
      flex: 1,
    },
    emptyTeamText: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: "center",
      fontStyle: "italic",
      padding: 20,
    },
    teamSelectionWarning: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FF9500" + "20",
      borderRadius: 8,
      padding: 12,
      gap: 8,
      marginTop: 12,
    },
    teamSelectionWarningText: {
      color: "#FF9500",
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
    draggingPlayer: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      backgroundColor: colors.surface + "EE", // More opaque when dragging
    },
    dragHintText: {
      color: colors.blue,
      fontSize: 10,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 4,
    },
    teamZoneHighlight: {
      borderColor: colors.blue,
      borderWidth: 3,
      backgroundColor: colors.blue + "10",
    },
    teamZoneFull: {
      borderColor: "#FF3B30",
      borderWidth: 3,
      backgroundColor: "#FF3B30" + "10",
    },
  });
