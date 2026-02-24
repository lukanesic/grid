import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface CalendarDay {
  day: string;
  date: number;
  fullDate: Date;
  isToday: boolean;
}

interface HorizontalCalendarProps {
  onDateSelect?: (date: string) => void; // YYYY-MM-DD format
}

export default function HorizontalCalendar({
  onDateSelect,
}: HorizontalCalendarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  // Generate dates for next 3 weeks (21 days)
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const today = new Date();
    const dayNames = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      days.push({
        day: dayNames[date.getDay()],
        date: date.getDate(),
        fullDate: date,
        isToday: i === 0,
      });
    }

    return days;
  };

  const [calendarDays] = useState<CalendarDay[]>(generateCalendarDays());
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const monthOpacity = useRef(new Animated.Value(1)).current;

  // Get selected date info
  const selectedDay = calendarDays[selectedDateIndex];
  const selectedMonth = selectedDay.fullDate.toLocaleDateString("bs-BA", {
    month: "long",
    year: "numeric",
  });

  // Format today's date without year
  const todayDate = calendarDays[0].fullDate;
  const todayFormatted = todayDate.toLocaleDateString("bs-BA", {
    day: "numeric",
    month: "long",
  });
  const todayText = `Danas ${todayFormatted}`;

  const [currentMonth, setCurrentMonth] = useState(selectedMonth);

  // Handle month change animation
  useEffect(() => {
    if (currentMonth !== selectedMonth) {
      // Fade out
      Animated.timing(monthOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Update month text
        setCurrentMonth(selectedMonth);
        // Fade in
        Animated.timing(monthOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [selectedMonth]);

  // Notify parent component when date changes
  useEffect(() => {
    if (onDateSelect && selectedDay) {
      const formattedDate = selectedDay.fullDate
        .toLocaleDateString("en-CA")
        .split("T")[0]; // YYYY-MM-DD
      onDateSelect(formattedDate);
    }
  }, [selectedDateIndex, onDateSelect]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.todayLabel}>{todayText}</Text>
        <Animated.Text style={[styles.monthLabel, { opacity: monthOpacity }]}>
          {currentMonth}
        </Animated.Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {calendarDays.map((item, index) => (
          <Pressable
            key={`${item.fullDate.toISOString()}-${index}`}
            style={[
              styles.dayButton,
              selectedDateIndex === index && styles.dayButtonSelected,
            ]}
            onPress={() => setSelectedDateIndex(index)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDateIndex === index && styles.dayTextSelected,
              ]}
            >
              {item.day}
            </Text>
            <View
              style={[
                styles.dateCircle,
                selectedDateIndex === index && styles.dateCircleSelected,
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  selectedDateIndex === index && styles.dateTextSelected,
                ]}
              >
                {item.date}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      paddingVertical: 16,
      backgroundColor: "transparent",
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    todayLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    monthLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.7)",
    },
    scrollContent: {
      paddingHorizontal: 20,
      gap: 12,
    },
    dayButton: {
      alignItems: "center",
      gap: 8,
      paddingVertical: 8,
    },
    dayButtonSelected: {
      // Selected state
    },
    dayText: {
      fontSize: 12,
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.7)",
    },
    dayTextSelected: {
      color: "#FFFFFF",
    },
    dateCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
    dateCircleSelected: {
      backgroundColor: "#B8FF00",
      borderColor: "#B8FF00",
    },
    dateText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    dateTextSelected: {
      color: "#000000",
    },
  });
