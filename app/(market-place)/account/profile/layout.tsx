import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Account Profile", "Manage your private EstateLedger account profile.");
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
