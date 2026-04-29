// Lightweight JWT (HS256) auth — single-device, localStorage-backed.
// Passwords are stored as PBKDF2 hashes; sessions as signed JWTs.

const enc = new TextEncoder();
const dec = new TextDecoder();

const SECRET_KEY_NAME = "lt_jwt_secret";
const USER_KEY = "lt_admin_user_v2";
const TOKEN_KEY = "lt_admin_token";

type StoredUser = {
  username: string;
  email: string;
  saltB64: string;
  hashB64: string;
  iterations: number;
};

export type JwtPayload = { sub: string; username: string; email: string; iat: number; exp: number };

// ---------- base64url ----------
function bytesToB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64UrlToBytes(s: string): Uint8Array {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function strToB64Url(s: string) { return bytesToB64Url(enc.encode(s)); }
function b64UrlToStr(s: string) { return dec.decode(b64UrlToBytes(s)); }

// ---------- secret ----------
function getOrCreateSecret(): string {
  let s = localStorage.getItem(SECRET_KEY_NAME);
  if (!s) {
    const buf = new Uint8Array(32);
    crypto.getRandomValues(buf);
    s = bytesToB64Url(buf);
    localStorage.setItem(SECRET_KEY_NAME, s);
  }
  return s;
}

// ---------- password hashing (PBKDF2-SHA256) ----------
async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    256
  );
  return new Uint8Array(bits);
}

async function hashPassword(password: string) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const iterations = 150_000;
  const hash = await pbkdf2(password, salt, iterations);
  return { saltB64: bytesToB64Url(salt), hashB64: bytesToB64Url(hash), iterations };
}

async function verifyPassword(password: string, u: StoredUser) {
  const salt = b64UrlToBytes(u.saltB64);
  const hash = await pbkdf2(password, salt, u.iterations);
  const expected = b64UrlToBytes(u.hashB64);
  if (hash.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash[i] ^ expected[i];
  return diff === 0;
}

// ---------- JWT (HS256) ----------
async function hmacSign(data: string): Promise<string> {
  const secret = b64UrlToBytes(getOrCreateSecret());
  const key = await crypto.subtle.importKey("raw", secret as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bytesToB64Url(new Uint8Array(sig));
}

async function signJwt(payload: JwtPayload): Promise<string> {
  const header = strToB64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = strToB64Url(JSON.stringify(payload));
  const sig = await hmacSign(`${header}.${body}`);
  return `${header}.${body}.${sig}`;
}

async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const [h, b, s] = token.split(".");
    if (!h || !b || !s) return null;
    const expected = await hmacSign(`${h}.${b}`);
    if (expected !== s) return null;
    const payload = JSON.parse(b64UrlToStr(b)) as JwtPayload;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch { return null; }
}

// ---------- public API ----------
function notify() { window.dispatchEvent(new Event("lt:update")); }

function readUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as StoredUser; } catch { return null; }
}

export const auth = {
  hasAccount(): boolean { return !!readUser(); },

  async signup(input: { username: string; email: string; password: string }) {
    if (readUser()) throw new Error("An admin account already exists. Please log in.");
    const username = input.username.trim();
    const email = input.email.trim().toLowerCase();
    if (username.length < 3) throw new Error("Username must be at least 3 characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email.");
    if (input.password.length < 6) throw new Error("Password must be at least 6 characters.");
    const { saltB64, hashB64, iterations } = await hashPassword(input.password);
    const u: StoredUser = { username, email, saltB64, hashB64, iterations };
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    await this.login(email, input.password);
  },

  async login(emailOrUsername: string, password: string) {
    const u = readUser();
    if (!u) throw new Error("No account exists. Please sign up first.");
    const id = emailOrUsername.trim().toLowerCase();
    if (id !== u.email.toLowerCase() && id !== u.username.toLowerCase()) {
      throw new Error("Invalid credentials.");
    }
    const ok = await verifyPassword(password, u);
    if (!ok) throw new Error("Invalid credentials.");
    const now = Math.floor(Date.now() / 1000);
    const token = await signJwt({
      sub: u.email, username: u.username, email: u.email,
      iat: now, exp: now + 60 * 60 * 24 * 7, // 7 days
    });
    localStorage.setItem(TOKEN_KEY, token);
    notify();
  },

  logout() { localStorage.removeItem(TOKEN_KEY); notify(); },

  async getSession(): Promise<JwtPayload | null> {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return null;
    const p = await verifyJwt(t);
    if (!p) { localStorage.removeItem(TOKEN_KEY); return null; }
    return p;
  },

  // Synchronous best-effort check — verifies signature lazily on mount via getSession.
  hasToken(): boolean { return !!localStorage.getItem(TOKEN_KEY); },
};
