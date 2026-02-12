import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  HomeHeader,
  KrugoviTabContent,
  SveTabContent,
  VruceTabContent,
} from "../../../components";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<"sve" | "vruce" | "krugovi">(
    "sve",
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HomeHeader
          styles={styles}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Tab Content */}
        {activeTab === "sve" && <SveTabContent styles={styles} />}
        {activeTab === "vruce" && <VruceTabContent styles={styles} />}
        {activeTab === "krugovi" && <KrugoviTabContent styles={styles} />}
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  greetingSection: {
    marginBottom: 28,
  },
  greetingText: {
    color: "#F2F2F2",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  weatherText: {
    color: "#8B8B8B",
    fontSize: 14,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  pushButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#1E1F23",
  },
  pushButtonText: {
    color: "#B8FF00",
    fontSize: 14,
    fontWeight: "600",
  },
  createButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#B8FF00",
  },
  createButtonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2C",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#B8FF00",
  },
  tabText: {
    color: "#8B8B8B",
    fontSize: 14,
    fontWeight: "600",
  },
  tabActiveText: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
  },
  connectCard: {
    backgroundColor: "#1E1F23",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  avatarGroup: {
    flexDirection: "row",
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2C2C2C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1E1F23",
  },
  connectText: {
    flex: 1,
  },
  connectHeading: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
  },
  connectSubheading: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  matchesSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  matchesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  suggestedSection: {
    marginBottom: 28,
  },
  suggestedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllLink: {
    color: "#3867FF",
    fontSize: 14,
    fontWeight: "600",
  },
  playersScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  openMatchSection: {
    marginBottom: 28,
    paddingVertical: 16,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  openMatchCard: {
    width: 280,
    backgroundColor: "#1E1F23",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  matchCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  matchCardAuthor: {
    color: "#8B8B8B",
    fontSize: 12,
  },
  openMatchType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  openMatchTitle: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "700",
  },
  matchMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  metaTag: {
    backgroundColor: "#2C2C2C",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaTagText: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
  },
  openMatchDate: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  openMatchLocation: {
    color: "#8B8B8B",
    fontSize: 13,
    marginBottom: 16,
  },
  participantsSection: {
    marginBottom: 16,
  },
  participantsList: {
    flexDirection: "row",
    gap: 12,
  },
  participantItem: {
    alignItems: "center",
    width: 48,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2C2C2C",
    marginBottom: 4,
  },
  joinPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2C2C2C",
    borderWidth: 2,
    borderColor: "#3867FF",
    borderStyle: "dashed",
  },
  participantLevel: {
    color: "#8B8B8B",
    fontSize: 11,
    fontWeight: "600",
  },
  participantName: {
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
  },
  participantAction: {
    color: "#3867FF",
    fontSize: 13,
    fontWeight: "700",
  },
  createCircleCard: {
    backgroundColor: "#1E1F23",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#B8FF00",
    borderStyle: "dashed",
  },
  createCircleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2C2C2C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  createCircleContent: {
    flex: 1,
  },
  createCircleTitle: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  createCircleSubtitle: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  circlesSection: {
    marginBottom: 28,
  },
  circlesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  quickActionsSection: {
    marginBottom: 28,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#1E1F23",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2C2C2C",
  },
  quickActionTitle: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  quickActionSubtitle: {
    color: "#8B8B8B",
    fontSize: 12,
    textAlign: "center",
  },
});
