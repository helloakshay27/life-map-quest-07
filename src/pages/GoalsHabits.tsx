import { useState, useEffect } from "react";
import { Plus, Heart, Zap, Sparkles, Clock, MapPin, Target } from "lucide-react";
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
import { apiRequest } from "@/config/api";
const API_BASE_URL = "https://api.lifecompass.lockated.com";
interface Goal {
  id: string;
  title: string;
  status: "planning" | "started" | "progress" | "completed";
  area?: string;
  progress?: number; // 0-100
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
  text: string;
  category?: string;
  linkedBelief?: string;
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

const GoalsHabits = () => {
  const [selectedArea, setSelectedArea] = useState("all-areas");
  const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [beliefs, setBeliefs] = useState<Belief[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeTab, setActiveTab] = useState("goals");

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isBeliefDialogOpen, setIsBeliefDialogOpen] = useState(false);
  const [isPatternDialogOpen, setIsPatternDialogOpen] = useState(false);
  const [isAffirmationDialogOpen, setIsAffirmationDialogOpen] = useState(false);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);

  // Form states for goal
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
  const [beliefEvidence, setBeliefEvidence] = useState("");
  const [beliefAlternative, setBeliefAlternative] = useState("");

  // Form states for pattern
  const [patternName, setPatternName] = useState("");
  const [patternTrigger, setPatternTrigger] = useState("");
  const [patternConsequence, setPatternConsequence] = useState("");
  const [patternAlternative, setPatternAlternative] = useState("");

  // Form states for affirmation
  const [affirmationText, setAffirmationText] = useState("");
  const [affirmationCategory, setAffirmationCategory] = useState("");
  const [affirmationBelief, setAffirmationBelief] = useState("");

  // Form states for habit
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [habitFrequency, setHabitFrequency] = useState<Habit["frequency"]>("daily");
  const [habitCategory, setHabitCategory] = useState("");
  const [habitTime, setHabitTime] = useState("");
  const [habitPlace, setHabitPlace] = useState("");
  const [habitStartDate, setHabitStartDate] = useState("");

  // Load goals from localStorage on mount
  useEffect(() => {
    const loadGoals = async () => {
      try {
        // Load from localStorage only
        const savedGoals = localStorage.getItem("user_goals");
        if (savedGoals) {
          setGoals(JSON.parse(savedGoals));
        }
      } catch (error) {
        console.log("Error loading goals from storage");
      }
    };

    loadGoals();
  }, []);

  // Load beliefs, patterns, affirmations, habits
  useEffect(() => {
    const loadData = async () => {
      // Load Beliefs (localStorage only)
      try {
        const savedBeliefs = localStorage.getItem("user_beliefs");
        if (savedBeliefs) {
          setBeliefs(JSON.parse(savedBeliefs));
        }
      } catch (e) {
        console.log("Error loading beliefs from storage");
      }

      // Load Patterns (localStorage only)
      try {
        const savedPatterns = localStorage.getItem("user_patterns");
        if (savedPatterns) {
          setPatterns(JSON.parse(savedPatterns));
        }
      } catch (e) {
        console.log("Error loading patterns from storage");
      }

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
  }, []);

  const handleCreateGoal = async () => {
    if (!goalName.trim()) return;

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: goalName,
      status: goalStatus,
      area: goalCategory,
      progress: goalProgress || 0,
    };

    try {
      // Save to localStorage only
      setGoals((prev) => {
        const updated = [...prev, newGoal];
        localStorage.setItem("user_goals", JSON.stringify(updated));
        return updated;
      });

      // Reset form
      setGoalName("");
      setGoalDescription("");
      setGoalCategory("");
      setGoalStatus("planning");
      setGoalStartDate("");
      setGoalTargetDate("");
      setGoalProgress(0);
      setIsGoalDialogOpen(false);
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      // Delete from localStorage only
      setGoals((prev) => {
        const updated = prev.filter((goal) => goal.id !== id);
        localStorage.setItem("user_goals", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  // Belief handlers
  const handleCreateBelief = async () => {
    if (!beliefText.trim() || !beliefAlternative.trim()) return;

    const newBelief: Belief = {
      id: crypto.randomUUID(),
      belief: beliefText,
      origin: beliefOrigin,
      evidence: beliefEvidence,
      alternative: beliefAlternative,
    };

    try {
      // Save to localStorage only
      setBeliefs((prev) => {
        const updated = [...prev, newBelief];
        localStorage.setItem("user_beliefs", JSON.stringify(updated));
        return updated;
      });

      setBeliefText("");
      setBeliefOrigin("");
      setBeliefEvidence("");
      setBeliefAlternative("");
      setIsBeliefDialogOpen(false);
    } catch (error) {
      console.error("Failed to create belief:", error);
    }
  };

  const handleDeleteBelief = async (id: string) => {
    try {
      // Delete from localStorage only
      setBeliefs((prev) => {
        const updated = prev.filter((b) => b.id !== id);
        localStorage.setItem("user_beliefs", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete belief:", error);
    }
  };

  // Pattern handlers
  const handleCreatePattern = async () => {
    if (!patternName.trim() || !patternAlternative.trim()) return;

    const newPattern: Pattern = {
      id: crypto.randomUUID(),
      name: patternName,
      trigger: patternTrigger,
      consequence: patternConsequence,
      alternative: patternAlternative,
    };

    try {
      // Save to localStorage only
      setPatterns((prev) => {
        const updated = [...prev, newPattern];
        localStorage.setItem("user_patterns", JSON.stringify(updated));
        return updated;
      });

      setPatternName("");
      setPatternTrigger("");
      setPatternConsequence("");
      setPatternAlternative("");
      setIsPatternDialogOpen(false);
    } catch (error) {
      console.error("Failed to create pattern:", error);
    }
  };

  const handleDeletePattern = async (id: string) => {
    try {
      // Delete from localStorage only
      setPatterns((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        localStorage.setItem("user_patterns", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete pattern:", error);
    }
  };

  // Affirmation handlers
  const handleCreateAffirmation = async () => {
    if (!affirmationText.trim()) return;

    const newAffirmation: Affirmation = {
      id: crypto.randomUUID(),
      text: affirmationText,
      category: affirmationCategory,
      linkedBelief: affirmationBelief,
    };

    try {
      // Save to localStorage only
      setAffirmations((prev) => {
        const updated = [...prev, newAffirmation];
        localStorage.setItem("user_affirmations", JSON.stringify(updated));
        return updated;
      });

      setAffirmationText("");
      setAffirmationCategory("");
      setAffirmationBelief("");
      setIsAffirmationDialogOpen(false);
    } catch (error) {
      console.error("Failed to create affirmation:", error);
    }
  };

  const handleDeleteAffirmation = async (id: string) => {
    try {
      // Delete from localStorage only
      setAffirmations((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        localStorage.setItem("user_affirmations", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete affirmation:", error);
    }
  };

  // Habit handlers
  const handleCreateHabit = async () => {
    if (!habitName.trim()) return;

    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: habitName,
      description: habitDescription,
      frequency: habitFrequency,
      category: habitCategory,
      time: habitTime,
      place: habitPlace,
      startDate: habitStartDate,
    };

    try {
      // Save to localStorage only
      setHabits((prev) => {
        const updated = [...prev, newHabit];
        localStorage.setItem("user_habits", JSON.stringify(updated));
        return updated;
      });

      setHabitName("");
      setHabitDescription("");
      setHabitFrequency("daily");
      setHabitCategory("");
      setHabitTime("");
      setHabitPlace("");
      setHabitStartDate("");
      setIsHabitDialogOpen(false);
    } catch (error) {
      console.error("Failed to create habit:", error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      // Delete from localStorage only
      setHabits((prev) => {
        const updated = prev.filter((h) => h.id !== id);
        localStorage.setItem("user_habits", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  };

  const goalStatuses = [
    { key: "planning",  label: "Planning",  icon: "🎯", bg: "bg-blue-50",   border: "border-blue-200"   },
    { key: "started",   label: "Started",   icon: "🚀", bg: "bg-purple-50", border: "border-purple-200" },
    { key: "progress",  label: "Progress",  icon: "📈", bg: "bg-orange-50", border: "border-orange-200" },
    { key: "completed", label: "Completed", icon: "✅", bg: "bg-teal-50",   border: "border-teal-200"   },
  ];

  const getGoalsByStatus = (status: Goal["status"]) =>
    goals.filter((goal) => goal.status === status);

  const areaLabels: Record<string, string> = {
    "all-areas":     "Create Your First Goal",
    "health":        "Create Your Health & Fitness Goal",
    "career":        "Create Your Career Goal",
    "personal":      "Create Your Personal Growth Goal",
    "relationships": "Create Your Relationships Goal",
    "financial":     "Create Your Financial Goal",
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
      emptyText: "No limiting beliefs recorded yet. What thoughts are holding you back?",
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

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 relative min-h-screen pb-44 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl text-foreground">Goals & Habits</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Transform beliefs and achieve your aspirations</p>
        </div>
      </div>

      {/* Info Alert */}
      <Card className="border-l-4 border-blue-400 bg-blue-50 p-3 sm:p-4">
        <p className="text-sm text-foreground">
          <strong>Setting SMART Goals:</strong> Create Specific, Measurable, Achievable, Relevant, and Time-bound goals. Break big goals into smaller milestones. Link them to your core values for motivation. Track progress regularly and celebrate wins.
        </p>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="goals" className="space-y-4" onValueChange={(val) => setActiveTab(val)}>

        {/* Tab list — full width, scrollable on very small screens */}
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-[280px] sm:min-w-[300px] grid-cols-4 gap-1 sm:gap-2">
            <TabsTrigger value="goals"        className="text-xs sm:text-sm py-2 px-1 sm:px-2">Goals</TabsTrigger>
            <TabsTrigger value="beliefs"      className="text-xs sm:text-sm py-2 px-1 sm:px-2">Beliefs</TabsTrigger>
            <TabsTrigger value="affirmations" className="text-xs sm:text-sm py-2 px-1 sm:px-2">Affirmations</TabsTrigger>
            <TabsTrigger value="habits"       className="text-xs sm:text-sm py-2 px-1 sm:px-2">Habits</TabsTrigger>
          </TabsList>
        </div>

        {/* ── GOALS TAB ── */}
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
              <Button variant={viewMode === "kanban" ? "default" : "outline"} size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setViewMode("kanban")}>Kanban</Button>
              <Button variant={viewMode === "grid"   ? "default" : "outline"} size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setViewMode("grid")}>Grid</Button>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setIsGoalDialogOpen(true)}>
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />New Goal
              </Button>
            </div>
          </div>

          {/* Kanban — 1 col mobile, 2 col tablet, 4 col desktop */}
          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {goalStatuses.map((status) => {
                const statusGoals = getGoalsByStatus(status.key as Goal["status"]);
                return (
                  <div key={status.key} className="space-y-2">
                    <div className={`flex items-center justify-between rounded-xl border ${status.border} ${status.bg} px-2 sm:px-3 py-2 sm:py-2.5`}>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-sm sm:text-base sm:text-lg">{status.icon}</span>
                        <h3 className="font-semibold text-foreground text-xs sm:text-sm">{status.label}</h3>
                      </div>
                      <span className="rounded-md bg-white border border-gray-200 px-1.5 sm:px-2 py-0.5 text-xs sm:text-sm font-medium text-gray-600">
                        {statusGoals.length}
                      </span>
                    </div>
                    <div className={`min-h-56 sm:min-h-64 lg:min-h-80 xl:min-h-96 rounded-xl border ${status.border} ${status.bg} p-2 sm:p-3 lg:p-4`}>
                      {statusGoals.length === 0 ? (
                        <div className="flex h-full min-h-48 sm:min-h-56 flex-col items-center justify-center">
                          <p className="text-center text-xs sm:text-sm text-muted-foreground">No goals yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          {statusGoals.map((goal) => (
                            <Card key={goal.id} className="cursor-pointer bg-white p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow relative group">
                              <p className="text-xs sm:text-sm font-medium text-foreground pr-8">{goal.title}</p>
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-muted-foreground">Progress</span>
                                  <span className="text-xs font-semibold text-primary">{goal.progress || 0}%</span>
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
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 sm:py-12 lg:py-16 px-4">
                  <svg className="mb-3 sm:mb-4 h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/40 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="6" fill="none" />
                    <circle cx="12" cy="12" r="10" fill="none" />
                  </svg>
                  <p className="text-xs sm:text-sm sm:text-base text-muted-foreground text-center">No goals yet. Create your first goal to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {goals.map((goal) => (
                    <Card key={goal.id} className="p-3 sm:p-4 relative group">
                      <p className="font-semibold text-sm sm:text-base text-foreground pr-8">{goal.title}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground capitalize mt-1">{goal.status}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-semibold text-primary">{goal.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-teal-500 h-2.5 rounded-full transition-all"
                            style={{ width: `${goal.progress || 0}%` }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── BELIEFS TAB ── */}
        <TabsContent value="beliefs" className="space-y-4">
          <Card className="border-l-4 border-red-400 bg-red-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground">
              <strong>Identifying Limiting Beliefs:</strong> These are negative thoughts that hold you back. Write belief, explore its origin, challenge it with evidence, and create an empowering alternative.
            </p>
          </Card>
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl text-foreground">Limiting Beliefs</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Identify and reframe thoughts that hold you back</p>
                </div>
                <Button className="bg-pink-500 hover:bg-pink-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsBeliefDialogOpen(true)}>
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Add Belief
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 sm:py-12 lg:py-16 px-4">
                {beliefs.length === 0 ? (
                  <>
                    <Heart className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs sm:text-sm sm:text-base text-muted-foreground text-center">No limiting beliefs recorded yet. What thoughts are holding you back?</p>
                  </>
                ) : (
                  <div className="w-full space-y-3">
                    {beliefs.map((belief) => (
                      <Card key={belief.id} className="p-3 sm:p-4 relative group">
                        <p className="font-semibold text-sm sm:text-base text-foreground pr-8">{belief.belief}</p>
                        <p className="text-xs sm:text-sm text-green-600 mt-2">💚 {belief.alternative}</p>
                        <button
                          onClick={() => handleDeleteBelief(belief.id)}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl text-foreground">Behavioral Patterns</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Understand and change your recurring actions</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsPatternDialogOpen(true)}>
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Add Pattern
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-8 sm:py-12 lg:py-16 px-4">
                {patterns.length === 0 ? (
                  <>
                    <Zap className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs sm:text-sm sm:text-base text-muted-foreground text-center">No behavioral patterns recorded yet. What actions do you want to change?</p>
                  </>
                ) : (
                  <div className="w-full space-y-3">
                    {patterns.map((pattern) => (
                      <Card key={pattern.id} className="p-3 sm:p-4 relative group">
                        <p className="font-semibold text-sm sm:text-base text-foreground pr-8">{pattern.name}</p>
                        <p className="text-xs sm:text-sm text-orange-600 mt-2">⚡ {pattern.alternative}</p>
                        <button
                          onClick={() => handleDeletePattern(pattern.id)}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── AFFIRMATIONS TAB ── */}
        <TabsContent value="affirmations" className="space-y-4">
          <Card className="border-l-4 border-purple-400 bg-purple-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground">
              <strong>Creating Powerful Affirmations:</strong> Write in present tense, use positive language, make it personal and specific. Repeat daily, especially in your morning routine.
            </p>
          </Card>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl text-foreground">Your Affirmations</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Positive statements that empower you daily</p>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-muted-foreground text-xs sm:text-sm">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />Load Samples
                </Button>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setIsAffirmationDialogOpen(true)}>
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />Add
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 sm:py-16 lg:py-20 px-4">
              {affirmations.length === 0 ? (
                <>
                  <Sparkles className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs sm:text-sm sm:text-base text-muted-foreground text-center">No affirmations yet. Start your day with positive thoughts!</p>
                </>
              ) : (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {affirmations.map((affirmation) => (
                    <Card key={affirmation.id} className="p-3 sm:p-4 relative group bg-purple-50 border-purple-200">
                      <p className="text-sm sm:text-base text-foreground pr-8 italic">"{affirmation.text}"</p>
                      {affirmation.category && (
                        <p className="text-xs text-purple-600 mt-2">✨ {affirmation.category}</p>
                      )}
                      <button
                        onClick={() => handleDeleteAffirmation(affirmation.id)}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── HABITS TAB ── */}
        <TabsContent value="habits" className="space-y-4">
          <Card className="border-l-4 border-teal-400 bg-teal-50 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-foreground">
              <strong>Building Lasting Habits:</strong> Start small and be consistent. Choose daily, weekly, or custom frequencies. Track completion to build streaks and review progress monthly.
            </p>
          </Card>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl text-foreground">Habit Tracking</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Track your daily habits throughout month</p>
              </div>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white w-full sm:w-auto text-sm" onClick={() => setIsHabitDialogOpen(true)}>
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />Add Habit
              </Button>
            </div>
            <Card className="border-l-4 border-blue-400 bg-blue-50 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-foreground">
                <span className="text-blue-700">💡</span> <strong>Tip:</strong> Track your habits in{" "}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Daily Journal</span> and{" "}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Weekly Journal</span>. This page shows your monthly progress!
              </p>
            </Card>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 sm:py-16 lg:py-20 px-4">
              {habits.length === 0 ? (
                <>
                  <svg className="mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-muted-foreground/30 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                    <circle cx="12" cy="12" r="6" fill="none" />
                    <circle cx="12" cy="12" r="10" fill="none" />
                  </svg>
                  <p className="text-xs sm:text-sm sm:text-base text-muted-foreground text-center">No habits yet. Start building better routines!</p>
                </>
              ) : (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {habits.map((habit) => (
                    <Card key={habit.id} className="p-3 sm:p-4 relative group bg-teal-50 border-teal-200">
                      <p className="font-semibold text-sm sm:text-base text-foreground pr-8">{habit.name}</p>
                      <p className="text-xs text-teal-600 mt-1 capitalize">⚡ {habit.frequency}</p>
                      {habit.time && <p className="text-xs text-gray-600 mt-1">🕐 {habit.time}</p>}
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* ── Sticky Footer ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex flex-col items-center gap-2 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300">
          {currentFooter.emptyIcon}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground text-center px-2 max-w-xs">{currentFooter.emptyText}</p>
        <Button
          className={`w-full max-w-48 sm:max-w-xs lg:max-w-sm text-xs sm:text-sm font-semibold rounded-lg ${currentFooter.className}`}
          onClick={currentFooter.onClick}
        >
          <div className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0">
            {currentFooter.icon}
          </div>
          <span className="truncate">{currentFooter.label}</span>
        </Button>
      </div>

      {/* ── DIALOGS ── */}

      {/* Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">🎯 Create New Goal</DialogTitle>
            <DialogDescription className="text-teal-600">Turn your aspirations into achievable milestones</DialogDescription>
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
                  <SelectTrigger id="goal-category"><SelectValue placeholder="Select category" /></SelectTrigger>
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
                <Select value={goalStatus} onValueChange={(val) => setGoalStatus(val as Goal["status"])}>
                  <SelectTrigger id="goal-status"><SelectValue /></SelectTrigger>
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
              <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>Cancel</Button>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={handleCreateGoal}>Create Goal</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Belief Dialog */}
      <Dialog open={isBeliefDialogOpen} onOpenChange={setIsBeliefDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">💭 Identify Limiting Belief</DialogTitle>
            <DialogDescription className="text-pink-600">Recognize and reframe thoughts that hold you back</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                placeholder="Where does this belief come from?" 
                rows={2}
                value={beliefOrigin}
                onChange={(e) => setBeliefOrigin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="belief-evidence">Counter Evidence</Label>
              <Textarea 
                id="belief-evidence" 
                placeholder="What evidence challenges this belief?" 
                rows={2}
                value={beliefEvidence}
                onChange={(e) => setBeliefEvidence(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="belief-reframe">Empowering Alternative *</Label>
              <Input 
                id="belief-reframe" 
                placeholder='e.g., "I am capable and growing"...'
                value={beliefAlternative}
                onChange={(e) => setBeliefAlternative(e.target.value)}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button variant="outline" onClick={() => setIsBeliefDialogOpen(false)}>Cancel</Button>
              <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={handleCreateBelief}>Add Belief</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern Dialog */}
      <Dialog open={isPatternDialogOpen} onOpenChange={setIsPatternDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">⚡ Identify Behavioral Pattern</DialogTitle>
            <DialogDescription className="text-orange-600">Understand recurring actions you want to change</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pattern-name">Pattern Name *</Label>
              <Input 
                id="pattern-name" 
                placeholder="e.g., Procrastination, Emotional eating..." 
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern-trigger">Trigger</Label>
              <Textarea 
                id="pattern-trigger" 
                placeholder="What triggers this pattern?" 
                rows={2}
                value={patternTrigger}
                onChange={(e) => setPatternTrigger(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern-consequence">Consequence</Label>
              <Textarea 
                id="pattern-consequence" 
                placeholder="What are the consequences?" 
                rows={2}
                value={patternConsequence}
                onChange={(e) => setPatternConsequence(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern-alternative">Alternative Action *</Label>
              <Input 
                id="pattern-alternative" 
                placeholder="What will you do instead?" 
                value={patternAlternative}
                onChange={(e) => setPatternAlternative(e.target.value)}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button variant="outline" onClick={() => setIsPatternDialogOpen(false)}>Cancel</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleCreatePattern}>Add Pattern</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Affirmation Dialog */}
      <Dialog open={isAffirmationDialogOpen} onOpenChange={setIsAffirmationDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">✨ Create Affirmation</DialogTitle>
            <DialogDescription className="text-purple-600">Craft positive statements that empower you daily</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="affirmation-text">Affirmation *</Label>
              <Textarea 
                id="affirmation-text" 
                placeholder='e.g., "I am confident and capable"...' 
                rows={3}
                value={affirmationText}
                onChange={(e) => setAffirmationText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affirmation-category">Category</Label>
              <Select value={affirmationCategory} onValueChange={setAffirmationCategory}>
                <SelectTrigger id="affirmation-category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confidence">Confidence</SelectItem>
                  <SelectItem value="abundance">Abundance</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="relationships">Relationships</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="affirmation-belief">Linked to Belief (Optional)</Label>
              <Input 
                id="affirmation-belief" 
                placeholder="Which limiting belief does this counter?" 
                value={affirmationBelief}
                onChange={(e) => setAffirmationBelief(e.target.value)}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button variant="outline" onClick={() => setIsAffirmationDialogOpen(false)}>Cancel</Button>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white" onClick={handleCreateAffirmation}>Add Affirmation</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Habit Dialog */}
      <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">✨ Create New Habit</DialogTitle>
            <DialogDescription className="text-teal-600">Build lasting routines that align with your goals</DialogDescription>
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
                <Select value={habitFrequency} onValueChange={(val) => setHabitFrequency(val as Habit["frequency"])}>
                  <SelectTrigger id="habit-frequency"><SelectValue /></SelectTrigger>
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
                  <SelectTrigger id="habit-category"><SelectValue placeholder="Other" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">🏃 Health & Fitness</SelectItem>
                    <SelectItem value="career">💼 Career</SelectItem>
                    <SelectItem value="personal">🌱 Personal Growth</SelectItem>
                    <SelectItem value="relationships">❤️ Relationships</SelectItem>
                    <SelectItem value="other">📌 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="habit-time" className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-500" />Time (Optional)
                </Label>
                <Input 
                  id="habit-time" 
                  placeholder="e.g., 7:00 AM, Morning, Evening" 
                  value={habitTime}
                  onChange={(e) => setHabitTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="habit-place" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-500" />Place (Optional)
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
              <Button variant="outline" onClick={() => setIsHabitDialogOpen(false)}>Cancel</Button>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={handleCreateHabit}>Create Habit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsHabits;