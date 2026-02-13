import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SUGGESTED_USERS } from "../../constants/data";
import { useChats } from "../../contexts/ChatContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function GroupInfoScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const { chatId } = useLocalSearchParams();
  const { chats } = useChats();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Find the current group chat from ChatContext
  const groupChat = chats.find(
    (chat) => chat.id === parseInt(chatId as string),
  );

  const memberIds = groupChat?.members || [];
  const groupMembers = SUGGESTED_USERS.filter((user) =>
    memberIds.includes(user.id),
  );

  const avatarUrls = groupChat?.groupAvatars || [];

  const handleAddMembers = () => {
    router.push({
      pathname: "/(home)/addMembers",
      params: {
        chatId: chatId || "",
        groupName: groupChat?.name || "",
        currentMembers: memberIds.join(",") || "",
      },
    });
  };

  const handleMemberPress = (memberId: number) => {
    // TODO: Navigate to member profile
    console.log("Member:", memberId);
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
        <Text style={styles.headerTitle}>Detalji grupe</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Group Header */}
        <View style={styles.groupHeader}>
          {avatarUrls.length >= 2 ? (
            <View style={styles.largeGroupAvatarContainer}>
              <Image
                source={{ uri: avatarUrls[0] }}
                style={styles.largeGroupAvatar1}
              />
              <Image
                source={{ uri: avatarUrls[1] }}
                style={styles.largeGroupAvatar2}
              />
            </View>
          ) : (
            <Image
              source={{
                uri: avatarUrls[0] || "https://i.pravatar.cc/150?img=1",
              }}
              style={styles.largeAvatar}
            />
          )}
          <Text style={styles.groupName}>{groupChat?.name}</Text>
          <Text style={styles.memberCount}>
            {groupMembers.length}{" "}
            {groupMembers.length === 1 ? "član" : "članova"}
          </Text>
        </View>

        {/* Add Members Button */}
        <TouchableOpacity
          style={styles.addMembersButton}
          onPress={handleAddMembers}
        >
          <View style={styles.addIconContainer}>
            <FontAwesome name="plus" size={20} color={colors.textSecondary} />
          </View>
          <View style={styles.addTextContainer}>
            <Text style={styles.addMembersTitle}>Dodaj članove</Text>
            <Text style={styles.addMembersSubtitle}>
              Dodajte nove učesnike u grupu
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#5E5E5E" />
        </TouchableOpacity>

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ČLANOVI ({groupMembers.length})
          </Text>

          {groupMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.memberItem}
              onPress={() => handleMemberPress(member.id)}
            >
              <Image
                source={{ uri: member.avatar }}
                style={styles.memberAvatar}
              />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberSubtitle}>{member.subtitle}</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#5E5E5E" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Group Actions */}
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
          <TouchableOpacity style={styles.dangerItem}>
            <FontAwesome name="sign-out" size={20} color="#FF3B30" />
            <Text style={styles.dangerText}>Napusti grupu</Text>
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
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
    groupHeader: {
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    largeGroupAvatarContainer: {
      width: 100,
      height: 100,
      position: "relative",
      marginBottom: 16,
    },
    largeGroupAvatar1: {
      width: 65,
      height: 65,
      borderRadius: 32.5,
      position: "absolute",
      top: 0,
      left: 0,
      borderWidth: 3,
      borderColor: colors.background,
    },
    largeGroupAvatar2: {
      width: 65,
      height: 65,
      borderRadius: 32.5,
      position: "absolute",
      bottom: 0,
      right: 0,
      borderWidth: 3,
      borderColor: colors.background,
    },
    largeAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 16,
    },
    groupName: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 4,
    },
    memberCount: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    addMembersButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    addIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    addTextContainer: {
      flex: 1,
    },
    addMembersTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    addMembersSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    section: {
      marginTop: 20,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
      textTransform: "uppercase",
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    memberItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    memberAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 2,
    },
    memberSubtitle: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    actionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
