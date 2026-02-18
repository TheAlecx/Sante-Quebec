"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";
import ErrorMessage from "@/components/error-message";

interface DossierItem {
  id_dossier: string;
  etat: string;
  patient: {
    nom: string;
    prenom: string;
    date_naissance: string;
    sexe: string;
    numero_assurance: string | null;
  };
  permissions: {
    lecture: boolean;
    ajout: boolean;
    modification: boolean;
    suppression: boolean;
  };
}

const ROLES_CREATION = ["ADMIN", "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "INFIRMIER"];

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [modalOuvert, setModalOuvert] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi<DossierItem[]>("/patients/dossiers");

  // Champs du formulaire nouveau patient
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [sexe, setSexe] = useState<"HOMME" | "FEMME">("HOMME");
  const [numeroAssurance, setNumeroAssurance] = useState("");
  const [telephone, setTelephone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erreurModal, setErreurModal] = useState("");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const dossiers = data || [];
  const peutCreer = user && ROLES_CREATION.includes(user.role);

  const filtered = dossiers.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.patient.nom.toLowerCase().includes(q) ||
      d.patient.prenom.toLowerCase().includes(q) ||
      (d.patient.numero_assurance || "").toLowerCase().includes(q)
    );
  });

  function getAge(dateNaissance: string) {
    const birth = new Date(dateNaissance);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  function fermerModal() {
    setModalOuvert(false);
    setNom("");
    setPrenom("");
    setDateNaissance("");
    setSexe("HOMME");
    setNumeroAssurance("");
    setTelephone("");
    setErreurModal("");
  }

  async function handleCreerPatient(e: { preventDefault(): void }) {
    e.preventDefault();
    setSubmitting(true);
    setErreurModal("");

    try {
      const res = await apiFetch("/patients", {
        method: "POST",
        body: JSON.stringify({
          nom,
          prenom,
          date_naissance: dateNaissance,
          sexe,
          numero_assurance: numeroAssurance || undefined,
          telephone: telephone || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la création");
      }

      fermerModal();
      refetch();
    } catch (err: unknown) {
      setErreurModal(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="mt-1 text-slate-500">
            {dossiers.length} dossier{dossiers.length > 1 ? "s" : ""} accessible{dossiers.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom ou # assurance..."
          className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
        />
        {peutCreer && (
          <button
            onClick={() => setModalOuvert(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nouveau patient
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        {filtered.map((d) => (
          <button
            key={d.id_dossier}
            onClick={() => router.push(`/dossier/${d.id_dossier}`)}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-primary-light hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {d.patient.prenom[0]}{d.patient.nom[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {d.patient.nom}, {d.patient.prenom}
                </p>
                <p className="text-sm text-slate-500">
                  {getAge(d.patient.date_naissance)} ans &middot; {d.patient.sexe === "HOMME" ? "H" : "F"}
                  {d.patient.numero_assurance && (
                    <> &middot; {d.patient.numero_assurance}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {d.permissions.ajout && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Ajout</span>
                )}
                {d.permissions.modification && (
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Modif</span>
                )}
                {d.permissions.suppression && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Suppr</span>
                )}
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                d.etat === "ACTIF" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
              }`}>
                {d.etat}
              </span>
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            {search
              ? <>Aucun patient trouvé pour &laquo; {search} &raquo;</>
              : "Aucun dossier accessible"}
          </div>
        )}
      </div>

      {/* Modal nouveau patient */}
      {modalOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Nouveau patient</h2>
              <button
                onClick={fermerModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreerPatient} className="space-y-4 px-6 py-5">
              {erreurModal && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreurModal}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Prénom *</label>
                  <input
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nom *</label>
                  <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Date de naissance *</label>
                  <input
                    type="date"
                    value={dateNaissance}
                    onChange={(e) => setDateNaissance(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Sexe *</label>
                  <select
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value as "HOMME" | "FEMME")}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                  >
                    <option value="HOMME">Homme</option>
                    <option value="FEMME">Femme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  N° assurance maladie
                </label>
                <input
                  value={numeroAssurance}
                  onChange={(e) => setNumeroAssurance(e.target.value)}
                  placeholder="Ex: GAGL58031201"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Téléphone</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex: 514-555-0101"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {submitting ? "Création..." : "Créer le patient"}
                </button>
                <button
                  type="button"
                  onClick={fermerModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
