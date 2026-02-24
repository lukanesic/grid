import { EvilIcons, FontAwesome } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    ClubSelection,
    CourtSelection,
    DateSelection,
    GameModeSelection,
    MatchTypeSelection,
    OpponentSelection,
    PaymentSelection,
    SelectedData,
    Step,
    SummaryStep,
    TimeSelection,
} from "../../components/createMatch";
import { useTheme } from "../../contexts/ThemeContext";
import { fetchClubById, fetchTopClubs } from "../../lib/clubApi";
import {
    createCourtReservation,
    fetchAvailableTimeSlots,
    fetchCourtsByClubWithSlotCounts,
} from "../../lib/courtApi";
import { fetchSuggestedPlayers } from "../../lib/profileApi";
import type { TimeSlot } from "../../types/court";

export default function CreateMatchNewScreen() {
  const router = useRouter();
  const { clubId, clubName } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<Step>(
    clubId ? "date" : "club",
  );
  const [selectedData, setSelectedData] = useState<SelectedData>({});
  const [selectionFadeAnim] = useState(new Animated.Value(0));
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const progressWidthAnim = useRef(
    new Animated.Value(((clubId ? 2 : 1) / 8) * 100),
  ).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animate selection overlay when club changes
  useEffect(() => {
    if (selectedData.club) {
      Animated.timing(selectionFadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(selectionFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedData.club, selectionFadeAnim]);

  // Animate progress bar and content when step changes
  useEffect(() => {
    const allSteps: Step[] = [
      "club",
      "date",
      "court",
      "time",
      "gameMode",
      "matchType",
      "opponent",
      "payment",
      "summary",
    ];
    // If clubId was provided, exclude club step from progress calculation
    const steps = clubId ? allSteps.filter((s) => s !== "club") : allSteps;
    const stepNumber = steps.indexOf(currentStep) + 1;
    // Progress bar uses 8 steps (excluding summary, and club if pre-selected)
    const totalSteps = clubId ? 7 : 8;
    const targetProgress =
      (Math.min(stepNumber, totalSteps) / totalSteps) * 100;

    // Animate progress bar
    Animated.timing(progressWidthAnim, {
      toValue: targetProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Reset and start page transition
    slideAnim.setValue(50);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep, progressWidthAnim, slideAnim, fadeAnim]);

  // Reset dependent selections when club changes
  useEffect(() => {
    if (selectedData.club) {
      setSelectedData((prev) => ({
        ...prev,
        court: undefined,
        times: undefined,
      }));
    }
  }, [selectedData.club]);

  // Format date for API (YYYY-MM-DD) - Define BEFORE using in queries
  const formattedDate = selectedData.date
    ? selectedData.date.toLocaleDateString("en-CA").split("T")[0]
    : "";

  // Fetch clubs
  const { data: clubs = [] } = useQuery({
    queryKey: ["clubs"],
    queryFn: () => fetchTopClubs(20),
  });

  // Fetch the preselected club if clubId is provided
  const { data: preselectedClub, isLoading: preselectedClubLoading } = useQuery(
    {
      queryKey: ["club", clubId],
      queryFn: () => fetchClubById(clubId as string),
      enabled: !!clubId,
      staleTime: 1000 * 60 * 5,
    },
  );

  // Auto-select club if clubId was provided
  useEffect(() => {
    if (preselectedClub && !selectedData.club) {
      setSelectedData((prev) => ({
        ...prev,
        club: preselectedClub,
      }));
    }
  }, [preselectedClub, selectedData.club]);

  // Fetch suggested players for opponent selection
  const { data: players = [] } = useQuery({
    queryKey: ["suggestedPlayers"],
    queryFn: () => fetchSuggestedPlayers(10),
  });

  // Fetch courts for selected club with availability status for selected date
  const { data: courts = [], isLoading: courtsLoading } = useQuery({
    queryKey: ["courts", selectedData.club?.id, formattedDate],
    queryFn: () =>
      fetchCourtsByClubWithSlotCounts(selectedData.club!.id, formattedDate),
    enabled: !!selectedData.club?.id && !!formattedDate,
    staleTime: 1000 * 60 * 2, // Shorter cache for availability checks
  });

  // Reset times when court or date changes
  useEffect(() => {
    setSelectedData((prev) => ({
      ...prev,
      times: undefined,
    }));
  }, [selectedData.court?.id, formattedDate]);

  // Fetch available time slots for selected court and date
  const { data: timeSlots = [] } = useQuery<TimeSlot[]>({
    queryKey: ["timeSlots", selectedData.court?.id, formattedDate],
    queryFn: () =>
      fetchAvailableTimeSlots(selectedData.court!.id, formattedDate, 60),
    enabled: !!selectedData.court?.id && !!formattedDate,
    staleTime: 1000 * 60 * 2,
  });

  const handleBack = () => {
    if (currentStep === "club") {
      router.back();
    } else if (currentStep === "date") {
      // If clubId was provided, go back to previous screen instead of club selection
      if (clubId) {
        router.back();
      } else {
        setCurrentStep("club");
      }
    } else if (currentStep === "summary") {
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      setCurrentStep("opponent");
    } else if (currentStep === "opponent") {
      setCurrentStep("matchType");
    } else if (currentStep === "matchType") {
      setCurrentStep("gameMode");
    } else if (currentStep === "gameMode") {
      setCurrentStep("time");
    } else if (currentStep === "time") {
      setCurrentStep("court");
    } else if (currentStep === "court") {
      setCurrentStep("date");
    }
  };

  const handleNext = () => {
    if (currentStep === "club" && selectedData.club) {
      setCurrentStep("date");
    } else if (currentStep === "date" && selectedData.date) {
      setCurrentStep("court");
    } else if (currentStep === "court" && selectedData.court) {
      setCurrentStep("time");
    } else if (
      currentStep === "time" &&
      selectedData.times &&
      selectedData.times.length > 0
    ) {
      setCurrentStep("gameMode");
    } else if (currentStep === "gameMode" && selectedData.gameMode) {
      setCurrentStep("matchType");
    } else if (currentStep === "matchType" && selectedData.matchType) {
      setCurrentStep("opponent");
    } else if (currentStep === "opponent") {
      setCurrentStep("payment");
    } else if (currentStep === "payment" && selectedData.paymentMethod) {
      setCurrentStep("summary");
    } else if (currentStep === "summary") {
      handleCreateReservation();
    }
  };

  const isNextEnabled = () => {
    switch (currentStep) {
      case "club":
        return !!selectedData.club;
      case "date":
        return !!selectedData.date;
      case "court":
        return !!selectedData.court;
      case "time":
        return !!selectedData.times && selectedData.times.length > 0;
      case "gameMode":
        return !!selectedData.gameMode;
      case "matchType":
        return !!selectedData.matchType;
      case "opponent":
        return true; // Optional step
      case "payment":
        return !!selectedData.paymentMethod;
      case "summary":
        return true;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "club":
        return "Odaberi klub";
      case "date":
        return "Odaberi datum";
      case "court":
        return "Odaberi teren";
      case "time":
        return "Odaberi vreme";
      case "gameMode":
        return "Odaberi mod igre";
      case "matchType":
        return "Tip meča";
      case "opponent":
        return "Pozovi protivnika";
      case "payment":
        return "Način plaćanja";
      case "summary":
        return "Pregled rezervacije";
      default:
        return "";
    }
  };

  const getStepNumber = () => {
    const allSteps: Step[] = [
      "club",
      "date",
      "court",
      "time",
      "matchType",
      "opponent",
      "payment",
    ];
    // If clubId was provided, exclude club step
    const steps = clubId ? allSteps.filter((s) => s !== "club") : allSteps;
    return steps.indexOf(currentStep) + 1;
  };

  const handleCreateReservation = async () => {
    if (
      isSubmitting ||
      !selectedData.court ||
      !selectedData.date ||
      !selectedData.times ||
      selectedData.times.length === 0
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate start and end time
      const sortedTimes = [...selectedData.times].sort();
      const startTime = sortedTimes[0];
      const startHour = parseInt(startTime.split(":")[0]);
      const hoursCount = sortedTimes.length;
      const endHour = startHour + hoursCount;
      const endTime = `${endHour.toString().padStart(2, "0")}:00`;
      const durationMinutes = hoursCount * 60;

      // Calculate price
      const hourlyRate =
        selectedData.court?.hourly_rate ?? selectedData.club?.price ?? 1200;
      const totalPrice = Number(hourlyRate) * hoursCount;

      // Prepare invited players array - add opponent if selected (regardless of match type)
      const invitedPlayers = selectedData.opponent
        ? [selectedData.opponent.id]
        : [];

      // Prepare notes with match type
      const matchTypeText =
        selectedData.matchType === "open" ? "Otvoren meč" : "Zatvoren meč";
      const notes = `${matchTypeText} u ${selectedData.club?.name || "klubu"}`;

      // Determine if match is open or closed
      const isOpenMatch = selectedData.matchType === "open";

      await createCourtReservation({
        court_id: selectedData.court.id,
        reservation_date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        total_price: totalPrice,
        currency: "RSD",
        invited_players: invitedPlayers,
        notes: notes,
        is_open_match: isOpenMatch,
        match_type: selectedData.gameMode || "friendly",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["openReservations"] });
      queryClient.invalidateQueries({ queryKey: ["userReservations"] });

      Alert.alert(
        "Uspešno!",
        "Rezervacija je potvrđena. Meč je sada vidljiv u otvorenim mečevima.",
        [
          {
            text: "OK",
            onPress: () => {
              router.dismissAll();
              router.replace("/(home)/(tabs)");
            },
          },
        ],
      );
    } catch (error: any) {
      console.error("Error creating reservation:", error);
      Alert.alert(
        "Greška",
        error.message || "Došlo je do greške prilikom kreiranja rezervacije.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    const currentTimes = selectedData.times || [];
    const timeIndex = timeSlots.findIndex((slot) => slot.time_slot === time);

    if (currentTimes.includes(time)) {
      // Deselect time
      setSelectedData({
        ...selectedData,
        times: currentTimes.filter((t) => t !== time),
      });
    } else if (currentTimes.length === 0) {
      // First selection
      setSelectedData({ ...selectedData, times: [time] });
    } else {
      // Check if consecutive
      const selectedIndices = currentTimes
        .map((t) => timeSlots.findIndex((slot) => slot.time_slot === t))
        .sort((a, b) => a - b);
      const minIndex = Math.min(...selectedIndices);
      const maxIndex = Math.max(...selectedIndices);

      // Time must be adjacent to current selection
      if (timeIndex === minIndex - 1 || timeIndex === maxIndex + 1) {
        // Add to selection
        setSelectedData({ ...selectedData, times: [...currentTimes, time] });
      } else if (timeIndex > minIndex && timeIndex < maxIndex) {
        // Fill gap in selection
        setSelectedData({ ...selectedData, times: [...currentTimes, time] });
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "club":
        return (
          <ClubSelection
            clubs={clubs}
            selectedClub={selectedData.club}
            onSelectClub={(club) => setSelectedData({ ...selectedData, club })}
            colors={colors}
            isDark={isDark}
            selectionFadeAnim={selectionFadeAnim}
          />
        );
      case "date":
        return (
          <DateSelection
            selectedDate={selectedData.date}
            onSelectDate={(date) => setSelectedData({ ...selectedData, date })}
            colors={colors}
            isDark={isDark}
          />
        );
      case "court":
        if (courtsLoading) {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Učitavanje terena...</Text>
            </View>
          );
        }
        if (courts.length === 0) {
          return (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Nema dostupnih terena za izabrani datum.
              </Text>
            </View>
          );
        }
        return (
          <CourtSelection
            courts={courts}
            selectedCourt={selectedData.court}
            onSelectCourt={(court) =>
              setSelectedData({ ...selectedData, court })
            }
            colors={colors}
            isDark={isDark}
          />
        );
      case "time":
        return (
          <TimeSelection
            timeSlots={timeSlots}
            selectedTimes={selectedData.times || []}
            onSelectTime={handleTimeSelect}
            colors={colors}
            isDark={isDark}
          />
        );
      case "gameMode":
        return (
          <GameModeSelection
            selectedGameMode={selectedData.gameMode}
            onSelectGameMode={(mode) =>
              setSelectedData({ ...selectedData, gameMode: mode })
            }
            colors={colors}
            isDark={isDark}
          />
        );
      case "matchType":
        return (
          <MatchTypeSelection
            selectedMatchType={selectedData.matchType}
            onSelectMatchType={(type) =>
              setSelectedData({ ...selectedData, matchType: type })
            }
            colors={colors}
            isDark={isDark}
          />
        );
      case "opponent":
        return (
          <OpponentSelection
            players={players}
            selectedOpponent={selectedData.opponent}
            onSelectOpponent={(player) =>
              setSelectedData({ ...selectedData, opponent: player })
            }
            searchQuery={playerSearchQuery}
            onSearchChange={setPlayerSearchQuery}
            colors={colors}
            isDark={isDark}
          />
        );
      case "payment":
        return (
          <PaymentSelection
            selectedPaymentMethod={selectedData.paymentMethod}
            onSelectPaymentMethod={(method) =>
              setSelectedData({ ...selectedData, paymentMethod: method })
            }
            colors={colors}
            isDark={isDark}
          />
        );
      case "summary":
        return (
          <SummaryStep
            selectedData={selectedData}
            colors={colors}
            isDark={isDark}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <EvilIcons name="close" size={26} color={colors.text} />
        </Pressable>
      </SafeAreaView>

      {/* Progress Indicator */}
      {currentStep !== "summary" && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidthAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Content */}
      <View style={styles.mainContent}>
        {currentStep !== "summary" && (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{getStepTitle()}</Text>
            <Text style={styles.subtitle}>Korak {getStepNumber()} od 7</Text>
          </View>
        )}
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          }}
        >
          {renderStepContent()}
        </Animated.View>
      </View>

      {/* Bottom Bar */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
        <Pressable
          style={[
            styles.nextButton,
            currentStep === "summary" && styles.reserveButton,
            (!isNextEnabled() || isSubmitting) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!isNextEnabled() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === "summary" ? "Rezervišite" : "Dalje"}
            </Text>
          )}
        </Pressable>
      </SafeAreaView>
    </View>
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
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    backButton: {
      // width: 44,
      // height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    closeButton: {
      // width: 44,
      // height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    progressContainer: {
      paddingHorizontal: 24,
      paddingBottom: 16,
    },
    progressBar: {
      height: 2,
      backgroundColor: isDark ? "#333" : "#E5E7EB",
      borderRadius: 1,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.text,
    },
    mainContent: {
      flex: 1,
    },
    titleContainer: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      backgroundColor: colors.background,
      zIndex: 10,
      position: "relative",
    },
    title: {
      fontSize: 32,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    selectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: "transparent",
    },
    selectionCardActive: {
      borderColor: colors.text,
      backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
    },
    selectionCardDisabled: {
      opacity: 0.5,
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardInfo: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    cardDetails: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    unavailableText: {
      fontSize: 13,
      color: "#FF6B6B",
      marginTop: 4,
    },
    checkmark: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
    },
    // Enhanced Club Card Styles
    clubCard: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "transparent",
      padding: 12,
    },
    clubCardActive: {
      borderColor: "#3867FF",
    },
    clubImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
    },
    clubImage: {
      width: "100%",
      height: "100%",
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(56, 103, 255, 0.85)",
      alignItems: "center",
      justifyContent: "center",
    },
    checkmarkLarge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    checkmarkSmall: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    clubInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "space-between",
    },
    clubHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    clubName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 2,
      marginBottom: 4,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    clubDetails: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 6,
      lineHeight: 16,
    },
    clubFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    priceAmount: {
      fontSize: 16,
      fontWeight: "700",
      color: "#3867FF",
    },
    priceUnit: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    distanceText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    timeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    timeSlot: {
      width: "30%",
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDark ? "#333" : "#E5E7EB",
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    timeSlotActive: {
      borderColor: colors.text,
      backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
    },
    timeText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    timeTextActive: {},
    // Search styles
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    // Player card styles
    playerCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: "transparent",
    },
    playerCardActive: {
      borderColor: colors.text,
      backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
    },
    playerInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    playerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },
    playerAvatarPlaceholder: {
      backgroundColor: isDark ? "#333" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
    },
    playerAvatarText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    playerDetails: {
      flex: 1,
    },
    playerName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 2,
    },
    playerLevel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    // Payment option styles
    paymentContainer: {
      gap: 12,
    },
    paymentOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      borderWidth: 2,
      borderColor: isDark ? "#333" : "#E5E7EB",
    },
    paymentOptionActive: {
      borderColor: colors.text,
      backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
    },
    paymentInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    paymentIconContainer: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    paymentDetails: {
      flex: 1,
    },
    paymentTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    paymentLogos: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    paymentLogo: {
      marginRight: 4,
    },
    radioButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDark ? "#333" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
    },
    radioButtonActive: {
      borderColor: colors.text,
    },
    radioButtonInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.text,
    },
    bottomBar: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#333" : "#E5E7EB",
      backgroundColor: colors.background,
      zIndex: 100,
    },
    nextButton: {
      backgroundColor: colors.text,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    nextButtonDisabled: {
      opacity: 0.4,
    },
    nextButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: "600",
    },
    reserveButton: {
      backgroundColor: "#FF385C",
    },
    disclaimerContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
      gap: 12,
    },
    disclaimerText: {
      flex: 1,
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
    },
    summarySection: {
      marginBottom: 8,
    },
    summaryClubHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    summaryClubImage: {
      width: 60,
      height: 60,
      borderRadius: 12,
    },
    summaryClubInfo: {
      flex: 1,
    },
    summaryClubName: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    summaryClubMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    summaryClubRating: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: isDark ? "#333" : "#E5E7EB",
      marginVertical: 16,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    summaryLabel: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    summaryPriceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 8,
    },
    summaryPriceLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    summaryPriceValue: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    summaryPriceUnit: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    summaryMainCard: {
      backgroundColor: "#FFFFFF",
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
      padding: 16,
    },
    summaryMainTitle: {
      fontSize: 22,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    summaryMainMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    summaryMainRating: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 4,
    },
    summaryMainDivider: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summaryMainDetails: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summaryMainSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    summaryMainPrice: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    summaryMainPriceAmount: {
      fontSize: 22,
      fontWeight: "700",
      color: "#3867FF",
    },
    summaryMainPriceUnit: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    summaryMainDistance: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summaryDetailsCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
    },
    summaryDetailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    summaryDetailLabel: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    summaryDetailChange: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      textDecorationLine: "underline",
    },
    summaryDetailValue: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    summaryTotalPrice: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    summaryPriceNote: {
      fontSize: 14,
      color: "#16A34A",
      marginTop: 4,
    },
    summaryPaymentCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
    },
    summaryPaymentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
      fontWeight: "500",
      color: colors.text,
    },
    summaryPriceCard: {
      backgroundColor: "#FFFFFF",
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
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      marginBottom: 80,
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
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },
  });
