import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeHeader, SveTabContent } from "../../../components";
import { useTheme } from "../../../contexts/ThemeContext";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { colors, fonts } = useTheme();
  const styles = getStyles(colors, fonts);

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
        <HomeHeader styles={styles} />

        {/* Content */}
        <SveTabContent styles={styles} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, fonts: any) =>
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
      fontFamily: fonts.bold,
    },
    weatherText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 4,
      fontFamily: fonts.regular,
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
      fontFamily: fonts.semiBold,
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
      fontFamily: fonts.semiBold,
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
      fontFamily: fonts.semiBold,
    },
    tabActiveText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
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
      fontFamily: fonts.semiBold,
    },
    connectSubheading: {
      color: colors.textSecondary,
      fontSize: 14,
      fontFamily: fonts.regular,
    },
    matchesSection: {
      marginBottom: 28,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 16,
      fontFamily: fonts.bold,
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
      fontFamily: fonts.semiBold,
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
      marginBottom: 16,
      gap: 8,
    },
    authorContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
      minWidth: 0,
    },
    authorAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    authorAvatarPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    authorAvatarText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
      fontFamily: fonts.bold,
    },
    authorInfo: {
      flex: 1,
    },
    matchCardAuthor: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    authorAction: {
      color: colors.textSecondary,
      fontSize: 12,
      fontFamily: fonts.regular,
    },
    matchCardTime: {
      color: colors.textSecondary,
      fontSize: 12,
      flexShrink: 0,
      fontFamily: fonts.regular,
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
      fontFamily: fonts.bold,
    },
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    gameModeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    gameModeBadgeCompetitive: {
      backgroundColor: "#FEF3C7",
    },
    gameModeBadgeFriendly: {
      backgroundColor: "#D1FAE5",
    },
    gameModeBadgeTraining: {
      backgroundColor: "#DBEAFE",
    },
    gameModeBadgeText: {
      fontSize: 11,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    gameModeBadgeTextCompetitive: {
      color: "#F59E0B",
    },
    gameModeBadgeTextFriendly: {
      color: "#10B981",
    },
    gameModeBadgeTextTraining: {
      color: "#3B82F6",
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
      fontFamily: fonts.semiBold,
    },
    dateLocationSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    locationTextContainer: {
      flex: 1,
    },
    openMatchDate: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    openMatchClub: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    openMatchCourt: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
      fontFamily: fonts.regular,
    },
    openMatchLocation: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 16,
      fontFamily: fonts.regular,
    },
    participantsSection: {
      marginBottom: 20,
    },
    participantsLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 8,
      fontFamily: fonts.semiBold,
    },
    participantsList: {
      flexDirection: "row",
      gap: 8,
    },
    participantItem: {
      alignItems: "center",
      position: "relative",
      width: 60,
    },
    participantAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.border,
    },
    participantAvatarPlaceholder: {
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    participantAvatarText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
      fontFamily: fonts.bold,
    },
    participantLevelBadge: {
      position: "absolute",
      bottom: 14,
      backgroundColor: "#3867FF",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.surface,
    },
    participantLevelText: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "700",
      fontFamily: fonts.bold,
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
      fontFamily: fonts.semiBold,
    },
    participantName: {
      color: colors.text,
      fontSize: 10,
      fontWeight: "600",
      marginTop: 6,
      textAlign: "center",
      width: "100%",
      fontFamily: fonts.semiBold,
    },
    participantAction: {
      color: "#3867FF",
      fontSize: 13,
      fontWeight: "700",
      fontFamily: fonts.bold,
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
      fontFamily: fonts.bold,
    },
    createCircleSubtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      fontFamily: fonts.regular,
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
      fontFamily: fonts.semiBold,
    },
    quickActionSubtitle: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: "center",
      fontFamily: fonts.regular,
    },
  });
