# Terra — Design System

**Warm Premium Real-Estate** visual language for the Real-Estate Blockchain Marketplace frontend.
Single source of truth for tokens, typography, components, and usage. All tokens live in
[`app/globals.css`](./app/globals.css) under the Tailwind v4 `@theme` block.

---

## 1. Design direction

> Editorial, aspirational, and credible. The platform handles money (escrow) and proof of
> ownership (on-chain titles), so the UI must feel **trustworthy** *and* **premium** — like a
> private bank crossed with a high-end property magazine.

- **Forest green** carries trust and is the primary action color.
- **Warm gold** is the premium accent — used sparingly for the single most important CTA, "Featured/Premium" markers, and active navigation.
- **Sand / stone neutrals** (warm grays) give the "premium paper" feel instead of cold tech gray.
- **Serif display headings** (Fraunces) add editorial warmth; **Inter** keeps the UI crisp; **JetBrains Mono** is for hashes, wallet addresses, and on-chain data.

---

## 2. How the reskin is wired (read before editing colors)

The component layer was originally built on Tailwind's built-in `emerald-*`, `gray-*`, and
`amber-*` utilities. Rather than touch ~100 files, we **remap those scales** in `@theme`:

| Built-in scale | Remapped to | Used for |
| --- | --- | --- |
| `emerald-*` / `green-*` | **Verdant** (forest green) | primary buttons, links, active, success, prices |
| `gray-*` | **Stone** (warm neutral) | text, borders, surfaces |
| `amber-*` | **Gold** (premium accent) | Featured, highlights, accent CTAs |
| `slate-*` | **Warm charcoal** | dashboard chrome, "sold" badge |

So existing `bg-emerald-600`, `text-gray-500`, `bg-amber-500` now render warm-premium
automatically. **New work should prefer the semantic tokens below** (`brand-*`, `accent-*`).

> ⚠️ Because scales are remapped, do **not** reach for `emerald`/`gray`/`amber` expecting the
> stock Tailwind hues — they are intentionally overridden.

---

## 3. Color tokens

### Brand — Verdant (primary)
| Token | Hex | Use |
| --- | --- | --- |
| `brand-50` | `#f0f6f1` | tints, hover backgrounds |
| `brand-100` | `#dcebe0` | badges, subtle fills |
| `brand-500` | `#3d7d58` | hover state |
| `brand-600` | `#2f6b4f` | **primary action** |
| `brand-700` | `#245540` | active/pressed, body links |
| `brand-900` | `#19372b` | deep surfaces, premium badge bg |
| `brand-950` | `#0c1f18` | text on gold |

### Accent — Gold (premium, use sparingly)
| Token | Hex | Use |
| --- | --- | --- |
| `accent-100` | `#f3e7c6` | tints |
| `accent-300` | `#dcb456` | text-on-dark accents |
| `accent-500` | `#bd8b27` | **signature gold**, featured |
| `accent-600` | `#9c6f22` | hover |

### Neutral — Stone (warm gray)
`gray-50 #faf8f5` · `gray-100 #f4f2ec` · `gray-200 #e8e4da` (borders) · `gray-300 #d7d0c2` ·
`gray-400 #aaa191` · `gray-500 #7d7568` (secondary text) · `gray-600 #57514a` (body) ·
`gray-900 #1c1a16` (headings) · `gray-950 #100e0b`.

### Surfaces
- Dark public/auth: `surface-base #14110c` (warm espresso), `surface-raised #1d1812`.
- Dashboard: `dash-bg #faf8f5` (warm paper), `dash-sidebar #1c1813` (warm charcoal), `dash-card #ffffff`, `dash-divider #e8e4da`.

### Semantic status (domain-aware)
| State | Token | Hex |
| --- | --- | --- |
| Active / Approved / Verified | `status-active` | `#2f6b4f` |
| Pending | `status-pending` | `#bd8b27` |
| Suspended | `status-suspended` | `#c2702c` (terracotta) |
| Blocked / Rejected | `status-blocked` | `#b4452f` (clay red) |

**KYC** (`kyc-pending` gold, `kyc-review` slate-blue, `kyc-approved` green, `kyc-rejected` clay,
`kyc-expired` stone). **Roles** (`super-admin` gold, `admin` slate-blue, `owner` walnut,
`tenant` green). These map to the four backend roles and KYC states.

---

## 4. Typography

