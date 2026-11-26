import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  createSessionToken,
  getClientIp,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  toSafeUser,
  verifyPassword,
} from "@/lib/auth";
import { findUserByEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const limit = checkRateLimit(`login:${ip}:${email}`, 10, 5 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login. Silakan coba lagi dalam ${limit.retryAfterSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: "Email atau kata sandi tidak sesuai." },
        { status: 401 }
      );
    }

    const safeUser = toSafeUser(user);
    const token = createSessionToken({
      userId: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    const response = NextResponse.json({ user: safeUser }, { status: 200 });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      token,
      getSessionCookieOptions()
    );
    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat login." },
      { status: 500 }
    );
  }
}
