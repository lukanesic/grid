import { StyleSheet, Text } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface AuthTitleProps {
  children: string;
}

export default function AuthTitle({ children }: AuthTitleProps) {
  const { fonts } = useTheme();
  return (
    <Text style={[styles.title, { fontFamily: fonts.bold }]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "#F2F2F2",
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
});
