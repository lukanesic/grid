import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PAYMENT_HISTORY } from "../../../constants/data";

export default function SubscriptionBillingScreen() {
  const router = useRouter();
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
        </Pressable>
        <Text style={styles.headerTitle}>Pretplata i naplata</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trenutni plan</Text>
          <View style={styles.currentPlanCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.currentPlanName}>Free Plan</Text>
                <Text style={styles.currentPlanPrice}>0 € / mesečno</Text>
              </View>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>FREE</Text>
              </View>
            </View>
            <Text style={styles.planDescription}>
              Osnovna verzija sa ograničenim mogućnostima
            </Text>
            <Pressable style={styles.upgradeButton}>
              <FontAwesome name="arrow-up" size={16} color="#0B0B0B" />
              <Text style={styles.upgradeButtonText}>Nadogradi plan</Text>
            </Pressable>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Način plaćanja</Text>
          <Pressable style={styles.paymentCard}>
            <View style={styles.paymentLeft}>
              <View style={styles.cardIcon}>
                <FontAwesome name="credit-card" size={20} color="#F2F2F2" />
              </View>
              <View>
                <Text style={styles.paymentTitle}>•••• •••• •••• 4242</Text>
                <Text style={styles.paymentSubtitle}>Ističe 12/27</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#8B8B8B" />
          </Pressable>
          <Pressable
            style={styles.addPaymentButton}
            onPress={() => setShowAddCardModal(true)}
          >
            <FontAwesome name="plus" size={16} color="#3867FF" />
            <Text style={styles.addPaymentText}>Dodaj novu karticu</Text>
          </Pressable>
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Istorija plaćanja</Text>
            <Pressable>
              <Text style={styles.seeAllText}>Sve</Text>
            </Pressable>
          </View>
          {PAYMENT_HISTORY.map((payment) => (
            <View key={payment.id} style={styles.paymentHistoryCard}>
              <View style={styles.paymentHistoryLeft}>
                <View
                  style={[
                    styles.statusIcon,
                    payment.status === "success" && styles.statusIconSuccess,
                  ]}
                >
                  <FontAwesome
                    name="check"
                    size={12}
                    color={payment.status === "success" ? "#B8FF00" : "#8B8B8B"}
                  />
                </View>
                <View>
                  <Text style={styles.paymentHistoryTitle}>{payment.plan}</Text>
                  <Text style={styles.paymentHistoryDate}>{payment.date}</Text>
                </View>
              </View>
              <View style={styles.paymentHistoryRight}>
                <Text style={styles.paymentHistoryAmount}>
                  {payment.amount}
                </Text>
                <Pressable>
                  <FontAwesome name="download" size={14} color="#8B8B8B" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Next Billing */}
        <View style={styles.infoCard}>
          <FontAwesome name="info-circle" size={16} color="#3867FF" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>
              Sledeća naplata:{" "}
              <Text style={styles.infoTextBold}>15.02.2026</Text>
            </Text>
            <Text style={styles.infoTextSmall}>
              Možete otkazati pretplatu bilo kada
            </Text>
          </View>
        </View>

        {/* Cancel Subscription */}
        <Pressable style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Otkaži pretplatu</Text>
        </Pressable>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dodaj novu karticu</Text>
              <Pressable onPress={() => setShowAddCardModal(false)}>
                <FontAwesome name="close" size={24} color="#F2F2F2" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Broj kartice</Text>
                <View style={styles.inputCard}>
                  <FontAwesome name="credit-card" size={18} color="#8B8B8B" />
                  <TextInput
                    style={styles.input}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#8B8B8B"
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ime na kartici</Text>
                <View style={styles.inputCard}>
                  <FontAwesome name="user" size={18} color="#8B8B8B" />
                  <TextInput
                    style={styles.input}
                    value={cardName}
                    onChangeText={setCardName}
                    placeholder="Ime Prezime"
                    placeholderTextColor="#8B8B8B"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Važi do</Text>
                  <View style={styles.inputCard}>
                    <FontAwesome name="calendar" size={18} color="#8B8B8B" />
                    <TextInput
                      style={styles.input}
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                      placeholder="MM/GG"
                      placeholderTextColor="#8B8B8B"
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <View style={styles.inputCard}>
                    <FontAwesome name="lock" size={18} color="#8B8B8B" />
                    <TextInput
                      style={styles.input}
                      value={cvv}
                      onChangeText={setCvv}
                      placeholder="123"
                      placeholderTextColor="#8B8B8B"
                      keyboardType="number-pad"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>

              <View style={styles.securityNote}>
                <FontAwesome name="shield" size={16} color="#3867FF" />
                <Text style={styles.securityNoteText}>
                  Tvoji podaci su sigurni i šifrovani
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowAddCardModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Otkaži</Text>
              </Pressable>
              <Pressable
                style={styles.modalSaveButton}
                onPress={() => {
                  // Handle save card logic here
                  setShowAddCardModal(false);
                  setCardNumber("");
                  setCardName("");
                  setExpiryDate("");
                  setCvv("");
                }}
              >
                <Text style={styles.modalSaveButtonText}>Sačuvaj</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    color: "#3867FF",
    fontSize: 14,
    fontWeight: "600",
  },
  currentPlanCard: {
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 20,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  currentPlanName: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  currentPlanPrice: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  freeBadge: {
    backgroundColor: "#2C2C2C",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  freeBadgeText: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "700",
  },
  planDescription: {
    color: "#8B8B8B",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: "#B8FF00",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  upgradeButtonText: {
    color: "#0B0B0B",
    fontSize: 15,
    fontWeight: "700",
  },
  paymentCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1E1F23",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentTitle: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentSubtitle: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#121418",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#2C2C2C",
    borderStyle: "dashed",
  },
  addPaymentText: {
    color: "#3867FF",
    fontSize: 15,
    fontWeight: "600",
  },
  paymentHistoryCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentHistoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1E1F23",
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconSuccess: {
    backgroundColor: "rgba(184, 255, 0, 0.1)",
  },
  paymentHistoryTitle: {
    color: "#F2F2F2",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentHistoryDate: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  paymentHistoryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  paymentHistoryAmount: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoText: {
    color: "#8B8B8B",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  infoTextBold: {
    color: "#F2F2F2",
    fontWeight: "600",
  },
  infoTextSmall: {
    color: "#8B8B8B",
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  cancelButtonText: {
    color: "#FF4444",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0B0B0B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    color: "#F2F2F2",
    fontSize: 22,
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#8B8B8B",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    color: "#F2F2F2",
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  securityNote: {
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  securityNoteText: {
    color: "#8B8B8B",
    fontSize: 13,
    flex: 1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: "#B8FF00",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalSaveButtonText: {
    color: "#0B0B0B",
    fontSize: 16,
    fontWeight: "700",
  },
});
