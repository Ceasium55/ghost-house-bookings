import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingScreen from "@/components/LoadingScreen";
import LandingPage from "./pages/LandingPage";
import HauntedHouse from "./pages/Index";
import EscapeRoom from "./pages/EscapeRoom";
import GamesPage from "./pages/GamesPage";
import AdminHub from "./pages/AdminHub";
import AdminPage from "./pages/AdminPage";
import AdminEscapeRoom from "./pages/AdminEscapeRoom";
import AdminGames from "./pages/AdminGames";
import AdminLogin from "./pages/AdminLogin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import CancelBooking from "./pages/CancelBooking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const handleLoaded = useCallback(() => setLoading(false), []);

  return (
  <QueryClientProvider client={queryClient}>
    {loading && <LoadingScreen onFinished={handleLoaded} />}
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/haunted-house" element={<HauntedHouse />} />
          <Route path="/escape-room" element={<EscapeRoom />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/cancel-booking" element={<CancelBooking />} />
          <Route path="/admin" element={<ProtectedAdminRoute><AdminHub /></ProtectedAdminRoute>} />
          <Route path="/admin/haunted-house" element={<ProtectedAdminRoute activity="haunted-house"><AdminPage /></ProtectedAdminRoute>} />
          <Route path="/admin/escape-room" element={<ProtectedAdminRoute activity="escape-room"><AdminEscapeRoom /></ProtectedAdminRoute>} />
          <Route path="/admin/games" element={<ProtectedAdminRoute activity="games"><AdminGames /></ProtectedAdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
