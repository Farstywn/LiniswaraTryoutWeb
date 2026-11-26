import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, toSafeUser } from "@/lib/auth";
import {
  canUserAccessLevelContent,
  findUserById,
  getTryoutAttemptReviewById,
  getTryoutPackageById,
  listTryoutQuestions,
  saveTryoutAttempt,
  toPublicQuestions,
} from "@/lib/db";
import type { QuestionUserAnswer } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { error: "Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  const packageId = Number(context.params.id);
  const pkg = await getTryoutPackageById(packageId);
  if (!pkg) {
    return NextResponse.json(
      { error: "Paket tryout tidak ditemukan." },
      { status: 404 }
    );
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json(
      { error: "Pengguna tidak ditemukan." },
      { status: 401 }
    );
  }

  const safeUser = toSafeUser(user);
  const hasAccess = await canUserAccessLevelContent(
    safeUser,
    pkg.level,
    `${pkg.subject} ${pkg.title}`,
    "package",
    pkg.id
  );

  const sanitizedPkg = {
    ...pkg,
    description: pkg.description
      .replace(/\s*\(Kode\s+[^)]+\)/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim(),
  };

  const attemptIdParam = request.nextUrl.searchParams.get("attemptId");
  if (attemptIdParam) {
    const attemptId = Number(attemptIdParam);
    const savedResult = await getTryoutAttemptReviewById(
      attemptId,
      safeUser.id,
      safeUser.role === "admin"
    );
    if (!savedResult || savedResult.attempt.package_id !== packageId) {
      return NextResponse.json(
        { error: "Riwayat pembahasan tryout tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      package: sanitizedPkg,
      questions: [],
      savedResult,
    });
  }

  if (pkg.is_premium && !hasAccess) {
    return NextResponse.json(
      {
        error: `Simulasi tryout jenjang ${pkg.level} memerlukan kode redeem khusus jenjang ${pkg.level} (atau kode MGMP Semua Jenjang).`,
      },
      { status: 403 }
    );
  }

  const questions = await listTryoutQuestions(packageId);
  return NextResponse.json({
    package: sanitizedPkg,
    questions: toPublicQuestions(questions),
  });
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { error: "Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }

  const packageId = Number(context.params.id);
  const pkg = await getTryoutPackageById(packageId);
  if (!pkg) {
    return NextResponse.json(
      { error: "Paket tryout tidak ditemukan." },
      { status: 404 }
    );
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json(
      { error: "Pengguna tidak ditemukan." },
      { status: 401 }
    );
  }

  const safeUser = toSafeUser(user);
  const hasAccess = await canUserAccessLevelContent(
    safeUser,
    pkg.level,
    `${pkg.subject} ${pkg.title}`,
    "package",
    pkg.id
  );

  if (pkg.is_premium && !hasAccess) {
    return NextResponse.json(
      {
        error: `Paket tryout jenjang ${pkg.level} memerlukan kode redeem jenjang ${pkg.level}.`,
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const answers = Array.isArray(body.answers)
      ? (body.answers as QuestionUserAnswer[])
      : [];
    const durationSeconds = Math.max(0, Number(body.durationSeconds || 0));

    const result = await saveTryoutAttempt({
      userId: session.userId,
      packageId,
      answers,
      durationSeconds,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("Submit tryout error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan hasil simulasi tryout." },
      { status: 500 }
    );
  }
}
