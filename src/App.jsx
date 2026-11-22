import { Navigate, Route, Routes } from "react-router-dom";
import { AmbientBackdrop } from "./components/AmbientBackdrop";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProposalPage } from "./pages/ProposalPage";

export default function App() {
  return (
    <>
      <AmbientBackdrop />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/p/:slug" element={<ProposalPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}