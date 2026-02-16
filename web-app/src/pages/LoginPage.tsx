import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      }
    );

    const data = await res.json();
    login(data.token);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input
        type="password"
        placeholder="Mot de passe"
        onChange={e => setPassword(e.target.value)}
      />
      <button>Se connecter</button>
    </form>
  );
}
