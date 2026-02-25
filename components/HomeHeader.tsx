import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../lib/supabase";
import Badge from "./Badge";
import IconButton from "./IconButton";

interface HomeHeaderProps {
  styles: any;
}

export default function HomeHeader({ styles }: HomeHeaderProps) {
  const router = useRouter();
  const { colors, fonts } = useTheme();
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const firstName = profile?.full_name?.split(" ")[0] || "Tamo";
  const userLocation = profile?.location || "Srbija";

  useEffect(() => {
    if (!profile?.id) return;

    loadUnreadCount();

    const channel = supabase
      .channel("home-header-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          console.log("🔔 New notification received!");
          loadUnreadCount();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          console.log("✅ Notification marked as read!");
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
      const { data, error } = await supabase.rpc(
        "get_unread_notifications_count",
      );
      if (error) throw error;
      setUnreadCount(data || 0);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../assets/logo/home-icon.png")}
          style={styles.logoImage}
        />
        <View style={styles.headerActions}>
          <View>
            <IconButton
              icon="bell"
              onPress={() => router.push("/(home)/notification")}
              color={colors.text}
              backgroundColor="transparent"
            />
            {unreadCount > 0 && <Badge count={unreadCount} />}
          </View>
          <IconButton
            icon="bars"
            onPress={() => router.push("/(home)/menu")}
            color={colors.text}
            backgroundColor="transparent"
          />
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingText}>Dobro jutro, {firstName}!</Text>
        <Text style={styles.weatherText}>24°C • Oblačno • {userLocation}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.pushButton, { backgroundColor: "#1E1F23" }]}
          onPress={() => router.push("/(home)/openMatches")}
        >
          <FontAwesome name="users" size={16} color={colors.accent} />
          <Text style={styles.pushButtonText}>Pridruži se meču</Text>
        </Pressable>
        <Pressable
          style={styles.createButton}
          onPress={() => router.push("/(home)/createMatchNew")}
        >
          <FontAwesome name="plus" size={20} color="#111111" />
          <Text style={styles.createButtonText}>Kreiraj mec</Text>
        </Pressable>
      </View>

      {/* Connect Card */}
      <Pressable
        style={styles.connectCard}
        onPress={() => router.push("/(home)/connectFriends")}
      >
        <View style={styles.avatarGroup}>
          <View style={[styles.avatar, { marginLeft: 0 }]}>
            <FontAwesome name="user" size={16} color="#3867FF" />
          </View>
          <View style={[styles.avatar, { marginLeft: -12 }]}>
            <FontAwesome name="user" size={16} color="#3867FF" />
          </View>
          <View style={[styles.avatar, { marginLeft: -12 }]}>
            <FontAwesome name="user" size={16} color="#3867FF" />
          </View>
        </View>
        <View style={styles.connectText}>
          <Text style={styles.connectHeading}>Poveži se</Text>
          <Text style={styles.connectSubheading}>Brzo i lako</Text>
        </View>
        <FontAwesome name="chevron-right" size={18} color="#8B8B8B" />
      </Pressable>
    </>
  );
}
