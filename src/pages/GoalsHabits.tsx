import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Heart,
  Zap,
  Sparkles,
  Clock,
  MapPin,
  Target,
  GripVertical,
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
interface Goal {
  id: string;
  title: string;
  status: "planning" | "started" | "progress" | "completed";
  area?: string;
  progress?: number;
}

interface Belief {
  id: string | number;
  belief: string;
  statement?: string;
  limiting_belief?: string;
  user_id?: number;
  affirmation_id?: number | null;
  active?: number;
  changed_by?: number;
  created_at?: string;
  updated_at?: string;
  reflection_data?: {
    origin?: string;
    supporting_evidence?: string;
    contradicting_evidence?: string;
    impact?: string;
    reframe?: string;
  };
  origin?: string;
  evidence?: string;
  alternative: string;
}

interface Pattern {
  id: string | number;
  name: string;
  recurring_behavior?: string;
  trigger?: string;
  consequence?: string;
  alternative: string;
  pattern_data?: {
    triggers?: string;
    underlying_reason?: string;
    impact?: string;
    desired_behavior?: string;
    strategies?: string;
  };
  affirmation_id?: number | null;
  created_at?: string;
}

interface Affirmation {
  id: string;
  text?: string;
  statement?: string;
  category?: string;
  linkedBelief?: string;
  priority?: number;
}

interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency?: "daily" | "weekly" | "custom";
  category?: string;
  time?: string;
  place?: string;
  start_date?: string;
  target_date?: string;
  startDate?: string;
}

