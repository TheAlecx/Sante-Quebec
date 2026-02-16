import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Rôle : {user?.role}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
