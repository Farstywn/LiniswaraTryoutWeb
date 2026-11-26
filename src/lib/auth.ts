import crypto from "crypto";
import { cookies } from "next/headers";
import type { SafeUser, User } from "@/types";

const SESSION_COOKIE_NAME = "liniswara_session";

function getSecret(): string {
  return (
    process.env.JWT_SECRET || "liniswara-smart-steps-tka-secret-key-2026"
  );
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, originalHash] = parts;
  if (!salt || !originalHash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const origBuf = Buffer.from(originalHash, "hex");
  const derivedBuf = Buffer.from(derived, "hex");
  if (origBuf.length === 0 || origBuf.length !== derivedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(origBuf, derivedBuf);
}

export function getSessionCookieOptions(maxAge = 7 * 24 * 60 * 60) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  if (rateLimitStore.size > 500) {
    rateLimitStore.forEach((entry, k) => {
      if (entry.resetAt <= now) rateLimitStore.delete(k);
    });
  }

  const existing = rateLimitStore.get(key);
  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export interface SessionPayload {
  userId: number;
  email: string;
  role: "student" | "admin";
  exp: number;
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 hari
  const fullPayload: SessionPayload = { ...payload, exp };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;

    const expectedSig = crypto
      .createHmac("sha256", getSecret())
      .update(encoded)
      .digest("base64url");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as SessionPayload;

    if (!decoded.exp || decoded.exp < Date.now()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function getSessionFromCookies(): SessionPayload | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    school: user.school,
    grade: user.grade,
    subscription_status: user.subscription_status,
    subscription_plan: user.subscription_plan,
    subscription_expires_at: user.subscription_expires_at,
    created_at: user.created_at,
  };
}

export function isSubscriptionActive(user: Pick<SafeUser, "subscription_status" | "subscription_expires_at">): boolean {
  if (user.subscription_status !== "active") return false;
  if (!user.subscription_expires_at) return true;
  return new Date(user.subscription_expires_at).getTime() > Date.now();
}

export { SESSION_COOKIE_NAME };
