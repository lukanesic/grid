import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotificationItem, NotificationSection } from "../../components";
import {
  NOTIFICATION_SECTIONS,
  NOTIFICATION_STATUS,
} from "../../constants/data";
import { useTheme } from "../../contexts/ThemeContext";

export default function NotificationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome name="chevron-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Notifikacije</Text>
        </View>

        {NOTIFICATION_SECTIONS.map((section) => (
          <NotificationSection key={section.title} title={section.title}>
            {section.items.map((item, index) => {
              const status =
                NOTIFICATION_STATUS[
                  item.type as keyof typeof NOTIFICATION_STATUS
                ];

              return (
                <NotificationItem
                  key={`${item.name}-${item.time}`}
                  name={item.name}
                  message={item.message}
                  timeLabel={`${item.time} ago`}
                  statusColor={status.color}
                  statusIcon={status.icon}
                  showDivider={index !== section.items.length - 1}
                />
              );
            })}
          </NotificationSection>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    backButton: {
      padding: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
    },
  });
