import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "../../components";
import { useTheme } from "../../contexts/ThemeContext";
import { fetchTopClubs } from "../../lib/clubApi";

type Step = "club" | "date" | "court" | "time";

interface SelectedData {
  club?: any;
  date?: Date;
  court?: any;
  time?: string;
}

export default function CreateMatchNewScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const params = useLocalSearchParams();

  const [currentStep, setCurrentStep] = useState<Step>("club");
  const [selectedData, setSelectedData] = useState<SelectedData>({});
  const [selectionFadeAnim] = useState(new Animated.Value(0));

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
  }, [selectedData.club]);

  // Fetch clubs
  const { data: clubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["clubs"],
    queryFn: () => fetchTopClubs(20),
  });

  // Sample courts data
  const courts = [
    { id: 1, name: "Teren 1", type: "clay", available: true },
    { id: 2, name: "Teren 2", type: "hard", available: true },
    { id: 3, name: "Teren 3", type: "grass", available: false },
    { id: 4, name: "Teren 4", type: "clay", available: true },
  ];

  // Sample time slots
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  const handleBack = () => {
    if (currentStep === "club") {
      // First step - close screen
      router.back();
    } else {
      // Go back to previous step
      if (currentStep === "time") {
        setCurrentStep("court");
      } else if (currentStep === "court") {
        setCurrentStep("date");
      } else if (currentStep === "date") {
        setCurrentStep("club");
      }
    }
  };

  const handleNext = () => {
    // Change step
    if (currentStep === "club" && selectedData.club) {
      setCurrentStep("date");
    } else if (currentStep === "date" && selectedData.date) {
      setCurrentStep("court");
    } else if (currentStep === "court" && selectedData.court) {
      setCurrentStep("time");
    } else if (currentStep === "time" && selectedData.time) {
      // Navigate to final step or complete
      console.log("Complete:", selectedData);
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
        return !!selectedData.time;
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
      default:
        return "";
    }
  };

  const getStepNumber = () => {
    const steps: Step[] = ["club", "date", "court", "time"];
    return steps.indexOf(currentStep) + 1;
  };

  const renderClubSelection = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {clubs.map((club) => (
        <Pressable
          key={club.id}
          style={({ pressed }) => [
            styles.clubCard,
            selectedData.club?.id === club.id && styles.clubCardActive,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => setSelectedData({ ...selectedData, club })}
        >
          {/* Club Image */}
          <View style={styles.clubImageContainer}>
            <Image
              source={{
                uri:
                  club.image ||
                  "https://images.pexels.com/photos/29696876/pexels-photo-29696876.jpeg",
              }}
              style={styles.clubImage}
              resizeMode="cover"
            />
            {selectedData.club?.id === club.id && (
              <Animated.View
                style={[
                  styles.imageOverlay,
                  {
                    opacity: selectionFadeAnim,
                  },
                ]}
              >
                <View style={styles.checkmarkLarge}>
                  <FontAwesome name="check" size={20} color="#3867FF" />
                </View>
              </Animated.View>
            )}
          </View>

          {/* Club Info */}
          <View style={styles.clubInfo}>
            <View style={styles.clubHeader}>
              <Text style={styles.clubName} numberOfLines={1}>
                {club.name}
              </Text>
            </View>

            <View style={styles.ratingContainer}>
              <FontAwesome name="star" size={10} color="#FFD700" />
              <Text style={styles.ratingText}>
                {club.rating || "4.8"} ({club.reviews || "217"})
              </Text>
            </View>

            <Text style={styles.clubDetails} numberOfLines={2}>
              {club.courts || 6} terena · Padel · Tenis
            </Text>

            <View style={styles.clubFooter}>
              <Text style={styles.priceAmount}>
                {club.price || "1200"}{" "}
                <Text style={styles.priceUnit}>RSD/h</Text>
              </Text>
              <Text style={styles.distanceText}>
                {club.distance || "4.1 km"}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );

  const renderDateSelection = () => {
    return (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Calendar
          onDateSelect={(date) => setSelectedData({ ...selectedData, date })}
          selectedDate={selectedData.date}
        />
      </ScrollView>
    );
  };

  const renderCourtSelection = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {courts.map((court) => (
        <Pressable
          key={court.id}
          style={[
            styles.selectionCard,
            selectedData.court?.id === court.id && styles.selectionCardActive,
            !court.available && styles.selectionCardDisabled,
          ]}
          onPress={() =>
            court.available && setSelectedData({ ...selectedData, court })
          }
          disabled={!court.available}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{court.name}</Text>
              <Text style={styles.cardSubtitle}>
                {court.type === "clay"
                  ? "Šljaka"
                  : court.type === "hard"
                    ? "Tvrda podloga"
                    : "Trava"}
              </Text>
              {!court.available && (
                <Text style={styles.unavailableText}>Nedostupan</Text>
              )}
            </View>
            {selectedData.court?.id === court.id && (
              <View style={styles.checkmark}>
                <FontAwesome name="check" size={16} color="white" />
              </View>
            )}
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );

  const renderTimeSelection = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.timeGrid}>
        {timeSlots.map((time) => (
          <Pressable
            key={time}
            style={[
              styles.timeSlot,
              selectedData.time === time && styles.timeSlotActive,
            ]}
            onPress={() => setSelectedData({ ...selectedData, time })}
          >
            <Text
              style={[
                styles.timeText,
                selectedData.time === time && styles.timeTextActive,
              ]}
            >
              {time}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case "club":
        return renderClubSelection();
      case "date":
        return renderDateSelection();
      case "court":
        return renderCourtSelection();
      case "time":
        return renderTimeSelection();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <FontAwesome name="close" size={20} color={colors.text} />
        </Pressable>
      </SafeAreaView>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(getStepNumber() / 4) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.mainContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{getStepTitle()}</Text>
          <Text style={styles.subtitle}>Korak {getStepNumber()} od 4</Text>
        </View>
        {renderStepContent()}
      </View>

      {/* Bottom Bar */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
        <Pressable
          style={[
            styles.nextButton,
            !isNextEnabled() && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!isNextEnabled()}
        >
          <Text style={styles.nextButtonText}>Dalje</Text>
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
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    closeButton: {
      width: 44,
      height: 44,
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
    },
    clubInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "space-between",
    },
    clubHeader: {
      marginBottom: 4,
    },
    clubName: {
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
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#E5E7EB",
      alignItems: "center",
      justifyContent: "center",
    },
    timeSlotActive: {
      borderColor: colors.text,
      backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
      borderWidth: 2,
    },
    timeText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    timeTextActive: {
      fontWeight: "600",
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
  });
