import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Landing from '@/pages/Landing';
import Analysis from '@/pages/Analysis';
import Onboarding from '@/pages/Onboarding';
import SavedAnalyses from '@/pages/SavedAnalyses';
import Sources from '@/pages/Sources';
import { AnalysisProvider } from '@/lib/AnalysisContext';
import { MobileToolsProvider } from '@/components/propwise/MobileTools';
import AmbientBackground from '@/components/propwise/AmbientBackground';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SharedReport from '@/pages/SharedReport';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user } = useAuth();
  const location = useLocation();
  const authPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const loginRedirect = <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />;

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError && !authPage) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') return loginRedirect;
    return <div className="p-8 text-ink" role="alert">Unable to load the app. Please refresh and try again.</div>;
  }

  // Render the main app
  return (
    <AnalysisProvider key={user?.id || 'guest'}>
      <MobileToolsProvider>
      <Routes>
        {/* Add your page Route elements here */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Analysis tools are public — usable without login. Saving & sharing require an account. */}
        <Route path="/analysis" element={<Navigate to="/analysis/new" replace />} />
        <Route path="/analysis/new" element={<Onboarding />} />
        <Route path="/analysis/affordability" element={<Analysis />} />
        <Route path="/analysis/property-costs" element={<Analysis />} />
        <Route path="/analysis/investment" element={<Analysis />} />
        <Route path="/analysis/:id" element={<Analysis />} />
        <Route element={<ProtectedRoute unauthenticatedElement={loginRedirect} />}>
          <Route path="/tools/saved" element={<SavedAnalyses />} />
          <Route path="/tools/sources" element={<Sources />} />
          <Route path="/shared/:id" element={<SharedReport />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      </MobileToolsProvider>
    </AnalysisProvider>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AmbientBackground />
          <div className="relative z-10">
            <AuthenticatedApp />
          </div>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App