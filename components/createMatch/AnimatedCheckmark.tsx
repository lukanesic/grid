import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface AnimatedCheckmarkProps {
  isVisible: boolean;
  style?: ViewStyle;
  color?: string;
  size?: number;
}

export const AnimatedCheckmark = ({
  isVisible,
  style,
  color = "white",
  size = 16,
}: AnimatedCheckmarkProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: isVisible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: isVisible ? 1 : 0.8,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible, opacity, scale]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>
      <FontAwesome name="check" size={size} color={color} />
    </Animated.View>
  );
};
