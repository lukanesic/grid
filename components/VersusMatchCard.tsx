import { FontAwesome } from "@expo/vector-icons";
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
  duration?: string;
  isFinished?: boolean;
  gameMode?: "competitive" | "friendly" | "training";
  startTime?: string;
  endTime?: string;
  onPress?: () => void;
  fullWidth?: boolean;
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
  duration,
  isFinished,
  gameMode,
  startTime,
  endTime,
  onPress,
  fullWidth = false,
}: VersusMatchCardProps) {
  const { colors, isDark, fonts } = useTheme();
  const styles = getStyles(colors, isDark, fonts, fullWidth);

  // Get game mode label and color
  const getGameModeInfo = () => {
    if (gameMode === "competitive") {
      return { label: "Kompetativan", icon: "trophy", color: "#F59E0B" };
    } else if (gameMode === "training") {
      return { label: "Trening", icon: "line-chart", color: "#3B82F6" };
    }
    return { label: "Prijateljski", icon: "smile-o", color: "#10B981" };
  };

  const gameModeInfo = getGameModeInfo();

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
        colors={
          isFinished
            ? ["#2F52D5", "#05003F"]
            : ["#B8FF00", "#4A7CFF", "#1B47FF"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header with Game Mode and Time Range/Duration */}
        <View style={styles.header}>
          <View style={styles.gameModeSection}>
            <FontAwesome
              name={gameModeInfo.icon as any}
              size={12}
              color="#FFFFFF"
            />
            <Text style={styles.gameModeText}>{gameModeInfo.label}</Text>
          </View>
          {duration ? (
            <View style={styles.timeRangeSection}>
              <FontAwesome name="hourglass-end" size={12} color="#FFFFFF" />
              <Text style={styles.timeRangeText}>{duration}</Text>
            </View>
          ) : startTime && endTime ? (
            <View style={styles.timeRangeSection}>
              <FontAwesome name="clock-o" size={12} color="#FFFFFF" />
              <Text style={styles.timeRangeText}>
                {startTime} - {endTime}
              </Text>
            </View>
          ) : null}
        </View>

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
            <View style={styles.footerLeft}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/logo/home-icon.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.footerInfo}>
                <Text style={styles.dateText}>{date}</Text>
                <Text style={styles.clubText}>{club}</Text>
              </View>
            </View>
            {score && (
              <Text style={styles.scoreText} numberOfLines={1}>
                {score}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const getStyles = (
  colors: any,
  isDark: boolean,
  fonts: any,
  fullWidth: boolean = false,
) =>
  StyleSheet.create({
    card: {
      width: fullWidth ? "100%" : 320,
      borderRadius: 20,
      marginRight: fullWidth ? 0 : 16,
      marginBottom: fullWidth ? 16 : 0,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: "rgba(0,0,0,0.15)",
    },
    gameModeSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    gameModeText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: -0.3,
      fontFamily: fonts.semiBold,
    },
    timeRangeSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    timeRangeText: {
      color: "rgba(255,255,255,0.9)",
      fontSize: 11,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    matchType: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
      fontFamily: fonts.bold,
    },
    vsText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
      fontFamily: fonts.bold,
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
      fontFamily: fonts.bold,
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
      fontFamily: fonts.bold,
    },
    playerName: {
      color: "#FFFFFF",
      fontSize: 10,
      fontWeight: "500",
      textAlign: "center",
      marginTop: 6,
      fontFamily: fonts.medium,
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
      fontFamily: fonts.bold,
    },
    matchTypeText: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 12,
      fontWeight: "600",
      fontFamily: fonts.semiBold,
    },
    footer: {
      backgroundColor: "rgba(0,0,0,0.1)",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    footerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    footerLeft: {
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
    footerInfo: {},
    dateText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 2,
      fontFamily: fonts.semiBold,
    },
    scoreText: {
      color: "#B8FF00",
      fontSize: 13,
      fontWeight: "700",
      fontFamily: fonts.bold,
    },
    clubText: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 11,
      fontFamily: fonts.regular,
    },
  });
