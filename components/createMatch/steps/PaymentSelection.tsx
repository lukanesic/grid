import { FontAwesome } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimatedRadioButton } from "../AnimatedRadioButton";
import { AnimatedSelectionCard } from "../AnimatedSelectionCard";
import { PaymentMethod, ThemeColors } from "../types";

interface PaymentOption {
  id: PaymentMethod;
  title: string;
  icon: string;
  iconColor: string;
  logos?: { name: string; color: string }[];
}

interface PaymentSelectionProps {
  selectedPaymentMethod?: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  colors: ThemeColors;
  isDark: boolean;
}

export const PaymentSelection = ({
  selectedPaymentMethod,
  onSelectPaymentMethod,
  colors,
  isDark,
}: PaymentSelectionProps) => {
  const styles = getStyles(colors, isDark);

  const paymentOptions: PaymentOption[] = [
    {
      id: "card",
      title: "Kreditna ili debitna kartica",
      icon: "credit-card",
      iconColor: colors.text,
      logos: [
        { name: "cc-visa", color: "#1A1F71" },
        { name: "cc-mastercard", color: "#EB001B" },
        { name: "cc-amex", color: "#006FCF" },
        { name: "cc-discover", color: "#FF6000" },
      ],
    },
    {
      id: "cash",
      title: "Plaćanje kesom na licu mesta",
      icon: "money",
      iconColor: "#4CAF50",
    },
  ];

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.paymentContainer}>
        {paymentOptions.map((option) => (
          <AnimatedSelectionCard
            key={option.id}
            isSelected={selectedPaymentMethod === option.id}
            onPress={() => onSelectPaymentMethod(option.id)}
            style={styles.paymentOption}
            colors={colors}
            isDark={isDark}
          >
            <View style={styles.paymentInfo}>
              <View style={styles.paymentIconContainer}>
                <FontAwesome
                  name={option.icon as any}
                  size={24}
                  color={option.iconColor}
                />
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>{option.title}</Text>
                {option.logos && (
                  <View style={styles.paymentLogos}>
                    {option.logos.map((logo) => (
                      <FontAwesome
                        key={logo.name}
                        name={logo.name as any}
                        size={20}
                        color={logo.color}
                        style={styles.paymentLogo}
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>
            <AnimatedRadioButton
              isSelected={selectedPaymentMethod === option.id}
              colors={colors}
              isDark={isDark}
            />
          </AnimatedSelectionCard>
        ))}
      </View>
    </ScrollView>
  );
};

const getStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
    },
    paymentContainer: {
      gap: 12,
    },
    paymentOption: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    paymentInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    paymentIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    paymentDetails: {
      flex: 1,
    },
    paymentTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    paymentLogos: {
      flexDirection: "row",
      gap: 8,
    },
    paymentLogo: {
      marginRight: 4,
    },
  });
