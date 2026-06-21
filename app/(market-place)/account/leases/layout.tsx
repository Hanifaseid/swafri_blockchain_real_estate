import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Lease Timeline", "Track private lease status, signatures, and escrow timeline activity.");
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
