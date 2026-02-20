import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/auth-context";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { getRoleLabel } from "../lib/roles";
import type { Role } from "../lib/types";

interface CompteUtilisateur {
  id_utilisateur: string;
  nom: string | null;
  prenom: string | null;
  email: string;
  role: Role;
  actif: boolean;
  institution: string | null;
  numero_praticien: string | null;
  createdAt: string;
}

const ALL_ROLES: Role[] = [
  "PATIENT", "INFIRMIER", "AMBULANCIER", "PHARMACIEN",
  "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "ADMIN",
];

const ROLE_BADGE: Record<Role, string> = {
  PATIENT: "bg-slate-100 text-slate-700",
  INFIRMIER: "bg-teal-100 text-teal-700",
  AMBULANCIER: "bg-orange-100 text-orange-700",
  PHARMACIEN: "bg-emerald-100 text-emerald-700",
  MEDECIN_GENERAL: "bg-blue-100 text-blue-700",
  MEDECIN_SPECIALISTE: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
};

const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none";

type ModalMode = "create" | "edit" | null;

interface FormData {
  nom: string; prenom: string; email: string; role: Role | "";
  password: string; institution: string; numero_praticien: string; actif: boolean;
}

const EMPTY_FORM: FormData = {
  nom: "", prenom: "", email: "", role: "", password: "",
  institution: "", numero_praticien: "", actif: true,
};

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  if (user && user.role !== "ADMIN") {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const [users, setUsers] = useState<CompteUtilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "">("");
  const [filterActif, setFilterActif] = useState<"" | "true" | "false">("");

  const [modal, setModal] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<CompteUtilisateur | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CompteUtilisateur | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterRole) params.set("role", filterRole);
    if (filterActif !== "") params.set("actif", filterActif);
    const res = await apiFetch(`/admin/users?${params}`);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, [search, filterRole, filterActif]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 250);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  function openCreate() {
    setForm(EMPTY_FORM); setFormError(""); setEditTarget(null); setModal("create");
  }

  function openEdit(u: CompteUtilisateur) {
    setForm({
      nom: u.nom || "", prenom: u.prenom || "", email: u.email, role: u.role,
      password: "", institution: u.institution || "", numero_praticien: u.numero_praticien || "", actif: u.actif,
    });
    setFormError(""); setEditTarget(u); setModal("edit");
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSave() {
    setFormError("");
    if (!form.nom || !form.prenom || !form.email || !form.role) {
      setFormError("Nom, prénom, courriel et rôle sont obligatoires"); return;
    }
    if (modal === "create" && !form.password) {
      setFormError("Le mot de passe est obligatoire lors de la création"); return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        nom: form.nom, prenom: form.prenom, email: form.email, role: form.role, actif: form.actif,
        institution: form.institution || null, numero_praticien: form.numero_praticien || null,
      };
      if (form.password) body.password = form.password;

      const res = modal === "create"
        ? await apiFetch("/admin/users", { method: "POST", body: JSON.stringify(body) })
        : await apiFetch(`/admin/users/${editTarget!.id_utilisateur}`, { method: "PUT", body: JSON.stringify(body) });

      const data = await res.json();
      if (!res.ok) { setFormError(data.message); return; }
      setModal(null); fetchUsers();
    } finally { setSaving(false); }
  }

  async function toggleActif(u: CompteUtilisateur) {
    await apiFetch(`/admin/users/${u.id_utilisateur}`, {
      method: "PUT", body: JSON.stringify({ actif: !u.actif }),
    });
    fetchUsers();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(""); setDeleting(true);
    try {
      const res = await apiFetch(`/admin/users/${deleteTarget.id_utilisateur}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setDeleteError(data.message); return; }
      setDeleteTarget(null); fetchUsers();
    } finally { setDeleting(false); }
  }

  const isProfessional = ["INFIRMIER", "AMBULANCIER", "PHARMACIEN", "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(form.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des comptes</h1>
          <p className="mt-1 text-sm text-slate-500">{users.length} compte{users.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvel utilisateur
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Rechercher par nom, prénom ou courriel…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="min-w-64 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none" />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value as Role | "")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none">
          <option value="">Tous les rôles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
        </select>
        <select value={filterActif} onChange={e => setFilterActif(e.target.value as "" | "true" | "false")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none">
          <option value="">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">Chargement…</div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-slate-400">Aucun utilisateur trouvé</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3 hidden md:table-cell">Info professionnelle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id_utilisateur} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {(u.prenom?.[0] ?? "?")}{(u.nom?.[0] ?? "")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{u.prenom} {u.nom}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-xs text-slate-500">
                      {u.institution || u.numero_praticien
                        ? [u.institution, u.numero_praticien ? `#${u.numero_praticien}` : null].filter(Boolean).join(" · ")
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActif(u)} title={u.actif ? "Désactiver" : "Activer"}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${u.actif ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.actif ? "bg-green-500" : "bg-amber-500"}`} />
                      {u.actif ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} title="Modifier"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => { setDeleteTarget(u); setDeleteError(""); }} title="Supprimer"
                        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Créer / Modifier */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {modal === "create" ? "Nouvel utilisateur" : "Modifier le compte"}
              </h2>
              <button onClick={() => setModal(null)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-4">
              {formError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Prénom *</label>
                  <input name="prenom" value={form.prenom} onChange={handleFormChange} required className={INPUT} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nom *</label>
                  <input name="nom" value={form.nom} onChange={handleFormChange} required className={INPUT} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Courriel *</label>
                <input type="email" name="email" value={form.email} onChange={handleFormChange} required className={INPUT} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Mot de passe {modal === "create" ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(laisser vide = inchangé)</span>}
                </label>
                <input type="password" name="password" value={form.password} onChange={handleFormChange} placeholder="Min. 8 caractères" className={INPUT} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Rôle *</label>
                <select name="role" value={form.role} onChange={handleFormChange} required className={INPUT}>
                  <option value="">— Sélectionner —</option>
                  {ALL_ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                </select>
              </div>
              {isProfessional && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Institution</label>
                    <input name="institution" value={form.institution} onChange={handleFormChange} placeholder="Nom de l'établissement" className={INPUT} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Numéro de praticien</label>
                    <input name="numero_praticien" value={form.numero_praticien} onChange={handleFormChange} placeholder="Ex. : 12345" className={INPUT} />
                  </div>
                </>
              )}
              {modal === "edit" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="actif" checked={form.actif} onChange={handleFormChange}
                    className="h-4 w-4 rounded border-slate-300 accent-primary" />
                  <span className="text-sm font-medium text-slate-700">Compte actif</span>
                </label>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setModal(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                {saving ? "Enregistrement…" : modal === "create" ? "Créer" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmer la suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            <div className="px-6 py-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Supprimer ce compte ?</h2>
              <p className="mt-1 text-sm text-slate-500">
                <strong>{deleteTarget.prenom} {deleteTarget.nom}</strong> ({deleteTarget.email}) sera définitivement supprimé.
                Cette action est irréversible.
              </p>
              {deleteError && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  {deleteError}
                  <p className="mt-1 font-medium">Utilisez le bouton de statut pour désactiver ce compte.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button onClick={() => { setDeleteTarget(null); setDeleteError(""); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Annuler
              </button>
              {!deleteError && (
                <button onClick={handleDelete} disabled={deleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {deleting ? "Suppression…" : "Supprimer"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
