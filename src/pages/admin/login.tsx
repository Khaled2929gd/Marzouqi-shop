import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ensureSupabaseConfigured, supabase } from "@/lib/supabase";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { isLoading, isAdmin, user, signOut, refresh } = useAdminAuth();

  const redirectTarget = useMemo(() => {
    const query = new URLSearchParams(window.location.search);
    const redirect = query.get("redirect");

    if (redirect && redirect.startsWith("/admin")) {
      return redirect;
    }

    return "/admin";
  }, [location]);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      setLocation(redirectTarget);
    }
  }, [isAdmin, isLoading, redirectTarget, setLocation]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      ensureSupabaseConfigured();

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split("@")[0],
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        toast({
          title: "Account created",
          description:
            "Sign-up successful. Confirm email if required, then run 03_admin_account.sql to promote this user as admin.",
        });

        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        await refresh();
        setLocation(redirectTarget);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      toast({
        title: "Authentication failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Admin Sign In" hideNav>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </Layout>
    );
  }

  if (user && !isAdmin) {
    return (
      <Layout title="Admin Access" hideNav>
        <div className="mx-auto mt-10 w-full max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <div className="mb-3 flex items-center gap-2 text-amber-800">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Account is not an admin yet</h2>
          </div>
          <p className="mb-6 text-sm text-amber-700">
            You are signed in as {user.email}, but this account does not have admin role.
            Promote this user with 03_admin_account.sql, then sign in again.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
              }}
            >
              Sign out
            </Button>
            <Link href="/">
              <Button className="bg-red-600 hover:bg-red-700">Back to shop</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Access" hideNav>
      <div className="mx-auto mt-10 w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-red-700">
            <ShieldCheck className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</h2>
          </div>
          <p className="text-sm text-gray-500">
            {mode === "signin"
              ? "Use your Supabase account with admin role."
              : "Create a Supabase account, then promote it to admin via SQL."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Admin Name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@yourdomain.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <Button className="w-full bg-red-600 hover:bg-red-700" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          {mode === "signin" ? "No account yet?" : "Already have an account?"} {" "}
          <button
            className="font-medium text-red-600 hover:text-red-700"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            type="button"
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
