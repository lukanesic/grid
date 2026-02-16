import { FontAwesome } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  const iconColor = isDark ? colors.accent : colors.blue;

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
    Alert.alert("Započni meč", "Da li si spreman da započneš ovaj meč?", [
      { text: "Otkaži", style: "cancel" },
      {
        text: "Započni",
        onPress: () => router.push(`/(home)/liveMatch?id=${id}`),
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
            <Text style={styles.sectionTitle}>
              Igrači (
              {openMatch.participants.filter((p: any) => p.name !== "").length}
              /4)
            </Text>
            <View style={styles.participantsList}>
              {openMatch.participants.map((participant: any, index: number) => {
                const isEmptySlot = participant.name === "";
                const ParticipantWrapper =
                  isEmptySlot && isCreator ? Pressable : View;

                return (
                  <ParticipantWrapper
                    key={index}
                    style={styles.participantCard}
                    {...(isEmptySlot && isCreator
                      ? { onPress: handleInvitePlayer }
                      : {})}
                  >
                    {participant.name === "" ? (
                      <>
                        <View style={styles.emptySlot}>
                          <FontAwesome
                            name="plus"
                            size={16}
                            color={colors.blue}
                          />
                        </View>
                        <Text style={styles.emptySlotText}>Slobodno mesto</Text>
                        <Text style={styles.participantLevel}>
                          Nivo: {participant.level}
                        </Text>
                      </>
                    ) : (
                      <>
                        {participant.avatar ? (
                          <Image
                            source={{ uri: participant.avatar }}
                            style={styles.participantAvatar}
                          />
                        ) : (
                          <View
                            style={[
                              styles.participantAvatar,
                              {
                                backgroundColor: "#3867FF",
                                justifyContent: "center",
                                alignItems: "center",
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color: "#FFFFFF",
                                fontSize: 20,
                                fontWeight: "700",
                              }}
                            >
                              {participant.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.participantName}>
                          {participant.name}
                        </Text>
                        <Text style={styles.participantLevel}>
                          Nivo: {participant.level}
                        </Text>
                        {isCreator &&
                          participant.userId &&
                          participant.userId !== match.user_id && (
                            <Pressable
                              style={styles.removePlayerButton}
                              onPress={() =>
                                handleRemovePlayer(
                                  participant.userId,
                                  participant.name,
                                )
                              }
                            >
                              <FontAwesome
                                name="times-circle"
                                size={14}
                                color="#FF3B30"
                              />
                              <Text style={styles.removePlayerText}>
                                Ukloni
                              </Text>
                            </Pressable>
                          )}
                      </>
                    )}
                  </ParticipantWrapper>
                );
              })}
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
                style={styles.primaryButton}
                onPress={handleStartMatch}
              >
                <FontAwesome name="play" size={16} color={colors.background} />
                <Text style={styles.primaryButtonText}>Započni meč</Text>
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
  });
