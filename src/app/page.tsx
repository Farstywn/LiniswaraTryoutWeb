import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
  Mail,
  MapPin,
  PlayCircle,
  UserPlus,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  InteractiveHeroCard,
  MgmpMarquee,
  Reveal,
} from "@/components/LandingAnimations";
import { getSessionFromCookies, toSafeUser } from "@/lib/auth";
import { findUserById } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = getSessionFromCookies();
  const dbUser = session ? await findUserById(session.userId) : null;
  const user = dbUser ? toSafeUser(dbUser) : null;

  const jenjangList = [
    {
      level: "SD / MI",
      badge: "Kelas 1 – 6",
      color: "border-sky-200 bg-white/95",
      tagColor: "bg-sky-100 text-[#0053FF]",
      desc: "Materi cerita, berhitung pecahan, dan latihan soal IPAS dengan bahasa yang ringan dan mudah dipahami anak.",
      tryoutName: "Simulasi SD/MI (Gratis)",
    },
    {
      level: "SMP / MTs",
      badge: "Kelas 7 – 9 (Fase D)",
      color: "border-teal-200 bg-white/95",
      tagColor: "bg-teal-100 text-teal-800",
      desc: "Matematika perbandingan, IPA/IPS, Bahasa, serta Koding & Kecerdasan Artifisial sesuai katalog resmi Liniswara.",
      tryoutName: "Simulasi SMP/MTs (Gratis)",
    },
    {
      level: "SMA / MA",
      badge: "Kelas 10 – 12",
      color: "border-blue-200 bg-white/95",
      tagColor: "bg-blue-100 text-[#213A8B]",
      desc: "Seri SMART STEPS: TKA Bahasa Indonesia, Bahasa Inggris, Matematika, serta Projek IPAS Kurikulum Nasional.",
      tryoutName: "Smart Steps TKA SMA/MA",
    },
    {
      level: "SMK / MAK",
      badge: "Kejuruan & Vokasi",
      color: "border-indigo-200 bg-white/95",
      tagColor: "bg-indigo-100 text-indigo-800",
      desc: "Kreativitas, Inovasi & Kewirausahaan (KIK), Bisnis Digital, Teknik Otomotif, TJKT, Perhotelan & Akuntansi.",
      tryoutName: "Smart Steps TKA SMK/MAK",
    },
  ];

  const pillars = [
    {
      img: "/images/icon-900-judul.png",
      title: "900+ Judul dalam Berbagai Bidang",
      desc: "Koleksi buku teks & nonteks terbitan PT Lini Suara Nusantara dari jenjang SD, SMP, SMA hingga SMK.",
    },
    {
      img: "/images/icon-guru.png",
      title: "Mendukung Guru & Komunitas Belajar",
      desc: "Sinergi bersama 25+ MGMP Jawa Tengah dan Jawa Timur untuk menyusun latihan soal yang tepat sasaran.",
    },
    {
      img: "/images/icon-kurikulum.png",
      title: "Sesuai Kurikulum Nasional & Deep Learning",
      desc: "Materi video & soal TKA dirancang berkesadaran, bermakna, dan menyenangkan bagi peserta didik.",
    },
    {
      img: "/images/icon-kerjasama.png",
      title: "Terhubung dengan Buku Cetak Resmi",
      desc: "Cukup tukarkan kode redeem dari buku cetak Liniswara untuk membuka paket belajar dan tryout lengkap.",
    },
  ];

  return (
    <div id="beranda" className="min-h-screen bg-white text-slate-900">
      <Navbar user={user} />

      {/* HERO SECTION DENGAN MOTIF PENUH BG12 LINISWARA + NEW COVER + MASKOT ANIMASI */}
      <section className="relative overflow-hidden bg-[#0053FF] pt-28 pb-16 text-white lg:pt-36 lg:pb-24">
        {/* Motif Batik Kawung Biru Elektrik Asli liniswara.com penuh di seluruh background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-repeat bg-[length:560px_auto] opacity-95"
          style={{ backgroundImage: "url('/images/bg12.png')" }}
        />
        {/* Layer artwork resmi new-cover di sisi kanan dengan blending halus */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-full bg-cover bg-right bg-no-repeat opacity-25 mix-blend-screen lg:block lg:w-3/4"
          style={{ backgroundImage: "url('/images/new-cover.png')" }}
        />
        {/* Gradasi halus agar teks kiri tetap kontras namun motif tetap hidup terlihat */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#0044D6]/55 via-transparent to-[#213A8B]/65"
        />

        {/* Ornamen cahaya bergerak lembut */}
        <div
          aria-hidden="true"
          className="animate-pulse-glow pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-pulse-glow pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[#FFFD00]/15 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
          <div className="lg:col-span-7">
            <Reveal delayMs={0}>
              <div className="mb-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                <span className="h-2 w-2 animate-ping rounded-full bg-[#FFFD00]" />
                <span>
                  Resmi dari Penerbit Liniswara • SD/MI, SMP/MTs, SMA/MA &amp;
                  SMK/MAK
                </span>
              </div>
            </Reveal>

            <Reveal delayMs={100}>
              <h1 className="text-3xl font-bold leading-snug tracking-tight drop-shadow-sm sm:text-5xl">
                Belajar Mudah Lewat Video &amp;{" "}
                <span className="text-[#FFFD00]">Simulasi Tryout Online</span>{" "}
                dalam Satu Portal
              </h1>
            </Reveal>

            <Reveal delayMs={180}>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-blue-50 sm:text-base">
                Portal pembelajaran pendamping buku terbitan{" "}
                <strong>Liniswara</strong> untuk seluruh pelajar{" "}
                <strong>SD, SMP, SMA, hingga SMK</strong>. Tukarkan kode redeem
                buku Anda, tonton video pembahasan, dan latih soal pilihan ganda
                kompleks Benar/Salah dengan hasil instan.
              </p>
            </Reveal>

            {/* SATU TOMBOL CTA UTAMA SESUAI PERMINTAAN */}
            <Reveal delayMs={250}>
              <div className="mt-8 flex items-center">
                <Link
                  href={user ? "/dashboard/tryout" : "/register"}
                  className="btn-liniswara-outline shadow-xl"
                >
                  {user ? "Buka Simulasi Tryout" : "Mulai Belajar Gratis"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>

            <Reveal delayMs={320}>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/30 pt-6 sm:max-w-md">
                <div className="transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-2xl font-bold text-[#FFFD00]">900+</p>
                  <p className="text-xs text-blue-50">Judul Buku Terbit</p>
                </div>
                <div className="transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-2xl font-bold text-[#FFFD00]">4 Jenjang</p>
                  <p className="text-xs text-blue-50">SD, SMP, SMA, SMK</p>
                </div>
                <div className="transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-2xl font-bold text-[#FFFD00]">10 × 3</p>
                  <p className="text-xs text-blue-50">Soal B/S Terstruktur</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* KARTU INTERAKTIF + MASKOT FLOATING LINISWARA */}
          <div className="relative lg:col-span-5">
            <Reveal variant="zoom" delayMs={200}>
              <div className="relative">
                {/* Maskot resmi 3D Liniswara mengambang di pojok kanan atas kartu */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/mascot-liniswara.png"
                  alt="Maskot Liniswara"
                  className="animate-float-slow pointer-events-none absolute -right-5 -top-12 z-20 hidden h-24 w-24 object-contain drop-shadow-xl sm:block"
                />
                <InteractiveHeroCard />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* KENAPA PILIH LINISWARA (DENGAN ANIMASI STAGGERED ZOOM) */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0053FF]">
              Keunggulan Ekosistem Belajar
            </span>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Kenapa Pilih <span className="text-[#0053FF]">LINISWARA</span>?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Dirancang sederhana dan nyaman digunakan oleh siswa SD, SMP,
              SMA/SMK maupun guru pembimbing di seluruh Indonesia.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((item, idx) => (
            <Reveal key={item.title} variant="zoom" delayMs={idx * 90}>
              <div className="card-hover flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-24 w-24 object-contain transition-transform duration-300 hover:scale-105"
                />
                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MARQUEE KOLABORASI MGMP SEPERTI LINISWARA.COM */}
      <section className="border-y border-slate-100 bg-slate-50/70 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-[#0053FF]">
              Kolaborasi Strategis Bersama 25+ MGMP Mitra
            </p>
          </Reveal>
          <MgmpMarquee />
        </div>
      </section>

      {/* JENJANG PENDIDIKAN LENGKAP (SD, SMP, SMA, SMK) */}
      <section
        id="jenjang"
        className="border-b border-slate-100 bg-[#F6F9FF] py-16"
        style={{
          backgroundImage: "url('/images/pattern-academic-light.svg')",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#0053FF]">
                  Cakupan Kurikulum Nasional
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Materi &amp; Tryout untuk Semua Jenjang Sekolah
                </h2>
              </div>
              <Link
                href={user ? "/dashboard/tryout" : "/register"}
                className="btn-liniswara text-xs"
              >
                Pilih Jenjang di Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {jenjangList.map((j, idx) => (
              <Reveal key={j.level} delayMs={idx * 90}>
                <div
                  className={`card-hover flex h-full flex-col justify-between rounded-2xl border p-6 shadow-sm ${j.color}`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${j.tagColor}`}
                      >
                        {j.level}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {j.badge}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900">
                      {j.tryoutName}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {j.desc}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-slate-200/70 pt-3 text-xs font-semibold text-[#0053FF]">
                    10 Soal × 3 Pernyataan B/S →
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TENTANG LINISWARA & BANNER PENGHARGAAN */}
      <section
        id="tentang"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0053FF]">
                Tentang Kami — liniswara.com
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Wadah Kolaborasi Guru, Penulis &amp; Teknologi Pendidikan
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Sejak 2021, <strong>PT Lini Suara Nusantara (Liniswara)</strong>{" "}
                hadir sebagai wadah kolaborasi strategis yang menghubungkan para
                guru dan praktisi pendidikan. Melalui sinergi bersama{" "}
                <strong className="text-[#0053FF]">
                  25+ Musyawarah Guru Mata Pelajaran (MGMP)
                </strong>{" "}
                di Jawa Timur dan Jawa Tengah, Liniswara telah menerbitkan{" "}
                <strong className="text-[#0053FF]">900+ judul buku</strong>{" "}
                berkualitas untuk jenjang SD, SMP, SMA/MA, SMK/MAK, dan buku
                nonteks literasi.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="card-hover flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-[#0053FF]" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Perpustakaan Nasional RI (2023)
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      Penghargaan Produsen Karya Rekam (Monograf).
                    </p>
                  </div>
                </div>
                <div className="card-hover flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-[#48C0B9]" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Penerbit Terbaik Jateng (2025)
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      Serah Simpan Karya Cetak &amp; Karya Rekam Jawa Tengah.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal variant="zoom" delayMs={120}>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/tentang-peta.png"
                  alt="Sebaran Penerbit Liniswara di Indonesia"
                  className="h-auto w-full rounded-xl object-contain transition-transform duration-500 hover:scale-[1.02]"
                />
                <p className="mt-3 text-center text-xs font-medium text-slate-500">
                  Jangkauan distribusi bahan ajar Liniswara tersebar di berbagai
                  wilayah Indonesia.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CARA MUDAH BELAJAR & KODE REDEEM DEMO */}
      <section
        id="redeem"
        className="border-t border-slate-100 bg-[#F6F9FF] py-16"
        style={{
          backgroundImage: "url('/images/pattern-academic-light.svg')",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0053FF]">
                Langkah Mudah Memulai
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                4 Langkah Simpel untuk Siswa &amp; Guru
              </h2>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: UserPlus,
                step: "Langkah 1",
                title: "Daftar Akun",
                desc: "Pilih jenjang SD/MI, SMP/MTs, SMA/MA, atau SMK/MAK.",
              },
              {
                icon: KeyRound,
                step: "Langkah 2",
                title: "Aktivasi Kode Redeem",
                desc: "Masukkan kode dari buku Liniswara (atau kode uji coba di bawah).",
              },
              {
                icon: PlayCircle,
                step: "Langkah 3",
                title: "Tonton Materi Video",
                desc: "Pahami konsep lewat video pembelajaran dan ringkasan bab.",
              },
              {
                icon: ClipboardCheck,
                step: "Langkah 4",
                title: "Kerjakan Tryout",
                desc: "Jawab 10 soal × 3 pernyataan Benar/Salah dan lihat pembahasan.",
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.step} delayMs={idx * 90}>
                  <div className="card-hover h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0053FF]">
                        {s.step}
                      </span>
                      <Icon className="h-5 w-5 text-[#48C0B9]" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-slate-900">
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {s.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal delayMs={150}>
            <div className="mt-10 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <CheckCircle2 className="h-5 w-5 text-[#0053FF]" />
                    Kode Redeem Resmi untuk Uji Coba Semua Jenjang
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Gunakan salah satu kode berikut di menu{" "}
                    <strong>Aktivasi Kode Redeem</strong> setelah login:
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "LINISWARA-SD2026",
                      "LINISWARA-SMP2026",
                      "LINISWARA-TKA2025",
                      "SMARTSTEPS-SMK",
                      "MGMP-JATENG25",
                    ].map((code) => (
                      <span
                        key={code}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 font-mono text-xs font-bold text-[#0053FF] transition hover:bg-[#0053FF] hover:text-white"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
                  <Link
                    href={user ? "/dashboard/redeem" : "/login"}
                    className="btn-liniswara"
                  >
                    {user ? "Tukarkan Kode" : "Masuk & Coba Sekarang"}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER RESMI #0053FF SEPERTI LINISWARA.COM */}
      <footer className="relative overflow-hidden bg-[#0053FF] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-repeat bg-[length:520px_auto] opacity-40"
          style={{ backgroundImage: "url('/images/bg12.png')" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-liniswara.png"
                alt="Logo Liniswara"
                className="h-12 w-auto object-contain"
              />
              <div className="mt-4 space-y-2.5 text-xs text-blue-50">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FFFD00]" />
                  <span>
                    Perumahan Dukuhan Baru, RT 02 RW 01 Gunungpring, Muntilan,
                    Magelang, Jawa Tengah 56415
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[#FFFD00]" />
                  <span>Support@Liniswara.com</span>
                </p>
              </div>
            </div>

            <div className="md:col-span-3">
              <h3 className="text-sm font-semibold text-white">Informasi</h3>
              <ul className="mt-3 space-y-2 text-xs text-blue-100">
                <li>
                  <a href="#tentang" className="hover:text-[#FFFD00]">
                    Tentang Liniswara
                  </a>
                </li>
                <li>
                  <a href="#jenjang" className="hover:text-[#FFFD00]">
                    Katalog SD, SMP, SMA &amp; SMK
                  </a>
                </li>
                <li>
                  <a href="#redeem" className="hover:text-[#FFFD00]">
                    Panduan Kode Redeem
                  </a>
                </li>
                <li>
                  <a
                    href="https://liniswara.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#FFFD00]"
                  >
                    Website Utama liniswara.com
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <h3 className="text-sm font-semibold text-white">
                Tersedia Buku Resmi
              </h3>
              <p className="mt-2 text-xs text-blue-100">
                Dapatkan buku seri SMART STEPS &amp; bahan ajar Kurikulum
                Nasional melalui toko resmi Liniswara:
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/marketplace.png"
                alt="Marketplace Resmi Liniswara"
                className="mt-3 h-12 w-auto rounded-lg bg-white p-1.5 object-contain transition hover:scale-105"
              />
            </div>
          </div>

          <div className="mt-10 border-t border-white/40 pt-6 text-center text-xs tracking-wide text-blue-100">
            © 2026 PT Lini Suara Nusantara (Liniswara) • Platform Pembelajaran
            &amp; Tryout Online SD, SMP, SMA, SMK
          </div>
        </div>
      </footer>
    </div>
  );
}
