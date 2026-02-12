import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuRow, MenuSection } from "../../components";

export default function MenuScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
          </Pressable>
          <Text style={styles.headerTitle}>Nalog</Text>
        </View>

        <View style={styles.upgradeCard}>
          <View style={styles.upgradeHeader}>
            <Text style={styles.upgradeTitle}>GRID</Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
          <Text style={styles.upgradeSub}>Otključaj sve premium opcije.</Text>
          <Pressable
            style={styles.upgradeButton}
            onPress={() => router.push("/_menu/upgrade")}
          >
            <Text style={styles.upgradeButtonText}>Nadogradi</Text>
            <FontAwesome name="arrow-right" size={14} color="#111111" />
          </Pressable>
        </View>

        <MenuSection>
          {[
            {
              icon: "user",
              label: "Profil informacije",
              sub: "Lični podaci i nalog",
              onPress: () => router.push("/_menu/profileInfo"),
            },
            {
              icon: "lock",
              label: "Privatnost i bezbednost",
              sub: "Lozinka i zaštita",
              onPress: () => router.push("/_menu/privacySecurity"),
            },
            {
              icon: "credit-card",
              label: "Pretplata i naplata",
              sub: "Plan i plaćanja",
              onPress: () => router.push("/_menu/subscriptionBilling"),
            },
          ].map((item) => (
            <MenuRow
              key={item.label}
              icon={item.icon}
              title={item.label}
              subtitle={item.sub}
              showChevron
              onPress={item.onPress}
            />
          ))}
        </MenuSection>

        <MenuSection>
          <MenuRow
            icon="moon-o"
            title="Tamni režim"
            subtitle="Tema aplikacije"
            right={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#2C2C2C", true: "#3867FF" }}
                thumbColor="#F2F2F2"
              />
            }
          />
          <MenuRow
            icon="bell-o"
            title="Notifikacije"
            subtitle="Push i e-mail"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#2C2C2C", true: "#3867FF" }}
                thumbColor="#F2F2F2"
              />
            }
          />
          <MenuRow
            icon="bookmark-o"
            title="Istorija čuvanja"
            subtitle="Sačuvani mečevi"
            right={
              <Switch
                value={saveHistory}
                onValueChange={setSaveHistory}
                trackColor={{ false: "#2C2C2C", true: "#3867FF" }}
                thumbColor="#F2F2F2"
              />
            }
          />
          <MenuRow
            icon="language"
            title="Jezik"
            subtitle="Izaberi jezik"
            onPress={() => router.push("/_menu/language")}
            right={
              <View style={styles.langRight}>
                <Text style={styles.langValue}>Srpski</Text>
                <FontAwesome name="chevron-right" size={20} color="#8B8B8B" />
              </View>
            }
          />
          <MenuRow
            icon="question-circle-o"
            title="Centar za pomoć"
            subtitle="FAQ i podrška"
            showChevron
            onPress={() => router.push("/_menu/helpCenter")}
          />
          <MenuRow
            icon="info-circle"
            title="O aplikaciji"
            subtitle="Verzija i detalji"
            showChevron
            onPress={() => router.push("/_menu/aboutApp")}
          />
        </MenuSection>

        <MenuSection>
          <MenuRow
            icon="sign-out"
            title="Izloguj se"
            subtitle="Odjavi nalog"
            iconColor="#FF6B6B"
            titleColor="#FF6B6B"
          />
        </MenuSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
  },
  upgradeCard: {
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  upgradeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  upgradeTitle: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "600",
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  proBadgeText: {
    color: "#8B8B8B",
    fontSize: 10,
    fontWeight: "700",
  },
  upgradeSub: {
    color: "#8B8B8B",
    fontSize: 15,
    marginBottom: 12,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F2F2F2",
  },
  upgradeButtonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "600",
  },
  langRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langValue: {
    color: "#8B8B8B",
    fontSize: 14,
  },
});
