"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, UserCheck, LogIn } from "lucide-react";
import type { SafeUser } from "@/types";

interface NavbarProps {
  user: SafeUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const solidHeader = isScrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-white transition-all duration-500 ease-in-out ${
        solidHeader
          ? "border-b border-white/15 bg-[#0053FF]/95 py-2.5 shadow-lg backdrop-blur-md"
          : "border-b border-white/10 bg-transparent py-4"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-liniswara.png"
            alt="Logo Penerbit Liniswara"
            className={`w-auto object-contain transition-all duration-300 ${
              isScrolled ? "h-9 sm:h-10" : "h-10 sm:h-11"
            }`}
          />
          <div className="hidden border-l border-white/30 pl-3 leading-tight sm:block">
            <span className="block text-xs font-bold tracking-wide text-white">
              Portal Tryout &amp; Belajar
            </span>
            <span className="block text-[11px] font-medium text-[#FFFD00]">
              SD • SMP • SMA • SMK
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <a
            href="#beranda"
            className="text-white transition-colors duration-200 hover:text-[#FFFD00]"
          >
            Beranda
          </a>
          <a
            href="#jenjang"
            className="text-white transition-colors duration-200 hover:text-[#FFFD00]"
          >
            Jenjang Belajar
          </a>
          <a
            href="#tentang"
            className="text-white transition-colors duration-200 hover:text-[#FFFD00]"
          >
            Tentang Kami
          </a>
          <a
            href="#redeem"
            className="text-white transition-colors duration-200 hover:text-[#FFFD00]"
          >
            Kode Redeem
          </a>
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#FFFD00] px-4 py-2 text-sm font-semibold text-[#0053FF] shadow-sm transition hover:bg-white"
            >
              <UserCheck className="h-4 w-4" />
              Portal Belajar ({user.name.split(" ")[0]})
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/50 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:border-[#FFFD00] hover:bg-white/20 hover:text-[#FFFD00]"
              >
                <LogIn className="h-4 w-4" />
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-[10px] bg-white px-4 py-2 text-sm font-semibold text-[#0053FF] shadow-sm transition hover:bg-[#FFFD00]"
              >
                Daftar Gratis
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
          aria-label="Buka menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="mt-2 border-t border-white/15 bg-[#0053FF] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium">
            <a
              href="#beranda"
              onClick={() => setOpen(false)}
              className="py-1 text-white hover:text-[#FFFD00]"
            >
              Beranda
            </a>
            <a
              href="#jenjang"
              onClick={() => setOpen(false)}
              className="py-1 text-white hover:text-[#FFFD00]"
            >
              Jenjang Belajar (SD – SMK)
            </a>
            <a
              href="#tentang"
              onClick={() => setOpen(false)}
              className="py-1 text-white hover:text-[#FFFD00]"
            >
              Tentang Kami
            </a>
            <a
              href="#redeem"
              onClick={() => setOpen(false)}
              className="py-1 text-white hover:text-[#FFFD00]"
            >
              Kode Redeem
            </a>
            <div className="mt-2 flex gap-2 border-t border-white/15 pt-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex-1 rounded-[10px] bg-[#FFFD00] px-4 py-2.5 text-center font-semibold text-[#0053FF]"
                >
                  Portal Belajar
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex-1 rounded-[10px] border border-white/60 px-4 py-2.5 text-center text-white"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 rounded-[10px] bg-white px-4 py-2.5 text-center font-semibold text-[#0053FF]"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
