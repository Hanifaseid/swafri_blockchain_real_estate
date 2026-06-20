import Link from 'next/link';
import { siteConfig } from '@/config/site.config';

// ─── Footer ───────────────────────────────────────────────────────────────────
// Public-facing footer. Dark design matching LandingPage.

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-black/30 py-10 px-6 md:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-3 select-none">
            <div className="w-7 h-7 rounded bg-white flex items-center justify-center text-black font-extrabold text-xs">
              V
            </div>
            <span className="text-base font-semibold text-white">{siteConfig.shortName}</span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed max-w-xs font-light">
            {siteConfig.description}
          </p>
        </div>

        {/* Platform links */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-3">Platform</p>
          <ul className="space-y-2">
            {[
              { label: 'Discover Properties', href: '/discovery' },
              { label: 'List a Property', href: '/auth/register' },
              { label: 'How It Works', href: '/#how-it-works-section' },
              { label: 'About', href: '/about' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-xs text-white/45 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support links */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-3">Support</p>
          <ul className="space-y-2">
            {[
              { label: 'Contact Us', href: '/contact' },
              { label: siteConfig.links.support, href: `mailto:${siteConfig.links.support}` },
              { label: 'Operations', href: `mailto:${siteConfig.links.operations}` },
            ].map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="text-xs text-white/45 hover:text-white transition-colors font-mono">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[10px] font-mono text-white/25">{siteConfig.copyright}</p>
        <p className="text-[10px] font-mono text-white/20">
          BLOCKCHAIN REAL ESTATE // ERC-721 DIGITAL TITLES
        </p>
      </div>
    </footer>
  );
}
