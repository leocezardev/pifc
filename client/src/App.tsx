import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ContractsList from "@/pages/ContractsList";
import ContractDetail from "@/pages/ContractDetail";
import NovaFiscalizacao from "@/pages/NovaFiscalizacao";
import { DashboardLayout } from "@/components/DashboardLayout";

function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="animate-enter">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Configurações</h2>
        <p className="text-sm text-gray-600">Página de configurações em desenvolvimento.</p>
        <div className="mt-8 bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <span className="material-icons-outlined text-6xl text-gray-300 mb-4 block">settings</span>
          <h3 className="text-lg font-bold text-gray-700 mb-1">Em Breve</h3>
          <p className="text-gray-500 text-sm">As configurações do sistema estão sendo desenvolvidas.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contracts" component={ContractsList} />
      <Route path="/contracts/:id" component={ContractDetail} />
      <Route path="/nova-fiscalizacao" component={NovaFiscalizacao} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
