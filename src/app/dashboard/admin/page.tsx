"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Edit3,
  KeyRound,
  PlayCircle,
  PlusCircle,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";
import type {
  RedeemCode,
  SafeUser,
  TryoutAttempt,
  TryoutPackage,
  TryoutQuestion,
  VideoMaterial,
} from "@/types";

interface AdminStats {
  totalUsers: number;
  activeSubscribers: number;
  totalMaterials: number;
  totalPackages: number;
  totalQuestions: number;
  totalAttempts: number;
  storageMode: "mysql" | "local";
}

interface AdminRedeemCode extends RedeemCode {
  clean_description?: string;
  scope_label?: string;
  is_custom_bundle?: boolean;
  bundle_material_ids?: number[];
  bundle_package_ids?: number[];
}

interface PackagePreview extends TryoutPackage {
  questions: TryoutQuestion[];
}

interface AdminAttemptRow extends TryoutAttempt {
  user_name: string;
  user_email: string;
  user_school: string;
  user_grade: string;
  package_title: string;
  package_level: string;
}

type AdminTab = "overview" | "redeem" | "materials" | "questions" | "users";

const REDEEM_SCOPE_OPTIONS: Record<
  string,
  { label: string; planTemplate: string }[]
> = {
  "Semua Jenjang": [
    {
      label: "Semua Jenjang & Seluruh Kelas (SD–SMK)",
      planTemplate: "Program Kolaborasi MGMP Semua Jenjang",
    },
  ],
  "SD/MI": [
    {
      label: "Seluruh Kelas (Kelas 1–6)",
      planTemplate: "Paket Belajar & Tryout SD/MI Lengkap Kelas 1–6",
    },
    {
      label: "Kelas 1 saja",
      planTemplate: "Paket Belajar & Tryout SD/MI Khusus Kelas 1",
    },
    {
      label: "Kelas 2 saja",
      planTemplate: "Paket Belajar & Tryout SD/MI Khusus Kelas 2",
    },
    {
      label: "Kelas 3 saja",
      planTemplate: "Paket Belajar & Tryout SD/MI Khusus Kelas 3",
    },
    {
      label: "Kelas 4 saja",
      planTemplate: "Paket Belajar & Tryout SD/MI Khusus Kelas 4",
    },
    {
      label: "Kelas 5 saja",
      planTemplate: "Paket Belajar & Tryout SD/MI Khusus Kelas 5",
    },
    {
      label: "Kelas 6 saja",
      planTemplate: "Paket Belajar & Tryout SD/MI Khusus Kelas 6",
    },
    {
      label: "Kelas 1–3 (Fase A–B)",
      planTemplate: "Paket Belajar & Tryout SD/MI Kelas 1–3 (Fase A–B)",
    },
    {
      label: "Kelas 4–6 (Fase C)",
      planTemplate: "Paket Belajar & Tryout SD/MI Kelas 4–6 (Fase C)",
    },
  ],
  "SMP/MTs": [
    {
      label: "Seluruh Kelas (Kelas 7–9)",
      planTemplate: "Paket Belajar & TKA SMP/MTs Fase D Kelas 7–9",
    },
    {
      label: "Kelas 7 saja",
      planTemplate: "Paket Belajar & Tryout SMP/MTs Khusus Kelas 7",
    },
    {
      label: "Kelas 8 saja",
      planTemplate: "Paket Belajar & Tryout SMP/MTs Khusus Kelas 8",
    },
    {
      label: "Kelas 9 saja (Persiapan TKA)",
      planTemplate: "Paket Belajar & TKA SMP/MTs Khusus Kelas 9",
    },
    {
      label: "Kelas 7–8 (Fase D)",
      planTemplate: "Paket Belajar & Tryout SMP/MTs Kelas 7–8 (Fase D)",
    },
  ],
  "SMA/MA": [
    {
      label: "Seluruh Kelas & Peminatan (Kelas 10–12 MIPA & IPS)",
      planTemplate: "Paket Smart Steps TKA SMA/MA MIPA & IPS",
    },
    {
      label: "Kelas 10 saja",
      planTemplate: "Paket Smart Steps SMA/MA Khusus Kelas 10",
    },
    {
      label: "Kelas 11 saja",
      planTemplate: "Paket Smart Steps SMA/MA Khusus Kelas 11",
    },
    {
      label: "Kelas 12 saja (TKA)",
      planTemplate: "Paket Smart Steps TKA SMA/MA Khusus Kelas 12",
    },
    {
      label: "Peminatan MIPA (Kelas 10–12)",
      planTemplate: "Paket Smart Steps TKA SMA/MA Kelas 10–12 Peminatan MIPA",
    },
    {
      label: "Peminatan IPS & Bahasa (Kelas 10–12)",
      planTemplate:
        "Paket Smart Steps TKA SMA/MA Kelas 10–12 Peminatan IPS & Bahasa",
    },
    {
      label: "Kelas 10 • Peminatan MIPA",
      planTemplate: "Paket SMA/MA Kelas 10 Peminatan MIPA",
    },
    {
      label: "Kelas 11 • Peminatan MIPA",
      planTemplate: "Paket SMA/MA Kelas 11 Peminatan MIPA",
    },
    {
      label: "Kelas 12 • Peminatan MIPA",
      planTemplate: "Paket TKA SMA/MA Kelas 12 Peminatan MIPA",
    },
    {
      label: "Kelas 10 • Peminatan IPS",
      planTemplate: "Paket SMA/MA Kelas 10 Peminatan IPS",
    },
    {
      label: "Kelas 11 • Peminatan IPS",
      planTemplate: "Paket SMA/MA Kelas 11 Peminatan IPS",
    },
    {
      label: "Kelas 12 • Peminatan IPS",
      planTemplate: "Paket TKA SMA/MA Kelas 12 Peminatan IPS",
    },
  ],
  "SMK/MAK": [
    {
      label: "Seluruh Kelas & Jurusan (Kelas 10–12 Semua Jurusan)",
      planTemplate: "Paket Kejuruan SMK/MAK Semua Jurusan",
    },
    {
      label: "Kelas 10 saja",
      planTemplate: "Paket Kejuruan SMK/MAK Khusus Kelas 10",
    },
    {
      label: "Kelas 11 saja",
      planTemplate: "Paket Kejuruan SMK/MAK Khusus Kelas 11",
    },
    {
      label: "Kelas 12 saja (TKA)",
      planTemplate: "Paket Kejuruan TKA SMK/MAK Khusus Kelas 12",
    },
    {
      label: "Jurusan Teknologi & IT (Kelas 10–12)",
      planTemplate: "Paket SMK/MAK Kelas 10–12 Jurusan Teknologi & IT",
    },
    {
      label: "Jurusan Bisnis & Pariwisata (Kelas 10–12)",
      planTemplate: "Paket SMK/MAK Kelas 10–12 Jurusan Bisnis & Pariwisata",
    },
  ],
};

