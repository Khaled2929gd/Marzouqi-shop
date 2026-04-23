import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const placeholderPattern = /YOUR_PROJECT_REF|YOUR_SUPABASE_ANON_KEY/i;

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !placeholderPattern.test(String(supabaseUrl)) &&
  !placeholderPattern.test(String(supabaseAnonKey));

export const SUPABASE_PRODUCT_IMAGES_BUCKET =
  import.meta.env.VITE_SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";

const fallbackUrl = "https://example.supabase.co";
const fallbackKey = "public-anon-placeholder-key";

// Singleton pattern to ensure only one Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      isSupabaseConfigured ? String(supabaseUrl) : fallbackUrl,
      isSupabaseConfigured ? String(supabaseAnonKey) : fallbackKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
          storage:
            typeof window !== "undefined" ? window.localStorage : undefined,
          storageKey: "sb-avehxalewhjqfqibgagr-auth-token",
          debug: false,
        },
        global: {
          headers: {
            "X-Client-Info": "marzouqi-shop@1.0.0",
          },
        },
      },
    );

    // Suppress lock warnings in development (caused by HMR)
    if (import.meta.env.DEV) {
      const originalError = console.error;
      console.error = (...args: any[]) => {
        if (
          typeof args[0] === "string" &&
          args[0].includes("Lock") &&
          args[0].includes("was released")
        ) {
          return; // Suppress Supabase lock warnings in dev
        }
        originalError.apply(console, args);
      };
    }
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient();

function getConfigError(): Error {
  return new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.",
  );
}

export function ensureSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw getConfigError();
  }
}

type ProfileRole = "customer" | "admin";

export async function ensureAdminSession(): Promise<void> {
  ensureSupabaseConfigured();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Failed to read current user: ${userError.message}`);
  }

  if (!user) {
    throw new Error("You must sign in to continue.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: ProfileRole }>();

  if (profileError) {
    throw new Error(
      `Failed to resolve your profile role: ${profileError.message}`,
    );
  }

  if (!profile || profile.role !== "admin") {
    throw new Error("Admin role is required for this action.");
  }
}
