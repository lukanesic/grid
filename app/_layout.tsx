import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ChatProvider } from "../contexts/ChatContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (cacheTime renamed to gcTime)
      retry: 1,
    },
  },
});

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style={isDark ? "light" : "dark"} />
    </AuthProvider>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

  // Simple guard: authenticated users go to (home), non-authenticated go to (auth)
  // Profile completion check happens inside (home)/_layout.tsx
  if (!user) {
    return (
      <ChatProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
            contentStyle: { backgroundColor: "#0B0B0B" },
          }}
        >
          <Stack.Screen name="(auth)" />
        </Stack>
      </ChatProvider>
    );
  }

  // User is authenticated, let (home)/_layout handle profile completion
  return (
    <ChatProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: "#0B0B0B" },
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="createProfile" />
      </Stack>
    </ChatProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    alignItems: "center",
    justifyContent: "center",
  },
});
