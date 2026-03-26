import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp, Calendar, Zap, Settings, BookOpen, CalendarDays,
  Trophy, Sparkles, Play, ChevronLeft, ChevronRight, Target,
  CalendarIcon, ListTodo, ArrowRight, Heart, Lock, Flame,
  Lightbulb, Plus, ListOrdered, AlertCircle, CheckCircle,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";

// ─── Brand Palette ────────────────────────────────────────────────────────────
const C = {
  coral:      "#D5474E",
  coral8:     "rgba(213,71,78,0.08)",
  coral15:    "rgba(213,71,78,0.15)",
  coral25:    "rgba(213,71,78,0.25)",
  charcoal:   "#2A2A2A",
  cream:      "#F5CECA",
  forest:     "#0B5541",
  forest8:    "rgba(11,85,65,0.08)",
  forest15:   "rgba(11,85,65,0.15)",
  violet:     "#5534B7",
  violet8:    "rgba(85,52,183,0.08)",
  violet15:   "rgba(85,52,183,0.15)",
  sand:       "#C5AB92",
  sand30:     "rgba(197,171,146,0.30)",
  dune:       "#E8C0A8",
  mist:       "#D1D4A6",
  stone:      "#888765",
  sky:        "#2B6CC5",
  sky8:       "rgba(43,108,197,0.08)",
  sky15:      "rgba(43,108,197,0.15)",
  amber:      "#F4A94C",
  amber8:     "rgba(244,169,76,0.08)",
  amber15:    "rgba(244,169,76,0.15)",
  leaf:       "#3A6011",
  lavender:   "#C0CBEB",
  success:    "#44AF90",
  crimson:    "#C72540",
  pageBg:     "#FAF7F3",
};

