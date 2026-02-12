import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ProgressBar, QuestionOption } from "../../components";
import { PROFILE_QUESTIONS } from "../../constants/data";

export default function CreateProfileScreen() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentQuestion]);

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

  const question = PROFILE_QUESTIONS[currentQuestion];
  const totalQuestions = PROFILE_QUESTIONS.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleSelectOption = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [question.id]: option,
    });
  };

  const handleContinue = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, go to home
      router.push("/(home)/(tabs)");
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={[
              styles.backButton,
              currentQuestion === 0 && styles.backButtonDisabled,
            ]}
            onPress={handleBack}
            disabled={currentQuestion === 0}
          >
            <FontAwesome
              name="chevron-left"
              size={18}
              color={currentQuestion === 0 ? "#4A4A4A" : "#E6E6E6"}
            />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 16 }}>
          <ProgressBar progress={progress} />
        </View>

        {/* Question Content */}
        <Animated.View style={[styles.content, animatedStyle]}>
          <Text style={styles.questionTitle}>{question.question}</Text>
          <Text style={styles.subtitle}>{question.subtitle}</Text>

          {/* Options */}
          <Animated.View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <QuestionOption
                key={index}
                text={option}
                selected={selectedAnswers[question.id] === option}
                onPress={() => handleSelectOption(option)}
              />
            ))}
          </Animated.View>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            Vaši odabiri neće ograničiti pristup bilo kojoj funkciji.
          </Text>
        </Animated.View>

        {/* Continue Button */}
        <Button
          title="Nastavi"
          onPress={handleContinue}
          disabled={!selectedAnswers[question.id]}
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
