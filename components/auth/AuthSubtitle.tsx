import { StyleSheet, Text } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface AuthSubtitleProps {
  children: string;
}

export default function AuthSubtitle({ children }: AuthSubtitleProps) {
  const { fonts } = useTheme();
  return (
    <Text style={[styles.subtitle, { fontFamily: fonts.regular }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: "#9A9A9A",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
