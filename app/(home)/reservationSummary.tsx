import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const CLUBS_DATA: { [key: string]: any } = {
  "1": {
    name: "CN Montjuïc",
    image:
      "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
    price: 17,
    address: "Carrer de Segura, 1, 08004 Barcelona",
  },
  "2": {
    name: "Eurofitness Vall d'Hebron",
    image:
      "https://images.pexels.com/photos/27151849/pexels-photo-27151849.jpeg",
    price: 11,
    address: "Passeig de la Vall d'Hebron, 171, 08035 Barcelona",
  },
  "3": {
    name: "Club Esportiu Europa",
    image:
      "https://images.pexels.com/photos/34116480/pexels-photo-34116480.jpeg",
    price: 15,
    address: "Carrer de Provença, 480, 08025 Barcelona",
  },
};

export default function ReservationSummaryScreen() {
  const router = useRouter();
  const { clubId, date, time, court, playerNames } = useLocalSearchParams();

  const club = CLUBS_DATA[clubId as string];
  const players = playerNames ? (playerNames as string).split(",") : [];

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={() => router.push("/(home)/(tabs)")}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Detalji</Text>
            <Pressable onPress={() => router.push("/(home)/(tabs)")}>
              <FontAwesome name="close" size={24} color="#1A1A1A" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Club Name */}
            <Text style={styles.clubName}>{club?.name}</Text>
            <Text style={styles.clubSubtitle}>
              {players.length > 0
                ? `${players.length} ${players.length === 1 ? "igra\u010d" : "igra\u010da"}`
                : "Teren rezervisan"}
            </Text>

            {/* Details List */}
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lokacija</Text>
                <Text style={styles.detailValue}>{club?.address}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Kada</Text>
                <Text style={styles.detailValue}>
                  {date}, {time}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Teren</Text>
                <Text style={styles.detailValue}>Teren {court}</Text>
              </View>

              {players.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Igra\u010di</Text>
                  <Text style={styles.detailValue}>{players.join(", ")}</Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Iznos</Text>
                <Text style={styles.detailValueBold}>{club?.price} \u20ac</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Servisna naknada</Text>
                <Text style={styles.detailValue}>0.20 \u20ac</Text>
              </View>
            </View>

            {/* Transaction Number */}
            <Text style={styles.transactionNumber}>
              Broj transakcije #REZ{clubId}
              {court}
              {new Date().getTime().toString().slice(-6)}
            </Text>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  content: {
    paddingHorizontal: 24,
  },
  clubName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  clubSubtitle: {
    fontSize: 15,
    color: "#666666",
    marginBottom: 32,
  },
  detailsList: {
    gap: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 15,
    color: "#999999",
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: "#1A1A1A",
    textAlign: "right",
    flex: 1.5,
  },
  detailValueBold: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "right",
    flex: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  transactionNumber: {
    fontSize: 13,
    color: "#CCCCCC",
    marginTop: 32,
    textAlign: "center",
  },
});
