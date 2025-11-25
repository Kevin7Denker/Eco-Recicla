import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Map from "./pages/Map";
import DeliveryRegistration from "./pages/DeliveryRegistration";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CollectionPointsManagement from "./pages/admin/CollectionPointsManagement";
import PartnersManagement from "./pages/admin/PartnersManagement";
import CouponsManagement from "./pages/admin/CouponsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<Map />} />
          <Route path="/delivery" element={<DeliveryRegistration />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/collection-points" element={<CollectionPointsManagement />} />
          <Route path="/admin/partners" element={<PartnersManagement />} />
          <Route path="/admin/coupons" element={<CouponsManagement />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
