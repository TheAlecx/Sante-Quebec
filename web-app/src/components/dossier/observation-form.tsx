"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ObservationMedicale } from "@/lib/types";

interface Props {
  dossierId: string;
  observation?: ObservationMedicale;
  onDone: () => void;
  onCancel: () => void;
}

export default function ObservationForm({ dossierId, observation, onDone, onCancel }: Props) {
  const [type, setType] = useState(observation?.type || "");
  const [valeur, setValeur] = useState(observation?.valeur || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!observation;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Note: API path has typo "obeservations"
      const url = isEdit
        ? `/obeservations/${observation.id_observation}`
        : `/obeservations/dossier/${dossierId}`;
      const res = await apiFetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify({ type, valeur }),
      });

      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      onDone();
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="mb-3 font-medium text-slate-900">
        {isEdit ? "Modifier l'observation" : "Nouvelle observation"}
      </h4>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Type *</label>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            placeholder="Ex: Tension arterielle, Temperature..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Valeur *</label>
          <input
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            required
            placeholder="Ex: 120/80 mmHg"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Annuler
          </button>
        </div>
      </div>
    </form>
  );
}
