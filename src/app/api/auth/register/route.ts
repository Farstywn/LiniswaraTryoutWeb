import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  hashPassword,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const school = String(body.school || "").trim();
    const grade = String(body.grade || "XII SMK/SMA").trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama lengkap, email, dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal terdiri dari 6 karakter." },
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
      school: school || "SMK/SMA Mitra Liniswara",
      grade,
    });

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat mendaftar." },
      { status: 500 }
    );
  }
}
