import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { CRM } from "./pages/CRM";
import { Projects } from "./pages/Projects";
import { Tasks } from "./pages/Tasks";
import { Billing } from "./pages/Billing";
import { CashFlow } from "./pages/CashFlow";
import { Settings } from "./pages/Settings";
import { Notifications } from "./pages/Notifications";
import { Login } from "./pages/Login";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { PlanProtectedRoute } from "./components/PlanProtectedRoute";

const queryClient = new QueryClient();

// Componente para proteger rotas normais
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isAccountValid } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAccountValid()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Conta Expirada</h2>
          <p className="text-gray-600 mb-4">Sua conta expirou ou está inativa. Entre em contato com o suporte.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// Componente para proteger rotas administrativas
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  
  // Verificar se é admin através do token admin
  const adminToken = localStorage.getItem('admin_token');
  const isAdmin = !!adminToken;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

// Componente para redirecionar usuários logados
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const adminToken = localStorage.getItem('admin_token');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se está logado como usuário normal, redirecionar para dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se está logado como admin, redirecionar para dashboard admin
  if (adminToken) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Rotas Administrativas */}
            <Route 
              path="/admin/login" 
              element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />
            
            {/* Rotas Protegidas do Sistema */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/crm" 
              element={
                <ProtectedRoute>
                  <CRM />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <PlanProtectedRoute requiredPlans={['COMPOSITE', 'MANAGERIAL']}>
                    <Projects />
                  </PlanProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute>
                  <PlanProtectedRoute requiredPlans={['COMPOSITE', 'MANAGERIAL']}>
                    <Tasks />
                  </PlanProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/billing" 
              element={
                <ProtectedRoute>
                  <PlanProtectedRoute requiredPlans={['MANAGERIAL']}>
                    <Billing />
                  </PlanProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cashflow" 
              element={
                <ProtectedRoute>
                  <PlanProtectedRoute requiredPlans={['MANAGERIAL']}>
                    <CashFlow />
                  </PlanProtectedRoute>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            
            {/* Rotas de Compatibilidade (URLs antigas) */}
            <Route path="/projetos" element={<Navigate to="/projects" replace />} />
            <Route path="/tarefas" element={<Navigate to="/tasks" replace />} />
            <Route path="/cobranca" element={<Navigate to="/billing" replace />} />
            <Route path="/fluxo-caixa" element={<Navigate to="/cashflow" replace />} />
            <Route path="/configuracoes" element={<Navigate to="/settings" replace />} />
            <Route path="/notificacoes" element={<Navigate to="/notifications" replace />} />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
