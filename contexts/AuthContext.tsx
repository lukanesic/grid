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
  updateFollowingCount: (delta: number) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load profile from database
  const loadProfile = async (userId: string) => {
    try {
      console.log("[AuthContext] Starting loadProfile for userId:", userId);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error(
          "[AuthContext] Error loading profile:",
          error.message,
          error.code,
        );

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
    } catch (error) {
      console.error("[AuthContext] Unexpected error in loadProfile:", error);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log("[AuthContext] useEffect starting, mounted:", mounted);

    const loadInitialSession = async () => {
      try {
        console.log("[AuthContext] Loading initial session...");
        const { data, error } = await supabase.auth.getSession();
        console.log("[AuthContext] getSession completed:", {
          hasSession: !!data.session,
          userId: data.session?.user?.id,
          error,
        });

        if (!mounted) {
          console.log("[AuthContext] Component unmounted, skipping setState");
          return;
        }

        setSession(data.session);
        console.log("[AuthContext] Session state updated");

        if (data.session?.user) {
          console.log("[AuthContext] User exists, loading profile...");
          try {
            await loadProfile(data.session.user.id);
            console.log("[AuthContext] Profile loading completed");
          } catch (error) {
            console.error("[AuthContext] Profile loading failed:", error);
            setProfile(null);
          }
        } else {
          console.log("[AuthContext] No user, skipping profile load");
        }
      } catch (error) {
        console.error("[AuthContext] Error loading initial session:", error);
      } finally {
        if (mounted) {
          console.log("[AuthContext] Setting isLoading to false");
          setIsLoading(false);
        } else {
          console.log(
            "[AuthContext] Component unmounted, skipping isLoading update",
          );
        }
      }
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

      if (!mounted) return;

      setSession(nextSession);

      if (nextSession?.user) {
        try {
          await loadProfile(nextSession.user.id);
        } catch (error) {
          console.error(
            "[AuthContext] Profile loading failed in auth state change:",
            error,
          );
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      console.log("[AuthContext] useEffect cleanup");
      mounted = false;
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
          try {
            await loadProfile(session.user.id);
          } catch (error) {
            console.error("[AuthContext] Profile refresh failed:", error);
          }
        }
      },
      updateFollowingCount: (delta: number) => {
        if (profile) {
          setProfile({
            ...profile,
            following_count: (profile.following_count || 0) + delta,
          });
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
