import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import {
  createRedeemCode,
  createTryoutPackage,
  createTryoutQuestion,
  createVideoMaterial,
  deleteRedeemCode,
  deleteTryoutPackage,
  deleteTryoutQuestion,
  deleteVideoMaterial,
  extractScopeLabel,
  formatCustomBundleDescription,
  getAdminStats,
  listAllAttemptsForAdmin,
  listAllUsersSafe,
  listRedeemCodes,
  listTryoutPackages,
  listTryoutQuestions,
  listVideoMaterials,
  parseCustomBundleTargets,
  stripCustomBundleTag,
  toggleRedeemCodeStatus,
  updateRedeemCode,
  updateTryoutPackage,
  updateTryoutQuestion,
  updateVideoMaterial,
} from "@/lib/db";
import type { EducationLevel } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Akses khusus Admin Liniswara." },
      { status: 403 }
    );
  }

  const [stats, redeemCodes, users, materials, packages, attempts] =
    await Promise.all([
      getAdminStats(),
      listRedeemCodes(),
      listAllUsersSafe(),
      listVideoMaterials(),
      listTryoutPackages(),
      listAllAttemptsForAdmin(),
    ]);

  const packagePreviews = await Promise.all(
    packages.map(async (pkg) => ({
      ...pkg,
      questions: await listTryoutQuestions(pkg.id),
    }))
  );

  const enrichedCodes = redeemCodes.map((c) => {
    const parsed = parseCustomBundleTargets(c.description);
    return {
      ...c,
      clean_description: stripCustomBundleTag(c.description),
      scope_label: extractScopeLabel(c.code, c.plan_name, c.description),
      is_custom_bundle: parsed.isCustomBundle,
      bundle_material_ids: parsed.materialIds,
      bundle_package_ids: parsed.packageIds,
    };
  });

  return NextResponse.json({
    stats,
    redeemCodes: enrichedCodes,
    users,
    materials,
    packages: packagePreviews,
    attempts,
  });
}

