"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  PlayCircle,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import type { SafeUser } from "@/types";

interface DashboardShellProps {
  user: SafeUser;
  children: React.ReactNode;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function DashboardShellInner({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = user.role === "admin";
  const currentAdminTab = searchParams.get("tab") || "overview";

  const isActiveSub =
    user.subscription_status === "active" &&
    (!user.subscription_expires_at ||
      new Date(user.subscription_expires_at).getTime() > Date.now());

  const studentMenu = [
    {
      href: "/dashboard",
      label: "Beranda Belajar",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/materi",
      label: "Materi Video",
      icon: PlayCircle,
    },
    {
      href: "/dashboard/tryout",
      label: "Simulasi Tryout",
      icon: ClipboardCheck,
    },
    {
      href: "/dashboard/redeem",
      label: "Aktivasi Kode Redeem",
      icon: KeyRound,
    },
  ];

  const adminMenu = [
    {
      href: "/dashboard/admin?tab=overview",
      tab: "overview",
      label: "Dashboard Analitik",
      icon: ShieldCheck,
    },
    {
      href: "/dashboard/admin?tab=redeem",
      tab: "redeem",
      label: "Kelola Kode Redeem",
      icon: KeyRound,
    },
    {
      href: "/dashboard/admin?tab=materials",
      tab: "materials",
      label: "Kelola Materi Video",
      icon: PlayCircle,
    },
    {
      href: "/dashboard/admin?tab=questions",
      tab: "questions",
      label: "Kelola Bank Soal",
      icon: BookOpen,
    },
    {
      href: "/dashboard/admin?tab=users",
      tab: "users",
      label: "Peserta & Nilai Tryout",
      icon: Users,
    },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isStudentLinkActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  function handleHamburgerClick() {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsCollapsed((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  }

  function renderSidebar(collapsedMode: boolean) {
    return (
      <div className="flex h-full flex-col border-r border-slate-200/90 bg-white text-slate-800 shadow-sm transition-colors duration-300">
        {/* HEADER SIDEBAR BERMOTIF SERAGAM CERAH */}
        <div
          className={`relative flex h-16 items-center overflow-hidden bg-[#0053FF] px-3 ${
            collapsedMode ? "justify-center" : "justify-between px-4"
          }`}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-repeat bg-[length:260px_auto] opacity-40"
            style={{ backgroundImage: "url('/images/bg12.png')" }}
          />
          <Link
            href={isAdmin ? "/dashboard/admin?tab=overview" : "/dashboard"}
            className="relative z-10 flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-liniswara.png"
              alt="Logo Liniswara"
              className={`w-auto object-contain transition-all duration-300 ${
                collapsedMode ? "h-6 max-w-[56px]" : "h-9"
              }`}
            />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="relative z-10 rounded-lg p-1.5 text-white hover:bg-white/15 lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PROFIL PENGGUNA */}
        <div className="border-b border-slate-100 p-3.5">
          {collapsedMode ? (
            <div
              title={`${user.name} (${isAdmin ? "Admin Redaksi" : user.grade})`}
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0053FF] to-[#213A8B] text-xs font-bold text-white shadow-sm"
            >
              {getInitials(user.name)}
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-100/70 bg-gradient-to-br from-slate-50 to-blue-50/60 p-3.5 transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0053FF] to-[#213A8B] text-xs font-bold text-white shadow-sm">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {user.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {user.school}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#0053FF]">
                  {isAdmin ? "Admin Redaksi" : user.grade}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    isActiveSub
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <Award className="h-3 w-3" />
                  {isActiveSub ? "Aktif" : "Gratis"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* NAVIGASI MENU BERDASARKAN ROLE */}
        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {isAdmin ? (
            <>
              <div>
                {!collapsedMode && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Manajemen Redaksi
                  </p>
                )}
                <nav className="mt-2 space-y-1.5">
                  {adminMenu.map((item) => {
                    const Icon = item.icon;
                    const active =
                      pathname === "/dashboard/admin" &&
                      currentAdminTab === item.tab;
                    return (
                      <Link
                        key={item.tab}
                        href={item.href}
                        title={collapsedMode ? item.label : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                          collapsedMode ? "justify-center px-2" : "gap-3 px-3.5"
                        } ${
                          active
                            ? "bg-gradient-to-r from-[#0053FF] to-[#1D4ED8] text-white shadow-md shadow-blue-500/20"
                            : "text-slate-600 hover:translate-x-0.5 hover:bg-blue-50/80 hover:text-[#0053FF]"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            active
                              ? "text-[#FFFD00]"
                              : "text-slate-400 group-hover:text-[#0053FF]"
                          }`}
                        />
                        {!collapsedMode && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </>
          ) : (
            <div>
              {!collapsedMode && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Menu Belajar
                </p>
              )}
              <nav className="mt-2 space-y-1.5">
                {studentMenu.map((item) => {
                  const Icon = item.icon;
                  const active = isStudentLinkActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsedMode ? item.label : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`group flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                        collapsedMode ? "justify-center px-2" : "gap-3 px-3.5"
                      } ${
                        active
                          ? "bg-gradient-to-r from-[#0053FF] to-[#1D4ED8] text-white shadow-md shadow-blue-500/20"
                          : "text-slate-600 hover:translate-x-0.5 hover:bg-blue-50/80 hover:text-[#0053FF]"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          active
                            ? "text-[#FFFD00]"
                            : "text-slate-400 group-hover:text-[#0053FF]"
                        }`}
                      />
                      {!collapsedMode && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* FOOTER SIDEBAR */}
        <div className="space-y-1 border-t border-slate-100 p-3">
          <Link
            href="/"
            title={collapsedMode ? "Halaman Utama Web" : undefined}
            className={`flex items-center rounded-xl py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 ${
              collapsedMode ? "justify-center px-2" : "gap-3 px-3.5"
            }`}
          >
            <Home className="h-4 w-4 shrink-0" />
            {!collapsedMode && <span>Halaman Utama Web</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title={collapsedMode ? "Keluar Akun" : undefined}
            className={`flex w-full items-center rounded-xl py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 ${
              collapsedMode ? "justify-center px-2" : "gap-3 px-3.5"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsedMode && <span>Keluar Akun</span>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F4F7FE]">
      {/* SIDEBAR DESKTOP COLLAPSIBLE */}
      <aside
        className={`hidden shrink-0 transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:block lg:h-screen ${
          isCollapsed ? "w-20" : "w-68 lg:w-[272px]"
        }`}
      >
        {renderSidebar(isCollapsed)}
      </aside>

      {/* DRAWER MOBILE */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw]">
            {renderSidebar(false)}
          </div>
        </div>
      )}

      {/* AREA KONTEN RESPONSIF PENUH */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3.5">
            {/* TOMBOL HAMBURGER DESKTOP & MOBILE */}
            <button
              type="button"
              onClick={handleHamburgerClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#0053FF] hover:bg-blue-50/50 hover:text-[#0053FF]"
              title={
                isCollapsed
                  ? "Buka Sidebar"
                  : "Perkecil / Sembunyikan Sidebar"
              }
              aria-label="Toggle sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {isAdmin
                  ? "Liniswara Redaksi"
                  : "Portal Belajar Liniswara"}
              </p>
              <p className="text-sm font-bold text-slate-900">
                {isAdmin
                  ? "Dashboard Redaksi & Manajemen Platform"
                  : `Ruang Belajar ${user.grade}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isAdmin && !isActiveSub && (
              <Link
                href="/dashboard/redeem"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0053FF] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#FFFD00] hover:text-[#0053FF]"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Aktivasi Kode Redeem</span>
                <span className="sm:hidden">Redeem</span>
              </Link>
            )}
            {!isAdmin && isActiveSub && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <Award className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Langganan Aktif</span>
                <span className="sm:hidden">Aktif</span>
              </span>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0053FF]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Mode Administrator
              </span>
            )}
          </div>
        </header>

        <main
          className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8"
          style={{
            backgroundImage: "url('/images/pattern-academic-light.svg')",
          }}
        >
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell({
  user,
  children,
}: DashboardShellProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F4F7FE] text-sm text-slate-500">
          Memuat ruang kerja...
        </div>
      }
    >
      <DashboardShellInner user={user}>{children}</DashboardShellInner>
    </Suspense>
  );
}