| Role | Family | Token | Notes |
| --- | --- | --- | --- |
| Display / headings | **Fraunces** (serif) | `--font-display` / `.font-display` | hero, section titles, prices |
| UI / body | **Inter** | `--font-sans` | default everywhere |
| Data / hashes | **JetBrains Mono** | `--font-mono` | wallet addresses, tx hashes, stats |

Apply the serif with the `.font-display` utility (e.g. hero heading, listing price). Keep body
copy in Inter. Tracking is tightened on display text (`letter-spacing: -0.02em`).

Recommended scale (Tailwind): `text-xs … text-base` for UI; `text-3xl/4xl` section titles;
`text-6xl–8xl` hero. Body line-height relaxed; display line-height tight (`leading-[1.02]`).

---

## 5. Spacing, radius, elevation

- **Spacing:** Tailwind's 4px grid (`p-2`, `gap-4`, `px-5`…). Cards use `p-5`; page gutters `px-6 md:px-12`.
- **Radius:** `--radius-sm 6` · `md 10` · `lg 14` · `xl 18` · `2xl 24`. Cards = `xl`; buttons = `lg`; pills = full.
- **Elevation (warm, low — premium = subtle):** `--shadow-soft` (cards), `--shadow-raised` (hover), `--shadow-float` (popovers/modals). Avoid heavy/black shadows.

---

## 6. Core components (`components/ui/`)

| Component | Variants / notes |
| --- | --- |
| `Button` | `default` (green), **`accent`** (gold — one per view max), `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes `sm/md/lg/icon`. `loading` prop shows spinner. `asChild` to wrap `Link`. |
| `Badge` | Status pill auto-colored by `status` key (active/pending/sold/rented/verified/disputed/…); warm-tuned. Unknown strings fall back to neutral. |
| `Card` | `Card › CardHeader › CardTitle/CardDescription · CardContent · CardFooter`. Warm border + soft shadow. |
| `StatCard`, `DataTable`, `Pagination`, `Tabs`, `Modal`, `ConfirmDialog`, `Dropdown`, `Tooltip`, `Avatar`, `FormField`, `SearchInput`, `Stepper`, `EmptyState`, `LoadingSkeleton`, `HashDisplay`, `WalletConnectButton` | Existing primitives; all inherit the warm palette via the remap. |

### Usage rules
1. **One gold action per screen.** Gold = "the thing we want you to do." Everything else is green or neutral.
2. **Green for trust/positive**, terracotta/clay for warnings/errors (never pure red).
3. **Mono for anything on-chain** — addresses, tx hashes, token ids (`HashDisplay`).
4. **Serif for headlines and prices only** — not for UI labels or body.
5. Never hardcode hex; use tokens / Tailwind classes that resolve to them.

---

## 7. Surface patterns

- **Public / landing / auth:** dark warm-espresso backgrounds, large photography, `liquid-glass` cards, serif hero, gold primary CTA. (`components/landing/*`, `app/(public)`, `app/(auth)`)
- **Dashboard (all roles):** warm-paper content area, white cards, espresso sidebar with a **gold active rail** (`.nav-item.active`). Role badge in the sidebar reflects the user's role color. (`app/(dashboard)`, `components/layout/dashboard/*`)
- **Listings:** photo-forward cards with serif price, "For Sale/For Rent" + Featured (gold) / Premium (green+gold) markers, on-chain verification surfaced via mono hash + green "Verified" badge.

---

## 8. Accessibility

- Body text uses `gray-600 #57514a` / headings `gray-900 #1c1a16` on white → AA+.
- Primary button green-700 on white text → AA. Gold button uses **dark green text** (`emerald-950`) on gold for contrast — do **not** put white text on gold.
- Focus: verdant 2px ring (`.focus-ring`, `focus-visible:ring-emerald-500`). Keep it visible.
- Status is never color-only — pair with the text label in `Badge`.

---

## 9. Extending the system

- Add a token → put it in the `@theme` block in `globals.css`, then reference via Tailwind (`bg-accent-500`) or `var(--color-accent-500)`.
- Add a component → place in `components/ui/`, build with `cva` for variants, type with `VariantProps`, and compose classes with `cn()` (`lib/utils.ts`).
- Keep feature UI in `features/<domain>/components`; keep shared primitives in `components/ui`.

---

*Design system: **Terra**. Tokens in `app/globals.css`. Questions → see component JSDoc headers.*
