import { useEffect, useRef } from "react";
import { Animated, Pressable, ViewStyle } from "react-native";
import { ThemeColors } from "./types";

interface AnimatedSelectionCardProps {
  children: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  activeStyle?: ViewStyle;
  disabledStyle?: ViewStyle;
  colors: ThemeColors;
  isDark: boolean;
}

export const AnimatedSelectionCard = ({
  children,
  isSelected,
  onPress,
  disabled,
  style,
  activeStyle,
  disabledStyle,
  colors,
  isDark,
}: AnimatedSelectionCardProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isSelected ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isSelected, animatedValue]);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? "#333" : "#E5E7EB", colors.text],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, isDark ? "#1a1a1a" : "#f9fafb"],
  });

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <Animated.View
        style={[
          style,
          { borderColor, backgroundColor },
          disabled && disabledStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};
