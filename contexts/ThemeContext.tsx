import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  blue: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
  cardBackground: string;
  inputBackground: string;
  onlineIndicator: string;
  refreshIndicator: string;
}

const lightTheme: ThemeColors = {
  background: "#FFFFFF",
  surface: "#F1F3F5",
  primary: "#1A1A1A",
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  accent: "#B8FF00",
  blue: "#007AFF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  overlay: "rgba(0, 0, 0, 0.5)",
  cardBackground: "#FFFFFF",
  inputBackground: "#F3F4F6",
  onlineIndicator: "#10B981",
  refreshIndicator: "#007AFF",
};

const darkTheme: ThemeColors = {
  background: "#0B0B0B",
  surface: "#1A1A1A",
  primary: "#F2F2F2",
  text: "#F2F2F2",
  textSecondary: "#8B8B8B",
  border: "#2C2C2C",
  accent: "#B8FF00",
  blue: "#007AFF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#FF3B30",
  overlay: "rgba(0, 0, 0, 0.7)",
  cardBackground: "#121418",
  inputBackground: "#2C2C2C",
  onlineIndicator: "#B8FF00",
  refreshIndicator: "#FFFFFF",
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  fonts: {
    regular: string;
    medium: string;
    semiBold: string;
    bold: string;
  };
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@app_theme_preference";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("dark"); // Default to dark
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const colors = theme === "dark" ? darkTheme : lightTheme;
  const isDark = theme === "dark";

  const fonts = {
    regular: "Roboto_400Regular",
    medium: "Roboto_500Medium",
    semiBold: "Roboto_700Bold",
    bold: "Roboto_700Bold",
  };

  return (
    <ThemeContext.Provider
      value={{ theme, colors, fonts, toggleTheme, isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
