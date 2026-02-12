import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface QRCardProps {
  username: string;
  subtitle: string;
  onShare: () => void;
}

export default function QRCard({ username, subtitle, onShare }: QRCardProps) {
  return (
    <View style={styles.qrCard}>
      <View style={styles.qrCodePlaceholder}>
        <FontAwesome name="qrcode" size={80} color="#3D3D3D" />
      </View>
      <Text style={styles.qrTitle}>{username}</Text>
      <Text style={styles.qrSubtitle}>{subtitle}</Text>
      <Pressable style={styles.shareQrButton} onPress={onShare}>
        <FontAwesome name="share-alt" size={16} color="#0B0B0B" />
        <Text style={styles.shareQrButtonText}>Podeli QR kod</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  qrCard: {
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  qrCodePlaceholder: {
    width: 140,
    height: 140,
    backgroundColor: "#1E1F23",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  qrTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  qrSubtitle: {
    color: "#8B8B8B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  shareQrButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B8FF00",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  shareQrButtonText: {
    color: "#0B0B0B",
    fontSize: 16,
    fontWeight: "600",
  },
});
