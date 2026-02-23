import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface MatchCardProps {
  id: string;
  type: string;
  date: string;
  location: string;
  duration: string;
  level: string;
  onPress?: () => void;
}

export default function MatchCard({
  id,
  type,
  date,
  location,
  duration,
  level,
  onPress,
}: MatchCardProps) {
  const { colors, fonts } = useTheme();
  const styles = getStyles(colors, fonts);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.icon}>
        <FontAwesome name="circle-o" size={24} color={colors.textSecondary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.type}>{type}</Text>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.location}>{location}</Text>
      </View>
    </Pressable>
  );
}

const getStyles = (colors: any, fonts: any) =>
  StyleSheet.create({
    card: {
      width: 320,
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      marginRight: 12,
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    info: {
      flex: 1,
    },
    type: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
      fontFamily: fonts.bold,
    },
    date: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginTop: 4,
      fontFamily: fonts.semiBold,
    },
    location: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
      fontFamily: fonts.regular,
    },
  });
