import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface Player {
  name: string;
  avatar?: string;
  level?: string;
}

interface VersusMatchCardProps {
  id: string;
  type: string;
  time: string;
  date: string;
  club: string;
  matchType: "1v1" | "2v2" | "1v2" | "2v1";
  teamA: Player[];
  teamB: Player[];
  score?: string;
  onPress?: () => void;
}

export default function VersusMatchCard({
  id,
  type,
  time,
  date,
  club,
  matchType,
  teamA,
  teamB,
  score,
  onPress,
}: VersusMatchCardProps) {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  // Get player initials for fallback avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format name to "FirstName L."
  const formatPlayerName = (name: string) => {
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0];
    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${firstName} ${lastInitial}.`;
  };

  // Render player avatar
  const renderPlayer = (player: Player, index: number) => (
    <View key={index} style={styles.playerContainer}>
      <View style={styles.playerAvatar}>
        {player.avatar ? (
          <Image source={{ uri: player.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Text style={styles.initials}>{getInitials(player.name)}</Text>
          </View>
        )}
        {player.level && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{player.level}</Text>
          </View>
        )}
      </View>
      <Text style={styles.playerName} numberOfLines={1}>
        {formatPlayerName(player.name)}
      </Text>
    </View>
  );

  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={["#B8FF00", "#4A7CFF", "#1B47FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Main Content */}
        <View style={styles.content}>
          {/* Team A */}
          <View style={styles.team}>
            <View style={styles.teamPlayers}>
              {teamA.map((player, index) => renderPlayer(player, index))}
            </View>
          </View>

          {/* Center Time */}
          <View style={styles.centerTime}>
            <Text style={styles.timeText}>{time}</Text>
            <Text style={styles.matchTypeText}>
              {teamA.length} vs {teamB.length}
            </Text>
          </View>

          {/* Team B */}
          <View style={styles.team}>
            <View style={styles.teamPlayers}>
              {teamB.map((player, index) => renderPlayer(player, index))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/logo/home-icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.footerInfo}>
              {score ? (
                <>
                  <Text style={styles.scoreText}>{score}</Text>
                  <Text style={styles.clubText}>{club}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.dateText}>{date}</Text>
                  <Text style={styles.clubText}>{club}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const getStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      width: 320,
      borderRadius: 20,
      marginRight: 16,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    matchType: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    vsText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 24,
      minHeight: 180,
    },
    team: {
      flex: 1,
    },
    teamPlayers: {
      alignItems: "center",
      gap: 8,
      minHeight: 140,
      justifyContent: "center",
    },
    playerContainer: {
      alignItems: "center",
      minWidth: 50,
    },
    playerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: "#FFFFFF",
      position: "relative",
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 18,
    },
    defaultAvatar: {
      width: "100%",
      height: "100%",
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    initials: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },
    levelBadge: {
      position: "absolute",
      bottom: -4,
      left: "50%",
      marginLeft: -10,
      backgroundColor: "#B8FF00",
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 6,
    },
    levelText: {
      color: "#111111",
      fontSize: 9,
      fontWeight: "700",
    },
    playerName: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "500",
      textAlign: "center",
      marginTop: 6,
    },
    centerTime: {
      alignItems: "center",
      paddingHorizontal: 20,
    },
    timeText: {
      color: "#FFFFFF",
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 4,
    },
    matchTypeText: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 12,
      fontWeight: "600",
    },
    footer: {
      backgroundColor: "rgba(0,0,0,0.1)",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    footerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    logoContainer: {
      width: 28,
      height: 28,
      justifyContent: "center",
      alignItems: "center",
    },
    logo: {
      width: 24,
      height: 24,
    },
    footerInfo: {
      flex: 1,
    },
    dateText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 2,
    },
    scoreText: {
      color: "#B8FF00",
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 2,
    },
    clubText: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 11,
    },
  });
