import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type CachedProfile = {
  profile: AdminProfile;
  timestamp: number;
  userId: string;
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

// Cache TTL: 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_KEY = "marzouqi_admin_profile_cache";

// Reduced timeout from 8s to 3s for faster perceived performance
const AUTH_TIMEOUT_MS = 3000;
const PROFILE_TIMEOUT_MS = 3000;

/** Races a promise against a timeout — returns fallback if it takes too long */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  const timer = new Promise<T>((resolve) =>
    setTimeout(() => resolve(fallback), ms),
  );
  return Promise.race([promise, timer]);
}

/** Load cached profile from localStorage */
function getCachedProfile(userId: string): AdminProfile | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedProfile = JSON.parse(cached);
    const now = Date.now();

    // Validate cache: check TTL and user ID match
    if (
      parsed.userId === userId &&
      parsed.timestamp &&
      now - parsed.timestamp < CACHE_TTL_MS
    ) {
      return parsed.profile;
    }

    // Cache expired or invalid user
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    // Invalid cache data
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

/** Save profile to localStorage cache */
function setCachedProfile(userId: string, profile: AdminProfile): void {
  try {
    const cached: CachedProfile = {
      profile,
      timestamp: Date.now(),
      userId,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

/** Clear profile cache */
function clearCachedProfile(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Silently fail
  }
}

type ProfileResult = {
  data: AdminProfile | null;
  error: { message: string } | null;
};

async function fetchProfile(userId: string): Promise<ProfileResult> {
  const profilePromise = Promise.resolve(
    supabase
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", userId)
      .maybeSingle<AdminProfile>(),
  ).then((res) => ({
    data: res.data as AdminProfile | null,
    error: res.error,
  }));

  const result = await withTimeout<ProfileResult>(
    profilePromise,
    PROFILE_TIMEOUT_MS,
    { data: null, error: { message: "Profile fetch timed out" } },
  );

  return result;
}

async function resolveCurrentState(useCache = false): Promise<AdminAuthState> {
  ensureSupabaseConfigured();

  // getSession() reads from local storage — no network round-trip needed for initial check
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    return { ...NOT_LOGGED_IN, error: sessionError.message };
  }

  const user = session?.user ?? null;

  // Early return if no session — skip profile fetch entirely
  if (!user) {
    return NOT_LOGGED_IN;
  }

  // Try to get cached profile first for instant display
  if (useCache) {
    const cachedProfile = getCachedProfile(user.id);
    if (cachedProfile) {
      return {
        isLoading: false,
        user,
        profile: cachedProfile,
        isAdmin: cachedProfile.role === "admin",
        error: null,
      };
    }
  }

  // Fetch fresh profile data
  const profileResult = await fetchProfile(user.id);

  if (profileResult.error) {
    // Can't read profile — treat as not admin but don't block forever
    return {
      isLoading: false,
      user,
      profile: null,
      isAdmin: false,
      error: null,
    };
  }

  const profile = profileResult.data;

  // Cache the profile for future visits
  if (profile) {
    setCachedProfile(user.id, profile);
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
  const isRefreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    setState((previous) => ({ ...previous, isLoading: true }));
    try {
      const next = await withTimeout(
        resolveCurrentState(false),
        AUTH_TIMEOUT_MS,
        NOT_LOGGED_IN,
      );
      setState(next);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to resolve auth state.";
      setState({ ...NOT_LOGGED_IN, error: message });
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initial load: show cached data immediately, then refresh in background
    const initAuth = async () => {
      // First, try to show cached data instantly
      const session = await supabase.auth.getSession();
      const user = session.data.session?.user ?? null;

      if (user) {
        const cachedProfile = getCachedProfile(user.id);
        if (cachedProfile && mounted) {
          setState({
            isLoading: false,
            user,
            profile: cachedProfile,
            isAdmin: cachedProfile.role === "admin",
            error: null,
          });
        }
      }

      // Then fetch fresh data in the background
      try {
        const next = await withTimeout(
          resolveCurrentState(false),
          AUTH_TIMEOUT_MS,
          NOT_LOGGED_IN,
        );
        if (mounted) setState(next);
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof Error
            ? error.message
            : "Failed to resolve auth state.";
        setState({ ...NOT_LOGGED_IN, error: message });
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (!mounted) return;

      // Clear cache on sign out
      if (event === "SIGNED_OUT") {
        clearCachedProfile();
        setState(NOT_LOGGED_IN);
        return;
      }

      // Refresh auth state on auth changes
      try {
        const next = await withTimeout(
          resolveCurrentState(false),
          AUTH_TIMEOUT_MS,
          NOT_LOGGED_IN,
        );
        if (mounted) setState(next);
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof Error
            ? error.message
            : "Failed to resolve auth state.";
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
    clearCachedProfile();
    setState(NOT_LOGGED_IN);
  }, []);

  // Better memoization - only recreate when actual state values change
  return useMemo(
    () => ({
      isLoading: state.isLoading,
      user: state.user,
      profile: state.profile,
      isAdmin: state.isAdmin,
      error: state.error,
      refresh,
      signOut,
    }),
    [
      state.isLoading,
      state.user,
      state.profile,
      state.isAdmin,
      state.error,
      refresh,
      signOut,
    ],
  );
}
