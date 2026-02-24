"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useApi } from "@/hooks/use-api";
import { apiFetch } from "@/lib/api";
import { canAddPrescription, canDelete, canModify } from "@/lib/roles";
import type { Prescription } from "@/lib/types";
import PrescriptionForm from "./prescription-form";
import PrescriptionEditForm from "./prescription-edit-form";
import LoadingSpinner from "@/components/loading-spinner";
import ErrorMessage from "@/components/error-message";

export default function PrescriptionTab({ dossierId }: { dossierId: string }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi<Prescription[]>(
    `/prescriptions/dossier/${dossierId}`
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette prescription ?")) return;
    await apiFetch(`/prescriptions/${id}`, { method: "DELETE" });
    refetch();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div>
      {user && canAddPrescription(user.role) && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + Nouvelle prescription
        </button>
      )}

      {showForm && (
        <div className="mb-4">
          <PrescriptionForm
            dossierId={dossierId}
            onDone={() => { setShowForm(false); refetch(); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {data && data.length === 0 && (
        <p className="text-sm text-slate-500">Aucune prescription pour ce dossier.</p>
      )}

      <div className="space-y-3">
        {data?.map((p) => (
          <div key={p.id_prescription} className="rounded-lg border border-slate-200 bg-white p-4">
            {editingId === p.id_prescription ? (
              <PrescriptionEditForm
                prescription={p}
                onDone={() => { setEditingId(null); refetch(); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-slate-400">
                    {new Date(p.date).toLocaleDateString("fr-CA")}
                  </p>
                  {p.instructions && (
                    <p className="mt-1 text-sm text-slate-700">{p.instructions}</p>
                  )}
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-slate-500 uppercase">Médicaments</p>
                    {p.medicaments.map((pm) => (
                      <div
                        key={pm.medicament_id}
                        className="flex items-center gap-2 rounded bg-slate-50 px-3 py-1.5 text-sm"
                      >
                        <span className="font-medium text-slate-800">{pm.medicament.nom}</span>
                        {pm.medicament.dosage && (
                          <span className="text-slate-500">— {pm.medicament.dosage}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-3 pl-4">
                  {user && canModify(user.role) && (
                    <button
                      onClick={() => { setShowForm(false); setEditingId(p.id_prescription); }}
                      className="text-xs text-primary hover:text-primary-dark"
                    >
                      Modifier
                    </button>
                  )}
                  {user && canDelete(user.role) && (
                    <button
                      onClick={() => handleDelete(p.id_prescription)}
                      className="text-xs text-danger hover:text-danger-light"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
