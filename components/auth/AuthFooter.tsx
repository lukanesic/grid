import { Pressable, StyleSheet, Text, View } from "react-native";

interface AuthFooterProps {
  text: string;
  linkText: string;
  onLinkPress: () => void;
}

export default function AuthFooter({
  text,
  linkText,
  onLinkPress,
}: AuthFooterProps) {
  return (
    <View style={styles.footerRow}>
      <Text style={styles.footerText}>{text}</Text>
      <Pressable onPress={onLinkPress}>
        <Text style={styles.footerLink}> {linkText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: "#8B8B8B",
    fontSize: 13,
  },
  footerLink: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
