import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, Role, JwtPayload } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload: JwtPayload = JSON.parse(atob(token.split(".")[1]));
        setUser({ id: payload.userId, email: payload.email, role: payload.role as Role });
      } catch {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  function login(token: string) {
    localStorage.setItem("token", token);
    const payload: JwtPayload = JSON.parse(atob(token.split(".")[1]));
    setUser({ id: payload.userId, email: payload.email, role: payload.role as Role });
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    window.location.replace("/#/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
