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
import HelpAndResources from "./pages/HelpAndResources";
import LearnAndConnect from "./pages/LearnAndConnect";
import CalendarPage from "./pages/CalendarPage";
import GoalsHabits from "./pages/GoalsHabits";
import Achievements from "./pages/Achievements";
import Todos from "./pages/Todos";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import LeaderBoard from "./pages/LeaderBoard";
import Analytics from "./pages/Analytics";
import People from "./pages/People";
import VisionAndValues from "./pages/VisionAndValues";
import BucketList from "@/components/BucketList";
import SignUp from "./pages/SignUp";
import KraSelfEvaluation from "./pages/KRA";
import WeeklyJournal from "./pages/WeeklyJournal";

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
<<<<<<< HEAD
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/daily-journal" element={<DailyJournal />} />
              <Route path="/weekly-journal" element={<PlaceholderPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/vision-values" element={<PlaceholderPage />} />
              <Route path="/bucket-list" element={<PlaceholderPage />} />
              <Route path="/goals-habits" element={<GoalsHabits />} />
              <Route path="/todos" element={<Todos />} />
              <Route path="/people" element={<PlaceholderPage />} />
              <Route path="/kra" element={<PlaceholderPage />} />
              <Route path="/analytics" element={<PlaceholderPage />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/learn" element={<LearnAndConnect />} />
              <Route path="/help" element={<HelpAndResources />} />
              <Route path="/leaderboard" element={<PlaceholderPage />} />
            </Route>
=======
            <Route path="/signUp" element={<SignUp />} />

           // ... baaki upar ka imports aur code same rahega ...

            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/daily-journal" element={<DailyJournal />} />
              <Route path="/weekly-journal" element={<WeeklyJournal />} />
              <Route path="/calendar" element={<PlaceholderPage />} />
              <Route path="/vision-values" element={<VisionAndValues />} />
              <Route path="/bucket-list" element={<BucketList />} />
              <Route path="/goals-habits" element={<PlaceholderPage />} />
              <Route path="/people" element={<People />} />
              <Route path="/kra" element={<KraSelfEvaluation />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/achievements" element={<PlaceholderPage />} />
              <Route path="/learn" element={<PlaceholderPage />} />
              <Route path="/help" element={<PlaceholderPage />} />
              <Route path="/leaderboard" element={<LeaderBoard />} />
            </Route>

// ... baaki niche ka code same rahega ...
>>>>>>> 78510557ae80df2635b8e854fcda3eaa3bfac0ac
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
