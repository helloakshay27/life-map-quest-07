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
import LeaderBoard from "./pages/LeaderBoard";
import Analytics from "./pages/Analytics";
import People from "./pages/People";
import VisionAndValues from "./pages/VisionAndValues";
import BucketList from "./components/BucketList";
import SignUp from "./pages/SignUp";
import KraSelfEvaluation from "./pages/KRA";
import WeeklyJournal from "./pages/WeeklyJournal";
import BucketList from "@/components/BucketList";

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
            <Route path="/signUp" element={<SignUp />} />

            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/daily-journal" element={<DailyJournal />} />
              <Route path="/weekly-journal" element={<WeeklyJournal />} />
              <Route path="/calendar" element={<PlaceholderPage />} />
              <Route path="/vision-values" element={<VisionAndValues />} />
              <Route path="/bucket-list" element={<BucketList />} />
              <Route path="/vision-values" element={<PlaceholderPage />} />
              <Route path="/bucket-list" element={<BucketList />} />
              <Route path="/goals-habits" element={<PlaceholderPage />} />
              <Route path="/todos" element={<PlaceholderPage />} />
              <Route path="/people" element={<People />} />
              <Route path="/kra" element={<KraSelfEvaluation />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/achievements" element={<PlaceholderPage />} />
              <Route path="/learn" element={<PlaceholderPage />} />
              <Route path="/help" element={<PlaceholderPage />} />
              <Route path="/leaderboard" element={<LeaderBoard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
