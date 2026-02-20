import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  markedDates?: Date[];
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? "#0B0B0B" : "#FFFFFF",
      borderRadius: 16,
      // paddingHorizontal: 24,
    },
    monthContainer: {
      paddingBottom: 32,
    },
    header: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "flex-start",
      marginBottom: 24,
    },
    monthYear: {
      gap: 4,
    },
    monthText: {
      color: isDark ? "#F2F2F2" : colors.text,
      fontSize: 32,
      fontWeight: "700",
      letterSpacing: -0.5,
    },
    yearText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "500",
    },
    dayNamesRow: {
      flexDirection: "row",
      marginBottom: 20,
    },
    dayNameCell: {
      flex: 1,
      alignItems: "center",
    },
    dayNameText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.5,
    },
    calendarGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayCell: {
      width: "14.28%",
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    dayContent: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
    },
    dayText: {
      color: isDark ? "#F2F2F2" : colors.text,
      fontSize: 18,
      fontWeight: "500",
      textAlign: "center",
      zIndex: 1,
    },
    dayTextInactive: {
      color: isDark ? "#3C3C3C" : "#A0A0A0",
    },
    dayTextDisabled: {
      color: isDark ? "#2A2A2A" : "#B8B8B8",
      textDecorationLine: "line-through",
      textDecorationColor: isDark ? "#2A2A2A" : "#B8B8B8",
    },
    dayTextSelected: {
      color: isDark ? "#0B0B0B" : "#FFFFFF",
      fontWeight: "600",
    },
    selectedCircle: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "#F2F2F2" : colors.blue,
      zIndex: 0,
    },
    markerDot: {
      position: "absolute",
      bottom: 6,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? "#F2F2F2" : colors.blue,
    },
  });

export default function Calendar({
  selectedDate,
  onDateSelect,
  markedDates = [],
}: CalendarProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate max date (2 months from today)
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 2);

  // Generate array of available months (current + next 2 months)
  const availableMonths = [];
  for (let i = 0; i <= 2; i++) {
    const month = new Date(today);
    month.setMonth(today.getMonth() + i);
    availableMonths.push(month);
  }

  const monthNames = [
    "Januar",
    "Februar",
    "Mart",
    "April",
    "Maj",
    "Jun",
    "Jul",
    "Avgust",
    "Septembar",
    "Oktobar",
    "Novembar",
    "Decembar",
  ];

  const dayNames = ["NED", "PON", "UTO", "SRE", "ČET", "PET", "SUB"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (month: Date) => {
    const daysInMonth = getDaysInMonth(month);
    const firstDay = getFirstDayOfMonth(month);
    const days: (number | null)[] = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(
      new Date(month.getFullYear(), month.getMonth() - 1, 1),
    );
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(prevMonthDays - i);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Next month days (fill to 35 total for 5 rows)
    const remainingDays = 35 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(i);
    }

    return days;
  };

  const isDateMarked = (day: number, month: Date) => {
    return markedDates.some((date) => {
      return (
        date.getDate() === day &&
        date.getMonth() === month.getMonth() &&
        date.getFullYear() === month.getFullYear()
      );
    });
  };

  const isDateSelected = (day: number, month: Date) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month.getMonth() &&
      selectedDate.getFullYear() === month.getFullYear()
    );
  };

  const isDateDisabled = (day: number, index: number, month: Date) => {
    const firstDay = getFirstDayOfMonth(month);
    const daysInMonth = getDaysInMonth(month);

    let checkDate: Date;

    if (index < firstDay) {
      // Previous month
      checkDate = new Date(month.getFullYear(), month.getMonth() - 1, day);
    } else if (day <= daysInMonth) {
      // Current month
      checkDate = new Date(month.getFullYear(), month.getMonth(), day);
    } else {
      // Next month
      checkDate = new Date(month.getFullYear(), month.getMonth() + 1, day);
    }

    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today || checkDate > maxDate;
  };

  const handleDatePress = (day: number | null, index: number, month: Date) => {
    if (day === null) return;

    // Check if date is disabled
    if (isDateDisabled(day, index, month)) return;

    const firstDay = getFirstDayOfMonth(month);
    const daysInMonth = getDaysInMonth(month);

    let newDate: Date;

    if (index < firstDay) {
      // Previous month
      newDate = new Date(month.getFullYear(), month.getMonth() - 1, day);
    } else if (day <= daysInMonth) {
      // Current month
      newDate = new Date(month.getFullYear(), month.getMonth(), day);
    } else {
      // Next month
      newDate = new Date(month.getFullYear(), month.getMonth() + 1, day);
    }

    onDateSelect?.(newDate);
  };

  const renderMonth = (month: Date) => {
    const days = generateCalendarDays(month);
    const firstDay = getFirstDayOfMonth(month);
    const daysInMonth = getDaysInMonth(month);

    return (
      <View
        key={`${month.getFullYear()}-${month.getMonth()}`}
        style={styles.monthContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.monthYear}>
            <Text style={styles.monthText}>{monthNames[month.getMonth()]}</Text>
            <Text style={styles.yearText}>{month.getFullYear()}</Text>
          </View>
        </View>

        {/* Day names */}
        <View style={styles.dayNamesRow}>
          {dayNames.map((day) => (
            <View key={day} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => {
            const isCurrentMonth =
              index >= firstDay && index < firstDay + daysInMonth;
            const isMarked =
              day !== null && isCurrentMonth && isDateMarked(day, month);
            const isSelected =
              day !== null && isCurrentMonth && isDateSelected(day, month);
            const isDisabled =
              day !== null && isDateDisabled(day, index, month);

            return (
              <Pressable
                key={index}
                style={styles.dayCell}
                onPress={() => handleDatePress(day, index, month)}
                disabled={isDisabled}
              >
                <View style={styles.dayContent}>
                  {isSelected ? <View style={styles.selectedCircle} /> : null}
                  <Text
                    style={[
                      styles.dayText,
                      !isCurrentMonth && styles.dayTextInactive,
                      isDisabled && styles.dayTextDisabled,
                      isSelected ? styles.dayTextSelected : undefined,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
                {isMarked && !isDisabled ? (
                  <View style={styles.markerDot} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {availableMonths.map((month) => renderMonth(month))}
    </View>
  );
}
