import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Redirect, Stack } from "expo-router";

export default function HomeLayout() {
  const { user, profile } = useAuth();
  const { colors } = useTheme();

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Check if profile is not completed - redirect to createProfile
  if (!profile || !profile.profile_completed) {
    return <Redirect href="/createProfile" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="newChat"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="reservationSummary"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
