import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface LocationFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLocation: string | null;
  onSelectLocation: (location: string | null) => void;
  colors: any;
  isDark: boolean;
}

const LOCATIONS = [
  { id: "all", label: "Sve lokacije" },
  { id: "Beograd", label: "Beograd" },
  { id: "Novi Sad", label: "Novi Sad" },
  { id: "Zlatibor", label: "Zlatibor" },
  { id: "Niš", label: "Niš" },
  { id: "Kragujevac", label: "Kragujevac" },
];

export default function LocationFilterModal({
  visible,
  onClose,
  selectedLocation,
  onSelectLocation,
  colors,
  isDark,
}: LocationFilterModalProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const accentColor = isDark ? "#B8FF00" : "#007AFF";

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const styles = createStyles(colors, accentColor, isDark);

  const handleSelectLocation = (locationId: string) => {
    onSelectLocation(locationId === "all" ? null : locationId);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Backdrop area that closes modal */}
        <Pressable style={styles.backdropTouchable} onPress={onClose} />

        {/* Modal content that doesn't close */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Izaberi lokaciju</Text>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {LOCATIONS.map((location) => {
              const isSelected =
                location.id === "all"
                  ? selectedLocation === null
                  : selectedLocation === location.id;

              return (
                <Pressable
                  key={location.id}
                  style={[
                    styles.locationItem,
                    isSelected && styles.selectedItem,
                  ]}
                  onPress={() => handleSelectLocation(location.id)}
                >
                  <Text
                    style={[
                      styles.locationText,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {location.label}
                  </Text>
                  {isSelected && (
                    <FontAwesome name="check" size={18} color={accentColor} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any, accentColor: string, isDark: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    backdropTouchable: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 40,
      paddingHorizontal: 20,
      paddingTop: 12,
      maxHeight: "80%",
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    scrollView: {
      flexGrow: 0,
    },
    locationItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: colors.background,
    },
    selectedItem: {
      backgroundColor: isDark
        ? "rgba(184, 255, 0, 0.1)"
        : "rgba(0, 122, 255, 0.1)",
      borderWidth: 1,
      borderColor: accentColor,
    },
    locationText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    selectedText: {
      color: accentColor,
      fontWeight: "600",
    },
  });
