"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  ClipboardCheck,
  Clock,
  Eye,
  KeyRound,
  Lock,
  Search,
} from "lucide-react";
import type { TryoutAttempt, TryoutPackage } from "@/types";

interface PackageItem extends TryoutPackage {
  locked: boolean;
}

interface AttemptWithPackage extends TryoutAttempt {
  package_title: string;
}

const LEVEL_TABS = ["Semua", "SD/MI", "SMP/MTs", "SMA/MA", "SMK/MAK"];

export default function TryoutCatalogPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptWithPackage[]>([]);
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>([]);
  const [scopeLabels, setScopeLabels] = useState<string[]>([]);
  const [activeSessions, setActiveSessions] = useState<
    Record<number, { answeredCount: number; minutesLeft: number }>
  >({});
  const [filterLevel, setFilterLevel] = useState("Semua");
  const [subFilter, setSubFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/tryout");
        if (res.ok) {
          const data = await res.json();
          const grade = String(data.userGrade || "");
          const loadedPackages: PackageItem[] = data.packages || [];
          const uid: number | null =
            typeof data.userId === "number" ? data.userId : null;
          setPackages(loadedPackages);
          setAttempts(data.attempts || []);
          setUnlockedLevels(data.unlockedLevels || []);
          setScopeLabels(data.scopeLabels || []);
          if (["SD/MI", "SMP/MTs", "SMA/MA", "SMK/MAK"].includes(grade)) {
            setFilterLevel(grade);
          }

          const serverSessions: Record<
            number,
            { answeredCount: number; minutesLeft: number }
          > = {};
          const rawServerSessions = data.activeSessions as
            | Record<
                string,
                { answeredCount?: number; minutesLeft?: number }
              >
            | undefined;
          if (rawServerSessions && typeof rawServerSessions === "object") {
            for (const [pkgIdStr, info] of Object.entries(rawServerSessions)) {
              const idNum = Number(pkgIdStr);
              if (idNum > 0 && info) {
                serverSessions[idNum] = {
                  answeredCount: Number(info.answeredCount || 0),
                  minutesLeft: Math.max(1, Number(info.minutesLeft || 1)),
                };
              }
            }
          }

          if (uid) {
            for (const pkg of loadedPackages) {
              if (serverSessions[pkg.id]) continue;
              try {
                const raw = window.localStorage.getItem(
                  `liniswara_tryout_progress_u${uid}_p${pkg.id}`
                );
                if (!raw) continue;
                const saved = JSON.parse(raw) as {
                  endsAt?: number;
                  answers?: Record<number, (boolean | null)[]>;
                };
                if (typeof saved?.endsAt === "number" && saved.endsAt > Date.now()) {
                  const answeredCount = Object.values(saved.answers || {}).filter(
                    (arr) => Array.isArray(arr) && arr.some((v) => v !== null)
                  ).length;
                  const minutesLeft = Math.max(
                    1,
                    Math.ceil((saved.endsAt - Date.now()) / 60000)
                  );
                  serverSessions[pkg.id] = { answeredCount, minutesLeft };
                }
              } catch {
                // Abaikan jika format storage tidak valid
              }
            }
          }
          setActiveSessions(serverSessions);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const SUB_CHIPS: Record<string, { label: string; keyword: string }[]> = {
    "SD/MI": [
      { label: "Kelas 1–3", keyword: "SD_1_3" },
      { label: "Kelas 4–6", keyword: "SD_4_6" },
      { label: "Bank Soal Akbar (60 Soal)", keyword: "Bank Soal Akbar" },
    ],
    "SMP/MTs": [
      { label: "Kelas 7–8", keyword: "SMP_7_8" },
      { label: "Kelas 9 (TKA)", keyword: "SMP_9" },
      { label: "Bank Soal Akbar (60 Soal)", keyword: "Bank Soal Akbar" },
    ],
    "SMA/MA": [
      { label: "Peminatan MIPA", keyword: "MIPA" },
      { label: "Peminatan IPS & Bahasa", keyword: "IPS" },
      { label: "Bank Soal Akbar (80 Soal)", keyword: "Bank Soal Akbar" },
    ],
    "SMK/MAK": [
      { label: "Teknologi & IT", keyword: "Teknologi" },
      { label: "Bisnis & Pariwisata", keyword: "Bisnis" },
      { label: "Bank Soal Akbar (100 Soal)", keyword: "Bank Soal Akbar" },
    ],
  };

  function matchesSubChip(pkg: PackageItem, chipKey: string): boolean {
    const text = `${pkg.title} ${pkg.subject}`;
    if (chipKey === "SD_1_3") {
      return /Kelas\s+[123](?!–6)\b/i.test(text) || /Fase A\b/i.test(text);
    }
    if (chipKey === "SD_4_6") {
      return /Kelas\s+[456]\b/i.test(text) || /Fase C\b/i.test(text);
    }
    if (chipKey === "SMP_7_8") {
      return /Kelas\s+[78](?!–9)\b/i.test(text);
    }
    if (chipKey === "SMP_9") {
      return /Kelas\s+9\b/i.test(text);
    }
    return text.toLowerCase().includes(chipKey.toLowerCase());
  }

  const levelFiltered =
    filterLevel === "Semua"
      ? packages
      : packages.filter((p) => p.level === filterLevel);

  const filtered = levelFiltered.filter((p) => {
    if (subFilter === "Gratis" && p.is_premium) return false;
    if (subFilter === "Lanjutan" && !p.is_premium) return false;
    if (
      subFilter !== "Semua" &&
      subFilter !== "Gratis" &&
      subFilter !== "Lanjutan" &&
      !matchesSubChip(p, subFilter)
    ) {
      return false;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      p.level.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Simulasi Tryout Online Liniswara
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Setiap jenjang dilengkapi <strong>Tryout Diagnostik Gratis</strong>{" "}
          (uji coba 10 soal × 3 pernyataan B/S) serta{" "}
          <strong>Paket Lanjutan per Kelas &amp; Jurusan</strong> yang terbuka
          via kode redeem buku.
        </p>
      </div>

      {/* FILTER JENJANG */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {LEVEL_TABS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setFilterLevel(lvl);
                  setSubFilter("Semua");
                }}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  filterLevel === lvl
                    ? "bg-[#0053FF] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#0053FF] hover:text-[#0053FF]"
                }`}
              >
                {lvl === "Semua" ? "Semua Jenjang" : lvl}
              </button>
            ))}
          </div>

          {(scopeLabels.length > 0 || unlockedLevels.length > 0) &&
            unlockedLevels.length < 4 && (
              <span className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0053FF]">
                Kode Aktif:{" "}
                {scopeLabels.length > 0
                  ? scopeLabels.join(" + ")
                  : unlockedLevels.join(", ")}
              </span>
            )}
        </div>

        {/* SUB-FILTER AKSES / KELAS / JURUSAN + SEARCH */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500">
              Filter Kelas/Tipe:
            </span>
            {[
              { label: "Semua Paket", value: "Semua" },
              { label: "Gratis (Diagnostic Test)", value: "Gratis" },
              { label: "Lanjutan (Redeem)", value: "Lanjutan" },
              ...(SUB_CHIPS[filterLevel] || []).map((c) => ({
                label: c.label,
                value: c.keyword,
              })),
            ].map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setSubFilter(chip.value)}
                className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                  subFilter === chip.value
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari paket tryout / jurusan..."
              className="w-56 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0053FF]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Memuat paket simulasi tryout...
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((pkg) => (
              <div
                key={pkg.id}
                className="card-hover flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold text-[#0053FF]">
                      {pkg.level}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        pkg.is_premium
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {pkg.is_premium
                        ? "Paket Lanjutan (Redeem)"
                        : "Gratis (Diagnostic Test)"}
                    </span>
                  </div>

                  <h2 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">
                    {pkg.title}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-[#0053FF]">
                    {pkg.subject}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {pkg.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <ClipboardCheck className="h-4 w-4 text-[#0053FF]" />
                      {pkg.question_count} Soal ({pkg.question_count * 3}{" "}
                      Pernyataan B/S)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#48C0B9]" />
                      {pkg.duration_minutes} Menit
                    </span>
                  </div>
                </div>

                  <div className="mt-6">
                  {pkg.locked ? (
                    <Link
                      href="/dashboard/redeem"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
                    >
                      <Lock className="h-4 w-4" />
                      Aktifkan Kode {pkg.level} untuk Membuka
                      <KeyRound className="h-4 w-4" />
                    </Link>
                  ) : activeSessions[pkg.id] ? (
                    <Link
                      href={`/dashboard/tryout/${pkg.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      Lanjutkan Simulasi ({activeSessions[pkg.id].answeredCount}/
                      {pkg.question_count} soal • Sisa ~
                      {activeSessions[pkg.id].minutesLeft} mnt)
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/tryout/${pkg.id}`}
                      className="btn-liniswara w-full py-3"
                    >
                      {pkg.is_premium
                        ? "Buka Paket Simulasi"
                        : "Mulai Uji Coba Gratis"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIWAYAT SKOR DENGAN TOMBOL LIHAT PEMBAHASAN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Award className="h-5 w-5 text-[#0053FF]" />
              Riwayat Nilai Tryout Anda
            </h2>

            {attempts.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">
                Belum ada riwayat nilai. Pilih salah satu paket simulasi di atas
                untuk mulai berlatih.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 pr-4 font-semibold">Paket Tryout</th>
                      <th className="py-2.5 pr-4 font-semibold">Skor</th>
                      <th className="py-2.5 pr-4 font-semibold">
                        Pernyataan Benar
                      </th>
                      <th className="py-2.5 pr-4 font-semibold">
                        Soal Sempurna (3/3)
                      </th>
                      <th className="py-2.5 pr-4 font-semibold">Tanggal</th>
                      <th className="py-2.5 font-semibold">Pembahasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempts.map((att) => (
                      <tr key={att.id}>
                        <td className="py-3 pr-4 font-bold text-slate-900">
                          {att.package_title}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-bold text-emerald-700">
                            {Number(att.score).toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {att.correct_statements} / {att.total_statements}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {att.perfect_questions} soal
                        </td>
                        <td className="py-3 pr-4 text-slate-500">
                          {new Date(att.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3">
                          <Link
                            href={`/dashboard/tryout/${att.package_id}?attemptId=${att.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 font-bold text-[#0053FF] transition hover:bg-[#0053FF] hover:text-white"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Lihat Pembahasan
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
