import { FontAwesome } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SelectedData, ThemeColors } from "../types";

interface SummaryStepProps {
  selectedData: SelectedData;
  colors: ThemeColors;
  isDark: boolean;
}

export const SummaryStep = ({
  selectedData,
  colors,
  isDark,
}: SummaryStepProps) => {
  const styles = getStyles(colors, isDark);

  // Calculate total price
  const hoursCount = selectedData.times?.length || 1;
  const pricePerHour = parseInt(selectedData.club?.price || "1200", 10);
  const totalPrice = hoursCount * pricePerHour;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("sr-RS", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPaymentMethodTitle = () => {
    if (selectedData.paymentMethod === "card") {
      return "Kreditna ili debitna kartica";
    } else if (selectedData.paymentMethod === "cash") {
      return "Kesom na licu mesta";
    }
    return "";
  };

  const getPaymentMethodIcon = () => {
    if (selectedData.paymentMethod === "card") {
      return "credit-card";
    } else if (selectedData.paymentMethod === "cash") {
      return "money";
    }
    return "credit-card";
  };

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Club Header with Large Image */}
      <View style={styles.summaryMainCard}>
        <Image
          source={{
            uri:
              selectedData.club?.image ||
              "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
          }}
          style={styles.summaryMainImage}
          resizeMode="cover"
        />
        <View style={styles.summaryMainInfo}>
          <Text style={styles.summaryMainTitle}>{selectedData.club?.name}</Text>
          <View style={styles.summaryMainMeta}>
            <FontAwesome
              name="star"
              size={14}
              color={isDark ? "#FFD700" : "#000000"}
            />
            <Text style={styles.summaryMainRating}>
              {selectedData.club?.rating || "4.8"} (
              {selectedData.club?.reviews || "217"})
            </Text>
            <Text style={styles.summaryMainDivider}> · </Text>
            <FontAwesome name="trophy" size={12} color={colors.textSecondary} />
            <Text style={styles.summaryMainDetails}> Omiljeno gostiju</Text>
          </View>
          <Text style={styles.summaryMainSubtitle}>
            {selectedData.court?.name} · Padel · Tenis
          </Text>
          <View style={styles.summaryMainPrice}>
            <Text style={styles.summaryMainPriceAmount}>
              {selectedData.club?.price || "1200"}{" "}
            </Text>
            <Text style={styles.summaryMainPriceUnit}>RSD/h</Text>
            <Text style={styles.summaryMainDistance}>
              {selectedData.club?.distance || "4.1 km"}
            </Text>
          </View>
        </View>
      </View>

      {/* Booking Details Card */}
      <View style={styles.summaryDetailsCard}>
        <Text style={styles.summaryDetailLabel}>Datumi</Text>
        <Text style={styles.summaryDetailValue}>
          {selectedData.date && formatDate(selectedData.date)}
        </Text>

        <View style={styles.summaryDivider} />

        <Text style={styles.summaryDetailLabel}>Mod igre</Text>
        <Text style={styles.summaryDetailValue}>
          {selectedData.gameMode === "competitive"
            ? "Kompetativan"
            : selectedData.gameMode === "training"
              ? "Trening"
              : "Prijateljski"}
        </Text>

        <View style={styles.summaryDivider} />

        <Text style={styles.summaryDetailLabel}>Tip meča</Text>
        <Text style={styles.summaryDetailValue}>
          {selectedData.matchType === "open" ? "Otvoren meč" : "Zatvoren meč"}
        </Text>

        <View style={styles.summaryDivider} />

        <Text style={styles.summaryDetailLabel}>Igrači</Text>
        <Text style={styles.summaryDetailValue}>
          {selectedData.opponent ? selectedData.opponent?.full_name : "1 igrač"}
        </Text>

        <View style={styles.summaryDivider} />

        <Text style={styles.summaryDetailLabel}>Ukupna cena</Text>
        <Text style={styles.summaryTotalPrice}>{totalPrice} RSD</Text>
        <Text style={styles.summaryPriceNote}>
          Vaša cena je ispod proseka za period od 60 dana
        </Text>
      </View>

      {/* Payment Method Card */}
      <View style={styles.summaryPaymentCard}>
        <View style={styles.summaryPaymentLeft}>
          <FontAwesome
            name={getPaymentMethodIcon() as any}
            size={16}
            color={colors.text}
            style={styles.summaryPaymentIcon}
          />
          <Text style={styles.summaryPaymentTitle}>
            {getPaymentMethodTitle()}
          </Text>
        </View>
      </View>

      {/* Price Breakdown */}
      <View style={styles.summaryPriceCard}>
        <Text style={styles.summaryPriceHeader}>Detalji cene</Text>
        <View style={styles.summaryPriceBreakdownRow}>
          <Text style={styles.summaryPriceBreakdownLabel}>
            {hoursCount} sat x {pricePerHour}
          </Text>
          <Text style={styles.summaryPriceBreakdownValue}>
            {totalPrice} RSD
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryPriceTotalRow}>
          <Text style={styles.summaryPriceTotalLabel}>Ukupno</Text>
          <Text style={styles.summaryPriceTotalValue}>{totalPrice} RSD</Text>
        </View>
      </View>

      {/* Cancellation Policy */}
      <View style={styles.summaryCancellationCard}>
        <Text style={styles.summaryCancellationTitle}>
          Besplatno otkazivanje
        </Text>
        <Text style={styles.summaryCancellationText}>
          Besplatno otkazivanje do 24h pre rezervacije. Otkaži pre toga za puni
          refund.
        </Text>
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
    },
    summaryMainCard: {
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 16,
      padding: 0,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
      overflow: "hidden",
    },
    summaryMainImage: {
      width: "100%",
      height: 180,
    },
    summaryMainInfo: {
      padding: 20,
    },
    summaryMainTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    summaryMainMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    summaryMainRating: {
      fontSize: 13,
      color: colors.text,
      marginLeft: 4,
      fontWeight: "600",
    },
    summaryMainDivider: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    summaryMainDetails: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    summaryMainSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    summaryMainPrice: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    summaryMainPriceAmount: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    summaryMainPriceUnit: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: 8,
    },
    summaryMainDistance: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summaryDetailsCard: {
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
    },
    summaryDetailLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    summaryDetailValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "600",
      marginBottom: 16,
    },
    summaryTotalPrice: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    summaryPriceNote: {
      fontSize: 13,
      color: isDark ? "#66BB6A" : "#4CAF50",
      fontWeight: "500",
    },
    summaryDivider: {
      height: 1,
      backgroundColor: isDark ? "#333" : "#E5E7EB",
      marginBottom: 16,
    },
    summaryPaymentCard: {
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
    },
    summaryPaymentLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    summaryPaymentIcon: {
      marginRight: 12,
    },
    summaryPaymentTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    summaryPriceCard: {
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
    },
    summaryPriceHeader: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    summaryPriceBreakdownRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    summaryPriceBreakdownLabel: {
      fontSize: 16,
      color: colors.text,
    },
    summaryPriceBreakdownValue: {
      fontSize: 16,
      color: colors.text,
    },
    summaryPriceTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
    },
    summaryPriceTotalLabel: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    summaryPriceTotalValue: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },
    summaryCancellationCard: {
      backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
      borderRadius: 16,
      padding: 20,

      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
    },
    summaryCancellationTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    summaryCancellationText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });
