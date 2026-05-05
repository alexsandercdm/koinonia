import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/auth-context'
import { OrgProvider } from './contexts/org-context'
import { ProtectedRoute } from './components/protected-route'
import { LoginPage } from './pages/login'
import { RegisterPage } from './pages/register'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/dashboard'
import { ParticipantsPage } from './pages/ParticipantsPage'
import { EventosPage } from './pages/EventosPage'
import { AcomodacoesPage } from './pages/AcomodacoesPage'
import { InscricoesPage } from './pages/InscricoesPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { MembersPage } from './pages/MembersPage'

function App() {
  return (
    <AuthProvider>
      <OrgProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos"
            element={
              <ProtectedRoute>
                <EventosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/participantes"
            element={
              <ProtectedRoute>
                <ParticipantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/acomodacoes"
            element={
              <ProtectedRoute>
                <AcomodacoesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inscricoes"
            element={
              <ProtectedRoute>
                <InscricoesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financeiro"
            element={
              <ProtectedRoute>
                <FinanceiroPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/membros"
            element={
              <ProtectedRoute>
                <MembersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </OrgProvider>
    </AuthProvider>
  )
}

export default App
