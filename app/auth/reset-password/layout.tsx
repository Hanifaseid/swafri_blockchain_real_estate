import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "Set New Password",
  "Set a new password for your EstateLedger account.",
);

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
