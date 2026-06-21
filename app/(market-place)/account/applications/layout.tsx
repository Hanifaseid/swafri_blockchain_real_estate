import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Rental Applications", "Track private rental applications in your EstateLedger marketplace account.");
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
