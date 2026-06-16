// Public layout — landing, about, contact
// No auth required. Uses public Navbar + Footer.
// The background and color scheme matches the existing LandingPage dark design.

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}
