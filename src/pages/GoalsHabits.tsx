import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Heart,
  Zap,
  Sparkles,
  Clock,
  MapPin,
  Target,
  Columns3,
  LayoutGrid,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// ─── API CONFIG ──────────────────────────────────────────────────────────────
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

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Goal { id: string; title: string; status: "planning" | "started" | "progress" | "completed"; area?: string; progress?: number; description?: string; start_date?: string; target_date?: string; }
interface Belief { id: string | number; belief: string; statement?: string; limiting_belief?: string; goal_id?: number | null; user_id?: number; affirmation_id?: number | null; active?: number; changed_by?: number; created_at?: string; updated_at?: string; reflection_data?: { origin?: string; supporting_evidence?: string; contradicting_evidence?: string; impact?: string; reframe?: string; }; origin?: string; evidence?: string; alternative: string; }
interface Pattern { id: string | number; name: string; recurring_behavior?: string; trigger?: string; consequence?: string; alternative: string; pattern_data?: { triggers?: string; underlying_reason?: string; impact?: string; desired_behavior?: string; strategies?: string; }; affirmation_id?: number | null; created_at?: string; }
interface Affirmation { id: string | number; text?: string; statement?: string; category?: string; linkedBelief?: string; priority?: number; }
interface Habit { id: string | number; name: string; description?: string; frequency?: "daily" | "weekly" | "custom"; category?: string; time?: string; place?: string; start_date?: string; target_date?: string; startDate?: string; }
interface DragState { goalId: string; startX: number; startY: number; currentX: number; currentY: number; cardWidth: number; cardHeight: number; isDragging: boolean; }

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const DelBtn = ({ onClick, disabled, loading }: { onClick: () => void; disabled?: boolean; loading?: boolean }) => (
  <button
    onPointerDown={(e) => e.stopPropagation()}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    disabled={disabled || loading}
    className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
  >
    {loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    )}
  </button>
);

