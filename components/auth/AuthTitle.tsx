import { StyleSheet, Text } from "react-native";

interface AuthTitleProps {
  children: string;
}

export default function AuthTitle({ children }: AuthTitleProps) {
  return <Text style={styles.title}>{children}</Text>;
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
