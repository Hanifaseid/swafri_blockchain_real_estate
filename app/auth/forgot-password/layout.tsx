import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "Reset Password",
  "Request a secure password reset link for your VEX Property Register account.",
);

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
