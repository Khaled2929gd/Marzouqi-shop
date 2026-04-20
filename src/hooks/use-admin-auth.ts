import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ensureSupabaseConfigured, supabase } from "@/lib/supabase";

type ProfileRole = "customer" | "admin";

type AdminProfile = {
  role: ProfileRole;
  email: string;
  full_name: string | null;
};

type AdminAuthState = {
  isLoading: boolean;
  user: User | null;
  profile: AdminProfile | null;
  isAdmin: boolean;
  error: string | null;
};

const INITIAL_STATE: AdminAuthState = {
  isLoading: true,
  user: null,
  profile: null,
  isAdmin: false,
  error: null,
};

async function resolveCurrentState(): Promise<AdminAuthState> {
  ensureSupabaseConfigured();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return {
      ...INITIAL_STATE,
      isLoading: false,
      error: userError.message,
    };
  }

  if (!user) {
    return {
      isLoading: false,
      user: null,
      profile: null,
      isAdmin: false,
      error: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, email, full_name")
    .eq("id", user.id)
    .maybeSingle<AdminProfile>();

  if (profileError) {
    return {
      isLoading: false,
      user,
      profile: null,
      isAdmin: false,
      error: profileError.message,
    };
  }

  return {
    isLoading: false,
    user,
    profile: profile ?? null,
    isAdmin: profile?.role === "admin",
    error: null,
  };
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>(INITIAL_STATE);

  const refresh = useCallback(async () => {
    setState((previous) => ({ ...previous, isLoading: true }));

    try {
      const next = await resolveCurrentState();
      setState(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resolve auth state.";
      setState({
        isLoading: false,
        user: null,
        profile: null,
        isAdmin: false,
        error: message,
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const next = await resolveCurrentState();
        if (mounted) {
          setState(next);
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to resolve auth state.";
        setState({
          isLoading: false,
          user: null,
          profile: null,
          isAdmin: false,
          error: message,
        });
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      if (!mounted) {
        return;
      }

      try {
        const next = await resolveCurrentState();
        if (mounted) {
          setState(next);
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to resolve auth state.";
        setState({
          isLoading: false,
          user: null,
          profile: null,
          isAdmin: false,
          error: message,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Failed to sign out: ${error.message}`);
    }

    setState({
      isLoading: false,
      user: null,
      profile: null,
      isAdmin: false,
      error: null,
    });
  }, []);

  return useMemo(
    () => ({
      ...state,
      refresh,
      signOut,
    }),
    [refresh, signOut, state],
  );
}
