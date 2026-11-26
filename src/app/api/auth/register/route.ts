import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  createSessionToken,
  getClientIp,
  getSessionCookieOptions,
  hashPassword,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`register:${ip}`, 10, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan pendaftaran. Coba lagi dalam ${limit.retryAfterSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const school = String(body.school || "").trim();
    const grade = String(body.grade || "SD/MI").trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama lengkap, email, dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (name.length > 120 || email.length > 160 || school.length > 160) {
      return NextResponse.json(
        { error: "Panjang nama, email, atau asal sekolah melebihi batas." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Format alamat email tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: "Kata sandi minimal 6 karakter dan maksimal 128 karakter." },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Email tersebut sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    const user = await createUser({
      name,
      email,
      password_hash: hashPassword(password),
      school: school || "Sekolah Mitra Liniswara",
      grade: grade.slice(0, 60),
    });

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      token,
      getSessionCookieOptions()
    );
    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat mendaftar." },
      { status: 500 }
    );
  }
}
