import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";

export default function ChatInfoScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { chatId, otherUserId, name, avatar } = useLocalSearchParams();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const avatarUrl = Array.isArray(avatar) ? avatar[0] : avatar;
  const userName = Array.isArray(name) ? name[0] : name;

  const handleViewProfile = () => {
    if (otherUserId) {
      router.push(`/(home)/playerProfile?id=${otherUserId}`);
    }
  };

  const handleDeleteChat = () => {
    Alert.alert(
      "Potvrdi brisanje",
      "Da li ste sigurni da želite da izbrišete ovaj razgovor?",
      [
        {
          text: "Otkaži",
          style: "cancel",
        },
        {
          text: "Izbriši",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Implement delete chat functionality
              console.log("Deleting chat:", chatId);
              router.replace("/(home)/(tabs)/inbox");
            } catch (error) {
              console.error("Error deleting chat:", error);
            }
          },
        },
      ],
    );
  };

  const handleBlockUser = () => {
    Alert.alert(
      "Blokiraj korisnika",
      `Da li želite da blokirate korisnika ${userName}?`,
      [
        {
          text: "Otkaži",
          style: "cancel",
        },
        {
          text: "Blokiraj",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Implement block user functionality
              console.log("Blocking user:", otherUserId);
              router.replace("/(home)/(tabs)/inbox");
            } catch (error) {
              console.error("Error blocking user:", error);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalji</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Header */}
        <View style={styles.userHeader}>
          <Image
            source={{
              uri: avatarUrl || "https://i.pravatar.cc/150?img=1",
            }}
            style={styles.largeAvatar}
          />
          <Text style={styles.userName}>{userName || "Unknown"}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleViewProfile}
          >
            <FontAwesome name="user" size={20} color={colors.text} />
            <Text style={styles.actionText}>Pogledaj profil</Text>
            <FontAwesome name="chevron-right" size={16} color="#5E5E5E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <FontAwesome name="search" size={20} color={colors.text} />
            <Text style={styles.actionText}>Pretraži u razgovoru</Text>
            <FontAwesome name="chevron-right" size={16} color="#5E5E5E" />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.actionItem}>
            <FontAwesome name="bell" size={20} color={colors.text} />
            <Text style={styles.actionText}>Notifikacije</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.dangerItem}
            onPress={handleDeleteChat}
          >
            <FontAwesome name="trash" size={20} color="#FF3B30" />
            <Text style={styles.dangerText}>Izbriši razgovor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerItem} onPress={handleBlockUser}>
            <FontAwesome name="ban" size={20} color="#FF3B30" />
            <Text style={styles.dangerText}>Blokiraj korisnika</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
    },
    placeholder: {
      width: 28,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    userHeader: {
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    largeAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
    },
    userName: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "600",
    },
    section: {
      marginTop: 20,
      paddingHorizontal: 20,
    },
    actionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
    },
    actionText: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      marginLeft: 16,
    },
    dangerItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
    },
    dangerText: {
      color: "#FF3B30",
      fontSize: 16,
      marginLeft: 16,
      fontWeight: "600",
    },
  });
