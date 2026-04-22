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

const NOT_LOGGED_IN: AdminAuthState = {
  isLoading: false,
  user: null,
  profile: null,
  isAdmin: false,
  error: null,
};

/** Races a promise against a timeout — returns fallback if it takes too long */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  const timer = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms));
  return Promise.race([promise, timer]);
}

async function resolveCurrentState(): Promise<AdminAuthState> {
  ensureSupabaseConfigured();

  // getSession() reads from local storage — no network round-trip needed for initial check
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    return { ...NOT_LOGGED_IN, error: sessionError.message };
  }

  const user = session?.user ?? null;

  if (!user) {
    return NOT_LOGGED_IN;
  }

  type ProfileResult = { data: AdminProfile | null; error: { message: string } | null };

  // Promise.resolve() wraps the PromiseLike from PostgrestBuilder into a real Promise
  const profilePromise: Promise<ProfileResult> = Promise.resolve(
    supabase
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", user.id)
      .maybeSingle<AdminProfile>()
  ).then((res) => ({ data: res.data as AdminProfile | null, error: res.error }));

  const profileResult = await withTimeout<ProfileResult>(
    profilePromise,
    5000,
    { data: null, error: { message: "Profile fetch timed out" } }
  );

  if (profileResult.error) {
    // Can't read profile — treat as not admin but don't block forever
    return { isLoading: false, user, profile: null, isAdmin: false, error: null };
  }

  const profile = profileResult.data;
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
      const next = await withTimeout(resolveCurrentState(), 8000, NOT_LOGGED_IN);
      setState(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resolve auth state.";
      setState({ ...NOT_LOGGED_IN, error: message });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Wrap the entire initial resolution in an 8s timeout — guaranteed to unblock
    withTimeout(resolveCurrentState(), 8000, NOT_LOGGED_IN)
      .then((next) => { if (mounted) setState(next); })
      .catch((error) => {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : "Failed to resolve auth state.";
        setState({ ...NOT_LOGGED_IN, error: message });
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      if (!mounted) return;
      try {
        const next = await withTimeout(resolveCurrentState(), 8000, NOT_LOGGED_IN);
        if (mounted) setState(next);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : "Failed to resolve auth state.";
        setState({ ...NOT_LOGGED_IN, error: message });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Failed to sign out: ${error.message}`);
    setState(NOT_LOGGED_IN);
  }, []);

  return useMemo(
    () => ({ ...state, refresh, signOut }),
    [refresh, signOut, state],
  );
}
