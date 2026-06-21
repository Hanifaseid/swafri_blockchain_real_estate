import type { Metadata } from "next";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata(
  "Secure Access | EstateLedger",
  "Sign in, register, or recover access to your EstateLedger account.",
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060606] px-6 py-10 text-white selection:bg-amber-400 selection:text-black">
      <div
        className="pointer-events-none fixed left-[-20%] top-[-30%] h-[70%] w-[70%] rounded-full bg-amber-900/5 blur-[180px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-[-20%] right-[-15%] h-[60%] w-[60%] rounded-full bg-emerald-900/4 blur-[150px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-[0.15] mix-blend-luminosity"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1600')",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </div>
  );
}
