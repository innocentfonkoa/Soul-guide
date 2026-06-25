import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Landing from './pages/Landing';
import Activate from './pages/Activate';
import Admin from './pages/Admin';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Library from './pages/Library';
import Companion from './pages/Companion';
import Journey from './pages/Journey';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useStore();
  if (!token) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-lg mx-auto relative min-h-screen">
      {children}
      <BottomNav />
    </div>
  );
}

export default function App() {
  const { token, user } = useStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            token && user?.onboardingDone ? (
              <Navigate to="/home" replace />
            ) : token ? (
              <Navigate to="/auth" replace />
            ) : (
              <Navigate to="/welcome" replace />
            )
          }
        />
        <Route path="/welcome" element={<Landing />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/admin" element={<Admin />} />
        <Route
          path="/auth"
          element={
            token && user?.onboardingDone ? (
              <Navigate to="/home" replace />
            ) : (
              <Onboarding />
            )
          }
        />
        <Route path="/home" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><AppLayout><Library /></AppLayout></ProtectedRoute>} />
        <Route path="/library/:id" element={<ProtectedRoute><AppLayout><Library /></AppLayout></ProtectedRoute>} />
        <Route path="/companion" element={<ProtectedRoute><AppLayout><Companion /></AppLayout></ProtectedRoute>} />
        <Route path="/journey" element={<ProtectedRoute><AppLayout><Journey /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
