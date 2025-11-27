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

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/vendedor/:id">
        {(params) => <VendedorDetalhes params={params} />}
      </Route>
      <Route path="/analises" component={Analises} />
      <Route path="/metas-trimestral" component={MetasTrimestral} />
      <Route path="/progresso-semanal" component={ProgressoSemanal} />
      <Route path="/fornecedores" component={RelatorioFornecedores} />
      <Route path="/fornecedores/dashboard" component={DashboardFornecedores} />
      <Route path="/monitoramento" component={MonitoramentoVendas} />
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
