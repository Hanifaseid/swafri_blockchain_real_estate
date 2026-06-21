"use client";

import { usePathname } from "next/navigation";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/layout/Footer";

// ─── Marketplace layout ──────────────────────────────────────────────────────
// bg-black is applied on every route EXCEPT "/" so the home page's fixed
// -z-10 HeroBackground canvas shows through behind the content.
// On the home page the dark background comes from <body> (globals.css).

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

      {/* Spacer for the fixed navbar height */}
      <div className="h-[72px]" />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 lg:px-6">
        {children}
      </main>

      <Footer />
    </div>
  );
}