const CONTENT_CLASS_PRESETS: Record<string, string[]> = {
  "Semua Jenjang": ["Seluruh Jenjang & Kelas (SD–SMK)"],
  "SD/MI": [
    "Seluruh Kelas SD/MI (Kelas 1–6)",
    "Kelas 1",
    "Kelas 2",
    "Kelas 3",
    "Kelas 4",
    "Kelas 5",
    "Kelas 6",
    "Kelas 1–3 (Fase A–B)",
    "Kelas 4–6 (Fase C)",
  ],
  "SMP/MTs": [
    "Seluruh Kelas SMP/MTs (Kelas 7–9)",
    "Kelas 7",
    "Kelas 8",
    "Kelas 9 (Persiapan TKA)",
    "Kelas 7–8 (Fase D)",
  ],
  "SMA/MA": [
    "Seluruh Kelas SMA/MA (Kelas 10–12)",
    "Kelas 10",
    "Kelas 11",
    "Kelas 12 (TKA)",
    "Kelas 10–12 • Peminatan MIPA",
    "Kelas 10–12 • Peminatan IPS & Bahasa",
    "Kelas 10 • Peminatan MIPA",
    "Kelas 11 • Peminatan MIPA",
    "Kelas 12 • Peminatan MIPA",
    "Kelas 10 • Peminatan IPS",
    "Kelas 11 • Peminatan IPS",
    "Kelas 12 • Peminatan IPS",
  ],
  "SMK/MAK": [
    "Seluruh Kelas & Jurusan SMK/MAK (Kelas 10–12)",
    "Kelas 10",
    "Kelas 11",
    "Kelas 12 (TKA)",
    "Kelas 10–12 • Jurusan Teknologi & IT",
    "Kelas 10–12 • Jurusan Bisnis & Pariwisata",
  ],
};

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get("tab") || "overview") as AdminTab;
  const tab: AdminTab = [
    "overview",
    "redeem",
    "materials",
    "questions",
    "users",
  ].includes(tabParam)
    ? tabParam
    : "overview";

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [codes, setCodes] = useState<AdminRedeemCode[]>([]);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [materials, setMaterials] = useState<VideoMaterial[]>([]);
  const [packages, setPackages] = useState<PackagePreview[]>([]);
  const [attempts, setAttempts] = useState<AdminAttemptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Form Kode Redeem (Create / Edit + Custom Bundle)
  const [editingCodeId, setEditingCodeId] = useState<number | null>(null);
  const [newCode, setNewCode] = useState("");
  const [codeMode, setCodeMode] = useState<"level" | "custom">("level");
  const [codeTargetLevel, setCodeTargetLevel] = useState("Semua Jenjang");
  const [codeTargetScope, setCodeTargetScope] = useState(
    "Semua Jenjang & Seluruh Kelas (SD–SMK)"
  );
  const [bundleMaterialIds, setBundleMaterialIds] = useState<number[]>([]);
  const [bundlePackageIds, setBundlePackageIds] = useState<number[]>([]);
  const [bundleSearch, setBundleSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  const [planName, setPlanName] = useState(
    "Program Kolaborasi MGMP Semua Jenjang (90 Hari)"
  );
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState(90);
  const [quota, setQuota] = useState(100);

  // Form Materi Video (Create / Edit + Filter & Search)
  const [matFilterLevel, setMatFilterLevel] = useState("Semua");
  const [matSearch, setMatSearch] = useState("");
  const [editingMatId, setEditingMatId] = useState<number | null>(null);
  const [matTitle, setMatTitle] = useState("");
  const [matLevel, setMatLevel] = useState("SD/MI");
  const [matSubject, setMatSubject] = useState("Bahasa Indonesia");
  const [matCategory, setMatCategory] = useState(
    "Seluruh Kelas SD/MI (Kelas 1–6)"
  );
  const [matYoutube, setMatYoutube] = useState("puD1GJ9FM40");
  const [matDuration, setMatDuration] = useState("15:00");
  const [matSummary, setMatSummary] = useState("");
  const [matRef, setMatRef] = useState("");
  const [matPremium, setMatPremium] = useState(true);

  // Form Bank Soal (Create / Edit + Active Package Viewer)
  const [qPackageId, setQPackageId] = useState(1);
  const [qFilterLevel, setQFilterLevel] = useState("Semua");
  const [qSearch, setQSearch] = useState("");
  const [editingQId, setEditingQId] = useState<number | null>(null);
  const [qTopic, setQTopic] = useState("");
  const [qStimulus, setQStimulus] = useState("");
  const [qSt1, setQSt1] = useState("");
  const [qAns1, setQAns1] = useState(true);
  const [qSt2, setQSt2] = useState("");
  const [qAns2, setQAns2] = useState(false);
  const [qSt3, setQSt3] = useState("");
  const [qAns3, setQAns3] = useState(true);
  const [qExp, setQExp] = useState("");

  // Form Paket Tryout (Create / Edit)
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<number | null>(null);
  const [pkgTitle, setPkgTitle] = useState("");
  const [pkgLevel, setPkgLevel] = useState("SD/MI");
  const [pkgClassScope, setPkgClassScope] = useState(
    "Seluruh Kelas SD/MI (Kelas 1–6)"
  );
  const [pkgSubject, setPkgSubject] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgDuration, setPkgDuration] = useState(30);
  const [pkgPremium, setPkgPremium] = useState(true);

  const [saving, setSaving] = useState(false);

  function switchTab(nextTab: AdminTab) {
    setError("");
    setNotice("");
    router.push(`/dashboard/admin?tab=${nextTab}`);
  }

  async function loadAdmin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Akses khusus Admin Redaksi.");
        setLoading(false);
        return;
      }
      setStats(data.stats);
      setCodes(data.redeemCodes || []);
      setUsers(data.users || []);
      setMaterials(data.materials || []);
      setPackages(data.packages || []);
      setAttempts(data.attempts || []);
      if (data.packages?.length > 0 && qPackageId === 1) {
        setQPackageId(data.packages[0].id);
      }
    } catch {
      setError("Gagal memuat data Admin Redaksi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== KODE REDEEM HANDLERS =====
  function applyRedeemScope(
    targetLevel: string,
    targetLabel: string,
    days: number
  ) {
    setCodeTargetLevel(targetLevel);
    setCodeTargetScope(targetLabel);
    const list = REDEEM_SCOPE_OPTIONS[targetLevel] || [];
    const matched = list.find((item) => item.label === targetLabel) || list[0];
    if (matched) {
      setPlanName(`${matched.planTemplate} (${days} Hari)`);
      if (!editingCodeId) {
        setDescription(`Voucher pembuka materi & tryout ${matched.label}`);
      }
    }
  }

  function startEditCode(c: AdminRedeemCode) {
    setEditingCodeId(c.id);
    setNewCode(c.code);
    setPlanName(c.plan_name);
    setDescription(c.clean_description ?? c.description);
    setDurationDays(c.duration_days);
    setQuota(c.quota);
    if (c.is_custom_bundle) {
      setCodeMode("custom");
      setBundleMaterialIds(c.bundle_material_ids || []);
      setBundlePackageIds(c.bundle_package_ids || []);
    } else {
      setCodeMode("level");
      setBundleMaterialIds([]);
      setBundlePackageIds([]);
    }
    setError("");
    setNotice("");
  }

  function resetCodeForm() {
    setEditingCodeId(null);
    setNewCode("");
    setCodeMode("level");
    setCodeTargetLevel("Semua Jenjang");
    setCodeTargetScope("Semua Jenjang & Seluruh Kelas (SD–SMK)");
    setBundleMaterialIds([]);
    setBundlePackageIds([]);
    setBundleSearch("");
    setPlanName("Program Kolaborasi MGMP Semua Jenjang (90 Hari)");
    setDescription("");
    setDurationDays(90);
    setQuota(100);
  }

  function toggleBundleMaterial(id: number) {
    setBundleMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleBundlePackage(id: number) {
    setBundlePackageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSaveCode(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = editingCodeId
        ? {
            action: "update_redeem",
            id: editingCodeId,
            code: newCode,
            plan_name: planName,
            description,
            duration_days: durationDays,
            quota,
            is_custom_bundle: codeMode === "custom",
            bundle_material_ids: bundleMaterialIds,
            bundle_package_ids: bundlePackageIds,
          }
        : {
            code: newCode,
            plan_name: planName,
            description,
            duration_days: durationDays,
            quota,
            is_custom_bundle: codeMode === "custom",
            bundle_material_ids: bundleMaterialIds,
            bundle_package_ids: bundlePackageIds,
          };

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan kode redeem.");
      } else {
        setNotice(
          editingCodeId
            ? "Kode redeem berhasil diperbarui."
            : "Kode redeem baru berhasil diterbitkan."
        );
        resetCodeForm();
        await loadAdmin();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleCode(id: number, currentActive: boolean) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle",
        id,
        is_active: !currentActive,
      }),
    });
    await loadAdmin();
  }

  async function handleDeleteCode(id: number) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_redeem", id }),
    });
    if (editingCodeId === id) resetCodeForm();
    setNotice("Kode redeem dihapus.");
    await loadAdmin();
  }

  // ===== MATERI VIDEO HANDLERS =====
  function startEditMaterial(m: VideoMaterial) {
    setEditingMatId(m.id);
    setMatTitle(m.title);
    setMatLevel(m.grade_level);
    setMatSubject(m.subject);
    setMatCategory(m.category);
    setMatYoutube(m.youtube_id);
    setMatDuration(m.duration);
    setMatSummary(m.summary);
    setMatRef(m.book_reference);
    setMatPremium(m.is_premium);
    setError("");
    setNotice("");
  }

  function resetMaterialForm() {
    setEditingMatId(null);
    setMatTitle("");
    setMatLevel("SD/MI");
    setMatSubject("Bahasa Indonesia");
    setMatCategory("Seluruh Kelas SD/MI (Kelas 1–6)");
    setMatYoutube("puD1GJ9FM40");
    setMatDuration("15:00");
    setMatSummary("");
    setMatRef("");
    setMatPremium(true);
  }

  async function handleSaveMaterial(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingMatId ? "update_material" : "create_material",
          id: editingMatId,
          title: matTitle,
          grade_level: matLevel,
          subject: matSubject,
          category: matCategory,
          youtube_id: matYoutube,
          duration: matDuration,
          summary: matSummary,
          book_reference: matRef,
          is_premium: matPremium,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan materi video.");
      } else {
        setNotice(
          editingMatId
            ? "Materi video berhasil diperbarui."
            : "Materi video baru berhasil ditambahkan."
        );
        resetMaterialForm();
        await loadAdmin();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMaterial(id: number) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_material", id }),
    });
    if (editingMatId === id) resetMaterialForm();
    setNotice("Materi video dihapus.");
    await loadAdmin();
  }

  // ===== PAKET TRYOUT HANDLERS =====
  function startEditPackage(p: PackagePreview) {
    setShowPkgForm(true);
    setEditingPkgId(p.id);
    setPkgTitle(p.title);
    setPkgLevel(p.level);
    const presets = CONTENT_CLASS_PRESETS[p.level] || [];
    const matchedPreset = presets.find((c) => p.subject.includes(c));
    setPkgClassScope(matchedPreset || presets[0] || "");
    setPkgSubject(p.subject);
    setPkgDesc(p.description);
    setPkgDuration(p.duration_minutes);
    setPkgPremium(p.is_premium);
    setError("");
    setNotice("");
  }

  function resetPackageForm() {
    setEditingPkgId(null);
    setPkgTitle("");
    setPkgLevel("SD/MI");
    setPkgClassScope("Seluruh Kelas SD/MI (Kelas 1–6)");
    setPkgSubject("");
    setPkgDesc("");
    setPkgDuration(30);
    setPkgPremium(true);
  }

  async function handleSavePackage(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const formattedSubject =
        pkgClassScope &&
        !pkgSubject.toLowerCase().includes(pkgClassScope.toLowerCase())
          ? `${pkgClassScope} • ${pkgSubject.trim() || "Mata Pelajaran Umum"}`
          : pkgSubject.trim() || pkgClassScope;
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingPkgId ? "update_package" : "create_package",
          id: editingPkgId,
          title: pkgTitle,
          level: pkgLevel,
          subject: formattedSubject,
          description: pkgDesc,
          duration_minutes: pkgDuration,
          is_premium: pkgPremium,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan paket tryout.");
      } else {
        setNotice(
          editingPkgId
            ? "Paket tryout berhasil diperbarui."
            : "Paket tryout baru berhasil dibuat! Silakan tambahkan soal B/S untuk paket ini."
        );
        if (!editingPkgId && data.item?.id) {
          setQPackageId(Number(data.item.id));
        }
        resetPackageForm();
        setShowPkgForm(false);
        await loadAdmin();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePackage(id: number) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_package", id }),
    });
    if (editingPkgId === id) {
      resetPackageForm();
      setShowPkgForm(false);
    }
    if (qPackageId === id) {
      const fallback = packages.find((p) => p.id !== id);
      if (fallback) setQPackageId(fallback.id);
    }
    setNotice("Paket tryout beserta soalnya dihapus.");
    await loadAdmin();
  }

  // ===== BANK SOAL HANDLERS =====
  function startEditQuestion(q: TryoutQuestion) {
    setEditingQId(q.id);
    setQPackageId(q.package_id);
    setQTopic(q.topic);
    setQStimulus(q.stimulus);
    setQSt1(q.statement_1);
    setQAns1(q.answer_1);
    setQSt2(q.statement_2);
    setQAns2(q.answer_2);
    setQSt3(q.statement_3);
    setQAns3(q.answer_3);
    setQExp(q.explanation);
    setError("");
    setNotice("");
  }

  function resetQuestionForm() {
    setEditingQId(null);
    setQTopic("");
    setQStimulus("");
    setQSt1("");
    setQAns1(true);
    setQSt2("");
    setQAns2(false);
    setQSt3("");
    setQAns3(true);
    setQExp("");
  }

  async function handleSaveQuestion(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingQId ? "update_question" : "create_question",
          id: editingQId,
          package_id: qPackageId,
          topic: qTopic,
          stimulus: qStimulus,
          statement_1: qSt1,
          answer_1: qAns1,
          statement_2: qSt2,
          answer_2: qAns2,
          statement_3: qSt3,
          answer_3: qAns3,
          explanation: qExp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan soal tryout.");
      } else {
        setNotice(
          editingQId
            ? "Soal tryout berhasil diperbarui."
            : "Soal baru (3 pernyataan B/S) berhasil ditambahkan."
        );
        resetQuestionForm();
        await loadAdmin();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteQuestion(id: number, packageId: number) {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_question",
        id,
        package_id: packageId,
      }),
    });
    if (editingQId === id) resetQuestionForm();
    setNotice("Soal tryout dihapus & nomor soal diperbarui.");
    await loadAdmin();
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Memuat Panel Redaksi Liniswara...
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">
        {error}
      </div>
    );
  }

  const levelDistribution = ["SD/MI", "SMP/MTs", "SMA/MA", "SMK/MAK"].map(
    (lvl) => {
      const videoCount = materials.filter((m) => m.grade_level === lvl).length;
      const lvlPackages = packages.filter((p) => p.level === lvl);
      const qCount = lvlPackages.reduce((sum, p) => sum + p.questions.length, 0);
      const studentCount = users.filter((u) => u.grade === lvl).length;
      return { level: lvl, videoCount, qCount, studentCount };
    }
  );

  const filteredCodes = codes.filter((c) => {
    const q = codeSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.code.toLowerCase().includes(q) ||
      c.plan_name.toLowerCase().includes(q) ||
      (c.scope_label || "").toLowerCase().includes(q)
    );
  });

  const filteredMaterials = materials.filter((m) => {
    if (matFilterLevel !== "Semua" && m.grade_level !== matFilterLevel) {
      return false;
    }
    const q = matSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      m.title.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.grade_level.toLowerCase().includes(q)
    );
  });

  const filteredPackagesForAdmin = packages.filter((p) => {
    if (qFilterLevel !== "Semua" && p.level !== qFilterLevel) {
      return false;
    }
    const q = qSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      p.level.toLowerCase().includes(q)
    );
  });

  const selectedPackage =
    packages.find((p) => p.id === qPackageId) || packages[0] || null;

  return (
    <div className="space-y-6">
      {/* NAVIGASI TAB ADMIN + STATUS DB */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Analitik Platform", icon: BarChart3 },
            { id: "redeem", label: "Kode Redeem", icon: KeyRound },
            { id: "materials", label: "Materi Video", icon: PlayCircle },
            { id: "questions", label: "Bank Soal (10×3)", icon: BookOpen },
            { id: "users", label: "Peserta & Nilai Tryout", icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => switchTab(item.id as AdminTab)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  active
                    ? "bg-[#0053FF] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#0053FF] hover:text-[#0053FF]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${active ? "text-[#FFFD00]" : ""}`}
                />
                {item.label}
              </button>
            );
          })}
        </div>

        {stats && (
          <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600">
            DB: {stats.storageMode.toUpperCase()}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
          {notice}
        </div>
      )}

      {/* TAB 1: ANALITIK PLATFORM */}
      {tab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 border-l-4 border-l-[#0053FF] bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Total Pengguna</span>
                <Users className="h-5 w-5 text-[#0053FF]" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.totalUsers} Akun
              </p>
              <p className="mt-1 text-xs font-medium text-emerald-600">
                {stats.activeSubscribers} langganan aktif
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Kode Redeem Aktif</span>
                <KeyRound className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {codes.filter((c) => c.is_active).length} / {codes.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Total klaim: {codes.reduce((s, c) => s + c.used_count, 0)}x
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 border-l-4 border-l-[#48C0B9] bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Materi Video &amp; Paket</span>
                <PlayCircle className="h-5 w-5 text-[#48C0B9]" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.totalMaterials} Video
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stats.totalPackages} paket simulasi SD–SMK
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Bank Soal &amp; Percobaan</span>
                <ClipboardCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {stats.totalQuestions} Soal
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stats.totalQuestions * 3} pernyataan • {stats.totalAttempts}{" "}
                ujian selesai
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-6">
              <h2 className="text-base font-bold text-slate-900">
                Distribusi Konten per Jenjang (SD – SMK)
              </h2>
              <p className="text-xs text-slate-500">
                Perbandingan modul video, soal tryout, dan peserta terdaftar.
              </p>

              <div className="mt-5 space-y-4">
                {levelDistribution.map((row) => (
                  <div
                    key={row.level}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#0053FF]">{row.level}</span>
                      <span className="text-slate-600">
                        {row.videoCount} Video • {row.qCount} Soal (
                        {row.qCount * 3} B/S) • {row.studentCount} Akun
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0053FF] to-[#48C0B9]"
                        style={{
                          width: `${Math.min(100, Math.max(15, row.qCount * 8))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Pemakaian Kuota Kode Redeem
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pantau jumlah voucher buku yang sudah diklaim siswa.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchTab("redeem")}
                  className="text-xs font-bold text-[#0053FF] hover:underline"
                >
                  Kelola →
                </button>
              </div>

              <div className="mt-5 space-y-3.5">
                {codes.slice(0, 5).map((c) => {
                  const pct =
                    c.quota > 0
                      ? Math.min(100, Math.round((c.used_count / c.quota) * 100))
                      : 0;
                  return (
                    <div key={c.id} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">
                          {c.code}
                        </span>
                        <span className="text-slate-500">
                          {c.used_count} / {c.quota} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            c.is_active ? "bg-[#0053FF]" : "bg-slate-400"
                          }`}
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA KODE REDEEM (CRUD LENGKAP) */}
      {tab === "redeem" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <PlusCircle className="h-5 w-5 text-[#0053FF]" />
              {editingCodeId ? "Edit Kode Redeem" : "Terbitkan Kode Redeem Baru"}
            </h2>
            <form onSubmit={handleSaveCode} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">
                  Kode Voucher
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="LINISWARA-2026"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono font-bold uppercase outline-none focus:border-[#0053FF]"
                />
              </div>
              {/* PILIH MODE TARGET KODE: PER JENJANG/KELAS ATAU CUSTOM BUNDLE RUANGGURU STYLE */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setCodeMode("level")}
                  className={`rounded-lg px-2.5 py-2 text-[11px] font-bold transition ${
                    codeMode === "level"
                      ? "bg-white text-[#0053FF] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Per Jenjang / Kelas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCodeMode("custom");
                    if (!editingCodeId && !planName.includes("Bundle")) {
                      setPlanName(
                        `Paket Bundle Kustom Pilihan (${durationDays} Hari)`
                      );
                    }
                  }}
                  className={`rounded-lg px-2.5 py-2 text-[11px] font-bold transition ${
                    codeMode === "custom"
                      ? "bg-white text-[#0053FF] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Custom Multi Video &amp; Kuis
                </button>
              </div>

              {codeMode === "level" ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Target Jenjang Pembuka
                    </label>
                    <SearchableSelect
                      value={codeTargetLevel}
                      searchPlaceholder="Cari jenjang..."
                      onChange={(nextLvl) => {
                        const firstOpt =
                          (REDEEM_SCOPE_OPTIONS[nextLvl] || [])[0]?.label || "";
                        applyRedeemScope(nextLvl, firstOpt, durationDays);
                      }}
                      options={[
                        {
                          value: "Semua Jenjang",
                          label: "Semua Jenjang (SD–SMK)",
                        },
                        { value: "SD/MI", label: "SD/MI" },
                        { value: "SMP/MTs", label: "SMP/MTs" },
                        { value: "SMA/MA", label: "SMA/MA" },
                        { value: "SMK/MAK", label: "SMK/MAK" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Peruntukan Kelas / Jurusan
                    </label>
                    <SearchableSelect
                      value={codeTargetScope}
                      searchPlaceholder="Cari kelas atau jurusan..."
                      onChange={(val) =>
                        applyRedeemScope(codeTargetLevel, val, durationDays)
                      }
                      options={(REDEEM_SCOPE_OPTIONS[codeTargetLevel] || []).map(
                        (opt) => ({
                          value: opt.label,
                          label: opt.label,
                        })
                      )}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[#213A8B]">
                      Pilih Materi Video &amp; Paket Tryout ({bundleMaterialIds.length}{" "}
                      Video, {bundlePackageIds.length} Tryout)
                    </span>
                  </div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={bundleSearch}
                      onChange={(e) => setBundleSearch(e.target.value)}
                      placeholder="Cari judul video atau paket kuis..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0053FF]"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-700">
                      Materi Video Pembelajaran:
                    </p>
                    <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
                      {materials
                        .filter((m) => {
                          const q = bundleSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            m.title.toLowerCase().includes(q) ||
                            m.grade_level.toLowerCase().includes(q) ||
                            m.category.toLowerCase().includes(q)
                          );
                        })
                        .map((m) => (
                          <label
                            key={m.id}
                            className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-blue-50/60"
                          >
                            <input
                              type="checkbox"
                              checked={bundleMaterialIds.includes(m.id)}
                              onChange={() => toggleBundleMaterial(m.id)}
                              className="mt-0.5"
                            />
                            <span className="text-[11px] leading-snug text-slate-700">
                              <strong className="text-[#0053FF]">
                                [{m.grade_level}]
                              </strong>{" "}
                              {m.title}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-700">
                      Paket Kuis / Simulasi Tryout:
                    </p>
                    <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
                      {packages
                        .filter((p) => {
                          const q = bundleSearch.trim().toLowerCase();
                          if (!q) return true;
                          return (
                            p.title.toLowerCase().includes(q) ||
                            p.level.toLowerCase().includes(q) ||
                            p.subject.toLowerCase().includes(q)
                          );
                        })
                        .map((p) => (
                          <label
                            key={p.id}
                            className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-blue-50/60"
                          >
                            <input
                              type="checkbox"
                              checked={bundlePackageIds.includes(p.id)}
                              onChange={() => toggleBundlePackage(p.id)}
                              className="mt-0.5"
                            />
                            <span className="text-[11px] leading-snug text-slate-700">
                              <strong className="text-[#0053FF]">
                                [{p.level}]
                              </strong>{" "}
                              {p.title}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700">
                  Nama Paket (Otomatis / Bisa Diedit)
                </label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-[#0053FF]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">
                  Keterangan
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Voucher sekolah / MGMP"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-[#0053FF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">
                    Durasi (Hari)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">
                    Kuota
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quota}
                    onChange={(e) => setQuota(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {editingCodeId && (
                  <button
                    type="button"
                    onClick={resetCodeForm}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-liniswara flex-1 py-2.5 text-xs"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingCodeId
                    ? "Simpan Perubahan"
                    : "Terbitkan Kode"}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">
                Daftar Kode Redeem ({filteredCodes.length})
              </h2>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={codeSearch}
                  onChange={(e) => setCodeSearch(e.target.value)}
                  placeholder="Cari kode / jenjang..."
                  className="w-52 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0053FF]"
                />
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-3">Kode</th>
                    <th className="py-2 pr-3">Paket &amp; Target</th>
                    <th className="py-2 pr-3">Terpakai</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCodes.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 pr-3 font-mono font-bold text-[#0053FF]">
                        {c.code}
                      </td>
                      <td className="py-3 pr-3 text-slate-700">
                        <p className="font-semibold text-slate-900">
                          {c.plan_name}
                        </p>
                        {c.scope_label && (
                          <span className="mt-1 inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0053FF]">
                            {c.scope_label} • {c.duration_days} hr
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {c.used_count} / {c.quota}
                      </td>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => toggleCode(c.id, c.is_active)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            c.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {c.is_active ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditCode(c)}
                            className="rounded-lg p-1.5 text-[#0053FF] hover:bg-blue-50"
                            title="Edit kode redeem"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCode(c.id)}
                            className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                            title="Hapus kode redeem"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KELOLA MATERI VIDEO (CRUD LENGKAP) */}
      {tab === "materials" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-5">
            <h2 className="text-base font-bold text-slate-900">
              {editingMatId ? "Edit Materi Video" : "Tambah Materi Video Baru"}
            </h2>
            <form
              onSubmit={handleSaveMaterial}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700">
                  Judul Video
                </label>
                <input
                  type="text"
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="Contoh: Pecahan Desimal SD Kelas 5"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-[#0053FF]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Jenjang Video
                  </label>
                  <SearchableSelect
                    value={matLevel}
                    searchPlaceholder="Cari jenjang..."
                    onChange={(nextLvl) => {
                      setMatLevel(nextLvl);
                      const presets = CONTENT_CLASS_PRESETS[nextLvl] || [];
                      if (presets[0]) setMatCategory(presets[0]);
                    }}
                    options={[
                      { value: "SD/MI", label: "SD/MI" },
                      { value: "SMP/MTs", label: "SMP/MTs" },
                      { value: "SMA/MA", label: "SMA/MA" },
                      { value: "SMK/MAK", label: "SMK/MAK" },
                      {
                        value: "Semua Jenjang",
                        label: "Semua Jenjang (SD–SMK)",
                      },
                    ]}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Peruntukan Kelas / Jurusan
                  </label>
                  <SearchableSelect
                    value={matCategory}
                    onChange={setMatCategory}
                    allowCustom={true}
                    customPlaceholder="Contoh: Kelas 5 atau XI RPL Khusus..."
                    searchPlaceholder="Cari kelas atau jurusan..."
                    options={(CONTENT_CLASS_PRESETS[matLevel] || []).map(
                      (opt) => ({
                        value: opt,
                        label: opt,
                      })
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={matSubject}
                    onChange={(e) => setMatSubject(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">
                    Durasi Video
                  </label>
                  <input
                    type="text"
                    value={matDuration}
                    onChange={(e) => setMatDuration(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">
                  ID / URL YouTube
                </label>
                <input
                  type="text"
                  required
                  value={matYoutube}
                  onChange={(e) => setMatYoutube(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">
                  Referensi Buku Liniswara
                </label>
                <input
                  type="text"
                  value={matRef}
                  onChange={(e) => setMatRef(e.target.value)}
                  placeholder="SMART STEPS TKA / Katalog SD-SMK"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700">
                  Ringkasan Materi
                </label>
                <textarea
                  rows={3}
                  required
                  value={matSummary}
                  onChange={(e) => setMatSummary(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <label className="flex items-center gap-2 font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={matPremium}
                  onChange={(e) => setMatPremium(e.target.checked)}
                />
                Memerlukan Kode Redeem (Premium)
              </label>

              <div className="flex gap-2">
                {editingMatId && (
                  <button
                    type="button"
                    onClick={resetMaterialForm}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-liniswara flex-1 py-2.5 text-xs"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingMatId
                    ? "Simpan Perubahan"
                    : "Simpan Materi Video"}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Daftar Materi Video ({filteredMaterials.length})
              </h2>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={matSearch}
                  onChange={(e) => setMatSearch(e.target.value)}
                  placeholder="Cari video / kelas / mapel..."
                  className="w-52 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0053FF]"
                />
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[
                "Semua",
                "SD/MI",
                "SMP/MTs",
                "SMA/MA",
                "SMK/MAK",
                "Semua Jenjang",
              ].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setMatFilterLevel(lvl)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    matFilterLevel === lvl
                      ? "bg-[#0053FF] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2.5">
              {filteredMaterials.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#0053FF]">
                        {m.grade_level} • {m.subject}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          m.is_premium
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {m.is_premium ? "Redeem" : "Pengantar Gratis"}
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-slate-900">{m.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {m.book_reference} • {m.duration}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEditMaterial(m)}
                      className="rounded-lg p-2 text-[#0053FF] hover:bg-blue-50"
                      title="Edit materi"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(m.id)}
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                      title="Hapus materi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KELOLA PAKET TRYOUT & BANK SOAL (CRUD PENUH) */}
      {tab === "questions" && (
        <div className="space-y-6">
          {/* HEADER AKSI PAKET TRYOUT */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Manajemen Paket Tryout &amp; Bank Soal ({packages.length} Paket)
              </h2>
              <p className="text-xs text-slate-500">
                Buat paket tryout baru per jenjang/kelas/jurusan, lalu tambahkan
                soal pilihan ganda kompleks 3 pernyataan B/S.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (showPkgForm && editingPkgId) {
                  resetPackageForm();
                } else {
                  setShowPkgForm((v) => !v);
                  if (showPkgForm) resetPackageForm();
                }
              }}
              className="btn-liniswara text-xs"
            >
              <PlusCircle className="h-4 w-4" />
              {showPkgForm ? "Tutup Form Paket" : "Buat Paket Tryout Baru"}
            </button>
          </div>

          {showPkgForm && (
            <form
              onSubmit={handleSavePackage}
              className="rounded-2xl border border-blue-200 bg-blue-50/40 p-6 text-xs"
            >
              <h3 className="text-sm font-bold text-slate-900">
                {editingPkgId
                  ? "Edit Paket Tryout"
                  : "Buat Paket Tryout Baru (Per Jenjang / Kelas / Jurusan)"}
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-4">
                  <label className="block font-semibold text-slate-700">
                    Judul Paket Tryout
                  </label>
                  <input
                    type="text"
                    required
                    value={pkgTitle}
                    onChange={(e) => setPkgTitle(e.target.value)}
                    placeholder="Contoh: Paket SD/MI Kelas 1 — Membaca & Berhitung"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#0053FF]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block font-semibold text-slate-700">
                    Jenjang
                  </label>
                  <SearchableSelect
                    value={pkgLevel}
                    searchPlaceholder="Cari jenjang..."
                    onChange={(nextLvl) => {
                      setPkgLevel(nextLvl);
                      const presets = CONTENT_CLASS_PRESETS[nextLvl] || [];
                      setPkgClassScope(presets[0] || "");
                    }}
                    options={[
                      { value: "SD/MI", label: "SD/MI" },
                      { value: "SMP/MTs", label: "SMP/MTs" },
                      { value: "SMA/MA", label: "SMA/MA" },
                      { value: "SMK/MAK", label: "SMK/MAK" },
                    ]}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block font-semibold text-slate-700">
                    Peruntukan Kelas / Jurusan
                  </label>
                  <SearchableSelect
                    value={pkgClassScope}
                    onChange={setPkgClassScope}
                    allowCustom={true}
                    customPlaceholder="Kelas / Jurusan kustom..."
                    searchPlaceholder="Cari kelas atau jurusan..."
                    options={(CONTENT_CLASS_PRESETS[pkgLevel] || []).map(
                      (opt) => ({
                        value: opt,
                        label: opt,
                      })
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={pkgSubject}
                    onChange={(e) => setPkgSubject(e.target.value)}
                    placeholder="Matematika & Bahasa"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#0053FF]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={pkgDuration}
                    onChange={(e) => setPkgDuration(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#0053FF]"
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-8">
                  <label className="block font-semibold text-slate-700">
                    Deskripsi Paket
                  </label>
                  <input
                    type="text"
                    value={pkgDesc}
                    onChange={(e) => setPkgDesc(e.target.value)}
                    placeholder="Penjelasan singkat cakupan materi dan tipe soal paket ini"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#0053FF]"
                  />
                </div>
                <div className="flex items-end md:col-span-4">
                  <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={pkgPremium}
                      onChange={(e) => setPkgPremium(e.target.checked)}
                    />
                    Wajib Kode Redeem (Uncheck = Gratis)
                  </label>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-liniswara px-5 py-2.5 text-xs"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingPkgId
                    ? "Simpan Perubahan Paket"
                    : "Buat Paket Tryout"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetPackageForm();
                    setShowPkgForm(false);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-5">
              <h2 className="text-base font-bold text-slate-900">
                {editingQId
                  ? `Edit Soal (Paket #${qPackageId})`
                  : "Tambah Soal Tryout (3 Pernyataan B/S)"}
              </h2>
            <form
              onSubmit={handleSaveQuestion}
              className="mt-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-700">
                    Paket Tryout
                  </label>
                  <SearchableSelect
                    disabled={Boolean(editingQId)}
                    value={String(qPackageId)}
                    searchPlaceholder="Cari paket tryout..."
                    onChange={(val) => setQPackageId(Number(val))}
                    options={packages.map((p) => ({
                      value: String(p.id),
                      label: `${p.level} — ${p.title}`,
                      hint: p.subject,
                    }))}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">
                    Topik Soal
                  </label>
                  <input
                    type="text"
                    required
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    placeholder="Numerasi / Literasi"
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">
                  Wacana / Stimulus Soal
                </label>
                <textarea
                  rows={3}
                  required
                  value={qStimulus}
                  onChange={(e) => setQStimulus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              {[
                {
                  label: "Pernyataan 1",
                  val: qSt1,
                  setVal: setQSt1,
                  ans: qAns1,
                  setAns: setQAns1,
                },
                {
                  label: "Pernyataan 2",
                  val: qSt2,
                  setVal: setQSt2,
                  ans: qAns2,
                  setAns: setQAns2,
                },
                {
                  label: "Pernyataan 3",
                  val: qSt3,
                  setVal: setQSt3,
                  ans: qAns3,
                  setAns: setQAns3,
                },
              ].map((st) => (
                <div key={st.label} className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    required
                    value={st.val}
                    onChange={(e) => st.setVal(e.target.value)}
                    placeholder={st.label}
                    className="col-span-3 rounded-xl border border-slate-300 px-3 py-2"
                  />
                  <select
                    value={st.ans ? "true" : "false"}
                    onChange={(e) => st.setAns(e.target.value === "true")}
                    className="rounded-xl border border-slate-300 bg-white px-2 py-2 font-bold"
                  >
                    <option value="true">Benar</option>
                    <option value="false">Salah</option>
                  </select>
                </div>
              ))}

              <div>
                <label className="block font-semibold text-slate-700">
                  Pembahasan
                </label>
                <textarea
                  rows={2}
                  value={qExp}
                  onChange={(e) => setQExp(e.target.value)}
                  placeholder="Penjelasan kunci jawaban tiap pernyataan"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="flex gap-2">
                {editingQId && (
                  <button
                    type="button"
                    onClick={resetQuestionForm}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-liniswara flex-1 py-2.5 text-xs"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingQId
                    ? "Simpan Perubahan Soal"
                    : "Tambahkan Soal ke Paket"}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4 xl:col-span-7">
            {/* FILTER JENJANG, SEARCH & PEMILIH PAKET */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">
                  Pilih Paket Tryout ({filteredPackagesForAdmin.length}):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={qSearch}
                      onChange={(e) => setQSearch(e.target.value)}
                      placeholder="Cari paket tryout..."
                      className="w-44 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-7 pr-2.5 text-[11px] outline-none focus:border-[#0053FF]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Semua", "SD/MI", "SMP/MTs", "SMA/MA", "SMK/MAK"].map(
                      (lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setQFilterLevel(lvl)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                            qFilterLevel === lvl
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {lvl}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredPackagesForAdmin.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setQPackageId(p.id)}
                      className={`rounded-xl px-3 py-2 text-left text-xs font-bold transition ${
                        qPackageId === p.id
                          ? "bg-[#0053FF] text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span className="block">
                        {p.level} • {p.is_premium ? "Redeem" : "Gratis"} (
                        {p.questions.length} Soal)
                      </span>
                      <span
                        className={`block max-w-[220px] truncate text-[10px] font-medium ${
                          qPackageId === p.id
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        {p.title}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {selectedPackage && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-3.5 text-xs">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#0053FF]">
                        {selectedPackage.level}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          selectedPackage.is_premium
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {selectedPackage.is_premium
                          ? "Paket Lanjutan (Redeem)"
                          : "Gratis (Diagnostic Test)"}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {selectedPackage.duration_minutes} Menit
                      </span>
                    </div>
                    <p className="mt-1 font-bold text-slate-900">
                      {selectedPackage.title}
                    </p>
                    <p className="text-slate-600">
                      {selectedPackage.subject} •{" "}
                      {selectedPackage.questions.length} soal (
                      {selectedPackage.questions.length * 3} pernyataan
                      Benar/Salah)
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEditPackage(selectedPackage)}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0053FF] hover:bg-blue-50"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit Paket
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(selectedPackage.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus Paket
                    </button>
                  </div>
                </div>

                {selectedPackage.questions.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-[#0053FF] px-2.5 py-1 font-bold text-white">
                          #{q.question_number}
                        </span>
                        <span className="font-bold text-slate-900">
                          {q.topic}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditQuestion(q)}
                          className="rounded-lg p-1.5 text-[#0053FF] hover:bg-blue-50"
                          title="Edit soal"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteQuestion(q.id, q.package_id)
                          }
                          className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                          title="Hapus soal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-2.5 rounded-xl bg-slate-50 p-3 leading-relaxed text-slate-700">
                      {q.stimulus}
                    </p>

                    <div className="mt-3 space-y-1.5">
                      {[
                        { text: q.statement_1, ans: q.answer_1 },
                        { text: q.statement_2, ans: q.answer_2 },
                        { text: q.statement_3, ans: q.answer_3 },
                      ].map((st, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-1.5"
                        >
                          <span className="text-slate-700">
                            {idx + 1}. {st.text}
                          </span>
                          <span
                            className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                              st.ans
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {st.ans ? "Benar" : "Salah"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="mt-2.5 text-[11px] text-slate-500">
                        <strong className="text-[#0053FF]">Pembahasan:</strong>{" "}
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATA PESERTA & RIWAYAT NILAI TRYOUT SISWA */}
      {tab === "users" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <ClipboardCheck className="h-5 w-5 text-[#0053FF]" />
              Riwayat Nilai Simulasi Tryout Siswa ({attempts.length})
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Pantau hasil pengerjaan simulasi tryout seluruh siswa di semua
              jenjang.
            </p>

            {attempts.length === 0 ? (
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                Belum ada peserta yang menyelesaikan simulasi tryout.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2.5 pr-4">Peserta</th>
                      <th className="py-2.5 pr-4">Sekolah &amp; Jenjang</th>
                      <th className="py-2.5 pr-4">Paket Tryout</th>
                      <th className="py-2.5 pr-4">Skor</th>
                      <th className="py-2.5 pr-4">Pernyataan Tepat</th>
                      <th className="py-2.5 pr-4">Soal Sempurna</th>
                      <th className="py-2.5">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempts.map((a) => (
                      <tr key={a.id}>
                        <td className="py-3 pr-4">
                          <p className="font-bold text-slate-900">
                            {a.user_name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {a.user_email}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {a.user_school} • {a.user_grade}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-slate-800">
                          <span className="mr-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-[#0053FF]">
                            {a.package_level}
                          </span>
                          {a.package_title}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-bold text-emerald-700">
                            {Number(a.score).toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {a.correct_statements} / {a.total_statements}
                        </td>
                        <td className="py-3 pr-4 text-slate-700">
                          {a.perfect_questions} soal
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Date(a.created_at).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-bold text-slate-900">
              Data Seluruh Pengguna Terdaftar ({users.length})
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Mencakup siswa SD/MI, SMP/MTs, SMA/MA, SMK/MAK, Guru MGMP, dan
              akun Admin.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 pr-4">Nama</th>
                    <th className="py-2.5 pr-4">Email</th>
                    <th className="py-2.5 pr-4">Sekolah &amp; Jenjang</th>
                    <th className="py-2.5 pr-4">Peran</th>
                    <th className="py-2.5">Langganan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 pr-4 font-bold text-slate-900">
                        {u.name}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{u.email}</td>
                      <td className="py-3 pr-4 text-slate-600">
                        {u.school} • {u.grade}
                      </td>
                      <td className="py-3 pr-4 uppercase text-slate-500">
                        {u.role}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            u.subscription_status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {u.subscription_status === "active"
                            ? u.subscription_plan || "Aktif"
                            : "Gratis"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Memuat Panel Redaksi Liniswara...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
