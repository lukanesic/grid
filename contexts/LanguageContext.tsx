import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useState,
} from "react";
import { initReactI18next } from "react-i18next";

// Import translations
import bs from "@/locales/bs.json";
import en from "@/locales/en.json";
import hr from "@/locales/hr.json";
import mk from "@/locales/mk.json";
import sl from "@/locales/sl.json";
import sr from "@/locales/sr.json";

// Initialize i18next
i18n.use(initReactI18next).init({
  resources: {
    sr: { translation: sr },
    en: { translation: en },
    hr: { translation: hr },
    bs: { translation: bs },
    mk: { translation: mk },
    sl: { translation: sl },
  },
  lng: "sr", // Default language
  fallbackLng: "sr",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4", // For React Native
});

interface LanguageContextValue {
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "@grid_language";

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState(i18n.language);

  // Load saved language preference on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedLanguage) {
          await i18n.changeLanguage(savedLanguage);
          setLanguage(savedLanguage);
        } else {
          // Try to detect device language
          const locales = Localization.getLocales();
          const deviceLanguage = locales[0]?.languageCode || "sr";
          const supportedLanguages = ["sr", "en", "hr", "bs", "mk", "sl"];

          if (supportedLanguages.includes(deviceLanguage)) {
            await i18n.changeLanguage(deviceLanguage);
            setLanguage(deviceLanguage);
            await AsyncStorage.setItem(STORAGE_KEY, deviceLanguage);
          }
        }
      } catch (error) {
        console.error("[LanguageContext] Error loading language:", error);
      }
    };

    loadLanguage();
  }, []);

  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      await AsyncStorage.setItem(STORAGE_KEY, lang);
      console.log("[LanguageContext] Language changed to:", lang);
    } catch (error) {
      console.error("[LanguageContext] Error changing language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export { i18n };
