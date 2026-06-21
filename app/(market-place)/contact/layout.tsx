import type { Metadata } from "next";
import { createSeoMetadata } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata({
  title: "Contact EstateLedger",
  description:
    "Contact EstateLedger for property owner onboarding, compliance operations, listing support, and marketplace questions.",
  path: "/contact",
  keywords: ["contact real estate marketplace", "property owner onboarding", "KYC support"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
