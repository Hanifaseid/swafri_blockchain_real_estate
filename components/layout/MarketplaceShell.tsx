"use client";

import { usePathname } from "next/navigation";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/layout/Footer";

export function MarketplaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      className={[
        "flex min-h-screen flex-col overflow-x-clip text-white",
        isHome ? "" : "bg-[#0d0c0a]!",
      ].join(" ")}
    >
      <LandingNavbar />
      <div className="h-[72px]" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 lg:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
