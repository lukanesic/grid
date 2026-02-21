import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TimeSlot } from "../../../types/court";
import { ThemeColors } from "../types";

interface TimeSelectionProps {
  timeSlots: TimeSlot[];
  selectedTimes: string[];
  onSelectTime: (time: string) => void;
  colors: ThemeColors;
  isDark: boolean;
}

export const TimeSelection = ({
  timeSlots,
  selectedTimes,
  onSelectTime,
  colors,
  isDark,
}: TimeSelectionProps) => {
  const styles = getStyles(colors, isDark);

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.timeGrid}>
        {timeSlots.map((slot) => {
          const isSelected = selectedTimes.includes(slot.time_slot);
          const isUnavailable = !slot.is_available;
          return (
            <Pressable
              key={slot.time_slot}
              onPress={() => slot.is_available && onSelectTime(slot.time_slot)}
              disabled={isUnavailable}
              style={[
                styles.timeSlot,
                isSelected && styles.timeSlotActive,
                isUnavailable && styles.timeSlotUnavailable,
              ]}
            >
              <Text
                style={[
                  styles.timeText,
                  isUnavailable && styles.timeTextUnavailable,
                ]}
              >
                {slot.time_slot}
              </Text>
              {isUnavailable && <View style={styles.strikethrough} />}
            </Pressable>
          );
        })}
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
    timeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    timeSlot: {
      position: "relative",
      width: "30%",
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDark ? "#333" : "#E5E7EB",
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    timeSlotActive: {
      backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
      borderColor: colors.text,
    },
    timeSlotUnavailable: {
      opacity: 0.5,
      backgroundColor: isDark ? "#222" : "#f5f5f5",
    },
    timeText: {
      fontSize: 16,
      color: colors.text,
    },
    timeTextUnavailable: {
      color: colors.textSecondary,
    },
    strikethrough: {
      position: "absolute",
      width: "70%",
      height: 2,
      backgroundColor: isDark ? "#888" : "#555",
      alignSelf: "center",
    },
  });
