"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Consultation } from "@/lib/types";

interface Props {
  dossierId: string;
  consultation?: Consultation;
  onDone: () => void;
  onCancel: () => void;
}

export default function ConsultationForm({ dossierId, consultation, onDone, onCancel }: Props) {
  const [motif, setMotif] = useState(consultation?.motif || "");
  const [diagnostic, setDiagnostic] = useState(consultation?.diagnostic || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!consultation;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const url = isEdit
        ? `/consultations/${consultation.id_consultation}`
        : `/consultations/dossier/${dossierId}`;
      const res = await apiFetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify({ motif, diagnostic: diagnostic || undefined }),
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
        {isEdit ? "Modifier la consultation" : "Nouvelle consultation"}
      </h4>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Motif *</label>
          <input
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Diagnostic</label>
          <textarea
            value={diagnostic}
            onChange={(e) => setDiagnostic(e.target.value)}
            rows={3}
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
