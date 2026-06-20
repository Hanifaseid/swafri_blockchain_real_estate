import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site.config";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

// ─── Root Metadata ────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  openGraph: {
    title: siteConfig.og.title,
    description: siteConfig.og.description,
    type: "website",
  },
};

// ─── Root Layout ──────────────────────────────────────────────────────────────
// Provider wrap order:
//   QueryProvider  — TanStack Query (must be outermost, all hooks need it)
//   AuthProvider   — reads session, hydrates Zustand store, sets cookies
//   ToastProvider  — mounts react-hot-toast Toaster
//   children       — all pages

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=75"
          fetchPriority="high"
        />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
