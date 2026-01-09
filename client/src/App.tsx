import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import VendedorDetalhes from "./pages/VendedorDetalhes";
import Analises from "./pages/Analises";
import MetasTrimestral from "./pages/MetasTrimestral";
import ProgressoSemanal from "./pages/ProgressoSemanal";
import RelatorioFornecedores from "./pages/RelatorioFornecedores";
import DashboardFornecedores from "./pages/DashboardFornecedores";
import MonitoramentoVendas from "./pages/MonitoramentoVendas";
import MeuPainel from "./pages/MeuPainel";
import MetaTrimestralDetalhes from "./pages/MetaTrimestralDetalhes";
import ApresentacaoResultados from "./pages/ApresentacaoResultados";
import Portal from "./pages/Portal";
import Suporte from "./pages/Suporte";
import ApresentacaoMetaTrimestral1 from "./pages/ApresentacaoMetaTrimestral1";
import { ProtectedRoute } from "./components/ProtectedRoute";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/portal"} component={Portal} />
      <Route path={"/"} component={Home} />
      <Route path="/vendedor/:id">
        {(params) => <VendedorDetalhes params={params} />}
      </Route>
      <Route path="/analises">
        <ProtectedRoute allowedRoles={["admin"]}>
          <Analises />
        </ProtectedRoute>
      </Route>
      <Route path="/metas-trimestral">
        <ProtectedRoute allowedRoles={["admin"]}>
          <MetasTrimestral />
        </ProtectedRoute>
      </Route>
      <Route path="/metas-trimestral/:trimestre">
        {(params) => (
          <ProtectedRoute allowedRoles={["admin"]}>
            <MetaTrimestralDetalhes params={params} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/progresso-semanal">
        <ProtectedRoute allowedRoles={["admin"]}>
          <ProgressoSemanal />
        </ProtectedRoute>
      </Route>
      <Route path="/fornecedores">
        <ProtectedRoute allowedRoles={["admin"]}>
          <RelatorioFornecedores />
        </ProtectedRoute>
      </Route>
      <Route path="/fornecedores/dashboard">
        <ProtectedRoute allowedRoles={["admin"]}>
          <DashboardFornecedores />
        </ProtectedRoute>
      </Route>
      <Route path="/monitoramento">
        <ProtectedRoute allowedRoles={["admin"]}>
          <MonitoramentoVendas />
        </ProtectedRoute>
      </Route>
      <Route path="/meu-painel" component={MeuPainel} />
      <Route path="/apresentacao-resultados" component={ApresentacaoResultados} />
      <Route path="/apresentacao-meta-trimestral-1" component={ApresentacaoMetaTrimestral1} />
      <Route path="/suporte">
        <ProtectedRoute allowedRoles={["admin", "suporte"]}>
          <Suporte />
        </ProtectedRoute>
      </Route>
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
