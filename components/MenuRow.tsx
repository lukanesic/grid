import { FontAwesome } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  iconColor = "#8B8B8B",
  titleColor = "#F2F2F2",
  subtitleColor = "#6F6F6F",
  showChevron = false,
  iconSize = 30,
  chevronSize = 20,
}: MenuRowProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <FontAwesome name={icon as any} size={iconSize} color={iconColor} />
        <View style={styles.textGroup}>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: subtitleColor }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right ? (
        <View style={styles.right}>{right}</View>
      ) : showChevron ? (
        <FontAwesome name="chevron-right" size={chevronSize} color="#8B8B8B" />
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
