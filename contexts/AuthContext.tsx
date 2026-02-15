import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/profile";
import { Session, User } from "@supabase/supabase-js";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load profile from database
  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[AuthContext] Error loading profile:", error);

      // If user doesn't exist in profiles table (deleted from database), clear the session
      if (error.code === "PGRST116") {
        console.log(
          "[AuthContext] User not found in database, clearing session...",
        );
        await supabase.auth.signOut();
      }

      setProfile(null);
      return;
    }

    console.log("[AuthContext] Profile loaded:", {
      userId,
      profileCompleted: data?.profile_completed,
    });
    setProfile(data);
  };

  useEffect(() => {
    const loadInitialSession = async () => {
      console.log("[AuthContext] Loading initial session...");
      const { data, error } = await supabase.auth.getSession();
      console.log("[AuthContext] getSession result:", {
        hasSession: !!data.session,
        userId: data.session?.user?.id,
        error,
      });
      setSession(data.session);

      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }

      setIsLoading(false);
    };

    loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      console.log("[AuthContext] Auth state changed:", {
        event,
        hasSession: !!nextSession,
        userId: nextSession?.user?.id,
      });
      setSession(nextSession);

      if (nextSession?.user) {
        await loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      isLoading,
      refreshProfile: async () => {
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      },
    }),
    [isLoading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
