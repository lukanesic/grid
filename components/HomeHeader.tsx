import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Badge, IconButton } from "./index";

interface HomeHeaderProps {
  styles: any;
  activeTab: "sve" | "vruce" | "krugovi";
  setActiveTab: (tab: "sve" | "vruce" | "krugovi") => void;
}

export default function HomeHeader({
  styles,
  activeTab,
  setActiveTab,
}: HomeHeaderProps) {
  const router = useRouter();

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
            />
            <Badge count={20} />
          </View>
          <IconButton icon="bars" onPress={() => router.push("/(home)/menu")} />
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingText}>Dobro jutro, Ana!</Text>
        <Text style={styles.weatherText}>24°C • Oblačno • Madrid, Španija</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.pushButton, { backgroundColor: "#1E1F23" }]}
          onPress={() => {}}
        >
          <FontAwesome name="bell" size={16} color="#B8FF00" />
          <Text style={styles.pushButtonText}>Push za mečeve</Text>
        </Pressable>
        <Pressable
          style={styles.createButton}
          onPress={() => router.push("/createMatch")}
        >
          <FontAwesome name="plus" size={20} color="#111111" />
          <Text style={styles.createButtonText}>Kreiraj mec</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "sve" && styles.tabActive]}
          onPress={() => setActiveTab("sve")}
        >
          <Text
            style={activeTab === "sve" ? styles.tabActiveText : styles.tabText}
          >
            Sve
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "vruce" && styles.tabActive]}
          onPress={() => setActiveTab("vruce")}
        >
          <Text
            style={
              activeTab === "vruce" ? styles.tabActiveText : styles.tabText
            }
          >
            Šta je vruće
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "krugovi" && styles.tabActive]}
          onPress={() => setActiveTab("krugovi")}
        >
          <Text
            style={
              activeTab === "krugovi" ? styles.tabActiveText : styles.tabText
            }
          >
            Tvoji krugovi
          </Text>
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
          <Text style={styles.connectHeading}>
            Uveži se sa svojim prijateljima
          </Text>
          <Text style={styles.connectSubheading}>Brzo i lako</Text>
        </View>
        <FontAwesome name="chevron-right" size={18} color="#8B8B8B" />
      </Pressable>
    </>
  );
}
