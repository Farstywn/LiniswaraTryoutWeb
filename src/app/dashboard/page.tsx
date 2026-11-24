import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpen,
  ClipboardCheck,
  Clock,
  KeyRound,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import {
  getSessionFromCookies,
  isSubscriptionActive,
  toSafeUser,
} from "@/lib/auth";
import {
  checkContentUnlockedWithState,
  findUserById,
  getUserActiveRedemptions,
  listCompletedMaterialIds,
  listTryoutPackages,
  listUserAttempts,
  listVideoMaterials,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const session = getSessionFromCookies();
  const dbUser = session ? await findUserById(session.userId) : null;
  if (!dbUser) return null;

  // Pisahkan dashboard Admin ke ruang manajemen khusus Admin
  if (dbUser.role === "admin") {
    redirect("/dashboard/admin?tab=overview");
  }

  const user = toSafeUser(dbUser);
  const activeSub = isSubscriptionActive(user);
  const isTeacher = user.grade.toLowerCase().includes("guru");

  const [accessInfo, materials, completedIds, packages, attempts] =
    await Promise.all([
      getUserActiveRedemptions(user),
      listVideoMaterials(),
      listCompletedMaterialIds(user.id),
      listTryoutPackages(),
      listUserAttempts(user.id),
    ]);
  const unlockedLevels = accessInfo.unlockedLevels;

  const bestScore =
    attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;
  const materialPercent =
    materials.length > 0
      ? Math.round((completedIds.length / materials.length) * 100)
      : 0;

  const levelPackages = isTeacher
    ? packages
    : packages.filter((p) => p.level === user.grade);
  const recommendedPackages =
    levelPackages.length > 0 ? levelPackages : packages.slice(0, 4);
  const otherPackages = packages.filter(
    (p) => !recommendedPackages.some((rp) => rp.id === p.id)
  );

  const levelMaterials = isTeacher
    ? materials
    : materials.filter((m) => m.grade_level === user.grade);
  const displayMaterials =
    levelMaterials.length > 0 ? levelMaterials : materials.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* BANNER UTAMA SISWA / GURU BERMOTIF & MASKOT */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0053FF] p-6 text-white shadow-lg shadow-blue-600/15 sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-repeat bg-[length:440px_auto] opacity-85"
          style={{ backgroundImage: "url('/images/bg12.png')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0044D6]/65 via-[#0053FF]/40 to-[#213A8B]/75"
        />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-[#FFFD00] backdrop-blur-sm">
              {isTeacher
                ? "Akun Guru / Pembimbing MGMP"
                : `Peserta Jenjang ${user.grade}`}
            </span>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
              Selamat Belajar, {user.name}!
            </h1>
            <p className="mt-1.5 text-sm text-blue-50">
              {user.school} •{" "}
              {isTeacher
                ? "Tinjau materi video dan simulasi soal lintas jenjang SD–SMK untuk mendampingi siswa."
                : "Pantau progres video pembelajaran dan tingkatkan nilai simulasi tryout Anda."}
            </p>

            {/* PROGRESS BAR VIDEO */}
            <div className="mt-5 max-w-md rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Progres Materi Video</span>
                <span className="text-[#FFFD00]">{materialPercent}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#FFFD00] transition-all duration-500"
                  style={{ width: `${materialPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col">
              <Link
                href="/dashboard/tryout"
                className="btn-liniswara-outline text-xs shadow-md"
              >
                Mulai Simulasi Tryout
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!activeSub && (
                <Link
                  href="/dashboard/redeem"
                  className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-white/45 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:border-[#FFFD00] hover:text-[#FFFD00]"
                >
                  <KeyRound className="h-4 w-4 text-[#FFFD00]" />
                  Aktivasi Kode Redeem
                </Link>
              )}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/mascot-liniswara.png"
              alt="Maskot Liniswara"
              className="animate-float-slow hidden h-24 w-24 shrink-0 object-contain drop-shadow-xl xl:block"
            />
          </div>
        </div>
      </div>

      {/* 4 KARTU METRIK RESPONSIF */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-hover rounded-2xl border border-slate-200/80 border-t-4 border-t-[#0053FF] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Materi Video Selesai
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0053FF]">
              <PlayCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {completedIds.length} / {materials.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Modul video SD, SMP, SMA &amp; SMK
          </p>
        </div>

        <div className="card-hover rounded-2xl border border-slate-200/80 border-t-4 border-t-[#48C0B9] bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Paket Tryout Tersedia
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#48C0B9]">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {packages.length} Paket
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Format 10 soal × 3 Benar/Salah
          </p>
        </div>

        <div className="card-hover rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Skor Tryout Terbaik
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {bestScore !== null ? bestScore.toFixed(1) : "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {attempts.length} percobaan diselesaikan
          </p>
        </div>

        <div className="card-hover rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-400 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Status Langganan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-lg font-bold text-slate-900">
            {activeSub ? "Paket Aktif" : "Akun Gratis"}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {accessInfo.scopeLabels.length > 0
              ? accessInfo.scopeLabels.join(" + ")
              : "Tukarkan kode buku untuk akses"}
          </p>
        </div>
      </div>

      {/* GRID KONTEN 2 KOLOM RESPONSIF (MENGISI LAYAR SECARA SEIMBANG) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* KOLOM KIRI: PAKET TRYOUT REKOMENDASI & JENJANG LAIN */}
        <div className="space-y-6 xl:col-span-7">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isTeacher
                    ? "Daftar Paket Simulasi Tryout (SD – SMK)"
                    : `Rekomendasi Simulasi Jenjang ${user.grade}`}
                </h2>
                <p className="text-xs text-slate-500">
                  Setiap paket berisi 10 soal pilihan ganda kompleks (3
                  pernyataan B/S per soal).
                </p>
              </div>
              <Link
                href="/dashboard/tryout"
                className="text-xs font-bold text-[#0053FF] hover:underline"
              >
                Semua Paket →
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {recommendedPackages.map((pkg) => {
                const locked =
                  pkg.is_premium &&
                  !checkContentUnlockedWithState(
                    user,
                    accessInfo.redemptions,
                    pkg.level,
                    `${pkg.subject} ${pkg.title}`,
                    "package",
                    pkg.id
                  );
                return (
                  <div
                    key={pkg.id}
                    className="flex flex-col justify-between rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-4 transition hover:border-[#0053FF]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-[#0053FF]">
                          {pkg.level}
                        </span>
                        <span
                          className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                            pkg.is_premium
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {pkg.is_premium ? "Lanjutan (Redeem)" : "Gratis Uji Coba"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-slate-900">
                        {pkg.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {pkg.subject}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-[11px] font-medium text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <ClipboardCheck className="h-3.5 w-3.5 text-[#0053FF]" />
                          10 Soal (30 B/S)
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#48C0B9]" />
                          {pkg.duration_minutes} Menit
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={
                          locked
                            ? "/dashboard/redeem"
                            : `/dashboard/tryout/${pkg.id}`
                        }
                        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                          locked
                            ? "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                            : "bg-[#0053FF] text-white hover:bg-[#213A8B]"
                        }`}
                      >
                        {locked
                          ? `Buka Paket ${pkg.level} (Redeem)`
                          : pkg.is_premium
                          ? "Kerjakan Sekarang →"
                          : "Mulai Uji Coba Gratis →"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {otherPackages.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-xs font-bold text-slate-700">
                  Paket Jenjang Lainnya:
                </p>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {otherPackages.map((op) => (
                    <Link
                      key={op.id}
                      href="/dashboard/tryout"
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs transition hover:border-[#0053FF] hover:bg-blue-50/40"
                    >
                      <span className="font-bold text-[#0053FF]">
                        {op.level}
                      </span>
                      <p className="mt-0.5 line-clamp-2 font-semibold text-slate-800">
                        {op.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: VIDEO PEMBELAJARAN & AKTIVASI CEPAT */}
        <div className="space-y-6 xl:col-span-5">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Materi Video Pembelajaran
                </h2>
                <p className="text-xs text-slate-500">
                  Video pembahasan konsep &amp; referensi buku Liniswara.
                </p>
              </div>
              <Link
                href="/dashboard/materi"
                className="text-xs font-bold text-[#0053FF] hover:underline"
              >
                Buka Semua →
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {displayMaterials.slice(0, 4).map((m) => {
                const done = completedIds.includes(m.id);
                const matLocked =
                  m.is_premium &&
                  !checkContentUnlockedWithState(
                    user,
                    accessInfo.redemptions,
                    m.grade_level,
                    `${m.category} ${m.subject} ${m.title}`,
                    "material",
                    m.id
                  );
                return (
                  <Link
                    key={m.id}
                    href="/dashboard/materi"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-[#0053FF] hover:bg-blue-50/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0053FF]">
                          {m.grade_level}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {m.duration}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs font-bold text-slate-900">
                        {m.title}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                        done
                          ? "bg-emerald-100 text-emerald-700"
                          : matLocked
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {done
                        ? "Selesai"
                        : matLocked
                        ? "Redeem"
                        : "Tonton"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {!activeSub && (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0053FF] text-[#FFFD00]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Punya Kode Voucher Buku?
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Tukarkan kode voucher unik dari buku cetak Liniswara Anda
                    untuk membuka seluruh video pembahasan dan paket tryout
                    lanjutan.
                  </p>
                  <Link
                    href="/dashboard/redeem"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0053FF] hover:underline"
                  >
                    Tukarkan Kode Sekarang <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
