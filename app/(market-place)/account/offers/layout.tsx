import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Purchase Offers", "Track private purchase offers for sale listings in your EstateLedger account.");
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
