import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { TurmasPage } from "@/components/pages/TurmasPage";
import { AlunosPage } from "@/components/pages/AlunosPage";
import { ProfessoresPage } from "@/components/pages/ProfessoresPage";
import { ProvasPage } from "@/components/pages/ProvasPage";
import { RespostasCorrecaoPage } from "@/components/pages/RespostasCorrecaoPage";
import { RelatoriosPage } from "@/components/pages/RelatoriosPage";
import { ThemeProvider } from "@/components/theme-provider"

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/turmas" element={<TurmasPage />} />
          <Route path="/alunos" element={<AlunosPage />} />
          <Route path="/professores" element={<ProfessoresPage />} />
          <Route path="/provas" element={<ProvasPage />} />
          <Route path="/correcao" element={<RespostasCorrecaoPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </ThemeProvider>
  );
}
