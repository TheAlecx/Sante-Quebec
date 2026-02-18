"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useApi } from "@/hooks/use-api";
import { apiFetch } from "@/lib/api";
import { canAddConsultation, canDelete } from "@/lib/roles";
import LoadingSpinner from "@/components/loading-spinner";
import ErrorMessage from "@/components/error-message";

interface Hospitalisation {
  id_hospitalisation: string;
  date_admission: string;
  date_sortie: string | null;
  etablissement: string;
  service: string;
  motif: string;
  resume: string;
  medecin_traitant: string | null;
}

export default function HospitalisationTab({ dossierId }: { dossierId: string }) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi<Hospitalisation[]>(
    `/hospitalisations/dossier/${dossierId}`
  );
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    date_admission: "",
    date_sortie: "",
    etablissement: "",
    service: "",
    motif: "",
    resume: "",
    medecin_traitant: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const hospitalisations = data || [];
  const showAdd = user && canAddConsultation(user.role);
  const showDelete = user && canDelete(user.role);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getDuration(admission: string, sortie: string | null) {
    if (!sortie) return "En cours";
    const a = new Date(admission);
    const s = new Date(sortie);
    const days = Math.round((s.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} jour${days > 1 ? "s" : ""}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch(`/hospitalisations/dossier/${dossierId}`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          date_sortie: form.date_sortie || null,
          medecin_traitant: form.medecin_traitant || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ date_admission: "", date_sortie: "", etablissement: "", service: "", motif: "", resume: "", medecin_traitant: "" });
        refetch();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette hospitalisation ?")) return;
    setDeleting(id);
    try {
      await apiFetch(`/hospitalisations/${id}`, { method: "DELETE" });
      refetch();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Hospitalisations ({hospitalisations.length})
        </h2>
        {showAdd && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            {showForm ? "Annuler" : "+ Nouvelle hospitalisation"}
          </button>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Nouvelle hospitalisation</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Date d&apos;admission *</label>
              <input type="date" required value={form.date_admission} onChange={(e) => setForm({ ...form, date_admission: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Date de sortie</label>
              <input type="date" value={form.date_sortie} onChange={(e) => setForm({ ...form, date_sortie: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Etablissement *</label>
              <input type="text" required value={form.etablissement} onChange={(e) => setForm({ ...form, etablissement: e.target.value })} placeholder="Ex: CHUM, CUSM..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Service *</label>
              <input type="text" required value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="Ex: Cardiologie, Chirurgie..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Motif d&apos;admission *</label>
              <input type="text" required value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} placeholder="Raison de l'hospitalisation" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Medecin traitant</label>
              <input type="text" value={form.medecin_traitant} onChange={(e) => setForm({ ...form, medecin_traitant: e.target.value })} placeholder="Nom du médecin" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Resume detaille *</label>
              <textarea required rows={6} value={form.resume} onChange={(e) => setForm({ ...form, resume: e.target.value })} placeholder="Résumé complet de l'hospitalisation: diagnostic, traitements, évolution, recommandations au congé..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none" />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste des hospitalisations */}
      <div className="mt-4 space-y-3">
        {hospitalisations.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Aucune hospitalisation enregistree
          </div>
        )}

        {hospitalisations.map((h) => {
          const isExpanded = expandedId === h.id_hospitalisation;
          return (
            <div key={h.id_hospitalisation} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Header cliquable */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : h.id_hospitalisation)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${h.date_sortie ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{h.motif}</p>
                    <p className="text-sm text-slate-500">
                      {h.etablissement} &middot; {h.service}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{formatDate(h.date_admission)}</p>
                    <p className="text-xs text-slate-500">{getDuration(h.date_admission, h.date_sortie)}</p>
                  </div>
                  <svg className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Contenu dépliable */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-4 pb-4">
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <span className="font-medium text-slate-500">Admission:</span>{" "}
                      <span className="text-slate-900">{formatDate(h.date_admission)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500">Sortie:</span>{" "}
                      <span className="text-slate-900">{h.date_sortie ? formatDate(h.date_sortie) : "En cours"}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500">Etablissement:</span>{" "}
                      <span className="text-slate-900">{h.etablissement}</span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500">Service:</span>{" "}
                      <span className="text-slate-900">{h.service}</span>
                    </div>
                    {h.medecin_traitant && (
                      <div className="sm:col-span-2">
                        <span className="font-medium text-slate-500">Medecin traitant:</span>{" "}
                        <span className="text-slate-900">{h.medecin_traitant}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-slate-500">Resume:</p>
                    <div className="rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {h.resume}
                    </div>
                  </div>

                  {showDelete && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleDelete(h.id_hospitalisation)}
                        disabled={deleting === h.id_hospitalisation}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deleting === h.id_hospitalisation ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
