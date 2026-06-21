import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("KYC Review", "Submit and track private KYC documents for VEX marketplace workflows.");
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
