import { useState, useCallback, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigationType,
  type Location,
} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoadingScreen from "@/components/LoadingScreen";
import PageTransition from "@/components/PageTransition";
import LandingPage from "./pages/LandingPage";
import HauntedHouse from "./pages/Index";
import EscapeRoom from "./pages/EscapeRoom";
import GamesPage from "./pages/GamesPage";
import ChessTournament from "./pages/ChessTournament";
import AdminHub from "./pages/AdminHub";
import AdminPage from "./pages/AdminPage";
import AdminEscapeRoom from "./pages/AdminEscapeRoom";
import AdminGames from "./pages/AdminGames";
import AdminChess from "./pages/AdminChess";
import AdminLogin from "./pages/AdminLogin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import CancelBooking from "./pages/CancelBooking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const EXIT_DURATION = 500;
const ENTER_DELAY = 40;

const AnimatedRoutes = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const [displayLocation, setDisplayLocation] = useState<Location>(location);
  const [stage, setStage] = useState<'enter' | 'idle' | 'exit'>('idle');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const prevKey = useRef(location.key);

  useEffect(() => {
    if (location.key === prevKey.current) return;

    const isBack = navType === 'POP';
    let enterTimer: number | undefined;

    setDirection(isBack ? 'back' : 'forward');
    setStage('exit');

    const exitTimer = window.setTimeout(() => {
      prevKey.current = location.key;
      setDisplayLocation(location);
      setStage('enter');

      enterTimer = window.setTimeout(() => {
        setStage('idle');
      }, ENTER_DELAY);
    }, EXIT_DURATION);

    return () => {
      window.clearTimeout(exitTimer);
      if (enterTimer) {
        window.clearTimeout(enterTimer);
      }
    };
  }, [location, navType]);

  return (
    <PageTransition stage={stage} direction={direction}>
      <Routes location={displayLocation}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/haunted-house" element={<HauntedHouse />} />
        <Route path="/escape-room" element={<EscapeRoom />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/chess-tournament" element={<ChessTournament />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/cancel-booking" element={<CancelBooking />} />
        <Route path="/admin" element={<ProtectedAdminRoute><AdminHub /></ProtectedAdminRoute>} />
        <Route path="/admin/haunted-house" element={<ProtectedAdminRoute activity="haunted-house"><AdminPage /></ProtectedAdminRoute>} />
        <Route path="/admin/escape-room" element={<ProtectedAdminRoute activity="escape-room"><AdminEscapeRoom /></ProtectedAdminRoute>} />
        <Route path="/admin/games" element={<ProtectedAdminRoute activity="games"><AdminGames /></ProtectedAdminRoute>} />
        <Route path="/admin/chess" element={<ProtectedAdminRoute activity="chess"><AdminChess /></ProtectedAdminRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

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
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
