import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { ChatProvider } from "../contexts/ChatContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <ChatProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(home)" />
        <Stack.Screen name="createProfile" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ChatProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
