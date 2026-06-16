import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

// Public layout — landing, about, contact pages.
// Dark design. Wraps pages with Navbar + Footer.

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
