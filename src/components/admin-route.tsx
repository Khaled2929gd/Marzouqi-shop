import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export function AdminRoute({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { isLoading, user, isAdmin, error } = useAdminAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user || !isAdmin) {
      const redirectTarget = encodeURIComponent(location);
      setLocation(`/admin/login?redirect=${redirectTarget}`);
    }
  }, [isAdmin, isLoading, location, setLocation, user]);

  if (isLoading) {
    return (
      <Layout title="Admin">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Admin">
        <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-5 w-5" />
            Authentication Error
          </div>
          <p className="text-sm">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Layout title="Admin">
        <div className="flex h-[60vh] items-center justify-center text-sm text-gray-500">
          Redirecting to admin sign in...
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}
