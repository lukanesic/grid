import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface QRCardProps {
  username: string;
  subtitle: string;
  onShare: () => void;
}

export default function QRCard({ username, subtitle, onShare }: QRCardProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);

  const buttonColor = isDark ? colors.accent : colors.blue;

  return (
    <View style={styles.qrCard}>
      <View style={styles.qrCodePlaceholder}>
        <FontAwesome name="qrcode" size={80} color={colors.textSecondary} />
      </View>
      <Text style={styles.qrTitle}>{username}</Text>
      <Text style={styles.qrSubtitle}>{subtitle}</Text>
      <Pressable
        style={[styles.shareQrButton, { backgroundColor: buttonColor }]}
        onPress={onShare}
      >
        <FontAwesome name="share-alt" size={16} color={colors.background} />
        <Text style={styles.shareQrButtonText}>Podeli QR kod</Text>
      </Pressable>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    qrCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    qrCodePlaceholder: {
      width: 140,
      height: 140,
      backgroundColor: colors.background,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    qrTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 8,
    },
    qrSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: 20,
    },
    shareQrButton: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingVertical: 12,
      gap: 8,
    },
    shareQrButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
  });
