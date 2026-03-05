import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Heart,
  Zap,
  Sparkles,
  Clock,
  MapPin,
  Target,
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
  progress?: number; // 0-100
}

interface Belief {
  id: string | number;
  // Normalised display field (resolved from API `statement`)
  belief: string;
  // --- Real API response fields ---
  statement?: string; // primary text field from API
  limiting_belief?: string; // legacy fallback
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
  // Local-only fallback fields
  origin?: string;
  evidence?: string;
  alternative: string;
}

interface Pattern {
  id: string | number;
  name: string; // normalised from recurring_behavior
  recurring_behavior?: string; // API field
  trigger?: string;
  consequence?: string;
  alternative: string; // normalised from pattern_data.desired_behavior
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
  text: string;
  category?: string;
  linkedBelief?: string;
}

interface Habit {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  target_date?: string;
}
// (Duplicate interface declarations removed — see primary definitions above)
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
interface Belief {
  id: string;
  belief: string;
  origin?: string;
  evidence?: string;
  alternative: string;
}
interface Pattern {
  id: string;
  name: string;
  trigger?: string;
  consequence?: string;
  alternative: string;
}
interface Affirmation {
  id: string;
  statement: string;
  priority?: number;
}
interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "custom";
  category?: string;
  time?: string;
  place?: string;
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

