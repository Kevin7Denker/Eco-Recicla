import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardHistory from "./pages/DashboardHistory";
import Map from "./pages/Map";
import DeliveryRegistration from "./pages/DeliveryRegistration";
import Coupons from "./pages/Coupons";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MainLayout from "./components/MainLayout";
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
          {/* Routes that should NOT show the main navbar */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Index />} />

          {/* Routes wrapped by MainLayout (show navbar) */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/history" element={<DashboardHistory />} />
            <Route path="/map" element={<Map />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/delivery" element={<DeliveryRegistration />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin-only routes (separate layout) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/admin/collection-points"
            element={<CollectionPointsManagement />}
          />
          <Route path="/admin/partners" element={<PartnersManagement />} />
          <Route path="/admin/coupons" element={<CouponsManagement />} />
          <Route path="/admin/users" element={<UsersManagement />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