interface DragState {
  goalId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  cardWidth: number;
  cardHeight: number;
  isDragging: boolean;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const GoalsHabits = () => {
  const [selectedArea, setSelectedArea] = useState("all-areas");
  const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");
  const [activeTab, setActiveTab] = useState("goals");

  const [goals, setGoals] = useState<Goal[]>([]);
  const [beliefs, setBeliefs] = useState<Belief[]>([]);
  const [beliefsLoading, setBeliefsLoading] = useState(false);
  const [beliefsError, setBeliefsError] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [patternsLoading, setPatternsLoading] = useState(false);
  const [patternsError, setPatternsError] = useState<string | null>(null);

  // Detail modal
  const [patternDetail, setPatternDetail] = useState<Pattern | null>(null);
  const [patternDetailLoading, setPatternDetailLoading] = useState(false);
  const [isPatternDetailOpen, setIsPatternDetailOpen] = useState(false);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isBeliefDialogOpen, setIsBeliefDialogOpen] = useState(false);
  const [isPatternDialogOpen, setIsPatternDialogOpen] = useState(false);
  const [isAffirmationDialogOpen, setIsAffirmationDialogOpen] = useState(false);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);

  // Goal form
  const [goalName, setGoalName] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalCategory, setGoalCategory] = useState("");
  const [goalStatus, setGoalStatus] = useState<Goal["status"]>("planning");
  const [goalStartDate, setGoalStartDate] = useState("");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [goalProgress, setGoalProgress] = useState(0);

  // Form states for belief
  const [beliefText, setBeliefText] = useState("");
  const [beliefOrigin, setBeliefOrigin] = useState("");
  const [beliefSupportingEvidence, setBeliefSupportingEvidence] = useState("");
  const [beliefEvidence, setBeliefEvidence] = useState("");
  const [beliefImpact, setBeliefImpact] = useState("");
  const [beliefAlternative, setBeliefAlternative] = useState("");
  const [beliefSaving, setBeliefSaving] = useState(false);
  const [beliefSaveError, setBeliefSaveError] = useState<string | null>(null);
  const [editingBeliefId, setEditingBeliefId] = useState<
    string | number | null
  >(null);

  // Form states for pattern
  const [patternName, setPatternName] = useState("");
  const [patternTrigger, setPatternTrigger] = useState("");
  const [patternUnderlyingReason, setPatternUnderlyingReason] = useState("");
  const [patternConsequence, setPatternConsequence] = useState(""); // impact
  const [patternAlternative, setPatternAlternative] = useState(""); // desired_behavior
  const [patternStrategies, setPatternStrategies] = useState("");
  const [patternAffirmationId, setPatternAffirmationId] = useState<string>("");
  const [patternSaving, setPatternSaving] = useState(false);
  const [patternSaveError, setPatternSaveError] = useState<string | null>(null);
  const [editingPatternId, setEditingPatternId] = useState<
    string | number | null
  >(null);

  // Affirmation form
  const [affirmationStatement, setAffirmationStatement] = useState("");
  const [affirmationPriority, setAffirmationPriority] = useState(5);

  // Habit form
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [habitFrequency, setHabitFrequency] =
    useState<Habit["frequency"]>("daily");
  const [habitCategory, setHabitCategory] = useState("");
  const [habitTime, setHabitTime] = useState("");
  const [habitPlace, setHabitPlace] = useState("");
  const [habitStartDate, setHabitStartDate] = useState("");
  const [habitLinkedGoals, setHabitLinkedGoals] = useState<string[]>([]); // New state for linking goals

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const save = <T,>(key: string, items: T[]) =>
    localStorage.setItem(key, JSON.stringify(items));

  // ─── LOAD GOALS (GET) ───────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_goals");
        if (saved) setGoals(JSON.parse(saved));

        try {
          const res = await fetchWithAuth("/goals");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data)
              ? data
              : (data.goals ?? data.data ?? []);
            setGoals(list);
            save("user_goals", list);
          }
        } catch {
          console.log("Goals API unavailable, using local storage");
        }
      } catch {
        console.log("Using local storage for goals");
      }
    };
    load();
  }, []);

  // ─── LOAD BELIEFS (GET) ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_beliefs");
        if (saved) setBeliefs(JSON.parse(saved));

        try {
          const res = await fetchWithAuth("/limiting_beliefs");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data)
              ? data
              : (data.limiting_beliefs ?? data.data ?? []);
            setBeliefs(list);
            save("user_beliefs", list);
          }
        } catch {
          console.log("Beliefs API unavailable, using local storage");
        }
      } catch {
        console.log("Using local storage for beliefs");
      }
    };
    load();
  }, []);

  // ─── LOAD PATTERNS (GET) ─────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_patterns");
        if (saved) setPatterns(JSON.parse(saved));

        try {
          const res = await fetchWithAuth("/behavioral_patterns");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data)
              ? data
              : (data.behavioral_patterns ?? data.data ?? []);
            setPatterns(list);
            save("user_patterns", list);
          }
        } catch {
          console.log("Patterns API unavailable, using local storage");
        }
      } catch {
        console.log("Using local storage for patterns");
      }
    };
    load();
  }, []);

  // ─── LOAD AFFIRMATIONS (GET) ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_affirmations");
        if (saved) setAffirmations(JSON.parse(saved));

        try {
          const res = await fetchWithAuth("/affirmations");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data)
              ? data
              : (data.affirmations ?? data.data ?? []);
            setAffirmations(list);
            save("user_affirmations", list);
          }
        } catch {
          console.log("Affirmations API unavailable, using local storage");
        }
      } catch {
        console.log("Using local storage for affirmations");
      }
    };
    load();
  }, []);

  // ─── LOAD HABITS (GET) ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_habits");
        if (saved) setHabits(JSON.parse(saved));

        try {
          const res = await fetchWithAuth("/habits");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data)
              ? data
              : (data.habits ?? data.data ?? []);
            setHabits(list);
            save("user_habits", list);
          }
        } catch {
          console.log("Habits API unavailable, using local storage");
        }
      } catch {
        console.log("Using local storage for habits");
      }
    };
    load();
  }, []);

  // ─── GOALS CRUD ───────────────────────────────────────────────────────────
  const handleCreateGoal = async () => {
    if (!goalName.trim()) return;
    const payload = {
      goal: {
        title: goalName,
        description: goalDescription,
        category: goalCategory || "other",
        status: goalStatus,
        priority: "high", // Defaulting to high, or you can add a UI dropdown for this later
        progress: goalProgress,
        start_date: goalStartDate || null,
        target_date: goalTargetDate || null,
        end_date: goalTargetDate || null, // Using target_date as end_date
        core_value_ids: [], // Empty array by default
      },
    };

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: goalName,
      status: goalStatus,
      area: goalCategory,
      progress: goalProgress,
    };

    // Optimistic Update
    setGoals((prev) => {
      const u = [...prev, newGoal];
      save("user_goals", u);
      return u;
    });

    try {
      const res = await fetchWithAuth("/goals", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const d = await res.json();
        // Update temporary ID with actual DB ID silently
        const createdId = d.goal?.id ?? d.data?.id ?? d.id ?? newGoal.id;
        setGoals((prev) =>
          prev.map((g) => (g.id === newGoal.id ? { ...g, id: createdId } : g)),
        );
      } else {
        console.error("Goals API error:", res.status);
      }
    } catch (err) {
      console.error("Goals API unavailable:", err);
    }

    setGoalName("");
    setGoalDescription("");
    setGoalCategory("");
    setGoalStatus("planning");
    setGoalStartDate("");
    setGoalTargetDate("");
    setGoalProgress(0);
    setIsGoalDialogOpen(false);
  };

  const handleDeleteGoal = async (id: string) => {
    const removed = goals.find((g) => g.id === id);
    setGoals((prev) => {
      const u = prev.filter((g) => g.id !== id);
      save("user_goals", u);
      return u;
    });

    try {
      const res = await fetchWithAuth(`/goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
    } catch (error) {
      console.error("Failed to delete goal:", error);
      if (removed) {
        setGoals((prev) => {
          const u = [...prev, removed];
          save("user_goals", u);
          return u;
        });
      }
    }
  };

  const handleUpdateGoalStatus = useCallback(
    async (id: string, newStatus: string) => {
      setGoals((prev) => {
        const u = prev.map((g) =>
          g.id === id ? { ...g, status: newStatus as Goal["status"] } : g,
        );
        save("user_goals", u);
        return u;
      });

      try {
        const payload = {
          goal: {
            status: newStatus,
          },
        };

        const res = await fetchWithAuth(`/goals/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (!res.ok) console.error("Goals update API error:", res.status);
      } catch (err) {
        console.error("Failed to update goal:", err);
      }
    },
    [],
  );

  // ─── BELIEF HANDLERS ───────────────────────────────────────────────────
  const handleCreateBelief = async () => {
    if (!beliefText.trim()) return;

    setBeliefSaving(true);
    setBeliefSaveError(null);

    const tempId = `temp-${Date.now()}`;
    const optimistic: Belief = {
      id: tempId,
      belief: beliefText,
      alternative: beliefAlternative,
      reflection_data: {
        origin: beliefOrigin,
        supporting_evidence: beliefSupportingEvidence,
        contradicting_evidence: beliefEvidence,
        impact: beliefImpact,
        reframe: beliefAlternative,
      },
    };
    setBeliefs((prev) => [...prev, optimistic]);

    try {
      const res = await fetchWithAuth("/limiting_beliefs", {
        method: "POST",
        body: JSON.stringify({
          statement: beliefText,
          reflection_data: {
            origin: beliefOrigin,
            supporting_evidence: beliefSupportingEvidence,
            contradicting_evidence: beliefEvidence,
            impact: beliefImpact,
            reframe: beliefAlternative,
          },
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const created = await res.json();
      setBeliefs((prev) =>
        prev.map((b) =>
          b.id === tempId
            ? {
                ...created,
                belief:
                  created.statement ?? created.limiting_belief ?? beliefText,
                alternative:
                  created.reflection_data?.reframe ?? beliefAlternative,
              }
            : b,
        ),
      );

      setBeliefText("");
      setBeliefOrigin("");
      setBeliefSupportingEvidence("");
      setBeliefEvidence("");
      setBeliefImpact("");
      setBeliefAlternative("");
      setIsBeliefDialogOpen(false);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to save belief.";
      setBeliefSaveError(msg);
      setBeliefs((prev) => prev.filter((b) => b.id !== tempId));
    } finally {
      setBeliefSaving(false);
    }
  };

  const handleDeleteBelief = async (id: string | number) => {
    if (String(id).startsWith("temp-")) {
      setBeliefs((prev) => prev.filter((b) => b.id !== id));
      return;
    }

    const removed = beliefs.find((b) => b.id === id);
    setBeliefs((prev) => prev.filter((b) => b.id !== id));

    try {
      const res = await fetchWithAuth(`/limiting_beliefs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
    } catch (error) {
      console.error("Failed to delete belief:", error);
      if (removed) {
        setBeliefs((prev) => [...prev, removed]);
      }
    }
  };

  const openEditBelief = (belief: Belief) => {
    setEditingBeliefId(belief.id);
    setBeliefText(belief.statement ?? belief.belief ?? "");
    setBeliefOrigin(belief.reflection_data?.origin ?? belief.origin ?? "");
    setBeliefSupportingEvidence(
      belief.reflection_data?.supporting_evidence ?? "",
    );
    setBeliefEvidence(
      belief.reflection_data?.contradicting_evidence ?? belief.evidence ?? "",
    );
    setBeliefImpact(belief.reflection_data?.impact ?? "");
    setBeliefAlternative(
      belief.reflection_data?.reframe ?? belief.alternative ?? "",
    );
    setBeliefSaveError(null);
    setIsBeliefDialogOpen(true);
  };

  const handleUpdateBelief = async () => {
    if (!beliefText.trim() || editingBeliefId === null) return;

    setBeliefSaving(true);
    setBeliefSaveError(null);

    const previous = beliefs.find((b) => b.id === editingBeliefId);
    setBeliefs((prev) =>
      prev.map((b) =>
        b.id === editingBeliefId
          ? {
              ...b,
              belief: beliefText,
              statement: beliefText,
              alternative: beliefAlternative,
              reflection_data: {
                origin: beliefOrigin,
                supporting_evidence: beliefSupportingEvidence,
                contradicting_evidence: beliefEvidence,
                impact: beliefImpact,
                reframe: beliefAlternative,
              },
            }
          : b,
      ),
    );

    try {
      const res = await fetchWithAuth(`/limiting_beliefs/${editingBeliefId}`, {
        method: "PUT",
        body: JSON.stringify({
          statement: beliefText,
          reflection_data: {
            origin: beliefOrigin,
            supporting_evidence: beliefSupportingEvidence,
            contradicting_evidence: beliefEvidence,
            impact: beliefImpact,
            reframe: beliefAlternative,
          },
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const updated: Belief = await res.json();
      setBeliefs((prev) =>
        prev.map((b) =>
          b.id === editingBeliefId
            ? {
                ...updated,
                belief:
                  updated.statement ?? updated.limiting_belief ?? beliefText,
                alternative:
                  updated.reflection_data?.reframe ?? beliefAlternative,
              }
            : b,
        ),
      );

      setEditingBeliefId(null);
      setBeliefText("");
      setBeliefOrigin("");
      setBeliefSupportingEvidence("");
      setBeliefEvidence("");
      setBeliefImpact("");
      setBeliefAlternative("");
      setIsBeliefDialogOpen(false);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to update belief.";
      setBeliefSaveError(msg);
      if (previous) {
        setBeliefs((prev) =>
          prev.map((b) => (b.id === editingBeliefId ? previous : b)),
        );
      }
    } finally {
      setBeliefSaving(false);
    }
  };

  // ─── PATTERN HANDLERS ────────────────────────────────────────────────────
  const handleCreatePattern = async () => {
    if (!patternName.trim()) return;

    setPatternSaving(true);
    setPatternSaveError(null);

    const tempId = `temp-${Date.now()}`;
    const optimistic: Pattern = {
      id: tempId,
      name: patternName,
      trigger: patternTrigger,
      consequence: patternConsequence,
      alternative: patternAlternative,
      pattern_data: {
        triggers: patternTrigger,
        underlying_reason: patternUnderlyingReason,
        impact: patternConsequence,
        desired_behavior: patternAlternative,
        strategies: patternStrategies,
      },
      affirmation_id:
        patternAffirmationId && patternAffirmationId !== "none"
          ? Number(patternAffirmationId)
          : null,
    };
    setPatterns((prev) => [...prev, optimistic]);

    try {
      const res = await fetchWithAuth("/behavioral_patterns", {
        method: "POST",
        body: JSON.stringify({
          recurring_behavior: patternName,
          affirmation_id:
            patternAffirmationId && patternAffirmationId !== "none"
              ? Number(patternAffirmationId)
              : null,
          pattern_data: {
            triggers: patternTrigger,
            underlying_reason: patternUnderlyingReason,
            impact: patternConsequence,
            desired_behavior: patternAlternative,
            strategies: patternStrategies,
          },
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const created: Pattern = await res.json();
      setPatterns((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? {
                ...created,
                name: created.recurring_behavior ?? created.name ?? patternName,
                alternative:
                  created.pattern_data?.desired_behavior ?? patternAlternative,
                affirmation_id: created.affirmation_id,
              }
            : p,
        ),
      );

      setPatternName("");
      setPatternTrigger("");
      setPatternUnderlyingReason("");
      setPatternConsequence("");
      setPatternAlternative("");
      setPatternStrategies("");
      setPatternAffirmationId("");
      setIsPatternDialogOpen(false);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to save pattern.";
      setPatternSaveError(msg);
      setPatterns((prev) => prev.filter((p) => p.id !== tempId));
    } finally {
      setPatternSaving(false);
    }
  };

  const handleDeletePattern = async (id: string | number) => {
    if (String(id).startsWith("temp-")) {
      setPatterns((prev) => prev.filter((p) => p.id !== id));
      return;
    }

    const removed = patterns.find((p) => p.id === id);
    setPatterns((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetchWithAuth(`/behavioral_patterns/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
    } catch (error) {
      console.error("Failed to delete pattern:", error);
      if (removed) {
        setPatterns((prev) => [...prev, removed]);
      }
    }
  };

  const openEditPattern = (pattern: Pattern) => {
    setEditingPatternId(pattern.id);
    setPatternName(pattern.recurring_behavior ?? pattern.name ?? "");
    setPatternTrigger(pattern.pattern_data?.triggers ?? pattern.trigger ?? "");
    setPatternUnderlyingReason(pattern.pattern_data?.underlying_reason ?? "");
    setPatternConsequence(
      pattern.pattern_data?.impact ?? pattern.consequence ?? "",
    );
    setPatternAlternative(
      pattern.pattern_data?.desired_behavior ?? pattern.alternative ?? "",
    );
    setPatternStrategies(pattern.pattern_data?.strategies ?? "");
    setPatternAffirmationId(
      pattern.affirmation_id ? String(pattern.affirmation_id) : "none",
    );
    setPatternSaveError(null);
    setIsPatternDetailOpen(false);
    setIsPatternDialogOpen(true);
  };

  const handleUpdatePattern = async () => {
    if (!patternName.trim() || editingPatternId === null) return;

    setPatternSaving(true);
    setPatternSaveError(null);

    const previous = patterns.find((p) => p.id === editingPatternId);
    setPatterns((prev) =>
      prev.map((p) =>
        p.id === editingPatternId
          ? {
              ...p,
              name: patternName,
              recurring_behavior: patternName,
              alternative: patternAlternative,
              trigger: patternTrigger,
              consequence: patternConsequence,
              affirmation_id:
                patternAffirmationId && patternAffirmationId !== "none"
                  ? Number(patternAffirmationId)
                  : null,
              pattern_data: {
                triggers: patternTrigger,
                underlying_reason: patternUnderlyingReason,
                impact: patternConsequence,
                desired_behavior: patternAlternative,
                strategies: patternStrategies,
              },
            }
          : p,
      ),
    );

    try {
      const res = await fetchWithAuth(
        `/behavioral_patterns/${editingPatternId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            recurring_behavior: patternName,
            affirmation_id:
              patternAffirmationId && patternAffirmationId !== "none"
                ? Number(patternAffirmationId)
                : null,
            pattern_data: {
              triggers: patternTrigger,
              underlying_reason: patternUnderlyingReason,
              impact: patternConsequence,
              desired_behavior: patternAlternative,
              strategies: patternStrategies,
            },
          }),
        },
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const updated: Pattern = await res.json();
      setPatterns((prev) =>
        prev.map((p) =>
          p.id === editingPatternId
            ? {
                ...updated,
                name: updated.recurring_behavior ?? updated.name ?? patternName,
                alternative:
                  updated.pattern_data?.desired_behavior ?? patternAlternative,
                trigger: updated.pattern_data?.triggers ?? patternTrigger,
                consequence: updated.pattern_data?.impact ?? patternConsequence,
                affirmation_id: updated.affirmation_id,
              }
            : p,
        ),
      );

      setEditingPatternId(null);
      setPatternName("");
      setPatternTrigger("");
      setPatternUnderlyingReason("");
      setPatternConsequence("");
      setPatternAlternative("");
      setPatternStrategies("");
      setPatternAffirmationId("");
      setIsPatternDialogOpen(false);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to update pattern.";
      setPatternSaveError(msg);
      if (previous) {
        setPatterns((prev) =>
          prev.map((p) => (p.id === editingPatternId ? previous : p)),
        );
      }
    } finally {
      setPatternSaving(false);
    }
  };

  const openPatternDetail = (id: string | number) => {
    const p = patterns.find((pt) => pt.id === id);
    if (p) {
      setPatternDetail(p);
      setIsPatternDetailOpen(true);
    }
  };

  // ─── AFFIRMATIONS CRUD ────────────────────────────────────────────────────
  const handleCreateAffirmation = async () => {
    if (!affirmationStatement.trim()) return;
    const payload = {
      affirmation: {
        statement: affirmationStatement,
        priority: affirmationPriority,
      },
    };

    try {
      const res = await fetchWithAuth("/affirmations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        try {
          const listRes = await fetchWithAuth("/affirmations");
          if (listRes.ok) {
            const data = await listRes.json();
            const list = Array.isArray(data)
              ? data
              : (data.affirmations ?? data.data ?? []);
            setAffirmations(list);
            save("user_affirmations", list);
          }
        } catch (err) {
          console.error("Failed to refresh affirmations list:", err);
        }

        setAffirmationStatement("");
        setAffirmationPriority(5);
        setIsAffirmationDialogOpen(false);
      } else {
        alert(`Failed to create affirmation: ${res.status}`);
      }
    } catch (err) {
      alert("Failed to create affirmation. Please check your connection.");
    }
  };

  const handleDeleteAffirmation = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/affirmations/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        try {
          const listRes = await fetchWithAuth("/affirmations");
          if (listRes.ok) {
            const data = await listRes.json();
            const list = Array.isArray(data)
              ? data
              : (data.affirmations ?? data.data ?? []);
            setAffirmations(list);
            save("user_affirmations", list);
          }
        } catch (err) {
          console.error("Failed to refresh affirmations list:", err);
        }
      } else {
        alert(`Failed to delete affirmation: ${res.status}`);
      }
    } catch (err) {
      alert("Failed to delete affirmation. Please check your connection.");
    }
  };

  // ─── HABITS CRUD ──────────────────────────────────────────────────────────
  const handleCreateHabit = async () => {
    if (!habitName.trim()) return;
    const payload = {
      name: habitName,
      frequency: habitFrequency || "daily",
      description: habitDescription,
      category: habitCategory,
      time: habitTime,
      place: habitPlace,
      start_date: habitStartDate,
      linked_goals: habitLinkedGoals, // Sending linked goals logic
    };

    try {
      const res = await fetchWithAuth("/habits", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        try {
          const listRes = await fetchWithAuth("/habits");
          if (listRes.ok) {
            const data = await listRes.json();
            const list = Array.isArray(data)
              ? data
              : (data.habits ?? data.data ?? []);
            setHabits(list);
            save("user_habits", list);
          }
        } catch (err) {
          console.error("Failed to refresh habits list:", err);
        }

        setHabitName("");
        setHabitDescription("");
        setHabitFrequency("daily");
        setHabitCategory("");
        setHabitTime("");
        setHabitPlace("");
        setHabitStartDate("");
        setHabitLinkedGoals([]);
        setIsHabitDialogOpen(false);
      } else {
        alert(`Failed to create habit: ${res.status}`);
      }
    } catch (err) {
      alert("Failed to create habit. Please check your connection.");
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/habits/${id}`, { method: "DELETE" });

      if (res.ok) {
        try {
          const listRes = await fetchWithAuth("/habits");
          if (listRes.ok) {
            const data = await listRes.json();
            const list = Array.isArray(data)
              ? data
              : (data.habits ?? data.data ?? []);
            setHabits(list);
            save("user_habits", list);
          }
        } catch (err) {
          console.error("Failed to refresh habits list:", err);
        }
      } else {
        alert(`Failed to delete habit: ${res.status}`);
      }
    } catch (err) {
      alert("Failed to delete habit. Please check your connection.");
    }
  };

  // ─── Pointer Drag & Drop ──────────────────────────────────────────────────
  const getHoveredColumn = useCallback(
    (x: number, y: number): string | null => {
      for (const [key, el] of Object.entries(columnRefs.current)) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)
          return key;
      }
      return null;
    },
    [],
  );

  const handlePointerDown = (e: React.PointerEvent, goalId: string) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragState({
      goalId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      cardWidth: r.width,
      cardHeight: r.height,
      isDragging: false,
    });
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;
      const dist = Math.sqrt(
        (e.clientX - dragState.startX) ** 2 +
          (e.clientY - dragState.startY) ** 2,
      );
      if (dist > 6 || dragState.isDragging) {
        setDragState((p) =>
          p
            ? {
                ...p,
                currentX: e.clientX,
                currentY: e.clientY,
                isDragging: true,
              }
            : null,
        );
        setHoveredStatus(getHoveredColumn(e.clientX, e.clientY));
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      }
    },
    [dragState, getHoveredColumn],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;
      if (dragState.isDragging) {
        const target = getHoveredColumn(e.clientX, e.clientY);
        const goal = goals.find((g) => g.id === dragState.goalId);
        if (target && goal && goal.status !== target)
          handleUpdateGoalStatus(dragState.goalId, target);
      }
      setDragState(null);
      setHoveredStatus(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [dragState, goals, getHoveredColumn, handleUpdateGoalStatus],
  );

  const handlePointerCancel = useCallback(() => {
    setDragState(null);
    setHoveredStatus(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const ghostStyle = dragState?.isDragging
    ? {
        position: "fixed" as const,
        left: dragState.currentX - dragState.cardWidth / 2,
        top: dragState.currentY - dragState.cardHeight / 2,
        width: dragState.cardWidth,
        pointerEvents: "none" as const,
        zIndex: 9999,
        transform: "rotate(2deg) scale(1.04)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        transition: "none",
      }
    : undefined;

  // ─── Config ────────────────────────────────────────────────────────────────
  const goalStatuses = [
    {
      key: "planning",
      label: "Planning",
      icon: "🎯",
      bg: "bg-blue-50",
      border: "border-blue-200",
      hoverBg: "bg-blue-100",
      hoverBorder: "border-blue-500",
    },
    {
      key: "started",
      label: "Started",
      icon: "🚀",
      bg: "bg-purple-50",
      border: "border-purple-200",
      hoverBg: "bg-purple-100",
      hoverBorder: "border-purple-500",
    },
    {
      key: "progress",
      label: "Progress",
      icon: "📈",
      bg: "bg-orange-50",
      border: "border-orange-200",
      hoverBg: "bg-orange-100",
      hoverBorder: "border-orange-500",
    },
    {
      key: "completed",
      label: "Completed",
      icon: "✅",
      bg: "bg-teal-50",
      border: "border-teal-200",
      hoverBg: "bg-teal-100",
      hoverBorder: "border-teal-500",
    },
  ];

  const getGoalsByStatus = (s: Goal["status"]) =>
    goals.filter(
      (g) =>
        g.status === s &&
        (selectedArea === "all-areas" || g.area === selectedArea),
    );

  const areaLabels: Record<string, string> = {
    "all-areas": "Create Your First Goal",
    health: "Create Your Health & Fitness Goal",
    career: "Create Your Career Goal",
    personal: "Create Your Personal Growth Goal",
    relationships: "Create Your Relationships Goal",
    financial: "Create Your Financial Goal",
  };

  const footerConfig = {
    goals: {
      onClick: () => setIsGoalDialogOpen(true),
      label: areaLabels[selectedArea] || "Create Your First Goal",
      className: "bg-teal-500 hover:bg-teal-600 text-white",
      icon: <Target className="h-4 w-4 mr-2 shrink-0" />,
      emptyText: "No goals yet. Create your first goal!",
      emptyIcon: <Target className="h-10 w-10 text-gray-300" />,
    },
    beliefs: {
      onClick: () => setIsBeliefDialogOpen(true),
      label: "Identify Your First Belief",
      className: "bg-pink-500 hover:bg-pink-600 text-white",
      icon: <Heart className="h-4 w-4 mr-2 shrink-0" />,
      emptyText: "No limiting beliefs recorded yet.",
      emptyIcon: <Heart className="h-10 w-10 text-gray-300" />,
    },
    affirmations: {
      onClick: () => setIsAffirmationDialogOpen(true),
      label: "Add Your First Affirmation",
      className: "bg-purple-500 hover:bg-purple-600 text-white",
      icon: <Sparkles className="h-4 w-4 mr-2 shrink-0" />,
      emptyText: "No affirmations yet.",
      emptyIcon: <Sparkles className="h-10 w-10 text-gray-300" />,
    },
    habits: {
      onClick: () => setIsHabitDialogOpen(true),
      label: "Create Your First Habit",
      className: "bg-teal-500 hover:bg-teal-600 text-white",
      icon: <Zap className="h-4 w-4 mr-2 shrink-0" />,
      emptyText: "No habits yet. Start building better routines!",
      emptyIcon: <Zap className="h-10 w-10 text-gray-300" />,
    },
  };

  const currentFooter = footerConfig[activeTab as keyof typeof footerConfig];
  const draggingGoal = dragState
    ? goals.find((g) => g.id === dragState.goalId)
    : null;

  const DelBtn = ({ onClick }: { onClick: () => void }) => (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 relative min-h-screen pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl text-foreground">Goals & Habits</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Transform beliefs and achieve your aspirations
        </p>
      </div>

      <Card className="border-l-4 border-blue-400 bg-blue-50 p-3 sm:p-4">
        <p className="text-sm text-foreground">
          <strong>Setting SMART Goals:</strong> Create Specific, Measurable,
          Achievable, Relevant, and Time-bound goals. Break big goals into
          smaller milestones.
        </p>
      </Card>

      <Tabs
        defaultValue="goals"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-[280px] grid-cols-4">
            <TabsTrigger value="goals" className="text-xs sm:text-sm">
              Goals
            </TabsTrigger>
            <TabsTrigger value="beliefs" className="text-xs sm:text-sm">
              Beliefs
            </TabsTrigger>
            <TabsTrigger value="affirmations" className="text-xs sm:text-sm">
              Affirmations
            </TabsTrigger>
            <TabsTrigger value="habits" className="text-xs sm:text-sm">
              Habits
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── GOALS ── */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-full sm:w-48 text-sm">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
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
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                className="flex-1 sm:flex-none text-xs sm:text-sm"
                onClick={() => setViewMode("kanban")}
              >
                Kanban
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                className="flex-1 sm:flex-none text-xs sm:text-sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                size="sm"
                className="bg-teal-500 hover:bg-teal-600 text-white flex-1 sm:flex-none text-xs sm:text-sm"
                onClick={() => setIsGoalDialogOpen(true)}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                New Goal
              </Button>
            </div>
          </div>

          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {goalStatuses.map((status) => {
                const cols = getGoalsByStatus(status.key as Goal["status"]);
                const isHovered =
                  hoveredStatus === status.key && dragState?.isDragging;
                return (
                  <div key={status.key} className="space-y-2">
                    <div
                      className={`flex items-center justify-between rounded-xl border ${status.border} ${status.bg} px-2 sm:px-3 py-2`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-sm">{status.icon}</span>
                        <h3 className="font-semibold text-foreground text-xs sm:text-sm">
                          {status.label}
                        </h3>
                      </div>
                      <span className="rounded-md bg-white border border-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                        {cols.length}
                      </span>
                    </div>
                    <div
                      ref={(el) => {
                        columnRefs.current[status.key] = el;
                      }}
                      className={`min-h-56 sm:min-h-64 lg:min-h-80 rounded-xl border p-2 sm:p-3 lg:p-4 transition-all duration-150
                        ${isHovered ? `${status.hoverBg} ${status.hoverBorder} border-2 border-dashed shadow-lg scale-[1.015]` : `${status.bg} ${status.border} border`}
                        ${dragState?.isDragging && !isHovered ? "opacity-70" : ""}`}
                    >
                      {isHovered && (
                        <div className="mb-3 rounded-lg border-2 border-dashed border-gray-400 bg-white/70 h-14 flex items-center justify-center gap-2">
                          <div
                            className="w-1.5 h-5 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-1.5 h-7 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "80ms" }}
                          />
                          <div
                            className="w-1.5 h-4 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "160ms" }}
                          />
                          <span className="text-xs text-gray-500 font-semibold ml-1">
                            Drop here
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {dragState?.isDragging && (
                <Card
                  style={ghostStyle}
                  className="bg-white p-2 sm:p-3 border-2 border-teal-500 rounded-xl"
                >
                  <p className="text-xs sm:text-sm font-medium text-foreground opacity-90">
                    {goals.find((g) => g.id === dragState.goalId)?.title}
                  </p>
                </Card>
              )}
            </div>
          )}

          {viewMode === "grid" &&
            (goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 px-4">
                <p className="text-sm text-muted-foreground">
                  No goals yet. Create your first goal!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => (
                  <Card key={goal.id} className="p-3 sm:p-4 relative group">
                    <p className="font-semibold text-sm sm:text-base text-foreground pr-8">
                      {goal.title}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground capitalize mt-1">
                      {goal.status}
                    </p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">
                          Progress
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          {goal.progress || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-teal-500 h-2.5 rounded-full"
                          style={{ width: `${goal.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <DelBtn onClick={() => handleDeleteGoal(goal.id)} />
                  </Card>
                ))}
              </div>
            ))}
        </TabsContent>

        {/* ── BELIEFS ── */}
        <TabsContent value="beliefs" className="space-y-4">
          <Card className="border-l-4 border-red-400 bg-red-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground">
              <strong>Identifying Limiting Beliefs:</strong> Write the belief,
              explore its origin, challenge it with evidence, and create an
              empowering alternative.
            </p>
          </Card>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl text-foreground">
                    Limiting Beliefs
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Identify and reframe thoughts that hold you back
                  </p>
                </div>
                <Button
                  className="bg-pink-500 hover:bg-pink-600 text-white w-full sm:w-auto text-sm"
                  onClick={() => setIsBeliefDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Belief
                </Button>
              </div>
              <div
                className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${
                  beliefs.length === 0
                    ? "flex flex-col items-center justify-center py-12"
                    : ""
                }`}
              >
                {beliefs.length === 0 ? (
                  <>
                    <Heart className="mb-3 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground text-center">
                      No limiting beliefs recorded yet.
                    </p>
                  </>
                ) : (
                  <div className="space-y-3">
                    {beliefs.map((b) => (
                      <Card
                        key={b.id}
                        className="p-3 sm:p-4 relative group cursor-pointer hover:border-pink-200 transition-colors"
                        onClick={() => openEditBelief(b)}
                      >
                        <p className="font-semibold text-sm text-foreground pr-8">
                          {b.belief || b.statement || b.limiting_belief}
                        </p>
                        <p className="text-xs sm:text-sm text-green-600 mt-2">
                          💚 {b.alternative || b.reflection_data?.reframe}
                        </p>
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
                  <h2 className="text-lg sm:text-xl text-foreground">
                    Behavioral Patterns
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Understand and change your recurring actions
                  </p>
                </div>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto text-sm"
                  onClick={() => setIsPatternDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pattern
                </Button>
              </div>
              <div
                className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${
                  patterns.length === 0
                    ? "flex flex-col items-center justify-center py-12"
                    : ""
                }`}
              >
                {patterns.length === 0 ? (
                  <>
                    <Zap className="mb-3 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground text-center">
                      No behavioral patterns recorded yet.
                    </p>
                  </>
                ) : (
                  <div className="space-y-3">
                    {patterns.map((p) => (
                      <Card
                        key={p.id}
                        className="p-3 sm:p-4 relative group cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openPatternDetail(p.id)}
                      >
                        <p className="font-semibold text-sm text-foreground pr-12">
                          {p.name || p.recurring_behavior}
                        </p>
                        <p className="text-xs sm:text-sm text-orange-600 mt-2">
                          ⚡ {p.alternative || p.pattern_data?.desired_behavior}
                        </p>
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
              <strong>Creating Powerful Affirmations:</strong> Write in present
              tense, use positive language, make it personal. Repeat daily.
            </p>
          </Card>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl text-foreground">
                  Your Affirmations
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Positive statements that empower you daily
                </p>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  className="bg-purple-500 hover:bg-purple-600 text-white flex-1 sm:flex-none text-xs sm:text-sm"
                  onClick={() => setIsAffirmationDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
            <div
              className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${
                affirmations.length === 0
                  ? "flex flex-col items-center justify-center py-16"
                  : ""
              }`}
            >
              {affirmations.length === 0 ? (
                <>
                  <Sparkles className="mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground text-center">
                    No affirmations yet.
                  </p>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {affirmations.map((a) => (
                    <Card
                      key={a.id}
                      className="p-3 sm:p-4 relative group bg-purple-50 border-purple-200"
                    >
                      <p className="text-sm text-foreground pr-8 italic">
                        "{a.statement || a.text}"
                      </p>
                      {a.priority && (
                        <p className="text-xs text-purple-600 mt-2">
                          ⭐ Priority: {a.priority}
                        </p>
                      )}
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
              <strong>Building Lasting Habits:</strong> Start small and be
              consistent. Track completion to build streaks.
            </p>
          </Card>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl text-foreground">
                  Habit Tracking
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Track your daily habits throughout the month
                </p>
              </div>
              <Button
                className="bg-teal-500 hover:bg-teal-600 text-white w-full sm:w-auto text-sm"
                onClick={() => setIsHabitDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            </div>
            <Card className="border-l-4 border-blue-400 bg-blue-50 p-3">
              <p className="text-xs sm:text-sm text-foreground">
                💡 <strong>Tip:</strong> Track habits in{" "}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                  Daily Journal
                </span>{" "}
                and{" "}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                  Weekly Journal
                </span>
                .
              </p>
            </Card>
            <div
              className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${
                habits.length === 0
                  ? "flex flex-col items-center justify-center py-16"
                  : ""
              }`}
            >
              {habits.length === 0 ? (
                <>
                  <Zap className="mb-3 h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground text-center">
                    No habits yet.
                  </p>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {habits.map((h) => (
                    <Card
                      key={h.id}
                      className="p-3 sm:p-4 relative group bg-teal-50 border-teal-200"
                    >
                      <p className="font-semibold text-sm text-foreground pr-8">
                        {h.name}
                      </p>
                      <p className="text-xs text-teal-600 mt-1 capitalize">
                        ⚡ {h.frequency}
                      </p>
                      {h.time && (
                        <p className="text-xs text-gray-600 mt-1">
                          🕐 {h.time}
                        </p>
                      )}
                      <DelBtn onClick={() => handleDeleteHabit(h.id)} />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky Footer */}
      {currentFooter && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-3 py-2.5 flex items-center justify-center shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <Button
            className={`w-full max-w-sm text-xs sm:text-sm font-semibold rounded-lg h-9 sm:h-10 ${currentFooter.className}`}
            onClick={currentFooter.onClick}
          >
            {currentFooter.icon}
            <span className="truncate">{currentFooter.label}</span>
          </Button>
        </div>
      )}

      {/* Ghost card */}
      {dragState?.isDragging && draggingGoal && (
        <div style={ghostStyle}>
          <Card className="bg-white p-2 sm:p-3 border-2 border-teal-400">
            <div className="flex items-start gap-1.5">
              <GripVertical className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">
                {draggingGoal.title}
              </p>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full"
                style={{ width: `${draggingGoal.progress || 0}%` }}
              />
            </div>
          </Card>
        </div>
      )}

      {/* ── DIALOGS ── */}

      {/* Goal */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              🎯 Create New Goal
            </DialogTitle>
            <DialogDescription className="sr-only">
              Form to create a new goal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Goal Name *</Label>
              <Input
                placeholder="e.g., Run a marathon..."
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Details..."
                rows={3}
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={goalCategory} onValueChange={setGoalCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
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
                <Select
                  value={goalStatus}
                  onValueChange={(v) => setGoalStatus(v as Goal["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={goalStartDate}
                  onChange={(e) => setGoalStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Progress: {goalProgress}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={goalProgress}
                onChange={(e) => setGoalProgress(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsGoalDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-teal-500 hover:bg-teal-600 text-white"
                onClick={handleCreateGoal}
              >
                Create Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Belief */}
      <Dialog
        open={isBeliefDialogOpen}
        onOpenChange={(open) => {
          setIsBeliefDialogOpen(open);
          if (!open) {
            setBeliefSaveError(null);
            setEditingBeliefId(null);
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              {editingBeliefId !== null
                ? "✏️ Edit Belief"
                : "💭 Identify Limiting Belief"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Form to identify or edit a limiting belief
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Limiting Belief *</Label>
              <Input
                placeholder="e.g., I'm not good enough..."
                value={beliefText}
                onChange={(e) => setBeliefText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Origin (Optional)</Label>
              <Textarea
                placeholder="Where does this belief come from?"
                rows={2}
                value={beliefOrigin}
                onChange={(e) => setBeliefOrigin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Counter Evidence</Label>
              <Textarea
                placeholder="What evidence challenges this belief?"
                rows={2}
                value={beliefEvidence}
                onChange={(e) => setBeliefEvidence(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Empowering Alternative *</Label>
              <Input
                placeholder='"I am capable and growing"'
                value={beliefAlternative}
                onChange={(e) => setBeliefAlternative(e.target.value)}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsBeliefDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={
                  editingBeliefId !== null
                    ? handleUpdateBelief
                    : handleCreateBelief
                }
                disabled={beliefSaving || !beliefText.trim()}
              >
                {editingBeliefId !== null ? "Update Belief" : "Add Belief"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern Modal (Updated to match the video) */}
      <Dialog
        open={isPatternDialogOpen}
        onOpenChange={(open) => {
          setIsPatternDialogOpen(open);
          if (!open) {
            setPatternSaveError(null);
            setEditingPatternId(null);
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              ⚡ Identify Behavioral Pattern
            </DialogTitle>
            <DialogDescription className="text-orange-600">
              Understand recurring actions you want to change
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Inline error */}
            {patternSaveError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                {patternSaveError}
              </div>
            )}

            <div className="space-y-2">
              <Label>Recurring Behavior *</Label>
              <Input
                placeholder="e.g., Procrastinating on important tasks..."
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Triggers</Label>
              <Textarea
                placeholder="What triggers this behavior? (e.g., 'Feeling overwhelmed, late at night')"
                rows={2}
                value={patternTrigger}
                onChange={(e) => setPatternTrigger(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Underlying Reason</Label>
              <Textarea
                placeholder="What underlying emotion, belief, or need drives this behavior? (e.g., 'Fear of failure', 'Need for control', 'Seeking validation')"
                rows={3}
                value={patternUnderlyingReason}
                onChange={(e) => setPatternUnderlyingReason(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Impact</Label>
              <Textarea
                placeholder="How does this behavior impact your life and goals? (e.g., 'Miss deadlines', 'Damage relationships', 'Lower self-esteem')"
                rows={2}
                value={patternConsequence}
                onChange={(e) => setPatternConsequence(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Desired Behavior</Label>
              <Textarea
                placeholder="What new, more constructive behavior do you want to adopt instead? (e.g., 'Start tasks immediately', 'Respond calmly and assertively')"
                rows={2}
                value={patternAlternative}
                onChange={(e) => setPatternAlternative(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Strategies for Change</Label>
              <Textarea
                placeholder="What specific actions or strategies will you use to implement the desired behavior? (e.g., 'Use the 5-minute rule', 'Practice deep breathing before responding')"
                rows={3}
                value={patternStrategies}
                onChange={(e) => setPatternStrategies(e.target.value)}
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-gray-500" />
                Link to Supporting Affirmation (Optional)
              </Label>
              <p className="text-xs text-gray-500 mb-1">
                Link an existing affirmation that supports your desired behavior
                change
              </p>
              <Select
                value={patternAffirmationId || "none"}
                onValueChange={setPatternAffirmationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No affirmation linked" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No affirmation linked</SelectItem>
                  {affirmations.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.text || a.statement}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPatternDialogOpen(false)}
                disabled={patternSaving}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={
                  editingPatternId !== null
                    ? handleUpdatePattern
                    : handleCreatePattern
                }
                disabled={patternSaving || !patternName.trim()}
              >
                {patternSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : editingPatternId !== null ? (
                  "Update Pattern"
                ) : (
                  "Save Pattern"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern Detail View Modal */}
      <Dialog open={isPatternDetailOpen} onOpenChange={setIsPatternDetailOpen}>
        <DialogContent className="w-[95vw] max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              ⚡ Pattern Details
            </DialogTitle>
          </DialogHeader>
          {patternDetail && (
            <div className="space-y-4 py-4">
              <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
                <p className="font-semibold text-base text-orange-900">
                  {patternDetail.name}
                </p>
              </div>

              {(
                [
                  {
                    label: "Triggers",
                    value:
                      patternDetail.pattern_data?.triggers ??
                      patternDetail.trigger,
                    color: "text-red-600",
                    bg: "bg-red-50 border-red-100",
                    emoji: "🔥",
                  },
                  {
                    label: "Underlying Reason",
                    value: patternDetail.pattern_data?.underlying_reason,
                    color: "text-purple-700",
                    bg: "bg-purple-50 border-purple-100",
                    emoji: "🧠",
                  },
                  {
                    label: "Impact",
                    value:
                      patternDetail.pattern_data?.impact ??
                      patternDetail.consequence,
                    color: "text-rose-700",
                    bg: "bg-rose-50 border-rose-100",
                    emoji: "💥",
                  },
                  {
                    label: "Desired Behavior",
                    value:
                      patternDetail.pattern_data?.desired_behavior ??
                      patternDetail.alternative,
                    color: "text-green-700",
                    bg: "bg-green-50 border-green-100",
                    emoji: "✅",
                  },
                  {
                    label: "Strategies",
                    value: patternDetail.pattern_data?.strategies,
                    color: "text-blue-700",
                    bg: "bg-blue-50 border-blue-100",
                    emoji: "💡",
                  },
                ] as Array<{
                  label: string;
                  value?: string;
                  color: string;
                  bg: string;
                  emoji: string;
                }>
              )
                .filter((f) => f.value)
                .map((field) => (
                  <div
                    key={field.label}
                    className={`rounded-xl border px-4 py-3 ${field.bg}`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide mb-1 ${field.color}`}
                    >
                      {field.emoji} {field.label}
                    </p>
                    <p className="text-sm text-gray-800">{field.value}</p>
                  </div>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Affirmation */}
      <Dialog
        open={isAffirmationDialogOpen}
        onOpenChange={setIsAffirmationDialogOpen}
      >
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              ✨ Create Affirmation
            </DialogTitle>
            <DialogDescription className="sr-only">
              Form to create a new affirmation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Statement *</Label>
              <Textarea
                placeholder='"I am confident..."'
                rows={3}
                value={affirmationStatement}
                onChange={(e) => setAffirmationStatement(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                placeholder="5"
                value={affirmationPriority}
                onChange={(e) =>
                  setAffirmationPriority(parseInt(e.target.value) || 5)
                }
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAffirmationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={handleCreateAffirmation}
              >
                Add Affirmation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Habit */}
      <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              ✨ Create New Habit
            </DialogTitle>
            <DialogDescription className="text-teal-600">
              Build lasting routines that align with your goals
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Habit Name *</Label>
              <Input
                placeholder="e.g., Morning meditation, Exercise, Read for 30min..."
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What does this habit involve?"
                rows={3}
                value={habitDescription}
                onChange={(e) => setHabitDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={habitFrequency}
                  onValueChange={(v) =>
                    setHabitFrequency(v as Habit["frequency"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Other" />
                  </SelectTrigger>
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
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Time (Optional)
                </Label>
                <Input
                  placeholder="e.g., 7:00 AM, Morning, Evening"
                  value={habitTime}
                  onChange={(e) => setHabitTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Place (Optional)
                </Label>
                <Input
                  placeholder="e.g., Gym, Home, Office"
                  value={habitPlace}
                  onChange={(e) => setHabitPlace(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={habitStartDate}
                onChange={(e) => setHabitStartDate(e.target.value)}
              />
            </div>

            {/* NEW: Link to Goals Section */}
            <div className="space-y-2 pt-2">
              <Label className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-blue-500" />
                Link to Goals (Optional)
              </Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => {
                      setHabitLinkedGoals((prev) =>
                        prev.includes(goal.id)
                          ? prev.filter((id) => id !== goal.id)
                          : [...prev, goal.id],
                      );
                    }}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      habitLinkedGoals.includes(goal.id)
                        ? "bg-blue-50 border-blue-200 text-blue-700 font-medium"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {goal.title}
                  </button>
                ))}
                {goals.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    No active goals to link.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsHabitDialogOpen(false);
                  setHabitLinkedGoals([]); // Reset on cancel
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-teal-500 hover:bg-teal-600 text-white"
                onClick={handleCreateHabit}
              >
                Create Habit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsHabits;
