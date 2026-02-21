import { ScrollView, StyleSheet } from "react-native";
import { Calendar } from "../../../components";
import { ThemeColors } from "../types";

interface DateSelectionProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  colors: ThemeColors;
  isDark: boolean;
}

export const DateSelection = ({
  selectedDate,
  onSelectDate,
  colors,
  isDark,
}: DateSelectionProps) => {
  const styles = getStyles(colors, isDark);

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Calendar onDateSelect={onSelectDate} selectedDate={selectedDate} />
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
  });
