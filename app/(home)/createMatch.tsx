import { Calendar } from "@/components";
import { HOT_PLAYERS, MARKED_DATES, SUGGESTED_PLAYERS } from "@/constants/data";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

const CLUBS = [
  {
    id: 1,
    name: "CN Montjuïc",
    image:
      "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
    distance: "3km",
    address: "Carrer de Segura, 1, 08004 Barcelona",
    price: 17,
  },
  {
    id: 2,
    name: "Eurofitness Vall d'Hebron",
    image:
      "https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg",
    distance: "5km",
    address: "Passeig de la Vall d'Hebron, 171, 08035 Barcelona",
    price: 11,
  },
  {
    id: 3,
    name: "Club Esportiu Europa",
    image:
      "https://images.pexels.com/photos/34116480/pexels-photo-34116480.jpeg",
    distance: "2km",
    address: "Carrer de Provença, 480, 08025 Barcelona",
    price: 15,
  },
];

const TIME_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const COURTS = [
  { id: 1, name: "Teren 1", available: true },
  { id: 2, name: "Teren 2", available: true },
  { id: 3, name: "Teren 3", available: false },
  { id: 4, name: "Teren 4", available: true },
];

const AVAILABLE_PLAYERS = [
  ...SUGGESTED_PLAYERS.map((player, index) => ({
    id: `suggested-${index + 1}`,
    name: player.name,
    avatar: player.avatar,
    level: player.level,
  })),
  ...HOT_PLAYERS.map((player) => ({
    id: String(player.id),
    name: player.name,
    avatar: player.avatar,
    level: player.level,
  })),
].filter(
  (player, index, allPlayers) =>
    index === allPlayers.findIndex((item) => item.name === player.name),
);

export default function CreateMatchScreen() {
  const router = useRouter();
  const { clubId } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [selectedClub, setSelectedClub] = useState<number | null>(
    clubId ? Number(clubId) : null,
  );
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedTime, setSelectedTime] = useState<string[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");

  const styles = getStyles(colors, isDark);
  const isFormComplete =
    !!selectedClub && selectedTime.length > 0 && !!selectedCourt;
  const filteredPlayers = AVAILABLE_PLAYERS.filter((player) =>
    player.name.toLowerCase().includes(playerSearchQuery.trim().toLowerCase()),
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

  const toggleTime = (time: string) => {
    // If clicking already selected time
    if (selectedTime.includes(time)) {
      // Only allow removing if it's at the start or end of selection
      const timeIndex = TIME_SLOTS.indexOf(time);
      const selectedIndices = selectedTime.map((t) => TIME_SLOTS.indexOf(t));
      const minIndex = Math.min(...selectedIndices);
      const maxIndex = Math.max(...selectedIndices);

      if (timeIndex === minIndex || timeIndex === maxIndex) {
        setSelectedTime(selectedTime.filter((t) => t !== time));
      }
      return;
    }

    // If no times selected, add this one
    if (selectedTime.length === 0) {
      setSelectedTime([time]);
      return;
    }

    // Get indices of all time slots
    const clickedIndex = TIME_SLOTS.indexOf(time);
    const selectedIndices = selectedTime.map((t) => TIME_SLOTS.indexOf(t));
    const minIndex = Math.min(...selectedIndices);
    const maxIndex = Math.max(...selectedIndices);

    // Check if clicked time is consecutive (immediately before or after current selection)
    if (clickedIndex === minIndex - 1) {
      // Adding to the beginning
      setSelectedTime([time, ...selectedTime]);
    } else if (clickedIndex === maxIndex + 1) {
      // Adding to the end
      setSelectedTime([...selectedTime, time]);
    }
    // If not consecutive, do nothing (ignore the click)
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
    if (!selectedClub || selectedTime.length === 0 || !selectedCourt) {
      return;
    }

    const club = CLUBS.find((c) => c.id === selectedClub);
    const playerNamesStr = selectedPlayers
      .map((id) => AVAILABLE_PLAYERS.find((p) => p.id === id)?.name)
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
        clubPrice: club?.price || 0,
        date: formatDate(selectedDate),
        time: timeStr,
        court: selectedCourt,
        playerNames: playerNamesStr,
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.clubScroll}
          >
            {CLUBS.map((club) => (
              <Pressable
                key={club.id}
                style={[
                  styles.clubCard,
                  selectedClub === club.id && styles.clubCardSelected,
                ]}
                onPress={() => setSelectedClub(club.id)}
              >
                <Image source={{ uri: club.image }} style={styles.clubImage} />
                <View style={styles.clubOverlay}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <View style={styles.clubDistance}>
                    <FontAwesome name="map-marker" size={12} color="#F2F2F2" />
                    <Text style={styles.clubDistanceText}>{club.distance}</Text>
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
        </View>

        {/* Select Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Izaberi datum</Text>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            markedDates={MARKED_DATES}
          />
        </View>

        {/* Select Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Izaberi vreme</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => (
              <Pressable
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime.includes(time) && styles.timeSlotSelected,
                ]}
                onPress={() => toggleTime(time)}
              >
                <Text
                  style={[
                    styles.timeText,
                    selectedTime.includes(time) && styles.timeTextSelected,
                  ]}
                >
                  {time}
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
        </View>

        {/* Select Court */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Izaberi teren</Text>
          <View style={styles.courtGrid}>
            {COURTS.map((court) => (
              <Pressable
                key={court.id}
                style={[
                  styles.courtCard,
                  !court.available && styles.courtCardDisabled,
                  selectedCourt === court.id && styles.courtCardSelected,
                ]}
                onPress={() => court.available && setSelectedCourt(court.id)}
                disabled={!court.available}
              >
                <FontAwesome
                  name="circle"
                  size={16}
                  color={
                    selectedCourt === court.id
                      ? isDark
                        ? colors.accent
                        : colors.blue
                      : court.available
                        ? isDark
                          ? colors.accent
                          : colors.blue
                        : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.courtName,
                    !court.available && styles.courtNameDisabled,
                  ]}
                >
                  {court.name}
                </Text>
                {!court.available && (
                  <Text style={styles.courtStatus}>Zauzet</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Select Players */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Pozovi igrače ({selectedPlayers.length}/{AVAILABLE_PLAYERS.length})
          </Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Pretraži igrače..."
            placeholderTextColor={colors.textSecondary}
            value={playerSearchQuery}
            onChangeText={setPlayerSearchQuery}
          />
          <View style={styles.playersList}>
            {filteredPlayers.map((player) => {
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
                    source={{ uri: player.avatar }}
                    style={styles.playerAvatar}
                  />
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerLevel}>Nivo: {player.level}</Text>
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
            })}
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
    timeText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    timeTextSelected: {
      color: isDark ? colors.background : "#FFFFFF",
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
