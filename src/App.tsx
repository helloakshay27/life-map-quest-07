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
import KRA from "./pages/KRA";
import ForFamily from "./pages/ForFamily";
import UpdatePassword from "./pages/UpdatePass";
import Setup from "./pages/Setup";
import ResetPasswordEmail from "./pages/resetPassEmail";

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
            <Route path="/resetPasswordemail" element={<ResetPasswordEmail/>} />
            <Route path="/reset-password" element={<UpdatePassword />} />

            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/daily-journal" element={<DailyJournal />} />
              <Route path="/weekly-journal" element={<WeeklyJournal />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/vision-values" element={<VisionAndValues />} />
              <Route path="/bucket-list" element={<BucketList />} />
              <Route path="/goals-habits" element={<GoalsHabits />} />
              <Route path="/todos" element={<Todos />} />
              <Route path="/people" element={<People />} />
              <Route path="/for-family" element={<ForFamily />} />
              <Route path="/kra" element={<KRA />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/learn" element={<LearnAndConnect />} />
              <Route path="/help" element={<HelpAndResources />} />
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
