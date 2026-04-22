import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FormulationProvider } from "@/context/FormulationContext";
import { BMRProvider } from "@/context/BMRContext";
import { StockProvider } from "@/context/StockContext";
import { SupplierProvider } from "@/context/SupplierContext";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import RMInward from "./pages/RMInward";
import RMOutward from "./pages/RMOutward";
import BMR from "./pages/BMR";
import BMRCreate from "./pages/BMRCreate";
import BMRDetail from "./pages/BMRDetail";
import RMMaster from "./pages/RMMaster";
import StockLedger from "./pages/StockLedger";
import ScheduleTA from "./pages/ScheduleTA";
import MFRTable from "./pages/MFRTable";
import MFRCreate from "./pages/MFRCreate";
import BatchPrefixAudit from "./pages/BatchPrefixAudit";
import SupplierMaster from "./pages/SupplierMaster";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FormulationProvider>
        <BMRProvider>
          <StockProvider>
          <SupplierProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/rm-inward" element={<RMInward />} />
                  <Route path="/rm-outward" element={<RMOutward />} />
                  <Route path="/bmr" element={<BMR />} />
                  <Route path="/bmr-create" element={<BMRCreate />} />
                  <Route path="/bmr/:id" element={<BMRDetail />} />
                  <Route path="/rm-master" element={<RMMaster />} />
                  <Route path="/stock-ledger" element={<StockLedger />} />
                  <Route path="/schedule-ta" element={<ScheduleTA />} />
                  <Route path="/mfr-table" element={<MFRTable />} />
                  <Route path="/mfr-create" element={<MFRCreate />} />
                  <Route path="/batch-prefix-audit" element={<BatchPrefixAudit />} />
                  <Route path="/supplier-master" element={<SupplierMaster />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SupplierProvider>
          </StockProvider>
        </BMRProvider>
      </FormulationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
