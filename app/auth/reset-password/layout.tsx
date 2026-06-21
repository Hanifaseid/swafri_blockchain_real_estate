import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "Set New Password",
  "Set a new password for your VEX Property Register account.",
);

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
