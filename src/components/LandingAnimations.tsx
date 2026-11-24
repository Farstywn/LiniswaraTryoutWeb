"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  variant?: "up" | "zoom";
}

export function Reveal({
  children,
  className = "",
  delayMs = 0,
  variant = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseClass =
    variant === "zoom" ? "reveal-zoom-base" : "reveal-base";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`${baseClass} ${visible ? "reveal-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

const SAMPLE_STATEMENTS = [
  {
    text: "Liniswara menerbitkan 900+ judul buku dari SD sampai SMK.",
    key: true,
  },
  {
    text: "Setiap soal tryout hanya memiliki 1 pilihan tanpa pernyataan B/S.",
    key: false,
  },
  {
    text: "Nilai dan pembahasan langsung tampil setelah selesai dikumpulkan.",
    key: true,
  },
];

export function InteractiveHeroCard() {
  const [picks, setPicks] = useState<Array<boolean | null>>([
    true,
    false,
    null,
  ]);

  function choose(idx: number, val: boolean) {
    setPicks((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }

  const answeredCount = picks.filter((p) => p !== null).length;
  const correctCount = picks.filter(
    (p, idx) => p !== null && p === SAMPLE_STATEMENTS[idx].key
  ).length;

  return (
    <div className="relative rounded-2xl border border-white/70 bg-white/95 p-5 text-slate-900 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:-translate-y-1 sm:p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0053FF]">
            Pratinjau Interaktif Tryout
          </span>
          <h2 className="text-base font-bold text-slate-900">
            1 Soal = 3 Pernyataan Benar/Salah
          </h2>
        </div>
        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0053FF]">
          {correctCount}/3 Tepat
        </span>
      </div>

      <p className="mt-3.5 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-700">
        Coba klik tombol <strong>Benar</strong> atau <strong>Salah</strong> di
        bawah ini untuk merasakan format soal simulasi SD, SMP, SMA &amp; SMK:
      </p>

      <div className="mt-3.5 space-y-2.5 text-xs">
        {SAMPLE_STATEMENTS.map((st, idx) => {
          const picked = picks[idx];
          const isCorrect = picked !== null && picked === st.key;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition-all duration-300 ${
                picked === null
                  ? "border-slate-200 bg-white"
                  : isCorrect
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-rose-200 bg-rose-50/50"
              }`}
            >
              <span className="flex items-start gap-1.5 pr-1 text-slate-700">
                {picked !== null &&
                  (isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                  ))}
                <span>
                  {idx + 1}. {st.text}
                </span>
              </span>

              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => choose(idx, true)}
                  className={`rounded-md px-2.5 py-1 font-bold transition ${
                    picked === true
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700"
                  }`}
                >
                  Benar
                </button>
                <button
                  type="button"
                  onClick={() => choose(idx, false)}
                  className={`rounded-md px-2.5 py-1 font-bold transition ${
                    picked === false
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700"
                  }`}
                >
                  Salah
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-medium text-[#213A8B]">
        <span>
          {answeredCount === 3
            ? `Skor pratinjau: ${Math.round((correctCount / 3) * 100)}/100`
            : "Klik pernyataan #3 untuk melihat skor"}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPicks([null, null, null])}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#0053FF]"
            title="Reset contoh"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <Link href="/login" className="font-bold text-[#0053FF] underline">
            Mulai →
          </Link>
        </div>
      </div>
    </div>
  );
}

const MGMP_LOGOS = [
  { src: "/images/mgmp/MGMP-RPL.png", alt: "MGMP RPL" },
  { src: "/images/mgmp/MGMP-TKJ.png", alt: "MGMP TKJ" },
  { src: "/images/mgmp/MGMP-Akuntansi.png", alt: "MGMP Akuntansi" },
  { src: "/images/mgmp/MGMP-Teknik-Otomotif.png", alt: "MGMP Teknik Otomotif" },
  { src: "/images/mgmp/MGMP-Perhotelan.png", alt: "MGMP Perhotelan" },
  { src: "/images/mgmp/MGMP-PKK.png", alt: "MGMP PKK" },
  {
    src: "/images/mgmp/MGMP-Teknik-Elektronika.png",
    alt: "MGMP Teknik Elektronika",
  },
  { src: "/images/mgmp/MGMP-Tata-Boga.png", alt: "MGMP Tata Boga" },
];

export function MgmpMarquee() {
  return (
    <div className="mgmp-ticker py-2" aria-label="Logo MGMP Mitra Liniswara">
      <div className="mgmp-track items-center gap-10">
        {[...MGMP_LOGOS, ...MGMP_LOGOS].map((logo, idx) => (
          <div
            key={`${logo.alt}-${idx}`}
            className="flex h-20 w-36 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white px-4 py-2 shadow-sm transition hover:scale-105"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-h-14 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
