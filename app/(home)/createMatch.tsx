import { Calendar } from "@/components";
import { MARKED_DATES } from "@/constants/data";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const PLAYERS = [
  {
    id: 1,
    name: "Marija López García",
    avatar: "https://i.pravatar.cc/150?img=47",
    level: "1.1",
  },
  {
    id: 2,
    name: "Arturo Pérez Reverte",
    avatar: "https://i.pravatar.cc/150?img=33",
    level: "1.1",
  },
  {
    id: 3,
    name: "Elsa Schiavone",
    avatar: "https://i.pravatar.cc/150?img=20",
    level: "1.1",
  },
  {
    id: 4,
    name: "Carlos Mendoza",
    avatar: "https://i.pravatar.cc/150?img=52",
    level: "2.0",
  },
];

export default function CreateMatchScreen() {
  const router = useRouter();
  const { clubId } = useLocalSearchParams();
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
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showModal) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal, fadeAnim]);

  const togglePlayer = (playerId: number) => {
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

    setShowModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
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
                    <FontAwesome name="check" size={14} color="#0B0B0B" />
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
              <FontAwesome name="clock-o" size={14} color="#3867FF" />
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
                      ? "#B8FF00"
                      : court.available
                        ? "#3867FF"
                        : "#8B8B8B"
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
            Pozovi igrače ({selectedPlayers.length}/3)
          </Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Pretraži igrače..."
            placeholderTextColor="#8B8B8B"
          />
          <View style={styles.playersList}>
            {PLAYERS.map((player) => {
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
                      <FontAwesome name="check" size={14} color="#0B0B0B" />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* <View style={{ height: 100 }} /> */}
      </ScrollView>

      {/* Create Button */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.createButton,
            (!selectedClub || !selectedTime || !selectedCourt) &&
              styles.createButtonDisabled,
          ]}
          onPress={handleCreateMatch}
          disabled={!selectedClub || !selectedTime || !selectedCourt}
        >
          <Text style={styles.createButtonText}>Kreiraj meč</Text>
        </Pressable>
      </View>

      {/* Reservation Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowModal(false)}
          />
          <View style={styles.modalContent}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Potvrda rezervacije</Text>
                <Text style={styles.modalSubheader}>Pregled detalja</Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <FontAwesome name="close" size={18} color="#666666" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Club Info */}
              <View style={styles.simpleRow}>
                <Text style={styles.simpleLabel}>Klub</Text>
                <Text style={styles.simpleValue}>
                  {CLUBS.find((c) => c.id === selectedClub)?.name}
                </Text>
              </View>

              <View style={styles.simpleRow}>
                <Text style={styles.simpleLabel}>Lokacija</Text>
                <Text style={styles.simpleValue}>
                  {CLUBS.find((c) => c.id === selectedClub)?.address}
                </Text>
              </View>

              <View style={styles.simpleRow}>
                <Text style={styles.simpleLabel}>Datum</Text>
                <Text style={styles.simpleValue}>
                  {formatDate(selectedDate)}
                </Text>
              </View>

              <View style={styles.simpleRow}>
                <Text style={styles.simpleLabel}>Vreme</Text>
                <Text style={styles.simpleValue}>
                  {selectedTime.length === 1
                    ? selectedTime[0]
                    : `${selectedTime[0]} - ${selectedTime[selectedTime.length - 1]}`}
                </Text>
              </View>

              <View style={styles.simpleRow}>
                <Text style={styles.simpleLabel}>Teren</Text>
                <Text style={styles.simpleValue}>Teren {selectedCourt}</Text>
              </View>

              {selectedPlayers.length > 0 && (
                <View style={styles.simpleRow}>
                  <Text style={styles.simpleLabel}>Igrači</Text>
                  <Text style={styles.simpleValue}>
                    {selectedPlayers
                      .map((id) => PLAYERS.find((p) => p.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </View>
              )}

              <View style={styles.simpleDivider} />

              <View style={styles.simpleRow}>
                <Text style={styles.simpleLabel}>Iznos za teren</Text>
                <Text style={styles.simpleValue}>
                  {CLUBS.find((c) => c.id === selectedClub)?.price} €
                </Text>
              </View>

              <View style={styles.simpleRow}>
                <Text style={styles.simpleLabel}>Servisna naknada</Text>
                <Text style={styles.simpleValue}>0.20 €</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Ukupno</Text>
                <Text style={styles.totalPrice}>
                  {(
                    parseFloat(
                      String(
                        CLUBS.find((c) => c.id === selectedClub)?.price || 0,
                      ),
                    ) + 0.2
                  ).toFixed(2)}{" "}
                  €
                </Text>
              </View>
            </ScrollView>

            {/* Confirm Button */}
            <View style={styles.modalFooter}>
              <Pressable
                style={styles.confirmButton}
                onPress={() => {
                  setShowModal(false);
                  router.push("/(home)/(tabs)");
                }}
              >
                <Text style={styles.confirmButtonText}>
                  Potvrdite rezervaciju
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: "#F2F2F2",
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
    color: "#F2F2F2",
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
    borderColor: "#B8FF00",
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
    backgroundColor: "#B8FF00",
    alignItems: "center",
    justifyContent: "center",
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
  },
  inputText: {
    flex: 1,
    color: "#F2F2F2",
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
    backgroundColor: "#121418",
    borderWidth: 2,
    borderColor: "transparent",
  },
  timeSlotSelected: {
    backgroundColor: "#B8FF00",
    borderColor: "#B8FF00",
  },
  timeText: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
  },
  timeTextSelected: {
    color: "#0B0B0B",
  },
  timeInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  timeInfoText: {
    color: "#8B8B8B",
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
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  courtCardSelected: {
    borderColor: "#B8FF00",
  },
  courtCardDisabled: {
    opacity: 0.5,
  },
  courtName: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  courtNameDisabled: {
    color: "#8B8B8B",
  },
  courtStatus: {
    color: "#8B8B8B",
    fontSize: 12,
  },
  searchInput: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    color: "#F2F2F2",
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
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  playerCardSelected: {
    borderColor: "#B8FF00",
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
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  playerLevel: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  playerCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8B8B8B",
    alignItems: "center",
    justifyContent: "center",
  },
  playerCheckboxSelected: {
    backgroundColor: "#B8FF00",
    borderColor: "#B8FF00",
  },
  footer: {
    padding: 20,
    backgroundColor: "#0B0B0B",
    borderTopWidth: 1,
    borderTopColor: "#1E1F23",
  },
  createButton: {
    backgroundColor: "#B8FF00",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#3D3D3D",
    opacity: 0.5,
  },
  createButtonText: {
    color: "#0B0B0B",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  modalSubheader: {
    fontSize: 14,
    color: "#999999",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  confirmButton: {
    backgroundColor: "#3867FF",
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3867FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  simpleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  simpleLabel: {
    fontSize: 15,
    color: "#999999",
    fontWeight: "400",
  },
  simpleValue: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  simpleDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    color: "#1A1A1A",
    fontWeight: "700",
  },
  totalPrice: {
    fontSize: 32,
    color: "#3867FF",
    fontWeight: "800",
  },
});
