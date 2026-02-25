"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";


export interface MedicamentInput {
  nom: string;
  dosage: string;
}

interface DrugSuggestion {
  drug_code: number;
  brand_name: string;
}

interface Props {
  dossierId: string;
  onDone: () => void;
  onCancel: () => void;
}

export function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MedicamentField({
  med,
  total,
  onChange,
  onRemove,
}: {
  med: MedicamentInput;
  total: number;
  onChange: (field: keyof MedicamentInput, value: string) => void;
  onRemove: () => void;
}) {
  const [suggestions, setSuggestions] = useState<DrugSuggestion[]>([]);
  const [showDrop, setShowDrop] = useState(false);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDrop(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Nettoyer timer et requête en cours au démontage
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  function handleNomChange(value: string) {
    onChange("nom", value);

    // Annuler le timer de debounce ET la requête en vol
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowDrop(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      setSearching(true);
      try {
        const res = await apiFetch(`/medicaments/recherche?q=${encodeURIComponent(value.trim())}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data: DrugSuggestion[] = await res.json();
          setSuggestions(data);
          setShowDrop(data.length > 0);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          // API indisponible — saisie manuelle seulement
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);
  }

  function selectSuggestion(drug: DrugSuggestion) {
    onChange("nom", toTitleCase(drug.brand_name));
    setSuggestions([]);
    setShowDrop(false);
  }

  return (
    <div className="flex gap-2">
      <div ref={wrapperRef} className="relative flex-1">
        <input
          value={med.nom}
          onChange={(e) => handleNomChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDrop(true)}
          placeholder="Nom du médicament"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
          autoComplete="off"
        />
        {searching && (
          <span className="absolute right-2 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
        {showDrop && (
          <ul className="absolute z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
            {suggestions.map((d) => (
              <li key={d.drug_code}>
                <button
                  type="button"
                  onMouseDown={() => selectSuggestion(d)}
                  className="w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-primary/5 hover:text-primary"
                >
                  {toTitleCase(d.brand_name)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <input
        value={med.dosage}
        onChange={(e) => onChange("dosage", e.target.value)}
        placeholder="Dosage"
        className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
      />
      {total > 1 && (
        <button
          type="button"
          onClick={onRemove}
          className="text-red-400 hover:text-red-600"
          title="Retirer"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export default function PrescriptionForm({ dossierId, onDone, onCancel }: Props) {
  const [instructions, setInstructions] = useState("");
  const [medicaments, setMedicaments] = useState<MedicamentInput[]>([{ nom: "", dosage: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function addMedicament() {
    setMedicaments([...medicaments, { nom: "", dosage: "" }]);
  }

  function updateMedicament(index: number, field: keyof MedicamentInput, value: string) {
    const updated = [...medicaments];
    updated[index][field] = value;
    setMedicaments(updated);
  }

  function removeMedicament(index: number) {
    setMedicaments(medicaments.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const validMeds = medicaments.filter((m) => m.nom.trim());
    if (validMeds.length === 0) {
      setError("Ajoutez au moins un médicament.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await apiFetch(`/prescriptions/dossier/${dossierId}`, {
        method: "POST",
        body: JSON.stringify({
          instructions: instructions || undefined,
          medicaments: validMeds.map((m) => ({
            nom: m.nom,
            dosage: m.dosage || undefined,
          })),
        }),
      });

      if (!res.ok) throw new Error();
      onDone();
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="mb-3 font-medium text-slate-900">Nouvelle prescription</h4>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            placeholder="Ex. : Prendre 1 comprimé le matin avec de l'eau"
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Médicaments *
            <span className="ml-2 text-xs font-normal text-slate-400">— commencez à taper pour rechercher dans la base Santé Canada</span>
          </label>
          <div className="space-y-2">
            {medicaments.map((med, i) => (
              <MedicamentField
                key={i}
                med={med}
                total={medicaments.length}
                onChange={(field, value) => updateMedicament(i, field, value)}
                onRemove={() => removeMedicament(i)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addMedicament}
            className="mt-2 text-sm font-medium text-primary hover:text-primary-dark"
          >
            + Ajouter un médicament
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? "Sauvegarde…" : "Sauvegarder"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </form>
  );
}
