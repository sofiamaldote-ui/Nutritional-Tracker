import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';

// Pages
import LoginPage from '@/pages/login';
import SetupPage from '@/pages/setup';
import DashboardPage from '@/pages/dashboard';
import PacientesPage from '@/pages/pacientes';
import PacienteDetailPage from '@/pages/paciente-detail';
import ConsultaDetailPage from '@/pages/consulta-detail';
import GruposPage from '@/pages/grupos';
import GrupoDetailPage from '@/pages/grupo-detail';
import BibliotecaPage from '@/pages/biblioteca';
import ConfiguracoesPage from '@/pages/configuracoes';

import PortalFeedPage from '@/pages/portal-feed';
import PortalConsultasPage from '@/pages/portal-consultas';
import PortalPerfilPage from '@/pages/portal-perfil';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/setup" component={SetupPage} />
      
      {/* Protected Routes */}
      <Route path="/">
        {() => (
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        )}
      </Route>
      <Route path="/dashboard">
        {() => (
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        )}
      </Route>
      
      {/* Nutri Routes */}
      <Route path="/pacientes">
        {() => (
          <AppLayout>
            <PacientesPage />
          </AppLayout>
        )}
      </Route>
      <Route path="/pacientes/:id">
        {() => (
          <AppLayout>
            <PacienteDetailPage />
          </AppLayout>
        )}
      </Route>
      <Route path="/pacientes/:id/consultas/:consultationId">
        {() => (
          <AppLayout>
            <ConsultaDetailPage />
          </AppLayout>
        )}
      </Route>
      <Route path="/grupos">
        {() => (
          <AppLayout>
            <GruposPage />
          </AppLayout>
        )}
      </Route>
      <Route path="/grupos/:id">
        {() => (
          <AppLayout>
            <GrupoDetailPage />
          </AppLayout>
        )}
      </Route>
      <Route path="/biblioteca">
        {() => (
          <AppLayout>
            <BibliotecaPage />
          </AppLayout>
        )}
      </Route>
      <Route path="/configuracoes">
        {() => (
          <AppLayout>
            <ConfiguracoesPage />
          </AppLayout>
        )}
      </Route>

      {/* Patient Routes */}
      <Route path="/portal">
        {() => (
          <AppLayout>
            <PortalFeedPage />
          </AppLayout>
        )}
      </Route>
      <Route path="/portal/consultas">
        {() => (
          <AppLayout>
            <PortalConsultasPage />
          </AppLayout>
        )}
      </Route>
      <Route path="/portal/perfil">
        {() => (
          <AppLayout>
            <PortalPerfilPage />
          </AppLayout>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
