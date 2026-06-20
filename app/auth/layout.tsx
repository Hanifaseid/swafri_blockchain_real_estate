// ─── Auth Layout ──────────────────────────────────────────────────────────────
// Full-screen dark backdrop with centered modal-style form. No chrome.

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-amber-400 selection:text-black flex items-center justify-center px-6 py-10">
      {/* Ambient glows */}
      <div
        className="fixed top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-amber-900/5 blur-[180px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-emerald-900/4 blur-[150px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Background architectural image */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-[0.15] mix-blend-luminosity pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1600')",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
