import { NextResponse } from "next/server";
import { getSessionFromCookies, toSafeUser } from "@/lib/auth";
import {
  checkContentUnlockedWithState,
  findUserById,
  getUserActiveRedemptions,
  listTryoutPackages,
  listUserAttempts,
} from "@/lib/db";

export const dynamic = "force-dynamic";

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
  const [accessInfo, packages, attempts] = await Promise.all([
    getUserActiveRedemptions(safeUser),
    listTryoutPackages(),
    listUserAttempts(session.userId),
  ]);

  return NextResponse.json({
    packages: packages.map((pkg) => ({
      ...pkg,
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
