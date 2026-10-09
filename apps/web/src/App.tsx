import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./hooks/useLanguage";
import CasesPage from "./pages/CasesPage";
import CreatePage from "./pages/CreatePage";
import CaseDetailPage from "./pages/CaseDetailPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/cases" replace />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/case/:id" element={<CaseDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/cases" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
