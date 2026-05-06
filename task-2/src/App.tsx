import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import RequireAuth from "@/components/RequireAuth";
import Explore from "./pages/Explore";
import EventPage from "./pages/EventPage";
import HostPublicPage from "./pages/HostPublicPage";
import AuthPage from "./pages/auth/AuthPage";
import MyTickets from "./pages/MyTickets";
import MyEvents from "./pages/MyEvents";
import BecomeHost from "./pages/host/BecomeHost";
import HostDashboard from "./pages/host/HostDashboard";
import HostTeam from "./pages/host/HostTeam";
import HostReports from "./pages/host/HostReports";
import EventEditor from "./pages/host/EventEditor";
import CheckIn from "./pages/host/CheckIn";
import InviteAccept from "./pages/host/InviteAccept";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/AI_Challenge_2">
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Explore />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/e/:id" element={<EventPage />} />
              <Route path="/h/:slug" element={<HostPublicPage />} />
              <Route path="/invite/:token" element={<InviteAccept />} />
              <Route path="/tickets" element={<RequireAuth><MyTickets /></RequireAuth>} />
              <Route path="/my-events" element={<RequireAuth><MyEvents /></RequireAuth>} />
              <Route path="/host/new" element={<RequireAuth><BecomeHost /></RequireAuth>} />
              <Route path="/host/:hostId/dashboard" element={<RequireAuth><HostDashboard /></RequireAuth>} />
              <Route path="/host/:hostId/team" element={<RequireAuth><HostTeam /></RequireAuth>} />
              <Route path="/host/:hostId/reports" element={<RequireAuth><HostReports /></RequireAuth>} />
              <Route path="/host/:hostId/events/new" element={<RequireAuth><EventEditor /></RequireAuth>} />
              <Route path="/host/:hostId/events/:eventId" element={<RequireAuth><EventEditor /></RequireAuth>} />
              <Route path="/host/:hostId/events/:eventId/check-in" element={<RequireAuth><CheckIn /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
