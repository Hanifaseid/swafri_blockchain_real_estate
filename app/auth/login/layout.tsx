import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "Sign In",
  "Sign in to VEX Property Register to manage listings, saved searches, KYC, offers, applications, and leases.",
);

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
