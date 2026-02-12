import { FontAwesome } from "@expo/vector-icons";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ChatItem } from "../../../components";
import { CHATS } from "../../../constants/data";

export default function InboxScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity>
          <FontAwesome name="search" size={24} color="#F2F2F2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {CHATS.map((chat) => (
          <ChatItem
            key={chat.id}
            name={chat.name}
            message={chat.message}
            time={chat.time}
            avatar={chat.avatar}
            unreadCount={chat.unreadCount}
            isOnline={chat.isOnline}
            isRead={chat.isRead}
          />
        ))}
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
  content: {
    flex: 1,
  },
});
