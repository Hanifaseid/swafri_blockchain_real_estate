import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "Create Account",
  "Create a EstateLedger account as a tenant or property owner to access marketplace workflows and verified property listings.",
);

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
