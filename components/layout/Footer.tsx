import Link from "next/link";
import { siteConfig } from "@/config/site.config";

const marketplaceLinks = [
  { label: "Home", href: "/" },
  { label: "Discover", href: "/discovery" },
  { label: "Listings", href: "/listings" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const accountLinks = [
  { label: "Saved Searches", href: "/account/saved" },
  { label: "Applications", href: "/account/applications" },
  { label: "Offers", href: "/account/offers" },
  { label: "Leases", href: "/account/leases" },
  { label: "List a Property", href: "/account/listings/new" },
];

const oversightLinks = [
  { label: "Admin Dashboard", href: "/admin/dashboard" },
  { label: "KYC Review", href: "/admin/kyc" },
  { label: "Compliance", href: "/admin/compliance" },
  { label: "Transactions", href: "/admin/transactions" },
];

export function Footer() {
  return (
    <footer className="z-5 border-t border-white/8 bg-black/40 px-4 py-12 lg:px-6">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link
            href="/"
            className="mb-4 flex w-fit select-none items-center gap-3"
            aria-label="EstateLedger home"
          >
            <span className="grid h-9 w-9 place-items-center rounded-[8px] bg-linear-to-br from-amber-300 to-amber-600 font-display text-lg font-semibold leading-none text-emerald-950 shadow-[0_2px_10px_-2px_rgba(189,139,39,0.6)]">
              V
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-semibold tracking-tight text-white">
                EstateLedger
              </span>
              <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.28em] text-amber-300/80">
                Property Register
              </span>
            </span>
          </Link>

          <p className="max-w-md text-sm font-light leading-relaxed text-white/52">
            Blockchain-enabled property listings with map-based discovery,
            digital title verification, KYC review, and escrow visibility for
            buyers, renters, and property owners.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Digital Titles", "Lease Escrow", "KYC Review"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/42"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/30">
            Marketplace
          </p>
          <ul className="space-y-2.5">
            {marketplaceLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-xs text-white/50 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/30">
            Account
          </p>
          <ul className="space-y-2.5">
            {accountLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-xs text-white/50 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-white/30">
            Oversight
          </p>
          <ul className="space-y-2.5">
            {oversightLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-xs text-white/50 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-white/8 pt-4">
            <a
              href={`mailto:${siteConfig.links.support}`}
              className="block font-mono text-[10px] text-white/35 transition-colors hover:text-white/70"
            >
              {siteConfig.links.support}
            </a>
            <a
              href={`mailto:${siteConfig.links.operations}`}
              className="block font-mono text-[10px] text-white/35 transition-colors hover:text-white/70"
            >
              {siteConfig.links.operations}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[10px] text-white/25">
          {siteConfig.copyright}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/22">
          Blockchain property marketplace // ERC-721 title records
        </p>
      </div>
    </footer>
  );
}
