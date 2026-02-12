import { StyleSheet, Text, View } from "react-native";

interface AuthDividerProps {
  text?: string;
}

export default function AuthDivider({ text = "ili" }: AuthDividerProps) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    marginVertical: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2C2C2C",
  },
  dividerText: {
    color: "#8B8B8B",
    fontSize: 12,
  },
});
