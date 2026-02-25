import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

interface AnimatedTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
  fonts: any;
  isDark: boolean;
}

export const AnimatedTab = ({
  label,
  isActive,
  onPress,
  colors,
  fonts,
  isDark,
}: AnimatedTabProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive, animatedValue]);

  const borderBottomColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", isDark ? colors.text : colors.blue],
  });

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textSecondary, isDark ? colors.text : colors.blue],
  });

  const styles = createStyles(colors, fonts);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Animated.View
        style={[
          styles.tab,
          {
            borderBottomColor,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.tabText,
            {
              color: textColor,
              fontWeight: isActive ? "600" : "400",
            },
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const createStyles = (colors: any, fonts: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    tab: {
      paddingVertical: 12,
      alignItems: "center",
      borderBottomWidth: 2,
    },
    tabText: {
      fontSize: 14,
      fontFamily: fonts.regular,
    },
  });