// ─── Component ────────────────────────────────────────────────────────────────
const GoalsHabits = () => {
  const [activeTab, setActiveTab] = useState("goals");
  const [selectedArea, setSelectedArea] = useState("all-areas");
  const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");
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
  const [beliefEvidence, setBeliefEvidence] = useState(""); // contradicting evidence
  const [beliefImpact, setBeliefImpact] = useState("");
  const [beliefAlternative, setBeliefAlternative] = useState(""); // reframe
  const [beliefSaving, setBeliefSaving] = useState(false);
  const [beliefSaveError, setBeliefSaveError] = useState<string | null>(null);
  // null = create mode, id = edit mode
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
  // null = create mode, id = edit mode
  const [editingPatternId, setEditingPatternId] = useState<
    string | number | null
  >(null);

  // Affirmation form
  const [affirmationText, setAffirmationText] = useState("");
  const [affirmationCategory, setAffirmationCategory] = useState("");
  const [affirmationBelief, setAffirmationBelief] = useState("");
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

  // Drag
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ─── LOAD GOALS (mirrors Todos pattern exactly) ───────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_goals");
        if (saved) {
          setGoals(JSON.parse(saved));
          return;
        }
        try {
          const res = await fetchWithAuth("/goals");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data)
              ? data
              : (data.goals ?? data.data ?? []);
            setGoals(list);
            localStorage.setItem("user_goals", JSON.stringify(list));
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

  // Load beliefs from API — GET /limiting_beliefs
  const loadBeliefs = async () => {
    setBeliefsLoading(true);
    setBeliefsError(null);
    try {
      const res = await fetchWithAuth("/limiting_beliefs");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      // API always returns an array (may be empty [])
      const list: Belief[] = Array.isArray(data)
        ? data
        : (data.limiting_beliefs ?? data.data ?? []);
      // Normalise: API uses `statement` as the main text field
      setBeliefs(
        list.map((b) => ({
          ...b,
          belief: b.statement ?? b.limiting_belief ?? b.belief ?? "",
          alternative: b.reflection_data?.reframe ?? b.alternative ?? "",
        })),
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load beliefs.";
      setBeliefsError(msg);
      // Fall back to localStorage on network/server error
      try {
        const saved = localStorage.getItem("user_beliefs");
        if (saved) setBeliefs(JSON.parse(saved));
      } catch {
        // ignore
      }
    } finally {
      setBeliefsLoading(false);
    }
  };

  // Load patterns from API
  const loadPatterns = async () => {
    setPatternsLoading(true);
    setPatternsError(null);
    try {
      const res = await fetchWithAuth("/behavioral_patterns");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      const list: Pattern[] = Array.isArray(data)
        ? data
        : (data.behavioral_patterns ?? data.data ?? []);

      setPatterns(
        list.map((p) => ({
          ...p,
          name: p.recurring_behavior ?? p.name ?? "",
          alternative: p.pattern_data?.desired_behavior ?? p.alternative ?? "",
          trigger: p.pattern_data?.triggers ?? p.trigger,
          consequence: p.pattern_data?.impact ?? p.consequence,
          affirmation_id: p.affirmation_id,
        })),
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load patterns.";
      setPatternsError(msg);
      // Fall back to localStorage on network error
      try {
        const saved = localStorage.getItem("user_patterns");
        if (saved) setPatterns(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    } finally {
      setPatternsLoading(false);
    }
  };

  /** GET /behavioral_patterns/:id — fetch full detail and open modal */
  const openPatternDetail = async (id: string | number) => {
    setIsPatternDetailOpen(true);
    setPatternDetailLoading(true);
    setPatternDetail(null);
    try {
      const res = await fetchWithAuth(`/behavioral_patterns/${id}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      // API wraps response: { pattern: {...} }
      const raw: Pattern = json.pattern ?? json;
      setPatternDetail({
        ...raw,
        name: raw.recurring_behavior ?? raw.name ?? "",
        alternative:
          raw.pattern_data?.desired_behavior ?? raw.alternative ?? "",
        trigger: raw.pattern_data?.triggers ?? raw.trigger,
        consequence: raw.pattern_data?.impact ?? raw.consequence,
        affirmation_id: raw.affirmation_id,
      });
    } catch (err: unknown) {
      console.error("GET /behavioral_patterns/:id failed:", err);
      // Fallback: use already-loaded list data
      const found = patterns.find((p) => p.id === id);
      if (found) setPatternDetail(found);
    } finally {
      setPatternDetailLoading(false);
    }
  };

  // Load beliefs, patterns, affirmations, habits
  useEffect(() => {
    const loadData = async () => {
      // Load Affirmations (localStorage only)
      try {
        const savedAffirmations = localStorage.getItem("user_affirmations");
        if (savedAffirmations) {
          setAffirmations(JSON.parse(savedAffirmations));
        }
      } catch (e) {
        console.log("Error loading affirmations from storage");
      }

      // Load Habits (localStorage only)
      try {
        const savedHabits = localStorage.getItem("user_habits");
        if (savedHabits) {
          setHabits(JSON.parse(savedHabits));
        }
      } catch (e) {
        console.log("Error loading habits from storage");
      }
    };

    loadData();
    loadBeliefs(); // Fetch from API
    loadPatterns(); // Fetch from API
  }, []);

  // ─── LOAD AFFIRMATIONS ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_affirmations");
        if (saved) {
          setAffirmations(JSON.parse(saved));
          return;
        }
        try {
          const res = await fetchWithAuth("/affirmations");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data)
              ? data
              : (data.affirmations ?? data.data ?? []);
            setAffirmations(list);
            localStorage.setItem("user_affirmations", JSON.stringify(list));
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

  // ─── LOAD HABITS ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const saved = localStorage.getItem("user_habits");
        if (saved) {
          setHabits(JSON.parse(saved));
          return;
        }
        try {
          const res = await fetchWithAuth("/habits");
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data)
              ? data
              : (data.habits ?? data.data ?? []);
            setHabits(list);
            localStorage.setItem("user_habits", JSON.stringify(list));
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

  const save = <T,>(key: string, items: T[]) =>
    localStorage.setItem(key, JSON.stringify(items));

  // ─── GOALS CRUD ───────────────────────────────────────────────────────────
  const handleCreateGoal = async () => {
    if (!goalName.trim()) return;
    const payload = {
      title: goalName,
      description: goalDescription,
      status: goalStatus,
      area: goalCategory,
      start_date: goalStartDate,
      target_date: goalTargetDate,
    };
    const newGoal: Goal = { id: crypto.randomUUID(), ...payload };
    try {
      try {
        const res = await fetchWithAuth("/goals", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const d = await res.json();
          newGoal.id = d.id || d._id || d.data?.id || newGoal.id;
          console.log("Goal created:", d);
        } else {
          try {
            const errorText = await res.text();
            console.error("Goals API error:", res.status, errorText);
          } catch {
            console.error("Goals API error:", res.status, res.statusText);
          }
        }
      } catch (err) {
        console.error("Goals API unavailable:", err);
      }
      setGoals((prev) => {
        const u = [...prev, newGoal];
        save("user_goals", u);
        return u;
      });
    } catch (e) {
      console.error("Failed to create goal:", e);
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
    try {
      try {
        const res = await fetchWithAuth(`/goals/${id}`, { method: "DELETE" });
        if (!res.ok) {
          try {
            const errorText = await res.text();
            console.log("Goals delete API error:", res.status, errorText);
          } catch {
            console.log("Goals delete API error:", res.status, res.statusText);
          }
        }
      } catch (err) {
        console.log("API unavailable, deleting locally", err);
      }
      setGoals((prev) => {
        const u = prev.filter((g) => g.id !== id);
        save("user_goals", u);
        return u;
      });
    } catch (e) {
      console.error("Failed to delete goal:", e);
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
        const res = await fetchWithAuth(`/goals/${id}`, {
          method: "PUT",
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          console.error("Goals update API error:", res.status);
        }
      } catch (err) {
        console.error("Failed to update goal:", err);
      }
    },
    [],
  );

  // Belief handlers — POST to API
  const handleCreateBelief = async () => {
    if (!beliefText.trim()) return;

    setBeliefSaving(true);
    setBeliefSaveError(null);

    // Optimistic placeholder
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

      if (!res.ok) {
        const errText = await res.text();
        console.error("POST /limiting_beliefs failed:", errText);
        throw new Error(`Server error: ${res.status}`);
      }

      const created = await res.json();
      // Replace optimistic entry with real server response
      // API returns: { id, statement, reflection_data, user_id, active, ... }
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

      // Reset form
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
      // Roll back optimistic entry
      setBeliefs((prev) => prev.filter((b) => b.id !== tempId));
    } finally {
      setBeliefSaving(false);
    }
  };

  const handleDeleteBelief = async (id: string | number) => {
    // Skip API call for temp/local-only ids (those created before API existed)
    if (String(id).startsWith("temp-")) {
      setBeliefs((prev) => prev.filter((b) => b.id !== id));
      return;
    }

    // Optimistic removal
    const removed = beliefs.find((b) => b.id === id);
    setBeliefs((prev) => prev.filter((b) => b.id !== id));

    try {
      const res = await fetchWithAuth(`/limiting_beliefs/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("DELETE /limiting_beliefs failed:", errText);
        throw new Error(`Server error: ${res.status}`);
      }
      // Success — response is { message: "Deleted successfully" }, nothing more to do
    } catch (error) {
      console.error("Failed to delete belief:", error);
      // Roll back — put removed belief back in list
      if (removed) {
        setBeliefs((prev) => [...prev, removed]);
      }
    }
  };

  /** Pre-fill dialog form from an existing belief for editing */
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

  /** PUT /limiting_beliefs/:id */
  const handleUpdateBelief = async () => {
    if (!beliefText.trim() || editingBeliefId === null) return;

    setBeliefSaving(true);
    setBeliefSaveError(null);

    // Optimistic patch in-place
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

      if (!res.ok) {
        const errText = await res.text();
        console.error("PUT /limiting_beliefs failed:", errText);
        throw new Error(`Server error: ${res.status}`);
      }

      const updated: Belief = await res.json();
      // Merge real server response
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

      // Reset form
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
      // Roll back to previous value
      if (previous) {
        setBeliefs((prev) =>
          prev.map((b) => (b.id === editingBeliefId ? previous : b)),
        );
      }
    } finally {
      setBeliefSaving(false);
    }
  };

  // Pattern handlers — POST to API
  const handleCreatePattern = async () => {
    if (!patternName.trim()) return;

    setPatternSaving(true);
    setPatternSaveError(null);

    // Optimistic placeholder
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

      if (!res.ok) {
        const errText = await res.text();
        console.error("POST /behavioral_patterns failed:", errText);
        throw new Error(`Server error: ${res.status}`);
      }

      const created: Pattern = await res.json();
      // Replace optimistic entry with real response
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

      // Reset form
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
      // Roll back optimistic entry
      setPatterns((prev) => prev.filter((p) => p.id !== tempId));
    } finally {
      setPatternSaving(false);
    }
  };

  const handleDeletePattern = async (id: string | number) => {
    // Skip API call for temp/local-only ids
    if (String(id).startsWith("temp-")) {
      setPatterns((prev) => prev.filter((p) => p.id !== id));
      return;
    }

    // Optimistic removal
    const removed = patterns.find((p) => p.id === id);
    setPatterns((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetchWithAuth(`/behavioral_patterns/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("DELETE /behavioral_patterns failed:", errText);
        throw new Error(`Server error: ${res.status}`);
      }
      // Success — response is { message: "Deleted successfully" }, nothing more to do
    } catch (error) {
      console.error("Failed to delete pattern:", error);
      // Roll back — restore removed pattern
      if (removed) {
        setPatterns((prev) => [...prev, removed]);
      }
    }
  };

  /** Pre-fill dialog form from an existing pattern for editing */
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
    setIsPatternDetailOpen(false); // close detail modal if open
    setIsPatternDialogOpen(true);
  };

  /** PUT /behavioral_patterns/:id */
  const handleUpdatePattern = async () => {
    if (!patternName.trim() || editingPatternId === null) return;

    setPatternSaving(true);
    setPatternSaveError(null);

    // Optimistic in-place update
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

      if (!res.ok) {
        const errText = await res.text();
        console.error("PUT /behavioral_patterns failed:", errText);
        throw new Error(`Server error: ${res.status}`);
      }

      const updated: Pattern = await res.json();
      // Merge real server response
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

      // Reset form
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
      // Roll back to previous
      if (previous) {
        setPatterns((prev) =>
          prev.map((p) => (p.id === editingPatternId ? previous : p)),
        );
      }
    } finally {
      setPatternSaving(false);
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

    console.log("Creating affirmation with payload:", JSON.stringify(payload));

    try {
      const res = await fetchWithAuth("/affirmations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log("Affirmation API response status:", res.status);

      if (res.ok) {
        const d = await res.json();
        console.log("Affirmation created successfully:", d);

        // Fetch updated list from server
        try {
          const listRes = await fetchWithAuth("/affirmations");
          if (listRes.ok) {
            const data = await listRes.json();
            const list = Array.isArray(data)
              ? data
              : (data.affirmations ?? data.data ?? []);
            setAffirmations(list);
            save("user_affirmations", list);
            console.log("Affirmations list refreshed:", list);
          }
        } catch (err) {
          console.error("Failed to refresh affirmations list:", err);
        }

        setAffirmationStatement("");
        setAffirmationPriority(5);
        setIsAffirmationDialogOpen(false);
      } else {
        try {
          const errorText = await res.text();
          console.error("Affirmations API error:", res.status, errorText);
          alert(`Failed to create affirmation: ${res.status}`);
        } catch {
          console.error("Affirmations API error:", res.status, res.statusText);
          alert(
            `Failed to create affirmation: ${res.status} ${res.statusText}`,
          );
        }
      }
    } catch (err) {
      console.error("Affirmations API request failed:", err);
      alert("Failed to create affirmation. Please check your connection.");
    }
  };

  const handleUpdateAffirmation = async (
    id: string,
    statement: string,
    priority: number,
  ) => {
    const payload = { affirmation: { statement, priority } };
    try {
      const res = await fetchWithAuth(`/affirmations/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const d = await res.json();
        console.log("Affirmation updated:", d);
        setAffirmations((prev) => {
          const u = prev.map((a) =>
            a.id === id ? { ...a, statement, priority } : a,
          );
          save("user_affirmations", u);
          return u;
        });
      } else {
        try {
          const errorText = await res.text();
          console.error(
            "Affirmations update API error:",
            res.status,
            errorText,
          );
        } catch {
          console.error(
            "Affirmations update API error:",
            res.status,
            res.statusText,
          );
        }
      }
    } catch (err) {
      console.error("Affirmations update failed:", err);
    }
  };

  const handleDeleteAffirmation = async (id: string) => {
    console.log("Deleting affirmation with id:", id);

    try {
      const res = await fetchWithAuth(`/affirmations/${id}`, {
        method: "DELETE",
      });
      console.log("Delete affirmation API response status:", res.status);

      if (res.ok) {
        console.log("Affirmation deleted successfully");

        // Fetch updated list from server
        try {
          const listRes = await fetchWithAuth("/affirmations");
          if (listRes.ok) {
            const data = await listRes.json();
            const list = Array.isArray(data)
              ? data
              : (data.affirmations ?? data.data ?? []);
            setAffirmations(list);
            save("user_affirmations", list);
            console.log("Affirmations list refreshed after delete:", list);
          }
        } catch (err) {
          console.error("Failed to refresh affirmations list:", err);
        }
      } else {
        try {
          const errorText = await res.text();
          console.error(
            "Affirmations delete API error:",
            res.status,
            errorText,
          );
          alert(`Failed to delete affirmation: ${res.status}`);
        } catch {
          console.error(
            "Affirmations delete API error:",
            res.status,
            res.statusText,
          );
          alert(
            `Failed to delete affirmation: ${res.status} ${res.statusText}`,
          );
        }
      }
    } catch (err) {
      console.error("Affirmations delete request failed:", err);
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
    };

    console.log("Creating habit with payload:", JSON.stringify(payload));

    try {
      const res = await fetchWithAuth("/habits", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log("Habit API response status:", res.status);

      if (res.ok) {
        const d = await res.json();
        console.log("Habit created successfully:", d);

        // Fetch updated list from server
        try {
          const listRes = await fetchWithAuth("/habits");
          if (listRes.ok) {
            const data = await listRes.json();
            const list = Array.isArray(data)
              ? data
              : (data.habits ?? data.data ?? []);
            setHabits(list);
            save("user_habits", list);
            console.log("Habits list refreshed:", list);
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
        setIsHabitDialogOpen(false);
      } else {
        try {
          const errorText = await res.text();
          console.error("Habits API error:", res.status, errorText);
          alert(`Failed to create habit: ${res.status}`);
        } catch {
          console.error("Habits API error:", res.status, res.statusText);
          alert(`Failed to create habit: ${res.status} ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error("Habits API request failed:", err);
      alert("Failed to create habit. Please check your connection.");
    }
  };

  const handleDeleteHabit = async (id: string) => {
    console.log("Deleting habit with id:", id);

    try {
      const res = await fetchWithAuth(`/habits/${id}`, { method: "DELETE" });
      console.log("Delete habit API response status:", res.status);

      if (res.ok) {
        console.log("Habit deleted successfully");

        // Fetch updated list from server
        try {
          const listRes = await fetchWithAuth("/habits");
          if (listRes.ok) {
            const data = await listRes.json();
            const list = Array.isArray(data)
              ? data
              : (data.habits ?? data.data ?? []);
            setHabits(list);
            save("user_habits", list);
            console.log("Habits list refreshed after delete:", list);
          }
        } catch (err) {
          console.error("Failed to refresh habits list:", err);
        }
      } else {
        try {
          const errorText = await res.text();
          console.error("Habits delete API error:", res.status, errorText);
          alert(`Failed to delete habit: ${res.status}`);
        } catch {
          console.error("Habits delete API error:", res.status, res.statusText);
          alert(`Failed to delete habit: ${res.status} ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error("Habits delete request failed:", err);
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
    },
    {
      key: "started",
      label: "Started",
      icon: "🚀",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    {
      key: "progress",
      label: "Progress",
      icon: "📈",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      key: "completed",
      label: "Completed",
      icon: "✅",
      bg: "bg-teal-50",
      border: "border-teal-200",
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
      emptyText: "No goals yet. Create your first goal to get started!",
      emptyIcon: <Target className="h-10 w-10 text-gray-300" />,
    },
    beliefs: {
      onClick: () => setIsBeliefDialogOpen(true),
      label: "Identify Your First Belief",
      className: "bg-pink-500 hover:bg-pink-600 text-white",
      icon: <Heart className="h-4 w-4 mr-2 shrink-0" />,
      emptyText:
        "No limiting beliefs recorded yet. What thoughts are holding you back?",
      emptyIcon: <Heart className="h-10 w-10 text-gray-300" />,
    },
    affirmations: {
      onClick: () => setIsAffirmationDialogOpen(true),
      label: "Add Your First Affirmation",
      className: "bg-purple-500 hover:bg-purple-600 text-white",
      icon: <Sparkles className="h-4 w-4 mr-2 shrink-0" />,
      emptyText: "No affirmations yet. Start your day with positive thoughts!",
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
    <div className="animate-fade-in space-y-4 sm:space-y-6 relative min-h-screen pb-44 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl text-foreground">
            Goals & Habits
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Transform beliefs and achieve your aspirations
          </p>
        </div>
      </div>

      <Card className="border-l-4 border-blue-400 bg-blue-50 p-3 sm:p-4">
        <p className="text-sm text-foreground">
          <strong>Setting SMART Goals:</strong> Create Specific, Measurable,
          Achievable, Relevant, and Time-bound goals. Break big goals into
          smaller milestones. Link them to your core values for motivation.
          Track progress regularly and celebrate wins.
        </p>
      </Card>

      {/* Tabs */}
      <Tabs
        defaultValue="goals"
        className="space-y-4"
        onValueChange={(val) => setActiveTab(val)}
      >
        {/* Tab list — full width, scrollable on very small screens */}
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-[280px] sm:min-w-[300px] grid-cols-4 gap-1 sm:gap-2">
            <TabsTrigger
              value="goals"
              className="text-xs sm:text-sm py-2 px-1 sm:px-2"
            >
              Goals
            </TabsTrigger>
            <TabsTrigger
              value="beliefs"
              className="text-xs sm:text-sm py-2 px-1 sm:px-2"
            >
              Beliefs
            </TabsTrigger>
            <TabsTrigger
              value="affirmations"
              className="text-xs sm:text-sm py-2 px-1 sm:px-2"
            >
              Affirmations
            </TabsTrigger>
            <TabsTrigger
              value="habits"
              className="text-xs sm:text-sm py-2 px-1 sm:px-2"
            >
              Habits
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── GOALS ── */}
        <TabsContent value="goals" className="space-y-4">
          {/* Controls row — stacks on mobile */}
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
            <div
              className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 select-none touch-none"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              {goalStatuses.map((status) => {
                const statusGoals = getGoalsByStatus(
                  status.key as Goal["status"],
                );
                return (
                  <div key={status.key} className="space-y-2">
                    <div
                      className={`flex items-center justify-between rounded-xl border ${status.border} ${status.bg} px-2 sm:px-3 py-2 sm:py-2.5`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-sm sm:text-base sm:text-lg">
                          {status.icon}
                        </span>
                        <h3 className="font-semibold text-foreground text-xs sm:text-sm">
                          {status.label}
                        </h3>
                      </div>
                      <span className="rounded-md bg-white border border-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                        {statusGoals.length}
                      </span>
                    </div>
                    <div
                      ref={(el) => (columnRefs.current[status.key] = el)}
                      className={`min-h-56 sm:min-h-64 lg:min-h-80 xl:min-h-96 rounded-xl border transition-colors ${status.border} ${status.bg} p-2 sm:p-3 lg:p-4 ${hoveredStatus === status.key ? "ring-2 ring-blue-400 bg-opacity-70" : ""}`}
                    >
                      {statusGoals.length === 0 ? (
                        <div className="flex h-full min-h-48 sm:min-h-56 flex-col items-center justify-center">
                          <p className="text-center text-xs sm:text-sm text-muted-foreground">
                            No goals yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          {statusGoals.map((goal) => (
                            <Card
                              key={goal.id}
                              onPointerDown={(e) =>
                                handlePointerDown(e, goal.id)
                              }
                              className={`cursor-grab active:cursor-grabbing bg-white p-2 sm:p-3 shadow-sm hover:shadow-md transition-all relative group ${dragState?.goalId === goal.id ? "opacity-50 scale-95" : "hover:-translate-y-1"}`}
                            >
                              <p className="text-xs sm:text-sm font-medium text-foreground pr-8">
                                {goal.title}
                              </p>
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-muted-foreground">
                                    Progress
                                  </span>
                                  <span className="text-xs font-semibold text-primary">
                                    {goal.progress || 0}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all"
                                    style={{ width: `${goal.progress || 0}%` }}
                                  />
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteGoal(goal.id);
                                }}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </Card>
                          ))}
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

          {viewMode === "grid" && (
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 sm:py-12 lg:py-16 px-4">
                  <svg
                    className="mb-3 sm:mb-4 h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/40 mx-auto"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="6" fill="none" />
                    <circle cx="12" cy="12" r="10" fill="none" />
                  </svg>
                  <p className="text-xs sm:text-sm sm:text-base text-muted-foreground text-center">
                    No goals yet. Create your first goal to get started!
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
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── BELIEFS ── */}
        <TabsContent value="beliefs" className="space-y-4">
          <Card className="border-l-4 border-red-400 bg-red-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground">
              <strong>Identifying Limiting Beliefs:</strong> These are negative
              thoughts that hold you back. Write belief, explore its origin,
              challenge it with evidence, and create an empowering alternative.
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
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Add Belief
                </Button>
              </div>
              {/* Error banner */}
              {beliefsError && (
                <div className="w-full flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm mb-2">
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
                  <span className="flex-1">{beliefsError}</span>
                  <button
                    onClick={loadBeliefs}
                    className="font-semibold underline underline-offset-2 hover:text-red-900 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 sm:py-12 lg:py-16 px-4">
                {beliefsLoading ? (
                  // Loading skeleton
                  <div className="w-full space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-full bg-white border border-gray-100 rounded-xl p-4 animate-pulse"
                      >
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                        <div className="h-3 bg-green-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : beliefs.length === 0 ? (
                  <>
                    <Heart className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs sm:text-sm sm:text-base text-muted-foreground text-center">
                      No limiting beliefs recorded yet. What thoughts are
                      holding you back?
                    </p>
                  </>
                ) : (
                  <div className="w-full space-y-3">
                    {beliefs.map((belief) => (
                      <Card
                        key={String(belief.id)}
                        className="p-3 sm:p-4 relative group border border-gray-100 rounded-xl"
                      >
                        {/* Header row */}
                        <div className="pr-20">
                          <p className="font-semibold text-sm sm:text-base text-foreground">
                            {belief.belief}
                          </p>
                        </div>

                        {/* Reflection data — shown when available */}
                        {belief.reflection_data && (
                          <div className="mt-3 space-y-1.5 text-xs sm:text-sm">
                            {belief.reflection_data.origin && (
                              <div className="flex gap-2">
                                <span className="shrink-0 font-medium text-muted-foreground w-36">
                                  📍 Origin
                                </span>
                                <span className="text-foreground">
                                  {belief.reflection_data.origin}
                                </span>
                              </div>
                            )}
                            {belief.reflection_data.supporting_evidence && (
                              <div className="flex gap-2">
                                <span className="shrink-0 font-medium text-muted-foreground w-36">
                                  🔴 Supporting
                                </span>
                                <span className="text-foreground">
                                  {belief.reflection_data.supporting_evidence}
                                </span>
                              </div>
                            )}
                            {belief.reflection_data.contradicting_evidence && (
                              <div className="flex gap-2">
                                <span className="shrink-0 font-medium text-muted-foreground w-36">
                                  ✅ Contradicting
                                </span>
                                <span className="text-foreground">
                                  {
                                    belief.reflection_data
                                      .contradicting_evidence
                                  }
                                </span>
                              </div>
                            )}
                            {belief.reflection_data.impact && (
                              <div className="flex gap-2">
                                <span className="shrink-0 font-medium text-muted-foreground w-36">
                                  ⚡ Impact
                                </span>
                                <span className="text-foreground">
                                  {belief.reflection_data.impact}
                                </span>
                              </div>
                            )}
                            {belief.reflection_data.reframe && (
                              <div className="flex gap-2 mt-2 pt-2 border-t border-green-100">
                                <span className="shrink-0 font-medium text-green-600 w-36">
                                  💚 Reframe
                                </span>
                                <span className="text-green-700 font-medium">
                                  {belief.reflection_data.reframe}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Fallback: local alternative if no reflection_data */}
                        {!belief.reflection_data && belief.alternative && (
                          <p className="text-xs sm:text-sm text-green-600 mt-2">
                            💚 {belief.alternative}
                          </p>
                        )}

                        {/* Footer — timestamp */}
                        {belief.created_at && (
                          <p className="mt-2 text-[10px] text-muted-foreground/60">
                            Added{" "}
                            {new Date(belief.created_at).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        )}

                        {/* Action buttons — visible on hover */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit */}
                          <button
                            onClick={() => openEditBelief(belief)}
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Edit belief"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteBelief(belief.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete belief"
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
                        </div>
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
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Add Pattern
                </Button>
              </div>
              {/* Error banner */}
              {patternsError && (
                <div className="w-full flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm mb-2">
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
                  <span className="flex-1">{patternsError}</span>
                  <button
                    onClick={loadPatterns}
                    className="font-semibold underline underline-offset-2 hover:text-red-900 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 sm:py-12 lg:py-16 px-4">
                {patternsLoading ? (
                  // Loading skeleton
                  <div className="w-full space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-full bg-white border border-gray-100 rounded-xl p-4 animate-pulse"
                      >
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                        <div className="h-3 bg-orange-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : patterns.length === 0 ? (
                  <>
                    <Zap className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs sm:text-sm sm:text-base text-muted-foreground text-center">
                      No behavioral patterns recorded yet. What actions do you
                      want to change?
                    </p>
                  </>
                ) : (
                  <div className="w-full space-y-3">
                    {patterns.map((pattern) => (
                      <Card
                        key={String(pattern.id)}
                        className="p-3 sm:p-4 relative group cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openPatternDetail(pattern.id)}
                      >
                        <p className="font-semibold text-sm sm:text-base text-foreground pr-12">
                          {pattern.name}
                        </p>
                        {pattern.alternative && (
                          <p className="text-xs sm:text-sm text-orange-600 mt-2">
                            ⚡ {pattern.alternative}
                          </p>
                        )}
                        {pattern.trigger && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            🔥 {pattern.trigger}
                          </p>
                        )}
                        {/* Footer — timestamp */}
                        {pattern.created_at && (
                          <p className="mt-2 text-[10px] text-muted-foreground/60 group-hover:opacity-0 transition-opacity">
                            Added{" "}
                            {new Date(pattern.created_at).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        )}
                        <p className="text-xs text-orange-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-3">
                          Click to view full details →
                        </p>
                        {/* Action buttons — stop card click propagation */}
                        <div
                          className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Edit */}
                          <button
                            onClick={() => openEditPattern(pattern)}
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Edit pattern"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeletePattern(pattern.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete pattern"
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
                        </div>
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
              tense, use positive language, make it personal and specific.
              Repeat daily, especially in your morning routine.
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
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-muted-foreground text-xs sm:text-sm"
                >
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Load Samples
                </Button>
                <Button
                  className="bg-purple-500 hover:bg-purple-600 text-white flex-1 sm:flex-none text-xs sm:text-sm"
                  onClick={() => setIsAffirmationDialogOpen(true)}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Add
                </Button>
              </div>
            </div>
            <div
              className={`rounded-lg border-2 border-dashed border-gray-300 p-4 ${affirmations.length === 0 ? "flex flex-col items-center justify-center py-16" : ""}`}
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
                        "{a.statement}"
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
              consistent. Choose daily, weekly, or custom frequencies. Track
              completion to build streaks and review progress monthly.
            </p>
          </Card>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl text-foreground">
                  Habit Tracking
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Track your daily habits throughout month
                </p>
              </div>
              <Button
                className="bg-teal-500 hover:bg-teal-600 text-white w-full sm:w-auto text-sm"
                onClick={() => setIsHabitDialogOpen(true)}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Add Habit
              </Button>
            </div>
            <Card className="border-l-4 border-blue-400 bg-blue-50 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-foreground">
                <span className="text-blue-700">💡</span> <strong>Tip:</strong>{" "}
                Track your habits in{" "}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                  Daily Journal
                </span>{" "}
                and{" "}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                  Weekly Journal
                </span>
                . This page shows your monthly progress!
              </p>
            </Card>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 sm:py-16 lg:py-20 px-4">
              {habits.length === 0 ? (
                <>
                  <svg
                    className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-muted-foreground/30 mx-auto"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="6" fill="none" />
                    <circle cx="12" cy="12" r="10" fill="none" />
                  </svg>
                  <p className="text-xs sm:text-sm sm:text-base text-muted-foreground text-center">
                    No habits yet. Start building better routines!
                  </p>
                </>
              ) : (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {habits.map((habit) => (
                    <Card
                      key={habit.id}
                      className="p-3 sm:p-4 relative group bg-teal-50 border-teal-200"
                    >
                      <p className="font-semibold text-sm sm:text-base text-foreground pr-8">
                        {habit.name}
                      </p>
                      <p className="text-xs text-teal-600 mt-1 capitalize">
                        ⚡ {habit.frequency}
                      </p>
                      {habit.time && (
                        <p className="text-xs text-gray-600 mt-1">
                          🕐 {habit.time}
                        </p>
                      )}
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-3 py-2.5 flex flex-col items-center justify-center shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <Button
            className={`w-full max-w-sm text-xs sm:text-sm font-semibold rounded-lg h-9 sm:h-10 ${currentFooter.className}`}
            onClick={currentFooter.onClick}
          >
            {currentFooter.icon && (
              <div className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0">
                {currentFooter.icon}
              </div>
            )}
            <span className="truncate">{currentFooter.label}</span>
          </Button>
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
            <DialogDescription className="text-teal-600">
              Turn your aspirations into achievable milestones
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Goal Name *</Label>
              <Input
                id="goal-name"
                placeholder="e.g., Run a marathon, Learn Spanish..."
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                placeholder="What does achieving this goal mean to you?"
                rows={3}
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goal-category">Category</Label>
                <Select value={goalCategory} onValueChange={setGoalCategory}>
                  <SelectTrigger id="goal-category">
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
                <Label htmlFor="goal-status">Status</Label>
                <Select
                  value={goalStatus}
                  onValueChange={(val) => setGoalStatus(val as Goal["status"])}
                >
                  <SelectTrigger id="goal-status">
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
                <Label htmlFor="goal-start">Start Date</Label>
                <Input
                  id="goal-start"
                  type="date"
                  value={goalStartDate}
                  onChange={(e) => setGoalStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-target">Target Date</Label>
                <Input
                  id="goal-target"
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-progress">Progress: {goalProgress}%</Label>
              <div className="space-y-2">
                <input
                  id="goal-progress"
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
                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all"
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
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

      {/* Belief Dialog — create OR edit */}
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
                ? "✏️ Edit Limiting Belief"
                : "💭 Identify Limiting Belief"}
            </DialogTitle>
            <DialogDescription className="text-pink-600">
              {editingBeliefId !== null
                ? "Update your belief and its reframe"
                : "Recognize and reframe thoughts that hold you back"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Inline error */}
            {beliefSaveError && (
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
                {beliefSaveError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="belief-name">Limiting Belief *</Label>
              <Input
                id="belief-name"
                placeholder="e.g., I'm not good enough, I always fail..."
                value={beliefText}
                onChange={(e) => setBeliefText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="belief-origin">Origin (Optional)</Label>
              <Textarea
                id="belief-origin"
                placeholder="Where does this belief come from? (e.g., Childhood comparison)"
                rows={2}
                value={beliefOrigin}
                onChange={(e) => setBeliefOrigin(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="belief-supporting">Supporting Evidence</Label>
                <Textarea
                  id="belief-supporting"
                  placeholder="What makes you believe this? (e.g., Failed twice)"
                  rows={3}
                  value={beliefSupportingEvidence}
                  onChange={(e) => setBeliefSupportingEvidence(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="belief-evidence">Contradicting Evidence</Label>
                <Textarea
                  id="belief-evidence"
                  placeholder="What contradicts this belief? (e.g., Got promoted last year)"
                  rows={3}
                  value={beliefEvidence}
                  onChange={(e) => setBeliefEvidence(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="belief-impact">Impact</Label>
              <Textarea
                id="belief-impact"
                placeholder="How does this belief affect your life? (e.g., Avoid new opportunities)"
                rows={2}
                value={beliefImpact}
                onChange={(e) => setBeliefImpact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="belief-reframe">Empowering Reframe</Label>
              <Input
                id="belief-reframe"
                placeholder='e.g., "I am learning and improving daily"'
                value={beliefAlternative}
                onChange={(e) => setBeliefAlternative(e.target.value)}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsBeliefDialogOpen(false)}
                disabled={beliefSaving}
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
                {beliefSaving ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : editingBeliefId !== null ? (
                  "Update Belief"
                ) : (
                  "Add Belief"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern Dialog — create OR edit */}
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
              {editingPatternId !== null
                ? "✏️ Edit Behavioral Pattern"
                : "⚡ Identify Behavioral Pattern"}
            </DialogTitle>
            <DialogDescription className="text-orange-600">
              {editingPatternId !== null
                ? "Update your pattern and strategies"
                : "Understand recurring actions you want to change"}
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
              <Label htmlFor="pattern-name">Recurring Behavior *</Label>
              <Input
                id="pattern-name"
                placeholder="e.g., Procrastinating on important tasks..."
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pattern-trigger">Triggers</Label>
                <Textarea
                  id="pattern-trigger"
                  placeholder="What triggers this behavior? (e.g., Feeling overwhelmed, late at night)"
                  rows={3}
                  value={patternTrigger}
                  onChange={(e) => setPatternTrigger(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pattern-reason">Underlying Reason</Label>
                <Textarea
                  id="pattern-reason"
                  placeholder="Root cause? (e.g., Fear of failure and perfectionism)"
                  rows={3}
                  value={patternUnderlyingReason}
                  onChange={(e) => setPatternUnderlyingReason(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern-consequence">Impact</Label>
              <Textarea
                id="pattern-consequence"
                placeholder="What are the consequences? (e.g., Miss deadlines and feel stressed)"
                rows={2}
                value={patternConsequence}
                onChange={(e) => setPatternConsequence(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern-alternative">Desired Behavior</Label>
              <Input
                id="pattern-alternative"
                placeholder="What will you do instead? (e.g., Start tasks immediately using small steps)"
                value={patternAlternative}
                onChange={(e) => setPatternAlternative(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern-strategies">Strategies</Label>
              <Textarea
                id="pattern-strategies"
                placeholder="How will you implement the change? (e.g., Use the 5-minute rule)"
                rows={2}
                value={patternStrategies}
                onChange={(e) => setPatternStrategies(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pattern-affirmation">
                Linked Affirmation (Optional)
              </Label>
              <Select
                value={patternAffirmationId || "none"}
                onValueChange={setPatternAffirmationId}
              >
                <SelectTrigger id="pattern-affirmation">
                  <SelectValue placeholder="Select an affirmation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {affirmations.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.text}
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
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : editingPatternId !== null ? (
                  "Update Pattern"
                ) : (
                  "Add Pattern"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern Detail Modal — GET /behavioral_patterns/:id */}
      <Dialog open={isPatternDetailOpen} onOpenChange={setIsPatternDetailOpen}>
        <DialogContent className="w-[95vw] max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              ⚡ Behavioral Pattern
            </DialogTitle>
            <DialogDescription className="text-orange-600">
              Full breakdown of this recurring behavior
            </DialogDescription>
          </DialogHeader>

          {patternDetailLoading ? (
            // Loading skeleton
            <div className="space-y-4 py-4 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-2/3" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-orange-100 rounded w-1/4" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : patternDetail ? (
            <div className="space-y-4 py-4">
              {/* Header */}
              <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
                <p className="font-semibold text-base text-orange-900">
                  {patternDetail.name}
                </p>
              </div>

              {/* pattern_data fields */}
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

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPatternDetailOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Could not load pattern details.
            </p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={isAffirmationDialogOpen}
        onOpenChange={setIsAffirmationDialogOpen}
      >
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              ✨ Create Affirmation
            </DialogTitle>
            <DialogDescription className="text-purple-600">
              Craft positive statements that empower you daily
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Statement *</Label>
              <Textarea
                placeholder='"I am confident and capable"'
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
              <Label htmlFor="habit-name">Habit Name *</Label>
              <Input
                id="habit-name"
                placeholder="e.g., Morning meditation, Exercise..."
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="habit-description">Description</Label>
              <Textarea
                id="habit-description"
                placeholder="What does this habit involve?"
                rows={3}
                value={habitDescription}
                onChange={(e) => setHabitDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="habit-frequency">Frequency</Label>
                <Select
                  value={habitFrequency}
                  onValueChange={(val) =>
                    setHabitFrequency(val as Habit["frequency"])
                  }
                >
                  <SelectTrigger id="habit-frequency">
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
                <Label htmlFor="habit-category">Category</Label>
                <Select value={habitCategory} onValueChange={setHabitCategory}>
                  <SelectTrigger id="habit-category">
                    <SelectValue placeholder="Other" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">🏃 Health & Fitness</SelectItem>
                    <SelectItem value="career">💼 Career</SelectItem>
                    <SelectItem value="personal">🌱 Personal Growth</SelectItem>
                    <SelectItem value="relationships">
                      ❤️ Relationships
                    </SelectItem>
                    <SelectItem value="other">📌 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="habit-time" className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Time (Optional)
                </Label>
                <Input
                  id="habit-time"
                  placeholder="e.g., 7:00 AM, Morning, Evening"
                  value={habitTime}
                  onChange={(e) => setHabitTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="habit-place"
                  className="flex items-center gap-1"
                >
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Place (Optional)
                </Label>
                <Input
                  id="habit-place"
                  placeholder="e.g., Gym, Home, Office"
                  value={habitPlace}
                  onChange={(e) => setHabitPlace(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="habit-start">Start Date</Label>
              <Input
                id="habit-start"
                type="date"
                value={habitStartDate}
                onChange={(e) => setHabitStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsHabitDialogOpen(false)}
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
