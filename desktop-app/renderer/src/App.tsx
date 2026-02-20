import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth-context";
import AuthLayout from "./components/layout";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import PatientsPage from "./pages/patients";
import DossierPage from "./pages/dossier";
import MedecinsPage from "./pages/medecins";
import UrgencePage from "./pages/urgence";
import AdminPage from "./pages/admin";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<DossierPage />} />
            <Route path="/medecins" element={<MedecinsPage />} />
            <Route path="/urgence" element={<UrgencePage />} />
            <Route path="/admin/utilisateurs" element={<AdminPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
