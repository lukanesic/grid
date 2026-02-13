import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface MenuSectionProps {
  children: ReactNode;
}

export default function MenuSection({ children }: MenuSectionProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return <View style={styles.section}>{children}</View>;
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    section: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
