import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  markedDates?: Date[];
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  markedDates = [],
}: CalendarProps) {
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate max date (2 months from today)
  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 2);

  const [currentMonth, setCurrentMonth] = useState(selectedDate || today);

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

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: (number | null)[] = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
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

  const isDateMarked = (day: number) => {
    return markedDates.some((date) => {
      return (
        date.getDate() === day &&
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isDateDisabled = (day: number, index: number) => {
    const firstDay = getFirstDayOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);

    let checkDate: Date;

    if (index < firstDay) {
      // Previous month
      checkDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        day,
      );
    } else if (day <= daysInMonth) {
      // Current month
      checkDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
    } else {
      // Next month
      checkDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        day,
      );
    }

    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today || checkDate > maxDate;
  };

  const handleDatePress = (day: number | null, index: number) => {
    if (day === null) return;

    // Check if date is disabled
    if (isDateDisabled(day, index)) return;

    const firstDay = getFirstDayOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);

    let newDate: Date;

    if (index < firstDay) {
      // Previous month
      newDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        day,
      );
    } else if (day <= daysInMonth) {
      // Current month
      newDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
    } else {
      // Next month
      newDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        day,
      );
    }

    onDateSelect?.(newDate);
  };

  const changeMonth = (direction: number) => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + direction,
      1,
    );

    // Don't allow navigating before current month or more than 2 months ahead
    const newMonthStart = new Date(
      newMonth.getFullYear(),
      newMonth.getMonth(),
      1,
    );
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonthStart = new Date(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      1,
    );

    if (newMonthStart < todayMonthStart || newMonthStart > maxMonthStart) {
      return;
    }

    setCurrentMonth(newMonth);
  };

  const days = generateCalendarDays();
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthYear}>
          <Text style={styles.monthText}>
            {monthNames[currentMonth.getMonth()]}
          </Text>
          <Text style={styles.yearText}>{currentMonth.getFullYear()}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => changeMonth(-1)} style={styles.navButton}>
            <FontAwesome name="chevron-left" size={18} color="#F2F2F2" />
          </Pressable>
          <Pressable onPress={() => changeMonth(1)} style={styles.navButton}>
            <FontAwesome name="chevron-right" size={18} color="#F2F2F2" />
          </Pressable>
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
          const isMarked = day !== null && isCurrentMonth && isDateMarked(day);
          const isSelected =
            day !== null && isCurrentMonth && isDateSelected(day);
          const isDisabled = day !== null && isDateDisabled(day, index);

          return (
            <Pressable
              key={index}
              style={styles.dayCell}
              onPress={() => handleDatePress(day, index)}
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
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0B0B0B",
    borderRadius: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  monthYear: {
    gap: 4,
  },
  monthText: {
    color: "#F2F2F2",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  yearText: {
    color: "#8B8B8B",
    fontSize: 16,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
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
    color: "#8B8B8B",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%", // 100% / 7 days
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
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    zIndex: 1,
  },
  dayTextInactive: {
    color: "#3C3C3C",
  },
  dayTextDisabled: {
    color: "#2A2A2A",
    textDecorationLine: "line-through",
    textDecorationColor: "#2A2A2A",
  },
  dayTextSelected: {
    color: "#0B0B0B",
    fontWeight: "600",
  },
  selectedCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    zIndex: 0,
  },
  markerDot: {
    position: "absolute",
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F2F2F2",
  },
});
