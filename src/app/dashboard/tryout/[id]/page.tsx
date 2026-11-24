"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Flag,
  KeyRound,
  Play,
  XCircle,
} from "lucide-react";
import type {
  PublicTryoutQuestion,
  QuestionUserAnswer,
  StatementAnswer,
  TryoutAttempt,
  TryoutPackage,
  TryoutQuestion,
} from "@/types";

interface ReviewItem {
  question: TryoutQuestion;
  userAnswers: [StatementAnswer, StatementAnswer, StatementAnswer];
  correctCount: number;
}

function TryoutRunnerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const packageId = String(params.id || "1");
  const attemptId = searchParams.get("attemptId");

  const [pkg, setPkg] = useState<TryoutPackage | null>(null);
  const [questions, setQuestions] = useState<PublicTryoutQuestion[]>([]);
  const [answers, setAnswers] = useState<
    Record<number, [StatementAnswer, StatementAnswer, StatementAnswer]>
  >({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(1800);
  const [totalSeconds, setTotalSeconds] = useState(1800);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [examStarted, setExamStarted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [result, setResult] = useState<{
    attempt: TryoutAttempt;
    review: ReviewItem[];
  } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const url = attemptId
          ? `/api/tryout/${packageId}?attemptId=${attemptId}`
          : `/api/tryout/${packageId}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Gagal memuat simulasi tryout.");
          setLoading(false);
          return;
        }
        setPkg(data.package);

        if (data.savedResult) {
          setResult(data.savedResult);
          setQuestions(
            (data.savedResult.review || []).map(
              (r: ReviewItem) => r.question
            )
          );
          setLoading(false);
          return;
        }

        const qs: PublicTryoutQuestion[] = data.questions || [];
        setQuestions(qs);

        const initialAns: Record<
          number,
          [StatementAnswer, StatementAnswer, StatementAnswer]
        > = {};
        for (const q of qs) {
          initialAns[q.id] = [null, null, null];
        }
        setAnswers(initialAns);

        const dur = (data.package?.duration_minutes || 30) * 60;
        setSecondsLeft(dur);
        setTotalSeconds(dur);
      } catch {
        setError("Terjadi gangguan jaringan saat memuat soal.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [packageId, attemptId]);

  const handleSubmit = useCallback(async () => {
    if (submitting || result || questions.length === 0) return;
    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      const payloadAnswers: QuestionUserAnswer[] = questions.map((q) => ({
        questionId: q.id,
        questionNumber: q.question_number,
        answers: answers[q.id] || [null, null, null],
      }));

      const res = await fetch(`/api/tryout/${packageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: payloadAnswers,
          durationSeconds: Math.max(1, totalSeconds - secondsLeft),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan jawaban tryout.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Gagal mengirim jawaban. Periksa koneksi Anda.");
    } finally {
      setSubmitting(false);
    }
  }, [
    answers,
    packageId,
    questions,
    result,
    secondsLeft,
    submitting,
    totalSeconds,
  ]);

  useEffect(() => {
    if (!examStarted || loading || error || result || questions.length === 0)
      return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, loading, error, result, questions.length, handleSubmit]);

  function setStatementAnswer(
    questionId: number,
    statementIdx: 0 | 1 | 2,
    value: boolean
  ) {
    setAnswers((prev) => {
      const current = prev[questionId] || [null, null, null];
      const next: [StatementAnswer, StatementAnswer, StatementAnswer] = [
        ...current,
      ] as [StatementAnswer, StatementAnswer, StatementAnswer];
      next[statementIdx] = value;
      return { ...prev, [questionId]: next };
    });
  }

  function formatTimer(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Menyiapkan lembar simulasi tryout...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-600" />
        <h2 className="mt-3 text-lg font-bold text-slate-900">
          Simulasi Memerlukan Aktivasi Kode Redeem
        </h2>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard/tryout"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700"
          >
            Kembali
          </Link>
          <Link href="/dashboard/redeem" className="btn-liniswara text-xs">
            <KeyRound className="h-4 w-4" />
            Aktivasi Kode Redeem
          </Link>
        </div>
      </div>
    );
  }

  // HASIL & PEMBAHASAN (BAIK BARU SUBMIT MAUPUN DARI RIWAYAT ?attemptId=)
  if (result) {
    const { attempt, review } = result;
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-[#0053FF] to-[#213A8B] p-6 text-white sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-[#FFFD00]">
                {attemptId ? "Arsip Pembahasan Tryout" : "Hasil Simulasi"}{" "}
                {pkg?.level}
              </span>
              <h1 className="mt-2 text-xl font-bold sm:text-2xl">
                {pkg?.title}
              </h1>
              <p className="mt-2 text-sm text-blue-100">
                Pernyataan tepat:{" "}
                <strong>
                  {attempt.correct_statements} dari {attempt.total_statements}
                </strong>{" "}
                • Soal sempurna (3/3 benar):{" "}
                <strong>
                  {attempt.perfect_questions} dari {review.length} soal
                </strong>
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 px-8 py-4 text-center backdrop-blur">
              <span className="block text-[11px] font-bold uppercase text-[#FFFD00]">
                Skor Akhir
              </span>
              <span className="text-4xl font-extrabold text-white">
                {Number(attempt.score).toFixed(1)}
              </span>
              <span className="block text-[11px] text-blue-100">
                Skala 0 – 100
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/tryout"
              className="btn-liniswara-outline text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              Daftar Paket Tryout
            </Link>
            <Link
              href={`/dashboard/tryout/${packageId}`}
              onClick={() => {
                if (!attemptId) window.location.reload();
              }}
              className="rounded-[10px] border border-white/40 px-4 py-2 text-xs font-semibold text-white hover:border-[#FFFD00] hover:text-[#FFFD00]"
            >
              Kerjakan Simulasi Lagi
            </Link>
          </div>
        </div>

        {pkg && !pkg.is_premium && (
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-blue-50/50 p-5 sm:flex-row sm:items-center">
            <div className="text-xs">
              <p className="font-bold text-slate-900">
                Sudah Selesai Uji Coba Diagnostic Test {pkg.level}?
              </p>
              <p className="mt-0.5 text-slate-600">
                Buka <strong>Paket Tryout Lanjutan per Kelas/Jurusan</strong>{" "}
                serta <strong>Video Pembahasan Konsep</strong> jenjang{" "}
                {pkg.level} dengan memasukkan kode redeem buku Liniswara Anda.
              </p>
            </div>
            <Link
              href="/dashboard/redeem"
              className="btn-liniswara shrink-0 text-xs"
            >
              <KeyRound className="h-4 w-4" />
              Buka Paket Lanjutan {pkg.level}
            </Link>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Pembahasan Tiap Soal &amp; Pernyataan ({review.length} Soal)
          </h2>

          {review.map((item) => {
            const q = item.question;
            const statements = [
              { text: q.statement_1, key: q.answer_1, user: item.userAnswers[0] },
              { text: q.statement_2, key: q.answer_2, user: item.userAnswers[1] },
              { text: q.statement_3, key: q.answer_3, user: item.userAnswers[2] },
            ];
            return (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#0053FF] px-2.5 py-1 text-xs font-bold text-white">
                      Soal #{q.question_number}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {q.topic}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.correctCount === 3
                        ? "bg-emerald-100 text-emerald-700"
                        : item.correctCount >= 2
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    Tepat {item.correctCount} / 3 Pernyataan
                  </span>
                </div>

                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {q.stimulus}
                </p>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-4">Pernyataan</th>
                        <th className="py-2 pr-4 text-center">Jawaban Anda</th>
                        <th className="py-2 text-center">Kunci</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {statements.map((st, idx) => {
                        const isRight = st.user === st.key;
                        return (
                          <tr key={idx}>
                            <td className="py-3 pr-4 font-medium text-slate-800">
                              {idx + 1}. {st.text}
                            </td>
                            <td className="py-3 pr-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold ${
                                  isRight
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {isRight ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                {st.user === null
                                  ? "Kosong"
                                  : st.user
                                  ? "Benar"
                                  : "Salah"}
                              </span>
                            </td>
                            <td className="py-3 text-center font-bold text-[#0053FF]">
                              {st.key ? "Benar" : "Salah"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 rounded-xl bg-blue-50/70 p-4 text-xs leading-relaxed text-slate-700">
                  <strong className="text-[#0053FF]">Pembahasan: </strong>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // TAHAP 1: LOBI PETUNJUK SEBELUM TIMER DIMULAI
  if (!examStarted) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard/tryout"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0053FF]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Paket Tryout
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#0053FF] to-[#213A8B] p-6 text-white sm:p-8">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-[#FFFD00]">
              Jenjang {pkg?.level}
            </span>
            <h1 className="mt-3 text-xl font-bold sm:text-2xl">{pkg?.title}</h1>
            <p className="mt-1 text-xs text-blue-100">{pkg?.subject}</p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <ClipboardCheck className="mx-auto h-5 w-5 text-[#0053FF]" />
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {questions.length} Soal
                </p>
                <p className="text-[11px] text-slate-500">
                  Total {questions.length * 3} pernyataan B/S
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <Clock className="mx-auto h-5 w-5 text-[#48C0B9]" />
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {pkg?.duration_minutes} Menit
                </p>
                <p className="text-[11px] text-slate-500">
                  Waktu mulai berjalan saat klik Mulai
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />
                <p className="mt-2 text-lg font-bold text-slate-900">
                  Skor Instan
                </p>
                <p className="text-[11px] text-slate-500">
                  Lengkap dengan pembahasan soal
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <h2 className="text-sm font-bold text-slate-900">
                Petunjuk Pengerjaan Simulasi
              </h2>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
                <li>
                  1. Baca wacana atau stimulus soal dengan cermat pada setiap
                  nomor.
                </li>
                <li>
                  2. Setiap 1 soal terdiri dari <strong>3 pernyataan</strong>.
                  Pilih <strong>Benar</strong> atau <strong>Salah</strong>{" "}
                  untuk masing-masing pernyataan.
                </li>
                <li>
                  3. Anda dapat berpindah nomor secara bebas melalui kotak
                  navigator dan menandai soal yang masih <em>Ragu-Ragu</em>.
                </li>
                <li>
                  4. Jika waktu habis, jawaban yang sudah dipilih akan otomatis
                  dikumpulkan dan dinilai oleh sistem.
                </li>
              </ul>
            </div>

            <div className="mt-7 flex flex-col justify-end gap-3 sm:flex-row">
              <Link
                href="/dashboard/tryout"
                className="rounded-xl border border-slate-300 px-5 py-3 text-center text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </Link>
              <button
                type="button"
                onClick={() => setExamStarted(true)}
                className="btn-liniswara px-6 py-3 text-xs"
              >
                <Play className="h-4 w-4" />
                Mulai Kerjakan Tryout Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TAHAP 2: MODE PENGERJAAN UJIAN
  const activeQ = questions[currentIndex];
  const activeAnswers = activeQ
    ? answers[activeQ.id] || [null, null, null]
    : [null, null, null];

  const completedQuestionsCount = questions.filter((q) => {
    const a = answers[q.id];
    return a && a[0] !== null && a[1] !== null && a[2] !== null;
  }).length;

  const totalStatementsAnswered = questions.reduce((acc, q) => {
    const a = answers[q.id] || [null, null, null];
    return acc + a.filter((v) => v !== null).length;
  }, 0);

  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const remainingStatements = questions.length * 3 - totalStatementsAnswered;

  return (
    <div className="space-y-6">
      {/* HEADER TRYOUT */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0053FF]">
            {pkg?.level} • {questions.length} Soal × 3 Pernyataan Benar/Salah
          </span>
          <h1 className="text-base font-bold text-slate-900 sm:text-lg">
            {pkg?.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-sm font-bold ${
              secondsLeft < 300
                ? "bg-rose-100 text-rose-700"
                : "bg-blue-50 text-[#0053FF]"
            }`}
          >
            <Clock className="h-4 w-4" />
            {formatTimer(secondsLeft)}
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => setShowConfirmModal(true)}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Menilai..." : "Selesai & Kumpulkan"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {activeQ && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-[#0053FF] px-3 py-1 text-xs font-bold text-white">
                  Soal {activeQ.question_number} dari {questions.length}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {activeQ.topic}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFlagged((prev) => ({
                    ...prev,
                    [activeQ.id]: !prev[activeQ.id],
                  }))
                }
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  flagged[activeQ.id]
                    ? "bg-amber-100 text-amber-800"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                {flagged[activeQ.id] ? "Ragu-Ragu" : "Tandai Ragu-Ragu"}
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Bacaan / Stimulus Soal
              </p>
              <p className="text-sm leading-relaxed text-slate-800 sm:text-base">
                {activeQ.stimulus}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold text-slate-700">
                Pilih <span className="text-emerald-700">Benar</span> atau{" "}
                <span className="text-rose-700">Salah</span> untuk masing-masing
                dari 3 pernyataan berikut:
              </p>

              <div className="mt-3 space-y-3">
                {[
                  activeQ.statement_1,
                  activeQ.statement_2,
                  activeQ.statement_3,
                ].map((statementText, idx) => {
                  const sIdx = idx as 0 | 1 | 2;
                  const val = activeAnswers[sIdx];
                  return (
                    <div
                      key={idx}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        <span className="mr-2 font-bold text-[#0053FF]">
                          {idx + 1}.
                        </span>
                        {statementText}
                      </p>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setStatementAnswer(activeQ.id, sIdx, true)
                          }
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                            val === true
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "border border-slate-300 bg-white text-slate-700 hover:bg-emerald-50"
                          }`}
                        >
                          Benar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStatementAnswer(activeQ.id, sIdx, false)
                          }
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                            val === false
                              ? "bg-rose-600 text-white shadow-sm"
                              : "border border-slate-300 bg-white text-slate-700 hover:bg-rose-50"
                          }`}
                        >
                          Salah
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                ← Sebelumnya
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((i) =>
                      Math.min(questions.length - 1, i + 1)
                    )
                  }
                  className="btn-liniswara px-5 py-2.5 text-xs"
                >
                  Soal Berikutnya →
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowConfirmModal(true)}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Kumpulkan Jawaban
                </button>
              )}
            </div>
          </div>
        )}

        {/* NAVIGATOR NOMOR SOAL */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-900">
              Nomor Soal ({completedQuestionsCount}/{questions.length})
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {totalStatementsAnswered} dari {questions.length * 3} pernyataan
              terisi
            </p>

            <div className="mt-4 grid max-h-72 grid-cols-5 gap-2 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const ans = answers[q.id] || [null, null, null];
                const allFilled =
                  ans[0] !== null && ans[1] !== null && ans[2] !== null;
                const partialFilled = ans.some((v) => v !== null) && !allFilled;
                const isFlagged = Boolean(flagged[q.id]);
                const isCurrent = idx === currentIndex;

                let btnStyle =
                  "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";
                if (isFlagged) {
                  btnStyle = "border-amber-400 bg-amber-100 text-amber-900";
                } else if (allFilled) {
                  btnStyle = "border-emerald-500 bg-emerald-600 text-white";
                } else if (partialFilled) {
                  btnStyle = "border-blue-300 bg-blue-100 text-[#0053FF]";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`rounded-xl border py-2.5 text-xs font-bold transition ${btnStyle} ${
                      isCurrent ? "ring-2 ring-[#0053FF] ring-offset-2" : ""
                    }`}
                  >
                    {q.question_number}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-600" />
                <span>3 pernyataan sudah dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-blue-200" />
                <span>Baru sebagian terjawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-amber-300" />
                <span>Ditandai ragu-ragu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI SEBELUM KUMPULKAN */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Konfirmasi Pengumpulan Jawaban
                </h3>
                <p className="text-xs text-slate-500">
                  Pastikan seluruh pernyataan sudah Anda periksa.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Soal terjawab lengkap:</span>
                <span className="font-bold text-slate-900">
                  {completedQuestionsCount} / {questions.length} soal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pernyataan terisi:</span>
                <span className="font-bold text-slate-900">
                  {totalStatementsAnswered} / {questions.length * 3} pernyataan
                </span>
              </div>
              {flaggedCount > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>Ditandai ragu-ragu:</span>
                  <span className="font-bold">{flaggedCount} soal</span>
                </div>
              )}
              {remainingStatements > 0 && (
                <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 font-semibold text-rose-700">
                  Masih ada {remainingStatements} pernyataan yang belum Anda
                  isi.
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Periksa Ulang
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                {submitting ? "Menilai..." : "Ya, Kumpulkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TryoutRunnerPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Menyiapkan lembar simulasi tryout...
        </div>
      }
    >
      <TryoutRunnerContent />
    </Suspense>
  );
}
