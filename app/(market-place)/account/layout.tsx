import type { Metadata } from "next";
import { AccountShell } from "@/components/layout/AccountShell";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "Account | VEX Property Register",
  "Private account workflows for profile, KYC, saved searches, applications, offers, leases, and owner property listings.",
);

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
