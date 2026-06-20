// Auth layout — login and register pages.
// Dark centered card layout. No sidebar. No topbar.
// Background matches the existing auth/page.tsx design (black + ambient glows).

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col selection:bg-white selection:text-black overflow-x-hidden">
      {/* Ambient glows — same as existing auth/page.tsx */}
      <div
        className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[70%] rounded-full bg-emerald-900/10 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />
      {/* Background architectural image — same as existing auth/page.tsx */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1600')",
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
