import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface HotEventCardProps {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  participants: number;
  icon: string;
  type: "workshop" | "tournament" | "training";
  onPress?: () => void;
}

export default function HotEventCard({
  title,
  subtitle,
  date,
  location,
  participants,
  icon,
  type,
  onPress,
}: HotEventCardProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);

  const getTypeColor = () => {
    switch (type) {
      case "tournament":
        return isDark ? "#FFD700" : "#B8A900";
      case "workshop":
        return colors.blue;
      case "training":
        return "#FF6B35";
      default:
        return colors.blue;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case "tournament":
        return "TURNIR";
      case "workshop":
        return "RADIONICA";
      case "training":
        return "TRENING";
      default:
        return "DOGAĐAJ";
    }
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Hot Badge */}
      <View style={styles.hotBadge}>
        <FontAwesome name="bolt" size={12} color="#FFFFFF" />
      </View>

      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.headerText}>
          <View
            style={[styles.typeTag, { backgroundColor: getTypeColor() + "20" }]}
          >
            <Text style={[styles.typeText, { color: getTypeColor() }]}>
              {getTypeLabel()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <FontAwesome name="calendar" size={12} color="#8B8B8B" />
          <Text style={styles.infoText}>{date}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <FontAwesome name="map-marker" size={12} color="#8B8B8B" />
          <Text style={styles.infoText}>{location}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.participantsContainer}>
          <FontAwesome name="users" size={14} color={getTypeColor()} />
          <Text style={[styles.participants, { color: getTypeColor() }]}>
            {participants} učesnika
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      position: "relative",
      borderLeftWidth: 4,
      borderLeftColor: "#3867FF",
    },
    hotBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: "#3867FF",
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    hotText: {
      fontSize: 12,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 12,
    },
    icon: {
      fontSize: 32,
    },
    headerText: {
      flex: 1,
    },
    typeTag: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    typeText: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 12,
      lineHeight: 18,
    },
    infoRow: {
      marginBottom: 6,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    infoText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    footer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    participantsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    participants: {
      fontSize: 13,
      fontWeight: "600",
    },
  });
