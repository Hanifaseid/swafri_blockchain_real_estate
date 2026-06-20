# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**TerraChain** (internally also "Swafir" / "Terra") — a blockchain-enabled real-estate marketplace frontend. Next.js 16 App Router + React 19 + TypeScript. Connects to a remote REST API (`NEXT_PUBLIC_API_URL`, currently a Render-hosted backend) and supports on-chain title verification, KYC, escrow, leases, and purchase transactions.

## Commands

```bash
npm run dev      # next dev — local development
npm run build    # next build — standalone output (output: 'standalone')
npm run start    # next start — run the production build
npm run lint     # eslint .
npm run clean    # next clean
```

There is **no test runner configured** (no Jest/Vitest/Playwright deps or scripts) despite the presence of `TESTING_GUIDE.md` — verify changes via `npm run build` (type errors fail the build; `typescript.ignoreBuildErrors` is `false`) and `npm run lint`.

## Architecture

### Feature-sliced structure
Domain logic lives under `features/<domain>/` (listings, auth, users, kyc, leases, offers, inquiries, favorites, saved-searches, rental-applications, transactions, chain-transactions, compliance, audit, notifications, roles, permissions). Each feature follows the same internal layout:

- `types/` — TypeScript domain types (frontend uses `SCREAMING_SNAKE_CASE` enums)
- `services/` — async functions wrapping `apiClient` calls; return plain data
- `queries/` — TanStack Query hooks (`useX`, `useCreateX`, …) that call the services
- `components/`, `schemas/`, `utils/`, `constants/` — as needed

When adding a feature operation, follow this chain: add the route to `lib/api/endpoints.ts` → write a service fn in `features/<domain>/services/` → expose a query/mutation hook in `features/<domain>/queries/`.

### API layer (`lib/api/`)
- `axios-client.ts` — single `apiClient` axios instance. Request interceptor attaches `Bearer` token from `getSession()`. Response interceptor on **401** clears the session, deletes auth cookies, and redirects to `/login`. 20s timeout (Render cold starts).
- `endpoints.ts` — `ENDPOINTS` is the **single source of truth for all backend routes**. Never hardcode URL strings elsewhere.
- `adapters.ts` — maps API `snake_case`/lowercase values ↔ frontend `SCREAMING_SNAKE_CASE` (roles, statuses, KYC/wallet states). Change mappings here, not inline.
- `response.ts` — response envelope helpers.

**API response shapes are inconsistent** — services defensively unwrap several shapes (`{data: {items,total,page,limit}}`, `{data: [...]}`, top-level `{items}`). Reuse the existing `extractList`/`unwrapData` helper patterns when writing new services, and **default to safe empty values on error** (most GET services `try/catch` and return `[]`/`null` rather than throwing; mutations throw on `!data.success`).

### Auth & routing
- **Session** is stored client-side in `localStorage` (`lib/auth/session.ts`, `vex_*` keys). Token is optional. Use `getSession()`/`setSession()`/`clearSession()` — never touch `localStorage` directly.
- **Zustand store** (`stores/auth.store.ts`) is the React source of truth for the current user. Read from `useAuthStore`, not localStorage. `AuthProvider` (in `components/providers/`) hydrates it on mount and writes two non-sensitive cookies: `vex_authed=1` and `vex_user_role=<ROLE>`.
- **`proxy.ts`** (Next 16 renamed `middleware.ts` → `proxy.ts`, `middleware` → `proxy`) reads those cookies to gate routes. It cannot read localStorage. Logic: public routes pass; auth routes redirect logged-in users home; protected routes redirect to `/login` or block wrong roles.
- **Roles**: `SUPER_ADMIN | ADMIN | PROPERTY_OWNER | TENANT` (`features/roles/types/role.types.ts`). Only `PROPERTY_OWNER`/`TENANT` can self-register. Route→role rules live in `config/permissions.config.ts` (`canAccessRoute`, `protectedRoutes`, `publicRoutes`, `authRoutes`). Default landing per role is in `lib/auth/routes.ts` (admins → `/dashboard`, others → `/`).

### App Router groups (`app/`)
- `(auth)` — login/register/forgot/reset (no URL segment)
- `(dashboard)` — admin/staff shell at `/dashboard`, `/users`, `/listings`, `/audit`, etc. Route group adds no URL segment (`app/(dashboard)/users/page.tsx` → `/users`).
- `(public)` — about, contact
- `account/` — `PROPERTY_OWNER`/`TENANT` self-service area
- `listings/` — public listing discovery + detail
- `api/chat/` — server route using `@google/genai` (Gemini); requires `GEMINI_API_KEY`

### State & data
- **TanStack Query** for all server state. `lib/query/query-keys.ts` is a centralized key factory — prefer it, though some features (e.g. listings) define local `KEYS` objects; match the surrounding file's convention.
- **Zustand** for client/auth state.
- Provider wrap order in `app/layout.tsx`: `QueryProvider` (outermost) → `AuthProvider` → `ToastProvider`.
- User feedback via `react-hot-toast` (mutations toast on success/error).

### Maps & web3
- **Leaflet / react-leaflet** for map-first listing discovery (`components/map/`), with `/listings/clusters` and `/geo/*` endpoints for clustering and geocoding. Map components are client-only — guard against SSR.
- **wagmi** for wallet linking (`/auth/wallet/*` endpoints) and on-chain title operations (mint/dispute/revoke under `LISTINGS`).

## Styling & design system

Tailwind CSS **v4** (config-less; tokens live in `app/globals.css` under `@theme`). Read `DESIGN_SYSTEM.md` before touching colors.

**Critical**: built-in Tailwind scales are **remapped** in `@theme` — `emerald-*`/`green-*` → Verdant (forest green), `gray-*` → Stone (warm neutral), `amber-*` → Gold, `slate-*` → warm charcoal. So `bg-emerald-600` etc. do **not** render stock Tailwind hues. For new work, prefer semantic tokens (`brand-*`, `accent-*`). Fonts: Fraunces (serif display), Inter (UI), JetBrains Mono (hashes/addresses), loaded via Google Fonts in the root layout.

## Conventions

- Path alias `@/*` → repo root (e.g. `@/features/...`, `@/lib/...`).
- Section headers use box-drawing comment dividers (`// ─── Title ───`). Match this style.
- Frontend enums are `SCREAMING_SNAKE_CASE`; the API speaks lowercase/snake_case — convert only in `lib/api/adapters.ts`.
- Git: feature branches off `main`. (Per global rules, do not add Claude co-author trailers to commits.)
