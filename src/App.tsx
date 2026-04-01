import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import RMInward from "./pages/RMInward";
import RMOutward from "./pages/RMOutward";
import BMR from "./pages/BMR";
import RMMaster from "./pages/RMMaster";
import StockLedger from "./pages/StockLedger";
import ScheduleTA from "./pages/ScheduleTA";
import MFRTable from "./pages/MFRTable";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rm-inward" element={<RMInward />} />
            <Route path="/rm-outward" element={<RMOutward />} />
            <Route path="/bmr" element={<BMR />} />
            <Route path="/rm-master" element={<RMMaster />} />
            <Route path="/stock-ledger" element={<StockLedger />} />
            <Route path="/schedule-ta" element={<ScheduleTA />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