const Dashboard = () => {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard - User from AuthContext:", user);
    console.log("Dashboard - Token:", token);
    console.log("Dashboard - LocalStorage user:", localStorage.getItem("user"));
  }, [user, token]);

  useEffect(() => {
    if (user && (user.name === "User" || user.name === "Guest") && token) {
      const fetchProfile = async () => {
        try {
          const res = await fetch("https://life-api.lockated.com/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const bestName = [
              data.name, data.full_name,
              [data.first_name, data.last_name].filter(Boolean).join(" "),
              data.username, data.given_name,
            ].find((n) => n && typeof n === "string" && n.trim() !== "") || user.name;
            if (bestName !== user.name) login(token, { ...user, name: bestName });
          }
        } catch (err) { console.error("Dashboard - Failed to fetch profile:", err); }
      };
      fetchProfile();
    }
  }, [user, token, login]);

  const [summaryData, setSummaryData] = useState<{
    energy_average?: string | number | null;
    alignment_average?: string | number | null;
    total_score?: number;
    highest_badge?: string | null;
    current_streak?: number;
    longest_streak?: number;
    life_balance?: { career?: number; health?: number; relationships?: number; growth?: number; finance?: number };
  } | null>(null);

  const [setupCount, setSetupCount] = useState<{ completed: number; total: number }>({ completed: 2, total: 5 });

  useEffect(() => {
    const completed = parseInt(localStorage.getItem("setupCompletedCount") || "2");
    const total = parseInt(localStorage.getItem("setupTotalCount") || "5");
    setSetupCount({ completed, total });
    const handleStorageChange = () => {
      setSetupCount({
        completed: parseInt(localStorage.getItem("setupCompletedCount") || "2"),
        total: parseInt(localStorage.getItem("setupTotalCount") || "5"),
      });
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) handleStorageChange();
    };
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const [insightsData, setInsightsData] = useState<{
    recent_journals: Array<{ id: number; title?: string; created_at?: string; journal_date?: string; [key: string]: unknown }>;
    personalized_insights: Array<{ id?: number; insight?: string; text?: string; [key: string]: unknown }>;
    journaling_status: { monthly_entries: number; weekly_entries: number };
  }>({ recent_journals: [], personalized_insights: [], journaling_status: { monthly_entries: 0, weekly_entries: 0 } });

  const [previewData, setPreviewData] = useState<{
    daily_motivator: string | null;
    priorities: Array<{ id?: number; title?: string; description?: string; [key: string]: unknown }>;
    upcoming_dates: Array<{ id?: number; title?: string; date?: string; [key: string]: unknown }>;
    story_of_the_day: string | null;
    mission: string | null;
    bucket_preview: Array<{ id: number; title?: string; category?: string; status?: string; [key: string]: unknown }>;
    leaderboard_preview: Array<{ name: string; points: number }>;
    vision_images: string[];
    vision_statement: string | null;
  }>({
    daily_motivator: null, priorities: [], upcoming_dates: [],
    story_of_the_day: null, mission: null, bucket_preview: [],
    leaderboard_preview: [], vision_images: [], vision_statement: null,
  });

  const [recentJournals, setRecentJournals] = useState<any[]>([]);
  const [weeklyJournals, setWeeklyJournals] = useState<any[]>([]);

  // ── NEW TODOS STATE ──
  const [todosData, setTodosData] = useState<any[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);

  // Fetch Todos
  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoadingTodos(true);
      try {
        const res = await fetch("https://life-api.lockated.com/todos", {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` }
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.data || data.todos || []);
          setTodosData(list);
        }
      } catch (err) {
        console.error("Failed to fetch todos:", err);
      } finally {
        setIsLoadingTodos(false);
      }
    };
    fetchTodos();
  }, [token]);

  useEffect(() => {
    const fetchAllJournals = async () => {
      try {
        const authHeader = { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` };
        const [dailyRes, weeklyRes] = await Promise.all([
          fetch("https://life-api.lockated.com/user_journals", { headers: authHeader }),
          fetch("https://life-api.lockated.com/user_journals?journal_type=weekly", { headers: authHeader }),
        ]);
        if (dailyRes.ok) { const data = await dailyRes.json(); setRecentJournals(Array.isArray(data) ? data : data?.user_journals || []); }
        if (weeklyRes.ok) { const data = await weeklyRes.json(); setWeeklyJournals(Array.isArray(data) ? data : data?.user_journals || []); }
      } catch (err) { console.error("Failed to fetch journals:", err); }
    };
    fetchAllJournals();
  }, [token]);

  const [calendarDate, setCalendarDate] = useState(new Date());

  const weekData = useMemo(() => {
    const start = new Date(calendarDate);
    start.setDate(calendarDate.getDate() - calendarDate.getDay());
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i); d.setHours(0, 0, 0, 0);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const isToday = d.toDateString() === today.toDateString();
      const isFuture = d > today;
      const hasJournal = recentJournals.some((j) => {
        const journalDate = j.start_date || (j.created_at ? j.created_at.split("T")[0] : "");
        return journalDate === dateString;
      });
      return { day: ["Su", "M", "Tu", "W", "Th", "F", "Sa"][i], date: d.getDate().toString(), fullDate: d, active: isToday, state: isFuture ? "upcoming" : hasJournal ? "filled" : "missed" };
    });
  }, [calendarDate, recentJournals]);

  const handlePrevWeek = () => { const d = new Date(calendarDate); d.setDate(d.getDate() - 7); setCalendarDate(d); };
  const handleNextWeek = () => { const d = new Date(calendarDate); d.setDate(d.getDate() + 7); setCalendarDate(d); };
  const getWeekLabel = () => {
    const today = new Date();
    const start = new Date(calendarDate); start.setDate(calendarDate.getDate() - calendarDate.getDay());
    const end = new Date(start); end.setDate(start.getDate() + 6);
    const isCurrentWeek = today >= start && today <= new Date(end.setHours(23, 59, 59, 999));
    if (isCurrentWeek) return "This Week";
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  useEffect(() => {
    const fetch_ = async (url: string, setter: (d: any) => void) => {
      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` } });
        if (res.ok) setter(await res.json());
      } catch (err) { console.error("Fetch failed:", url, err); }
    };
    fetch_("https://life-api.lockated.com/dashboard/summary", (data) => setSummaryData(data));
    fetch_("https://life-api.lockated.com/dashboard/insights", (data) => setInsightsData({
      recent_journals: data.recent_journals || [],
      personalized_insights: data.personalized_insights || [],
      journaling_status: data.journaling_status || { monthly_entries: 0, weekly_entries: 0 },
    }));
    fetch_("https://life-api.lockated.com/dashboard/preview", (data) => setPreviewData((prev) => ({
      ...prev, daily_motivator: data.daily_motivator || null,
      upcoming_dates: data.upcoming_dates || [], story_of_the_day: data.story_of_the_day || null,
      mission: data.mission || prev.mission, bucket_preview: data.bucket_preview || [],
    })));
  }, [token]);

  useEffect(() => {
    const fetchVision = async () => {
      try {
        const res = await fetch("https://life-api.lockated.com/vision.json", { headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` } });
        if (res.ok) {
          const data = await res.json();
          const vision = Array.isArray(data) ? data[0] : data?.vision || data;
          if (vision) {
            let imageUrls: string[] = [];
            if (Array.isArray(vision.images)) imageUrls = vision.images.map((img: any) => (typeof img === "object" ? img.url : img)).filter(Boolean);
            else if (vision.image) imageUrls = typeof vision.image === "object" ? [vision.image.url] : [vision.image];
            setPreviewData((prev) => ({ ...prev, vision_images: imageUrls, mission: vision.mission_statement || vision.life_mission || vision.mission || null }));
          }
        }
      } catch (err) { console.error("Failed to fetch vision:", err); }
    };
    fetchVision();
    const onVisibility = () => { if (!document.hidden) fetchVision(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", fetchVision);
    window.addEventListener("vision_data_updated", fetchVision);
    return () => { document.removeEventListener("visibilitychange", onVisibility); window.removeEventListener("storage", fetchVision); window.removeEventListener("vision_data_updated", fetchVision); };
  }, [token]);

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        const response = await fetch("https://life-api.lockated.com/dreams", { headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` } });
        if (!response.ok) return;
        const data = await response.json();
        const mappedItems: Array<{ id: number; title?: string; category?: string; status?: string }> = [];
        const mapCategory = (itemsArray: unknown[], statusStr: string) => {
          if (!Array.isArray(itemsArray)) return;
          itemsArray.forEach((itemObj: unknown) => { const item = itemObj as { id: number; title: string; category: string }; mappedItems.push({ id: item.id, title: item.title, category: item.category, status: statusStr }); });
        };
        mapCategory(data.dreaming, "Dreaming"); mapCategory(data.planning, "Planning");
        mapCategory(data.in_progress, "In Progress"); mapCategory(data.achieved, "Achieved");
        setPreviewData((prev) => ({ ...prev, bucket_preview: mappedItems }));
      } catch (error) { console.error("Error fetching dreams:", error); }
    };
    fetchDreams();
  }, [token]);

  useEffect(() => {
    const fetchAccomplishments = async () => {
      try {
        const d = new Date();
        const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const listResponse = await fetch("https://life-api.lockated.com/user_journals", { headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` } });
        if (listResponse.ok) {
          const listData = await listResponse.json();
          const journals = Array.isArray(listData) ? listData : listData?.user_journals || [];
          const todayJournal = journals.find((j: any) => j.start_date === todayStr);
          if (todayJournal?.id) {
            const detailRes = await fetch(`https://life-api.lockated.com/user_journals/${todayJournal.id}`, { headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` } });
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              const detailedJournal = detailData?.user_journal || detailData;
              const formatted = (Array.isArray(detailedJournal.accomplishments) ? detailedJournal.accomplishments : []).map((a: any, idx: number) => typeof a === "string" ? { id: idx, title: a } : { id: a.id || idx, title: a.title || a.name || "Unnamed" });
              setPreviewData((prev) => ({ ...prev, priorities: formatted })); return;
            }
          }
        }
        setPreviewData((prev) => ({ ...prev, priorities: [] }));
      } catch (error) { console.error("Dashboard accomplishments API error:", error); }
    };
    fetchAccomplishments();
  }, [token]);

  const [people, setPeople] = useState<any[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const res = await fetch("https://life-api.lockated.com/people", { headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` } });
        if (res.ok) { const data = await res.json(); setPeople(Array.isArray(data) ? data : (data.data ?? [])); }
      } catch (err) { console.error("Failed to fetch people:", err); } finally { setIsLoadingPeople(false); }
    };
    fetchPeople();
  }, [token]);

  const [habitsData, setHabitsData] = useState<any[]>([]);
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await fetch("https://life-api.lockated.com/habits", { headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` } });
        if (res.ok) { const data = await res.json(); setHabitsData(Array.isArray(data) ? data : data.data || []); }
      } catch (err) { console.error("Failed to fetch habits:", err); }
    };
    fetchHabits();
  }, [token]);

  const [leaderboardData, setLeaderboardData] = useState<{ top: any[]; currentUser: any }>({ top: [], currentUser: null });
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("https://life-api.lockated.com/leaderboard/rankings", { headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` } });
        if (res.ok) {
          const data = await res.json();
          let list = [], cu = null;
          if (Array.isArray(data)) list = data;
          else if (data.data && Array.isArray(data.data)) { list = data.data; cu = data.current_user || null; }
          else if (data.rankings && Array.isArray(data.rankings)) { list = data.rankings; cu = data.current_user || null; }
          setLeaderboardData({ top: list.slice(0, 5), currentUser: cu });
        }
      } catch (err) { console.error("Failed to fetch leaderboard", err); }
    };
    fetchLeaderboard();
  }, [token]);

  const activeHabitsCount = habitsData.length;
  const avgHabitCompletion = activeHabitsCount > 0 ? Math.round(habitsData.reduce((acc, h) => acc + (h.completion_percentage || h.completion_rate || 0), 0) / activeHabitsCount) : 0;
  const dailyHabits = habitsData.filter((h) => { const f = (h.repeat_type || h.frequency || "").toLowerCase(); return f === "daily" || !f; });
  const weeklyHabits = habitsData.filter((h) => (h.repeat_type || h.frequency || "").toLowerCase() === "weekly");

  const statusToday = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => { const d = new Date(statusToday); d.setDate(statusToday.getDate() - 6 + i); return d; });
  const formatShortDate = (d: Date) => `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}`;
  const dailyDateRangeStr = `${formatShortDate(last7Days[0])} - ${formatShortDate(last7Days[6])}`;
  const dailyCompletion = last7Days.map((date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const hasEntry = recentJournals.some((j) => (j.journal_type === "daily" || !j.journal_type) && (j.start_date === dateString || (j.created_at && j.created_at.startsWith(dateString))));
    return { dayLabel: date.toLocaleDateString("en-US", { weekday: "short" }), completed: hasEntry };
  });
  const dailyCompletedCount = dailyCompletion.filter((d) => d.completed).length;

  const currentMonthStatus = statusToday.getMonth();
  const currentYearStatus = statusToday.getFullYear();
  const monthNameStatus = statusToday.toLocaleDateString("en-US", { month: "long" });
  const getWeekNumber = (d: Date) => { const date = new Date(d.getTime()); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7)); const week1 = new Date(date.getFullYear(), 0, 4); return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7); };
  const weeklyBlocks = Array.from({ length: 5 }).map((_, i) => {
    const startD = new Date(currentYearStatus, currentMonthStatus, 1 + i * 7);
    const endD = new Date(currentYearStatus, currentMonthStatus, 7 + i * 7);
    const hasEntry = weeklyJournals.some((j) => { const jDate = new Date(j.start_date || j.created_at); return jDate >= startD && jDate <= endD; });
    return { label: `WK#${getWeekNumber(startD)}`, datesLabel: `(${startD.toLocaleDateString("en-US", { month: "short" })} ${startD.getDate()}-${endD.getDate()})`, completed: hasEntry };
  });
  const weeklyCompletedCount = weeklyBlocks.filter((w) => w.completed).length;
  const percentComplete = Math.round(((dailyCompletedCount + weeklyCompletedCount) / 12) * 100);

  const last30DaysCount = useMemo(() => {
    if (insightsData.journaling_status.monthly_entries > 0) return insightsData.journaling_status.monthly_entries;
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recentJournals.filter((j) => new Date(j.start_date || j.created_at) >= thirtyDaysAgo).length;
  }, [insightsData.journaling_status.monthly_entries, recentJournals]);

  const consistencyScore = Math.min(Math.round((last30DaysCount / 30) * 100), 100);
  const longestStreak = summaryData?.longest_streak ?? summaryData?.current_streak ?? 0;
  const setupCompleted = parseInt(localStorage.getItem("setupCompletedCount") || "0");
  const setupTotal = parseInt(localStorage.getItem("setupTotalCount") || "5");

  const formatShortDateLabel = (s?: string) => {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const upcomingFromPeople = useMemo(() => {
    try {
      const today = new Date();
      const limit = new Date(today);
      limit.setDate(today.getDate() + 30);
      return people
        .filter((p) => p && typeof p.birthday === "string" && p.birthday)
        .map((p) => {
          const parts = (p.birthday as string).split("-");
          if (parts.length < 3) return null;
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          let d = new Date(today.getFullYear(), month, day);
          if (d < today) d = new Date(today.getFullYear() + 1, month, day);
          return { name: p.name, date: d };
        })
        .filter((x) => x && x.date >= today && x.date <= limit) as {
        name: string;
        date: Date;
      }[];
    } catch {
      return [] as { name: string; date: Date }[];
    }
  }, [people]);

  const hasUpcomingDates =
    (previewData.upcoming_dates && previewData.upcoming_dates.length > 0) ||
    upcomingFromPeople.length > 0;

  return (
    <div className="animate-fade-in space-y-6 w-full" style={{ background: C.pageBg }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: C.charcoal }}>
            Welcome Back, {user?.name || "Guest"}
          </h1>
          <p className="text-sm mt-1" style={{ color: C.stone }}>Let's align your day with your purpose</p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex gap-2 items-center flex-wrap">
          <Link to="/setup">
            <Button variant="outline" className="gap-1.5 h-9 px-3 text-xs" style={{ background: C.sky8, color: C.sky, borderColor: C.sky15 }}>
              <Settings className="w-3.5 h-3.5" />
              Setup
              <Badge className="ml-1 h-5 px-1.5 rounded-sm text-white" style={{ background: C.sky }}>
                {setupCount.completed}/{setupCount.total}
              </Badge>
            </Button>
          </Link>
          <Link to="/daily-journal">
            <Button variant="outline" className="gap-1.5 h-9 px-3 text-xs font-medium" style={{ background: C.coral8, color: C.coral, borderColor: C.coral15 }}>
              <BookOpen className="w-3.5 h-3.5" /> Daily
            </Button>
          </Link>
          <Link to="/weekly-journal">
            <Button variant="outline" className="gap-1.5 h-9 px-3 text-xs" style={{ background: C.coral, color: "#fff", borderColor: C.coral }}>
              <Calendar className="w-3.5 h-3.5" /> Weekly
            </Button>
          </Link>
          <Link to="/calendar">
            <Button variant="outline" className="gap-1.5 h-9 px-3 text-xs" style={{ background: C.sky, color: "#fff", borderColor: C.sky }}>
              <CalendarDays className="w-3.5 h-3.5" /> Cal
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button variant="outline" className="gap-1.5 h-9 px-3 text-xs font-semibold" style={{ background: C.amber8, color: C.charcoal, borderColor: C.amber }}>
              <Trophy className="w-3.5 h-3.5" /> Score: {summaryData?.total_score || 10}
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Daily Focus & Inspiration ────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" style={{ color: C.coral }} />
          <h2 className="text-lg font-semibold" style={{ color: C.charcoal }}>Daily Focus &amp; Inspiration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily Motivator */}
          <Card className="rounded-2xl overflow-hidden flex flex-col shadow-sm border-2 transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ background: C.coral8, borderColor: C.coral15 }}>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg text-white shadow-sm" style={{ background: C.coral }}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[10px] tracking-wider uppercase flex items-center gap-1.5" style={{ color: C.coral }}>
                  DAILY MOTIVATOR <Sparkles className="w-3 h-3" style={{ color: C.amber }} />
                </h3>
              </div>
              <div className="flex-1 relative pl-6 mb-4 mt-2">
                <span className="text-4xl absolute -top-4 left-0 font-serif opacity-50" style={{ color: C.coral }}>"</span>
                <p className="text-sm font-bold leading-relaxed z-10 relative" style={{ color: C.charcoal }}>
                  {previewData.daily_motivator || "The end of education is character."}
                </p>
              </div>
              <div className="rounded-xl p-3 border" style={{ background: C.coral15, borderColor: C.coral25 }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="w-3 h-3" style={{ color: C.coral }} />
                  <h4 className="font-black text-[9px] uppercase tracking-widest" style={{ color: C.coral }}>ACTION</h4>
                </div>
                <p className="text-[11px] font-medium leading-snug" style={{ color: C.charcoal }}>
                  True education is about building strong values and character, not just academics.
                </p>
              </div>
            </div>
          </Card>

          {/* Priorities / Top To-Dos */}
          <Card className="p-5 flex flex-col shadow-sm rounded-2xl min-h-[180px] transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ background: "#F4F7FF", borderColor: "#E5EAFA" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[18px] flex items-center gap-2.5 tracking-tight" style={{ color: C.charcoal }}>
                <ListTodo className="w-5 h-5" style={{ color: "#5034BB" }} strokeWidth={2.5} /> Priorities
              </h3>
              <Badge variant="secondary" className="hover:bg-transparent shadow-none font-semibold text-[12px] px-3 py-1 rounded-full pointer-events-none border-0" style={{ background: "#E8EBFE", color: "#5034BB" }}>
                For: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Badge>
            </div>

            {/* RESTORED DAILY JOURNAL PRIORITIES */}
            {previewData.priorities.length > 0 && (
              <div className="flex flex-col gap-3 mb-4">
                {previewData.priorities.map((todo: { id?: string | number; title?: string }, idx) => (
                  <div key={todo.id || idx} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0" style={{ color: "#5034BB" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <p className="text-[15px] font-medium leading-snug" style={{ color: C.charcoal }}>{todo.title}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* NO PRIORITIES AND NO TODOS MESSAGE */}
            {previewData.priorities.length === 0 && todosData.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center mt-2 mb-4">
                <p className="text-sm mb-1.5 font-medium" style={{ color: C.stone }}>No priorities recorded yet.</p>
                <Link to="/daily-journal" className="text-xs font-bold hover:underline flex items-center gap-1 mt-1" style={{ color: "#5034BB" }}>
                  Go to Daily Journal <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* TOP TO-DOS SECTION */}
            <div className="flex items-center justify-between mb-3 pt-2" style={{ borderTop: previewData.priorities.length > 0 ? "1px solid #D5DDFA" : "none" }}>
              <h4 className="font-bold text-[14px] flex items-center gap-1.5" style={{ color: "#5034BB" }}>
                <ListOrdered className="w-4 h-4" /> Top To-Dos
              </h4>
              <Link to="/todos" className="text-[13px] font-bold flex items-center gap-1 hover:underline" style={{ color: "#5034BB" }}>
                See All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoadingTodos ? (
              <div className="flex-1 flex flex-col items-center justify-center mt-2">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#5034BB" }} />
              </div>
            ) : todosData.length > 0 ? (
              <div className="flex-1 flex flex-col gap-2 mt-1">
                {todosData.slice(0, 3).map((todo: any, idx: number) => {
                  const p = (todo.priority || "Medium").toLowerCase();
                  const priorityColor = p === 'high' ? C.coral : p === 'low' ? C.success : C.amber;
                  return (
                    <div key={todo.id || idx} className="bg-white border rounded-xl p-3 flex items-start gap-3 shadow-sm" style={{ borderColor: "#D5DDFA" }}>
                      <div className="mt-0.5 flex-shrink-0" style={{ color: "#8E9FE6" }}>
                        <CheckCircle className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[14px] font-medium leading-snug" style={{ color: C.charcoal }}>{todo.title || todo.name || "Untitled Task"}</p>
                        <p className="text-[12px] font-bold mt-0.5 capitalize" style={{ color: priorityColor }}>{todo.priority || "Medium"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center mt-2 bg-white rounded-xl border p-4" style={{ borderColor: "#D5DDFA" }}>
                <p className="text-sm font-medium" style={{ color: C.stone }}>No to-dos recorded yet.</p>
              </div>
            )}
          </Card>

          {/* Upcoming Dates / People */}
          {isLoadingPeople ? (
            <Card className="p-4 flex flex-col items-center justify-center min-h-[180px] animate-pulse" style={{ background: C.coral8, borderColor: C.coral15 }}>
              <CalendarIcon className="w-10 h-10 mb-3" style={{ color: C.coral15 }} strokeWidth={1.5} />
            </Card>
          ) : people.length === 0 ? (
            <Card className="p-4 flex flex-col items-center justify-center min-h-[180px] transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ background: C.coral8, borderColor: C.coral15 }}>
              <CalendarIcon className="w-10 h-10 mb-3" style={{ color: C.sand }} strokeWidth={1.5} />
              <p className="text-sm text-center" style={{ color: C.stone }}>No people added yet</p>
            </Card>
          ) : (
            <Card className="p-5 flex flex-col min-h-[180px] rounded-[16px] transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ background: C.dune + "40", borderColor: C.sand }}>
              <div className="flex items-center justify-between mb-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shadow-sm" style={{ background: C.amber }}>
                    <CalendarIcon className="w-[18px] h-[18px] text-white" strokeWidth={2} />
                  </div>
                  <span className="font-bold text-[15px]" style={{ color: C.charcoal }}>Upcoming Dates</span>
                </div>
                <button onClick={() => navigate("/people")} className="text-[13px] font-medium transition-colors" style={{ color: C.stone }}>View All</button>
              </div>
              <div className="flex-1 flex items-center justify-center text-center mt-4">
                <p className="text-[14px]" style={{ color: C.stone }}>No upcoming dates in the next 30 days</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ── Story of the Day ─────────────────────────────────────────────── */}
      <Card className="overflow-hidden flex flex-col mb-6 shadow-sm" style={{ background: C.amber8, borderColor: C.amber }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.amber15}` }}>
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-lg text-white" style={{ background: C.amber }}>
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm" style={{ color: C.charcoal }}>Story of the Day</h3>
                <Sparkles className="w-3.5 h-3.5" style={{ color: C.amber }} />
              </div>
              <p className="text-xs mt-0.5" style={{ color: C.stone }}>
                {previewData.story_of_the_day || "Story # 127: How can she be so calm ? वह इतनी शांत कैसे हो सकती है?"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md transition-colors" style={{ color: C.charcoal }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md transition-colors" style={{ color: C.charcoal }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="relative w-full aspect-video md:aspect-[28/9] bg-black group overflow-hidden bg-cover bg-center cursor-pointer"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80')" }}>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-all">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: C.coral }}>
              <Play className="w-8 h-8 text-white fill-current ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-4 text-white">
            <div className="flex flex-col items-center"><CalendarIcon className="w-5 h-5 mb-1" /><span className="text-[10px] font-bold">Watch later</span></div>
            <div className="flex flex-col items-center"><ArrowRight className="w-5 h-5 mb-1 -rotate-45" /><span className="text-[10px] font-bold">Share</span></div>
          </div>
        </div>
      </Card>

      {/* ── Progress & Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Energy + Calendar */}
        <Card className="p-5 rounded-2xl border-0 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ background: `linear-gradient(135deg, ${C.amber8}, ${C.coral8})` }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: C.amber }}>
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: C.stone }}>Avg Energy</p>
                <p className="text-xl font-extrabold tracking-tight" style={{ color: C.charcoal }}>
                  {summaryData?.energy_average != null ? Number(summaryData.energy_average).toFixed(1) : "-"}
                </p>
              </div>
            </div>
            <div className="h-10 w-px" style={{ background: C.sand }}></div>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: C.violet }}>
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: C.stone }}>Alignment</p>
                <p className="text-xl font-extrabold tracking-tight" style={{ color: C.charcoal }}>
                  {summaryData?.alignment_average != null ? Number(summaryData.alignment_average).toFixed(1) : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border shadow-sm" style={{ borderColor: C.mist }}>
            <div className="flex justify-between items-center mb-4 px-2">
              <ChevronLeft className="w-4 h-4 cursor-pointer hover:scale-110 transition-transform" style={{ color: C.amber }} onClick={handlePrevWeek} />
              <h4 className="font-bold text-sm" style={{ color: C.charcoal }}>{getWeekLabel()}</h4>
              <ChevronRight className="w-4 h-4 cursor-pointer hover:scale-110 transition-transform" style={{ color: C.amber }} onClick={handleNextWeek} />
            </div>
            <div className="flex justify-between gap-1 mb-4">
              {weekData.map((d) => (
                <div key={d.day + d.date} className="flex flex-col items-center justify-center py-2 px-1 w-9 rounded-xl transition-all"
                  style={d.active ? { border: `1.5px solid ${C.amber}`, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } : {}}>
                  <span className="text-[10px] font-bold mb-1" style={{ color: C.stone }}>{d.day}</span>
                  <span className="text-sm font-extrabold" style={{ color: d.active ? C.amber : C.charcoal }}>{d.date}</span>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: d.state === "missed" ? C.coral : d.state === "filled" ? C.success : C.mist }}></div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-5 text-[10px] font-bold mt-2" style={{ color: C.stone }}>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ background: C.success }}></div> Filled</div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ background: C.coral }}></div> Missed</div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ background: C.mist }}></div> Upcoming</div>
            </div>
          </div>
          <div className="flex-1" />{" "}
          {/* Spacer to leave beige area at bottom */}
        </Card>

        {/* Highest Rank */}
        <Card className="p-5 rounded-2xl flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ background: C.amber8, borderColor: C.amber15 }}>
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold flex items-center gap-2" style={{ color: C.amber }}>
              <Trophy className="w-5 h-5" style={{ color: C.amber }} /> Highest Rank
            </h3>
            <Link to="/achievements" className="text-xs font-bold hover:underline" style={{ color: C.amber }}>View All</Link>
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: C.amber15 }}>
              <Lock className="w-6 h-6" style={{ color: C.amber }} strokeWidth={2.5} />
            </div>
            <h4 className="font-bold mb-1.5 text-base" style={{ color: C.charcoal }}>No badges yet</h4>
            <p className="text-xs font-medium" style={{ color: C.stone }}>Start journaling to earn titles!</p>
          </div>
          <div className="flex justify-between items-center mt-10 pt-4" style={{ borderTop: `1px solid ${C.amber15}` }}>
            <span className="text-xs font-bold" style={{ color: C.stone }}>Total Unlocked</span>
            <span className="text-sm font-extrabold" style={{ color: C.charcoal }}>{summaryData?.highest_badge ? "1 / 19" : "0 / 19"}</span>
          </div>
        </Card>

        {/* Journaling Status */}
        <Card className="p-5 flex flex-col justify-between rounded-[20px] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ background: C.forest8, border: `1.5px solid ${C.forest}` }}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold flex items-center gap-2.5 text-[17px]" style={{ color: C.forest }}>
              <BookOpen className="w-5 h-5" style={{ color: C.forest }} strokeWidth={2.5} /> Journaling Status
            </h3>
          </div>

          {/* Daily Track */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[14px] font-bold" style={{ color: C.forest }}>Daily ({dailyDateRangeStr})</span>
              <span className="text-[14px] font-bold" style={{ color: C.charcoal }}>{dailyCompletedCount}/7</span>
            </div>
            <div className="flex justify-between gap-1 sm:gap-1.5 w-full">
              {dailyCompletion.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <div className="w-full aspect-square max-w-[42px] rounded-[8px] sm:rounded-[10px] flex items-center justify-center transition-all"
                    style={{ background: day.completed ? C.forest : "#fff", border: day.completed ? "none" : `1.5px solid ${C.mist}` }}>
                    {day.completed ? (
                      <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : <div className="w-[50%] h-[50%] rounded-full border-[1.5px]" style={{ borderColor: C.mist }}></div>}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold truncate w-full text-center" style={{ color: C.forest }}>{day.dayLabel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Track */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[14px] font-bold" style={{ color: C.forest }}>Weekly ({monthNameStatus} {currentYearStatus})</span>
              <span className="text-[14px] font-bold" style={{ color: C.charcoal }}>{weeklyCompletedCount}/5</span>
            </div>
            <div className="flex justify-between gap-1 sm:gap-1.5 w-full">
              {weeklyBlocks.map((wk, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div className="w-full aspect-square max-w-[48px] rounded-[8px] sm:rounded-[10px] flex items-center justify-center transition-all"
                    style={{ background: wk.completed ? C.forest : "#fff", border: wk.completed ? "none" : `1.5px solid ${C.mist}` }}>
                    {wk.completed ? (
                      <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : <Calendar className="w-[45%] h-[45%]" style={{ color: C.mist }} strokeWidth={2} />}
                  </div>
                  <div className="text-center mt-1 w-full">
                    <div className="text-[9px] sm:text-[10px] font-bold leading-tight mb-0.5 truncate" style={{ color: C.forest }}>{wk.label}</div>
                    <div className="text-[8px] sm:text-[9px] font-medium leading-tight truncate opacity-90" style={{ color: C.forest }}>{wk.datesLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-auto pt-4" style={{ borderTop: `1px solid ${C.forest15}` }}>
            <span className="text-[14px] font-bold" style={{ color: C.forest }}>Keep up the momentum!</span>
            <span className="text-[15px] font-extrabold" style={{ color: C.charcoal }}>{percentComplete}% Complete</span>
          </div>
        </Card>
      </div>

      {/* ── Purpose & Direction ───────────────────────────────────────────── */}
      <div className="mt-8 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-[18px] h-[18px]" style={{ color: C.coral }} strokeWidth={2} />
          <h2 className="text-[15px] font-bold" style={{ color: C.charcoal }}>Purpose &amp; Direction</h2>
        </div>
        <Card className="rounded-[16px] shadow-sm p-4 sm:p-5" style={{ background: C.coral8, border: `1px solid ${C.coral}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-[18px] h-[18px]" style={{ color: C.charcoal }} strokeWidth={2.5} />
              <h3 className="font-bold text-[18px] tracking-tight" style={{ color: C.charcoal }}>My Mission</h3>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-[14px] h-[14px]" style={{ color: C.charcoal }} strokeWidth={2.5} />
              <span className="text-[14px] font-extrabold" style={{ color: C.charcoal }}>
                {summaryData?.alignment_average != null ? Number(summaryData.alignment_average).toFixed(1) : "5.0"}/10
              </span>
              <div className="w-6 sm:w-10 h-[2.5px] rounded-full ml-1" style={{ background: C.charcoal }}></div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-6">
            {previewData.mission && <p className="text-xl font-bold" style={{ color: C.charcoal }}>{previewData.mission}</p>}
            {previewData.vision_images?.length > 0 && (
              <div className="bg-white rounded-[16px] p-5 shadow-sm border" style={{ borderColor: C.coral15 }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.coral8 }}>
                    <Heart className="w-4 h-4" style={{ color: C.coral }} strokeWidth={2.5} />
                  </div>
                  <h4 className="font-bold text-[16px]" style={{ color: C.charcoal }}>Vision Board</h4>
                </div>
                <div className="relative rounded-[8px] overflow-hidden border" style={{ borderColor: C.mist }}>
                  <img src={previewData.vision_images[0]} alt="Vision Board" className="w-full h-auto object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Execution & Tracking ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3 mt-8">
          <Zap className="w-4 h-4" style={{ color: C.coral }} strokeWidth={2.5} />
          <h2 className="text-sm font-bold" style={{ color: C.charcoal }}>Execution &amp; Tracking</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Journaling Consistency */}
          <Card className="p-5 shadow-sm flex flex-col rounded-[20px]" style={{ background: C.amber8, border: `1px solid ${C.amber}` }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white shadow-sm" style={{ background: C.amber }}>
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <h3 className="font-bold text-[16px]" style={{ color: C.charcoal }}>Journaling Consistency</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm border" style={{ borderColor: C.mist }}>
                <div className="flex items-center gap-2 mb-1" style={{ color: C.charcoal }}>
                  <Flame className="w-5 h-5" style={{ color: C.amber }} strokeWidth={2.5} />
                  <span className="text-[22px] font-extrabold leading-none">{summaryData?.current_streak || 0}</span>
                </div>
                <span className="text-[12px] font-medium mt-1" style={{ color: C.stone }}>Current Streak</span>
              </div>
              <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm border" style={{ borderColor: C.mist }}>
                <div className="flex items-center gap-2 mb-1" style={{ color: C.charcoal }}>
                  <Calendar className="w-5 h-5" style={{ color: C.sky }} strokeWidth={2.5} />
                  <span className="text-[22px] font-extrabold leading-none">{last30DaysCount}</span>
                </div>
                <span className="text-[12px] font-medium mt-1" style={{ color: C.stone }}>Last 30 Days</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border mb-4" style={{ borderColor: C.mist }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[13px] font-bold" style={{ color: C.charcoal }}>Consistency Score</span>
                <span className="font-extrabold text-[14px]" style={{ color: C.charcoal }}>{consistencyScore}%</span>
              </div>
              <div className="w-full rounded-full h-2.5 mb-3" style={{ background: C.sand30 }}>
                <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${consistencyScore}%`, background: C.amber }}></div>
              </div>
              <div className="flex justify-center items-center gap-1.5 text-[11px] font-semibold" style={{ color: C.amber }}>
                <span>🏆</span> Longest streak: {longestStreak} days
              </div>
            </div>

            {/* Life Balance Radar */}
            <div className="bg-white rounded-xl p-5 shadow-sm border" style={{ borderColor: C.mist }}>
              <h4 className="text-[13px] font-bold mb-6 text-center" style={{ color: C.charcoal }}>Life Balance (Last 7 Days)</h4>
              <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-none" style={{ stroke: C.mist }} strokeWidth="0.5">
                  <polygon points="50,10 90,40 75,90 25,90 10,40" strokeDasharray="2,2" />
                  <polygon points="50,30 70,45 62,70 38,70 30,45" strokeDasharray="1,1" />
                  <line x1="50" y1="50" x2="50" y2="10" /><line x1="50" y1="50" x2="90" y2="40" />
                  <line x1="50" y1="50" x2="75" y2="90" /><line x1="50" y1="50" x2="25" y2="90" />
                  <line x1="50" y1="50" x2="10" y2="40" />
                  {summaryData?.life_balance && (
                    <polygon
                      points={`50,${50 - (summaryData.life_balance.career || 0) * 4} ${50 + (summaryData.life_balance.health || 0) * 4},${50 - (summaryData.life_balance.health || 0) * 1} ${50 + (summaryData.life_balance.relationships || 0) * 2.5},${50 + (summaryData.life_balance.relationships || 0) * 4} ${50 - (summaryData.life_balance.growth || 0) * 2.5},${50 + (summaryData.life_balance.growth || 0) * 4} ${50 - (summaryData.life_balance.finance || 0) * 4},${50 - (summaryData.life_balance.finance || 0) * 1}`}
                      fill={C.forest8} stroke={C.forest} strokeWidth="1.5" className="transition-all duration-1000"
                    />
                  )}
                </svg>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold" style={{ color: C.stone }}>Career</span>
                <span className="absolute top-[35%] -right-4 text-[9px] font-bold" style={{ color: C.stone }}>Health</span>
                <span className="absolute -bottom-3 -right-2 text-[9px] font-bold" style={{ color: C.stone }}>Relationships</span>
                <span className="absolute -bottom-3 -left-4 text-[9px] font-bold" style={{ color: C.stone }}>Personal Growth</span>
                <span className="absolute top-[35%] -left-3 text-[9px] font-bold" style={{ color: C.stone }}>Finance</span>
              </div>
            </div>
          </Card>

          {/* Strategic Focus */}
          <Card className="p-6 shadow-sm rounded-[20px] flex flex-col min-h-[400px]" style={{ background: C.coral8, border: `1px solid ${C.coral15}` }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center text-white shadow-sm" style={{ background: C.coral }}>
                  <Target className="w-[22px] h-[22px]" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-[17px] tracking-tight" style={{ color: C.charcoal }}>This Week's Strategic Focus</h3>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Target className="w-[100px] h-[100px] stroke-[0.8] mb-6" style={{ color: C.coral15 }} />
              <p className="text-[14px] font-medium max-w-[280px] leading-relaxed" style={{ color: C.stone }}>
                Complete your weekly reflection to see your focus areas here
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Habit Tracking ───────────────────────────────────────────────── */}
      <div className="mt-8 mb-8">
        <Card className="rounded-[20px] overflow-hidden shadow-sm" style={{ background: C.forest8, border: `1.5px solid ${C.forest}` }}>
          <div className="p-4 md:p-5 flex items-center justify-between bg-white/50" style={{ borderBottom: `1px solid ${C.forest15}` }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white shadow-sm" style={{ background: C.forest }}>
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <h3 className="font-bold text-[16px]" style={{ color: C.charcoal }}>Habit Tracking</h3>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-[11px] font-bold rounded-full px-4 bg-white" style={{ color: C.charcoal, borderColor: C.sand }} asChild>
              <Link to="/goals-habits">View All</Link>
            </Button>
          </div>
          <div className="p-5 bg-white">
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6" style={{ borderBottom: `1px solid ${C.mist}` }}>
              <div>
                <p className="text-[11px] font-bold mb-1 tracking-wide" style={{ color: C.stone }}>Active Habits</p>
                <p className="text-[26px] font-extrabold leading-none" style={{ color: C.forest }}>{activeHabitsCount}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1 tracking-wide" style={{ color: C.stone }}>Avg. Completion</p>
                <p className="text-[26px] font-extrabold leading-none" style={{ color: C.forest }}>{avgHabitCompletion}%</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[{ label: "Daily Habits", list: dailyHabits }, { label: "Weekly Habits", list: weeklyHabits }].map(({ label, list }) => (
                <div key={label}>
                  <h4 className="text-[13px] font-bold mb-4" style={{ color: C.charcoal }}>{label}</h4>
                  {list.length > 0 ? (
                    <div className="space-y-5">
                      {list.map((habit, idx) => (
                        <div key={idx} className="flex flex-col gap-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[13px] font-extrabold" style={{ color: C.charcoal }}>{habit.name || habit.title}</span>
                            <Badge variant="outline" className="text-[10px] px-2.5 py-0 h-[18px] rounded-full font-bold bg-white" style={{ color: C.stone, borderColor: C.sand }}>
                              {habit.category || habit.habit_category || "Other"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: C.mist }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${habit.completion_percentage || habit.completion_rate || 0}%`, background: C.charcoal }}></div>
                            </div>
                            <span className="text-[11px] font-bold min-w-[28px] text-right" style={{ color: C.forest }}>
                              {habit.completion_percentage || habit.completion_rate || 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-[12px] italic" style={{ color: C.stone }}>No {label.toLowerCase()}</p>}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Review & Growth ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5" style={{ color: C.coral }} strokeWidth={2} />
          <h2 className="text-[15px] font-bold" style={{ color: C.charcoal }}>Review &amp; Growth</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Recent Journal Entries */}
          <Card className="p-6 shadow-sm flex flex-col min-h-[220px] rounded-[20px] transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ background: C.amber8, border: `2px solid ${C.amber}` }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[16px]" style={{ color: C.charcoal }}>Recent Journal Entries</h3>
              <Link to="/daily-journal">
                <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-full px-4 bg-white hover:bg-slate-50" style={{ color: C.charcoal, borderColor: C.sand }}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
                </Button>
              </Link>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {recentJournals.length > 0 ? recentJournals.slice(0, 3).map((journal) => {
                const d = new Date(journal.start_date || journal.created_at);
                const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                const date = d.getDate();
                const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
                const year = d.getFullYear();
                const energy = journal.energy_score ?? 5;
                const alignment = journal.alignment_score ?? 5;
                const note = journal.data?.description || journal.description || journal.gratitude_note || journal.affirmation;
                return (
                  <div key={journal.id} className="bg-white rounded-[16px] p-4 shadow-sm border flex flex-col gap-3" style={{ borderColor: C.mist }}>
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl py-2 px-3 flex flex-col items-center justify-center min-w-[54px]" style={{ background: C.amber15 }}>
                        <span className="text-[10px] font-bold" style={{ color: C.amber }}>{month}</span>
                        <span className="text-lg font-extrabold leading-none mt-0.5" style={{ color: C.charcoal }}>{date}</span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h4 className="font-bold text-[15px] mb-2" style={{ color: C.charcoal }}>{weekday}, {year}</h4>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="hover:bg-transparent border-0 px-2 py-0.5 text-[11px] gap-1 font-bold" style={{ background: C.amber15, color: C.amber }}>
                            <Zap className="w-3 h-3 fill-current" /> {energy}/10
                          </Badge>
                          <Badge variant="secondary" className="hover:bg-transparent border-0 px-2 py-0.5 text-[11px] gap-1 font-bold" style={{ background: C.forest8, color: C.forest }}>
                            <Target className="w-3 h-3" /> {alignment}/10
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="h-px w-full" style={{ background: C.mist }}></div>
                    <div className="flex items-center gap-2.5">
                      {note ? (
                        <>
                          <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0" style={{ background: C.forest8, borderColor: C.forest15 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.forest} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                          <span className="text-[13px] font-medium truncate" style={{ color: C.stone }}>{note}</span>
                        </>
                      ) : <span className="text-[13px] italic" style={{ color: C.stone }}>No detailed notes recorded.</span>}
                    </div>
                  </div>
                );
              }) : (
                <p className="text-[13px] font-medium text-center py-6 bg-white rounded-xl border" style={{ color: C.stone, borderColor: C.mist }}>
                  No entries yet. Start journaling today!
                </p>
              )}
            </div>
          </Card>

          {/* Personalized Insights */}
          <Card className="p-6 shadow-sm flex flex-col min-h-[220px] rounded-[20px] transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ background: C.violet8, border: `1px solid ${C.violet15}` }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center text-white shadow-sm" style={{ background: C.violet }}>
                <Lightbulb className="w-[20px] h-[20px] fill-current" />
              </div>
              <h3 className="font-bold text-[17px]" style={{ color: C.charcoal }}>Personalized Insights</h3>
            </div>
            {insightsData.personalized_insights.length > 0 ? (
              <div className="flex-1 flex flex-col gap-3">
                {insightsData.personalized_insights.slice(0, 3).map((insight, idx) => {
                  const insightText = insight.insight || insight.text || JSON.stringify(insight);
                  const isAlert = insightText.toLowerCase().includes("hasn't gotten much attention") || insightText.toLowerCase().includes("consider dedicating");
                  return (
                    <div key={insight.id ?? idx} className="text-[13px] font-medium bg-white rounded-[12px] px-4 py-3.5 border shadow-sm flex items-start gap-3" style={{ borderColor: C.violet15, color: C.stone }}>
                      {isAlert ? <AlertCircle className="w-4 h-4 shrink-0 mt-[2px]" style={{ color: C.violet }} strokeWidth={2.5} /> : <TrendingUp className="w-4 h-4 shrink-0 mt-[2px]" style={{ color: C.violet }} strokeWidth={2.5} />}
                      <span className="leading-snug">{insightText}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-[12px] p-4 border shadow-sm flex items-center gap-3 mt-auto" style={{ borderColor: C.violet15 }}>
                <TrendingUp className="w-5 h-5 shrink-0" style={{ color: C.violet }} strokeWidth={2.5} />
                <p className="text-[13px] font-medium" style={{ color: C.stone }}>Start journaling to discover patterns and insights about your journey!</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Bucket List & Leaderboard ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

        {/* Bucket List */}
        <Card className="p-6 shadow-sm flex flex-col min-h-[350px] rounded-[20px] transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ background: C.coral8, border: `1px solid ${C.coral15}` }}>
          <div className="flex justify-between items-start mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${C.coral}, #e87c5a)` }}>
                <ListOrdered className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-[15px]" style={{ color: C.charcoal }}>Bucket List Progress</h3>
                <p className="text-xs font-medium" style={{ color: C.stone }}>{previewData.bucket_preview.length} dreams</p>
              </div>
            </div>
            <Link to="/bucket-list" className="font-bold text-xs hover:underline mt-1 mr-1" style={{ color: C.coral }}>View All</Link>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {previewData.bucket_preview.length > 0 ? previewData.bucket_preview.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-white rounded-[16px] p-4 shadow-sm border flex justify-between items-center transition-all" style={{ borderColor: C.cream }}>
                <span className="font-extrabold text-sm tracking-tight" style={{ color: C.charcoal }}>{item.title}</span>
                <div className="flex gap-2 flex-wrap justify-end">
                  {item.status && <Badge className="text-white text-[10px] px-2.5 py-0.5 rounded-full capitalize font-bold shadow-sm border-0" style={{ background: C.coral }}>{item.status.replace(/_/g, " ")}</Badge>}
                  {item.category && <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 rounded-full capitalize font-bold" style={{ color: C.coral, borderColor: C.coral15, background: C.coral8 }}>{item.category}</Badge>}
                </div>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[13px] font-medium" style={{ color: C.stone }}>No bucket list items yet. Let's dream!</p>
              </div>
            )}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-6 bg-white border shadow-sm rounded-[20px] transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col min-h-[350px]" style={{ borderColor: C.mist }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center text-white shadow-sm" style={{ background: C.violet }}>
                <Trophy className="w-[20px] h-[20px] fill-current" />
              </div>
              <h3 className="font-bold text-[17px]" style={{ color: C.charcoal }}>Leaderboard</h3>
            </div>
            <Button variant="outline" size="sm" className="h-[30px] text-[11px] font-bold px-4 rounded-full shadow-none bg-white hover:bg-slate-50" style={{ color: C.charcoal, borderColor: C.sand }} asChild>
              <Link to="/leaderboard">View All</Link>
            </Button>
          </div>
          <div className="rounded-[16px] p-4 flex flex-col justify-center border mb-6" style={{ background: C.violet8, borderColor: C.violet15 }}>
            <div className="flex items-center gap-4">
              <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-white font-extrabold text-[13px] shadow-sm tracking-tight" style={{ background: C.violet }}>
                #{leaderboardData.currentUser?.rank || "232"}
              </div>
              <div>
                <p className="font-bold text-[15px] leading-tight mb-0.5 tracking-tight" style={{ color: C.violet }}>Your Rank</p>
                <p className="text-[13px] font-semibold leading-tight" style={{ color: C.violet }}>
                  {leaderboardData.currentUser?.points ?? summaryData?.total_score ?? 10} pts
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col px-2 gap-1">
            {leaderboardData.top.length > 0 ? leaderboardData.top.map((person, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 last:border-b-0" style={{ borderBottom: `1px solid ${C.mist}` }}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 shadow-sm"
                    style={idx === 0 ? { background: "#FEF9C3", border: "1px solid #FDE047", color: "#A16207" } : idx === 1 ? { background: C.mist, border: `1px solid ${C.sand}`, color: C.charcoal } : idx === 2 ? { background: C.amber15, border: `1px solid ${C.amber}`, color: C.charcoal } : { background: C.coral8, border: `1px solid ${C.coral15}`, color: C.stone }}>
                    {idx === 0 ? "👑" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                  </div>
                  <span className="font-bold text-[14px] truncate tracking-tight" style={{ color: C.charcoal }}>{person.name || person.user_name || "Unknown"}</span>
                </div>
                <span className="font-extrabold text-[14px] ml-4 flex-shrink-0" style={{ color: C.violet }}>{person.points ?? person.score ?? 0}</span>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[13px] font-medium pb-2" style={{ color: C.stone }}>Loading leaderboard data...</p>
              </div>
            )}
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Dashboard;