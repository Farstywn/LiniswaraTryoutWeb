import { NextResponse } from "next/server";
import { getSessionFromCookies, toSafeUser } from "@/lib/auth";
import {
  checkContentUnlockedWithState,
  findUserById,
  getUserActiveRedemptions,
  listTryoutPackages,
  listUserAttempts,
  listUserTryoutSessions,
} from "@/lib/db";

export const dynamic = "force-dynamic";

function sanitizePackageDescription(description: string): string {
  return description
    .replace(/\s*\(Kode\s+[^)]+\)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { error: "Silakan login terlebih dahulu." },
      { status: 401 }
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
  const [accessInfo, packages, attempts, sessions] = await Promise.all([
    getUserActiveRedemptions(safeUser),
    listTryoutPackages(),
    listUserAttempts(session.userId),
    listUserTryoutSessions(session.userId),
  ]);

  const serverNow = Date.now();
  const activeSessions: Record<
    number,
    { endsAtMs: number; answeredCount: number; minutesLeft: number }
  > = {};
  for (const s of sessions) {
    if (s.ends_at_ms > serverNow) {
      const answeredCount = Object.values(s.answers || {}).filter(
        (arr) => Array.isArray(arr) && arr.some((v) => v !== null)
      ).length;
      const minutesLeft = Math.max(
        1,
        Math.ceil((s.ends_at_ms - serverNow) / 60000)
      );
      activeSessions[s.package_id] = {
        endsAtMs: s.ends_at_ms,
        answeredCount,
        minutesLeft,
      };
    }
  }

  return NextResponse.json({
    userId: safeUser.id,
    serverNow,
    activeSessions,
    packages: packages.map((pkg) => ({
      ...pkg,
      description: sanitizePackageDescription(pkg.description),
      locked:
        pkg.is_premium &&
        !checkContentUnlockedWithState(
          safeUser,
          accessInfo.redemptions,
          pkg.level,
          `${pkg.subject} ${pkg.title}`,
          "package",
          pkg.id
        ),
    })),
    attempts,
    hasSubscription: accessInfo.unlockedLevels.length > 0,
    unlockedLevels: accessInfo.unlockedLevels,
    scopeLabels: accessInfo.scopeLabels,
    userGrade: safeUser.grade,
  });
}
