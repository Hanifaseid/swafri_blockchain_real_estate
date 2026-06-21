import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "My Purchases | EstateLedger",
  "Track your active property purchase transactions and deal progress.",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
