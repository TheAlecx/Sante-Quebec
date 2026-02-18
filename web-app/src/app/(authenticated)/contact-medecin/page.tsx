"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function ContactMedecinPage() {
  const { user } = useAuth();
  const [objet, setObjet] = useState("");
  const [message, setMessage] = useState("");
  const [urgence, setUrgence] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Simulation d'envoi
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setSubmitting(false);
  }

  if (!user) return null;

  if (sent) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contacter le medecin</h1>
        <div className="mt-8 mx-auto max-w-lg rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-green-900">Message envoye</h2>
          <p className="mt-2 text-sm text-green-700">
            Votre message a ete transmis a votre medecin traitant. Vous recevrez une reponse dans les 24 a 48 heures ouvrees.
          </p>
          {urgence && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
              Si votre situation est urgente, appelez le 911 ou rendez-vous aux urgences les plus proches.
            </p>
          )}
          <button
            onClick={() => { setSent(false); setObjet(""); setMessage(""); setUrgence(false); }}
            className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Envoyer un autre message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Contacter le medecin</h1>
      <p className="mt-1 text-slate-500">
        Envoyez un message securise a votre medecin traitant
      </p>

      <form onSubmit={handleSubmit} className="mt-6 mx-auto max-w-lg">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-700">
              <strong>Note :</strong> Ce service est reserve aux questions non urgentes. Pour une urgence medicale, composez le <strong>911</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Objet du message *</label>
              <select
                value={objet}
                onChange={(e) => setObjet(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              >
                <option value="">Selectionnez un objet</option>
                <option value="question">Question sur mon traitement</option>
                <option value="effets">Effets secondaires d&apos;un medicament</option>
                <option value="resultats">Question sur des resultats d&apos;examen</option>
                <option value="renouvellement">Renouvellement d&apos;ordonnance</option>
                <option value="symptomes">Nouveaux symptomes</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                placeholder="Decrivez votre question ou preoccupation en detail..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgence"
                checked={urgence}
                onChange={(e) => setUrgence(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="urgence" className="text-sm text-slate-700">
                Ce message est de nature urgente
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {submitting ? "Envoi en cours..." : "Envoyer le message"}
          </button>
        </div>
      </form>
    </div>
  );
}
