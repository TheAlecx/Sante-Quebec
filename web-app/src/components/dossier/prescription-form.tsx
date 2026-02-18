"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface MedicamentInput {
  nom: string;
  dosage: string;
}

interface Props {
  dossierId: string;
  onDone: () => void;
  onCancel: () => void;
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
    if (medicaments.length <= 1) return;
    setMedicaments(medicaments.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const validMeds = medicaments.filter((m) => m.nom.trim());
    if (validMeds.length === 0) {
      setError("Ajoutez au moins un medicament");
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
      <h4 className="mb-3 font-medium text-slate-900">Nouvelle prescription</h4>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Medicaments *</label>
          <div className="space-y-2">
            {medicaments.map((med, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={med.nom}
                  onChange={(e) => updateMedicament(i, "nom", e.target.value)}
                  placeholder="Nom du medicament"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                />
                <input
                  value={med.dosage}
                  onChange={(e) => updateMedicament(i, "dosage", e.target.value)}
                  placeholder="Dosage"
                  className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                />
                {medicaments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicament(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addMedicament}
            className="mt-2 text-sm font-medium text-primary hover:text-primary-dark"
          >
            + Ajouter un medicament
          </button>
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
