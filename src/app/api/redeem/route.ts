import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, toSafeUser } from "@/lib/auth";
import {
  extractScopeLabel,
  extractTargetLevels,
  findUserById,
  getUserActiveRedemptions,
  listRedeemCodes,
  listUserRedemptions,
  parseCustomBundleTargets,
  redeemCodeForUser,
  stripCustomBundleTag,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
  }

  const [user, history, codes] = await Promise.all([
    findUserById(session.userId),
    listUserRedemptions(session.userId),
    listRedeemCodes(),
  ]);

  const accessInfo = user
    ? await getUserActiveRedemptions(toSafeUser(user))
    : { unlockedLevels: [], scopeLabels: [] };

  const enrichedHistory = history.map((item) => {
    const desc = item.description || "";
    const isCustom = parseCustomBundleTargets(desc).isCustomBundle;
    return {
      ...item,
      description: stripCustomBundleTag(desc),
      target_levels: isCustom
        ? []
        : extractTargetLevels(item.code, item.plan_name),
      scope_label: extractScopeLabel(item.code, item.plan_name, desc),
    };
  });

  const sampleCodes = codes
    .filter((c) => c.is_active && c.used_count < c.quota)
    .map((c) => {
      const isCustom = parseCustomBundleTargets(c.description).isCustomBundle;
      return {
        code: c.code,
        plan_name: c.plan_name,
        duration_days: c.duration_days,
        description: stripCustomBundleTag(c.description),
        target_levels: isCustom
          ? []
          : extractTargetLevels(c.code, c.plan_name),
        scope_label: extractScopeLabel(c.code, c.plan_name, c.description),
      };
    });

  return NextResponse.json({
    history: enrichedHistory,
    sampleCodes,
    unlockedLevels: accessInfo.unlockedLevels,
    scopeLabels: accessInfo.scopeLabels,
  });
}

export async function POST(request: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { error: "Silakan login terlebih dahulu untuk klaim kode redeem." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const code = String(body.code || "");
    const result = await redeemCodeForUser(session.userId, code);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      message: "Kode redeem berhasil diaktifkan!",
      user: result.user,
      redemption: result.redemption,
    });
  } catch (err) {
    console.error("Redeem error:", err);
    return NextResponse.json(
      { error: "Gagal memproses aktivasi kode redeem." },
      { status: 500 }
    );
  }
}
