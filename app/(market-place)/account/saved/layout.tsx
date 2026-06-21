import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Saved Searches", "Manage private saved property searches and marketplace alerts.");
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
