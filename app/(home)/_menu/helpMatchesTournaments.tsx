import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../contexts/ThemeContext";

const MATCH_FLOW = [
  "Izaberi tip meča (otvoren, kompletan, turnir)",
  "Odaberi klub, datum i termin",
  "Pozovi igrače ili ostavi otvoreno mesto",
  "Potvrdi rezervaciju i podeli detalje",
];

const TOURNAMENT_RULES = [
  "Prijave se zatvaraju 24h pre početka",
  "Propušten meč bez najave = automatski poraz",
  "Rezultati se unose odmah nakon meča",
  "U slučaju nerešenog, odlučuje tie-break",
];

export default function HelpMatchesTournamentsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Mečevi i turniri</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.heroCard}>
          <FontAwesome
            name="trophy"
            size={18}
            color={isDark ? "#B8FF00" : colors.blue}
          />
          <Text style={styles.heroText}>
            Vodič za kreiranje mečeva, upravljanje prijavama i osnovna pravila
            turnira.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Kako kreirati meč</Text>
          {MATCH_FLOW.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepDotText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Pravila turnira</Text>
          {TOURNAMENT_RULES.map((rule, index) => (
            <View key={index} style={styles.ruleRow}>
              <FontAwesome
                name="check"
                size={12}
                color={isDark ? "#B8FF00" : colors.blue}
              />
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <FontAwesome name="lightbulb-o" size={16} color="#FFB020" />
          <Text style={styles.tipText}>
            Za bolji odaziv igrača, objavi meč minimum 48h unapred i jasno
            naznači nivo igre.
          </Text>
        </View>
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    heroCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 14,
      flexDirection: "row",
      gap: 10,
      marginBottom: 14,
    },
    heroText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    sectionCard: {
      backgroundColor: isDark ? "#121418" : colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      gap: 10,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    stepRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    stepDot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "#1E1F23" : colors.background,
    },
    stepDotText: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "700",
    },
    stepText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    ruleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    ruleText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    tipCard: {
      backgroundColor: isDark
        ? "rgba(255,176,32,0.10)"
        : "rgba(255,176,32,0.12)",
      borderWidth: 1,
      borderColor: "rgba(255,176,32,0.35)",
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      gap: 10,
    },
    tipText: {
      flex: 1,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
    },
  });