export async function POST(request: NextRequest) {
  const session = getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Akses khusus Admin Liniswara." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    if (body.action === "toggle") {
      await toggleRedeemCodeStatus(Number(body.id), Boolean(body.is_active));
      return NextResponse.json({ ok: true });
    }

    if (body.action === "update_redeem") {
      const isCustomBundle = Boolean(body.is_custom_bundle);
      const bundleMatIds = Array.isArray(body.bundle_material_ids)
        ? body.bundle_material_ids.map(Number).filter((n: number) => n > 0)
        : [];
      const bundlePkgIds = Array.isArray(body.bundle_package_ids)
        ? body.bundle_package_ids.map(Number).filter((n: number) => n > 0)
        : [];
      if (
        isCustomBundle &&
        bundleMatIds.length === 0 &&
        bundlePkgIds.length === 0
      ) {
        return NextResponse.json(
          {
            error:
              "Untuk Custom Bundle, pilih minimal 1 video materi atau 1 paket tryout.",
          },
          { status: 400 }
        );
      }
      const desc = isCustomBundle
        ? formatCustomBundleDescription(
            String(body.description || ""),
            bundleMatIds,
            bundlePkgIds
          )
        : stripCustomBundleTag(String(body.description || ""));
      const result = await updateRedeemCode({
        id: Number(body.id),
        code: String(body.code || ""),
        plan_name: String(body.plan_name || ""),
        description: desc,
        duration_days: Math.max(1, Number(body.duration_days || 90)),
        quota: Math.max(1, Number(body.quota || 100)),
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    if (body.action === "delete_redeem") {
      await deleteRedeemCode(Number(body.id));
      return NextResponse.json({ ok: true });
    }

    if (body.action === "create_material") {
      if (!body.title || !body.youtube_id || !body.summary) {
        return NextResponse.json(
          { error: "Judul, ID/URL YouTube, dan rangkuman wajib diisi." },
          { status: 400 }
        );
      }
      const material = await createVideoMaterial({
        title: String(body.title),
        category: String(body.category || "Materi Umum"),
        subject: String(body.subject || "Mata Pelajaran"),
        grade_level: String(body.grade_level || "SMA/MA"),
        youtube_id: String(body.youtube_id),
        duration: String(body.duration || "15:00"),
        summary: String(body.summary),
        book_reference: String(body.book_reference || ""),
        is_premium: Boolean(body.is_premium),
      });
      return NextResponse.json({ item: material }, { status: 201 });
    }

    if (body.action === "update_material") {
      if (!body.id || !body.title || !body.youtube_id || !body.summary) {
        return NextResponse.json(
          { error: "ID, judul, ID/URL YouTube, dan rangkuman wajib diisi." },
          { status: 400 }
        );
      }
      await updateVideoMaterial({
        id: Number(body.id),
        title: String(body.title),
        category: String(body.category || "Materi Umum"),
        subject: String(body.subject || "Mata Pelajaran"),
        grade_level: String(body.grade_level || "SMA/MA"),
        youtube_id: String(body.youtube_id),
        duration: String(body.duration || "15:00"),
        summary: String(body.summary),
        book_reference: String(body.book_reference || ""),
        is_premium: Boolean(body.is_premium),
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "delete_material") {
      await deleteVideoMaterial(Number(body.id));
      return NextResponse.json({ ok: true });
    }

    if (body.action === "create_question") {
      if (
        !body.package_id ||
        !body.stimulus ||
        !body.statement_1 ||
        !body.statement_2 ||
        !body.statement_3
      ) {
        return NextResponse.json(
          { error: "Paket, wacana stimulus, dan 3 pernyataan wajib diisi." },
          { status: 400 }
        );
      }
      const q = await createTryoutQuestion({
        package_id: Number(body.package_id),
        topic: String(body.topic || "Evaluasi Materi"),
        stimulus: String(body.stimulus),
        statement_1: String(body.statement_1),
        answer_1: Boolean(body.answer_1),
        statement_2: String(body.statement_2),
        answer_2: Boolean(body.answer_2),
        statement_3: String(body.statement_3),
        answer_3: Boolean(body.answer_3),
        explanation: String(body.explanation || ""),
      });
      return NextResponse.json({ item: q }, { status: 201 });
    }

    if (body.action === "update_question") {
      if (
        !body.id ||
        !body.stimulus ||
        !body.statement_1 ||
        !body.statement_2 ||
        !body.statement_3
      ) {
        return NextResponse.json(
          { error: "ID soal, wacana stimulus, dan 3 pernyataan wajib diisi." },
          { status: 400 }
        );
      }
      await updateTryoutQuestion({
        id: Number(body.id),
        package_id: Number(body.package_id),
        topic: String(body.topic || "Evaluasi Materi"),
        stimulus: String(body.stimulus),
        statement_1: String(body.statement_1),
        answer_1: Boolean(body.answer_1),
        statement_2: String(body.statement_2),
        answer_2: Boolean(body.answer_2),
        statement_3: String(body.statement_3),
        answer_3: Boolean(body.answer_3),
        explanation: String(body.explanation || ""),
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "delete_question") {
      await deleteTryoutQuestion(Number(body.id), Number(body.package_id));
      return NextResponse.json({ ok: true });
    }

    if (body.action === "create_package") {
      if (!body.title || !body.level) {
        return NextResponse.json(
          { error: "Judul paket dan jenjang wajib diisi." },
          { status: 400 }
        );
      }
      const pkg = await createTryoutPackage({
        title: String(body.title),
        level: String(body.level) as EducationLevel,
        subject: String(body.subject || ""),
        description: String(body.description || ""),
        duration_minutes: Math.max(5, Number(body.duration_minutes || 30)),
        is_premium: Boolean(body.is_premium),
      });
      return NextResponse.json({ item: pkg }, { status: 201 });
    }

    if (body.action === "update_package") {
      if (!body.id || !body.title || !body.level) {
        return NextResponse.json(
          { error: "ID paket, judul, dan jenjang wajib diisi." },
          { status: 400 }
        );
      }
      await updateTryoutPackage({
        id: Number(body.id),
        title: String(body.title),
        level: String(body.level) as EducationLevel,
        subject: String(body.subject || ""),
        description: String(body.description || ""),
        duration_minutes: Math.max(5, Number(body.duration_minutes || 30)),
        is_premium: Boolean(body.is_premium),
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "delete_package") {
      await deleteTryoutPackage(Number(body.id));
      return NextResponse.json({ ok: true });
    }

    const isCustomBundle = Boolean(body.is_custom_bundle);
    const bundleMatIds = Array.isArray(body.bundle_material_ids)
      ? body.bundle_material_ids.map(Number).filter((n: number) => n > 0)
      : [];
    const bundlePkgIds = Array.isArray(body.bundle_package_ids)
      ? body.bundle_package_ids.map(Number).filter((n: number) => n > 0)
      : [];
    if (
      isCustomBundle &&
      bundleMatIds.length === 0 &&
      bundlePkgIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Untuk Custom Bundle, pilih minimal 1 video materi atau 1 paket tryout.",
        },
        { status: 400 }
      );
    }
    const desc = isCustomBundle
      ? formatCustomBundleDescription(
          String(body.description || ""),
          bundleMatIds,
          bundlePkgIds
        )
      : stripCustomBundleTag(String(body.description || ""));

    const result = await createRedeemCode({
      code: String(body.code || ""),
      plan_name: String(body.plan_name || ""),
      description: desc,
      duration_days: Math.max(1, Number(body.duration_days || 90)),
      quota: Math.max(1, Number(body.quota || 100)),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ item: result.item }, { status: 201 });
  } catch (err) {
    console.error("Admin API error:", err);
    return NextResponse.json(
      { error: "Gagal memproses permintaan admin." },
      { status: 500 }
    );
  }
}
