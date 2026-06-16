// Global loading UI — shown during route transitions by Next.js automatically.

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-white/30">Loading</p>
      </div>
    </div>
  );
}