const EditBtn = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
  <button
    onPointerDown={(e) => e.stopPropagation()}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    disabled={disabled}
    className="absolute top-3 right-12 text-blue-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
  >
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  </button>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const GoalsHabits = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState("all-areas");
  const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");
  const [activeTab, setActiveTab] = useState("goals");

  // Data States
  const [goals, setGoals] = useState<Goal[]>([]);
  const [beliefs, setBeliefs] = useState<Belief[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  // Detail Modal States
  const [patternDetail, setPatternDetail] = useState<Pattern | null>(null);
  const [isPatternDetailOpen, setIsPatternDetailOpen] = useState(false);

  // Dialog States
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isBeliefDialogOpen, setIsBeliefDialogOpen] = useState(false);
  const [isPatternDialogOpen, setIsPatternDialogOpen] = useState(false);
  const [isAffirmationDialogOpen, setIsAffirmationDialogOpen] = useState(false);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);

  // Saving States
  const [goalSaving, setGoalSaving] = useState(false);
  const [beliefSaving, setBeliefSaving] = useState(false);
  const [patternSaving, setPatternSaving] = useState(false);
  const [affirmationSaving, setAffirmationSaving] = useState(false);
  const [habitSaving, setHabitSaving] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Form states: Goal
  const [goalName, setGoalName] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalCategory, setGoalCategory] = useState("");
  const [goalStatus, setGoalStatus] = useState<Goal["status"]>("planning");
  const [goalStartDate, setGoalStartDate] = useState("");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [goalProgress, setGoalProgress] = useState(0);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Form states: Belief
  const [beliefText, setBeliefText] = useState("");
  const [beliefOrigin, setBeliefOrigin] = useState("");
  const [beliefSupportingEvidence, setBeliefSupportingEvidence] = useState("");
  const [beliefEvidence, setBeliefEvidence] = useState("");
  const [beliefImpact, setBeliefImpact] = useState("");
  const [beliefAlternative, setBeliefAlternative] = useState("");
  const [editingBeliefId, setEditingBeliefId] = useState<string | number | null>(null);
  const [beliefAffirmationId, setBeliefAffirmationId] = useState<string>("none");

  // Form states: Pattern
  const [patternName, setPatternName] = useState("");
  const [patternTrigger, setPatternTrigger] = useState("");
  const [patternUnderlyingReason, setPatternUnderlyingReason] = useState("");
  const [patternConsequence, setPatternConsequence] = useState("");
  const [patternAlternative, setPatternAlternative] = useState("");
  const [patternStrategies, setPatternStrategies] = useState("");
  const [patternAffirmationId, setPatternAffirmationId] = useState<string>("");
  const [editingPatternId, setEditingPatternId] = useState<string | number | null>(null);

  // Form states: Affirmation
  const [affirmationStatement, setAffirmationStatement] = useState("");
  const [affirmationPriority, setAffirmationPriority] = useState(5);
  const [editingAffirmationId, setEditingAffirmationId] = useState<string | number | null>(null);

  // Form states: Habit
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [habitFrequency, setHabitFrequency] = useState<Habit["frequency"]>("daily");
  const [habitCategory, setHabitCategory] = useState("");
  const [habitTime, setHabitTime] = useState("");
  const [habitPlace, setHabitPlace] = useState("");
  const [habitStartDate, setHabitStartDate] = useState("");
  const [habitLinkedGoals, setHabitLinkedGoals] = useState<string[]>([]);
  const [editingHabitId, setEditingHabitId] = useState<string | number | null>(null);

  // Drag & Drop State
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (location.state?.openGoalDialog) {
      setActiveTab("goals");
      setIsGoalDialogOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const save = <T,>(key: string, items: T[]) => localStorage.setItem(key, JSON.stringify(items));

  // UI uses "progress", API expects "in_progress"
  const toApiStatus = (s: string) => s === "progress" ? "in_progress" : s;
  const fromApiStatus = (s: string | null | undefined): Goal["status"] => {
    if (!s) return "planning";
    if (s === "in_progress") return "progress";
    if (["planning", "started", "progress", "completed"].includes(s)) return s as Goal["status"];
    return "planning";
  };

  // ─── DATA LOADING ─────────────────────────────────────────────────────────
  // FIX 1: Robust multi-shape API response parser
  useEffect(() => {
    const loadData = async (endpoint: string, key: string, setter: any, arrayKey?: string) => {
      try {
        const saved = localStorage.getItem(key);
        if (saved) setter(JSON.parse(saved));
        const res = await fetchWithAuth(endpoint);
        if (res.ok) {
          const data = await res.json();
          let list: any[] = [];
          if (Array.isArray(data)) {
            list = data;
          } else if (arrayKey && Array.isArray(data[arrayKey])) {
            list = data[arrayKey];
          } else if (Array.isArray(data.data)) {
            list = data.data;
          } else if (Array.isArray(data.items)) {
            list = data.items;
          } else if (Array.isArray(data.results)) {
            list = data.results;
          }
          setter(list);
          save(key, list);
        }
      } catch (e) { console.error(`Error loading ${key}`, e); }
    };

    // Goals: extra normalization — id→string, null status→"planning"
    const loadGoals = async () => {
      try {
        const saved = localStorage.getItem("user_goals");
        if (saved) setGoals(JSON.parse(saved));
        const res = await fetchWithAuth("/goals");
        if (res.ok) {
          const data = await res.json();
          const raw: any[] = Array.isArray(data)
            ? data
            : Array.isArray(data.goals)
            ? data.goals
            : Array.isArray(data.data)
            ? data.data
            : [];
          const normalized: Goal[] = raw.map((g) => ({
            ...g,
            id: String(g.id),
            status: fromApiStatus(g.status),
          }));
          setGoals(normalized);
          save("user_goals", normalized);
        }
      } catch (e) { console.error("Error loading goals", e); }
    };
    loadGoals();
    loadData("/limiting_beliefs", "user_beliefs", setBeliefs, "limiting_beliefs");
    loadData("/behavioral_patterns", "user_patterns", setPatterns, "behavioral_patterns");
    loadData("/affirmations", "user_affirmations", setAffirmations, "affirmations");
    loadData("/habits", "user_habits", setHabits, "habits");
  }, []);

  // ─── GOALS CRUD ───────────────────────────────────────────────────────────
  const handleCreateGoal = async () => {
    if (!goalName.trim()) return;
    setGoalSaving(true);
    const tempId = `temp-${Date.now()}`;
    const newGoal: Goal = { id: tempId, title: goalName, status: goalStatus, area: goalCategory, progress: goalProgress };

    setGoals((prev) => { const u = [...prev, newGoal]; save("user_goals", u); return u; });

    try {
      const res = await fetchWithAuth("/goals", {
        method: "POST",
        body: JSON.stringify({ goal: { title: goalName, description: goalDescription, category: goalCategory || "other", status: toApiStatus(goalStatus), priority: "high", progress: goalProgress, start_date: goalStartDate || null, target_date: goalTargetDate || null, end_date: goalTargetDate || null, core_value_ids: [] } }),
      });
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      const createdId = d.goal?.id ?? d.data?.id ?? d.id ?? newGoal.id;
      setGoals((prev) => { const u = prev.map((g) => (g.id === tempId ? { ...g, id: String(createdId) } : g)); save("user_goals", u); return u; });

      setGoalName(""); setGoalDescription(""); setGoalCategory(""); setGoalStatus("planning"); setGoalStartDate(""); setGoalTargetDate(""); setGoalProgress(0);
      setEditingGoalId(null);
      setIsGoalDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to save goal", variant: "destructive" });
      setGoals((prev) => { const u = prev.filter((g) => g.id !== tempId); save("user_goals", u); return u; });
    } finally {
      setGoalSaving(false);
    }
  };

  const handleUpdateGoal = async () => {
    if (!goalName.trim() || editingGoalId === null) return;
    setGoalSaving(true);
    const previous = [...goals];

    setGoals((prev) => {
      const u = prev.map((g) => g.id === editingGoalId ? { ...g, title: goalName, status: goalStatus, area: goalCategory, progress: goalProgress } : g);
      save("user_goals", u); return u;
    });

    try {
      const res = await fetchWithAuth(`/goals/${editingGoalId}`, {
        method: "PUT",
        body: JSON.stringify({ goal: { title: goalName, description: goalDescription, category: goalCategory || "other", status: toApiStatus(goalStatus), priority: "high", progress: goalProgress, start_date: goalStartDate || null, target_date: goalTargetDate || null, end_date: goalTargetDate || null, core_value_ids: [] } }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setGoals((prev) => {
        const u = prev.map((g) => g.id === editingGoalId ? { ...g, ...updated.goal, id: String(updated.goal?.id || updated.id || editingGoalId) } : g);
        save("user_goals", u); return u;
      });

      setEditingGoalId(null); setGoalName(""); setGoalDescription(""); setGoalCategory(""); setGoalStatus("planning"); setGoalStartDate(""); setGoalTargetDate(""); setGoalProgress(0);
      setIsGoalDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to update goal", variant: "destructive" });
      setGoals(previous); save("user_goals", previous);
    } finally {
      setGoalSaving(false);
    }
  };

  const openEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setGoalName(goal.title);
    setGoalDescription(goal.description || "");
    setGoalCategory(goal.area || "");
    setGoalStatus(goal.status);
    setGoalStartDate(goal.start_date || "");
    setGoalTargetDate(goal.target_date || "");
    setGoalProgress(goal.progress || 0);
    setIsGoalDialogOpen(true);
  };

  const handleDeleteGoal = async (id: string) => {
    if (String(id).startsWith("temp-")) return setGoals((p) => p.filter((g) => g.id !== id));
    
    setDeletingGoalId(id);
    const previous = [...goals];
    setGoals((prev) => { const u = prev.filter((g) => g.id !== id); save("user_goals", u); return u; });
    
    try {
      const res = await fetchWithAuth(`/goals/${id}`, { 
        method: "DELETE",
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
    } catch (error) {
      console.error("Delete error:", error);
      toast({ 
        title: "Error", 
        description: error.name === 'TimeoutError' ? "Delete request timed out. Please try again." : "Could not delete goal", 
        variant: "destructive" 
      });
      setGoals(previous); 
      save("user_goals", previous);
    } finally {
      setDeletingGoalId(null);
    }
  };

  const handleUpdateGoalStatus = useCallback(async (id: string, newStatus: string) => {
    const previous = [...goals];
    setGoals((prev) => { const u = prev.map((g) => g.id === id ? { ...g, status: newStatus as Goal["status"] } : g); save("user_goals", u); return u; });
    try {
      const res = await fetchWithAuth(`/goals/${id}`, { method: "PUT", body: JSON.stringify({ goal: { status: toApiStatus(newStatus) } }) });
      if (!res.ok) throw new Error("Failed");
    } catch (err) {
      toast({ title: "Error", description: "Could not update goal status", variant: "destructive" });
      setGoals(previous); save("user_goals", previous);
    }
  }, [goals, toast]);

  // ─── BELIEF HANDLERS ───────────────────────────────────────────────────
  const handleCreateBelief = async () => {
    if (!beliefText.trim()) return;
    setBeliefSaving(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic: Belief = { id: tempId, belief: beliefText, alternative: beliefAlternative, reflection_data: { origin: beliefOrigin, supporting_evidence: beliefSupportingEvidence, contradicting_evidence: beliefEvidence, impact: beliefImpact, reframe: beliefAlternative } };

    setBeliefs((prev) => { const u = [...prev, optimistic]; save("user_beliefs", u); return u; });

    try {
      const res = await fetchWithAuth("/limiting_beliefs", {
        method: "POST",
        body: JSON.stringify({ statement: beliefText, affirmation_id: beliefAffirmationId && beliefAffirmationId !== "none" ? Number(beliefAffirmationId) : null, reflection_data: { origin: beliefOrigin, supporting_evidence: beliefSupportingEvidence, contradicting_evidence: beliefEvidence, impact: beliefImpact, reframe: beliefAlternative } }),
      });
      if (!res.ok) throw new Error("Failed");
      const created = await res.json();
      setBeliefs((prev) => {
        const u = prev.map((b) => b.id === tempId ? { ...created, belief: created.statement ?? created.limiting_belief ?? beliefText, alternative: created.reflection_data?.reframe ?? beliefAlternative } : b);
        save("user_beliefs", u); return u;
      });

      setBeliefText(""); setBeliefOrigin(""); setBeliefSupportingEvidence(""); setBeliefEvidence(""); setBeliefImpact(""); setBeliefAlternative(""); setBeliefAffirmationId("none");
      setIsBeliefDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save belief", variant: "destructive" });
      setBeliefs((prev) => { const u = prev.filter((b) => b.id !== tempId); save("user_beliefs", u); return u; });
    } finally {
      setBeliefSaving(false);
    }
  };

  const handleUpdateBelief = async () => {
    if (!beliefText.trim() || editingBeliefId === null) return;
    setBeliefSaving(true);
    const previous = [...beliefs];

    setBeliefs((prev) => {
      const u = prev.map((b) => b.id === editingBeliefId ? { ...b, belief: beliefText, statement: beliefText, alternative: beliefAlternative, reflection_data: { origin: beliefOrigin, supporting_evidence: beliefSupportingEvidence, contradicting_evidence: beliefEvidence, impact: beliefImpact, reframe: beliefAlternative } } : b);
      save("user_beliefs", u); return u;
    });

    try {
      const res = await fetchWithAuth(`/limiting_beliefs/${editingBeliefId}`, {
        method: "PUT",
        body: JSON.stringify({ statement: beliefText, affirmation_id: beliefAffirmationId && beliefAffirmationId !== "none" ? Number(beliefAffirmationId) : null, reflection_data: { origin: beliefOrigin, supporting_evidence: beliefSupportingEvidence, contradicting_evidence: beliefEvidence, impact: beliefImpact, reframe: beliefAlternative } }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated: Belief = await res.json();
      setBeliefs((prev) => {
        const u = prev.map((b) => b.id === editingBeliefId ? { ...updated, belief: updated.statement ?? updated.limiting_belief ?? beliefText, alternative: updated.reflection_data?.reframe ?? beliefAlternative } : b);
        save("user_beliefs", u); return u;
      });

      setEditingBeliefId(null); setBeliefText(""); setBeliefOrigin(""); setBeliefSupportingEvidence(""); setBeliefEvidence(""); setBeliefImpact(""); setBeliefAlternative(""); setBeliefAffirmationId("none");
      setIsBeliefDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update belief", variant: "destructive" });
      setBeliefs(previous); save("user_beliefs", previous);
    } finally {
      setBeliefSaving(false);
    }
  };

  const handleDeleteBelief = async (id: string | number) => {
    if (String(id).startsWith("temp-")) return setBeliefs((p) => p.filter((b) => b.id !== id));
    const previous = [...beliefs];
    setBeliefs((prev) => { const u = prev.filter((b) => b.id !== id); save("user_beliefs", u); return u; });
    try {
      const res = await fetchWithAuth(`/limiting_beliefs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete belief", variant: "destructive" });
      setBeliefs(previous); save("user_beliefs", previous);
    }
  };

  const openEditBelief = (belief: Belief) => {
    setEditingBeliefId(belief.id);
    setBeliefText(belief.statement ?? belief.belief ?? "");
    setBeliefOrigin(belief.reflection_data?.origin ?? belief.origin ?? "");
    setBeliefSupportingEvidence(belief.reflection_data?.supporting_evidence ?? "");
    setBeliefEvidence(belief.reflection_data?.contradicting_evidence ?? belief.evidence ?? "");
    setBeliefImpact(belief.reflection_data?.impact ?? "");
    setBeliefAlternative(belief.reflection_data?.reframe ?? belief.alternative ?? "");
    setBeliefAffirmationId(belief.affirmation_id ? String(belief.affirmation_id) : "none");
    setIsBeliefDialogOpen(true);
  };

  // ─── PATTERN HANDLERS ────────────────────────────────────────────────────
  const handleCreatePattern = async () => {
    if (!patternName.trim()) return;
    setPatternSaving(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic: Pattern = { id: tempId, name: patternName, trigger: patternTrigger, consequence: patternConsequence, alternative: patternAlternative, pattern_data: { triggers: patternTrigger, underlying_reason: patternUnderlyingReason, impact: patternConsequence, desired_behavior: patternAlternative, strategies: patternStrategies }, affirmation_id: patternAffirmationId && patternAffirmationId !== "none" ? Number(patternAffirmationId) : null };

    setPatterns((prev) => { const u = [...prev, optimistic]; save("user_patterns", u); return u; });

    try {
      const res = await fetchWithAuth("/behavioral_patterns", {
        method: "POST",
        body: JSON.stringify({ recurring_behavior: patternName, affirmation_id: patternAffirmationId && patternAffirmationId !== "none" ? Number(patternAffirmationId) : null, pattern_data: { triggers: patternTrigger, underlying_reason: patternUnderlyingReason, impact: patternConsequence, desired_behavior: patternAlternative, strategies: patternStrategies } }),
      });
      if (!res.ok) throw new Error("Failed");
      const created: Pattern = await res.json();
      setPatterns((prev) => {
        const u = prev.map((p) => p.id === tempId ? { ...created, name: created.recurring_behavior ?? created.name ?? patternName, alternative: created.pattern_data?.desired_behavior ?? patternAlternative, affirmation_id: created.affirmation_id } : p);
        save("user_patterns", u); return u;
      });

      setPatternName(""); setPatternTrigger(""); setPatternUnderlyingReason(""); setPatternConsequence(""); setPatternAlternative(""); setPatternStrategies(""); setPatternAffirmationId("");
      setIsPatternDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save pattern", variant: "destructive" });
      setPatterns((prev) => { const u = prev.filter((p) => p.id !== tempId); save("user_patterns", u); return u; });
    } finally {
      setPatternSaving(false);
    }
  };

  const handleUpdatePattern = async () => {
    if (!patternName.trim() || editingPatternId === null) return;
    setPatternSaving(true);
    const previous = [...patterns];

    setPatterns((prev) => {
      const u = prev.map((p) => p.id === editingPatternId ? { ...p, name: patternName, recurring_behavior: patternName, alternative: patternAlternative, trigger: patternTrigger, consequence: patternConsequence, affirmation_id: patternAffirmationId && patternAffirmationId !== "none" ? Number(patternAffirmationId) : null, pattern_data: { triggers: patternTrigger, underlying_reason: patternUnderlyingReason, impact: patternConsequence, desired_behavior: patternAlternative, strategies: patternStrategies } } : p);
      save("user_patterns", u); return u;
    });

    try {
      const res = await fetchWithAuth(`/behavioral_patterns/${editingPatternId}`, {
        method: "PUT",
        body: JSON.stringify({ recurring_behavior: patternName, affirmation_id: patternAffirmationId && patternAffirmationId !== "none" ? Number(patternAffirmationId) : null, pattern_data: { triggers: patternTrigger, underlying_reason: patternUnderlyingReason, impact: patternConsequence, desired_behavior: patternAlternative, strategies: patternStrategies } }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated: Pattern = await res.json();
      setPatterns((prev) => {
        const u = prev.map((p) => p.id === editingPatternId ? { ...updated, name: updated.recurring_behavior ?? updated.name ?? patternName, alternative: updated.pattern_data?.desired_behavior ?? patternAlternative, trigger: updated.pattern_data?.triggers ?? patternTrigger, consequence: updated.pattern_data?.impact ?? patternConsequence, affirmation_id: updated.affirmation_id } : p);
        save("user_patterns", u); return u;
      });

      setEditingPatternId(null); setPatternName(""); setPatternTrigger(""); setPatternUnderlyingReason(""); setPatternConsequence(""); setPatternAlternative(""); setPatternStrategies(""); setPatternAffirmationId("");
      setIsPatternDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update pattern", variant: "destructive" });
      setPatterns(previous); save("user_patterns", previous);
    } finally {
      setPatternSaving(false);
    }
  };

  const handleDeletePattern = async (id: string | number) => {
    if (String(id).startsWith("temp-")) return setPatterns((p) => p.filter((pt) => pt.id !== id));
    const previous = [...patterns];
    setPatterns((prev) => { const u = prev.filter((p) => p.id !== id); save("user_patterns", u); return u; });
    try {
      const res = await fetchWithAuth(`/behavioral_patterns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete pattern", variant: "destructive" });
      setPatterns(previous); save("user_patterns", previous);
    }
  };

  const openEditPattern = (pattern: Pattern) => {
    setEditingPatternId(pattern.id);
    setPatternName(pattern.recurring_behavior ?? pattern.name ?? "");
    setPatternTrigger(pattern.pattern_data?.triggers ?? pattern.trigger ?? "");
    setPatternUnderlyingReason(pattern.pattern_data?.underlying_reason ?? "");
    setPatternConsequence(pattern.pattern_data?.impact ?? pattern.consequence ?? "");
    setPatternAlternative(pattern.pattern_data?.desired_behavior ?? pattern.alternative ?? "");
    setPatternStrategies(pattern.pattern_data?.strategies ?? "");
    setPatternAffirmationId(pattern.affirmation_id ? String(pattern.affirmation_id) : "none");
    setIsPatternDetailOpen(false);
    setIsPatternDialogOpen(true);
  };

  const openPatternDetail = (id: string | number) => {
    const p = patterns.find((pt) => pt.id === id);
    if (p) { setPatternDetail(p); setIsPatternDetailOpen(true); }
  };

  // ─── AFFIRMATIONS CRUD ────────────────────────────────────────────────────
  const handleCreateAffirmation = async () => {
    if (!affirmationStatement.trim()) return;
    setAffirmationSaving(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic: Affirmation = { id: tempId, statement: affirmationStatement, priority: affirmationPriority };

    setAffirmations((prev) => { const u = [...prev, optimistic]; save("user_affirmations", u); return u; });

    try {
      const res = await fetchWithAuth("/affirmations", { method: "POST", body: JSON.stringify({ affirmation: { statement: affirmationStatement, priority: affirmationPriority } }) });
      if (!res.ok) throw new Error("Failed");
      const created = await res.json();
      const createdId = created.id ?? created.affirmation?.id ?? tempId;
      setAffirmations((prev) => {
        const u = prev.map(a => a.id === tempId ? { ...a, id: createdId } : a);
        save("user_affirmations", u); return u;
      });

      setAffirmationStatement(""); setAffirmationPriority(5);
      setIsAffirmationDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to create affirmation", variant: "destructive" });
      setAffirmations((prev) => { const u = prev.filter(a => a.id !== tempId); save("user_affirmations", u); return u; });
    } finally {
      setAffirmationSaving(false);
    }
  };

  const handleUpdateAffirmation = async () => {
    if (!affirmationStatement.trim() || editingAffirmationId === null) return;
    setAffirmationSaving(true);
    const previous = [...affirmations];

    setAffirmations((prev) => {
      const u = prev.map(a => a.id === editingAffirmationId ? { ...a, statement: affirmationStatement, priority: affirmationPriority } : a);
      save("user_affirmations", u); return u;
    });

    try {
      const res = await fetchWithAuth(`/affirmations/${editingAffirmationId}`, {
        method: "PUT",
        body: JSON.stringify({ affirmation: { statement: affirmationStatement, priority: affirmationPriority } }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setAffirmations((prev) => {
        const u = prev.map(a => a.id === editingAffirmationId ? { ...updated, id: updated.id ?? updated.affirmation?.id ?? editingAffirmationId } : a);
        save("user_affirmations", u); return u;
      });

      setEditingAffirmationId(null); setAffirmationStatement(""); setAffirmationPriority(5);
      setIsAffirmationDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to update affirmation", variant: "destructive" });
      setAffirmations(previous); save("user_affirmations", previous);
    } finally {
      setAffirmationSaving(false);
    }
  };

  const openEditAffirmation = (affirmation: Affirmation) => {
    setEditingAffirmationId(affirmation.id);
    setAffirmationStatement(affirmation.statement || affirmation.text || "");
    setAffirmationPriority(affirmation.priority || 5);
    setIsAffirmationDialogOpen(true);
  };

  // FIX 2: Affirmations delete — id can be string | number from API
  const handleDeleteAffirmation = async (id: string | number) => {
    if (String(id).startsWith("temp-")) return setAffirmations((p) => p.filter((a) => a.id !== id));
    const previous = [...affirmations];
    setAffirmations((prev) => { const u = prev.filter((a) => a.id !== id); save("user_affirmations", u); return u; });
    try {
      const res = await fetchWithAuth(`/affirmations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete affirmation", variant: "destructive" });
      setAffirmations(previous); save("user_affirmations", previous);
    }
  };

  // ─── HABITS CRUD ──────────────────────────────────────────────────────────
  const handleCreateHabit = async () => {
    if (!habitName.trim()) return;
    setHabitSaving(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic: Habit = { id: tempId, name: habitName, frequency: habitFrequency || "daily", description: habitDescription, category: habitCategory, time: habitTime, place: habitPlace, start_date: habitStartDate };

    setHabits((prev) => { const u = [...prev, optimistic]; save("user_habits", u); return u; });

    try {
      const res = await fetchWithAuth("/habits", {
        method: "POST",
        body: JSON.stringify({ name: habitName, frequency: habitFrequency || "daily", description: habitDescription, category: habitCategory, time: habitTime, place: habitPlace, start_date: habitStartDate, linked_goals: habitLinkedGoals }),
      });
      if (!res.ok) throw new Error("Failed");
      const created = await res.json();
      const createdId = created.id ?? created.habit?.id ?? tempId;
      setHabits((prev) => {
        const u = prev.map(h => h.id === tempId ? { ...h, id: createdId } : h);
        save("user_habits", u); return u;
      });

      setHabitName(""); setHabitDescription(""); setHabitFrequency("daily"); setHabitCategory(""); setHabitTime(""); setHabitPlace(""); setHabitStartDate(""); setHabitLinkedGoals([]);
      setIsHabitDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to create habit", variant: "destructive" });
      setHabits((prev) => { const u = prev.filter(h => h.id !== tempId); save("user_habits", u); return u; });
    } finally {
      setHabitSaving(false);
    }
  };

  const handleUpdateHabit = async () => {
    if (!habitName.trim() || editingHabitId === null) return;
    setHabitSaving(true);
    const previous = [...habits];

    setHabits((prev) => {
      const u = prev.map(h => h.id === editingHabitId ? { ...h, name: habitName, frequency: habitFrequency, description: habitDescription, category: habitCategory, time: habitTime, place: habitPlace, start_date: habitStartDate } : h);
      save("user_habits", u); return u;
    });

    try {
      const res = await fetchWithAuth(`/habits/${editingHabitId}`, {
        method: "PUT",
        body: JSON.stringify({ name: habitName, frequency: habitFrequency, description: habitDescription, category: habitCategory, time: habitTime, place: habitPlace, start_date: habitStartDate, linked_goals: habitLinkedGoals }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setHabits((prev) => {
        const u = prev.map(h => h.id === editingHabitId ? { ...updated, id: updated.id ?? updated.habit?.id ?? editingHabitId } : h);
        save("user_habits", u); return u;
      });

      setEditingHabitId(null); setHabitName(""); setHabitDescription(""); setHabitFrequency("daily"); setHabitCategory(""); setHabitTime(""); setHabitPlace(""); setHabitStartDate(""); setHabitLinkedGoals([]);
      setIsHabitDialogOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to update habit", variant: "destructive" });
      setHabits(previous); save("user_habits", previous);
    } finally {
      setHabitSaving(false);
    }
  };

  const openEditHabit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setHabitName(habit.name);
    setHabitDescription(habit.description || "");
    setHabitFrequency(habit.frequency || "daily");
    setHabitCategory(habit.category || "");
    setHabitTime(habit.time || "");
    setHabitPlace(habit.place || "");
    setHabitStartDate(habit.start_date || habit.startDate || "");
    setHabitLinkedGoals([]);
    setIsHabitDialogOpen(true);
  };

  // FIX 3: Habits delete — id can be string | number from API
  const handleDeleteHabit = async (id: string | number) => {
    if (String(id).startsWith("temp-")) return setHabits((p) => p.filter((h) => h.id !== id));
    const previous = [...habits];
    setHabits((prev) => { const u = prev.filter((h) => h.id !== id); save("user_habits", u); return u; });
    try {
      const res = await fetchWithAuth(`/habits/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete habit", variant: "destructive" });
      setHabits(previous); save("user_habits", previous);
    }
  };

  // ─── DRAG AND DROP ────────────────────────────────────────────────────────
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
    e.preventDefault();
    if ((e.currentTarget as HTMLElement).setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // no-op: some environments can fail to capture pointer
      }
    }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragState({ goalId, startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY, cardWidth: r.width, cardHeight: r.height, isDragging: false });
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;
    const dist = Math.sqrt((e.clientX - dragState.startX) ** 2 + (e.clientY - dragState.startY) ** 2);
    if (dist > 6 || dragState.isDragging) {
      setDragState((p) => p ? { ...p, currentX: e.clientX, currentY: e.clientY, isDragging: true } : null);
      setHoveredStatus(getHoveredColumn(e.clientX, e.clientY));
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }
  }, [dragState, getHoveredColumn]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;
    if (dragState.isDragging) {
      const target = getHoveredColumn(e.clientX, e.clientY);
      const goal = goals.find((g) => g.id === dragState.goalId);
      if (target && goal && goal.status !== target) handleUpdateGoalStatus(dragState.goalId, target);
    }
    setDragState(null); setHoveredStatus(null);
    document.body.style.cursor = ""; document.body.style.userSelect = "";
  }, [dragState, goals, getHoveredColumn, handleUpdateGoalStatus]);

  const handlePointerCancel = useCallback(() => {
    setDragState(null); setHoveredStatus(null);
    document.body.style.cursor = ""; document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    if (!dragState) return;

    const onWindowPointerMove = (e: PointerEvent) => {
      const dist = Math.sqrt((e.clientX - dragState.startX) ** 2 + (e.clientY - dragState.startY) ** 2);
      if (dist > 6 || dragState.isDragging) {
        setDragState((p) => p ? { ...p, currentX: e.clientX, currentY: e.clientY, isDragging: true } : null);
        setHoveredStatus(getHoveredColumn(e.clientX, e.clientY));
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      }
    };

    const onWindowPointerUp = (e: PointerEvent) => {
      if (!dragState) return;
      if (dragState.isDragging) {
        const target = getHoveredColumn(e.clientX, e.clientY);
        const goal = goals.find((g) => g.id === dragState.goalId);
        if (target && goal && goal.status !== target) {
          handleUpdateGoalStatus(dragState.goalId, target);
        }
      }
      setDragState(null);
      setHoveredStatus(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    const onWindowPointerCancel = () => {
      setDragState(null);
      setHoveredStatus(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", onWindowPointerCancel);

    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", onWindowPointerCancel);
    };
  }, [dragState, getHoveredColumn, goals, handleUpdateGoalStatus]);

  const ghostStyle = dragState?.isDragging
    ? { position: "fixed" as const, left: dragState.currentX - dragState.cardWidth / 2, top: dragState.currentY - dragState.cardHeight / 2, width: dragState.cardWidth, pointerEvents: "none" as const, zIndex: 9999, transform: "rotate(2deg) scale(1.04)", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", transition: "none" }
    : undefined;

  // ─── UI CONFIG ────────────────────────────────────────────────────────────
  const goalStatuses = [
    { key: "planning", label: "Planning", icon: "🎯", bg: "bg-blue-50", border: "border-blue-200", hoverBg: "bg-blue-100", hoverBorder: "border-blue-500" },
    { key: "started", label: "Started", icon: "🚀", bg: "bg-purple-50", border: "border-purple-200", hoverBg: "bg-purple-100", hoverBorder: "border-purple-500" },
    { key: "progress", label: "Progress", icon: "📈", bg: "bg-orange-50", border: "border-orange-200", hoverBg: "bg-orange-100", hoverBorder: "border-orange-500" },
    { key: "completed", label: "Completed", icon: "✅", bg: "bg-teal-50", border: "border-teal-200", hoverBg: "bg-teal-100", hoverBorder: "border-teal-500" },
  ];

  const getGoalsByStatus = (s: Goal["status"]) => goals.filter((g) => g.status === s && (selectedArea === "all-areas" || g.area === selectedArea));

  const areaLabels: Record<string, string> = { "all-areas": "Create Your First Goal", health: "Create Your Health & Fitness Goal", career: "Create Your Career Goal", personal: "Create Your Personal Growth Goal", relationships: "Create Your Relationships Goal", financial: "Create Your Financial Goal" };

  const footerConfig = {
    goals: { onClick: () => setIsGoalDialogOpen(true), label: areaLabels[selectedArea] || "Create Your First Goal", className: "bg-red-500 hover:bg-red-600 text-white", icon: <Target className="h-4 w-4 mr-2 shrink-0" /> },
    beliefs: { onClick: () => setIsBeliefDialogOpen(true), label: "Identify Your First Belief", className: "bg-red-500 hover:bg-red-600 text-white", icon: <Heart className="h-4 w-4 mr-2 shrink-0" /> },
    affirmations: { onClick: () => setIsAffirmationDialogOpen(true), label: "Add Your First Affirmation", className: "bg-red-500 hover:bg-red-600 text-white", icon: <Sparkles className="h-4 w-4 mr-2 shrink-0" /> },
    habits: { onClick: () => setIsHabitDialogOpen(true), label: "Create Your First Habit", className: "bg-red-500 hover:bg-red-600 text-white", icon: <Zap className="h-4 w-4 mr-2 shrink-0" /> },
  };

  const currentFooter = footerConfig[activeTab as keyof typeof footerConfig];

  // Only show footer for affirmations and habits when there are no items
  const shouldShowFooter = () => {
    if (activeTab === "goals") return goals.length === 0;
    if (activeTab === "affirmations") return affirmations.length === 0;
    if (activeTab === "habits") return habits.length === 0;
    return true; // Always show for beliefs
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Goals & Habits</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Transform beliefs and achieve your aspirations</p>
      </div>

      <Card className="border-l-4 border-blue-400 bg-blue-50 p-4">
        <p className="text-sm text-foreground leading-relaxed">
          <strong>Setting SMART Goals:</strong> Create Specific, Measurable, Achievable, Relevant, and Time-bound goals. Break big goals into smaller milestones.
        </p>
      </Card>

      <Tabs defaultValue="goals" className="space-y-5" onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="grid w-full max-w-md min-w-[280px] grid-cols-4">
            <TabsTrigger value="goals" className="text-xs sm:text-sm data-[state=active]:bg-red-500 data-[state=active]:text-white">Goals</TabsTrigger>
            <TabsTrigger value="beliefs" className="text-xs sm:text-sm data-[state=active]:bg-red-500 data-[state=active]:text-white">Beliefs</TabsTrigger>
            <TabsTrigger value="affirmations" className="text-xs sm:text-sm data-[state=active]:bg-red-500 data-[state=active]:text-white">Affirmations</TabsTrigger>
            <TabsTrigger value="habits" className="text-xs sm:text-sm data-[state=active]:bg-red-500 data-[state=active]:text-white">Habits</TabsTrigger>
          </TabsList>
        </div>

        {/* ── GOALS ── */}
        <TabsContent value="goals" className="space-y-5">
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
              <Button variant="outline" size="sm" className={`flex-1 sm:flex-none text-xs sm:text-sm ${viewMode === "kanban" ? "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white" : "text-red-600 border-red-200 hover:bg-red-50"}`} onClick={() => setViewMode("kanban")}>
                <Columns3 className="h-3.5 w-3.5 mr-1.5" /> Kanban
              </Button>
              <Button variant="outline" size="sm" className={`flex-1 sm:flex-none text-xs sm:text-sm ${viewMode === "grid" ? "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:text-white" : "text-red-600 border-red-200 hover:bg-red-50"}`} onClick={() => setViewMode("grid")}>
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" /> Grid
              </Button>
              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setIsGoalDialogOpen(true)}>
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> New Goal
              </Button>
            </div>
          </div>

          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {goalStatuses.map((status) => {
                const cols = getGoalsByStatus(status.key as Goal["status"]);
                const isHovered = hoveredStatus === status.key && dragState?.isDragging;
                return (
                  <div key={status.key} className="space-y-2">
                    <div className={`flex items-center justify-between rounded-xl border ${status.border} ${status.bg} px-3 py-2.5`}>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-sm">{status.icon}</span>
                        <h3 className="font-semibold text-foreground text-xs sm:text-sm">{status.label}</h3>
                      </div>
                      <span className="rounded-md bg-white border border-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">{cols.length}</span>
                    </div>
                    <div ref={(el) => { columnRefs.current[status.key] = el; }} className={`min-h-[420px] rounded-xl border p-3 sm:p-4 transition-all duration-150 ${isHovered ? `${status.hoverBg} ${status.hoverBorder} border-2 border-dashed shadow-lg scale-[1.015]` : `${status.bg} ${status.border} border`} ${dragState?.isDragging && !isHovered ? "opacity-70" : ""}`}>
                      {isHovered && (
                        <div className="mb-3 rounded-lg border-2 border-dashed border-gray-400 bg-white/70 h-14 flex items-center justify-center gap-2">
                          <div className="w-1.5 h-5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-7 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "80ms" }} />
                          <div className="w-1.5 h-4 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "160ms" }} />
                          <span className="text-xs text-gray-500 font-semibold ml-1">Drop here</span>
                        </div>
                      )}
                      <div className="space-y-3">
                        {cols.length === 0 && !dragState?.isDragging && (
                          <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <Target className="h-7 w-7 text-muted-foreground/25" />
                            <p className="text-xs text-muted-foreground">No goals yet</p>
                          </div>
                        )}
                        {cols.map((goal) => (
                          <Card key={goal.id} onPointerDown={(e) => handlePointerDown(e, goal.id)} className={`p-3 sm:p-4 relative group cursor-grab active:cursor-grabbing touch-none select-none hover:shadow-md transition-shadow ${dragState?.goalId === goal.id ? "opacity-30 scale-95" : ""}`}>
                            <p className="font-semibold text-sm sm:text-base text-foreground pr-16">{goal.title}</p>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Progress</span>
                                <span className="text-xs font-semibold text-primary">{goal.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-gradient-to-r from-blue-500 to-teal-500 h-2.5 rounded-full" style={{ width: `${goal.progress || 0}%` }} />
                              </div>
                            </div>
                            <EditBtn onClick={() => openEditGoal(goal)} />
                            <DelBtn onClick={() => handleDeleteGoal(goal.id)} loading={deletingGoalId === goal.id} />
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              {dragState?.isDragging && (
                <Card style={ghostStyle} className="bg-white p-2 sm:p-3 border-2 border-teal-500 rounded-xl">
                  <p className="text-xs sm:text-sm font-medium text-foreground opacity-90">{goals.find((g) => g.id === dragState.goalId)?.title}</p>
                </Card>
              )}
            </div>
          )}

          {viewMode === "grid" && (goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 px-4">
              <p className="text-sm text-muted-foreground">No goals yet. Create your first goal!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => (
                <Card key={goal.id} className="p-3 sm:p-4 relative group">
                  <p className="font-semibold text-sm sm:text-base text-foreground pr-16">{goal.title}</p>
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
                  <EditBtn onClick={() => openEditGoal(goal)} />
                  <DelBtn onClick={() => handleDeleteGoal(goal.id)} loading={deletingGoalId === goal.id} />
                </Card>
              ))}
            </div>
          ))}
        </TabsContent>

        {/* ── BELIEFS ── */}
        <TabsContent value="beliefs" className="space-y-4">
          <Card className="border-l-4 border-red-400 bg-red-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground">
              <strong>Identifying Limiting Beliefs:</strong> Write the belief, explore its origin, challenge it with evidence, and create an empowering alternative.
            </p>
          </Card>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl text-foreground">Limiting Beliefs</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Identify and reframe thoughts that hold you back</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsBeliefDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Belief
                </Button>
              </div>
              <div className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${beliefs.length === 0 ? "flex flex-col items-center justify-center py-12" : ""}`}>
                {beliefs.length === 0 ? (
                  <>
                    <Heart className="mb-3 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground text-center">No limiting beliefs recorded yet.</p>
                  </>
                ) : (
                  <div className="space-y-3">
                    {beliefs.map((b) => (
                      <Card key={b.id} className="p-3 sm:p-4 relative group cursor-pointer hover:border-pink-200 transition-colors" onClick={() => openEditBelief(b)}>
                        <p className="font-semibold text-sm text-foreground pr-16">{b.belief || b.statement || b.limiting_belief}</p>
                        <p className="text-xs sm:text-sm text-green-600 mt-2">💚 {b.alternative || b.reflection_data?.reframe}</p>
                        <EditBtn onClick={() => openEditBelief(b)} />
                        <DelBtn onClick={() => handleDeleteBelief(b.id)} />
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl text-foreground">Behavioral Patterns</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Understand and change your recurring actions</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsPatternDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Pattern
                </Button>
              </div>
              <div className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${patterns.length === 0 ? "flex flex-col items-center justify-center py-12" : ""}`}>
                {patterns.length === 0 ? (
                  <>
                    <Zap className="mb-3 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground text-center">No behavioral patterns recorded yet.</p>
                  </>
                ) : (
                  <div className="space-y-3">
                    {patterns.map((p) => (
                      <Card key={p.id} className="p-3 sm:p-4 relative group cursor-pointer hover:shadow-md transition-shadow" onClick={() => openPatternDetail(p.id)}>
                        <p className="font-semibold text-sm text-foreground pr-16">{p.name || p.recurring_behavior}</p>
                        <p className="text-xs sm:text-sm text-orange-600 mt-2">⚡ {p.alternative || p.pattern_data?.desired_behavior}</p>
                        <EditBtn onClick={() => openEditPattern(p)} />
                        <DelBtn onClick={() => handleDeletePattern(p.id)} />
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── AFFIRMATIONS ── */}
        <TabsContent value="affirmations" className="space-y-4">
          <Card className="border-l-4 border-purple-400 bg-purple-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground">
              <strong>Creating Powerful Affirmations:</strong> Write in present tense, use positive language, make it personal. Repeat daily.
            </p>
          </Card>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl text-foreground">Your Affirmations</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Positive statements that empower you daily</p>
              </div>
              <Button className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsAffirmationDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
            <div className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${affirmations.length === 0 ? "flex flex-col items-center justify-center py-16" : ""}`}>
              {affirmations.length === 0 ? (
                <>
                  <Sparkles className="mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground text-center">No affirmations yet.</p>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {affirmations.map((a) => (
                    <Card key={a.id} className="p-3 sm:p-4 relative group bg-purple-50 border-purple-200">
                      <p className="text-sm text-foreground pr-16 italic">"{a.statement || a.text}"</p>
                      {a.priority && <p className="text-xs text-purple-600 mt-2">⭐ Priority: {a.priority}</p>}
                      <EditBtn onClick={() => openEditAffirmation(a)} />
                      <DelBtn onClick={() => handleDeleteAffirmation(a.id)} />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── HABITS ── */}
        <TabsContent value="habits" className="space-y-4">
          <Card className="border-l-4 border-teal-400 bg-teal-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground">
              <strong>Building Lasting Habits:</strong> Start small and be consistent. Track completion to build streaks.
            </p>
          </Card>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl text-foreground">Habit Tracking</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Track your daily habits throughout the month</p>
              </div>
              <Button className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsHabitDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Habit
              </Button>
            </div>
            <div className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${habits.length === 0 ? "flex flex-col items-center justify-center py-16" : ""}`}>
              {habits.length === 0 ? (
                <>
                  <Zap className="mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground text-center">No habits yet.</p>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {habits.map((h) => (
                    <Card key={h.id} className="p-3 sm:p-4 relative group bg-teal-50 border-teal-200">
                      <p className="font-semibold text-sm text-foreground pr-16">{h.name}</p>
                      <p className="text-xs text-teal-600 mt-1 capitalize">⚡ {h.frequency}</p>
                      {h.time && <p className="text-xs text-gray-600 mt-1">🕐 {h.time}</p>}
                      <EditBtn onClick={() => openEditHabit(h)} />
                      <DelBtn onClick={() => handleDeleteHabit(h.id)} />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Action */}
      {currentFooter && shouldShowFooter() && (
        <div className="flex items-center justify-center pt-2 pb-1">
          <Button className={`h-8 rounded-md px-4 text-xs sm:text-sm font-semibold shadow-sm ${currentFooter.className}`} onClick={currentFooter.onClick}>
            <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
            <span className="truncate">{currentFooter.label}</span>
          </Button>
        </div>
      )}

      {/* ── DIALOGS ── */}

      {/* Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={(open) => { setIsGoalDialogOpen(open); if (!open) setEditingGoalId(null); }}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl sm:text-2xl">{editingGoalId !== null ? "✏️ Edit Goal" : "🎯 Create New Goal"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Goal Name *</Label><Input placeholder="e.g., Run a marathon..." value={goalName} onChange={(e) => setGoalName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Details..." rows={3} value={goalDescription} onChange={(e) => setGoalDescription(e.target.value)} /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={goalCategory} onValueChange={setGoalCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health & Fitness</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="personal">Personal Growth</SelectItem>
                    <SelectItem value="relationships">Relationships</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={goalStatus} onValueChange={(v) => setGoalStatus(v as Goal["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="started">Started</SelectItem>
                    <SelectItem value="progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={goalStartDate} onChange={(e) => setGoalStartDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Target Date</Label><Input type="date" value={goalTargetDate} onChange={(e) => setGoalTargetDate(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>Progress: {goalProgress}%</Label>
              <input type="range" min="0" max="100" step="5" value={goalProgress} onChange={(e) => setGoalProgress(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500" />
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full" style={{ width: `${goalProgress}%` }} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setIsGoalDialogOpen(false)} disabled={goalSaving}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={editingGoalId !== null ? handleUpdateGoal : handleCreateGoal} disabled={goalSaving || !goalName.trim()}>
                {goalSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : editingGoalId !== null ? "Update Goal" : "Create Goal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Belief Dialog */}
      <Dialog open={isBeliefDialogOpen} onOpenChange={(open) => { setIsBeliefDialogOpen(open); if (!open) { setEditingBeliefId(null); setBeliefAffirmationId("none"); } }}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl sm:text-2xl">{editingBeliefId !== null ? "✏️ Edit Belief" : "💭 Identify Limiting Belief"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Limiting Belief *</Label><Input placeholder="e.g., I'm not good enough..." value={beliefText} onChange={(e) => setBeliefText(e.target.value)} /></div>
            <div className="space-y-2"><Label>Origin (Optional)</Label><Textarea placeholder="Where does this belief come from?" rows={2} value={beliefOrigin} onChange={(e) => setBeliefOrigin(e.target.value)} /></div>
            <div className="space-y-2"><Label>Counter Evidence</Label><Textarea placeholder="What evidence challenges this belief?" rows={2} value={beliefEvidence} onChange={(e) => setBeliefEvidence(e.target.value)} /></div>
            <div className="space-y-2"><Label>Empowering Alternative *</Label><Input placeholder='"I am capable and growing"' value={beliefAlternative} onChange={(e) => setBeliefAlternative(e.target.value)} /></div>
            <div className="space-y-2 pt-2">
              <Label className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-gray-500" /> Link to Supporting Affirmation (Optional)</Label>
              <Select value={beliefAffirmationId || "none"} onValueChange={setBeliefAffirmationId}>
                <SelectTrigger><SelectValue placeholder="No affirmation linked" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No affirmation linked</SelectItem>
                  {affirmations.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.statement || a.text}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setIsBeliefDialogOpen(false)} disabled={beliefSaving}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={editingBeliefId !== null ? handleUpdateBelief : handleCreateBelief} disabled={beliefSaving || !beliefText.trim()}>
                {beliefSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : editingBeliefId !== null ? "Update Belief" : "Add Belief"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern Dialog */}
      <Dialog open={isPatternDialogOpen} onOpenChange={(open) => { setIsPatternDialogOpen(open); if (!open) setEditingPatternId(null); }}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">⚡ Identify Behavioral Pattern</DialogTitle>
            <DialogDescription className="text-orange-600">Understand recurring actions you want to change</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Recurring Behavior *</Label><Input placeholder="e.g., Procrastinating on important tasks..." value={patternName} onChange={(e) => setPatternName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Triggers</Label><Textarea placeholder="What triggers this behavior?" rows={2} value={patternTrigger} onChange={(e) => setPatternTrigger(e.target.value)} /></div>
            <div className="space-y-2"><Label>Underlying Reason</Label><Textarea placeholder="What underlying emotion drives this behavior?" rows={3} value={patternUnderlyingReason} onChange={(e) => setPatternUnderlyingReason(e.target.value)} /></div>
            <div className="space-y-2"><Label>Impact</Label><Textarea placeholder="How does this behavior impact your life?" rows={2} value={patternConsequence} onChange={(e) => setPatternConsequence(e.target.value)} /></div>
            <div className="space-y-2"><Label>Desired Behavior</Label><Textarea placeholder="What new behavior do you want to adopt?" rows={2} value={patternAlternative} onChange={(e) => setPatternAlternative(e.target.value)} /></div>
            <div className="space-y-2"><Label>Strategies for Change</Label><Textarea placeholder="What specific actions will you use?" rows={3} value={patternStrategies} onChange={(e) => setPatternStrategies(e.target.value)} /></div>
            <div className="space-y-2 pt-2">
              <Label className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-gray-500" /> Link Affirmation (Optional)</Label>
              <Select value={patternAffirmationId || "none"} onValueChange={setPatternAffirmationId}>
                <SelectTrigger><SelectValue placeholder="No affirmation linked" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No affirmation linked</SelectItem>
                  {affirmations.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.text || a.statement}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setIsPatternDialogOpen(false)} disabled={patternSaving}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={editingPatternId !== null ? handleUpdatePattern : handleCreatePattern} disabled={patternSaving || !patternName.trim()}>
                {patternSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : editingPatternId !== null ? "Update Pattern" : "Save Pattern"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern Detail Modal */}
      <Dialog open={isPatternDetailOpen} onOpenChange={setIsPatternDetailOpen}>
        <DialogContent className="w-[95vw] max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl sm:text-2xl">⚡ Pattern Details</DialogTitle></DialogHeader>
          {patternDetail && (
            <div className="space-y-4 py-4">
              <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-3"><p className="font-semibold text-base text-orange-900">{patternDetail.name}</p></div>
              {[
                { label: "Triggers", value: patternDetail.pattern_data?.triggers ?? patternDetail.trigger, color: "text-red-600", bg: "bg-red-50 border-red-100", emoji: "🔥" },
                { label: "Underlying Reason", value: patternDetail.pattern_data?.underlying_reason, color: "text-purple-700", bg: "bg-purple-50 border-purple-100", emoji: "🧠" },
                { label: "Impact", value: patternDetail.pattern_data?.impact ?? patternDetail.consequence, color: "text-rose-700", bg: "bg-rose-50 border-rose-100", emoji: "💥" },
                { label: "Desired Behavior", value: patternDetail.pattern_data?.desired_behavior ?? patternDetail.alternative, color: "text-green-700", bg: "bg-green-50 border-green-100", emoji: "✅" },
                { label: "Strategies", value: patternDetail.pattern_data?.strategies, color: "text-blue-700", bg: "bg-blue-50 border-blue-100", emoji: "💡" },
              ].filter((f) => f.value).map((field) => (
                <div key={field.label} className={`rounded-xl border px-4 py-3 ${field.bg}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${field.color}`}>{field.emoji} {field.label}</p>
                  <p className="text-sm text-gray-800">{field.value}</p>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => openEditPattern(patternDetail)}>
                  ✏️ Edit Pattern
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Affirmation Dialog */}
      <Dialog open={isAffirmationDialogOpen} onOpenChange={(open) => { setIsAffirmationDialogOpen(open); if (!open) setEditingAffirmationId(null); }}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl sm:text-2xl">{editingAffirmationId !== null ? "✏️ Edit Affirmation" : "✨ Create Affirmation"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Statement *</Label><Textarea placeholder='"I am confident..."' rows={3} value={affirmationStatement} onChange={(e) => setAffirmationStatement(e.target.value)} /></div>
            <div className="space-y-2"><Label>Priority (1-10)</Label><Input type="number" min="1" max="10" value={affirmationPriority} onChange={(e) => setAffirmationPriority(parseInt(e.target.value) || 5)} /></div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setIsAffirmationDialogOpen(false)} disabled={affirmationSaving}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={editingAffirmationId !== null ? handleUpdateAffirmation : handleCreateAffirmation} disabled={affirmationSaving || !affirmationStatement.trim()}>
                {affirmationSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : editingAffirmationId !== null ? "Update Affirmation" : "Add Affirmation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Habit Dialog */}
      <Dialog open={isHabitDialogOpen} onOpenChange={(open) => { setIsHabitDialogOpen(open); if (!open) setEditingHabitId(null); }}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl sm:text-2xl">{editingHabitId !== null ? "✏️ Edit Habit" : "✨ Create New Habit"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Habit Name *</Label><Input placeholder="e.g., Morning meditation..." value={habitName} onChange={(e) => setHabitName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Details..." rows={3} value={habitDescription} onChange={(e) => setHabitDescription(e.target.value)} /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={habitFrequency} onValueChange={(v) => setHabitFrequency(v as Habit["frequency"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">📅 Daily</SelectItem>
                    <SelectItem value="weekly">📆 Weekly</SelectItem>
                    <SelectItem value="custom">⚙️ Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={habitCategory} onValueChange={setHabitCategory}>
                  <SelectTrigger><SelectValue placeholder="Other" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">🏃 Health</SelectItem>
                    <SelectItem value="career">💼 Career</SelectItem>
                    <SelectItem value="personal">🌱 Growth</SelectItem>
                    <SelectItem value="other">📌 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label className="flex items-center gap-1"><Clock className="h-4 w-4 text-blue-500" /> Time</Label><Input placeholder="e.g., 7:00 AM" value={habitTime} onChange={(e) => setHabitTime(e.target.value)} /></div>
              <div className="space-y-2"><Label className="flex items-center gap-1"><MapPin className="h-4 w-4 text-blue-500" /> Place</Label><Input placeholder="e.g., Gym" value={habitPlace} onChange={(e) => setHabitPlace(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={habitStartDate} onChange={(e) => setHabitStartDate(e.target.value)} /></div>
            <div className="space-y-2 pt-2">
              <Label className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-blue-500" /> Link Goals</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {goals.map((goal) => (
                  <button key={goal.id} onClick={() => setHabitLinkedGoals((p) => p.includes(goal.id) ? p.filter((id) => id !== goal.id) : [...p, goal.id])} className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${habitLinkedGoals.includes(goal.id) ? "bg-red-50 border-red-200 text-red-700 font-medium" : "bg-white border-gray-200 text-gray-600 hover:bg-red-50"}`}>
                    {goal.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => { setIsHabitDialogOpen(false); setHabitLinkedGoals([]); }} disabled={habitSaving}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={editingHabitId !== null ? handleUpdateHabit : handleCreateHabit} disabled={habitSaving || !habitName.trim()}>
                {habitSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : editingHabitId !== null ? "Update Habit" : "Create Habit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsHabits;