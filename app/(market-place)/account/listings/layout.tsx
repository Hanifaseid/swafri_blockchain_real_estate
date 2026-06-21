import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("My Property Listings", "Create, edit, submit, and manage private property owner listings.");
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
