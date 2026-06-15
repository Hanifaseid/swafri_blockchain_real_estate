export interface Session {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    walletAddress?: string;
    isVerified: boolean;
    isCompliant: boolean;
  };
  expiresAt: number;
}

const SESSION_KEY = "swafir_session";
const TOKEN_COOKIE = "auth_token";

// ─── Cookie helpers ───────────────────────────────────────────────────────────
function setTokenCookie(token: string, expiresAt: number): void {
  if (typeof document === "undefined") return;
  const maxAge = Math.floor((expiresAt - Date.now()) / 1000);
  // SameSite=Lax is safe for this use case; add Secure in production
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearTokenCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

// ─── Session helpers ──────────────────────────────────────────────────────────
export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setSession(session: Session): void {
  if (typeof window === "undefined") return;
  // 1. Persist full session in localStorage for client-side use
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // 2. Write token to cookie so middleware can read it on every request
  setTokenCookie(session.token, session.expiresAt);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  clearTokenCookie();
}

export function getToken(): string | null {
  return getSession()?.token ?? null;
}

export function getCurrentUser(): Session["user"] | null {
  return getSession()?.user ?? null;
}

export function getCurrentRole(): string | null {
  return getSession()?.user?.role ?? null;
}
