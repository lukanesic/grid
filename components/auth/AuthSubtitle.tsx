import { StyleSheet, Text } from "react-native";

interface AuthSubtitleProps {
  children: string;
}

export default function AuthSubtitle({ children }: AuthSubtitleProps) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  subtitle: {
    color: "#9A9A9A",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
