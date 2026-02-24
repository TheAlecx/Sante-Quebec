"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { MedicamentField, MedicamentInput } from "./prescription-form";
import type { Prescription } from "@/lib/types";

interface Props {
  prescription: Prescription;
  onDone: () => void;
  onCancel: () => void;
}

export default function PrescriptionEditForm({ prescription, onDone, onCancel }: Props) {
  const [instructions, setInstructions] = useState(prescription.instructions ?? "");
  const [medicaments, setMedicaments] = useState<MedicamentInput[]>(
    prescription.medicaments.length > 0
      ? prescription.medicaments.map((pm) => ({
          nom: pm.medicament.nom,
          dosage: pm.medicament.dosage ?? "",
        }))
      : [{ nom: "", dosage: "" }]
  );
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

  async function handleSubmit(e: React.FormEvent) {
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
      const res = await apiFetch(`/prescriptions/${prescription.id_prescription}`, {
        method: "PUT",
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
    <form onSubmit={handleSubmit} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h4 className="mb-3 font-medium text-slate-900">Modifier la prescription</h4>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Médicaments *
            <span className="ml-2 text-xs font-normal text-slate-400">— commencez à taper pour rechercher</span>
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
