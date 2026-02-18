"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useApi } from "@/hooks/use-api";
import { apiFetch } from "@/lib/api";
import { canAddConsultation, canModify, canDelete } from "@/lib/roles";
import type { Consultation } from "@/lib/types";
import ConsultationForm from "./consultation-form";
import LoadingSpinner from "@/components/loading-spinner";
import ErrorMessage from "@/components/error-message";

export default function ConsultationTab({ dossierId }: { dossierId: string }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi<Consultation[]>(
    `/consultations/dossier/${dossierId}`
  );
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Consultation | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette consultation ?")) return;
    await apiFetch(`/consultations/${id}`, { method: "DELETE" });
    refetch();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div>
      {user && canAddConsultation(user.role) && !showForm && !editing && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          + Nouvelle consultation
        </button>
      )}

      {showForm && (
        <div className="mb-4">
          <ConsultationForm
            dossierId={dossierId}
            onDone={() => { setShowForm(false); refetch(); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editing && (
        <div className="mb-4">
          <ConsultationForm
            dossierId={dossierId}
            consultation={editing}
            onDone={() => { setEditing(null); refetch(); }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {data && data.length === 0 && (
        <p className="text-sm text-slate-500">Aucune consultation pour ce dossier.</p>
      )}

      <div className="space-y-3">
        {data?.map((c) => (
          <div key={c.id_consultation} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-slate-900">{c.motif}</p>
                {c.diagnostic && (
                  <p className="mt-1 text-sm text-slate-600">
                    Diagnostic : {c.diagnostic}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(c.date).toLocaleDateString("fr-CA")}
                </p>
              </div>
              {user && (
                <div className="flex gap-2">
                  {canModify(user.role) && (
                    <button
                      onClick={() => setEditing(c)}
                      className="text-xs text-primary hover:text-primary-dark"
                    >
                      Modifier
                    </button>
                  )}
                  {canDelete(user.role) && (
                    <button
                      onClick={() => handleDelete(c.id_consultation)}
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
