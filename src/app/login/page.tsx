"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, ArrowLeft, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitCredentials(targetEmail: string, targetPassword: string) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Email atau kata sandi belum tepat.");
        setLoading(false);
        return;
      }
      if (data.user?.role === "admin") {
        router.push("/dashboard/admin?tab=overview");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Terjadi gangguan koneksi. Silakan coba kembali.");
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitCredentials(email, password);
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
              Portal Belajar &amp; Simulasi Tryout Liniswara
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-blue-50">
              Satu akun untuk belajar video materi, mengaktifkan kode redeem
              buku cetak, dan mengerjakan tryout SD/MI, SMP/MTs, SMA/MA, hingga
              SMK/MAK.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex items-end gap-4">
          <div className="flex-1 rounded-2xl border border-white/25 bg-white/15 p-5 backdrop-blur-md">
            <p className="text-xs font-semibold text-[#FFFD00]">
              Portal Resmi Pendamping Buku
            </p>
            <p className="mt-1 text-xs leading-relaxed text-blue-50">
              Masuk dengan akun Liniswara Anda untuk mengakses simulasi tryout
              diagnostik gratis, materi video pembahasan, dan aktivasi kode
              voucher buku cetak.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mascot-liniswara.png"
            alt="Maskot Liniswara"
            className="animate-float-slow hidden h-20 w-20 shrink-0 object-contain drop-shadow-xl sm:block"
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
            Masuk ke Akun Anda
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Masukkan email dan kata sandi yang sudah terdaftar.
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
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0053FF] focus:ring-2 focus:ring-[#0053FF]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0053FF] focus:ring-2 focus:ring-[#0053FF]/15"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-liniswara w-full py-3"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Sedang Masuk..." : "Masuk Sekarang"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-[#0053FF] underline"
            >
              Daftar peserta baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
