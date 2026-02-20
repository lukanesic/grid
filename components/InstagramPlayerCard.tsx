import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface InstagramPlayerCardProps {
  userId: string;
  name: string;
  avatar?: string;
  isFollowing?: boolean;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
}

export default function InstagramPlayerCard({
  userId,
  name,
  avatar,
  isFollowing,
  onPress,
  style,
}: InstagramPlayerCardProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  // Use full name instead of just first name
  const displayName = name;

  return (
    <Pressable style={[styles.container, style]} onPress={onPress}>
      <View style={styles.storyRing}>
        <View style={styles.imageContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Text style={styles.initials}>
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
        {displayName}
      </Text>
    </Pressable>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      marginRight: 16,
      width: 84, // Wider to accommodate full names
    },
    storyRing: {
      width: 74,
      height: 74,
      borderRadius: 37,
      borderWidth: 2,
      borderColor: isDark ? "#B8FF00" : "#3867FF",
      padding: 3,
      justifyContent: "center",
      alignItems: "center",
    },
    imageContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      overflow: "hidden",
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 32,
    },
    defaultAvatar: {
      backgroundColor: isDark ? "#333333" : "#E8E8E8",
      justifyContent: "center",
      alignItems: "center",
    },
    initials: {
      color: isDark ? colors.text : "#666666",
      fontSize: 16,
      fontWeight: "600",
    },
    name: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "500",
      textAlign: "center",
      marginTop: 6,
      paddingHorizontal: 2,
      lineHeight: 13,
    },
  });
