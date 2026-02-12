import { Redirect } from "expo-router";

const isLoggedIn = false;

export default function Index() {
  // Replace with real auth state when available.
  return <Redirect href={isLoggedIn ? "/(home)" : "/(auth)/welcome"} />;
}
