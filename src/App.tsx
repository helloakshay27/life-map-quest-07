import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DailyJournal from "./pages/DailyJournal";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/daily-journal" element={<DailyJournal />} />
              <Route path="/weekly-journal" element={<PlaceholderPage />} />
              <Route path="/calendar" element={<PlaceholderPage />} />
              <Route path="/vision-values" element={<PlaceholderPage />} />
              <Route path="/bucket-list" element={<PlaceholderPage />} />
              <Route path="/goals-habits" element={<PlaceholderPage />} />
              <Route path="/todos" element={<PlaceholderPage />} />
              <Route path="/people" element={<PlaceholderPage />} />
              <Route path="/kra" element={<PlaceholderPage />} />
              <Route path="/analytics" element={<PlaceholderPage />} />
              <Route path="/achievements" element={<PlaceholderPage />} />
              <Route path="/learn" element={<PlaceholderPage />} />
              <Route path="/help" element={<PlaceholderPage />} />
              <Route path="/leaderboard" element={<PlaceholderPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
