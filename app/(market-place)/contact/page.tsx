'use client';

import Link from 'next/link';
import { Mail, MessageSquare, Shield } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/8 blur-[140px] pointer-events-none" />

      <main className="max-w-2xl mx-auto px-6 md:px-12 py-16 relative z-10">
        <div className="mb-12">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-3 py-1.5 rounded-full">
            Contact
          </span>
          <h1 className="text-4xl font-light text-white mt-5 mb-3 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-sm text-white/55 font-light">
            Have a question about listing a property, KYC verification, or the platform? Reach our team below.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {[
            {
              icon: <Mail className="w-5 h-5 text-emerald-400" />,
              label: 'General Support',
              value: 'support@swafir.com',
              href: 'mailto:support@swafir.com',
            },
            {
              icon: <Shield className="w-5 h-5 text-emerald-400" />,
              label: 'Compliance & Operations',
              value: 'operations@swafir.com',
              href: 'mailto:operations@swafir.com',
            },
            {
              icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
              label: 'Property Owner Onboarding',
              value: 'owners@swafir.com',
              href: 'mailto:owners@swafir.com',
            },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 liquid-glass border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-0.5">{item.label}</div>
                <div className="text-sm font-medium text-white">{item.value}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      </main>
    </div>
  );
}
