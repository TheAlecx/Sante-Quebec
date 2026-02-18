"use client";

import { useAuth } from "@/lib/auth-context";
import { getRoleLabel } from "@/lib/roles";

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">{user.email}</p>
          <p className="text-xs text-slate-500">{getRoleLabel(user.role)}</p>
        </div>
        <span className="rounded-full bg-primary-light/10 px-3 py-1 text-xs font-medium text-primary">
          {user.role.replace("_", " ")}
        </span>
        <button
          onClick={logout}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
        >
          Deconnexion
        </button>
      </div>
    </header>
  );
}
