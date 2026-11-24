import { hashPassword } from "@/lib/auth";
import { buildAllExtendedQuestions } from "@/lib/seed-data-akbar";
import type {
  RedeemCode,
  TryoutPackage,
  TryoutQuestion,
  User,
  VideoMaterial,
} from "@/types";

export function buildSeedData(): {
  users: User[];
  redeemCodes: RedeemCode[];
  materials: VideoMaterial[];
  packages: TryoutPackage[];
  questions: TryoutQuestion[];
} {
  const nowIso = new Date().toISOString();
  const expires90Days = new Date(
    Date.now() + 90 * 24 * 60 * 60 * 1000
  ).toISOString();

  const users: User[] = [
    {
      id: 1,
      name: "Alya Zahra Putri",
      email: "siswa.sd@liniswara.id",
      password_hash: hashPassword("Siswa123!"),
      role: "student",
      school: "SD Negeri 1 Muntilan",
      grade: "SD/MI",
      subscription_status: "free",
      subscription_plan: null,
      subscription_expires_at: null,
      created_at: nowIso,
    },
    {
      id: 2,
      name: "Rafi Pratama",
      email: "siswa@liniswara.id",
      password_hash: hashPassword("Siswa123!"),
      role: "student",
      school: "SMP Negeri 2 Magelang",
      grade: "SMP/MTs",
      subscription_status: "free",
      subscription_plan: null,
      subscription_expires_at: null,
      created_at: nowIso,
    },
    {
      id: 3,
      name: "Bagas Adi Nugroho",
      email: "premium@liniswara.id",
      password_hash: hashPassword("Premium123!"),
      role: "student",
      school: "SMK Negeri 1 Magelang",
      grade: "SMK/MAK",
      subscription_status: "active",
      subscription_plan: "Paket Kejuruan SMK/MAK & KIK Bisnis Digital (60 Hari)",
      subscription_expires_at: expires90Days,
      created_at: nowIso,
    },
    {
      id: 4,
      name: "Tim Kurikulum Liniswara",
      email: "admin@liniswara.id",
      password_hash: hashPassword("Admin123!"),
      role: "admin",
      school: "PT Lini Suara Nusantara",
      grade: "Administrator Redaksi",
      subscription_status: "active",
      subscription_plan: "Akses Redaksi & MGMP Penuh",
      subscription_expires_at: expires90Days,
      created_at: nowIso,
    },
  ];

  const redeemCodes: RedeemCode[] = [
    {
      id: 1,
      code: "LINISWARA-SD2026",
      plan_name: "Paket Belajar & Bank Soal Akbar SD/MI Lengkap Kelas 1–6 (90 Hari)",
      description:
        "Membuka seluruh video SD Kelas 1–6, 6 paket per kelas, dan Bank Soal Akbar SD/MI (60 Soal B/S).",
      duration_days: 90,
      quota: 500,
      used_count: 11,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 2,
      code: "LINISWARA-SMP2026",
      plan_name: "Paket Belajar & Bank Soal Akbar TKA SMP/MTs Kelas 7–9 (90 Hari)",
      description:
        "Membuka seluruh video SMP Kelas 7–9, paket per kelas, dan Bank Soal Akbar SMP/MTs (60 Soal B/S).",
      duration_days: 90,
      quota: 500,
      used_count: 19,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 3,
      code: "LINISWARA-TKA2025",
      plan_name: "Paket Smart Steps TKA & Bank Soal Akbar SMA/MA MIPA & IPS (90 Hari)",
      description:
        "Membuka seluruh video SMA Kelas 10–12 MIPA/IPS, 6 paket peminatan, dan Bank Soal Akbar SMA/MA (80 Soal B/S).",
      duration_days: 90,
      quota: 500,
      used_count: 24,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 4,
      code: "SMARTSTEPS-SMK",
      plan_name: "Paket Kejuruan & Bank Soal Akbar SMK/MAK Semua Jurusan (60 Hari)",
      description:
        "Membuka seluruh video kejuruan SMK, paket Teknologi/Bisnis, dan Bank Soal Akbar SMK/MAK (100 Soal B/S).",
      duration_days: 60,
      quota: 250,
      used_count: 9,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 5,
      code: "MGMP-JATENG25",
      plan_name: "Program Kolaborasi Guru MGMP Semua Jenjang (120 Hari)",
      description:
        "Voucher resmi guru & sekolah mitra MGMP untuk membuka seluruh jenjang SD–SMK beserta Bank Soal Akbar.",
      duration_days: 120,
      quota: 1000,
      used_count: 42,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 6,
      code: "BUKU-SD-KELAS1",
      plan_name: "Paket Buku Cetak SD/MI Khusus Kelas 1 (90 Hari)",
      description: "Voucher buku cetak pendamping SD/MI Kelas 1 (Fase A).",
      duration_days: 90,
      quota: 300,
      used_count: 4,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 7,
      code: "BUKU-SD-KELAS2",
      plan_name: "Paket Buku Cetak SD/MI Khusus Kelas 2 (90 Hari)",
      description: "Voucher buku cetak pendamping SD/MI Kelas 2 (Fase A).",
      duration_days: 90,
      quota: 300,
      used_count: 3,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 8,
      code: "BUKU-SD-KELAS3",
      plan_name: "Paket Buku Cetak SD/MI Khusus Kelas 3 (90 Hari)",
      description: "Voucher buku cetak pendamping SD/MI Kelas 3 (Fase B).",
      duration_days: 90,
      quota: 300,
      used_count: 5,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 9,
      code: "BUKU-SD-KELAS4",
      plan_name: "Paket Buku Cetak SD/MI Khusus Kelas 4 (90 Hari)",
      description: "Voucher buku cetak IPAS & Numerasi SD/MI Kelas 4 (Fase B).",
      duration_days: 90,
      quota: 300,
      used_count: 6,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 10,
      code: "BUKU-SD-KELAS5",
      plan_name: "Paket Buku Cetak SD/MI Khusus Kelas 5 (90 Hari)",
      description: "Voucher buku cetak Pecahan & IPAS SD/MI Kelas 5 (Fase C).",
      duration_days: 90,
      quota: 300,
      used_count: 7,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 11,
      code: "BUKU-SD-KELAS6",
      plan_name: "Paket Buku Cetak SD/MI Khusus Kelas 6 (90 Hari)",
      description: "Voucher buku cetak AKM & Numerasi SD/MI Kelas 6 (Fase C).",
      duration_days: 90,
      quota: 300,
      used_count: 8,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 12,
      code: "BUKU-SMP-KELAS7",
      plan_name: "Paket Buku Cetak SMP/MTs Khusus Kelas 7 (90 Hari)",
      description: "Voucher buku Matematika & Aljabar SMP/MTs Kelas 7.",
      duration_days: 90,
      quota: 300,
      used_count: 5,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 13,
      code: "BUKU-SMP-KELAS8",
      plan_name: "Paket Buku Cetak SMP/MTs Khusus Kelas 8 (90 Hari)",
      description: "Voucher buku IPA & Teks Berita SMP/MTs Kelas 8.",
      duration_days: 90,
      quota: 300,
      used_count: 4,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 14,
      code: "BUKU-SMP-KELAS9",
      plan_name: "Paket Buku Cetak TKA SMP/MTs Khusus Kelas 9 (90 Hari)",
      description: "Voucher intensif persiapan TKA & Koding AI SMP/MTs Kelas 9.",
      duration_days: 90,
      quota: 300,
      used_count: 9,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 15,
      code: "BUKU-SMA-MIPA",
      plan_name: "Paket Buku Cetak SMA/MA Kelas 10–12 Peminatan MIPA (90 Hari)",
      description: "Voucher khusus peminatan MIPA SMA/MA (Fisika, Kimia, Biologi, Matematika).",
      duration_days: 90,
      quota: 300,
      used_count: 10,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 16,
      code: "BUKU-SMA-IPS",
      plan_name: "Paket Buku Cetak SMA/MA Kelas 10–12 Peminatan IPS & Bahasa (90 Hari)",
      description: "Voucher khusus peminatan IPS & Bahasa SMA/MA (Ekonomi, Geografi, Sosiologi).",
      duration_days: 90,
      quota: 300,
      used_count: 7,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 17,
      code: "BUKU-SMK-TEKNIK",
      plan_name: "Paket Buku Cetak SMK/MAK Kelas 10–12 Jurusan Teknologi & IT (90 Hari)",
      description: "Voucher khusus kejuruan TJKT, RPL, Koding AI, dan Teknik Otomotif SMK.",
      duration_days: 90,
      quota: 300,
      used_count: 6,
      is_active: true,
      created_at: nowIso,
    },
    {
      id: 18,
      code: "BUKU-SMK-BISNIS",
      plan_name: "Paket Buku Cetak SMK/MAK Kelas 10–12 Jurusan Bisnis & Pariwisata (90 Hari)",
      description: "Voucher khusus kejuruan Akuntansi, Bisnis Digital, KIK, Perhotelan & Kuliner SMK.",
      duration_days: 90,
      quota: 300,
      used_count: 5,
      is_active: true,
      created_at: nowIso,
    },
  ];

  const materials: VideoMaterial[] = [
    // ===== SD/MI (KELAS 1 - KELAS 6) =====
    {
      id: 1,
      title: "Bahasa Indonesia SD Kelas 1: Mengenal Bunyi & Membaca Permulaan",
      category: "Kelas 1",
      subject: "Bahasa Indonesia SD",
      grade_level: "SD/MI",
      youtube_id: "puD1GJ9FM40",
      duration: "14:20",
      summary:
        "Video pembelajaran Kurikulum Merdeka SD Kelas 1 untuk mengenal bunyi huruf, suku kata, serta berlatih membaca cerita pendek ramah anak.",
      book_reference: "Buku Bahasa Indonesia SD/MI Kelas 1 — Liniswara",
      is_premium: false,
      order_num: 1,
    },
    {
      id: 2,
      title: "Matematika SD Kelas 2: Membilang Bilangan & Berhitung Dasar",
      category: "Kelas 2",
      subject: "Matematika SD",
      grade_level: "SD/MI",
      youtube_id: "5Zr1fTNUFX0",
      duration: "15:10",
      summary:
        "Materi Matematika SD Kelas 2 Kurikulum Merdeka mengenai membilang angka hingga 50+, penjumlahan bersusun, dan pengenalan nilai rupiah.",
      book_reference: "Buku Matematika SD/MI Kelas 2 — Liniswara",
      is_premium: true,
      order_num: 2,
    },
    {
      id: 9,
      title: "IPAS SD Kelas 3: Siklus Hidup Makhluk Hidup & Perubahan Sekitar",
      category: "Kelas 3",
      subject: "IPAS SD",
      grade_level: "SD/MI",
      youtube_id: "zUXMqG3_m3M",
      duration: "11:45",
      summary:
        "Penjelasan animasi edukatif mengenai siklus hidup hewan dan tumbuhan, metamorfosis, serta pengamatan lingkungan untuk SD Kelas 3.",
      book_reference: "Buku IPAS SD/MI Kelas 3 — Liniswara",
      is_premium: true,
      order_num: 3,
    },
    {
      id: 13,
      title: "IPAS SD Kelas 4: Bagian Tubuh Tumbuhan & Proses Fotosintesis",
      category: "Kelas 4",
      subject: "IPAS SD",
      grade_level: "SD/MI",
      youtube_id: "Ls01pwjTXUw",
      duration: "13:30",
      summary:
        "Membahas fungsi akar, batang, daun, bunga, dan buah pada tumbuhan beserta mekanisme fotosintesis untuk siswa SD/MI Kelas 4.",
      book_reference: "Buku IPAS SD/MI Kelas 4 (Fase B) — Liniswara",
      is_premium: true,
      order_num: 4,
    },
    {
      id: 14,
      title: "Matematika SD Kelas 5: Penjumlahan Pecahan Berbeda Penyebut",
      category: "Kelas 5",
      subject: "Matematika SD",
      grade_level: "SD/MI",
      youtube_id: "TEBWW92GqBY",
      duration: "16:05",
      summary:
        "Panduan langkah demi langkah menyamakan penyebut pecahan dan menyelesaikan soal cerita pecahan serta volume bangun ruang SD Kelas 5.",
      book_reference: "Buku Matematika SD/MI Kelas 5 (Fase C) — Liniswara",
      is_premium: true,
      order_num: 5,
    },
    {
      id: 15,
      title: "AKM Numerasi SD Kelas 6: Urutan Desimal, Pecahan & Persen Diskon",
      category: "Kelas 6",
      subject: "Numerasi AKM SD",
      grade_level: "SD/MI",
      youtube_id: "SX2HX6IMQBk",
      duration: "17:40",
      summary:
        "Pembahasan tuntas soal AKM Numerasi SD Kelas 6 seputar konversi persen, pecahan, desimal, kecepatan tempuh, dan rata-rata nilai.",
      book_reference: "Modul Sukses AKM & Bank Soal SD/MI Kelas 6 — Liniswara",
      is_premium: true,
      order_num: 6,
    },

    // ===== SMP/MTs (KELAS 7 - KELAS 9) =====
    {
      id: 3,
      title: "Matematika SMP Kelas 7: Konsep Dasar Aljabar & Persamaan Linear",
      category: "Kelas 7",
      subject: "Matematika SMP",
      grade_level: "SMP/MTs",
      youtube_id: "xoHt137BXJE",
      duration: "18:25",
      summary:
        "Belajar aljabar SMP Kelas 7 dengan cara seru: mengenal variabel, konstanta, suku sejenis, hingga menyelesaikan soal cerita PLSV.",
      book_reference: "Katalog SMP/MTs: Matematika Kelas 7 — Liniswara",
      is_premium: false,
      order_num: 7,
    },
    {
      id: 10,
      title: "IPA SMP Kelas 8: Sistem Pencernaan & Peredaran Darah Manusia",
      category: "Kelas 8",
      subject: "IPA Terpadu SMP",
      grade_level: "SMP/MTs",
      youtube_id: "-LX14kZUweU",
      duration: "16:50",
      summary:
        "Rangkuman lengkap IPA Kurikulum Merdeka Kelas 8 tentang organ pencernaan, enzim ptialin-pepsin, dan mekanisme peredaran darah.",
      book_reference: "Buku IPA Terpadu SMP/MTs Kelas 8 — Liniswara",
      is_premium: true,
      order_num: 8,
    },
    {
      id: 16,
      title: "Bahasa Indonesia SMP Kelas 8: Bedah Teks Berita & Unsur 5W+1H",
      category: "Kelas 8",
      subject: "Bahasa Indonesia SMP",
      grade_level: "SMP/MTs",
      youtube_id: "tWhL3gbQy2Q",
      duration: "12:15",
      summary:
        "Cara cepat mengidentifikasi unsur ADIKSIMBA (5W+1H), struktur piramida terbalik, dan kaidah kebahasaan teks berita SMP Kelas 8.",
      book_reference: "Buku Bahasa Indonesia SMP/MTs Kelas 8 — Liniswara",
      is_premium: true,
      order_num: 9,
    },
    {
      id: 17,
      title: "Matematika SMP Kelas 9: Teorema Pythagoras & Soal Persiapan TKA",
      category: "Kelas 9 (Persiapan TKA)",
      subject: "Matematika SMP",
      grade_level: "SMP/MTs",
      youtube_id: "JJaptwjRbxc",
      duration: "19:30",
      summary:
        "Menguasai pembuktian tripel Pythagoras, jarak tangga pada dinding, serta penerapan bangun ruang untuk ujian akhir SMP Kelas 9.",
      book_reference: "Buku Persiapan TKA Matematika SMP/MTs Kelas 9 — Liniswara",
      is_premium: true,
      order_num: 10,
    },
    {
      id: 4,
      title: "Koding & Kecerdasan Artifisial SMP: Logika Algoritma & Soal Cerita",
      category: "Kelas 9 (Persiapan TKA)",
      subject: "Informatika SMP",
      grade_level: "SMP/MTs",
      youtube_id: "ZGcAmHpQw10",
      duration: "16:15",
      summary:
        "Pembahasan materi Koding & Kecerdasan Artifisial (AI): berpikir komputasional, logika percabangan IF-AND-ELSE, dan etika dataset AI.",
      book_reference: "Koding dan Kecerdasan Artifisial SMP/MTs — Liniswara",
      is_premium: true,
      order_num: 11,
    },
    {
      id: 18,
      title: "Bahasa Inggris SMP Kelas 9: Announcement, Notice & Functional Text",
      category: "Kelas 9 (Persiapan TKA)",
      subject: "Bahasa Inggris SMP",
      grade_level: "SMP/MTs",
      youtube_id: "C5jjOaPLlGg",
      duration: "13:45",
      summary:
        "Memahami fungsi sosial, struktur teks pengumuman resmi (Announcement Text), dan menjawab pertanyaan Benar/Salah teks Bahasa Inggris.",
      book_reference: "Modul Bahasa Inggris SMP/MTs Kelas 9 — Liniswara",
      is_premium: true,
      order_num: 12,
    },

    // ===== SMA/MA (KELAS 10 - 12 MIPA & IPS) =====
    {
      id: 5,
      title: "Bahasa Indonesia SMA: Teks Argumentasi & Literasi Kritis SNBT/TKA",
      category: "Seluruh Kelas SMA/MA (Kelas 10–12)",
      subject: "Bahasa Indonesia SMA",
      grade_level: "SMA/MA",
      youtube_id: "Nop5TPNdwBg",
      duration: "15:20",
      summary:
        "Video pengantar gratis SMA/MA: memahami struktur teks argumentasi, fakta vs opini, dan strategi menjawab soal literasi membaca TKA/SNBT.",
      book_reference: "SMART STEPS: TKA Bahasa Indonesia SMA/MA — Liniswara",
      is_premium: false,
      order_num: 13,
    },
    {
      id: 6,
      title: "Fisika SMA Kelas 10 MIPA: Hukum I, II, dan III Newton Tentang Gerak",
      category: "Kelas 10 • Peminatan MIPA",
      subject: "Fisika SMA",
      grade_level: "SMA/MA",
      youtube_id: "RKQ4LDHV6KM",
      duration: "18:50",
      summary:
        "Penjelasan lengkap gaya, kelembaman, perhitungan percepatan F = m·a, dan gaya aksi-reaksi pada bidang datar maupun miring.",
      book_reference: "Buku Fisika Peminatan MIPA SMA/MA Kelas 10 — Liniswara",
      is_premium: true,
      order_num: 14,
    },
    {
      id: 19,
      title: "Kimia SMA Kelas 11 MIPA: Konsep Laju Reaksi, Katalis & Energi Aktivasi",
      category: "Kelas 11 • Peminatan MIPA",
      subject: "Kimia SMA",
      grade_level: "SMA/MA",
      youtube_id: "JWRH5mibIws",
      duration: "17:15",
      summary:
        "Membahas faktor penentu laju reaksi (konsentrasi, suhu, luas permukaan, katalis) dan grafik penurunan energi aktivasi.",
      book_reference: "Buku Kimia Peminatan MIPA SMA/MA Kelas 11 — Liniswara",
      is_premium: true,
      order_num: 15,
    },
    {
      id: 20,
      title: "Biologi SMA Kelas 12 MIPA: Pewarisan Sifat & Hukum Mendel",
      category: "Kelas 12 • Peminatan MIPA",
      subject: "Biologi SMA",
      grade_level: "SMA/MA",
      youtube_id: "ouDcvX4fgHw",
      duration: "20:10",
      summary:
        "Pendalaman genetika kelas 12: persilangan monohibrid, dihibrid, dominansi penuh, serta rasio genotipe dan fenotipe F2.",
      book_reference: "SMART STEPS TKA Biologi & Genetika SMA Kelas 12 — Liniswara",
      is_premium: true,
      order_num: 16,
    },
    {
      id: 11,
      title: "Ekonomi SMA Kelas 10 IPS: Hukum Permintaan, Penawaran & Elastisitas",
      category: "Kelas 10 • Peminatan IPS",
      subject: "Ekonomi SMA",
      grade_level: "SMA/MA",
      youtube_id: "JYp70RQnDwM",
      duration: "16:30",
      summary:
        "Menguasai kurva permintaan dan penawaran, harga keseimbangan pasar, serta perbedaan permintaan elastis vs inelastis.",
      book_reference: "Buku Ekonomi Soshum SMA/MA Kelas 10 — Liniswara",
      is_premium: true,
      order_num: 17,
    },
    {
      id: 21,
      title: "Sosiologi & Geografi SMA Kelas 11–12 IPS: Mobilitas Sosial & Lingkungan",
      category: "Kelas 12 • Peminatan IPS",
      subject: "Sosiologi & Geografi SMA",
      grade_level: "SMA/MA",
      youtube_id: "wSzQeHBexDk",
      duration: "19:05",
      summary:
        "Pembahasan mobilitas sosial vertikal naik/turun, saluran mobilitas pendidikan, dan keterkaitannya dengan keanekaragaman hayati serta SIG.",
      book_reference: "SMART STEPS TKA Soshum SMA/MA Kelas 11–12 — Liniswara",
      is_premium: true,
      order_num: 18,
    },

    // ===== SMK/MAK (KELAS 10 - 12 KEJURUAN TEKNOLOGI & BISNIS) =====
    {
      id: 7,
      title: "PKK / KIK SMK Kelas 11: Peluang & Inspirasi Usaha Kreatif Vokasi",
      category: "Seluruh Kelas & Jurusan SMK/MAK (Kelas 10–12)",
      subject: "KIK & Kewirausahaan SMK",
      grade_level: "SMK/MAK",
      youtube_id: "Ar9c2lLU7g4",
      duration: "17:40",
      summary:
        "Video pengantar gratis SMK/MAK: analisis peluang usaha, Business Model Canvas, perhitungan Break Even Point (BEP), dan analisis SWOT.",
      book_reference: "SMART STEPS: TKA KIK Untuk Siswa SMA-MA/SMK-MAK — Liniswara",
      is_premium: false,
      order_num: 19,
    },
    {
      id: 8,
      title: "SMK TKJ Kelas 11–12: Subnetting IP Address & Topologi Jaringan",
      category: "Kelas 10–12 • Jurusan Teknologi & IT",
      subject: "TJKT & Jaringan SMK",
      grade_level: "SMK/MAK",
      youtube_id: "l5vLxYrZAgA",
      duration: "21:20",
      summary:
        "Tutorial bahasa Indonesia langkah demi langkah menghitung subnetting IPv4 /24 hingga /30, Network ID, Broadcast, dan konfigurasi VLAN.",
      book_reference: "Modul Kejuruan TJKT & Infrastruktur Jaringan SMK — Liniswara",
      is_premium: true,
      order_num: 20,
    },
    {
      id: 22,
      title: "SMK RPL Kelas 10–12: Belajar Basis Data Relasional & SQL MySQL",
      category: "Kelas 10–12 • Jurusan Teknologi & IT",
      subject: "RPL & Pemrograman SMK",
      grade_level: "SMK/MAK",
      youtube_id: "S4igMZFCvh8",
      duration: "24:10",
      summary:
        "Belajar perancangan tabel database, Primary Key, Foreign Key, kueri SQL relasional, dan keamanan dari celah SQL Injection.",
      book_reference: "Buku Basis Data & Rekayasa Perangkat Lunak SMK — Liniswara",
      is_premium: true,
      order_num: 21,
    },
    {
      id: 23,
      title: "SMK Teknik Otomotif: Cara Kerja Sistem Injeksi EFI & Sensor ECU",
      category: "Kelas 10–12 • Jurusan Teknologi & IT",
      subject: "Teknik Otomotif SMK",
      grade_level: "SMK/MAK",
      youtube_id: "XtR0AHOjF7I",
      duration: "18:00",
      summary:
        "Pembahasan komponen sistem Electronic Fuel Injection (EFI), fungsi ECU, sensor oksigen, injector, dan standar K3 bengkel otomotif.",
      book_reference: "Buku Dasar-Dasar Teknik Otomotif Kurikulum Merdeka — Liniswara",
      is_premium: true,
      order_num: 22,
    },
    {
      id: 12,
      title: "SMK Akuntansi Kelas 10–12: Persamaan Dasar Akuntansi & Piutang",
      category: "Kelas 10–12 • Jurusan Bisnis & Pariwisata",
      subject: "Akuntansi Keuangan SMK",
      grade_level: "SMK/MAK",
      youtube_id: "d982EK-lC0o",
      duration: "19:30",
      summary:
        "Penjelasan komprehensif persamaan Aset = Liabilitas + Ekuitas, pencatatan transaksi kas & peralatan, hingga syarat kredit 2/10 n/30.",
      book_reference: "Praktikum Akuntansi Perusahaan Jasa & Dagang SMK — Liniswara",
      is_premium: true,
      order_num: 23,
    },
    {
      id: 24,
      title: "Geografi & Pariwisata Indonesia: Keanekaragaman Hayati & SIG Lanjut",
      category: "Kelas 10–12 • Jurusan Bisnis & Pariwisata",
      subject: "Pariwisata & Geografi",
      grade_level: "SMK/MAK",
      youtube_id: "pOu3zFK97GQ",
      duration: "14:50",
      summary:
        "Materi pendukung bidang Perhotelan, Pariwisata, dan Geografi tentang potensi flora-fauna Nusantara serta pemetaan destinasi berbasis SIG.",
      book_reference: "Buku Kejuruan Usaha Layanan Pariwisata & Geografi — Liniswara",
      is_premium: true,
      order_num: 24,
    },
  ];

  const packages: TryoutPackage[] = [
    // ===== 4 PAKET DIAGNOSTIC TEST GRATIS (10 SOAL) =====
    {
      id: 1,
      slug: "tryout-sd-mi-literasi-numerasi",
      title: "Tryout Diagnostik Gratis SD/MI (Kelas 1–6) — Literasi & Numerasi Dasar",
      level: "SD/MI",
      subject: "Kelas 1–6 (Diagnostik Gratis) • Bahasa Indonesia, Matematika & IPAS",
      description:
        "Uji coba gratis untuk seluruh peserta terdaftar! 10 soal pilihan ganda kompleks (3 pernyataan Benar/Salah per soal) ramah siswa SD/MI.",
      duration_minutes: 25,
      question_count: 10,
      is_premium: false,
    },
    {
      id: 2,
      slug: "tryout-smp-mts-matematika-koding",
      title: "Tryout Diagnostik Gratis SMP/MTs (Kelas 7–9) — Literasi & Penalaran Fase D",
      level: "SMP/MTs",
      subject: "Kelas 7–9 (Diagnostik Gratis) • Matematika, IPS, Bahasa & Koding AI",
      description:
        "Diagnostic test gratis bagi akun baru SMP/MTs. Simulasi 10 soal × 3 pernyataan B/S sebelum membuka paket Kelas 7, 8, 9 & Bank Soal Akbar.",
      duration_minutes: 30,
      question_count: 10,
      is_premium: false,
    },
    {
      id: 3,
      slug: "smart-steps-tka-sma-ma",
      title: "Tryout Diagnostik Gratis SMA/MA (Kelas 10–12) — TPS, Literasi & Inggris",
      level: "SMA/MA",
      subject: "Kelas 10–12 (Diagnostik Gratis) • TPS, Literasi Bahasa & Numerasi",
      description:
        "Uji coba gratis seri SMART STEPS: TKA untuk jenjang SMA/MA (10 soal × 3 B/S) dengan pembahasan langsung tiap pernyataan.",
      duration_minutes: 30,
      question_count: 10,
      is_premium: false,
    },
    {
      id: 4,
      slug: "smart-steps-tka-smk-mak",
      title: "Tryout Diagnostik Gratis SMK/MAK (Kelas 10–12) — KIK & Literasi Vokasi",
      level: "SMK/MAK",
      subject: "Kelas 10–12 (Diagnostik Gratis) • KIK, Numerasi & Studi Kasus Vokasi",
      description:
        "Uji coba gratis pelajar SMK/MAK seluruh jurusan (10 soal × 3 B/S) meliputi KIK usaha, keselamatan kerja, dan literasi industri.",
      duration_minutes: 30,
      question_count: 10,
      is_premium: false,
    },

    // ===== 6 PAKET LANJUTAN SD/MI PER KELAS (KELAS 1 - KELAS 6) =====
    {
      id: 5,
      slug: "lanjutan-sd-kelas-1",
      title: "Paket SD/MI Kelas 1 (Fase A) — Membaca Permulaan & Berhitung",
      level: "SD/MI",
      subject: "Kelas 1 (Fase A) • Bahasa Indonesia & Penjumlahan Pengurangan",
      description:
        "Khusus siswa SD/MI Kelas 1 (Kode BUKU-SD-KELAS1 atau LINISWARA-SD2026). 10 soal cerita bergambar ramah anak usia kelas 1.",
      duration_minutes: 25,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 6,
      slug: "lanjutan-sd-kelas-2",
      title: "Paket SD/MI Kelas 2 (Fase A) — Perkalian Dasar & Nilai Uang Rupiah",
      level: "SD/MI",
      subject: "Kelas 2 (Fase A) • Matematika Berhitung & Literasi Lingkungan",
      description:
        "Khusus siswa SD/MI Kelas 2 (Kode BUKU-SD-KELAS2 atau LINISWARA-SD2026). Melatih perkalian sederhana dan transaksi uang koperasi sekolah.",
      duration_minutes: 25,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 7,
      slug: "lanjutan-sd-kelas-3",
      title: "Paket SD/MI Kelas 3 (Fase B) — Satuan Panjang, Pecahan & Siklus Hidup",
      level: "SD/MI",
      subject: "Kelas 3 (Fase B) • IPAS, Meter-Sentimeter & Pecahan Dasar",
      description:
        "Khusus siswa SD/MI Kelas 3 (Kode BUKU-SD-KELAS3 atau LINISWARA-SD2026). Memuat soal satuan panjang meter/cm, pecahan kue, dan metamorfosis.",
      duration_minutes: 25,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 8,
      slug: "lanjutan-sd-kelas-4",
      title: "Paket SD/MI Kelas 4 (Fase B) — Luas Keliling & Bagian Tubuh Tumbuhan",
      level: "SD/MI",
      subject: "Kelas 4 (Fase B) • Matematika Geometri & IPAS Tumbuhan",
      description:
        "Khusus siswa SD/MI Kelas 4 (Kode BUKU-SD-KELAS4 atau LINISWARA-SD2026). Soal luas/keliling persegi panjang serta fungsi akar & daun fotosintesis.",
      duration_minutes: 30,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 9,
      slug: "lanjutan-sd-kelas-5",
      title: "Paket SD/MI Kelas 5 (Fase C) — Volume Balok, Persen & Rantai Makanan",
      level: "SD/MI",
      subject: "Kelas 5 (Fase C) • Matematika Volume/Persen & Ekosistem IPAS",
      description:
        "Khusus siswa SD/MI Kelas 5 (Kode BUKU-SD-KELAS5 atau LINISWARA-SD2026). Melatih hitung liter akuarium, diskon 20%, dan rantai makanan sawah.",
      duration_minutes: 30,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 10,
      slug: "lanjutan-sd-kelas-6",
      title: "Paket SD/MI Kelas 6 (Fase C) — Persiapan AKM Numerasi, Kecepatan & Tata Surya",
      level: "SD/MI",
      subject: "Kelas 6 (Fase C) • AKM Numerasi, Kecepatan & IPA Tata Surya",
      description:
        "Khusus siswa SD/MI Kelas 6 (Kode BUKU-SD-KELAS6 atau LINISWARA-SD2026). Fokus soal jarak-waktu, rata-rata data nilai, dan tata surya.",
      duration_minutes: 30,
      question_count: 10,
      is_premium: true,
    },

    // ===== 3 PAKET LANJUTAN SMP/MTs PER KELAS (KELAS 7 - KELAS 9) =====
    {
      id: 11,
      slug: "lanjutan-smp-kelas-7",
      title: "Paket SMP/MTs Kelas 7 (Fase D) — Aljabar PLSV, Himpunan & Aritmetika Sosial",
      level: "SMP/MTs",
      subject: "Kelas 7 (Fase D) • Matematika Aljabar, Bunga Tabungan & IPA Kalor",
      description:
        "Khusus SMP/MTs Kelas 7 (Kode BUKU-SMP-KELAS7 atau LINISWARA-SMP2026). Soal persamaan linear, diagram Venn, suhu kalor, dan teks deskripsi.",
      duration_minutes: 30,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 12,
      slug: "lanjutan-smp-kelas-8",
      title: "Paket SMP/MTs Kelas 8 (Fase D) — Pythagoras, Pencernaan & Teks Berita",
      level: "SMP/MTs",
      subject: "Kelas 8 (Fase D) • Pythagoras, Sistem Pencernaan & Bahasa 5W+1H",
      description:
        "Khusus SMP/MTs Kelas 8 (Kode BUKU-SMP-KELAS8 atau LINISWARA-SMP2026). Menguji teorema Pythagoras, enzim pencernaan, dan berita 5W+1H.",
      duration_minutes: 30,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 13,
      slug: "lanjutan-smp-kelas-9",
      title: "Paket SMP/MTs Kelas 9 — Persiapan TKA, Ekspor IPS & Koding AI",
      level: "SMP/MTs",
      subject: "Kelas 9 (Persiapan TKA) • Peluang, Ekspor-Impor & Koding AI",
      description:
        "Khusus SMP/MTs Kelas 9 (Kode BUKU-SMP-KELAS9 atau LINISWARA-SMP2026). Simulasi TKA menghadapi ujian akhir SMP, logika AI, dan peluang.",
      duration_minutes: 35,
      question_count: 10,
      is_premium: true,
    },

    // ===== 6 PAKET LANJUTAN SMA/MA PER KELAS & PEMINATAN =====
    {
      id: 14,
      slug: "lanjutan-sma-kelas-10-mipa",
      title: "Paket SMA/MA Kelas 10 Peminatan MIPA — Hukum Newton, Kimia & Fungsi",
      level: "SMA/MA",
      subject: "Kelas 10 • Peminatan MIPA (Matematika, Fisika Newton & Kimia Dasar)",
      description:
        "Paket SMA/MA Kelas 10 jalur Saintek/MIPA (Kode BUKU-SMA-MIPA atau LINISWARA-TKA2025). 10 soal analitik × 3 pernyataan B/S.",
      duration_minutes: 35,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 15,
      slug: "lanjutan-sma-kelas-10-ips",
      title: "Paket SMA/MA Kelas 10 Peminatan IPS — Permintaan, SIG & Sosiologi",
      level: "SMA/MA",
      subject: "Kelas 10 • Peminatan IPS & Bahasa (Ekonomi Mikro, Geografi & Sosiologi)",
      description:
        "Paket SMA/MA Kelas 10 jalur Soshum/IPS (Kode BUKU-SMA-IPS atau LINISWARA-TKA2025). Menguji kurva ekonomi, dasar SIG, dan mobilitas sosial.",
      duration_minutes: 35,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 16,
      slug: "lanjutan-sma-kelas-11-mipa",
      title: "Paket SMA/MA Kelas 11 Peminatan MIPA — Turunan, Laju Reaksi & Biologi",
      level: "SMA/MA",
      subject: "Kelas 11 • Peminatan MIPA (Kalkulus Turunan, Katalis & Mitosis)",
      description:
        "Paket SMA/MA Kelas 11 jalur MIPA (Kode BUKU-SMA-MIPA atau LINISWARA-TKA2025). Soal optimasi fungsi kuadrat, laju reaksi kimia, dan biologi sel.",
      duration_minutes: 35,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 17,
      slug: "lanjutan-sma-kelas-11-ips",
      title: "Paket SMA/MA Kelas 11 Peminatan IPS — Kebijakan Moneter, Demografi & Sejarah",
      level: "SMA/MA",
      subject: "Kelas 11 • Peminatan IPS & Bahasa (Bank Sentral, Demografi & Heuristik)",
      description:
        "Paket SMA/MA Kelas 11 jalur IPS (Kode BUKU-SMA-IPS atau LINISWARA-TKA2025). Soal inflasi/moneter BI, bonus demografi, dan metode sejarah.",
      duration_minutes: 35,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 18,
      slug: "lanjutan-sma-kelas-12-mipa",
      title: "Paket SMA/MA Kelas 12 Peminatan MIPA — Intensif TKA Saintek & Genetika",
      level: "SMA/MA",
      subject: "Kelas 12 (TKA) • Peminatan MIPA (Genetika Mendel, Fisika & Eksponensial)",
      description:
        "Simulasi akhir Kelas 12 jalur MIPA (Kode BUKU-SMA-MIPA atau LINISWARA-TKA2025) berbasis standar TKA & SNBT Saintek.",
      duration_minutes: 35,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 19,
      slug: "lanjutan-sma-kelas-12-ips",
      title: "Paket SMA/MA Kelas 12 Peminatan IPS — Intensif TKA Soshum & Literasi SNBT",
      level: "SMA/MA",
      subject: "Kelas 12 (TKA) • Peminatan IPS & Bahasa (Silogisme SNBT, SIG & Ekonomi)",
      description:
        "Simulasi akhir Kelas 12 jalur IPS & Bahasa (Kode BUKU-SMA-IPS atau LINISWARA-TKA2025) menghadapi TKA & SNBT Soshum.",
      duration_minutes: 35,
      question_count: 10,
      is_premium: true,
    },

    // ===== 2 PAKET LANJUTAN SMK/MAK PER JURUSAN =====
    {
      id: 20,
      slug: "lanjutan-smk-teknologi-it",
      title: "Paket SMK/MAK Kelas 10–12 Jurusan Teknologi & IT — TJKT, RPL & Otomotif",
      level: "SMK/MAK",
      subject: "Kelas 10–12 • Jurusan Teknologi & IT (TJKT, RPL, Koding AI, Otomotif)",
      description:
        "Paket kejuruan teknologi SMK/MAK (Kode BUKU-SMK-TEKNIK atau SMARTSTEPS-SMK). Subnetting IPv4, SQL Injection, EFI otomotif, dan Hukum Ohm LED.",
      duration_minutes: 35,
      question_count: 10,
      is_premium: true,
    },
    {
      id: 21,
      slug: "lanjutan-smk-bisnis-pariwisata",
      title: "Paket SMK/MAK Kelas 10–12 Jurusan Bisnis & Pariwisata — Akuntansi & Kuliner",
      level: "SMK/MAK",
      subject: "Kelas 10–12 • Jurusan Bisnis & Pariwisata (Akuntansi, Pemasaran, Perhotelan)",
      description:
        "Paket kejuruan bisnis & pariwisata SMK/MAK (Kode BUKU-SMK-BISNIS atau SMARTSTEPS-SMK). BEP usaha, akuntansi, ROAS iklan, guest folio, dan HACCP.",
      duration_minutes: 35,
      question_count: 10,
      is_premium: true,
    },

    // ===== 4 PAKET BANK SOAL AKBAR PEMBELIAN BUKU CETAK (60 - 100 SOAL!) =====
    {
      id: 22,
      slug: "bank-soal-akbar-buku-sd-mi-60",
      title: "Bank Soal Akbar Buku Cetak SD/MI (60 Soal Komprehensif Kelas 1–6)",
      level: "SD/MI",
      subject: "Bank Soal Akbar Buku (Kelas 1–6) • 60 Soal Literasi, Numerasi & IPAS",
      description:
        "Paket spesial pembeli buku cetak SD/MI (Kode LINISWARA-SD2026). Berisi 60 soal lengkap (180 pernyataan B/S) dari Kelas 1 hingga Kelas 6.",
      duration_minutes: 90,
      question_count: 60,
      is_premium: true,
    },
    {
      id: 23,
      slug: "bank-soal-akbar-buku-smp-mts-60",
      title: "Bank Soal Akbar Buku Cetak TKA SMP/MTs (60 Soal Komprehensif Kelas 7–9)",
      level: "SMP/MTs",
      subject: "Bank Soal Akbar Buku (Kelas 7–9) • 60 Soal Matematika, IPA, IPS & AI",
      description:
        "Paket spesial pembeli buku cetak SMP/MTs (Kode LINISWARA-SMP2026). Berisi 60 soal TKA lengkap (180 pernyataan B/S) Kelas 7, 8, dan 9.",
      duration_minutes: 90,
      question_count: 60,
      is_premium: true,
    },
    {
      id: 24,
      slug: "bank-soal-akbar-buku-sma-ma-80",
      title: "Bank Soal Akbar Buku SMART STEPS TKA SMA/MA (80 Soal MIPA, IPS & SNBT)",
      level: "SMA/MA",
      subject: "Bank Soal Akbar Buku (Kelas 10–12) • 80 Soal Peminatan MIPA, IPS & TPS",
      description:
        "Bank soal akbar khusus pembeli buku SMART STEPS SMA/MA (Kode LINISWARA-TKA2025). Berisi 80 soal intensif (240 pernyataan B/S) siap ujian.",
      duration_minutes: 120,
      question_count: 80,
      is_premium: true,
    },
    {
      id: 25,
      slug: "bank-soal-akbar-buku-smk-mak-100",
      title: "Bank Soal Akbar Buku SMART STEPS TKA SMK/MAK (100 Soal KIK & Semua Jurusan)",
      level: "SMK/MAK",
      subject: "Bank Soal Akbar Buku (Kelas 10–12) • 100 Soal Teknologi, Bisnis & KIK",
      description:
        "Bank soal akbar terlengkap 100 soal (300 pernyataan B/S) untuk pembeli buku cetak SMK/MAK (Kode SMARTSTEPS-SMK) mencakup semua kompetensi kejuruan.",
      duration_minutes: 120,
      question_count: 100,
      is_premium: true,
    },
  ];

  const questions: TryoutQuestion[] = [
    // ================= PAKET 1: SD/MI (10 SOAL x 3 PERNYATAAN B/S) =================
    {
      id: 1,
      package_id: 1,
      question_number: 1,
      topic: "Membaca Cerita Anak",
      stimulus:
        "Pagi ini Siti dan adik perempuannya yang bernama Lani menanam dua pot bunga matahari di halaman rumah. Setiap hari pukul 07.00 pagi, mereka bergantian menyiram tanaman itu dengan satu gayung air agar tumbuh subur. Dua minggu kemudian, tunas hijau mulai muncul dari dalam tanah.",
      statement_1:
        "Siti menanam bunga matahari bersama adik perempuannya, Lani.",
      answer_1: true,
      statement_2:
        "Mereka menyiram tanaman setiap malam hari pukul 21.00.",
      answer_2: false,
      statement_3:
        "Tunas hijau mulai muncul setelah dua minggu disiram setiap pagi.",
      answer_3: true,
      explanation:
        "Pernyataan 1 benar (Siti dan Lani menanam bunga matahari). Pernyataan 2 salah karena mereka menyiram pukul 07.00 pagi, bukan 21.00 malam. Pernyataan 3 benar sesuai kalimat terakhir.",
    },
    {
      id: 2,
      package_id: 1,
      question_number: 2,
      topic: "Berhitung Belanja Sekolah",
      stimulus:
        "Budi membawa uang Rp20.000,00 ke koperasi sekolah. Ia membeli 2 buah buku tulis seharga Rp4.500,00 per buku dan 1 buah pensil seharga Rp3.000,00. Sisa uangnya ia masukkan ke dalam celengan di rumah.",
      statement_1:
        "Harga 2 buah buku tulis yang dibeli Budi adalah Rp9.000,00.",
      answer_1: true,
      statement_2:
        "Total seluruh belanjaan Budi di koperasi adalah Rp12.000,00.",
      answer_2: true,
      statement_3:
        "Sisa uang kembalian yang dibawa pulang Budi adalah Rp10.000,00.",
      answer_3: false,
      explanation:
        "2 buku × Rp4.500 = Rp9.000 (Benar). Total belanja = Rp9.000 + Rp3.000 = Rp12.000 (Benar). Sisa uang = Rp20.000 - Rp12.000 = Rp8.000, bukan Rp10.000 (Salah).",
    },
    {
      id: 3,
      package_id: 1,
      question_number: 3,
      topic: "Mengenal Tumbuhan & Energi",
      stimulus:
        "Tumbuhan hijau membuat makanannya sendiri melalui proses fotosintesis pada bagian daun. Untuk melakukan fotosintesis, tumbuhan memerlukan cahaya matahari, air yang diserap akar dari dalam tanah, dan gas karbon dioksida dari udara. Hasil dari proses ini adalah makanan bagi tumbuhan serta gas oksigen yang sangat dibutuhkan manusia untuk bernapas.",
      statement_1:
        "Proses pembuatan makanan pada tumbuhan hijau disebut fotosintesis.",
      answer_1: true,
      statement_2:
        "Tumbuhan menyerap air dari dalam tanah melalui bagian daunnya.",
      answer_2: false,
      statement_3:
        "Salah satu hasil fotosintesis adalah gas oksigen untuk bernapas manusia.",
      answer_3: true,
      explanation:
        "Pernyataan 1 dan 3 sesuai bacaan. Pernyataan 2 salah karena air diserap oleh akar dari dalam tanah, bukan oleh daun.",
    },
    {
      id: 4,
      package_id: 1,
      question_number: 4,
      topic: "Pecahan & Pembagian Kue",
      stimulus:
        "Ibu memotong sebuah kue bolu menjadi 8 bagian yang sama besar. Rani memakan 2 potong kue, adiknya memakan 3 potong kue, dan sisanya disimpan di dalam kulkas untuk ayah yang pulang bekerja sore nanti.",
      statement_1:
        "Bagian kue yang dimakan Rani dapat ditulis sebagai pecahan 2/8 atau 1/4 bagian.",
      answer_1: true,
      statement_2:
        "Jumlah kue yang dimakan Rani dan adiknya seluruhnya ada 5 potong.",
      answer_2: true,
      statement_3:
        "Sisa kue yang disimpan di kulkas untuk ayah ada 4 potong.",
      answer_3: false,
      explanation:
        "Rani makan 2/8 = 1/4 (Benar). Total dimakan = 2 + 3 = 5 potong (Benar). Sisa kue = 8 - 5 = 3 potong, bukan 4 potong (Salah).",
    },
    {
      id: 5,
      package_id: 1,
      question_number: 5,
      topic: "Kebersamaan di Kelas",
      stimulus:
        "Setiap hari Jumat pagi, seluruh siswa kelas 5 melaksanakan kegiatan 'Jumat Bersih' selama 30 menit sebelum pelajaran dimulai. Kelompok 1 bertugas menyapu lantai kelas, kelompok 2 mengelap kaca jendela, dan kelompok 3 merapikan rak buku bacaan di pojok literasi.",
      statement_1:
        "Kegiatan Jumat Bersih dilaksanakan setelah jam pulang sekolah.",
      answer_1: false,
      statement_2:
        "Lama waktu kegiatan Jumat Bersih adalah setengah jam (30 menit).",
      answer_2: true,
      statement_3:
        "Kelompok 3 bertugas merapikan rak buku bacaan di pojok literasi.",
      answer_3: true,
      explanation:
        "Pernyataan 1 salah karena dilaksanakan sebelum pelajaran dimulai. Pernyataan 2 (30 menit = setengah jam) dan pernyataan 3 benar.",
    },
    {
      id: 6,
      package_id: 1,
      question_number: 6,
      topic: "Menghitung Waktu Perjalanan",
      stimulus:
        "Edo berangkat dari rumah ke sekolah naik sepeda pukul 06.25 pagi. Waktu tempuh perjalanan dari rumah Edo ke sekolah adalah 20 menit. Bel masuk sekolah berbunyi tepat pukul 07.00 pagi.",
      statement_1:
        "Edo tiba di halaman sekolah pada pukul 06.45 pagi.",
      answer_1: true,
      statement_2:
        "Edo datang terlambat melewati bel masuk sekolah.",
      answer_2: false,
      statement_3:
        "Edo masih memiliki waktu 15 menit sebelum bel masuk sekolah berbunyi.",
      answer_3: true,
      explanation:
        "06.25 + 20 menit = 06.45 (Benar). Karena bel pukul 07.00, Edo tidak terlambat (Salah) dan masih punya sisa waktu 15 menit (Benar).",
    },
    {
      id: 7,
      package_id: 1,
      question_number: 7,
      topic: "Daur Hidup Hewan",
      stimulus:
        "Kupu-kupu mengalami perubahan bentuk tubuh sempurna mulai dari telur, berubah menjadi ulat (larva), kemudian menjadi kepompong (pupa), hingga akhirnya keluar menjadi kupu-kupu dewasa yang bersayap indah. Berbeda dengan kupu-kupu, belalang tidak melewati fase kepompong.",
      statement_1:
        "Urutan daur hidup kupu-kupu adalah telur → ulat → kepompong → kupu-kupu dewasa.",
      answer_1: true,
      statement_2:
        "Belalang mengalami fase kepompong sebelum menjadi belalang dewasa.",
      answer_2: false,
      statement_3:
        "Ulat merupakan salah satu tahapan dalam pertumbuhan kupu-kupu.",
      answer_3: true,
      explanation:
        "Pernyataan 1 dan 3 sesuai bacaan. Pernyataan 2 salah karena teks menegaskan belalang tidak melewati fase kepompong.",
    },
    {
      id: 8,
      package_id: 1,
      question_number: 8,
      topic: "Tabel Pengunjung Perpustakaan",
      stimulus:
        "Data pengunjung Perpustakaan SD Harapan dalam tiga hari tercatat sebagai berikut: hari Senin sebanyak 32 siswa, hari Selasa sebanyak 45 siswa, dan hari Rabu sebanyak 28 siswa.",
      statement_1:
        "Hari dengan jumlah pengunjung terbanyak adalah hari Selasa.",
      answer_1: true,
      statement_2:
        "Selisih pengunjung hari Selasa dan hari Rabu adalah 17 siswa.",
      answer_2: true,
      statement_3:
        "Total pengunjung selama tiga hari tersebut kurang dari 100 siswa.",
      answer_3: false,
      explanation:
        "Selasa 45 paling banyak (Benar). Selisih Selasa-Rabu = 45 - 28 = 17 (Benar). Total = 32 + 45 + 28 = 105 siswa, lebih dari 100 (Salah).",
    },
    {
      id: 9,
      package_id: 1,
      question_number: 9,
      topic: "Menghemat Listrik di Rumah",
      stimulus:
        "Mematikan lampu kamar saat siang hari dan mencabut pengisi daya (charger) ponsel ketika baterai sudah penuh adalah kebiasaan baik untuk menghemat energi listrik. Selain menghemat biaya bulanan orang tua, tindakan ini juga membantu menjaga keselamatan rumah dari korsleting.",
      statement_1:
        "Membiarkan lampu kamar menyala sepanjang siang termasuk perilaku hemat energi.",
      answer_1: false,
      statement_2:
        "Mencabut charger saat baterai penuh dapat membantu menjaga keselamatan dari korsleting.",
      answer_2: true,
      statement_3:
        "Menghemat listrik di rumah juga ikut meringankan biaya listrik bulanan.",
      answer_3: true,
      explanation:
        "Pernyataan 1 salah karena justru memboroskan listrik. Pernyataan 2 dan 3 sesuai teks.",
    },
    {
      id: 10,
      package_id: 1,
      question_number: 10,
      topic: "Bangun Datar Taman Sekolah",
      stimulus:
        "Taman bunga di tengah sekolah berbentuk persegi panjang dengan panjang 8 meter dan lebar 5 meter. Di sekeliling taman akan dipasang pagar kayu kecil, sedangkan di dalamnya ditanami rumput hijau.",
      statement_1:
        "Keliling taman bunga berbentuk persegi panjang tersebut adalah 26 meter.",
      answer_1: true,
      statement_2:
        "Luas area taman yang ditanami rumput hijau adalah 40 meter persegi.",
      answer_2: true,
      statement_3:
        "Jika panjang pagar yang dibutuhkan dihitung dari luas taman, maka diperlukan pagar 40 meter.",
      answer_3: false,
      explanation:
        "Keliling = 2 × (8 + 5) = 26 m (Benar). Luas = 8 × 5 = 40 m² (Benar). Panjang pagar di sekeliling taman menggunakan keliling (26 m), bukan luas (Salah).",
    },

    // ================= PAKET 2: SMP/MTs (10 SOAL x 3 PERNYATAAN B/S) =================
    {
      id: 11,
      package_id: 2,
      question_number: 1,
      topic: "Katalog & Literasi Buku SMP",
      stimulus:
        "Pada pembelajaran Kurikulum Nasional Fase D di SMP/MTs, buku terbitan Liniswara mencakup mata pelajaran inti seperti Matematika, Ilmu Pengetahuan Alam (IPA), Ilmu Pengetahuan Sosial (IPS), Bahasa Indonesia, Bahasa Inggris, hingga Koding dan Kecerdasan Artifisial untuk Kelas 7, 8, dan 9.",
      statement_1:
        "Jenjang SMP/MTs pada Kurikulum Nasional berada pada Fase D yang mencakup kelas 7 hingga 9.",
      answer_1: true,
      statement_2:
        "Buku Koding dan Kecerdasan Artifisial belum tersedia untuk jenjang SMP/MTs.",
      answer_2: false,
      statement_3:
        "Mata pelajaran IPA dan IPS termasuk dalam buku teks inti SMP/MTs Liniswara.",
      answer_3: true,
      explanation:
        "Pernyataan 1 dan 3 sesuai bacaan. Pernyataan 2 salah karena buku Koding dan Kecerdasan Artifisial sudah tersedia untuk SMP/MTs.",
    },
    {
      id: 12,
      package_id: 2,
      question_number: 2,
      topic: "Matematika SMP: Perbandingan & Skala",
      stimulus:
        "Peta lokasi perpustakaan daerah memiliki skala 1 : 50.000. Jarak antara SMP Negeri 2 Magelang dan perpustakaan daerah pada peta adalah 6 cm. Naufal berangkat naik sepeda dengan kecepatan rata-rata 12 km/jam.",
      statement_1:
        "Jarak sebenarnya dari sekolah ke perpustakaan daerah adalah 3 km.",
      answer_1: true,
      statement_2:
        "Waktu tempuh Naufal menggunakan sepeda dengan kecepatan 12 km/jam adalah 15 menit.",
      answer_2: true,
      statement_3:
        "Jika skala peta diubah menjadi 1 : 100.000, maka jarak pada peta menjadi 12 cm.",
      answer_3: false,
      explanation:
        "Jarak sebenarnya = 6 × 50.000 cm = 300.000 cm = 3 km (Benar). Waktu = 3 km / 12 km/jam = 0,25 jam = 15 menit (Benar). Pada skala 1:100.000, jarak peta justru mengecil menjadi 3 cm (Salah).",
    },
    {
      id: 13,
      package_id: 2,
      question_number: 3,
      topic: "Koding & Kecerdasan Artifisial SMP",
      stimulus:
        "Dalam berpikir komputasional, masalah kompleks dipecah menjadi bagian kecil (dekomposisi), lalu dicari pola kesamaannya (pengenalan pola), menyaring informasi penting (abstraksi), dan menyusun langkah penyelesaian terurut (algoritma). Keempat pilar ini membantu siswa SMP merancang program komputer maupun melatih model AI sederhana.",
      statement_1:
        "Dekomposisi adalah proses memecah masalah besar menjadi bagian-bagian yang lebih kecil.",
      answer_1: true,
      statement_2:
        "Abstraksi berarti memasukkan seluruh detail yang tidak relevan ke dalam alur program.",
      answer_2: false,
      statement_3:
        "Algoritma berisi langkah-langkah terurut untuk menyelesaikan suatu permasalahan.",
      answer_3: true,
      explanation:
        "Pernyataan 1 dan 3 sesuai definisi pada teks. Abstraksi adalah menyaring informasi penting dan mengabaikan detail tidak relevan (Pernyataan 2 Salah).",
    },
    {
      id: 14,
      package_id: 2,
      question_number: 4,
      topic: "IPS SMP: Kegiatan Ekonomi & UMKM",
      stimulus:
        "Koperasi siswa SMP memproduksi 80 botol minuman herbal dengan modal total Rp480.000,00. Seluruh botol habis terjual dengan harga Rp8.000,00 per botol. Dari keuntungan bersih yang diperoleh, 25% disisihkan untuk kas kegiatan OSIS.",
      statement_1:
        "Total pendapatan kotor penjualan 80 botol minuman adalah Rp640.000,00.",
      answer_1: true,
      statement_2:
        "Keuntungan bersih yang diperoleh koperasi siswa adalah Rp180.000,00.",
      answer_2: false,
      statement_3:
        "Dana yang disisihkan untuk kas OSIS sebesar Rp40.000,00.",
      answer_3: true,
      explanation:
        "Pendapatan = 80 × 8.000 = Rp640.000 (Benar). Keuntungan = 640.000 - 480.000 = Rp160.000, bukan 180.000 (Salah). Kas OSIS = 25% × 160.000 = Rp40.000 (Benar).",
    },
    {
      id: 15,
      package_id: 2,
      question_number: 5,
      topic: "IPA SMP: Suhu & Perubahan Wujud",
      stimulus:
        "Air murni pada tekanan 1 atmosfer membeku pada suhu 0°C dan mendidih pada suhu 100°C. Saat air dipanaskan hingga berubah menjadi uap air, proses tersebut disebut menguap dan memerlukan penyerapan kalor (energi panas).",
      statement_1:
        "Titik didih air murni pada tekanan 1 atmosfer adalah 100°C.",
      answer_1: true,
      statement_2:
        "Perubahan wujud dari cair menjadi gas disebut mengembun.",
      answer_2: false,
      statement_3:
        "Proses penguapan air memerlukan penyerapan kalor.",
      answer_3: true,
      explanation:
        "Pernyataan 1 dan 3 benar. Perubahan cair menjadi gas disebut menguap, sedangkan mengembun adalah gas menjadi cair (Pernyataan 2 Salah).",
    },
    {
      id: 16,
      package_id: 2,
      question_number: 6,
      topic: "Matematika SMP: Statistika Rata-Rata",
      stimulus:
        "Nilai ulangan IPA Dita selama 4 kali berturut-turut adalah 78, 82, 86, dan 90. Untuk memperoleh nilai rapor rata-rata minimal 85, Dita masih harus mengikuti 1 kali ulangan harian ke-5.",
      statement_1:
        "Rata-rata nilai Dita dari 4 ulangan pertama adalah 84.",
      answer_1: true,
      statement_2:
        "Jika pada ulangan ke-5 Dita mendapat nilai 89, rata-rata kelima ulangannya tepat 85.",
      answer_2: true,
      statement_3:
        "Nilai terendah yang diperoleh Dita selama 4 ulangan pertama adalah 82.",
      answer_3: false,
      explanation:
        "(78+82+86+90)/4 = 336/4 = 84 (Benar). Agar rata-rata 5 ulangan = 85, total harus 425 → nilai ke-5 = 425 - 336 = 89 (Benar). Nilai terendah adalah 78, bukan 82 (Salah).",
    },
    {
      id: 17,
      package_id: 2,
      question_number: 7,
      topic: "Bahasa Indonesia SMP: Teks Berita",
      stimulus:
        "Perpustakaan daerah Kabupaten Magelang meluncurkan program Pojok Baca Digital pada hari Senin (10/11). Sebanyak 15 sekolah menengah pertama ikut serta menerima akses e-book literasi sains dan buku pengayaan gratis.",
      statement_1:
        "Program Pojok Baca Digital diluncurkan pada hari Senin tanggal 10 November.",
      answer_1: true,
      statement_2:
        "Seluruh peserta yang menerima akses pada berita tersebut berasal dari jenjang perguruan tinggi.",
      answer_2: false,
      statement_3:
        "Unsur 'Siapa' dan 'Kapan' dalam berita tersebut terjawab dengan jelas.",
      answer_3: true,
      explanation:
        "Pernyataan 1 dan 3 sesuai unsur 5W+1H berita. Pernyataan 2 salah karena penerimanya adalah 15 sekolah menengah pertama (SMP).",
    },
    {
      id: 18,
      package_id: 2,
      question_number: 8,
      topic: "English SMP: School Library Rules",
      stimulus:
        "Notice: Students may borrow up to 3 books for 7 days. Please return books on time so other students can read them. Food and drinks are not allowed inside the reading room.",
      statement_1:
        "Students can borrow a maximum of 3 books at one time.",
      answer_1: true,
      statement_2:
        "The borrowing period for each book is 14 days.",
      answer_2: false,
      statement_3:
        "Eating snacks and drinking inside the reading room are prohibited.",
      answer_3: true,
      explanation:
        "Borrowing period is 7 days, not 14 days (Statement 2 False). Statements 1 and 3 match the notice.",
    },
    {
      id: 19,
      package_id: 2,
      question_number: 9,
      topic: "Aljabar & Persamaan Linear SMP",
      stimulus:
        "Harga 1 buku tulis adalah x rupiah dan harga 1 bolpoin adalah y rupiah. Diketahui harga 2 buku tulis dan 1 bolpoin adalah Rp13.000,00. Jika harga 1 bolpoin adalah Rp3.000,00, maka harga satuan buku tulis dapat ditentukan dengan persamaan linear sederhana.",
      statement_1:
        "Persamaan yang mewakili pembelian tersebut adalah 2x + y = 13.000.",
      answer_1: true,
      statement_2:
        "Harga 1 buku tulis (nilai x) adalah Rp5.000,00.",
      answer_2: true,
      statement_3:
        "Jika membeli 3 buku tulis saja, biaya yang harus dibayar adalah Rp12.000,00.",
      answer_3: false,
      explanation:
        "2x + 3.000 = 13.000 → 2x = 10.000 → x = 5.000 (Pernyataan 1 & 2 Benar). Harga 3 buku = 3 × 5.000 = Rp15.000, bukan 12.000 (Salah).",
    },
    {
      id: 20,
      package_id: 2,
      question_number: 10,
      topic: "Penalaran Evaluasi Tryout",
      stimulus:
        "Setiap paket simulasi di portal Liniswara memiliki 10 soal dan tiap soal berisi 3 pernyataan Benar/Salah (total 30 pernyataan). Skor akhir dihitung dari (Jumlah Pernyataan Benar / 30) × 100.",
      statement_1:
        "Jika siswa menjawab tepat 27 dari 30 pernyataan, skor akhirnya adalah 90,00.",
      answer_1: true,
      statement_2:
        "Total seluruh pernyataan yang dinilai dalam 1 paket simulasi adalah 20 pernyataan.",
      answer_2: false,
      statement_3:
        "Skor maksimal jika seluruh pernyataan benar adalah 100.",
      answer_3: true,
      explanation:
        "27/30 × 100 = 90 (Benar). Total pernyataan = 10 × 3 = 30 pernyataan, bukan 20 (Salah). 30/30 × 100 = 100 (Benar).",
    },

    // ================= PAKET 3: SMA/MA (10 SOAL x 3 PERNYATAAN B/S) =================
    {
      id: 21,
      package_id: 3,
      question_number: 1,
      topic: "Literasi Informasi Penerbitan",
      stimulus:
        "Sejak berdiri pada 2021, PT Lini Suara Nusantara (Liniswara) berkolaborasi dengan 25+ MGMP di Jawa Timur dan Jawa Tengah untuk menerbitkan lebih dari 900 judul buku bagi jenjang SD, SMP, SMA/MA, dan SMK/MAK. Liniswara memperoleh penghargaan dari Perpustakaan Nasional RI (2023) serta Penerbit Terbaik Serah Simpan Karya Cetak Jawa Tengah (2025).",
      statement_1:
        "Mitra MGMP Liniswara berjumlah lebih dari 25 kelompok di Jawa Timur dan Jawa Tengah.",
      answer_1: true,
      statement_2:
        "Penghargaan Perpustakaan Nasional RI diterima Liniswara pada tahun 2025.",
      answer_2: false,
      statement_3:
        "Total karya terbit Liniswara telah melampaui 900 judul buku lintas jenjang.",
      answer_3: true,
      explanation:
        "Penghargaan Perpusnas RI diterima tahun 2023, sedangkan 2025 adalah penghargaan dari Dinas Kearsipan dan Perpustakaan Jawa Tengah (Pernyataan 2 Salah).",
    },
    {
      id: 22,
      package_id: 3,
      question_number: 2,
      topic: "Numerasi Pengadaan Buku SMA",
      stimulus:
        "Sebuah SMA Negeri memesan 120 eksemplar buku seri Smart Steps: TKA seharga Rp75.000,00 per eksemplar. Karena pembelian melebihi 100 buku, sekolah mendapatkan potongan harga 20% dan buku dikirim merata ke dalam 4 kardus.",
      statement_1:
        "Total pembayaran bersih setelah diskon 20% adalah Rp7.200.000,00.",
      answer_1: true,
      statement_2:
        "Setiap kardus berisi 25 eksemplar buku.",
      answer_2: false,
      statement_3:
        "Potongan harga per buku adalah Rp15.000,00.",
      answer_3: true,
      explanation:
        "Bruto = Rp9.000.000; diskon 20% = Rp1.800.000; netto = Rp7.200.000 (Benar). Isi per kardus = 120/4 = 30 buku (Salah). Diskon per buku = 20% × 75.000 = Rp15.000 (Benar).",
    },
    {
      id: 23,
      package_id: 3,
      question_number: 3,
      topic: "Deep Learning & Projek IPAS SMA",
      stimulus:
        "Pembelajaran Mendalam (Deep Learning) menekankan tiga pengalaman belajar utama: berkesadaran (mindful), bermakna (meaningful), dan menggembirakan (joyful). Dalam Projek IPAS SMA kelas X, siswa meneliti kualitas air sungai di sekitar sekolah alih-alih sekadar menghafal tabel kimia.",
      statement_1:
        "Pendekatan Deep Learning mendorong siswa mengaitkan konsep dengan masalah nyata di sekitar.",
      answer_1: true,
      statement_2:
        "Hafalan tabel tanpa praktik lapangan merupakan tujuan utama Projek IPAS pada teks.",
      answer_2: false,
      statement_3:
        "Mindful, meaningful, dan joyful merupakan tiga pilar pengalaman belajar yang disebutkan.",
      answer_3: true,
      explanation:
        "Pernyataan 1 dan 3 sesuai bacaan. Pernyataan 2 salah karena teks mengkontraskan praktik penelitian nyata dengan sekadar menghafal.",
    },
    {
      id: 24,
      package_id: 3,
      question_number: 4,
      topic: "Numerasi Distribusi Skor TKA",
      stimulus:
        "Dari 40 siswa kelas XII SMA yang mengikuti Tryout TKA, 10 siswa meraih skor 85, 16 siswa meraih skor 75, 10 siswa meraih skor 65, dan sisanya meraih skor 55. Batas tuntas ditetapkan pada skor ≥ 70.",
      statement_1:
        "Sebanyak 4 siswa meraih skor 55.",
      answer_1: true,
      statement_2:
        "Persentase siswa yang tuntas (skor ≥ 70) adalah 65%.",
      answer_2: true,
      statement_3:
        "Rata-rata skor seluruh kelas XII tersebut lebih tinggi dari 75.",
      answer_3: false,
      explanation:
        "Siswa skor 55 = 40 - 36 = 4 (Benar). Tuntas = (10+16)/40 = 65% (Benar). Rata-rata = (850+1200+650+220)/40 = 2920/40 = 73 < 75 (Salah).",
    },
    {
      id: 25,
      package_id: 3,
      question_number: 5,
      topic: "English Analytical Text",
      stimulus:
        "Digital reading platforms help high school students track their weekly progress. However, studies show that combining printed workbooks with online practice simulations leads to higher retention than screen-only reading.",
      statement_1:
        "Combining printed workbooks with online simulations improves learning retention compared to screen-only reading.",
      answer_1: true,
      statement_2:
        "The text states that printed workbooks are completely useless in the digital era.",
      answer_2: false,
      statement_3:
        "Digital platforms allow students to monitor their weekly progress.",
      answer_3: true,
      explanation:
        "Statements 1 and 3 accurately reflect the text; Statement 2 contradicts the benefit of printed workbooks.",
    },
    {
      id: 26,
      package_id: 3,
      question_number: 6,
      topic: "Manajemen Waktu Ujian TKA",
      stimulus:
        "Ardi mengerjakan 10 soal tryout berdurasi 30 menit. Ia memakai 2 menit 15 detik rata-rata untuk setiap soal nomor 1–8, lalu memakai sisa waktunya untuk nomor 9, 10, dan memeriksa jawaban.",
      statement_1:
        "Total waktu untuk soal nomor 1 sampai 8 adalah 18 menit.",
      answer_1: true,
      statement_2:
        "Sisa waktu setelah soal nomor 8 selesai adalah 10 menit.",
      answer_2: false,
      statement_3:
        "Jika nomor 9 dan 10 masing-masing butuh 3 menit, tersisa 6 menit untuk memeriksa jawaban.",
      answer_3: true,
      explanation:
        "8 × 2,25 = 18 menit (Benar). Sisa = 30 - 18 = 12 menit (Salah). 12 - 6 = 6 menit (Benar).",
    },
    {
      id: 27,
      package_id: 3,
      question_number: 7,
      topic: "Keamanan Data & Aplikasi Web",
      stimulus:
        "Dalam standar keamanan aplikasi modern, kata sandi di-hash satu arah menggunakan algoritma scrypt atau bcrypt dengan salt acak. Cookie sesi ditandai HttpOnly agar tidak dapat dibaca oleh JavaScript pada sisi peramban.",
      statement_1:
        "Hashing satu arah dengan salt mencegah kata sandi asli mudah terbaca saat database bocor.",
      answer_1: true,
      statement_2:
        "Penanda HttpOnly membuat cookie sesi bebas dibaca oleh skrip JavaScript pihak ketiga.",
      answer_2: false,
      statement_3:
        "Algoritma scrypt dan bcrypt adalah contoh metode hashing kata sandi.",
      answer_3: true,
      explanation:
        "HttpOnly justru memblokir akses JavaScript terhadap cookie sesi (Pernyataan 2 Salah).",
    },
    {
      id: 28,
      package_id: 3,
      question_number: 8,
      topic: "Pertumbuhan Pengguna Belajar Daring",
      stimulus:
        "Pada Oktober tercatat 400 pengguna aktif platform belajar. Bulan November naik 25% dari Oktober, lalu bulan Desember bertambah lagi 150 siswa dari total November.",
      statement_1:
        "Jumlah pengguna aktif pada bulan November adalah 500 siswa.",
      answer_1: true,
      statement_2:
        "Total pengguna aktif pada bulan Desember mencapai 650 siswa.",
      answer_2: true,
      statement_3:
        "Persentase kenaikan total dari Oktober ke Desember kurang dari 50%.",
      answer_3: false,
      explanation:
        "Nov = 500, Des = 650. Kenaikan Okt–Des = 250/400 = 62,5% > 50% (Pernyataan 3 Salah).",
    },
    {
      id: 29,
      package_id: 3,
      question_number: 9,
      topic: "English Academic Integrity",
      stimulus:
        "Academic integrity requires students to cite sources properly when writing essays. Plagiarism—copying another author's work without attribution—undermines original thinking and violates school ethics.",
      statement_1:
        "Citing sources properly is part of maintaining academic integrity.",
      answer_1: true,
      statement_2:
        "Copying an author's work without credit is encouraged in academic essays.",
      answer_2: false,
      statement_3:
        "Plagiarism weakens original thinking and violates school ethics.",
      answer_3: true,
      explanation:
        "Statement 2 contradicts the definition of plagiarism in the text.",
    },
    {
      id: 30,
      package_id: 3,
      question_number: 10,
      topic: "Penalaran Skoring Pilihan Ganda Kompleks",
      stimulus:
        "Pada format 10 soal × 3 pernyataan B/S, skor akhir = (pernyataan benar / 30) × 100. Soal dikategorikan 'Sempurna' jika ketiga pernyataannya dijawab tepat.",
      statement_1:
        "Menjawab benar 24 dari 30 pernyataan menghasilkan skor 80,00.",
      answer_1: true,
      statement_2:
        "Menjawab benar tepat 2 pernyataan di setiap soal menghasilkan 10 Soal Sempurna.",
      answer_2: false,
      statement_3:
        "Satu nomor soal memiliki bobot maksimal 3 pernyataan yang dinilai.",
      answer_3: true,
      explanation:
        "Jika hanya 2 dari 3 pernyataan yang benar per soal, tidak ada soal yang sempurna (0 Soal Sempurna).",
    },

    // ================= PAKET 4: SMK/MAK (10 SOAL x 3 PERNYATAAN B/S) =================
    {
      id: 31,
      package_id: 4,
      question_number: 1,
      topic: "KIK: Break Even Point (BEP)",
      stimulus:
        "Unit produksi Bisnis Digital SMK memproduksi paket merchandise edukasi dengan biaya tetap Rp1.500.000,00 per bulan. Biaya variabel per paket Rp25.000,00 dan harga jual Rp55.000,00 per paket.",
      statement_1:
        "Margin kontribusi per paket merchandise adalah Rp30.000,00.",
      answer_1: true,
      statement_2:
        "Titik impas (BEP unit) tercapai apabila terjual 50 paket dalam sebulan.",
      answer_2: true,
      statement_3:
        "Penjualan sebanyak 40 paket dalam sebulan sudah menghasilkan laba bersih.",
      answer_3: false,
      explanation:
        "Margin = 55.000 - 25.000 = 30.000 (Benar). BEP = 1.500.000 / 30.000 = 50 paket (Benar). Menjual 40 paket masih di bawah BEP (Salah).",
    },
    {
      id: 32,
      package_id: 4,
      question_number: 2,
      topic: "Pemasaran Digital: Conversion Rate",
      stimulus:
        "Kampanye iklan buku kejuruan SMK mencatat 10.000 tayangan, 500 klik tautan produk, dan 25 transaksi pembelian dengan total biaya iklan Rp500.000,00.",
      statement_1:
        "Biaya per klik (Cost Per Click) kampanye tersebut adalah Rp1.000,00.",
      answer_1: true,
      statement_2:
        "Tingkat konversi pembelian dari pengklik iklan adalah 10%.",
      answer_2: false,
      statement_3:
        "Biaya akuisisi pelanggan (CAC) rata-rata adalah Rp20.000,00 per pembelian.",
      answer_3: true,
      explanation:
        "CPC = 500.000/500 = Rp1.000 (Benar). Conversion = 25/500 = 5%, bukan 10% (Salah). CAC = 500.000/25 = Rp20.000 (Benar).",
    },
    {
      id: 33,
      package_id: 4,
      question_number: 3,
      topic: "English Text: Vocational PKL Notice",
      stimulus:
        "Announcement for Grade XII SMK: All students in the Industry Internship Program (PKL) must upload their signed logbooks before Friday, December 12 at 15:00 WIB. Verification is conducted jointly by school coordinators and industry mentors.",
      statement_1:
        "The logbook submission deadline is Friday, December 12 at 15:00 WIB.",
      answer_1: true,
      statement_2:
        "Only industry mentors conduct verification without school coordinators.",
      answer_2: false,
      statement_3:
        "Students must ensure their logbooks are signed before uploading.",
      answer_3: true,
      explanation:
        "Verification is conducted jointly by both school coordinators and industry mentors (Statement 2 False).",
    },
    {
      id: 34,
      package_id: 4,
      question_number: 4,
      topic: "KIK: Hak Kekayaan Intelektual",
      stimulus:
        "Siswa RPL SMK merancang aplikasi kasir UMKM 'WarungPintar'. Pembimbing menyarankan mendaftarkan kode sumber aplikasi sebagai Hak Cipta serta nama dan logo produk sebagai Merek Dagang resmi.",
      statement_1:
        "Kode sumber perangkat lunak dilindungi dalam rezim Hak Cipta.",
      answer_1: true,
      statement_2:
        "Nama dan logo produk didaftarkan sebagai Merek Dagang.",
      answer_2: true,
      statement_3:
        "Pendaftaran merek hanya diperbolehkan untuk perusahaan besar dan tidak berlaku bagi UMKM.",
      answer_3: false,
      explanation:
        "UMKM dan kreator lokal sangat dianjurkan mendaftarkan merek dagangnya (Pernyataan 3 Salah).",
    },
    {
      id: 35,
      package_id: 4,
      question_number: 5,
      topic: "SOP Bengkel Teknik Otomotif",
      stimulus:
        "Prosedur keselamatan bengkel mewajibkan teknisi memakai sepatu safety, memeriksa tekanan ban dan sistem rem sebelum uji jalan, serta mencatat seluruh penggantian suku cadang pada work order pelanggan.",
      statement_1:
        "Pemakaian sepatu safety merupakan bagian dari prosedur keselamatan bengkel.",
      answer_1: true,
      statement_2:
        "Pemeriksaan sistem rem baru dilakukan setelah kendaraan selesai uji jalan.",
      answer_2: false,
      statement_3:
        "Penggantian suku cadang wajib dicatat pada dokumen work order pelanggan.",
      answer_3: true,
      explanation:
        "Pemeriksaan sistem rem dilakukan sebelum uji jalan (Pernyataan 2 Salah).",
    },
    {
      id: 36,
      package_id: 4,
      question_number: 6,
      topic: "KIK: Business Model Canvas",
      stimulus:
        "Pada Business Model Canvas (BMC), blok Value Propositions memetakan nilai manfaat utama yang ditawarkan kepada pelanggan, sedangkan blok Cost Structure merinci seluruh pos biaya operasional usaha.",
      statement_1:
        "Value Propositions berfokus pada manfaat solusi yang dirasakan pelanggan.",
      answer_1: true,
      statement_2:
        "Cost Structure mencatat rincian biaya operasional bisnis.",
      answer_2: true,
      statement_3:
        "Value Propositions dan Cost Structure memiliki fungsi yang identik di BMC.",
      answer_3: false,
      explanation:
        "Keduanya adalah blok berbeda dengan fungsi berbeda pada BMC (Pernyataan 3 Salah).",
    },
    {
      id: 37,
      package_id: 4,
      question_number: 7,
      topic: "Akuntansi Dasar Koperasi SMK",
      stimulus:
        "Unit usaha koperasi SMK mencatat pemasukan minggu pertama Rp3.200.000,00, biaya bahan Rp1.950.000,00, dan ongkos kirim Rp250.000,00. Sebanyak 50% dari kas bersih disisihkan untuk dana pengembangan produk.",
      statement_1:
        "Total pengeluaran unit usaha tersebut adalah Rp2.200.000,00.",
      answer_1: true,
      statement_2:
        "Kas bersih sebelum penyisihan adalah Rp1.250.000,00.",
      answer_2: false,
      statement_3:
        "Dana yang dialokasikan untuk pengembangan produk sebesar Rp500.000,00.",
      answer_3: true,
      explanation:
        "Pengeluaran = 2.200.000; kas bersih = 1.000.000 (bukan 1.250.000); 50% × 1.000.000 = Rp500.000.",
    },
    {
      id: 38,
      package_id: 4,
      question_number: 8,
      topic: "Layanan Tamu Perhotelan SMK",
      stimulus:
        "Staf front office hotel wajib menyapa tamu maksimal 3 detik setelah tamu tiba, memverifikasi reservasi, menjelaskan jam sarapan, lalu menyerahkan kartu kunci aktif dalam sampul pelindung.",
      statement_1:
        "Staf menyapa tamu paling lama 3 detik setelah kedatangan di meja resepsionis.",
      answer_1: true,
      statement_2:
        "Penjelasan jam sarapan disampaikan setelah tamu masuk ke kamar.",
      answer_2: false,
      statement_3:
        "Kartu kunci kamar diserahkan dalam keadaan aktif di dalam sampul pelindung.",
      answer_3: true,
      explanation:
        "Jam sarapan dijelaskan di resepsionis sebelum menyerahkan kartu kunci (Pernyataan 2 Salah).",
    },
    {
      id: 39,
      package_id: 4,
      question_number: 9,
      topic: "TJKT: Keamanan Jaringan Sekolah",
      stimulus:
        "Administrator lab TJKT memisahkan jaringan Wi-Fi tamu dan jaringan server ujian menggunakan VLAN, serta mengganti kata sandi router bawaan pabrik sebelum perangkat dioperasikan.",
      statement_1:
        "Pemisahan jaringan tamu dan server ujian dilakukan menggunakan konfigurasi VLAN.",
      answer_1: true,
      statement_2:
        "Membiarkan kata sandi router bawaan pabrik aman untuk jaringan produksi.",
      answer_2: false,
      statement_3:
        "Penggantian kata sandi bawaan dilakukan sebelum perangkat mulai dioperasikan.",
      answer_3: true,
      explanation:
        "Kata sandi default pabrik sangat rentan dan wajib diganti sebelum operasional (Pernyataan 2 Salah).",
    },
    {
      id: 40,
      package_id: 4,
      question_number: 10,
      topic: "Inovasi Produk & Minimum Viable Product",
      stimulus:
        "Tim siswa SMK membuat Minimum Viable Product (MVP) untuk diuji coba oleh 30 siswa dan 5 guru MGMP guna mengumpulkan umpan balik mengenai tata letak tombol pada layar ponsel.",
      statement_1:
        "MVP dibuat untuk menguji fitur inti kepada pengguna awal demi mendapatkan umpan balik.",
      answer_1: true,
      statement_2:
        "Uji coba pada bacaan tersebut tidak melibatkan guru MGMP sama sekali.",
      answer_2: false,
      statement_3:
        "Masukan tata letak tombol membantu perbaikan desain responsif ponsel.",
      answer_3: true,
      explanation:
        "Uji coba melibatkan 30 siswa dan 5 guru MGMP (Pernyataan 2 Salah).",
    },
  ];

  return {
    users,
    redeemCodes,
    materials,
    packages,
    questions: buildAllExtendedQuestions(questions),
  };
}
