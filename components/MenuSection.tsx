import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface MenuSectionProps {
  children: ReactNode;
}

export default function MenuSection({ children }: MenuSectionProps) {
  return <View style={styles.section}>{children}</View>;
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#121418",
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
});
