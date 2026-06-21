import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Create Property Listing", "Create a private draft property listing with location, media, and ownership documents.");
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
