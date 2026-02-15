import { supabase } from "@/lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;

    loadUnreadCount();

    // Real-time subscription for message updates
    const channel = supabase
      .channel("inbox-badge")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          console.log("📬 New message received - updating badge!");
          loadUnreadCount();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          console.log("✅ Message read - updating badge!");
          loadUnreadCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const loadUnreadCount = async () => {
    try {
      const { data, error } = await supabase.rpc("get_unread_messages_count");
      if (error) throw error;
      setUnreadMessagesCount(data || 0);
    } catch (error) {
      console.error("Error loading unread messages count:", error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3867FF",
        tabBarInactiveTintColor: "#8B8B8B",
        tabBarStyle: {
          backgroundColor: isDark ? "#0B0B0B" : colors.surface,
          borderTopColor: isDark ? "#1E1F23" : colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="users" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="envelope" size={24} color={color} />
          ),
          tabBarBadge:
            unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#FF4444",
            color: "#FFFFFF",
            fontSize: 10,
            fontWeight: "700",
            minWidth: 18,
            height: 18,
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
