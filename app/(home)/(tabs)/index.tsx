import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    HomeHeader,
    KrugoviTabContent,
    SveTabContent,
    VruceTabContent,
} from "../../../components";
import { useTheme } from "../../../contexts/ThemeContext";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<"sve" | "igraci" | "klubovi">(
    "sve",
  );
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - in a real app, this would reload data
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.refreshIndicator}
            colors={[colors.refreshIndicator]}
          />
        }
      >
        <HomeHeader
          styles={styles}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Tab Content */}
        {activeTab === "sve" && <SveTabContent styles={styles} />}
        {activeTab === "igraci" && <VruceTabContent styles={styles} />}
        {activeTab === "klubovi" && <KrugoviTabContent styles={styles} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
      fontSize: 32,
      fontWeight: "700",
      letterSpacing: -0.5,
    },
    weatherText: {
      color: colors.textSecondary,
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
      backgroundColor: colors.surface,
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
      gap: 4,
      marginBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabActive: {
      borderBottomColor: "#B8FF00",
    },
    tabText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    tabActiveText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    connectCard: {
      backgroundColor: colors.surface,
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
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.surface,
    },
    connectText: {
      flex: 1,
    },
    connectHeading: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    connectSubheading: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    matchesSection: {
      marginBottom: 28,
    },
    sectionTitle: {
      color: colors.text,
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
      backgroundColor: colors.surface,
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
      color: colors.textSecondary,
      fontSize: 12,
    },
    openMatchType: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    openMatchTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    matchMetaRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 8,
    },
    metaTag: {
      backgroundColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    metaTagText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    openMatchDate: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 4,
    },
    openMatchLocation: {
      color: colors.textSecondary,
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
      backgroundColor: colors.border,
      marginBottom: 4,
    },
    joinPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.border,
      borderWidth: 2,
      borderColor: "#3867FF",
      borderStyle: "dashed",
    },
    participantLevel: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },
    participantName: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    participantAction: {
      color: "#3867FF",
      fontSize: 13,
      fontWeight: "700",
    },
    createCircleCard: {
      backgroundColor: colors.surface,
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
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    createCircleContent: {
      flex: 1,
    },
    createCircleTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },
    createCircleSubtitle: {
      color: colors.textSecondary,
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
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickActionTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginTop: 8,
      marginBottom: 4,
      textAlign: "center",
    },
    quickActionSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: "center",
    },
  });
