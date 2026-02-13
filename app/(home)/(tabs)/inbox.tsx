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

export default function InboxScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { chats } = useChats();

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity onPress={() => router.push("/(home)/newChat")}>
          <FontAwesome name="edit" size={24} color="#F2F2F2" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome
          name="search"
          size={16}
          color="#8B8B8B"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Pretraži"
          placeholderTextColor="#5E5E5E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <FontAwesome name="times-circle" size={16} color="#8B8B8B" />
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
            <FontAwesome name="search" size={48} color="#5E5E5E" />
            <Text style={styles.emptyText}>Nema rezultata</Text>
            <Text style={styles.emptySubtext}>Pokušajte sa drugim pojmom</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: "#F2F2F2",
    fontSize: 28,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
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
    color: "#F2F2F2",
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
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#8B8B8B",
    fontSize: 14,
    marginTop: 8,
  },
});
