import { useState, useEffect, useCallback } from "react";
import { Zap, User, Plus, Sparkles, Target, Save, Trash2 } from "lucide-react";
import { API_CONFIG, getAuthHeaders } from "@/config/api";

const API_BASE_URL = API_CONFIG.BASE_URL;

function Tobe() {
  // --- STATE ---
  const [bucketList, setBucketList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customGoal, setCustomGoal] = useState("");
  const [toast, setToast] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedGoalForDelete, setSelectedGoalForDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exerciseData, setExerciseData] = useState(null);

  // =========================================
  // TOAST TIMER FIX
  // =========================================
  useEffect(() => {
    let timer;
    if (toast) {
      timer = setTimeout(() => setToast(null), 3000);
    }
    return () => clearTimeout(timer);
  }, [toast]);

  const showError = (message) => {
    setToast({ type: "error", message });
  };

  const showSuccess = (message) => {
    setToast({ type: "success", message });
  };

  // =========================================
  // API INTEGRATION: FETCH BUCKET LIST (DREAMS)
  // =========================================
  const fetchBucketList = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dreams`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dreams from server");
      }

      const data = await response.json();
      console.log("Fetched Dreams API Data:", data);

      // 🚀 NEW LOGIC: Extract arrays from dreaming, planning, in_progress, achieved
      let allGoals = [];

      if (data && typeof data === "object" && !Array.isArray(data)) {
        const categories = ["dreaming", "planning", "in_progress", "achieved"];

        categories.forEach((category) => {
          if (Array.isArray(data[category])) {
            // Har category ke items nikalo aur array me jod do
            allGoals = [...allGoals, ...data[category]];
          }
        });

        // Fallback agar koi aur structure hua toh
        if (allGoals.length === 0 && Array.isArray(data.dreams))
          allGoals = data.dreams;
        if (allGoals.length === 0 && Array.isArray(data.data))
          allGoals = data.data;
      } else if (Array.isArray(data)) {
        allGoals = data;
      }

      // 🛠 MAPPING
      const mappedData = allGoals.map((item, index) => {
        return {
          id: item.id || `dream_${index}`,
          // Agar title empty string "" hai, toh fallback "Untitled Goal" use karo
          title: item.title || item.name || item.goal || "Untitled Goal",
          desc: item.desc || item.description || "",
          status: item.status || "", // "planning", "dreaming" etc. dikhane ke liye
          checked: false, // Default un-checked rakhna theek hai analysis ke liye
        };
      });

      setBucketList(mappedData);
    } catch (error) {
      console.error("Error fetching bucket list (dreams):", error);
      showError("Could not load your dreams. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBucketList();
  }, [fetchBucketList]);

  // =========================================
  // API INTEGRATION: SAVE EXERCISE (POST Method)
  // =========================================
  const saveExerciseToBackend = async () => {
    const selectedGoals = bucketList.filter((g) => g.checked);

    if (selectedGoals.length === 0) {
      showError("Please select at least one goal");
      return false;
    }

    setIsSaving(true);

    try {
      const goalIds = selectedGoals.map((g) => g.id);
      
      const filteredGoalIds = goalIds.filter(id => {
        if (typeof id === 'string' && id.startsWith('dream_')) return false;
        // If it's a number from Date.now(), it's likely a local unsaved goal
        if (typeof id === 'number' && id > 1700000000000) return false; 
        return true;
      });

      const payload = {
        be_do_have_exercise: {
          be_identity: analysisResult?.be || "",
          do_actions: analysisResult?.do || "",
        },
        goal_ids: filteredGoalIds,
      };

      const response = await fetch(`${API_BASE_URL}/be_do_have_exercise`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("POST Response:", response.status, result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to save exercise");
      }

      // Store the exercise data from API response
      setExerciseData({
        id: result.id,
        be_identity: result.be_identity,
        do_actions: result.do_actions,
        have_goals: result.have_goals,
        updated_at: result.updated_at,
      });

      console.log("Exercise saved successfully:", result);
      showSuccess(`✓ Exercise saved (ID: ${result.id})`);

      return true;
    } catch (error) {
      console.error("Error with exercise action:", error);
      showError(error.message || "Failed to save goals. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================
  // API INTEGRATION: DELETE GOAL (DELETE Method)
  // =========================================
  const deleteGoalFromBackend = async (goal) => {
    // If it's a custom goal added locally, just remove it from state
    if (goal.status === "custom") {
      setBucketList(bucketList.filter((g) => g.id !== goal.id));
      showSuccess("Goal removed from list");
      return true;
    }

    try {
      // For goals fetched from /dreams, use the dreams delete endpoint
      const response = await fetch(`${API_BASE_URL}/dreams/${goal.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      console.log("DELETE Response:", response.status, data);

      // Check if response contains success message
      if (response.ok || data.message?.includes("deleted")) {
        console.log("Goal deleted successfully from backend");
        setBucketList(bucketList.filter((g) => g.id !== goal.id));
        showSuccess(data.message || "Goal deleted successfully!");
        return true;
      } else {
        throw new Error(data.message || "Failed to delete goal from server");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      showError("Could not delete goal. Please try again.");
      return false;
    }
  };

  // =========================================
  // API INTEGRATION: SAVE ANALYSIS (POST Method)
  // =========================================
  const saveAnalysisToBackend = async (beData, doData, goalIds) => {
    try {
      const filteredGoalIds = goalIds.filter(id => {
        if (typeof id === 'string' && id.startsWith('dream_')) return false;
        if (typeof id === 'number' && id > 1700000000000) return false;
        return true;
      });

      const payload = {
        be_do_have_exercise: {
          be_identity: beData,
          do_actions: doData,
        },
        goal_ids: filteredGoalIds,
      };

      const response = await fetch(`${API_BASE_URL}/be_do_have_exercise`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Analysis POST Response:", response.status, result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to save analysis to server");
      }

      // Store the exercise data from API response
      setExerciseData({
        id: result.id,
        be_identity: result.be_identity,
        do_actions: result.do_actions,
        have_goals: result.have_goals,
        updated_at: result.updated_at,
      });

      console.log("Analysis saved successfully:", result);
      showSuccess(`✓ Analysis saved (ID: ${result.id})`);

      return result;
    } catch (error) {
      console.error("Error saving analysis:", error);
      showError(error.message || "Failed to save analysis. Please try again.");
      return null;
    }
  };

  // --- HANDLERS ---

  const handleToggleCheck = (id) => {
    setBucketList(
      bucketList.map((goal) =>
        goal.id === id ? { ...goal, checked: !goal.checked } : goal,
      ),
    );
  };

  const handleDeleteClick = (goal, e) => {
    e.stopPropagation();
    setSelectedGoalForDelete(goal);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedGoalForDelete) {
      setShowDeleteConfirm(false);
      await deleteGoalFromBackend(selectedGoalForDelete);
      setSelectedGoalForDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedGoalForDelete(null);
  };

  const handleAddCustomGoal = async () => {
    if (!customGoal.trim()) {
      showError("Please enter a goal");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: customGoal,
        description: "Custom goal from Be-Do-Have",
        category: "Personal",
        status: "dreaming",
      };

      const response = await fetch(`${API_BASE_URL}/dreams`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save custom goal");

      const savedGoal = await response.json();
      
      const newGoal = {
        id: savedGoal.id,
        title: savedGoal.title || customGoal,
        desc: savedGoal.description || "Custom goal",
        status: savedGoal.status || "dreaming",
        checked: true,
      };

      setBucketList([...bucketList, newGoal]);
      setCustomGoal("");
      showSuccess("Goal added and saved to bucket list!");
    } catch (error) {
      console.error("Error adding custom goal:", error);
      // Fallback to local only if API fails, but warn user
      const localGoal = {
        id: Date.now(),
        title: customGoal,
        desc: "Custom goal (Local only)",
        status: "custom",
        checked: true,
      };
      setBucketList([...bucketList, localGoal]);
      setCustomGoal("");
      showError("Could not save to server, added locally.");
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================
  // AI ANALYSIS FUNCTION
  // =========================================
  const handleAnalyzeAI = async () => {
    const selectedGoals = bucketList.filter((g) => g.checked);

    if (selectedGoals.length === 0) {
      showError("Please select at least one goal to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const goalIds = selectedGoals.map((goal) => goal.id);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const goals = selectedGoals.map((g) => g.title.toLowerCase());

      let beIdentity = "";
      let doActions = "";

      if (
        goals.some(
          (g) =>
            g.includes("beach") ||
            g.includes("house") ||
            g.includes("property"),
        )
      ) {
        beIdentity = "Real Estate Investor & Property Owner";
        doActions =
          "Research property markets, save for down payment, learn about property management";
      } else if (
        goals.some(
          (g) =>
            g.includes("marathon") ||
            g.includes("run") ||
            g.includes("fitness"),
        )
      ) {
        beIdentity = "Dedicated Athlete & Health Enthusiast";
        doActions =
          "Follow structured training plan, maintain proper nutrition, track progress regularly";
      } else if (
        goals.some(
          (g) =>
            g.includes("business") ||
            g.includes("company") ||
            g.includes("startup"),
        )
      ) {
        beIdentity = "Entrepreneur & Business Leader";
        doActions =
          "Develop business plan, build network, acquire necessary skills, secure funding";
      } else if (
        goals.some(
          (g) =>
            g.includes("learn") ||
            g.includes("skill") ||
            g.includes("education"),
        )
      ) {
        beIdentity = "Continuous Learner & Knowledge Seeker";
        doActions =
          "Enroll in courses, practice daily, join study groups, teach others";
      } else {
        beIdentity = "Goal-Oriented Achiever";
        doActions =
          "Break down goals into actionable steps, track progress, stay consistent";
      }

      setAnalysisResult({
        be: beIdentity,
        do: doActions,
      });

      // API Call
      await saveAnalysisToBackend(beIdentity, doActions, goalIds);
    } catch (error) {
      console.error("Error in AI analysis:", error);
      showError("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">
          Loading your Dreams...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9fc] p-4 md:p-8 font-sans text-gray-800 relative">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* =========================================
            HEADER SECTION
        ========================================= */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Target className="text-purple-600" size={24} />
            Be-Do-Have Exercise
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Work backwards from your goals. Select what you want to{" "}
            <span className="font-bold">HAVE</span>, and AI will help you
            understand who you need to <span className="font-bold">BE</span> and
            what you need to <span className="font-bold">DO</span>.
          </p>
        </div>

        {/* =========================================
            INFO CARDS (HAVE, DO, BE)
        ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xl mb-3">
              H
            </div>
            <h3 className="font-bold text-gray-900">HAVE</h3>
            <p className="text-sm text-gray-500">Your goals</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-3">
              <Zap size={24} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-gray-900">DO</h3>
            <p className="text-sm text-gray-500">Actions & habits</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
              <User size={24} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-gray-900">BE</h3>
            <p className="text-sm text-gray-500">Identity & mindset</p>
          </div>
        </div>

        {/* =========================================
            MAIN INTERACTIVE AREA
        ========================================= */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg">
              H
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                What I want to HAVE
              </h3>
              <p className="text-sm text-gray-500">
                Select from bucket list or add custom goals
              </p>
            </div>
          </div>

          {/* DREAMS / BUCKET LIST RENDER SECTION */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              From Your Bucket List:
            </p>

            {bucketList.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm bg-gray-50">
                No items in your bucket list yet. Add a custom goal below!
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
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
                        className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 accent-green-500 cursor-pointer"
                      />
                      <div>
                        {/* Title with Status Badge */}
                        <h4 className="text-sm font-bold text-gray-800 flex items-center flex-wrap gap-2">
                          {goal.title}
                          {goal.status && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full uppercase tracking-wider font-semibold border border-gray-200">
                              {goal.status.replace("_", " ")}
                            </span>
                          )}
                        </h4>
                        {goal.desc && (
                          <p className="text-xs text-gray-500 mt-1">
                            {goal.desc}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteClick(goal, e)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* =========================================
              AI ANALYSIS RESULTS
          ========================================= */}
          {analysisResult && (
            <div className="mb-6 p-5 bg-purple-50 border border-purple-100 rounded-xl shadow-sm animate-fade-in">
              <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2 text-lg">
                <Sparkles size={20} className="text-purple-600" />
                AI Analysis Results
              </h4>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold shadow-sm">
                      BE
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      Who you need to BE:
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 bg-white p-3.5 rounded-lg border border-purple-100 shadow-sm">
                    {analysisResult.be}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold shadow-sm">
                      DO
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      What you need to DO:
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 bg-white p-3.5 rounded-lg border border-blue-100 shadow-sm">
                    {analysisResult.do}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-purple-100 text-xs text-purple-600 font-medium">
                  <Sparkles size={12} />
                  <span>Analysis fetched based on your selected goals</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              SAVED EXERCISE DATA
          ========================================= */}
          {exerciseData && (
            <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-xl shadow-sm animate-fade-in">
              <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
                <Save size={20} className="text-green-600" />
                Exercise Saved Successfully
              </h4>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start p-3 bg-white rounded-lg border border-green-100">
                  <span className="text-gray-600 font-medium">Exercise ID:</span>
                  <span className="text-green-700 font-bold text-lg">#{exerciseData.id}</span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-green-100">
                  <span className="text-gray-600 font-medium block mb-1">Your Identity:</span>
                  <p className="text-gray-800 text-sm">{exerciseData.be_identity}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-green-100">
                  <span className="text-gray-600 font-medium block mb-1">Your Actions:</span>
                  <p className="text-gray-800 text-sm">{exerciseData.do_actions}</p>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500 p-2 bg-white rounded-lg border border-green-100">
                  <span>Saved on:</span>
                  <span className="font-mono text-gray-700">{new Date(exerciseData.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              ADD CUSTOM GOAL SECTION
          ========================================= */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Add Custom Goal:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCustomGoal()}
                placeholder="e.g., Own a beach house, Run a marathon..."
                className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleAddCustomGoal}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm shadow-sm"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* =========================================
              ACTION BUTTONS
          ========================================= */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalyzeAI}
              disabled={isAnalyzing}
              className={`flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                isAnalyzing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Sparkles size={18} />
              {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
            </button>

            <button
              onClick={saveExerciseToBackend}
              disabled={isSaving}
              className={`flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Goals"}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          DELETE CONFIRMATION MODAL
      ========================================= */}
      {showDeleteConfirm && selectedGoalForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Goal
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{selectedGoalForDelete.title}"?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          TOAST NOTIFICATION
      ========================================= */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white px-4 py-3 rounded shadow-lg flex flex-col min-w-[250px] animate-fade-in z-50`}
        >
          <span className="font-bold text-sm">
            {toast.type === "error" ? "Error" : "Success"}
          </span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Tobe;
