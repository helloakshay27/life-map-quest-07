import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Heart, Zap, Sparkles, Clock, MapPin, Target, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ─── API (mirrors Todos.tsx exactly) ─────────────────────────────────────────
const API_BASE_URL = "https://life-api.lockated.com";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("auth_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers ?? {}) },
  });
  return response;
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Goal {
  id: string;
  title: string;
  status: "planning" | "started" | "progress" | "completed";
  area?: string;
  progress?: number;
  description?: string;
  start_date?: string;
  target_date?: string;
}
interface Belief      { id: string; belief: string; origin?: string; evidence?: string; alternative: string; }
interface Pattern     { id: string; name: string; trigger?: string; consequence?: string; alternative: string; }
interface Affirmation { id: string; text: string; category?: string; linkedBelief?: string; }
interface Habit       { id: string; name: string; description?: string; frequency: "daily" | "weekly" | "custom"; category?: string; time?: string; place?: string; startDate?: string; }
interface DragState   { goalId: string; startX: number; startY: number; currentX: number; currentY: number; cardWidth: number; cardHeight: number; isDragging: boolean; }

// ─── Component ────────────────────────────────────────────────────────────────
const GoalsHabits = () => {
  const [selectedArea, setSelectedArea] = useState("all-areas");
  const [viewMode,     setViewMode]     = useState<"kanban" | "grid">("kanban");
  const [activeTab,    setActiveTab]    = useState("goals");

  const [goals,        setGoals]        = useState<Goal[]>([]);
  const [beliefs,      setBeliefs]      = useState<Belief[]>([]);
  const [patterns,     setPatterns]     = useState<Pattern[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [habits,       setHabits]       = useState<Habit[]>([]);

  const [isGoalDialogOpen,        setIsGoalDialogOpen]        = useState(false);
  const [isBeliefDialogOpen,      setIsBeliefDialogOpen]      = useState(false);
  const [isPatternDialogOpen,     setIsPatternDialogOpen]     = useState(false);
  const [isAffirmationDialogOpen, setIsAffirmationDialogOpen] = useState(false);
  const [isHabitDialogOpen,       setIsHabitDialogOpen]       = useState(false);

  // Goal form
  const [goalName,        setGoalName]        = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalCategory,    setGoalCategory]    = useState("");
  const [goalStatus,      setGoalStatus]      = useState<Goal["status"]>("planning");
  const [goalStartDate,   setGoalStartDate]   = useState("");
  const [goalTargetDate,  setGoalTargetDate]  = useState("");
  const [goalProgress,    setGoalProgress]    = useState(0);

  // Belief form
  const [beliefText,        setBeliefText]        = useState("");
  const [beliefOrigin,      setBeliefOrigin]      = useState("");
  const [beliefEvidence,    setBeliefEvidence]    = useState("");
  const [beliefAlternative, setBeliefAlternative] = useState("");

  // Pattern form
  const [patternName,        setPatternName]        = useState("");
  const [patternTrigger,     setPatternTrigger]     = useState("");
  const [patternConsequence, setPatternConsequence] = useState("");
  const [patternAlternative, setPatternAlternative] = useState("");

  // Affirmation form
  const [affirmationText,     setAffirmationText]     = useState("");
  const [affirmationCategory, setAffirmationCategory] = useState("");
  const [affirmationBelief,   setAffirmationBelief]   = useState("");

  // Habit form
  const [habitName,        setHabitName]        = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [habitFrequency,   setHabitFrequency]   = useState<Habit["frequency"]>("daily");
  const [habitCategory,    setHabitCategory]    = useState("");
  const [habitTime,        setHabitTime]        = useState("");
  const [habitPlace,       setHabitPlace]       = useState("");
  const [habitStartDate,   setHabitStartDate]   = useState("");

  // Drag
  const [dragState,     setDragState]     = useState<DragState | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ─── LOAD GOALS (mirrors Todos pattern exactly) ───────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_goals");
        if (saved) { setGoals(JSON.parse(saved)); return; }
        try {
          const res = await fetchWithAuth("/goals");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : data.goals ?? data.data ?? [];
            setGoals(list);
            localStorage.setItem("user_goals", JSON.stringify(list));
          }
        } catch { console.log("Goals API unavailable, using local storage"); }
      } catch { console.log("Using local storage for goals"); }
    };
    load();
  }, []);

  // ─── LOAD BELIEFS ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_beliefs");
        if (saved) { setBeliefs(JSON.parse(saved)); return; }
        try {
          const res = await fetchWithAuth("/beliefs");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : data.beliefs ?? data.data ?? [];
            setBeliefs(list);
            localStorage.setItem("user_beliefs", JSON.stringify(list));
          }
        } catch { console.log("Beliefs API unavailable, using local storage"); }
      } catch { console.log("Using local storage for beliefs"); }
    };
    load();
  }, []);

  // ─── LOAD PATTERNS ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_patterns");
        if (saved) { setPatterns(JSON.parse(saved)); return; }
        try {
          const res = await fetchWithAuth("/patterns");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : data.patterns ?? data.data ?? [];
            setPatterns(list);
            localStorage.setItem("user_patterns", JSON.stringify(list));
          }
        } catch { console.log("Patterns API unavailable, using local storage"); }
      } catch { console.log("Using local storage for patterns"); }
    };
    load();
  }, []);

  // ─── LOAD AFFIRMATIONS ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_affirmations");
        if (saved) { setAffirmations(JSON.parse(saved)); return; }
        try {
          const res = await fetchWithAuth("/affirmations");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : data.affirmations ?? data.data ?? [];
            setAffirmations(list);
            localStorage.setItem("user_affirmations", JSON.stringify(list));
          }
        } catch { console.log("Affirmations API unavailable, using local storage"); }
      } catch { console.log("Using local storage for affirmations"); }
    };
    load();
  }, []);

  // ─── LOAD HABITS ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_habits");
        if (saved) { setHabits(JSON.parse(saved)); return; }
        try {
          const res = await fetchWithAuth("/habits");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : data.habits ?? data.data ?? [];
            setHabits(list);
            localStorage.setItem("user_habits", JSON.stringify(list));
          }
        } catch { console.log("Habits API unavailable, using local storage"); }
      } catch { console.log("Using local storage for habits"); }
    };
    load();
  }, []);

  const save = <T,>(key: string, items: T[]) =>
    localStorage.setItem(key, JSON.stringify(items));

  // ─── GOALS CRUD ───────────────────────────────────────────────────────────
  const handleCreateGoal = async () => {
    if (!goalName.trim()) return;
    const payload = { title: goalName, description: goalDescription, status: goalStatus, area: goalCategory, progress: goalProgress, start_date: goalStartDate, target_date: goalTargetDate };
    const newGoal: Goal = { id: crypto.randomUUID(), ...payload };
    try {
      try {
        const res = await fetchWithAuth("/goals", { method: "POST", body: JSON.stringify(payload) });
        if (res.ok) {
          const d = await res.json();
          newGoal.id = d.id || d._id || d.data?.id || newGoal.id;
        } else {
          console.log("Goals API error:", res.status, await res.text());
        }
      } catch (err) { console.log("Goals API unavailable, saving locally", err); }
      setGoals(prev => { const u = [...prev, newGoal]; save("user_goals", u); return u; });
    } catch (e) { console.error("Failed to create goal:", e); }
    setGoalName(""); setGoalDescription(""); setGoalCategory(""); setGoalStatus("planning");
    setGoalStartDate(""); setGoalTargetDate(""); setGoalProgress(0); setIsGoalDialogOpen(false);
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      try {
        const res = await fetchWithAuth(`/goals/${id}`, { method: "DELETE" });
        if (!res.ok) {
          console.log("Goals delete API error:", res.status, await res.text());
        }
      } catch (err) { console.log("API unavailable, deleting locally", err); }
      setGoals(prev => { const u = prev.filter(g => g.id !== id); save("user_goals", u); return u; });
    } catch (e) { console.error("Failed to delete goal:", e); }
  };

  const handleUpdateGoalStatus = useCallback(async (id: string, newStatus: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    // Optimistic update first
    setGoals(prev => { 
      const u = prev.map(g => g.id === id ? { ...g, status: newStatus as Goal["status"] } : g); 
      save("user_goals", u); 
      return u; 
    });
    
    // Then try API update with proper payload format
    try {
      // Map frontend status to backend status
      const statusMap: Record<string, string> = {
        "planning": "planning",
        "started": "started",
        "progress": "in_progress",
        "completed": "completed"
      };
      
      const apiStatus = statusMap[newStatus] || newStatus;
      
      const payload = { 
        status: apiStatus
      };
      
      const res = await fetchWithAuth(`/goals/${id}`, { 
        method: "PUT", 
        body: JSON.stringify(payload) 
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.log("Goals update API error:", res.status, errorText);
      }
    } catch (err) { 
      console.log("API unavailable, status updated locally", err); 
    }
  }, [goals]);


  // ─── BELIEFS CRUD ─────────────────────────────────────────────────────────
  const handleCreateBelief = async () => {
    if (!beliefText.trim() || !beliefAlternative.trim()) return;
    const payload = { belief: beliefText, origin: beliefOrigin, evidence: beliefEvidence, alternative: beliefAlternative };
    const newBelief: Belief = { id: crypto.randomUUID(), ...payload };
    try {
      try {
        const res = await fetchWithAuth("/beliefs", { method: "POST", body: JSON.stringify(payload) });
        if (res.ok) {
          const d = await res.json();
          newBelief.id = d.id || d._id || d.data?.id || newBelief.id;
        } else {
          console.log("Beliefs API error:", res.status, await res.text());
        }
      } catch (err) { console.log("Beliefs API unavailable, saving locally", err); }
      setBeliefs(prev => { const u = [...prev, newBelief]; save("user_beliefs", u); return u; });
    } catch (e) { console.error("Failed to create belief:", e); }
    setBeliefText(""); setBeliefOrigin(""); setBeliefEvidence(""); setBeliefAlternative(""); setIsBeliefDialogOpen(false);
  };

  const handleDeleteBelief = async (id: string) => {
    try {
      try {
        const res = await fetchWithAuth(`/beliefs/${id}`, { method: "DELETE" });
        if (!res.ok) {
          console.log("Beliefs delete API error:", res.status, await res.text());
        }
      } catch (err) { console.log("API unavailable, deleting locally", err); }
      setBeliefs(prev => { const u = prev.filter(b => b.id !== id); save("user_beliefs", u); return u; });
    } catch (e) { console.error("Failed to delete belief:", e); }
  };

  // ─── PATTERNS CRUD ────────────────────────────────────────────────────────
  const handleCreatePattern = async () => {
    if (!patternName.trim() || !patternAlternative.trim()) return;
    const payload = { name: patternName, trigger: patternTrigger, consequence: patternConsequence, alternative: patternAlternative };
    const newPattern: Pattern = { id: crypto.randomUUID(), ...payload };
    try {
      try {
        const res = await fetchWithAuth("/patterns", { method: "POST", body: JSON.stringify(payload) });
        if (res.ok) {
          const d = await res.json();
          newPattern.id = d.id || d._id || d.data?.id || newPattern.id;
        } else {
          console.log("Patterns API error:", res.status, await res.text());
        }
      } catch (err) { console.log("Patterns API unavailable, saving locally", err); }
      setPatterns(prev => { const u = [...prev, newPattern]; save("user_patterns", u); return u; });
    } catch (e) { console.error("Failed to create pattern:", e); }
    setPatternName(""); setPatternTrigger(""); setPatternConsequence(""); setPatternAlternative(""); setIsPatternDialogOpen(false);
  };

  const handleDeletePattern = async (id: string) => {
    try {
      try {
        const res = await fetchWithAuth(`/patterns/${id}`, { method: "DELETE" });
        if (!res.ok) {
          console.log("Patterns delete API error:", res.status, await res.text());
        }
      } catch (err) { console.log("API unavailable, deleting locally", err); }
      setPatterns(prev => { const u = prev.filter(p => p.id !== id); save("user_patterns", u); return u; });
    } catch (e) { console.error("Failed to delete pattern:", e); }
  };

  // ─── AFFIRMATIONS CRUD ────────────────────────────────────────────────────
  const handleCreateAffirmation = async () => {
    if (!affirmationText.trim()) return;
    const payload = { text: affirmationText, category: affirmationCategory, linkedBelief: affirmationBelief };
    const newAffirmation: Affirmation = { id: crypto.randomUUID(), ...payload };
    try {
      try {
        const res = await fetchWithAuth("/affirmations", { method: "POST", body: JSON.stringify(payload) });
        if (res.ok) {
          const d = await res.json();
          newAffirmation.id = d.id || d._id || d.data?.id || newAffirmation.id;
        } else {
          console.log("Affirmations API error:", res.status, await res.text());
        }
      } catch (err) { console.log("Affirmations API unavailable, saving locally", err); }
      setAffirmations(prev => { const u = [...prev, newAffirmation]; save("user_affirmations", u); return u; });
    } catch (e) { console.error("Failed to create affirmation:", e); }
    setAffirmationText(""); setAffirmationCategory(""); setAffirmationBelief(""); setIsAffirmationDialogOpen(false);
  };

  const handleDeleteAffirmation = async (id: string) => {
    try {
      try {
        const res = await fetchWithAuth(`/affirmations/${id}`, { method: "DELETE" });
        if (!res.ok) {
          console.log("Affirmations delete API error:", res.status, await res.text());
        }
      } catch (err) { console.log("API unavailable, deleting locally", err); }
      setAffirmations(prev => { const u = prev.filter(a => a.id !== id); save("user_affirmations", u); return u; });
    } catch (e) { console.error("Failed to delete affirmation:", e); }
  };

  // ─── HABITS CRUD ──────────────────────────────────────────────────────────
  const handleCreateHabit = async () => {
    if (!habitName.trim()) return;
    const payload = { name: habitName, frequency: habitFrequency || "daily", description: habitDescription, category: habitCategory, time: habitTime, place: habitPlace, start_date: habitStartDate };
    const newHabit: Habit = { id: crypto.randomUUID(), name: habitName, frequency: habitFrequency as "daily" | "weekly" | "custom", description: habitDescription || undefined, category: habitCategory || undefined, time: habitTime || undefined, place: habitPlace || undefined, startDate: habitStartDate || undefined };
    try {
      try {
        const res = await fetchWithAuth("/habits", { method: "POST", body: JSON.stringify(payload) });
        if (res.ok) {
          const d = await res.json();
          newHabit.id = d.id || d._id || d.data?.id || newHabit.id;
          console.log("Habit created:", d);
        } else {
          const errorText = await res.text();
          console.error("Habits API error:", res.status, res.statusText, errorText);
        }
      } catch (err) { console.error("Habits API fetch error:", err); }
      setHabits(prev => { const u = [...prev, newHabit]; save("user_habits", u); return u; });
    } catch (e) { console.error("Failed to create habit:", e); }
    setHabitName(""); setHabitDescription(""); setHabitFrequency("daily"); setHabitCategory("");
    setHabitTime(""); setHabitPlace(""); setHabitStartDate(""); setIsHabitDialogOpen(false);
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      try {
        const res = await fetchWithAuth(`/habits/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const errorText = await res.text();
          console.log("Habits delete API error:", res.status, errorText);
        }
      } catch (err) { console.log("API unavailable, deleting locally", err); }
      setHabits(prev => { const u = prev.filter(h => h.id !== id); save("user_habits", u); return u; });
    } catch (e) { console.error("Failed to delete habit:", e); }
  };

  // ─── Pointer Drag & Drop ──────────────────────────────────────────────────
  const getHoveredColumn = useCallback((x: number, y: number): string | null => {
    for (const [key, el] of Object.entries(columnRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return key;
    }
    return null;
  }, []);

  const handlePointerDown = (e: React.PointerEvent, goalId: string) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragState({ goalId, startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY, cardWidth: r.width, cardHeight: r.height, isDragging: false });
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;
    const dist = Math.sqrt((e.clientX - dragState.startX) ** 2 + (e.clientY - dragState.startY) ** 2);
    if (dist > 6 || dragState.isDragging) {
      setDragState(p => p ? { ...p, currentX: e.clientX, currentY: e.clientY, isDragging: true } : null);
      setHoveredStatus(getHoveredColumn(e.clientX, e.clientY));
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }
  }, [dragState, getHoveredColumn]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;
    if (dragState.isDragging) {
      const target = getHoveredColumn(e.clientX, e.clientY);
      const goal   = goals.find(g => g.id === dragState.goalId);
      if (target && goal && goal.status !== target) handleUpdateGoalStatus(dragState.goalId, target);
    }
    setDragState(null); setHoveredStatus(null);
    document.body.style.cursor = ""; document.body.style.userSelect = "";
  }, [dragState, goals, getHoveredColumn, handleUpdateGoalStatus]);

  const handlePointerCancel = useCallback(() => {
    setDragState(null); setHoveredStatus(null);
    document.body.style.cursor = ""; document.body.style.userSelect = "";
  }, []);

  const ghostStyle = dragState?.isDragging ? {
    position: "fixed" as const, left: dragState.currentX - dragState.cardWidth / 2,
    top: dragState.currentY - dragState.cardHeight / 2, width: dragState.cardWidth,
    pointerEvents: "none" as const, zIndex: 9999,
    transform: "rotate(2deg) scale(1.04)", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", transition: "none",
  } : undefined;

  // ─── Config ────────────────────────────────────────────────────────────────
  const goalStatuses = [
    { key: "planning",  label: "Planning",  icon: "🎯", bg: "bg-blue-50",   border: "border-blue-200",   hoverBg: "bg-blue-100",   hoverBorder: "border-blue-500"   },
    { key: "started",   label: "Started",   icon: "🚀", bg: "bg-purple-50", border: "border-purple-200", hoverBg: "bg-purple-100", hoverBorder: "border-purple-500" },
    { key: "progress",  label: "Progress",  icon: "📈", bg: "bg-orange-50", border: "border-orange-200", hoverBg: "bg-orange-100", hoverBorder: "border-orange-500" },
    { key: "completed", label: "Completed", icon: "✅", bg: "bg-teal-50",   border: "border-teal-200",   hoverBg: "bg-teal-100",   hoverBorder: "border-teal-500"   },
  ];

  const getGoalsByStatus = (s: Goal["status"]) =>
    goals.filter(g => g.status === s && (selectedArea === "all-areas" || g.area === selectedArea));

  const areaLabels: Record<string, string> = {
    "all-areas": "Create Your First Goal", "health": "Create Your Health & Fitness Goal",
    "career": "Create Your Career Goal", "personal": "Create Your Personal Growth Goal",
    "relationships": "Create Your Relationships Goal", "financial": "Create Your Financial Goal",
  };

  const footerConfig = {
    goals:        { onClick: () => setIsGoalDialogOpen(true),        label: areaLabels[selectedArea] || "Create Your First Goal", className: "bg-teal-500 hover:bg-teal-600 text-white",   icon: <Target   className="h-4 w-4 mr-2 shrink-0" />, emptyText: "No goals yet. Create your first goal!",         emptyIcon: <Target   className="h-10 w-10 text-gray-300" /> },
    beliefs:      { onClick: () => setIsBeliefDialogOpen(true),      label: "Identify Your First Belief",   className: "bg-pink-500 hover:bg-pink-600 text-white",    icon: <Heart    className="h-4 w-4 mr-2 shrink-0" />, emptyText: "No limiting beliefs recorded yet.",              emptyIcon: <Heart    className="h-10 w-10 text-gray-300" /> },
    affirmations: { onClick: () => setIsAffirmationDialogOpen(true), label: "Add Your First Affirmation",   className: "bg-purple-500 hover:bg-purple-600 text-white", icon: <Sparkles className="h-4 w-4 mr-2 shrink-0" />, emptyText: "No affirmations yet.",                          emptyIcon: <Sparkles className="h-10 w-10 text-gray-300" /> },
    habits:       { onClick: () => setIsHabitDialogOpen(true),       label: "Create Your First Habit",      className: "bg-teal-500 hover:bg-teal-600 text-white",   icon: <Zap      className="h-4 w-4 mr-2 shrink-0" />, emptyText: "No habits yet. Start building better routines!", emptyIcon: <Zap      className="h-10 w-10 text-gray-300" /> },
  };

  const currentFooter = footerConfig[activeTab as keyof typeof footerConfig];
  const draggingGoal   = dragState ? goals.find(g => g.id === dragState.goalId) : null;

  const DelBtn = ({ onClick }: { onClick: () => void }) => (
    <button onPointerDown={e => e.stopPropagation()} onClick={onClick}
      className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>
    </button>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 relative min-h-screen pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      <div>
        <h1 className="text-2xl sm:text-3xl text-foreground">Goals & Habits</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Transform beliefs and achieve your aspirations</p>
      </div>

      <Card className="border-l-4 border-blue-400 bg-blue-50 p-3 sm:p-4">
        <p className="text-sm text-foreground"><strong>Setting SMART Goals:</strong> Create Specific, Measurable, Achievable, Relevant, and Time-bound goals. Break big goals into smaller milestones.</p>
      </Card>

      <Tabs defaultValue="goals" className="space-y-4" onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-[280px] grid-cols-4">
            <TabsTrigger value="goals"        className="text-xs sm:text-sm">Goals</TabsTrigger>
            <TabsTrigger value="beliefs"      className="text-xs sm:text-sm">Beliefs</TabsTrigger>
            <TabsTrigger value="affirmations" className="text-xs sm:text-sm">Affirmations</TabsTrigger>
            <TabsTrigger value="habits"       className="text-xs sm:text-sm">Habits</TabsTrigger>
          </TabsList>
        </div>

        {/* ── GOALS ── */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-full sm:w-48 text-sm"><SelectValue placeholder="Select area" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-areas">All Areas</SelectItem>
                <SelectItem value="health">Health & Fitness</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="personal">Personal Growth</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant={viewMode === "kanban" ? "default" : "outline"} size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setViewMode("kanban")}>Kanban</Button>
              <Button variant={viewMode === "grid"   ? "default" : "outline"} size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setViewMode("grid")}>Grid</Button>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setIsGoalDialogOpen(true)}>
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />New Goal
              </Button>
            </div>
          </div>

          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {goalStatuses.map(status => {
                const cols      = getGoalsByStatus(status.key as Goal["status"]);
                const isHovered = hoveredStatus === status.key && dragState?.isDragging;
                return (
                  <div key={status.key} className="space-y-2">
                    <div className={`flex items-center justify-between rounded-xl border ${status.border} ${status.bg} px-2 sm:px-3 py-2`}>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-sm">{status.icon}</span>
                        <h3 className="font-semibold text-foreground text-xs sm:text-sm">{status.label}</h3>
                      </div>
                      <span className="rounded-md bg-white border border-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">{cols.length}</span>
                    </div>
                    <div
                      ref={el => { columnRefs.current[status.key] = el; }}
                      className={`min-h-56 sm:min-h-64 lg:min-h-80 rounded-xl border p-2 sm:p-3 lg:p-4 transition-all duration-150
                        ${isHovered ? `${status.hoverBg} ${status.hoverBorder} border-2 border-dashed shadow-lg scale-[1.015]` : `${status.bg} ${status.border} border`}
                        ${dragState?.isDragging && !isHovered ? "opacity-70" : ""}`}
                    >
                      {isHovered && (
                        <div className="mb-3 rounded-lg border-2 border-dashed border-gray-400 bg-white/70 h-14 flex items-center justify-center gap-2">
                          <div className="w-1.5 h-5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-7 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "80ms" }} />
                          <div className="w-1.5 h-4 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "160ms" }} />
                          <span className="text-xs text-gray-500 font-semibold ml-1">Drop here</span>
                        </div>
                      )}
                      {cols.length === 0 && !isHovered
                        ? <div className="flex h-full min-h-48 flex-col items-center justify-center"><p className="text-center text-xs sm:text-sm text-muted-foreground">No goals yet</p></div>
                        : <div className="space-y-2 sm:space-y-3">
                            {cols.map(goal => {
                              const dragging = dragState?.goalId === goal.id && dragState?.isDragging;
                              return (
                                <Card key={goal.id}
                                  onPointerDown={e => handlePointerDown(e, goal.id)}
                                  onPointerMove={handlePointerMove}
                                  onPointerUp={handlePointerUp}
                                  onPointerCancel={handlePointerCancel}
                                  className={`bg-white p-2 sm:p-3 shadow-sm select-none touch-none relative group transition-all duration-150
                                    ${dragging ? "opacity-25 scale-95 shadow-none" : "cursor-grab hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 active:cursor-grabbing"}`}
                                >
                                  <div className="flex items-start gap-1.5 pr-6">
                                    <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{goal.title}</p>
                                  </div>
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-muted-foreground">Progress</span>
                                      <span className="text-xs font-semibold text-primary">{goal.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full" style={{ width: `${goal.progress || 0}%` }} />
                                    </div>
                                  </div>
                                  <button onPointerDown={e => e.stopPropagation()} onClick={() => handleDeleteGoal(goal.id)}
                                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </Card>
                              );
                            })}
                          </div>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === "grid" && (
            goals.length === 0
              ? <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 px-4"><p className="text-sm text-muted-foreground">No goals yet. Create your first goal!</p></div>
              : <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {goals.map(goal => (
                    <Card key={goal.id} className="p-3 sm:p-4 relative group">
                      <p className="font-semibold text-sm sm:text-base text-foreground pr-8">{goal.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground capitalize mt-1">{goal.status}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-semibold text-primary">{goal.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-gradient-to-r from-blue-500 to-teal-500 h-2.5 rounded-full" style={{ width: `${goal.progress || 0}%` }} />
                        </div>
                      </div>
                      <DelBtn onClick={() => handleDeleteGoal(goal.id)} />
                    </Card>
                  ))}
                </div>
          )}
        </TabsContent>

        {/* ── BELIEFS ── */}
        <TabsContent value="beliefs" className="space-y-4">
          <Card className="border-l-4 border-red-400 bg-red-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground"><strong>Identifying Limiting Beliefs:</strong> Write the belief, explore its origin, challenge it with evidence, and create an empowering alternative.</p>
          </Card>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="text-lg sm:text-xl text-foreground">Limiting Beliefs</h2><p className="text-xs sm:text-sm text-muted-foreground">Identify and reframe thoughts that hold you back</p></div>
                <Button className="bg-pink-500 hover:bg-pink-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsBeliefDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Belief</Button>
              </div>
              <div className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${beliefs.length === 0 ? "flex flex-col items-center justify-center py-12" : ""}`}>
                {beliefs.length === 0
                  ? <><Heart className="mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-sm text-muted-foreground text-center">No limiting beliefs recorded yet.</p></>
                  : <div className="space-y-3">{beliefs.map(b => <Card key={b.id} className="p-3 sm:p-4 relative group"><p className="font-semibold text-sm text-foreground pr-8">{b.belief}</p><p className="text-xs sm:text-sm text-green-600 mt-2">💚 {b.alternative}</p><DelBtn onClick={() => handleDeleteBelief(b.id)} /></Card>)}</div>
                }
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="text-lg sm:text-xl text-foreground">Behavioral Patterns</h2><p className="text-xs sm:text-sm text-muted-foreground">Understand and change your recurring actions</p></div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsPatternDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Pattern</Button>
              </div>
              <div className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${patterns.length === 0 ? "flex flex-col items-center justify-center py-12" : ""}`}>
                {patterns.length === 0
                  ? <><Zap className="mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-sm text-muted-foreground text-center">No behavioral patterns recorded yet.</p></>
                  : <div className="space-y-3">{patterns.map(p => <Card key={p.id} className="p-3 sm:p-4 relative group"><p className="font-semibold text-sm text-foreground pr-8">{p.name}</p><p className="text-xs sm:text-sm text-orange-600 mt-2">⚡ {p.alternative}</p><DelBtn onClick={() => handleDeletePattern(p.id)} /></Card>)}</div>
                }
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── AFFIRMATIONS ── */}
        <TabsContent value="affirmations" className="space-y-4">
          <Card className="border-l-4 border-purple-400 bg-purple-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground"><strong>Creating Powerful Affirmations:</strong> Write in present tense, use positive language, make it personal. Repeat daily.</p>
          </Card>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-lg sm:text-xl text-foreground">Your Affirmations</h2><p className="text-xs sm:text-sm text-muted-foreground">Positive statements that empower you daily</p></div>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsAffirmationDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add</Button>
            </div>
            <div className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${affirmations.length === 0 ? "flex flex-col items-center justify-center py-16" : ""}`}>
              {affirmations.length === 0
                ? <><Sparkles className="mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-sm text-muted-foreground text-center">No affirmations yet.</p></>
                : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{affirmations.map(a => <Card key={a.id} className="p-3 sm:p-4 relative group bg-purple-50 border-purple-200"><p className="text-sm text-foreground pr-8 italic">"{a.text}"</p>{a.category && <p className="text-xs text-purple-600 mt-2">✨ {a.category}</p>}<DelBtn onClick={() => handleDeleteAffirmation(a.id)} /></Card>)}</div>
              }
            </div>
          </div>
        </TabsContent>

        {/* ── HABITS ── */}
        <TabsContent value="habits" className="space-y-4">
          <Card className="border-l-4 border-teal-400 bg-teal-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground"><strong>Building Lasting Habits:</strong> Start small and be consistent. Track completion to build streaks.</p>
          </Card>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-lg sm:text-xl text-foreground">Habit Tracking</h2><p className="text-xs sm:text-sm text-muted-foreground">Track your daily habits throughout the month</p></div>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsHabitDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Habit</Button>
            </div>
            <Card className="border-l-4 border-blue-400 bg-blue-50 p-3">
              <p className="text-xs sm:text-sm text-foreground">💡 <strong>Tip:</strong> Track habits in <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Daily Journal</span> and <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Weekly Journal</span>.</p>
            </Card>
            <div className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${habits.length === 0 ? "flex flex-col items-center justify-center py-16" : ""}`}>
              {habits.length === 0
                ? <><Zap className="mb-3 h-12 w-12 text-muted-foreground/30" /><p className="text-sm text-muted-foreground text-center">No habits yet.</p></>
                : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{habits.map(h => <Card key={h.id} className="p-3 sm:p-4 relative group bg-teal-50 border-teal-200"><p className="font-semibold text-sm text-foreground pr-8">{h.name}</p><p className="text-xs text-teal-600 mt-1 capitalize">⚡ {h.frequency}</p>{h.time && <p className="text-xs text-gray-600 mt-1">🕐 {h.time}</p>}<DelBtn onClick={() => handleDeleteHabit(h.id)} /></Card>)}</div>
              }
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky Footer */}
      {currentFooter && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-3 py-2.5 flex items-center justify-center shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <Button className={`w-full max-w-sm text-xs sm:text-sm font-semibold rounded-lg h-9 sm:h-10 ${currentFooter.className}`} onClick={currentFooter.onClick}>
            {currentFooter.icon}<span className="truncate">{currentFooter.label}</span>
          </Button>
        </div>
      )}

      {/* Ghost card */}
      {dragState?.isDragging && draggingGoal && (
        <div style={ghostStyle}>
          <Card className="bg-white p-2 sm:p-3 border-2 border-teal-400">
            <div className="flex items-start gap-1.5">
              <GripVertical className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{draggingGoal.title}</p>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full" style={{ width: `${draggingGoal.progress || 0}%` }} />
            </div>
          </Card>
        </div>
      )}

      {/* ── DIALOGS ── */}

      {/* Goal */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl sm:text-2xl">🎯 Create New Goal</DialogTitle><DialogDescription className="text-teal-600">Turn your aspirations into achievable milestones</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Goal Name *</Label><Input placeholder="e.g., Run a marathon, Learn Spanish..." value={goalName} onChange={e => setGoalName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="What does achieving this goal mean to you?" rows={3} value={goalDescription} onChange={e => setGoalDescription(e.target.value)} /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Category</Label><Select value={goalCategory} onValueChange={setGoalCategory}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="health">Health & Fitness</SelectItem><SelectItem value="career">Career</SelectItem><SelectItem value="personal">Personal Growth</SelectItem><SelectItem value="relationships">Relationships</SelectItem><SelectItem value="financial">Financial</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Status</Label><Select value={goalStatus} onValueChange={v => setGoalStatus(v as Goal["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planning">Planning</SelectItem><SelectItem value="started">Started</SelectItem><SelectItem value="progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={goalStartDate} onChange={e => setGoalStartDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Target Date</Label><Input type="date" value={goalTargetDate} onChange={e => setGoalTargetDate(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>Progress: {goalProgress}%</Label>
              <input type="range" min="0" max="100" step="5" value={goalProgress} onChange={e => setGoalProgress(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500" />
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full" style={{ width: `${goalProgress}%` }} /></div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4"><Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>Cancel</Button><Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={handleCreateGoal}>Create Goal</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Belief */}
      <Dialog open={isBeliefDialogOpen} onOpenChange={setIsBeliefDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl sm:text-2xl">💭 Identify Limiting Belief</DialogTitle><DialogDescription className="text-pink-600">Recognize and reframe thoughts that hold you back</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Limiting Belief *</Label><Input placeholder="e.g., I'm not good enough..." value={beliefText} onChange={e => setBeliefText(e.target.value)} /></div>
            <div className="space-y-2"><Label>Origin (Optional)</Label><Textarea placeholder="Where does this belief come from?" rows={2} value={beliefOrigin} onChange={e => setBeliefOrigin(e.target.value)} /></div>
            <div className="space-y-2"><Label>Counter Evidence</Label><Textarea placeholder="What evidence challenges this belief?" rows={2} value={beliefEvidence} onChange={e => setBeliefEvidence(e.target.value)} /></div>
            <div className="space-y-2"><Label>Empowering Alternative *</Label><Input placeholder='"I am capable and growing"' value={beliefAlternative} onChange={e => setBeliefAlternative(e.target.value)} /></div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4"><Button variant="outline" onClick={() => setIsBeliefDialogOpen(false)}>Cancel</Button><Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={handleCreateBelief}>Add Belief</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern */}
      <Dialog open={isPatternDialogOpen} onOpenChange={setIsPatternDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl sm:text-2xl">⚡ Identify Behavioral Pattern</DialogTitle><DialogDescription className="text-orange-600">Understand recurring actions you want to change</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Pattern Name *</Label><Input placeholder="e.g., Procrastination, Emotional eating..." value={patternName} onChange={e => setPatternName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Trigger</Label><Textarea placeholder="What triggers this pattern?" rows={2} value={patternTrigger} onChange={e => setPatternTrigger(e.target.value)} /></div>
            <div className="space-y-2"><Label>Consequence</Label><Textarea placeholder="What are the consequences?" rows={2} value={patternConsequence} onChange={e => setPatternConsequence(e.target.value)} /></div>
            <div className="space-y-2"><Label>Alternative Action *</Label><Input placeholder="What will you do instead?" value={patternAlternative} onChange={e => setPatternAlternative(e.target.value)} /></div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4"><Button variant="outline" onClick={() => setIsPatternDialogOpen(false)}>Cancel</Button><Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleCreatePattern}>Add Pattern</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Affirmation */}
      <Dialog open={isAffirmationDialogOpen} onOpenChange={setIsAffirmationDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl sm:text-2xl">✨ Create Affirmation</DialogTitle><DialogDescription className="text-purple-600">Craft positive statements that empower you daily</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Affirmation *</Label><Textarea placeholder='"I am confident and capable"' rows={3} value={affirmationText} onChange={e => setAffirmationText(e.target.value)} /></div>
            <div className="space-y-2"><Label>Category</Label><Select value={affirmationCategory} onValueChange={setAffirmationCategory}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="confidence">Confidence</SelectItem><SelectItem value="abundance">Abundance</SelectItem><SelectItem value="health">Health</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="relationships">Relationships</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Linked to Belief (Optional)</Label><Input placeholder="Which limiting belief does this counter?" value={affirmationBelief} onChange={e => setAffirmationBelief(e.target.value)} /></div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4"><Button variant="outline" onClick={() => setIsAffirmationDialogOpen(false)}>Cancel</Button><Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={handleCreateAffirmation}>Add Affirmation</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Habit */}
      <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl sm:text-2xl">✨ Create New Habit</DialogTitle><DialogDescription className="text-teal-600">Build lasting routines that align with your goals</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Habit Name *</Label><Input placeholder="e.g., Morning meditation, Exercise..." value={habitName} onChange={e => setHabitName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="What does this habit involve?" rows={3} value={habitDescription} onChange={e => setHabitDescription(e.target.value)} /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Frequency</Label><Select value={habitFrequency} onValueChange={v => setHabitFrequency(v as Habit["frequency"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">📅 Daily</SelectItem><SelectItem value="weekly">📆 Weekly</SelectItem><SelectItem value="custom">⚙️ Custom</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Category</Label><Select value={habitCategory} onValueChange={setHabitCategory}><SelectTrigger><SelectValue placeholder="Other" /></SelectTrigger><SelectContent><SelectItem value="health">🏃 Health & Fitness</SelectItem><SelectItem value="career">💼 Career</SelectItem><SelectItem value="personal">🌱 Personal Growth</SelectItem><SelectItem value="relationships">❤️ Relationships</SelectItem><SelectItem value="other">📌 Other</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label className="flex items-center gap-1"><Clock className="h-4 w-4 text-blue-500" />Time (Optional)</Label><Input placeholder="e.g., 7:00 AM, Morning" value={habitTime} onChange={e => setHabitTime(e.target.value)} /></div>
              <div className="space-y-2"><Label className="flex items-center gap-1"><MapPin className="h-4 w-4 text-blue-500" />Place (Optional)</Label><Input placeholder="e.g., Gym, Home, Office" value={habitPlace} onChange={e => setHabitPlace(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={habitStartDate} onChange={e => setHabitStartDate(e.target.value)} /></div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4"><Button variant="outline" onClick={() => setIsHabitDialogOpen(false)}>Cancel</Button><Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={handleCreateHabit}>Create Habit</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsHabits;