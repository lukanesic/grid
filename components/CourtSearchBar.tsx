import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

interface CourtSearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
}

export default function CourtSearchBar({
  value,
  onChangeText,
  onFilterPress,
}: CourtSearchBarProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder="Search"
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      <Pressable style={styles.filterButton} onPress={onFilterPress}>
        <FontAwesome name="sliders" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    searchContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    filterButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#000000",
      justifyContent: "center",
      alignItems: "center",
    },
  });
