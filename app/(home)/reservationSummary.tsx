import { createCourtReservation } from "@/lib/courtApi";
import { FontAwesome } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReservationSummaryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    clubName,
    clubAddress,
    clubPrice,
    date,
    time,
    courtId,
    courtName,
    playerNames,
    playerIds,
    reservationDate,
  } = useLocalSearchParams();

  const players = playerNames ? (playerNames as string).split(",") : [];
  const invitedPlayerIds = playerIds ? (playerIds as string).split(",") : [];
  const serviceFeeRsd = 23; // Fixed service fee in RSD
  const hourlyRateRsd = parseFloat((clubPrice as string) || "0");

  // Calculate duration-based price
  const timeValue = String(time || "");
  const hasRange = timeValue.includes("-");
  const hours = hasRange ? 2 : 1; // 2 hours if range, 1 hour if single slot
  const priceRsd = Math.round(hourlyRateRsd * hours);
  const totalRsd = priceRsd + serviceFeeRsd;
  const duration = hasRange ? "120 min" : "60 min";
  const durationMinutes = hours * 60;

  // Parse time range
  const [startTime, endTime] = hasRange
    ? time.toString().split(" - ")
    : [time.toString(), ""];
  const calculatedEndTime =
    endTime ||
    `${parseInt(startTime.split(":")[0]) + hours}:${startTime.split(":")[1]}`;

  const handleConfirmReservation = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await createCourtReservation({
        court_id: courtId as string,
        reservation_date: reservationDate as string,
        start_time: startTime,
        end_time: calculatedEndTime,
        duration_minutes: durationMinutes,
        total_price: totalRsd,
        currency: "RSD",
        invited_players: invitedPlayerIds,
        notes: `Meč u ${clubName}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["openReservations"] });
      queryClient.invalidateQueries({ queryKey: ["userReservations"] });

      Alert.alert(
        "Uspešno!",
        "Rezervacija je potvrđena. Meč je sada vidljiv u otvorenim mečevima.",
        [
          {
            text: "OK",
            onPress: () => {
              router.dismissAll();
              router.replace("/(home)/(tabs)");
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      Alert.alert(
        "Greška",
        error.message || "Došlo je do greške prilikom kreiranja rezervacije.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.modalContent}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Potvrda rezervacije</Text>
            <Text style={styles.headerSubtitle}>Pregled detalja</Text>
          </View>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <FontAwesome name="close" size={18} color="#666666" />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Details List */}
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Klub</Text>
              <Text style={styles.detailValue}>{clubName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lokacija</Text>
              <Text style={styles.detailValue}>{clubAddress}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Datum</Text>
              <Text style={styles.detailValue}>{date}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vreme</Text>
              <Text style={styles.detailValue}>{time}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Teren</Text>
              <Text style={styles.detailValue}>{courtName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trajanje</Text>
              <Text style={styles.detailValue}>{duration}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tip meča</Text>
              <Text style={styles.detailValue}>Rekreativni</Text>
            </View>

            {players.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Igrači</Text>
                <Text style={styles.detailValue}>{players.join(", ")}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pozvano igrača</Text>
              <Text style={styles.detailValue}>{players.length}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Iznos za teren</Text>
              <Text style={styles.detailValue}>{priceRsd} RSD</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Servisna naknada</Text>
              <Text style={styles.detailValue}>{serviceFeeRsd} RSD</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Način plaćanja</Text>
              <Text style={styles.detailValue}>Keš</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Ukupno</Text>
              <Text style={styles.totalPrice}>{totalRsd} RSD</Text>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>Napomena</Text>
              <Text style={styles.noteText}>
                Rezervaciju možeš otkazati do 60 minuta pre početka termina.
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.confirmButton,
              isSubmitting && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmReservation}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>
                Potvrdite rezervaciju
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  headerSubtitle: {
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
  content: {
    paddingHorizontal: 24,
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: "#999999",
    fontWeight: "400",
  },
  detailValue: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  divider: {
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
  noteCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 18,
  },
  footer: {
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
  confirmButtonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
