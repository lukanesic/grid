import { FontAwesome } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface MenuRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  iconColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  showChevron?: boolean;
  iconSize?: number;
  chevronSize?: number;
}

export default function MenuRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  iconColor,
  titleColor,
  subtitleColor,
  showChevron = false,
  iconSize = 30,
  chevronSize = 20,
}: MenuRowProps) {
  const { colors, fonts } = useTheme();
  const Container = onPress ? Pressable : View;

  return (
    <Container style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <FontAwesome
          name={icon as any}
          size={iconSize}
          color={iconColor || colors.textSecondary}
        />
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.title,
              { color: titleColor || colors.text, fontFamily: fonts.medium },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                {
                  color: subtitleColor || colors.textSecondary,
                  fontFamily: fonts.regular,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right ? (
        <View style={styles.right}>{right}</View>
      ) : showChevron ? (
        <FontAwesome
          name="chevron-right"
          size={chevronSize}
          color={colors.textSecondary}
        />
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textGroup: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 12,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
});
