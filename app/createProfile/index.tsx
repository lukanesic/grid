import AuthInput from "@/components/auth/AuthInput";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/utils/uploadImage";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ProgressBar, QuestionOption } from "../../components";
import { PROFILE_QUESTIONS } from "../../constants/data";

// Helper function to convert DD.MM.YYYY or DD/MM/YYYY to YYYY-MM-DD
const formatDateForDatabase = (dateString: string): string | null => {
  if (!dateString || !dateString.trim()) return null;

  // Remove any extra spaces
  const cleaned = dateString.trim();

  // Match DD.MM.YYYY or DD/MM/YYYY format
  const match = cleaned.match(/^(\d{1,2})[\.\/-](\d{1,2})[\.\/-](\d{4})$/);

  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    const year = match[3];

    // Return in YYYY-MM-DD format
    return `${year}-${month}-${day}`;
  }

  return null;
};

export default function CreateProfileScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0); // -1 = personal info, 0-5 = questions
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Personal info state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [location, setLocation] = useState("");

  // Question answers state
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});

  const animatedValue = useRef(new Animated.Value(0)).current;

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Dozvola potrebna",
        "Potrebna je dozvola za pristup galeriji.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const animatedStyle = {
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const totalSteps = PROFILE_QUESTIONS.length + 1; // +1 for personal info
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const isPersonalInfoStep = currentStep === 0;
  const questionIndex = currentStep - 1; // Questions start from step 1
  const currentQuestion = PROFILE_QUESTIONS[questionIndex];

  const handleSelectOption = (option: string) => {
    if (currentQuestion) {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion.id]: option,
      });
    }
  };

  const handleSubmitProfile = async () => {
    if (!user) return;

    setIsSubmitting(true);

    let avatarUrl = "https://i.pravatar.cc/150?img=47";

    // Upload avatar to Supabase Storage if user selected one
    if (avatarUri) {
      const uploadedUrl = await uploadImage(avatarUri, user.id, "avatars");
      if (uploadedUrl) {
        avatarUrl = uploadedUrl;
      } else {
        Alert.alert(
          "Upozorenje",
          "Slika nije uspešno upload-ovana, koristi se placeholder.",
        );
      }
    }

    // Convert date format from DD.MM.YYYY to YYYY-MM-DD
    const formattedBirthDate = formatDateForDatabase(birthDate);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
        birth_date: formattedBirthDate,
        location: location,
        avatar_url: avatarUrl,
        profile_completed: true,
      })
      .eq("id", user.id);

    setIsSubmitting(false);

    if (error) {
      Alert.alert("Greška", "Došlo je do greške pri čuvanju profila.");
      console.error("[CreateProfile] Error updating profile:", error);
      return;
    }

    // Refresh profile in AuthContext to trigger navigation
    await refreshProfile();
    router.replace("/(home)/(tabs)");
  };

  const handleContinue = () => {
    // Personal info validation
    if (isPersonalInfoStep) {
      if (
        !avatarUri ||
        !fullName.trim() ||
        !phoneNumber.trim() ||
        !location.trim()
      ) {
        Alert.alert(
          "Greška",
          "Molimo popunite sva obavezna polja i izaberite avatar.",
        );
        return;
      }
      setCurrentStep(currentStep + 1);
      return;
    }

    // Questions flow
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All questions answered, submit profile
      handleSubmitProfile();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canContinue = isPersonalInfoStep
    ? avatarUri && fullName.trim() && phoneNumber.trim() && location.trim()
    : currentQuestion && selectedAnswers[currentQuestion.id];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={[
              styles.backButton,
              currentStep === 0 && styles.backButtonDisabled,
            ]}
            onPress={handleBack}
            disabled={currentStep === 0}
          >
            <FontAwesome
              name="chevron-left"
              size={18}
              color={currentStep === 0 ? "#4A4A4A" : "#E6E6E6"}
            />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 16 }}>
          <ProgressBar progress={progress} />
        </View>

        {/* Content - Personal Info or Questions */}
        <Animated.View style={[styles.content, animatedStyle]}>
          {isPersonalInfoStep ? (
            // Personal Info Step
            <>
              <Text style={styles.questionTitle}>
                Dobrodošli! Unesite vaše podatke
              </Text>
              <Text style={styles.subtitle}>
                Pomozite nam da kreiramo vaš profil i pronađemo savršene mečeve
                za vas.
              </Text>

              <View style={styles.formContainer}>
                {/* Avatar Upload */}
                <Pressable
                  style={styles.avatarUploadContainer}
                  onPress={handlePickImage}
                >
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={styles.avatarPreview}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <FontAwesome name="camera" size={32} color="#8B8B8B" />
                    </View>
                  )}
                  <View style={styles.avatarEditBadge}>
                    <FontAwesome name="pencil" size={12} color="#0B0B0B" />
                  </View>
                </Pressable>
                <Text style={styles.avatarLabel}>Dodaj svoju sliku *</Text>

                <AuthInput
                  icon="user"
                  placeholder="Ime i prezime *"
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={setFullName}
                />

                <AuthInput
                  icon="phone"
                  placeholder="Broj telefona *"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />

                <AuthInput
                  icon="calendar"
                  placeholder="Datum rođenja (DD.MM.YYYY)"
                  keyboardType="numbers-and-punctuation"
                  value={birthDate}
                  onChangeText={setBirthDate}
                  maxLength={10}
                />

                <AuthInput
                  icon="map-marker"
                  placeholder="Град *"
                  autoCapitalize="words"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </>
          ) : (
            // Questions Step
            <>
              <Text style={styles.questionTitle}>
                {currentQuestion.question}
              </Text>
              <Text style={styles.subtitle}>{currentQuestion.subtitle}</Text>

              {/* Options */}
              <Animated.View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => (
                  <QuestionOption
                    key={index}
                    text={option}
                    selected={selectedAnswers[currentQuestion.id] === option}
                    onPress={() => handleSelectOption(option)}
                  />
                ))}
              </Animated.View>

              {/* Disclaimer */}
              <Text style={styles.disclaimer}>
                Vaši odabiri neće ograničiti pristup bilo kojoj funkciji.
              </Text>
            </>
          )}
        </Animated.View>

        {/* Continue Button */}
        <Button
          title={
            currentStep === totalSteps - 1
              ? isSubmitting
                ? "Čuvanje..."
                : "Završi"
              : "Nastavi"
          }
          onPress={handleContinue}
          disabled={!canContinue || isSubmitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonDisabled: {
    opacity: 0.4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  questionTitle: {
    color: "#F2F2F2",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    color: "#8B8B8B",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  formContainer: {
    marginBottom: 32,
  },
  avatarUploadContainer: {
    alignSelf: "center",
    marginBottom: 8,
    position: "relative",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1E1F23",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#B8FF00",
    borderStyle: "dashed",
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#B8FF00",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#B8FF00",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0B0B0B",
  },
  avatarLabel: {
    color: "#8B8B8B",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  disclaimer: {
    color: "#8B8B8B",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
