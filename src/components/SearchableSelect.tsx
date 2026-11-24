"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Edit3, Search, X } from "lucide-react";

export interface SearchableOption {
  value: string;
  label: string;
  hint?: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari pilihan...",
  allowCustom = false,
  customPlaceholder = "Ketik nilai kustom lalu tekan Terapkan...",
  disabled = false,
  className = "",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const isCurrentValueCustom =
    allowCustom && Boolean(value) && !selectedOption;

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.hint && o.hint.toLowerCase().includes(q)) ||
        o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

  if (customMode) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={customDraft}
            onChange={(e) => {
              setCustomDraft(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={customPlaceholder}
            autoFocus
            className="w-full rounded-xl border border-[#0053FF] bg-white px-3 py-2 text-xs outline-none ring-2 ring-[#0053FF]/15"
          />
          <button
            type="button"
            onClick={() => {
              setCustomMode(false);
              setQuery("");
            }}
            className="shrink-0 rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
            title="Kembali ke daftar pilihan"
          >
            Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        title={
          selectedOption
            ? selectedOption.label
            : isCurrentValueCustom
            ? value
            : placeholder
        }
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
            setQuery("");
          }
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-xs transition focus:border-[#0053FF] focus:outline-none ${
          disabled
            ? "cursor-not-allowed bg-slate-100 text-slate-500"
            : "hover:border-[#0053FF]"
        }`}
      >
        <span className="truncate font-medium text-slate-800">
          {selectedOption
            ? selectedOption.label
            : isCurrentValueCustom
            ? `${value} (Kustom)`
            : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180 text-[#0053FF]" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 w-full min-w-[260px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              autoFocus
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2.5 text-center text-[11px] text-slate-400">
                Tidak ada pilihan yang cocok.
              </p>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                      isSelected
                        ? "bg-blue-50 font-bold text-[#0053FF]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block whitespace-normal break-words leading-snug">
                        {opt.label}
                      </span>
                      {opt.hint && (
                        <span className="mt-0.5 block whitespace-normal break-words text-[10px] font-normal text-slate-400">
                          {opt.hint}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0053FF]" />
                    )}
                  </button>
                );
              })
            )}

            {allowCustom && (
              <div className="mt-1 border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const initial =
                      query.trim() || (isCurrentValueCustom ? value : "");
                    setCustomDraft(initial);
                    if (initial) onChange(initial);
                    setCustomMode(true);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-[#0053FF] hover:bg-blue-50"
                >
                  <Edit3 className="h-3.5 w-3.5 shrink-0" />
                  {query.trim()
                    ? `Pakai kustom: "${query.trim()}"`
                    : "Kustom (Isi Manual)"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
