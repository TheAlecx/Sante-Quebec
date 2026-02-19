"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ROLE_OPTIONS = [
  { value: "PATIENT", label: "Patient", professional: false },
  { value: "INFIRMIER", label: "Infirmier(ère)", professional: true },
  { value: "AMBULANCIER", label: "Ambulancier(ère)", professional: true },
  { value: "PHARMACIEN", label: "Pharmacien(ne)", professional: true },
  { value: "MEDECIN_GENERAL", label: "Médecin généraliste", professional: true },
  { value: "MEDECIN_SPECIALISTE", label: "Médecin spécialiste", professional: true },
];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    numero_praticien: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ message: string; pending: boolean } | null>(null);

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === form.role);
  const isProfessional = selectedRole?.professional ?? false;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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
          numero_praticien: isProfessional ? form.numero_praticien : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

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
            {success.pending ? (
              <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                Votre numéro de praticien sera vérifié par un administrateur avant l&apos;activation de votre compte.
              </div>
            ) : null}
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
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
            SQ
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sante-Quebec</h1>
          <p className="mt-1 text-sm text-slate-500">Créer un compte</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Inscription</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                />
              </div>
            </div>

            {/* Courriel */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Courriel <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="nom@etablissement.local"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Minimum 8 caractères"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              />
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              />
            </div>

            {/* Type de compte */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Type de compte <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              >
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

            {/* Numéro de praticien — affiché seulement pour les professionnels */}
            {isProfessional && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Numéro de praticien <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero_praticien"
                  value={form.numero_praticien}
                  onChange={handleChange}
                  required
                  placeholder="Ex. : 12345"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                />
                <p className="mt-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                  Votre numéro de praticien sera vérifié par un administrateur avant l&apos;activation de votre compte.
                </p>
              </div>
            )}

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
