import { Calendar } from "@/components";
import { MARKED_DATES } from "@/constants/data";
import { fetchAllClubs, fetchClubById } from "@/lib/clubApi";
import { fetchAvailableTimeSlots, fetchCourtsByClub } from "@/lib/courtApi";
import { fetchFollowingPlayers } from "@/lib/profileApi";
import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
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
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

export default function CreateMatchScreen() {
  const router = useRouter();
  const { clubId, clubName } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [selectedClub, setSelectedClub] = useState<string | null>(
    clubId ? String(clubId) : null,
  );

  // Fetch clubs from database
  const {
    data: clubs = [],
    isLoading: clubsLoading,
    error: clubsError,
  } = useQuery({
    queryKey: ["clubs"],
    queryFn: fetchAllClubs,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch selected club details if clubId is present
  const { data: selectedClubData, isLoading: selectedClubLoading } = useQuery({
    queryKey: ["club", clubId],
    queryFn: () => fetchClubById(clubId as string),
    enabled: !!clubId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch following players from database
  const { data: followingPlayers = [], isLoading: playersLoading } = useQuery({
    queryKey: ["followingPlayers"],
    queryFn: fetchFollowingPlayers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch courts for selected club
  const {
    data: courts = [],
    isLoading: courtsLoading,
    error: courtsError,
  } = useQuery({
    queryKey: ["courts", selectedClub],
    queryFn: () => fetchCourtsByClub(selectedClub as string),
    enabled: !!selectedClub,
    staleTime: 1000 * 60 * 5,
  });

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedTime, setSelectedTime] = useState<string[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");

  // Format date for API (YYYY-MM-DD)
  const formattedDate = selectedDate
    .toLocaleDateString("en-CA") // en-CA gives YYYY-MM-DD format
    .split("T")[0];

  // Fetch available time slots for selected court and date
  const { data: availableTimeSlots = [], isLoading: timeSlotsLoading } =
    useQuery({
      queryKey: ["timeSlots", selectedCourt, formattedDate],
      queryFn: () =>
        fetchAvailableTimeSlots(selectedCourt as string, formattedDate, 60),
      enabled: !!selectedCourt && !!selectedDate,
      staleTime: 1000 * 60 * 2, // 2 minutes (shorter for availability)
    });

  const styles = getStyles(colors, isDark);
  const isFormComplete =
    !!selectedClub &&
    !!selectedDate &&
    !!selectedCourt &&
    selectedTime.length > 0;

  // Get all time slots (available and unavailable)
  const allTimeSlots = availableTimeSlots.map((slot) => slot.time_slot);

  const filteredPlayers = followingPlayers.filter((player) =>
    (player.full_name || "")
      .toLowerCase()
      .includes(playerSearchQuery.trim().toLowerCase()),
  );

  const togglePlayer = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
    } else {
      if (selectedPlayers.length < 3) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      }
    }
  };

  const toggleTime = (timeSlot: string) => {
    // Only allow selection of available time slots
    const slot = availableTimeSlots.find((s) => s.time_slot === timeSlot);
    if (!slot || !slot.is_available) {
      return;
    }

    // If clicking already selected time
    if (selectedTime.includes(timeSlot)) {
      // Only allow removing if it's at the start or end of selection
      const timeIndex = allTimeSlots.indexOf(timeSlot);
      const selectedIndices = selectedTime.map((t) => allTimeSlots.indexOf(t));
      const minIndex = Math.min(...selectedIndices);
      const maxIndex = Math.max(...selectedIndices);

      if (timeIndex === minIndex || timeIndex === maxIndex) {
        setSelectedTime(selectedTime.filter((t) => t !== timeSlot));
      }
      return;
    }

    // If no times selected, add this one
    if (selectedTime.length === 0) {
      setSelectedTime([timeSlot]);
      return;
    }

    // Get indices of all time slots
    const clickedIndex = allTimeSlots.indexOf(timeSlot);
    const selectedIndices = selectedTime.map((t) => allTimeSlots.indexOf(t));
    const minIndex = Math.min(...selectedIndices);
    const maxIndex = Math.max(...selectedIndices);

    // Check if clicked time is consecutive (immediately before or after current selection)
    if (clickedIndex === minIndex - 1) {
      // Adding to the beginning
      setSelectedTime([timeSlot, ...selectedTime]);
    } else if (clickedIndex === maxIndex + 1) {
      // Adding to the end
      setSelectedTime([...selectedTime, timeSlot]);
    }
    // If not consecutive, do nothing (ignore the click)
  };

  // Reset selected time when court or date changes
  const handleCourtChange = (courtId: string) => {
    setSelectedCourt(courtId);
    setSelectedTime([]); // Clear time selection
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime([]); // Clear time selection
  };

  const formatDate = (date: Date) => {
    const days = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];
    const months = [
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
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName} ${day}. ${month} ${year}`;
  };

  const handleCreateMatch = () => {
    if (
      !selectedClub ||
      !selectedDate ||
      !selectedCourt ||
      selectedTime.length === 0
    ) {
      return;
    }

    const club = clubs.find((c) => c.id === selectedClub);
    const court = courts.find((c) => c.id === selectedCourt);
    const playerNamesStr = selectedPlayers
      .map((id) => followingPlayers.find((p) => p.id === id)?.full_name)
      .filter(Boolean)
      .join(",");

    const timeStr =
      selectedTime.length === 1
        ? selectedTime[0]
        : `${selectedTime[0]} - ${selectedTime[selectedTime.length - 1]}`;

    router.push({
      pathname: "/(home)/reservationSummary",
      params: {
        clubId: selectedClub,
        clubName: club?.name || "",
        clubAddress: club?.address || "",
        clubPrice: court?.hourly_rate || club?.price || 0,
        date: formatDate(selectedDate),
        time: timeStr,
        courtId: selectedCourt,
        courtName: court?.name || "",
        playerNames: playerNamesStr,
        playerIds: selectedPlayers.join(","),
        reservationDate: formattedDate, // YYYY-MM-DD format for DB
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Kreiraj meč</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Select Club */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Izaberi klub</Text>
          {clubId && clubName ? (
            selectedClubLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : (
              <ImageBackground
                source={{
                  uri:
                    selectedClubData?.image ||
                    "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
                }}
                style={styles.selectedClubCard}
                imageStyle={styles.selectedClubImage}
              >
                <View style={styles.selectedClubOverlay}>
                  <View style={styles.selectedClubContent}>
                    <View style={styles.selectedClubCheckBadge}>
                      <FontAwesome name="check" size={16} color="#FFFFFF" />
                    </View>
                    <View style={styles.selectedClubTextContainer}>
                      <Text style={styles.selectedClubName}>
                        {decodeURIComponent(clubName as string)}
                      </Text>
                      {selectedClubData?.address && (
                        <View style={styles.selectedClubLocationRow}>
                          <FontAwesome
                            name="map-marker"
                            size={12}
                            color="rgba(255,255,255,0.9)"
                          />
                          <Text style={styles.selectedClubAddress}>
                            {selectedClubData.address}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </ImageBackground>
            )
          ) : clubsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          ) : clubsError ? (
            <Text style={styles.errorText}>Greška pri učitavanju klubova</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.clubScroll}
            >
              {clubs.map((club) => (
                <Pressable
                  key={club.id}
                  style={[
                    styles.clubCard,
                    selectedClub === club.id && styles.clubCardSelected,
                  ]}
                  onPress={() => setSelectedClub(club.id)}
                >
                  <Image
                    source={{ uri: club.image }}
                    style={styles.clubImage}
                  />
                  <View style={styles.clubOverlay}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <View style={styles.clubDistance}>
                      <FontAwesome
                        name="map-marker"
                        size={12}
                        color="#F2F2F2"
                      />
                      <Text style={styles.clubDistanceText}>
                        {club.distance || "N/A"}
                      </Text>
                    </View>
                  </View>
                  {selectedClub === club.id && (
                    <View style={styles.selectedBadge}>
                      <FontAwesome
                        name="check"
                        size={14}
                        color={colors.background}
                      />
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Select Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Izaberi datum</Text>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateChange}
            markedDates={MARKED_DATES}
          />
        </View>

        {/* Select Court */}
        {selectedClub && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Izaberi teren</Text>
            {courtsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : courtsError ? (
              <Text style={styles.errorText}>Greška pri učitavanju terena</Text>
            ) : courts.length === 0 ? (
              <Text style={styles.errorText}>
                Ovaj klub nema dostupne terene
              </Text>
            ) : (
              <View style={styles.courtGrid}>
                {courts.map((court) => (
                  <Pressable
                    key={court.id}
                    style={[
                      styles.courtCard,
                      !court.is_available && styles.courtCardDisabled,
                      selectedCourt === court.id && styles.courtCardSelected,
                    ]}
                    onPress={() =>
                      court.is_available && handleCourtChange(court.id)
                    }
                    disabled={!court.is_available}
                  >
                    <FontAwesome
                      name="circle"
                      size={16}
                      color={
                        selectedCourt === court.id
                          ? isDark
                            ? colors.accent
                            : colors.blue
                          : court.is_available
                            ? isDark
                              ? colors.accent
                              : colors.blue
                            : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.courtName,
                        !court.is_available && styles.courtNameDisabled,
                      ]}
                    >
                      {court.name}
                    </Text>
                    {!court.is_available && (
                      <Text style={styles.courtStatus}>Nedostupan</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Select Time */}
        {selectedCourt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Izaberi vreme</Text>
            {timeSlotsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : availableTimeSlots.length === 0 ? (
              <Text style={styles.errorText}>
                Nema dostupnih termina za ovaj datum
              </Text>
            ) : (
              <>
                <View style={styles.timeGrid}>
                  {availableTimeSlots.map((slot) => (
                    <Pressable
                      key={slot.time_slot}
                      style={[
                        styles.timeSlot,
                        !slot.is_available && styles.timeSlotDisabled,
                        selectedTime.includes(slot.time_slot) &&
                          styles.timeSlotSelected,
                      ]}
                      onPress={() => toggleTime(slot.time_slot)}
                      disabled={!slot.is_available}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          !slot.is_available && styles.timeTextDisabled,
                          selectedTime.includes(slot.time_slot) &&
                            styles.timeTextSelected,
                        ]}
                      >
                        {slot.time_slot}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {selectedTime.length > 0 && (
                  <View style={styles.timeInfoCard}>
                    <FontAwesome
                      name="clock-o"
                      size={14}
                      color={isDark ? colors.accent : colors.blue}
                    />
                    <Text style={styles.timeInfoText}>
                      {selectedTime[0]}
                      {selectedTime.length > 1
                        ? ` - ${selectedTime[selectedTime.length - 1]}`
                        : ""}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Select Players */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Pozovi igrače ({selectedPlayers.length}/{followingPlayers.length})
          </Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Pretraži igrače..."
            placeholderTextColor={colors.textSecondary}
            value={playerSearchQuery}
            onChangeText={setPlayerSearchQuery}
          />
          <View style={styles.playersList}>
            {playersLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : filteredPlayers.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  {playerSearchQuery
                    ? `Nema rezultata za "${playerSearchQuery}"`
                    : "Nemaš pratioce. Prati igrače da bi ih pozvao na meč."}
                </Text>
              </View>
            ) : (
              filteredPlayers.map((player) => {
                const isSelected = selectedPlayers.includes(player.id);
                return (
                  <Pressable
                    key={player.id}
                    style={[
                      styles.playerCard,
                      isSelected && styles.playerCardSelected,
                    ]}
                    onPress={() => togglePlayer(player.id)}
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
                      <Text style={styles.playerName}>
                        {player.full_name || "Nepoznato ime"}
                      </Text>
                      {player.rating && (
                        <Text style={styles.playerLevel}>
                          Rejting: {player.rating.toFixed(1)}
                        </Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.playerCheckbox,
                        isSelected && styles.playerCheckboxSelected,
                      ]}
                    >
                      {isSelected && (
                        <FontAwesome
                          name="check"
                          size={14}
                          color={colors.background}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.createButton,
            !isFormComplete && styles.createButtonDisabled,
          ]}
          onPress={handleCreateMatch}
          disabled={!isFormComplete}
        >
          <Text style={styles.createButtonText}>Kreiraj meč</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) => {
  return StyleSheet.create({
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
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    emptyStateContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
    },
    emptyStateText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
    },
    errorText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      padding: 16,
    },
    clubScroll: {
      marginHorizontal: -20,
      paddingHorizontal: 20,
    },
    clubCard: {
      width: 200,
      height: 120,
      borderRadius: 12,
      marginRight: 12,
      overflow: "hidden",
      position: "relative",
      borderWidth: 2,
      borderColor: "transparent",
    },
    clubCardSelected: {
      borderColor: isDark ? colors.accent : colors.blue,
    },
    clubImage: {
      width: "100%",
      height: "100%",
    },
    clubOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 12,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    clubName: {
      color: "#F2F2F2",
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    clubDistance: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    clubDistanceText: {
      color: "#F2F2F2",
      fontSize: 12,
    },
    selectedBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: isDark ? colors.accent : colors.blue,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedClubCard: {
      height: 140,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 8,
    },
    selectedClubImage: {
      borderRadius: 16,
    },
    selectedClubOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
      padding: 20,
    },
    selectedClubContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    selectedClubCheckBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedClubTextContainer: {
      flex: 1,
    },
    selectedClubName: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 4,
    },
    selectedClubLocationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    selectedClubAddress: {
      color: "rgba(255,255,255,0.9)",
      fontSize: 13,
      flex: 1,
    },
    inputCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: isDark ? colors.cardBackground : colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    inputText: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    timeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    timeSlot: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: isDark ? colors.cardBackground : colors.surface,
      borderWidth: 2,
      borderColor: "transparent",
    },
    timeSlotSelected: {
      backgroundColor: isDark ? colors.accent : colors.blue,
      borderColor: isDark ? colors.accent : colors.blue,
    },
    timeSlotDisabled: {
      opacity: 0.4,
      backgroundColor: isDark ? "#1E1F23" : colors.border,
    },
    timeText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    timeTextSelected: {
      color: isDark ? colors.background : "#FFFFFF",
    },
    timeTextDisabled: {
      color: colors.textSecondary,
    },
    timeInfoCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: isDark ? "#1E1F23" : colors.surface,
      borderRadius: 12,
      padding: 12,
      marginTop: 12,
    },
    timeInfoText: {
      color: colors.textSecondary,
      fontSize: 13,
      flex: 1,
    },
    courtGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    courtCard: {
      flex: 1,
      minWidth: "45%",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: isDark ? colors.cardBackground : colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: "transparent",
    },
    courtCardSelected: {
      borderColor: isDark ? colors.accent : colors.blue,
    },
    courtCardDisabled: {
      opacity: 0.5,
    },
    courtName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
    courtNameDisabled: {
      color: colors.textSecondary,
    },
    courtStatus: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    searchInput: {
      backgroundColor: isDark ? colors.cardBackground : colors.surface,
      borderRadius: 12,
      padding: 16,
      color: colors.text,
      fontSize: 16,
      marginBottom: 16,
    },
    playersList: {
      gap: 12,
    },
    playerCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: isDark ? colors.cardBackground : colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 2,
      borderColor: "transparent",
    },
    playerCardSelected: {
      borderColor: isDark ? colors.accent : colors.blue,
    },
    playerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    playerInfo: {
      flex: 1,
    },
    playerName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    playerLevel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    playerCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    playerCheckboxSelected: {
      backgroundColor: isDark ? colors.accent : colors.blue,
      borderColor: isDark ? colors.accent : colors.blue,
    },
    footer: {
      padding: 20,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#1E1F23" : colors.border,
    },
    createButton: {
      backgroundColor: isDark ? colors.accent : colors.blue,
      borderRadius: 24,
      paddingVertical: 16,
      alignItems: "center",
    },
    createButtonDisabled: {
      backgroundColor: isDark ? "#3D3D3D" : colors.blue,
      opacity: isDark ? 0.5 : 0.45,
    },
    createButtonText: {
      color: isDark ? colors.background : "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
};
