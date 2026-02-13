import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatItem } from "../../../components";
import { useChats } from "../../../contexts/ChatContext";
import { useTheme } from "../../../contexts/ThemeContext";

export default function InboxScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { chats } = useChats();
  const { colors } = useTheme();

  const styles = getStyles(colors);

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity onPress={() => router.push("/(home)/newChat")}>
          <FontAwesome name="edit" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome
          name="search"
          size={16}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Pretraži"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <FontAwesome
              name="times-circle"
              size={16}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              name={chat.name}
              message={chat.message}
              time={chat.time}
              avatar={chat.avatar}
              unreadCount={chat.unreadCount}
              isOnline={chat.isOnline}
              isRead={chat.isRead}
              isGroup={chat.isGroup}
              groupAvatars={chat.groupAvatars}
              onPress={() =>
                router.push({
                  pathname: "/(home)/chat",
                  params: {
                    id: chat.id,
                    name: chat.name,
                    avatar: chat.avatar,
                    isOnline: chat.isOnline.toString(),
                    isGroup: chat.isGroup?.toString() || "false",
                    groupAvatars: chat.groupAvatars?.join(",") || "",
                    members: chat.members?.join(",") || "",
                  },
                })
              }
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nema rezultata</Text>
            <Text style={styles.emptySubtext}>Pokušajte sa drugim pojmom</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "700",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      marginHorizontal: 20,
      marginBottom: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 4,
    },
    clearButton: {
      padding: 4,
    },
    content: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
    },
    emptySubtext: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 8,
    },
  });
