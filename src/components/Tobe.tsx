import React, { useState, useEffect } from "react";
import { Zap, User, Plus, Sparkles, Target, Save, Trash2 } from "lucide-react";

// 👇 Backend URL
const API_BASE_URL = "http://localhost:3000";

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

  // =========================================
  // API INTEGRATION: FETCH LIST (GET Method)
  // =========================================
  useEffect(() => {
    fetchBucketList();
  }, []);

  const fetchBucketList = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/be_do_have_exercise`, {
        method: "GET", 
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from server");
      }

      const data = await response.json();
      
      const mappedData = Array.isArray(data) ? data.map(item => ({
        id: item.id,
        title: item.title || item.name || "",
        desc: item.desc || item.description || "",
        checked: item.checked || false
      })) : [];

      setBucketList(mappedData);
    } catch (error) {
      console.error("Error fetching bucket list:", error);
      showError("Could not load your list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================
  // API INTEGRATION: SAVE EXERCISE (POST Method)
  // =========================================
  const saveExerciseToBackend = async () => {
    const selectedGoals = bucketList.filter(g => g.checked);
    
    if (selectedGoals.length === 0) {
      showError("Please select at least one goal to save");
      return false;
    }

    setIsSaving(true);
    
    try {
      const token = localStorage.getItem("token");
      const goalIds = selectedGoals.map(goal => goal.id);
      
      // Generate BE and DO from selected goals or use existing analysis
      let beIdentity = analysisResult?.be || "";
      let doActions = analysisResult?.do || "";
      
      // If no analysis result, generate basic ones
      if (!beIdentity || !doActions) {
        const goals = selectedGoals.map(g => g.title.toLowerCase());
        
        if (goals.some(g => g.includes("beach") || g.includes("house") || g.includes("property"))) {
          beIdentity = "Real Estate Investor & Property Owner";
          doActions = "Research property markets, save for down payment, learn about property management";
        } else if (goals.some(g => g.includes("marathon") || g.includes("run") || g.includes("fitness"))) {
          beIdentity = "Dedicated Athlete & Health Enthusiast";
          doActions = "Follow structured training plan, maintain proper nutrition, track progress regularly";
        } else if (goals.some(g => g.includes("business") || g.includes("company") || g.includes("startup"))) {
          beIdentity = "Entrepreneur & Business Leader";
          doActions = "Develop business plan, build network, acquire necessary skills, secure funding";
        } else {
          beIdentity = "Goal-Oriented Achiever";
          doActions = "Break down goals into actionable steps, track progress, stay consistent";
        }
      }
      
      const payload = {
        be_do_have_exercise: {
          be_identity: beIdentity,
          do_actions: doActions
        },
        goal_ids: goalIds
      };

      const response = await fetch(`${API_BASE_URL}/be_do_have_exercise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to save exercise to server");
      }

      const result = await response.json();
      console.log("Exercise saved successfully:", result);
      
      setToast({
        type: "success",
        message: "Be-Do-Have Exercise saved successfully!"
      });
      
      setTimeout(() => {
        setToast(null);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error("Error saving exercise:", error);
      showError("Could not save exercise. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================
  // API INTEGRATION: DELETE GOAL (DELETE Method)
  // =========================================
  const deleteGoalFromBackend = async (goalId) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/be_do_have_exercise`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ goal_id: goalId })
      });

      if (!response.ok) {
        throw new Error("Failed to delete goal from server");
      }

      const result = await response.json();
      console.log("Goal deleted successfully:", result);
      
      // Remove from local state
      setBucketList(bucketList.filter(goal => goal.id !== goalId));
      
      setToast({
        type: "success",
        message: "Goal deleted successfully!"
      });
      
      setTimeout(() => {
        setToast(null);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      showError("Could not delete goal. Please try again.");
      return false;
    }
  };

  // =========================================
  // API INTEGRATION: CREATE/UPDATE (POST Method) for Analysis
  // =========================================
  const saveAnalysisToBackend = async (beData, doData, goalIds) => {
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        be_do_have_exercise: {
          be_identity: beData,
          do_actions: doData
        },
        goal_ids: goalIds
      };

      const response = await fetch(`${API_BASE_URL}/be_do_have_exercise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to save analysis to server");
      }

      const result = await response.json();
      console.log("Analysis saved successfully:", result);
      
      return result;
    } catch (error) {
      console.error("Error saving analysis:", error);
      showError("Could not save analysis. Please try again.");
      return null;
    }
  };

  // --- HANDLERS ---
  
  // Show error toast notification
  const showError = (message) => {
    setToast({
      type: "error",
      message: message
    });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Toggle checkbox state
  const handleToggleCheck = (id) => {
    setBucketList(bucketList.map(goal => 
      goal.id === id ? { ...goal, checked: !goal.checked } : goal
    ));
  };

  // Handle delete click
  const handleDeleteClick = (goal, e) => {
    e.stopPropagation(); // Prevent toggle when clicking delete
    setSelectedGoalForDelete(goal);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (selectedGoalForDelete) {
      setShowDeleteConfirm(false);
      await deleteGoalFromBackend(selectedGoalForDelete.id);
      setSelectedGoalForDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSelectedGoalForDelete(null);
  };

  // Add custom goal
  const handleAddCustomGoal = () => {
    if (!customGoal.trim()) {
      showError("Please enter a goal");
      return;
    }

    const newGoal = {
      id: Date.now(), // Temporary ID until saved to backend
      title: customGoal,
      desc: "Custom goal",
      checked: true // Auto-check newly added goals
    };

    setBucketList([...bucketList, newGoal]);
    setCustomGoal("");
  };

  // =========================================
  // AI ANALYSIS FUNCTION
  // =========================================
  const handleAnalyzeAI = async () => {
    const selectedGoals = bucketList.filter(g => g.checked);
    
    if (selectedGoals.length === 0) {
      showError("Please select at least one goal to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const goalIds = selectedGoals.map(goal => goal.id);
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const goals = selectedGoals.map(g => g.title.toLowerCase());
      
      let beIdentity = "";
      let doActions = "";
      
      if (goals.some(g => g.includes("beach") || g.includes("house") || g.includes("property"))) {
        beIdentity = "Real Estate Investor & Property Owner";
        doActions = "Research property markets, save for down payment, learn about property management";
      } else if (goals.some(g => g.includes("marathon") || g.includes("run") || g.includes("fitness"))) {
        beIdentity = "Dedicated Athlete & Health Enthusiast";
        doActions = "Follow structured training plan, maintain proper nutrition, track progress regularly";
      } else if (goals.some(g => g.includes("business") || g.includes("company") || g.includes("startup"))) {
        beIdentity = "Entrepreneur & Business Leader";
        doActions = "Develop business plan, build network, acquire necessary skills, secure funding";
      } else if (goals.some(g => g.includes("learn") || g.includes("skill") || g.includes("education"))) {
        beIdentity = "Continuous Learner & Knowledge Seeker";
        doActions = "Enroll in courses, practice daily, join study groups, teach others";
      } else {
        beIdentity = "Goal-Oriented Achiever";
        doActions = "Break down goals into actionable steps, track progress, stay consistent";
      }
      
      setAnalysisResult({
        be: beIdentity,
        do: doActions
      });
      
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
        <p className="text-gray-500 font-medium animate-pulse">Loading your Exercise...</p>
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
            Work backwards from your goals. Select what you want to <span className="font-bold">HAVE</span>, and AI will help you understand who you need to <span className="font-bold">BE</span> and what you need to <span className="font-bold">DO</span>.
          </p>
        </div>

        {/* =========================================
            INFO CARDS (HAVE, DO, BE)
        ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* HAVE Card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xl mb-3">
              H
            </div>
            <h3 className="font-bold text-gray-900">HAVE</h3>
            <p className="text-sm text-gray-500">Your goals</p>
          </div>

          {/* DO Card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-3">
              <Zap size={24} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-gray-900">DO</h3>
            <p className="text-sm text-gray-500">Actions & habits</p>
          </div>

          {/* BE Card */}
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
          
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg">
              H
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">What I want to HAVE</h3>
              <p className="text-sm text-gray-500">Select from bucket list or add custom goals</p>
            </div>
          </div>

          {/* Bucket List Items (Scrollable) with Delete Option */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">From Your Bucket List:</p>
            
            {bucketList.length === 0 ? (
              <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm">
                No items in your bucket list yet. Add a custom goal below!
              </div>
            ) : (
              <div className="max-h-[260px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {bucketList.map((goal) => (
                  <div 
                    key={goal.id} 
                    className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                      goal.checked ? 'border-green-400 bg-green-50/30' : 'border-gray-200 hover:border-green-200 bg-white'
                    }`}
                  >
                    <div 
                      className="flex-1 flex items-start gap-3 cursor-pointer"
                      onClick={() => handleToggleCheck(goal.id)}
                    >
                      <input 
                        type="checkbox" 
                        checked={goal.checked}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 accent-green-500 cursor-pointer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{goal.title}</h4>
                        {goal.desc && <p className="text-xs text-gray-500 mt-0.5">{goal.desc}</p>}
                      </div>
                    </div>
                    
                    {/* Delete Button */}
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

          {/* Add Custom Goal Input */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Add Custom Goal:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomGoal()}
                placeholder="e.g., Own a beach house, Run a marathon..."
                className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleAddCustomGoal}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors text-sm shadow-sm"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Analyze AI Button */}
            <button
              onClick={handleAnalyzeAI}
              disabled={isAnalyzing}
              className={`flex-1 bg-[#f1ebff] hover:bg-[#e6dcff] text-[#6d28d9] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Sparkles size={18} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </button>

            {/* Save Be-Do-Have Exercise Button */}
            <button
              onClick={saveExerciseToBackend}
              disabled={isSaving}
              className={`flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Be-Do-Have Exercise'}
            </button>
          </div>

          {/* =========================================
              AI ANALYSIS RESULTS
          ========================================= */}
          {analysisResult && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-100 rounded-lg animate-fade-in">
              <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                <Sparkles size={18} />
                AI Analysis Results
              </h4>
              
              <div className="space-y-4">
                {/* BE Result */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">
                      BE
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Who you need to BE:</span>
                  </div>
                  <p className="text-sm text-gray-800 bg-white p-3 rounded border border-purple-200">
                    {analysisResult.be}
                  </p>
                </div>

                {/* DO Result */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">
                      DO
                    </div>
                    <span className="text-sm font-semibold text-gray-700">What you need to DO:</span>
                  </div>
                  <p className="text-sm text-gray-800 bg-white p-3 rounded border border-blue-200">
                    {analysisResult.do}
                  </p>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  ✓ Analysis saved to your profile
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          DELETE CONFIRMATION MODAL
      ========================================= */}
      {showDeleteConfirm && selectedGoalForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Goal</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{selectedGoalForDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
        <div className={`fixed bottom-6 right-6 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-3 rounded shadow-lg flex flex-col min-w-[250px] animate-fade-in z-50`}>
          <span className="font-bold text-sm">{toast.type === 'error' ? 'Error' : 'Success'}</span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Tobe;