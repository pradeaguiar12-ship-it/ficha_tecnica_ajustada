import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeStorage } from "@/lib/storage";
import { registerServiceWorker } from "@/lib/pwa";
import { CommandMenu } from "@/components/CommandMenu";
import { Onboarding } from "@/components/Onboarding";
import { useCommonShortcuts } from "@/hooks/useKeyboardShortcuts";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { FeatureGuard } from "@/components/FeatureGuard";
import { FEATURES } from "@/lib/features";
import { api } from "@/services/api";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RecipeCardGridSkeleton } from "@/components/ui/skeleton-cards";

// Lazy loading de páginas para otimizar bundle
const Index = lazy(() => import("./pages/Index"));
const FichaTecnicaList = lazy(() => import("./pages/FichaTecnicaList"));
const FichaTecnicaNova = lazy(() => import("./pages/FichaTecnicaNova"));
const FichaTecnicaEdit = lazy(() => import("./pages/FichaTecnicaEdit"));
const Ingredientes = lazy(() => import("./pages/Ingredientes"));
const ConfiguracoesCustos = lazy(() => import("./pages/ConfiguracoesCustos"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Simulador = lazy(() => import("./pages/Simulador"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, subscription } = useUser();

  // Inicializa o storage na montagem do app
  useEffect(() => {
    initializeStorage();
  }, []);

  // Registra Service Worker para PWA
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Configura API com dados do usuário
  useEffect(() => {
    if (user?.id) {
      api.setUserId(user.id);
      // Token será definido pelo app mãe via postMessage
    }
  }, [user]);

  // Atalhos de teclado globais
  useCommonShortcuts();

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="space-y-4 w-full max-w-4xl p-4">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-24 bg-muted animate-pulse rounded" />
                <div className="h-24 bg-muted animate-pulse rounded" />
                <div className="h-24 bg-muted animate-pulse rounded" />
                <div className="h-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/dashboard"
            element={
              <FeatureGuard feature={FEATURES.ANALYTICS}>
                <Dashboard />
              </FeatureGuard>
            }
          />
          <Route
            path="/simulador"
            element={
              <FeatureGuard feature={FEATURES.SIMULATOR}>
                <Simulador />
              </FeatureGuard>
            }
          />
          <Route path="/ficha-tecnica" element={<FichaTecnicaList />} />
          <Route path="/ficha-tecnica/nova" element={<FichaTecnicaNova />} />
          <Route path="/ficha-tecnica/:id" element={<FichaTecnicaEdit />} />
          <Route path="/ficha-tecnica/ingredientes" element={<Ingredientes />} />
          <Route path="/configuracoes/custos" element={<ConfiguracoesCustos />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Componentes globais */}
      <CommandMenu />
      <Onboarding />
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <UserProvider enablePostMessage={true}>
              <AppContent />
            </UserProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
