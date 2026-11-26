"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowLeft, UserPlus } from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";

const SUB_CLASS_OPTIONS: Record<string, string[]> = {
  "SD/MI": [
    "Kelas 1 (Fase A)",
    "Kelas 2 (Fase A)",
    "Kelas 3 (Fase B)",
    "Kelas 4 (Fase B)",
    "Kelas 5 (Fase C)",
    "Kelas 6 (Fase C)",
  ],
  "SMP/MTs": ["Kelas 7", "Kelas 8", "Kelas 9 (Persiapan TKA)"],
  "SMA/MA": [
    "Kelas 10 • Peminatan MIPA",
    "Kelas 10 • Peminatan IPS & Bahasa",
    "Kelas 11 • Peminatan MIPA",
    "Kelas 11 • Peminatan IPS & Bahasa",
    "Kelas 12 (TKA) • Peminatan MIPA",
    "Kelas 12 (TKA) • Peminatan IPS & Bahasa",
  ],
  "SMK/MAK": [
    "Kelas 10 • Teknologi & IT (TJKT/RPL/Otomotif)",
    "Kelas 10 • Bisnis & Pariwisata (Akuntansi/Pemasaran/Hotel)",
    "Kelas 11 • Teknologi & IT (TJKT/RPL/Otomotif)",
    "Kelas 11 • Bisnis & Pariwisata (Akuntansi/Pemasaran/Hotel)",
    "Kelas 12 (TKA) • Teknologi & IT (TJKT/RPL/Otomotif)",
    "Kelas 12 (TKA) • Bisnis & Pariwisata (Akuntansi/Pemasaran/Hotel)",
  ],
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("SD/MI");
  const [subClass, setSubClass] = useState("Kelas 6 (Fase C)");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formattedSchool =
        grade !== "Guru MGMP" && subClass
          ? `${school.trim()} • ${subClass}`
          : school.trim();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          school: formattedSchool,
          grade,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi gangguan koneksi. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-12">
      {/* PANEL BRANDING KIRI DENGAN MOTIF ASLI BG12 LINISWARA + MASKOT FLOATING */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-[#0053FF] p-8 text-white lg:col-span-5 lg:p-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-repeat bg-[length:480px_auto] opacity-90"
          style={{ backgroundImage: "url('/images/bg12.png')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-screen"
          style={{ backgroundImage: "url('/images/auth-motif-blue.jpg')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#0044D6]/40 via-transparent to-[#213A8B]/70"
        />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50 backdrop-blur-sm transition hover:bg-white/20 hover:text-[#FFFD00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          <div className="mt-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-liniswara.png"
              alt="Logo Liniswara"
              className="h-12 w-auto object-contain"
            />
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFFD00]" />
              SD/MI • SMP/MTs • SMA/MA • SMK/MAK
            </div>
            <h1 className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">
              Buat Akun Belajar Gratis Sekarang
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-blue-50">
              Terbuka untuk seluruh siswa <strong>SD/MI</strong>,{" "}
              <strong>SMP/MTs</strong>, <strong>SMA/MA</strong>,{" "}
              <strong>SMK/MAK</strong>, dan Bapak/Ibu Guru mitra MGMP
              Liniswara.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex items-end gap-4">
          <div className="flex-1 space-y-2 rounded-2xl border border-white/25 bg-white/15 p-5 text-xs text-blue-50 backdrop-blur-md">
            <p className="font-bold text-[#FFFD00]">
              Sudah punya buku cetak Liniswara?
            </p>
            <p>
              Setelah mendaftar, Anda bisa langsung memasukkan kode redeem di
              dashboard untuk membuka seluruh video pembahasan dan paket tryout.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mascot-liniswara.png"
            alt="Maskot Liniswara"
            className="animate-float-reverse hidden h-20 w-20 shrink-0 object-contain drop-shadow-xl sm:block"
          />
        </div>
      </div>

      {/* PANEL FORM KANAN DENGAN MOTIF HALUS */}
      <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F0F5FF] via-white to-[#EAF2FF] px-4 py-10 sm:px-8 lg:col-span-7">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: "url('/images/pattern-academic-light.svg')",
          }}
        />
        <div
          aria-hidden="true"
          className="animate-pulse-glow pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0053FF]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-pulse-glow pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#48C0B9]/15 blur-3xl"
        />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-blue-100/90 bg-white/95 p-7 shadow-xl shadow-blue-900/5 backdrop-blur-sm transition-all duration-300 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Pendaftaran Peserta Baru
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Isi data singkat di bawah ini untuk mulai belajar.
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nama Lengkap Siswa / Guru
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kayla Putri"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0053FF] focus:ring-2 focus:ring-[#0053FF]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Email Aktif
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kayla@sekolah.sch.id"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0053FF] focus:ring-2 focus:ring-[#0053FF]/15"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Jenjang Sekolah
                </label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const nextGrade = e.target.value;
                    setGrade(nextGrade);
                    const opts = SUB_CLASS_OPTIONS[nextGrade] || [];
                    setSubClass(opts[0] || "");
                  }}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0053FF]"
                >
                  <option value="SD/MI">SD / MI (Kelas 1–6)</option>
                  <option value="SMP/MTs">SMP / MTs (Kelas 7–9)</option>
                  <option value="SMA/MA">SMA / MA (Kelas 10–12)</option>
                  <option value="SMK/MAK">SMK / MAK (Kelas 10–12)</option>
                  <option value="Guru MGMP">Guru / Pembimbing</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="SDN / SMPN / SMAN / SMKN"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0053FF]"
                />
              </div>
            </div>

            {SUB_CLASS_OPTIONS[grade] && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Kelas / Peminatan / Jurusan
                </label>
                <SearchableSelect
                  value={subClass}
                  onChange={setSubClass}
                  allowCustom={true}
                  customPlaceholder="Contoh: Kelas 5 atau XI Teknik Komputer..."
                  searchPlaceholder="Cari kelas atau jurusan..."
                  options={SUB_CLASS_OPTIONS[grade].map((opt) => ({
                    value: opt,
                    label: opt,
                  }))}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kata Sandi (Minimal 6 karakter)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat kata sandi yang mudah diingat"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0053FF] focus:ring-2 focus:ring-[#0053FF]/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-liniswara w-full py-3"
            >
              <UserPlus className="h-4 w-4" />
              {loading ? "Mendaftarkan..." : "Daftar & Masuk Portal"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-bold text-[#0053FF] underline"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
