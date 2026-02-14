import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface MenuHeaderProps {
  title: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}

export default function MenuHeader({
  title,
  onBack,
  rightSlot,
}: MenuHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <Pressable onPress={onBack}>
        <FontAwesome name="chevron-left" size={20} color={colors.text} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      {rightSlot ?? <View style={styles.placeholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  placeholder: {
    width: 20,
  },
});
