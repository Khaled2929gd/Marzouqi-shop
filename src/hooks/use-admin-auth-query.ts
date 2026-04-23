import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

// Cache TTL: 5 minutes
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_KEY = "marzouqi_admin_profile_cache";

// React Query stale time: 3 minutes (data considered fresh)
const STALE_TIME = 3 * 60 * 1000;

// React Query cache time: 10 minutes (data kept in memory)
const CACHE_TIME = 10 * 60 * 1000;

// Reduced timeout from 8s to 3s
const PROFILE_TIMEOUT_MS = 3000;

/** Load cached profile from localStorage */
function getCachedProfile(userId: string): AdminProfile | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedProfile = JSON.parse(cached);
    const now = Date.now();

    if (
      parsed.userId === userId &&
      parsed.timestamp &&
      now - parsed.timestamp < CACHE_TTL_MS
    ) {
      return parsed.profile;
    }

    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
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

/** Fetch profile with timeout */
async function fetchProfileWithTimeout(
  userId: string,
): Promise<AdminProfile | null> {
  const profilePromise = Promise.resolve(
    supabase
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", userId)
      .maybeSingle<AdminProfile>(),
  );

  const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
    setTimeout(
      () => resolve({ data: null, error: { message: "Timeout" } }),
      PROFILE_TIMEOUT_MS,
    ),
  );

  try {
    const { data, error } = await Promise.race([
      profilePromise,
      timeoutPromise,
    ]);

    if (error) {
      console.warn("Profile fetch error:", error);
      return null;
    }

    // Cache the profile for instant loading next time
    if (data) {
      setCachedProfile(userId, data);
    }

    return data;
  } catch (error) {
    console.warn("Profile fetch error:", error);
    return null;
  }
}

/** Get current session (fast, from localStorage) */
async function getCurrentSession() {
  ensureSupabaseConfigured();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * React Query-based admin auth hook with optimized caching
 *
 * Benefits over useState approach:
 * - Automatic background refetching
 * - Built-in stale-while-revalidate pattern
 * - Automatic request deduplication
 * - Better error retry logic
 * - DevTools integration for debugging
 * - Optimistic updates support
 */
export function useAdminAuthQuery() {
  const queryClient = useQueryClient();

  // Query for current session
  const sessionQuery = useQuery({
    queryKey: ["auth", "session"],
    queryFn: getCurrentSession,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const user = sessionQuery.data?.user ?? null;

  // Query for profile (only if user exists)
  const profileQuery = useQuery({
    queryKey: ["auth", "profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Try cached profile first for instant display
      const cached = getCachedProfile(user.id);
      if (cached) {
        // Return cached immediately, but still fetch fresh data in background
        // React Query will update when fresh data arrives
        fetchProfileWithTimeout(user.id).then((freshProfile) => {
          if (freshProfile) {
            queryClient.setQueryData(
              ["auth", "profile", user.id],
              freshProfile,
            );
          }
        });
        return cached;
      }

      // No cache, fetch fresh data
      return fetchProfileWithTimeout(user.id);
    },
    enabled: !!user?.id, // Only run if user exists
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    retry: 1,
  });

  // Subscribe to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        clearCachedProfile();
        queryClient.setQueryData(["auth", "session"], null);
        queryClient.setQueryData(["auth", "profile", user?.id], null);
        queryClient.invalidateQueries({ queryKey: ["auth"] });
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        queryClient.setQueryData(["auth", "session"], session);
        queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, user?.id]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth"] });
    await queryClient.refetchQueries({ queryKey: ["auth"] });
  }, [queryClient]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Failed to sign out: ${error.message}`);
    clearCachedProfile();
    queryClient.setQueryData(["auth", "session"], null);
    queryClient.setQueryData(["auth", "profile", user?.id], null);
  }, [queryClient, user?.id]);

  // Compute derived state
  const profile = profileQuery.data ?? null;
  const isAdmin = profile?.role === "admin";
  const isLoading =
    sessionQuery.isLoading || (!!user && profileQuery.isLoading);
  const error =
    sessionQuery.error?.message ?? profileQuery.error?.message ?? null;

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(
    (): AdminAuthState & {
      refresh: () => Promise<void>;
      signOut: () => Promise<void>;
    } => ({
      isLoading,
      user,
      profile,
      isAdmin,
      error,
      refresh,
      signOut,
    }),
    [isLoading, user, profile, isAdmin, error, refresh, signOut],
  );
}
