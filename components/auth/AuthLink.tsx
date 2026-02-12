import { Pressable, StyleSheet, Text } from "react-native";

interface AuthLinkProps {
  onPress: () => void;
  children: string;
}

export default function AuthLink({ onPress, children }: AuthLinkProps) {
  return (
    <Pressable style={styles.linkRow} onPress={onPress}>
      <Text style={styles.linkText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linkRow: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  linkText: {
    color: "#9A9A9A",
    fontSize: 13,
    textAlign: "center",
  },
});
