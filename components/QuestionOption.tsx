import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface QuestionOptionProps {
  text: string;
  selected: boolean;
  onPress: () => void;
}

export default function QuestionOption({
  text,
  selected,
  onPress,
}: QuestionOptionProps) {
  const { fonts } = useTheme();
  return (
    <Pressable
      style={[styles.option, selected && styles.selected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          { fontFamily: selected ? fonts.semiBold : fonts.medium },
          selected && styles.selectedText,
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: "#1E1F23",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selected: {
    backgroundColor: "#3867FF",
    borderColor: "#3867FF",
  },
  text: {
    color: "#E6E6E6",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  selectedText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
