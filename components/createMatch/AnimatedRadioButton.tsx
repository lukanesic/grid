import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { ThemeColors } from "./types";

interface AnimatedRadioButtonProps {
  isSelected: boolean;
  colors: ThemeColors;
  isDark: boolean;
}

export const AnimatedRadioButton = ({
  isSelected,
  colors,
  isDark,
}: AnimatedRadioButtonProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const innerScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: isSelected ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(innerScale, {
        toValue: isSelected ? 1 : 0,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSelected, animatedValue, innerScale]);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? "#333" : "#E5E7EB", colors.text],
  });

  return (
    <Animated.View
      style={[
        {
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          alignItems: "center",
          justifyContent: "center",
        },
        { borderColor },
      ]}
    >
      <Animated.View
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: colors.text,
          transform: [{ scale: innerScale }],
        }}
      />
    </Animated.View>
  );
};
