import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

interface AuthLinkProps {
  onPress: () => void;
  children: string;
}

export default function AuthLink({ onPress, children }: AuthLinkProps) {
  const { fonts } = useTheme();
  return (
    <Pressable style={styles.linkRow} onPress={onPress}>
      <Text style={[styles.linkText, { fontFamily: fonts.regular }]}>
        {children}
      </Text>
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
