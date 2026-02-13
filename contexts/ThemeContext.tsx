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
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("dark"); // Default to dark

  useEffect(() => {
    // You can optionally sync with system theme on first load
    // setTheme(systemColorScheme || "dark");
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const colors = theme === "dark" ? darkTheme : lightTheme;
  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
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
