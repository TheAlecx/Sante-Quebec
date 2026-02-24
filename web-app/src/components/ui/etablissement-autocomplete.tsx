"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";

interface Etablissement {
  ETAB_NOM: string;
  ADRESSE: string | null;
  MUN_NOM: string | null;
  CODE_POSTA: string | null;
}

// Cache module-level : un seul fetch par session navigateur
let _cache: Etablissement[] | null = null;
let _loading = false;
const _callbacks: ((list: Etablissement[]) => void)[] = [];

function loadEtablissements(onLoaded: (list: Etablissement[]) => void) {
  if (_cache) { onLoaded(_cache); return; }
  _callbacks.push(onLoaded);
  if (_loading) return;
  _loading = true;
  apiFetch("/etablissements")
    .then((r) => (r.ok ? r.json() : []))
    .then((data: Etablissement[]) => {
      _cache = data;
      _callbacks.forEach((cb) => cb(data));
      _callbacks.length = 0;
    })
    .catch(() => {
      _callbacks.forEach((cb) => cb([]));
      _callbacks.length = 0;
    })
    .finally(() => { _loading = false; });
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
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  function handleFocus() {
    loadEtablissements((list) => {
      setEtablissements(list);
      if (value.trim().length >= 1) setShowDrop(true);
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    onChange(v);
    if (v.trim().length === 0) { setShowDrop(false); return; }
    loadEtablissements((list) => {
      setEtablissements(list);
      setShowDrop(true);
    });
  }

  function handleSelect(etab: Etablissement) {
    onChange(etab.ETAB_NOM);
    if (onSelectAdresse) {
      const parts = [etab.ADRESSE, etab.MUN_NOM, etab.CODE_POSTA].filter(Boolean);
      onSelectAdresse(parts.join(", "));
    }
    setShowDrop(false);
  }

  const filtered = value.trim().length === 0
    ? etablissements.slice(0, 10)
    : etablissements.filter((e) =>
        e.ETAB_NOM.toLowerCase().includes(value.toLowerCase().trim())
      ).slice(0, 10);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className={className}
      />
      {showDrop && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.map((etab, i) => (
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
