
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import InitializationChecker from "@/components/setup/InitializationChecker";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Index";
import TicketsIndex from "./pages/tickets/Index";
import TicketDetail from "./pages/tickets/TicketDetail";
import CRMIndex from "./pages/crm/Index";
import ContactsIndex from "./pages/crm/contacts/Index";
import CompaniesIndex from "./pages/crm/companies/Index";
import DealsIndex from "./pages/deals/Index";
import KnowledgeBaseIndex from "./pages/knowledge-base/Index";
import ReportsIndex from "./pages/reports/Index";
import SettingsIndex from "./pages/settings/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DatabaseProvider>
            <InitializationChecker>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets" element={<TicketsIndex />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/crm" element={<CRMIndex />} />
                <Route path="/crm/contacts" element={<ContactsIndex />} />
                <Route path="/crm/companies" element={<CompaniesIndex />} />
                <Route path="/deals" element={<DealsIndex />} />
                <Route path="/knowledge-base" element={<KnowledgeBaseIndex />} />
                <Route path="/reports" element={<ReportsIndex />} />
                <Route path="/settings" element={<SettingsIndex />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </InitializationChecker>
          </DatabaseProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
