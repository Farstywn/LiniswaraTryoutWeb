"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  KeyRound,
  Lock,
  PlayCircle,
  Search,
} from "lucide-react";

interface EnrichedMaterial {
  id: number;
  title: string;
  category: string;
  subject: string;
  grade_level: string;
  youtube_id: string;
  duration: string;
  summary: string;
  book_reference: string;
  is_premium: boolean;
  locked: boolean;
  completed: boolean;
}

const LEVEL_TABS = ["Semua", "SD/MI", "SMP/MTs", "SMA/MA", "SMK/MAK"];

export default function MateriPage() {
  const [materials, setMaterials] = useState<EnrichedMaterial[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("Semua");
  const [accessFilter, setAccessFilter] = useState<
    "Semua" | "Gratis" | "Lanjutan"
  >("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>([]);
  const [scopeLabels, setScopeLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/materials");
        if (res.ok) {
          const data = await res.json();
          const list: EnrichedMaterial[] = data.materials || [];
          const grade = String(data.userGrade || "");
          setMaterials(list);
          setUnlockedLevels(data.unlockedLevels || []);
          setScopeLabels(data.scopeLabels || []);

          if (["SD/MI", "SMP/MTs", "SMA/MA", "SMK/MAK"].includes(grade)) {
            setFilterLevel(grade);
            const firstMatch = list.find((m) => m.grade_level === grade);
            setSelectedId(firstMatch ? firstMatch.id : list[0]?.id ?? null);
          } else if (list.length > 0) {
            setSelectedId(list[0].id);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const levelFiltered =
    filterLevel === "Semua"
      ? materials
      : materials.filter(
          (m) => m.grade_level === filterLevel || m.grade_level === "Semua Jenjang"
        );

  const filtered = levelFiltered.filter((m) => {
    if (accessFilter === "Gratis" && m.is_premium) return false;
    if (accessFilter === "Lanjutan" && !m.is_premium) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      m.title.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.book_reference.toLowerCase().includes(q)
    );
  });

  const activeMaterial =
    filtered.find((m) => m.id === selectedId) || filtered[0] || null;

  async function toggleCompleted(materialId: number) {
    const res = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId }),
    });
    if (res.ok) {
      const data = await res.json();
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === materialId ? { ...m, completed: Boolean(data.completed) } : m
        )
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Materi Video Pembelajaran
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            1 video pengantar gratis tersedia di tiap jenjang. Aktivasi kode
            redeem untuk membuka seluruh video lanjutan &amp; simulasi tryout.
          </p>
        </div>

        {unlockedLevels.length < 4 && (
          <Link
            href="/dashboard/redeem"
            className="btn-liniswara shrink-0 text-xs"
          >
            <KeyRound className="h-4 w-4" />
            {unlockedLevels.length === 0
              ? "Buka Semua Video (Redeem)"
              : "Redeem Jenjang Lain"}
          </Link>
        )}
      </div>

      {(scopeLabels.length > 0 || unlockedLevels.length > 0) &&
        unlockedLevels.length < 4 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 text-xs text-slate-700">
            <span>
              Akses kode redeem aktif Anda:{" "}
              <strong className="text-[#0053FF]">
                {scopeLabels.length > 0
                  ? scopeLabels.join(" + ")
                  : unlockedLevels.join(", ")}
              </strong>
              . Materi lanjutan di luar cakupan paket tersebut tetap terkunci
              sampai kode buku yang sesuai diaktifkan.
            </span>
            <Link
              href="/dashboard/redeem"
              className="font-bold text-[#0053FF] hover:underline"
            >
              Tambah Kode →
            </Link>
          </div>
        )}

      {/* FILTER JENJANG & TIPE */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {LEVEL_TABS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFilterLevel(lvl)}
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

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari video / kelas / mapel..."
              className="w-52 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0053FF]"
            />
          </div>
          {(["Semua", "Gratis", "Lanjutan"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setAccessFilter(t)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                accessFilter === t
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {t === "Semua"
                ? "Semua Video"
                : t === "Gratis"
                ? "Pengantar Gratis"
                : "Lanjutan (Redeem)"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Memuat modul video pembelajaran...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Belum ada materi video untuk jenjang {filterLevel}.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* PEMUTAR VIDEO */}
          <div className="lg:col-span-8">
            {activeMaterial && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {activeMaterial.locked ? (
                  <div className="flex aspect-video flex-col items-center justify-center bg-[#213A8B] p-6 text-center text-white">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-[#FFFD00]">
                      <Lock className="h-7 w-7" />
                    </div>
                    <h2 className="mt-4 text-lg font-bold">
                      Video Lanjutan Khusus Kode Redeem {activeMaterial.grade_level}
                    </h2>
                    <p className="mt-2 max-w-md text-xs leading-relaxed text-blue-100">
                      {scopeLabels.length > 0 || unlockedLevels.length > 0
                        ? `Akses aktif Anda saat ini mencakup ${
                            scopeLabels.length > 0
                              ? scopeLabels.join(" + ")
                              : unlockedLevels.join(", ")
                          }. Masukkan kode redeem buku ${
                            activeMaterial.grade_level
                          } (${activeMaterial.category}) untuk membuka "${
                            activeMaterial.title
                          }".`
                        : `Tukarkan kode redeem dari buku cetak ${activeMaterial.grade_level} Liniswara untuk membuka materi "${activeMaterial.title}".`}
                    </p>
                    <Link
                      href="/dashboard/redeem"
                      className="btn-liniswara-outline mt-5 text-xs"
                    >
                      <KeyRound className="h-4 w-4" />
                      Masukkan Kode {activeMaterial.grade_level}
                    </Link>
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${activeMaterial.youtube_id}?rel=0`}
                      title={activeMaterial.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-md bg-blue-100 px-2.5 py-1 font-bold text-[#0053FF]">
                        {activeMaterial.grade_level}
                      </span>
                      <span className="rounded-md bg-amber-100 px-2.5 py-1 font-bold text-amber-800">
                        {activeMaterial.category}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                        {activeMaterial.subject}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {activeMaterial.duration}
                      </span>
                    </div>

                    {!activeMaterial.locked && (
                      <button
                        type="button"
                        onClick={() => toggleCompleted(activeMaterial.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                          activeMaterial.completed
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-[#0053FF] text-white hover:bg-[#213A8B]"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {activeMaterial.completed
                          ? "Sudah Dipelajari"
                          : "Tandai Selesai"}
                      </button>
                    )}
                  </div>

                  <h2 className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">
                    {activeMaterial.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {activeMaterial.summary}
                  </p>

                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
                    <BookOpen className="h-4 w-4 text-[#0053FF]" />
                    Referensi Buku: {activeMaterial.book_reference}
                  </div>

                  {/* LANGKAH SELANJUTNYA SETELAH BELAJAR VIDEO */}
                  <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center">
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">
                        {unlockedLevels.includes(activeMaterial.grade_level)
                          ? `Siap menguji pemahaman jenjang ${activeMaterial.grade_level}?`
                          : `Ingin membuka video lanjutan & tryout jenjang ${activeMaterial.grade_level}?`}
                      </p>
                      <p className="text-slate-600">
                        {unlockedLevels.includes(activeMaterial.grade_level)
                          ? "Lanjutkan dengan mengerjakan Simulasi Tryout 10 soal × 3 pernyataan B/S."
                          : `Aktifkan kode redeem buku ${activeMaterial.grade_level} Liniswara Anda sekarang.`}
                      </p>
                    </div>
                    {unlockedLevels.includes(activeMaterial.grade_level) ? (
                      <Link
                        href="/dashboard/tryout"
                        className="btn-liniswara shrink-0 px-4 py-2 text-xs"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        Lanjut ke Simulasi Tryout
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard/redeem"
                        className="btn-liniswara shrink-0 px-4 py-2 text-xs"
                      >
                        <KeyRound className="h-4 w-4" />
                        Aktivasi Kode {activeMaterial.grade_level}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DAFTAR VIDEO */}
          <div className="space-y-3 lg:col-span-4">
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Video ({filtered.length})
            </h3>
            <div className="space-y-2.5">
              {filtered.map((item) => {
                const isSelected = activeMaterial?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-xl border p-3.5 text-left transition ${
                      isSelected
                        ? "border-[#0053FF] bg-blue-50/70 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-[#0053FF]">
                        {item.grade_level} • {item.subject}
                      </span>
                      {item.locked ? (
                        <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                      ) : item.completed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <PlayCircle className="h-4 w-4 shrink-0 text-[#0053FF]" />
                      )}
                    </div>
                    <p className="mt-2 text-xs font-bold leading-snug text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">
                      {item.category}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Durasi {item.duration}</span>
                      <span>
                        {item.is_premium ? "Paket Redeem" : "Pengantar Gratis"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
