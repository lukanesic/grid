import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    CHAT_MESSAGES,
    OLDER_CHAT_MESSAGES,
    SUGGESTED_USERS,
} from "../../constants/data";
import { useChats } from "../../contexts/ChatContext";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  status?: "sent" | "delivered" | "read";
}

export default function ChatScreen() {
  const router = useRouter();
  const { id, name, avatar, isOnline, isGroup, groupAvatars, members } =
    useLocalSearchParams();
  const { chats } = useChats();
  const [inputText, setInputText] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messages, setMessages] = useState<Message[]>(CHAT_MESSAGES);

  const flatListRef = useRef<FlatList>(null);

  // Get current chat from context to get live member count
  const currentChat = chats.find((chat) => chat.id === parseInt(id as string));
  const memberIds = currentChat?.members || [];
  const actualMembers = SUGGESTED_USERS.filter((user) =>
    memberIds.includes(user.id),
  );
  const memberCount = actualMembers.length;

  const handleGroupInfoPress = () => {
    if (isGroup === "true") {
      router.push({
        pathname: "/(home)/groupInfo",
        params: {
          chatId: id || "",
          name: name || "",
          groupAvatars: groupAvatars || "",
          members: members || "",
        },
      });
    }
  };

  const loadMoreMessages = () => {
    if (isLoadingMore || !hasMoreMessages) return;

    setIsLoadingMore(true);

    // Simulate loading older messages
    setTimeout(() => {
      setMessages([...OLDER_CHAT_MESSAGES, ...messages]);
      setIsLoadingMore(false);

      // After 2 loads, no more messages
      if (messages.length > 30) {
        setHasMoreMessages(false);
      }
    }, 1000);
  };

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString("sr-RS", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMine: true,
      status: "sent",
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.isMine
            ? styles.myMessageContainer
            : styles.theirMessageContainer,
        ]}
      >
        {!item.isMine && (
          <Image
            source={{ uri: avatar as string }}
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            item.isMine ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.isMine ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.timestamp,
                item.isMine ? styles.myTimestamp : styles.theirTimestamp,
              ]}
            >
              {item.timestamp}
            </Text>
            {item.isMine && item.status && (
              <View style={styles.statusIcon}>
                {item.status === "sent" && (
                  <FontAwesome name="check" size={12} color="#8B8B8B" />
                )}
                {item.status === "delivered" && (
                  <View style={styles.doubleCheck}>
                    <FontAwesome
                      name="check"
                      size={12}
                      color="#8B8B8B"
                      style={styles.checkIcon}
                    />
                    <FontAwesome
                      name="check"
                      size={12}
                      color="#8B8B8B"
                      style={styles.checkIcon2}
                    />
                  </View>
                )}
                {item.status === "read" && (
                  <View style={styles.doubleCheck}>
                    <FontAwesome
                      name="check"
                      size={12}
                      color="#B8FF00"
                      style={styles.checkIcon}
                    />
                    <FontAwesome
                      name="check"
                      size={12}
                      color="#B8FF00"
                      style={styles.checkIcon2}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerCenter}
            onPress={handleGroupInfoPress}
            disabled={isGroup !== "true"}
          >
            <View style={styles.avatarContainer}>
              {isGroup === "true" &&
              groupAvatars &&
              (groupAvatars as string).split(",").length >= 2 ? (
                <View style={styles.groupAvatarContainer}>
                  <Image
                    source={{ uri: (groupAvatars as string).split(",")[0] }}
                    style={styles.groupAvatar1}
                  />
                  <Image
                    source={{ uri: (groupAvatars as string).split(",")[1] }}
                    style={styles.groupAvatar2}
                  />
                </View>
              ) : (
                <>
                  <Image
                    source={{ uri: avatar as string }}
                    style={styles.headerAvatar}
                  />
                  {isOnline === "true" && (
                    <View style={styles.onlineIndicator} />
                  )}
                </>
              )}
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName}>{name}</Text>
              <Text style={styles.headerStatus}>
                {isGroup === "true" && memberCount > 0
                  ? `${memberCount} ${memberCount === 1 ? "član" : "članova"}`
                  : isOnline === "true"
                    ? "Online"
                    : "Offline"}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <FontAwesome name="ellipsis-v" size={20} color="#F2F2F2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          inverted
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Učitavanje...</Text>
              </View>
            ) : null
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <FontAwesome name="plus-circle" size={24} color="#8B8B8B" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Napišite poruku..."
              placeholderTextColor="#5E5E5E"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <FontAwesome name="smile-o" size={20} color="#8B8B8B" />
            </TouchableOpacity>
          </View>

          <Pressable
            onPress={handleSend}
            style={[
              styles.sendButton,
              inputText.trim() === "" && styles.sendButtonDisabled,
            ]}
            disabled={inputText.trim() === ""}
          >
            <FontAwesome
              name="send"
              size={18}
              color={inputText.trim() === "" ? "#5E5E5E" : "#0B0B0B"}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  groupAvatarContainer: {
    width: 40,
    height: 40,
    position: "relative",
  },
  groupAvatar1: {
    width: 26,
    height: 26,
    borderRadius: 13,
    position: "absolute",
    top: 0,
    left: 0,
    borderWidth: 2,
    borderColor: "#0B0B0B",
  },
  groupAvatar2: {
    width: 26,
    height: 26,
    borderRadius: 13,
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#0B0B0B",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#B8FF00",
    borderWidth: 2,
    borderColor: "#0B0B0B",
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
  },
  headerStatus: {
    color: "#8B8B8B",
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "80%",
  },
  myMessageContainer: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  theirMessageContainer: {
    alignSelf: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "100%",
  },
  myMessageBubble: {
    backgroundColor: "#B8FF00",
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: "#1A1A1A",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#0B0B0B",
  },
  theirMessageText: {
    color: "#F2F2F2",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  myTimestamp: {
    color: "#0B0B0B",
    opacity: 0.6,
  },
  theirTimestamp: {
    color: "#8B8B8B",
  },
  statusIcon: {
    marginLeft: 2,
  },
  doubleCheck: {
    flexDirection: "row",
    position: "relative",
  },
  checkIcon: {
    position: "relative",
  },
  checkIcon2: {
    position: "absolute",
    left: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
    backgroundColor: "#0B0B0B",
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    color: "#F2F2F2",
    fontSize: 15,
    paddingVertical: 4,
    maxHeight: 84,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#B8FF00",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#1A1A1A",
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadingText: {
    color: "#8B8B8B",
    fontSize: 14,
  },
});
