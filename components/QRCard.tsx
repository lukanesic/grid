import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "../contexts/ThemeContext";

interface QRCardProps {
  userId: string;
  username: string;
  subtitle: string;
  onShare: () => void;
  onScan?: () => void;
}

export default function QRCard({
  userId,
  username,
  subtitle,
  onShare,
  onScan,
}: QRCardProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);

  const buttonColor = isDark ? colors.accent : colors.blue;

  // QR code data - contains user information for following
  const qrData = JSON.stringify({
    type: "grid_user",
    userId: userId,
    username: username,
    timestamp: Date.now(),
  });

  return (
    <View style={styles.qrCard}>
      <View style={styles.qrCodeContainer}>
        <QRCode
          value={qrData}
          size={140}
          backgroundColor={colors.background}
          color={colors.text}
        />
      </View>
      <Text style={styles.qrTitle}>{username}</Text>
      <Text style={styles.qrSubtitle}>{subtitle}</Text>
      <View style={styles.buttonContainer}>
        {onScan && (
          <Pressable
            style={[styles.scanButton, { borderColor: buttonColor }]}
            onPress={onScan}
          >
            <FontAwesome name="camera" size={16} color={buttonColor} />
            <Text style={[styles.scanButtonText, { color: buttonColor }]}>
              Skeniraj
            </Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.shareQrButton, { backgroundColor: buttonColor }]}
          onPress={onShare}
        >
          <FontAwesome name="share-alt" size={16} color={colors.background} />
          <Text style={styles.shareQrButtonText}>Podeli</Text>
        </Pressable>
      </View>
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
    qrCodeContainer: {
      width: 160,
      height: 160,
      backgroundColor: colors.background,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
    },
    scanButton: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingVertical: 12,
      gap: 8,
      borderWidth: 2,
      flex: 1,
      justifyContent: "center",
    },
    scanButtonText: {
      fontSize: 16,
      fontWeight: "600",
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
      flex: 1,
      justifyContent: "center",
    },
    shareQrButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
  });
