import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuHeader, MenuInfoCard } from "../../../components/menu";
import { useTheme } from "../../../contexts/ThemeContext";

const INITIAL_DEVICES = [
  {
    id: "d1",
    name: "iPhone 16 Pro Max",
    platform: "iOS aplikacija",
    location: "Barcelona, Spain",
    lastActive: "Aktivno sada",
    current: true,
  },
  {
    id: "d2",
    name: "MacBook Pro 14",
    platform: "Safari",
    location: "Barcelona, Spain",
    lastActive: "Danas u 18:11",
    current: false,
  },
  {
    id: "d3",
    name: "iPad Air",
    platform: "iPadOS aplikacija",
    location: "Madrid, Spain",
    lastActive: "Juče u 09:42",
    current: false,
  },
];

export default function ActiveDevicesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [devices, setDevices] = useState(INITIAL_DEVICES);

  const activeCount = useMemo(
    () => devices.filter((device) => !device.current).length,
    [devices],
  );

  const handleRemoveDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((device) => device.id !== deviceId));
  };

  const handleRemoveAllOther = () => {
    setDevices((prev) => prev.filter((device) => device.current));
  };

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader title="Aktivni uređaji" onBack={() => router.back()} />

      <View style={styles.content}>
        <MenuInfoCard
          icon="mobile"
          text="Prikazani su uređaji koji su trenutno prijavljeni na tvoj nalog."
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {devices.map((device) => (
            <View key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceTop}>
                <View style={styles.deviceTitleWrap}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  {device.current && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Ovaj uređaj</Text>
                    </View>
                  )}
                </View>
                <FontAwesome
                  name={device.current ? "check-circle" : "circle-o"}
                  size={16}
                  color={device.current ? colors.blue : colors.textSecondary}
                />
              </View>

              <View style={styles.row}>
                <FontAwesome
                  name="desktop"
                  size={13}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>{device.platform}</Text>
              </View>

              <View style={styles.row}>
                <FontAwesome
                  name="map-marker"
                  size={13}
                  color={colors.textSecondary}
                />
                <Text style={styles.metaText}>{device.location}</Text>
              </View>

              <View style={styles.rowBetween}>
                <View style={styles.row}>
                  <FontAwesome
                    name="clock-o"
                    size={13}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.metaText}>{device.lastActive}</Text>
                </View>

                {!device.current && (
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => handleRemoveDevice(device.id)}
                  >
                    <Text style={styles.removeButtonText}>Odjavi</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}

          <Pressable
            style={[
              styles.removeAllButton,
              activeCount === 0 && styles.removeAllButtonDisabled,
            ]}
            onPress={handleRemoveAllOther}
            disabled={activeCount === 0}
          >
            <FontAwesome name="sign-out" size={14} color="#FFFFFF" />
            <Text style={styles.removeAllButtonText}>Odjavi sve ostale</Text>
          </Pressable>

          <View style={{ height: 16 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    deviceCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      gap: 8,
    },
    deviceTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    deviceTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
      marginRight: 8,
    },
    deviceName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      flexShrink: 1,
    },
    currentBadge: {
      backgroundColor: isDark
        ? "rgba(184,255,0,0.15)"
        : "rgba(56,103,255,0.12)",
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    currentBadgeText: {
      color: isDark ? "#B8FF00" : colors.blue,
      fontSize: 11,
      fontWeight: "700",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 2,
    },
    metaText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    removeButton: {
      backgroundColor: isDark ? "#1E1F23" : colors.background,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    removeButtonText: {
      color: isDark ? "#B8FF00" : colors.blue,
      fontSize: 12,
      fontWeight: "700",
    },
    removeAllButton: {
      marginTop: 8,
      marginBottom: 4,
      backgroundColor: "#FF3B30",
      borderRadius: 12,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    removeAllButtonDisabled: {
      opacity: 0.5,
    },
    removeAllButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
  });
