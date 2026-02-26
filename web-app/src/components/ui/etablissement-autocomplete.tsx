"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";

interface Etablissement {
  ETAB_NOM: string;
  ADRESSE: string | null;
  MUN_NOM: string | null;
  CODE_POSTA: string | null;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Appelé aussi avec l'adresse complète quand un établissement est sélectionné */
  onSelectAdresse?: (adresse: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function EtablissementAutocomplete({
  value,
  onChange,
  onSelectAdresse,
  placeholder = "Nom de l'établissement",
  className = "",
  autoFocus = false,
}: Props) {
  const [suggestions, setSuggestions] = useState<Etablissement[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Fermer si clic à l'extérieur
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDrop(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onChange(v);

    // Annuler la requête et le timer en cours
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (v.trim().length < 2) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setSearching(true);
      try {
        const res = await apiFetch(
          `/etablissements?q=${encodeURIComponent(v.trim())}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data: Etablissement[] = await res.json();
        if (!controller.signal.aborted) {
          setSuggestions(data);
          setShowDrop(data.length > 0);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);
  }

  function handleSelect(etab: Etablissement) {
    onChange(etab.ETAB_NOM);
    if (onSelectAdresse) {
      const parts = [etab.ADRESSE, etab.MUN_NOM, etab.CODE_POSTA].filter(Boolean);
      onSelectAdresse(parts.join(", "));
    }
    setShowDrop(false);
    setSuggestions([]);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        onChange={handleChange}
        onFocus={() => {
          if (value.trim().length >= 2 && suggestions.length > 0) setShowDrop(true);
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className={className}
      />
      {searching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {showDrop && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {suggestions.map((etab, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => handleSelect(etab)}
                className="w-full px-3 py-2 text-left hover:bg-primary/5"
              >
                <p className="text-sm font-medium text-slate-800">{etab.ETAB_NOM}</p>
                {(etab.MUN_NOM || etab.ADRESSE) && (
                  <p className="text-xs text-slate-400">
                    {[etab.ADRESSE, etab.MUN_NOM].filter(Boolean).join(", ")}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
