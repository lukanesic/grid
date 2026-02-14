import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuCard, MenuHeader } from "../../../components/menu";
import { useTheme } from "../../../contexts/ThemeContext";

const SECURITY_CHECKLIST = [
  { label: "Aktivirana dvofaktorska autentifikacija", done: true },
  { label: "Jaka lozinka (min 12 karaktera)", done: true },
  { label: "Provereni aktivni uređaji", done: false },
  { label: "Uključen login alert putem e-maila", done: false },
];

const INCIDENT_STEPS = [
  "Promeni lozinku odmah",
  "Odjavi sve ostale sesije",
  "Proveri aktivne uređaje i ukloni nepoznate",
  "Kontaktiraj podršku ako primetiš sumnjive aktivnosti",
];

export default function HelpSecurityScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const completed = SECURITY_CHECKLIST.filter((item) => item.done).length;
  const percent = Math.round((completed / SECURITY_CHECKLIST.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <MenuHeader title="Bezbednost" onBack={() => router.back()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <MenuCard style={styles.scoreCard}>
          <View style={styles.scoreIconWrap}>
            <FontAwesome name="shield" size={20} color={colors.blue} />
          </View>
          <View style={styles.scoreTextWrap}>
            <Text style={styles.scoreTitle}>Security Health</Text>
            <Text style={styles.scoreValue}>{percent}%</Text>
          </View>
        </MenuCard>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>

        <MenuCard style={styles.block}>
          <Text style={styles.blockTitle}>Kontrolna lista</Text>
          {SECURITY_CHECKLIST.map((item, index) => (
            <View key={index} style={styles.checkRow}>
              <FontAwesome
                name={item.done ? "check-circle" : "circle-o"}
                size={16}
                color={
                  item.done
                    ? isDark
                      ? "#B8FF00"
                      : colors.blue
                    : colors.textSecondary
                }
              />
              <Text style={styles.checkLabel}>{item.label}</Text>
            </View>
          ))}
        </MenuCard>

        <View style={styles.alertCard}>
          <FontAwesome name="exclamation-triangle" size={16} color="#FFB020" />
          <View style={styles.alertTextWrap}>
            <Text style={styles.alertTitle}>Sumnjiva prijava?</Text>
            <Text style={styles.alertText}>
              Ako prepoznaš nepoznatu lokaciju ili uređaj, odmah pokreni sledeće
              korake.
            </Text>
          </View>
        </View>

        <MenuCard style={styles.block}>
          <Text style={styles.blockTitle}>Koraci u incidentu</Text>
          {INCIDENT_STEPS.map((step, index) => (
            <View key={index} style={styles.incidentRow}>
              <View style={styles.incidentIndex}>
                <Text style={styles.incidentIndexText}>{index + 1}</Text>
              </View>
              <Text style={styles.incidentText}>{step}</Text>
            </View>
          ))}
        </MenuCard>
      </ScrollView>
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
    scoreCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    scoreIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(56,103,255,0.18)"
        : "rgba(56,103,255,0.12)",
    },
    scoreTextWrap: {
      flexDirection: "row",
      flex: 1,
      justifyContent: "space-between",
      alignItems: "center",
    },
    scoreTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    scoreValue: {
      color: isDark ? "#B8FF00" : colors.blue,
      fontSize: 22,
      fontWeight: "800",
    },
    progressTrack: {
      height: 8,
      borderRadius: 99,
      backgroundColor: isDark ? "#1E1F23" : colors.border,
      overflow: "hidden",
      marginBottom: 14,
    },
    progressFill: {
      height: "100%",
      backgroundColor: isDark ? "#B8FF00" : colors.blue,
      borderRadius: 99,
    },
    block: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
      gap: 10,
    },
    blockTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    checkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    checkLabel: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      flex: 1,
    },
    alertCard: {
      flexDirection: "row",
      gap: 10,
      backgroundColor: isDark
        ? "rgba(255,176,32,0.10)"
        : "rgba(255,176,32,0.12)",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: "rgba(255,176,32,0.35)",
      marginBottom: 12,
    },
    alertTextWrap: {
      flex: 1,
    },
    alertTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 2,
    },
    alertText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
    incidentRow: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    incidentIndex: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#1E1F23" : colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 1,
    },
    incidentIndexText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "700",
    },
    incidentText: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      flex: 1,
    },
  });
