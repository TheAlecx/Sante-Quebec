"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    // Compte
    prenom: "",
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    numero_praticien: "",
    // Profil patient
    date_naissance: "",
    sexe: "",
    numero_assurance: "",
    telephone: "",
    adresse: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ message: string; pending: boolean } | null>(null);

  const isPatient = form.role === "PATIENT";
  const isProfessional = ["INFIRMIER", "AMBULANCIER", "PHARMACIEN", "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(form.role);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: form.prenom,
          nom: form.nom,
          email: form.email,
          password: form.password,
          role: form.role,
          ...(isProfessional && { numero_praticien: form.numero_praticien }),
          ...(isPatient && {
            date_naissance: form.date_naissance,
            sexe: form.sexe,
            numero_assurance: form.numero_assurance || undefined,
            telephone: form.telephone || undefined,
            adresse: form.adresse || undefined,
          }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");
      setSuccess({ message: data.message, pending: data.pending });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
              SQ
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Sante-Quebec</h1>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">Inscription réussie</h2>
            <p className="mb-6 text-sm text-slate-600">{success.message}</p>
            {success.pending && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                Votre numéro de praticien sera vérifié par un administrateur avant l&apos;activation de votre compte.
              </div>
            )}
            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Aller à la page de connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
            SQ
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sante-Quebec</h1>
          <p className="mt-1 text-sm text-slate-500">Créer un compte</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {/* ── Informations du compte ── */}
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Informations du compte
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input type="text" name="prenom" value={form.prenom} onChange={handleChange} required className={INPUT_CLASS} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input type="text" name="nom" value={form.nom} onChange={handleChange} required className={INPUT_CLASS} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Courriel <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="nom@exemple.com" className={INPUT_CLASS} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Min. 8 caractères" className={INPUT_CLASS} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Confirmer <span className="text-red-500">*</span>
                </label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required className={INPUT_CLASS} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Type de compte <span className="text-red-500">*</span>
              </label>
              <select name="role" value={form.role} onChange={handleChange} required className={INPUT_CLASS}>
                <option value="">— Sélectionner —</option>
                <optgroup label="Patient">
                  <option value="PATIENT">Patient</option>
                </optgroup>
                <optgroup label="Professionnel de la santé">
                  <option value="INFIRMIER">Infirmier(ère)</option>
                  <option value="AMBULANCIER">Ambulancier(ère)</option>
                  <option value="PHARMACIEN">Pharmacien(ne)</option>
                  <option value="MEDECIN_GENERAL">Médecin généraliste</option>
                  <option value="MEDECIN_SPECIALISTE">Médecin spécialiste</option>
                </optgroup>
              </select>
            </div>

            {/* Numéro de praticien pour les professionnels */}
            {isProfessional && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Numéro de praticien <span className="text-red-500">*</span>
                </label>
                <input type="text" name="numero_praticien" value={form.numero_praticien} onChange={handleChange} required placeholder="Ex. : 12345" className={INPUT_CLASS} />
                <p className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Votre numéro de praticien sera vérifié par un administrateur avant l&apos;activation de votre compte.
                </p>
              </div>
            )}
          </div>

          {/* ── Profil patient (conditionnel) ── */}
          {isPatient && (
            <>
              <div className="my-6 border-t border-slate-100" />
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Informations du dossier médical
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Date de naissance <span className="text-red-500">*</span>
                    </label>
                    <input type="date" name="date_naissance" value={form.date_naissance} onChange={handleChange} required className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Sexe <span className="text-red-500">*</span>
                    </label>
                    <select name="sexe" value={form.sexe} onChange={handleChange} required className={INPUT_CLASS}>
                      <option value="">— Sélectionner —</option>
                      <option value="HOMME">Homme</option>
                      <option value="FEMME">Femme</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    N° d&apos;assurance maladie (RAMQ)
                  </label>
                  <input type="text" name="numero_assurance" value={form.numero_assurance} onChange={handleChange} placeholder="Ex. : ABCD 1234 5678" className={INPUT_CLASS} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Téléphone</label>
                    <input type="tel" name="telephone" value={form.telephone} onChange={handleChange} placeholder="Ex. : 514-555-1234" className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Adresse</label>
                    <input type="text" name="adresse" value={form.adresse} onChange={handleChange} placeholder="123 rue Principale" className={INPUT_CLASS} />
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Les informations supplémentaires (taille, poids, contact d&apos;urgence, pharmacie) pourront être ajoutées depuis votre dossier après connexion.
                </p>
              </div>
            </>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? "Inscription en cours..." : "Créer mon compte"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
