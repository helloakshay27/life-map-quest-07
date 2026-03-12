import { useState, useEffect, useCallback } from "react";
import { Zap, User, Plus, Sparkles, Target, Save, Trash2 } from "lucide-react";
import { API_CONFIG } from "@/config/api";

const API_BASE_URL = API_CONFIG.BASE_URL;

// ─── Types ─────────────────────────────────────────────────────────────────
interface Goal {
  id: string | number;
  title: string;
  desc: string;
  status: string;
  checked: boolean;
}

interface Toast {
  type: "error" | "success";
  message: string;
}

interface AnalysisResult {
  be: string;
  do: string;
}

interface ApiError extends Error {
  status?: number;
  body?: unknown;
}

// ─── helper: get token ─────────────────────────────────────────────────────
const getToken = (): string => {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("auth_token="))
      ?.split("=")[1] ||
    ""
  );
};

// ─── helper: unified fetch wrapper ────────────────────────────────────────
const apiFetch = async (path: string, options: RequestInit = {}): Promise<unknown> => {
  const token = getToken();
  const url = `${API_BASE_URL}${path}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  };

  console.log(`[API] ${config.method || "GET"} ${url}`);
  if (config.body) console.log("[API] Payload:", JSON.parse(config.body as string));

  const res = await fetch(url, config);
  const text = await res.text();

  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  console.log(`[API] Status: ${res.status}`, json);

  if (!res.ok) {
    const parsed = json as Record<string, unknown> | null;
    const err: ApiError = new Error(
      parsed && typeof parsed === "object"
        ? (parsed?.message as string) || (parsed?.error as string) || `HTTP ${res.status}`
        : `HTTP ${res.status}: ${text}`
    );
    err.status = res.status;
    err.body = json;
    throw err;
  }

  return json;
};

function Tobe() {
  const [bucketList, setBucketList] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customGoal, setCustomGoal] = useState<string>("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [selectedGoalForDelete, setSelectedGoalForDelete] = useState<Goal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // ── Toast timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showError = (msg: string) => setToast({ type: "error", message: msg });
  const showSuccess = (msg: string) => setToast({ type: "success", message: msg });

  // ── FETCH DREAMS ───────────────────────────────────────────────────────
  const fetchBucketList = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/dreams") as Record<string, unknown>;

      let allGoals: Record<string, unknown>[] = [];
      if (data && typeof data === "object" && !Array.isArray(data)) {
        ["dreaming", "planning", "in_progress", "achieved"].forEach((cat) => {
          if (Array.isArray(data[cat])) {
            allGoals = [...allGoals, ...(data[cat] as Record<string, unknown>[])];
          }
        });
        if (!allGoals.length && Array.isArray(data.dreams)) allGoals = data.dreams as Record<string, unknown>[];
        if (!allGoals.length && Array.isArray(data.data))   allGoals = data.data as Record<string, unknown>[];
      } else if (Array.isArray(data)) {
        allGoals = data as Record<string, unknown>[];
      }

      setBucketList(
        allGoals.map((item, i) => ({
          id:      (item.id as string | number) || `dream_${i}`,
          title:   (item.title || item.name || item.goal || "Untitled Goal") as string,
          desc:    (item.desc  || item.description || "") as string,
          status:  (item.status || "") as string,
          checked: false,
        }))
      );
    } catch (err) {
      console.error("[fetchBucketList] failed:", err);
      showError("Could not load your dreams. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBucketList();
  }, []);;

  // ── ADD CUSTOM GOAL  →  POST /dreams ──────────────────────────────────
  const handleAddCustomGoal = async () => {
    if (!customGoal.trim()) { showError("Please enter a goal"); return; }

    setIsAdding(true);
    try {
      const data = await apiFetch("/dreams", {
        method: "POST",
        body: JSON.stringify({
          dream: {
            title:       customGoal.trim(),
            description: "",
            status:      "dreaming",
          },
        }),
      }) as Record<string, unknown>;

      const created = (data?.dream || data?.data || data) as Record<string, unknown>;

      const newGoal: Goal = {
        id:      (created?.id as string | number) || Date.now(),
        title:   (created?.title as string)       || customGoal.trim(),
        desc:    (created?.description || created?.desc || "") as string,
        status:  (created?.status as string)      || "dreaming",
        checked: true,
      };

      setBucketList((prev) => [...prev, newGoal]);
      setCustomGoal("");
      showSuccess("Goal added successfully!");
    } catch (err) {
      console.error("[handleAddCustomGoal] failed:", err);
      showError((err as ApiError).message || "Failed to add goal. Check console for details.");
    } finally {
      setIsAdding(false);
    }
  };

  // ── DELETE GOAL  →  DELETE /dreams/:id ────────────────────────────────
  const deleteGoalFromBackend = async (goal: Goal): Promise<boolean> => {
    setDeletingId(goal.id);
    try {
      await apiFetch(`/dreams/${goal.id}`, { method: "DELETE" });
      setBucketList((prev) => prev.filter((g) => g.id !== goal.id));
      showSuccess("Goal deleted successfully!");
      return true;
    } catch (err) {
      console.error("[deleteGoalFromBackend] failed:", err);
      showError((err as ApiError).message || "Could not delete goal. Check console for details.");
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // ── SAVE EXERCISE  →  POST /be_do_have_exercise ───────────────────────
  const saveExerciseToBackend = async () => {
    const selected = bucketList.filter((g) => g.checked);
    if (!selected.length) { showError("Please select at least one goal"); return; }

    setIsSaving(true);
    try {
      await apiFetch("/be_do_have_exercise", {
        method: "POST",
        body: JSON.stringify({
          be_do_have_exercise: {
            be_identity: analysisResult?.be || "",
            do_actions:  analysisResult?.do || "",
          },
          goal_ids: selected.map((g) => g.id),
        }),
      });
      showSuccess("Goals saved successfully!");
    } catch (err) {
      console.error("[saveExerciseToBackend] failed:", err);
      showError((err as ApiError).message || "Failed to save goals. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── AI ANALYSIS ───────────────────────────────────────────────────────
  const handleAnalyzeAI = async () => {
    const selected = bucketList.filter((g) => g.checked);
    if (!selected.length) { showError("Please select at least one goal to analyze"); return; }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const goals = selected.map((g) => g.title.toLowerCase());

      let be = "", doA = "";
      if (goals.some((g) => g.includes("beach") || g.includes("house") || g.includes("property"))) {
        be  = "Real Estate Investor & Property Owner";
        doA = "Research property markets, save for down payment, learn about property management";
      } else if (goals.some((g) => g.includes("marathon") || g.includes("run") || g.includes("fitness"))) {
        be  = "Dedicated Athlete & Health Enthusiast";
        doA = "Follow structured training plan, maintain proper nutrition, track progress regularly";
      } else if (goals.some((g) => g.includes("business") || g.includes("company") || g.includes("startup"))) {
        be  = "Entrepreneur & Business Leader";
        doA = "Develop business plan, build network, acquire necessary skills, secure funding";
      } else if (goals.some((g) => g.includes("learn") || g.includes("skill") || g.includes("education"))) {
        be  = "Continuous Learner & Knowledge Seeker";
        doA = "Enroll in courses, practice daily, join study groups, teach others";
      } else {
        be  = "Goal-Oriented Achiever";
        doA = "Break down goals into actionable steps, track progress, stay consistent";
      }

      setAnalysisResult({ be, do: doA });

      try {
        await apiFetch("/be_do_have_exercise", {
          method: "POST",
          body: JSON.stringify({
            be_do_have_exercise: { be_identity: be, do_actions: doA },
            goal_ids: selected.map((g) => g.id),
          }),
        });
      } catch (e) {
        console.warn("[handleAnalyzeAI] analysis save failed (non-blocking):", e);
      }
    } catch (err) {
      console.error("[handleAnalyzeAI] failed:", err);
      showError("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleToggleCheck = (id: string | number) =>
    setBucketList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, checked: !g.checked } : g))
    );

  const handleDeleteClick = (goal: Goal, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGoalForDelete(goal);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedGoalForDelete) return;
    setShowDeleteConfirm(false);
    await deleteGoalFromBackend(selectedGoalForDelete);
    setSelectedGoalForDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedGoalForDelete(null);
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">Loading your Dreams...</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf9fc] p-4 md:p-8 font-sans text-gray-800 relative">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Target className="text-purple-600" size={24} />
            Be-Do-Have Exercise
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Work backwards from your goals. Select what you want to{" "}
            <span className="font-bold">HAVE</span>, and AI will help you understand who
            you need to <span className="font-bold">BE</span> and what you need to{" "}
            <span className="font-bold">DO</span>.
          </p>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { letter: "H", label: "HAVE", sub: "Your goals",         bg: "bg-green-100",  text: "text-green-600",  icon: null },
            { letter: "D", label: "DO",   sub: "Actions & habits",   bg: "bg-blue-100",   text: "text-blue-500",   icon: <Zap size={24} strokeWidth={2.5} /> },
            { letter: "B", label: "BE",   sub: "Identity & mindset", bg: "bg-purple-100", text: "text-purple-600", icon: <User size={24} strokeWidth={2.5} /> },
          ].map(({ letter, label, sub, bg, text, icon }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full ${bg} ${text} flex items-center justify-center font-bold text-xl mb-3`}>
                {icon || letter}
              </div>
              <h3 className="font-bold text-gray-900">{label}</h3>
              <p className="text-sm text-gray-500">{sub}</p>
            </div>
          ))}
        </div>

        {/* MAIN CARD */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg">H</div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">What I want to HAVE</h3>
              <p className="text-sm text-gray-500">Select from bucket list or add custom goals</p>
            </div>
          </div>

          {/* BUCKET LIST */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">From Your Bucket List:</p>
            {bucketList.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm bg-gray-50">
                No items yet. Add a custom goal below!
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {bucketList.map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                      goal.checked
                        ? "border-green-400 bg-green-50/50 shadow-sm"
                        : "border-gray-200 hover:border-green-200 bg-white"
                    }`}
                  >
                    <div
                      className="flex-1 flex items-start gap-3 cursor-pointer"
                      onClick={() => handleToggleCheck(goal.id)}
                    >
                      <input
                        type="checkbox"
                        checked={goal.checked}
                        onChange={() => handleToggleCheck(goal.id)}
                        className="mt-1 w-4 h-4 accent-green-500 cursor-pointer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-gray-800 flex items-center flex-wrap gap-2">
                          {goal.title}
                          {goal.status && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full uppercase tracking-wider font-semibold border border-gray-200">
                              {goal.status.replace("_", " ")}
                            </span>
                          )}
                        </h4>
                        {goal.desc && <p className="text-xs text-gray-500 mt-1">{goal.desc}</p>}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteClick(goal, e)}
                      disabled={deletingId === goal.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      title="Delete goal"
                    >
                      {deletingId === goal.id
                        ? <span className="text-xs text-gray-400">...</span>
                        : <Trash2 size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI RESULTS */}
          {analysisResult && (
            <div className="mb-6 p-5 bg-purple-50 border border-purple-100 rounded-xl shadow-sm">
              <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-lg">
                <Sparkles size={20} className="text-purple-600" /> AI Analysis Results
              </h4>
              <div className="space-y-4">
                {[
                  { key: "be" as const, label: "Who you need to BE:", badge: "BE", color: "purple" },
                  { key: "do" as const, label: "What you need to DO:", badge: "DO", color: "blue" },
                ].map(({ key, label, badge, color }) => (
                  <div key={key}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-full bg-${color}-200 text-${color}-800 flex items-center justify-center text-xs font-bold`}>
                        {badge}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{label}</span>
                    </div>
                    <p className={`text-sm text-gray-800 bg-white p-3.5 rounded-lg border border-${color}-100 shadow-sm`}>
                      {analysisResult[key]}
                    </p>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 pt-3 border-t border-purple-100 text-xs text-purple-600 font-medium">
                  <Sparkles size={12} />
                  <span>Analysis based on your selected goals</span>
                </div>
              </div>
            </div>
          )}

          {/* ADD CUSTOM GOAL */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Add Custom Goal:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isAdding && handleAddCustomGoal()}
                placeholder="e.g., Own a beach house, Run a marathon..."
                className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isAdding}
              />
              <button
                onClick={handleAddCustomGoal}
                disabled={isAdding}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm shadow-sm"
              >
                <Plus size={18} />
                {isAdding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalyzeAI}
              disabled={isAnalyzing}
              className="flex-1 bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-red-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles size={18} />
              {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
            </button>
            <button
              onClick={saveExerciseToBackend}
              disabled={isSaving}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Goals"}
            </button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && selectedGoalForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Goal</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete &quot;{selectedGoalForDelete.title}&quot;? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={cancelDelete} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 ${toast.type === "error" ? "bg-red-500" : "bg-green-500"} text-white px-4 py-3 rounded-lg shadow-lg flex flex-col min-w-[260px] z-50`}>
          <span className="font-bold text-sm">{toast.type === "error" ? "Error" : "Success"}</span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Tobe;