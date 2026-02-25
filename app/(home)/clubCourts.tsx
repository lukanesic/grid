import { IconButton } from "@/components";
import { useTheme } from "@/contexts/ThemeContext";
import { fetchAllCourtsByClub } from "@/lib/courtApi";
import { Court, SurfaceType } from "@/types/court";
import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Translation mapping for surface types
const surfaceTypeNames: Record<SurfaceType, string> = {
  hard: "Tvrda podloga",
  clay: "Šljaka",
  grass: "Trava",
  carpet: "Tepih",
  indoor_hard: "Zatvorena tvrda",
};

export default function ClubCourtsScreen() {
  const router = useRouter();
  const { clubId } = useLocalSearchParams();
  const { colors, fonts } = useTheme();
  const styles = createStyles(colors, fonts);

  // Fetch courts for this club
  const {
    data: courts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["clubCourts", clubId],
    queryFn: () => fetchAllCourtsByClub(clubId as string),
    enabled: !!clubId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const renderCourtCard = ({ item: court }: { item: Court }) => {
    return (
      <View style={styles.courtCard}>
        {/* Court Name & Number */}
        <View style={styles.courtHeader}>
          <View style={styles.courtTitleContainer}>
            <Text style={styles.courtName}>{court.name}</Text>
            {court.court_number && (
              <View style={styles.courtNumberBadge}>
                <Text style={styles.courtNumberText}>
                  #{court.court_number}
                </Text>
              </View>
            )}
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              court.is_available ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                court.is_available ? styles.dotActive : styles.dotInactive,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                court.is_available
                  ? styles.statusActiveText
                  : styles.statusInactiveText,
              ]}
            >
              {court.is_available ? "U funkciji" : "Van funkcije"}
            </Text>
          </View>
        </View>

        {/* Court Details */}
        <View style={styles.courtDetails}>
          {/* Surface Type */}
          <View style={styles.detailRow}>
            <FontAwesome name="square" size={16} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Podloga:</Text>
            <Text style={styles.detailValue}>
              {surfaceTypeNames[court.surface_type] || court.surface_type}
            </Text>
          </View>

          {/* Indoor/Outdoor */}
          <View style={styles.detailRow}>
            <FontAwesome
              name={court.is_indoor ? "home" : "sun-o"}
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.detailLabel}>Tip:</Text>
            <Text style={styles.detailValue}>
              {court.is_indoor ? "Zatvoreni teren" : "Otvoreni teren"}
            </Text>
          </View>

          {/* Lights */}
          {court.has_lights && (
            <View style={styles.detailRow}>
              <FontAwesome
                name="lightbulb-o"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Osvetljenje:</Text>
              <Text style={styles.detailValue}>Dostupno</Text>
            </View>
          )}

          {/* Hourly Rate */}
          {court.hourly_rate && (
            <View style={styles.detailRow}>
              <FontAwesome
                name="money"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.detailLabel}>Cena:</Text>
              <Text style={styles.detailValue}>
                {court.hourly_rate} {court.currency}/sat
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        {court.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {court.description}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Tereni</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Tereni</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Greška pri učitavanju terena</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Tereni</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Courts List */}
      <FlatList
        data={courts}
        renderItem={renderCourtCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => refetch()}
            tintColor={colors.refreshIndicator}
            colors={[colors.refreshIndicator]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="inbox" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nema terena</Text>
            <Text style={styles.emptySubtext}>
              Ovaj klub još uvek nema dodane terene
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any, fonts: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      fontFamily: fonts.semiBold,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    listContent: {
      padding: 20,
      gap: 16,
    },
    courtCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    courtHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    courtTitleContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    courtName: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      fontFamily: fonts.bold,
    },
    courtNumberBadge: {
      backgroundColor: colors.accent + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    courtNumberText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.accent,
      fontFamily: fonts.semiBold,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusActive: {
      backgroundColor: "#10B98120",
    },
    statusInactive: {
      backgroundColor: "#EF444420",
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    dotActive: {
      backgroundColor: "#10B981",
    },
    dotInactive: {
      backgroundColor: "#EF4444",
    },
    statusText: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    statusActiveText: {
      color: "#10B981",
    },
    statusInactiveText: {
      color: "#EF4444",
    },
    courtDetails: {
      gap: 12,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    detailLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: fonts.regular,
      width: 90,
    },
    detailValue: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      fontFamily: fonts.semiBold,
    },
    descriptionContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    descriptionText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      fontFamily: fonts.regular,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 16,
      fontFamily: fonts.semiBold,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: "center",
      fontFamily: fonts.regular,
    },
  });
