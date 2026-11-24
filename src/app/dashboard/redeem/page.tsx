"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  KeyRound,
} from "lucide-react";
import type { UserRedemption } from "@/types";

interface RedemptionItem extends UserRedemption {
  target_levels?: string[];
  scope_label?: string;
}

export default function RedeemPage() {
  const router = useRouter();
  const [codeInput, setCodeInput] = useState("");
  const [history, setHistory] = useState<RedemptionItem[]>([]);
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>([]);
  const [scopeLabels, setScopeLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/redeem");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        setUnlockedLevels(data.unlockedLevels || []);
        setScopeLabels(data.scopeLabels || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kode redeem tidak dapat digunakan.");
      } else {
        setSuccess(
          `Berhasil! Paket "${data.redemption.plan_name}" kini aktif.`
        );
        setCodeInput("");
        await loadData();
        router.refresh();
      }
    } catch {
      setError("Terjadi gangguan koneksi saat validasi kode.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Aktivasi Langganan Kode Redeem
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Tukarkan kode voucher dari buku Liniswara untuk membuka seluruh video
          pembelajaran dan simulasi tryout SD/MI, SMP/MTs, SMA/MA, dan SMK/MAK.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* FORM REDEEM */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <KeyRound className="h-5 w-5 text-[#0053FF]" />
            Masukkan Kode Redeem Buku
          </h2>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          <form
            onSubmit={handleRedeem}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="text"
              required
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="Masukkan kode voucher dari buku Anda"
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm font-bold uppercase tracking-wider outline-none focus:border-[#0053FF] focus:ring-2 focus:ring-[#0053FF]/15"
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn-liniswara shrink-0 px-6 py-3"
            >
              {submitting ? "Memproses..." : "Aktifkan Kode"}
            </button>
          </form>

          {/* RIWAYAT AKTIVASI */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Riwayat Aktivasi Akun Anda
              </h3>
              {(scopeLabels.length > 0 || unlockedLevels.length > 0) && (
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#0053FF]">
                  Akses Terbuka:{" "}
                  {scopeLabels.length > 0
                    ? scopeLabels.join(" + ")
                    : unlockedLevels.join(", ")}
                </span>
              )}
            </div>
            {loading ? (
              <p className="mt-3 text-xs text-slate-500">Memuat riwayat...</p>
            ) : history.length === 0 ? (
              <p className="mt-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                Belum ada kode redeem yang pernah ditukarkan pada akun ini.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-[#0053FF]">
                          {item.code}
                        </span>
                        {(item.scope_label ||
                          (item.target_levels &&
                            item.target_levels.length > 0)) && (
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#213A8B]">
                            {item.scope_label ||
                              (item.target_levels?.length === 4
                                ? "Semua Jenjang"
                                : `Jenjang ${item.target_levels?.join(", ")}`)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-slate-600">{item.plan_name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <Clock className="h-3.5 w-3.5" />
                      Aktif s/d{" "}
                      {new Date(item.expires_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PANDUAN AKTIVASI VOUCHER BUKU */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 lg:col-span-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#0053FF]">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Panduan Aktivasi Kode Voucher Buku
              </h2>
              <p className="text-xs text-slate-600">
                Langkah menukarkan kode unik dari buku cetak Liniswara
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-blue-100 bg-white p-3.5">
              <p className="text-xs font-bold text-[#0053FF]">
                1. Temukan Kode di Dalam Buku
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Cek halaman pengantar, segel voucher, atau kartu aktivasi pada
                buku cetak terbitan PT Lini Suara Nusantara yang Anda miliki.
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-3.5">
              <p className="text-xs font-bold text-[#0053FF]">
                2. Masukkan Kode dengan Benar
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Ketik kode voucher pada kolom aktivasi di sebelah kiri tanpa
                spasi tambahan, lalu klik tombol{" "}
                <strong>Aktifkan Kode</strong>.
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-3.5">
              <p className="text-xs font-bold text-[#0053FF]">
                3. Nikmati Materi Video &amp; Bank Soal
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Akses video pembahasan dan paket simulasi tryout sesuai jenjang,
                kelas, jurusan, atau kode program kolaborasi sekolah/MGMP akan
                otomatis terbuka selama masa berlaku paket.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
