import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import LoginPage from './components/LoginPage.tsx'
import LandingPage from './pages/LandingPage.tsx'

// eslint-disable-next-line react-refresh/only-export-components
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem('acs-authenticated') === 'true'
  return isAuth ? <>{children}</> : <Navigate to="/welcome" replace />
}

function HomeRoute() {
  const hasSeenWelcome = sessionStorage.getItem('acs-welcome-seen') === 'true'
  if (!hasSeenWelcome) {
    return <Navigate to="/welcome" replace />
  }
  const isAuth = localStorage.getItem('acs-authenticated') === 'true'
  return isAuth ? <App /> : <Navigate to="/login" replace />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/welcome" element={<LandingPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
