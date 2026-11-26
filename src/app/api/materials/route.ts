import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, toSafeUser } from "@/lib/auth";
import {
  checkContentUnlockedWithState,
  findUserById,
  getUserActiveRedemptions,
  listCompletedMaterialIds,
  listVideoMaterials,
  toggleMaterialCompleted,
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
  const [accessInfo, materials, completedIds] = await Promise.all([
    getUserActiveRedemptions(safeUser),
    listVideoMaterials(),
    listCompletedMaterialIds(session.userId),
  ]);

  const enriched = materials.map((m) => {
    const unlocked =
      !m.is_premium ||
      checkContentUnlockedWithState(
        safeUser,
        accessInfo.redemptions,
        m.grade_level,
        `${m.category} ${m.subject} ${m.title}`,
        "material",
        m.id
      );
    return {
      ...m,
      locked: !unlocked,
      youtube_id: unlocked ? m.youtube_id : "",
      completed: completedIds.includes(m.id),
    };
  });

  return NextResponse.json({
    materials: enriched,
    hasSubscription: accessInfo.unlockedLevels.length > 0,
    unlockedLevels: accessInfo.unlockedLevels,
    scopeLabels: accessInfo.scopeLabels,
    userGrade: safeUser.grade,
  });
}

export async function POST(request: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json(
      { error: "Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }
  try {
    const body = await request.json();
    const materialId = Number(body.materialId);
    if (!Number.isInteger(materialId) || materialId <= 0) {
      return NextResponse.json(
        { error: "ID materi tidak valid." },
        { status: 400 }
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
    const [accessInfo, materials] = await Promise.all([
      getUserActiveRedemptions(safeUser),
      listVideoMaterials(),
    ]);
    const targetMaterial = materials.find((m) => m.id === materialId);
    if (!targetMaterial) {
      return NextResponse.json(
        { error: "Materi video tidak ditemukan." },
        { status: 404 }
      );
    }

    const unlocked =
      !targetMaterial.is_premium ||
      checkContentUnlockedWithState(
        safeUser,
        accessInfo.redemptions,
        targetMaterial.grade_level,
        `${targetMaterial.category} ${targetMaterial.subject} ${targetMaterial.title}`,
        "material",
        targetMaterial.id
      );
    if (!unlocked) {
      return NextResponse.json(
        { error: "Materi video masih terkunci. Aktifkan kode redeem terlebih dahulu." },
        { status: 403 }
      );
    }

    const completed = await toggleMaterialCompleted(session.userId, materialId);
    return NextResponse.json({ completed });
  } catch (err) {
    console.error("Material progress error:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui progres materi." },
      { status: 500 }
    );
  }
}
