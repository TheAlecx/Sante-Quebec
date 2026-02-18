"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useApi } from "@/hooks/use-api";
import { apiFetch } from "@/lib/api";
import { canAddObservation, canModify, canDelete } from "@/lib/roles";
import type { ObservationMedicale } from "@/lib/types";
import ObservationForm from "./observation-form";
import LoadingSpinner from "@/components/loading-spinner";
import ErrorMessage from "@/components/error-message";

export default function ObservationTab({ dossierId }: { dossierId: string }) {
  const { user } = useAuth();
  // Note: API path has typo "obeservations"
  const { data, loading, error, refetch } = useApi<ObservationMedicale[]>(
    `/obeservations/dossier/${dossierId}`
  );
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ObservationMedicale | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette observation ?")) return;
    await apiFetch(`/obeservations/${id}`, { method: "DELETE" });
    refetch();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div>
      {user && canAddObservation(user.role) && !showForm && !editing && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light"
        >
          + Nouvelle observation
        </button>
      )}

      {showForm && (
        <div className="mb-4">
          <ObservationForm
            dossierId={dossierId}
            onDone={() => { setShowForm(false); refetch(); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editing && (
        <div className="mb-4">
          <ObservationForm
            dossierId={dossierId}
            observation={editing}
            onDone={() => { setEditing(null); refetch(); }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {data && data.length === 0 && (
        <p className="text-sm text-slate-500">Aucune observation pour ce dossier.</p>
      )}

      <div className="space-y-3">
        {data?.map((o) => (
          <div key={o.id_observation} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                    {o.type}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{o.valeur}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(o.date).toLocaleDateString("fr-CA")}
                </p>
              </div>
              {user && (
                <div className="flex gap-2">
                  {canModify(user.role) && (
                    <button
                      onClick={() => setEditing(o)}
                      className="text-xs text-primary hover:text-primary-dark"
                    >
                      Modifier
                    </button>
                  )}
                  {canDelete(user.role) && (
                    <button
                      onClick={() => handleDelete(o.id_observation)}
                      className="text-xs text-danger hover:text-danger-light"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
