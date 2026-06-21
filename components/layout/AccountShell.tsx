"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import { getDefaultRouteForRole, isAdminRole } from "@/lib/auth/routes";
import { useAuthStore } from "@/stores/auth.store";

export function AccountShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, setUser, setLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifyUser() {
      const user = await getCurrentUser();
      if (!active) return;

      if (!user) {
        setLoading(false);
        router.replace("/auth/login");
        return;
      }
      if (isAdminRole(user.role)) {
        setLoading(false);
        router.replace(getDefaultRouteForRole(user.role));
        return;
      }
      setUser(user);
      setLoading(false);
      setMounted(true);
    }

    void verifyUser();

    return () => {
      active = false;
    };
  }, [router, setLoading, setUser]);

  if (!mounted || !currentUser || isAdminRole(currentUser.role)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  return <div className="pb-16 pt-8">{children}</div>;
}
