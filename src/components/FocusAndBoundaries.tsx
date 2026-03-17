import React, { useState, useEffect } from "react";
import { Target, Info, Check, CircleDot, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type MatrixColor = "red" | "green" | "yellow" | "gray";

interface MatrixItem {
  value: number;
  label: string;
  emoji: string;
  color: MatrixColor;
}

interface BalanceItem {
  id: string;
  emoji: string;
  score: number;
}

interface GoalItem {
  id: number;
  title: string;
  category: string;
  progress: number;
  completed: boolean;
}

export interface FocusData {
  matrix: Record<string, MatrixItem>;
  balance: BalanceItem[];
  goals: GoalItem[];
  sayNoText: string;
}

export const defaultFocusData: FocusData = {
  matrix: {
    q1: { value: 0, label: "Imp & Urgent", emoji: "🔥", color: "red" },
    q2: { value: 1, label: "Imp not Urgent", emoji: "🎯", color: "green" },
    q3: { value: 0, label: "Not imp Urgent", emoji: "⚡", color: "yellow" },
    q4: {
      value: 0,
      label: "Not imp not Urgent",
      emoji: "💤",
      color: "gray",
    },
  },
  balance: [
    { id: "1", emoji: "💼", score: 1 },
    { id: "2", emoji: "💪", score: 0 },
    { id: "3", emoji: "❤️", score: 0 },
    { id: "4", emoji: "🌱", score: 0 },
    { id: "5", emoji: "💰", score: 0 },
  ],
  goals: [],
  sayNoText: "",
};

interface FocusAndBoundariesProps {
  data: FocusData;
  setData: React.Dispatch<React.SetStateAction<FocusData>>;
  apiGoals?: any[]; // Kept for backwards compatibility but we fetch inside now
}

function FocusAndBoundaries({ data, setData }: FocusAndBoundariesProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [goalsList, setGoalsList] = useState<any[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);

  // Fetch Goals from API
  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoadingGoals(true);
      try {
        const token = localStorage.getItem("auth_token") || "";
        const res = await fetch("https://life-api.lockated.com/goals", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const responseData = await res.json();
          const rawGoals = Array.isArray(responseData)
            ? responseData
            : responseData.goals || responseData.data || [];
          setGoalsList(rawGoals);
        }
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      } finally {
        setIsLoadingGoals(false);
      }
    };

    fetchGoals();
  }, []);

  // Update progress instantly in the UI while dragging
  const handleProgressChange = (id: number | string, newProgress: number) => {
    setGoalsList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, progress: newProgress } : g)),
    );
  };

  // Commit the progress to the API when the user releases the slider
  const handleProgressCommit = async (
    id: number | string,
    finalProgress: number,
  ) => {
    try {
      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch(`https://life-api.lockated.com/goals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ goal: { progress: finalProgress } }),
      });

      if (res.ok) {
        toast({
          title: "Goal Updated",
          description: "Goal progress updated successfully",
        });
      } else {
        throw new Error("Failed to update progress");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update goal progress",
        variant: "destructive",
      });
    }
  };

  // Toggle goal completion checkbox
  const toggleGoalStatus = async (goal: any) => {
    const isCompleted = goal.status === "completed" || goal.completed;
    const newStatus = isCompleted ? "in_progress" : "completed";
    const newProgress = newStatus === "completed" ? 100 : goal.progress;

    // Optimistic UI Update
    setGoalsList((prev) =>
      prev.map((g) =>
        g.id === goal.id
          ? { ...g, status: newStatus, progress: newProgress }
          : g,
      ),
    );

    try {
      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch(
        `https://life-api.lockated.com/goals/${goal.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            goal: { status: newStatus, progress: newProgress },
          }),
        },
      );

      if (res.ok) {
        toast({
          title: "Goal Updated",
          description: `Goal marked as ${newStatus === "completed" ? "completed" : "in progress"}`,
        });
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update goal status",
        variant: "destructive",
      });
    }
  };

  const handleSayNoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData((prev) => ({ ...prev, sayNoText: e.target.value }));
  };

  const getMatrixStyles = (color: MatrixColor) => {
    const styles: Record<MatrixColor, string> = {
      red: "bg-red-50 border-red-300 text-red-700",
      green: "bg-emerald-50 border-emerald-300 text-emerald-700",
      yellow: "bg-yellow-50 border-yellow-300 text-amber-700",
      gray: "bg-slate-50 border-slate-300 text-slate-600",
    };
    return styles[color];
  };

  return (
    <div className="w-full overflow-hidden font-sans">
      {/* Violet Header */}
      <div className="px-6 pt-5 pb-4 border-b border-violet-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600 shadow-sm shrink-0">
            <Target className="text-white w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-[17px] font-bold text-gray-900">
                Focus & Boundaries
              </h2>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Prioritize what matters and protect your focus
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 bg-violet-50/30">
        {/* Matrix + Life Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-xl p-4 border border-sky-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[15px] font-bold text-gray-800">
                Eisenhower Matrix
              </h3>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(data.matrix).map(([key, item]) => (
                <div
                  key={key}
                  className={`min-h-[92px] rounded-xl border flex flex-col items-center justify-center px-2 ${getMatrixStyles(
                    item.color,
                  )}`}
                >
                  <span className="text-[26px] font-extrabold leading-none">
                    {item.value}
                  </span>
                  <span className="text-[12px] font-bold uppercase mt-1">
                    {key}
                  </span>
                  <span className="text-[12px] mt-1 font-medium text-center">
                    {item.emoji} {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-gray-500 italic mt-3">
              Focus on Q2 for growth
            </p>
          </div>

          <div className="bg-[#fff8f8] rounded-xl p-4 border border-rose-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[15px] font-bold text-gray-800">
                Life Balance Overview
              </h3>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>

            <div className="space-y-3">
              {data.balance.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-lg w-5">{item.emoji}</span>
                  <div className="flex-1 h-4 rounded-full border border-rose-200 bg-white overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-400"
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-[22px] leading-none font-semibold text-gray-700">
                    {item.score}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-gray-500 italic mt-4">
              Balance across all areas
            </p>
          </div>
        </div>

        {/* Goals List with Interactive Sliders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-gray-800">
                Goals in Focus
              </h3>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <button
              onClick={() => navigate("/goals-habits")}
              className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 text-[13px] font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              Manage Goals
            </button>
          </div>

          {isLoadingGoals ? (
            <div className="bg-white border border-violet-100 rounded-xl min-h-[190px] flex flex-col items-center justify-center text-center p-6 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-3" />
              <p className="text-[15px] text-gray-500">Loading your goals...</p>
            </div>
          ) : goalsList.length === 0 ? (
            <div className="bg-white border border-violet-100 rounded-xl min-h-[190px] flex flex-col items-center justify-center text-center p-6 shadow-sm">
              <CircleDot
                className="w-14 h-14 text-gray-300 mb-3"
                strokeWidth={1.5}
              />
              <p className="text-[18px] font-medium text-gray-500 mb-3">
                No goals yet. Create your first goal!
              </p>
              <button
                onClick={() =>
                  navigate("/goals-habits", {
                    state: { openGoalDialog: true },
                  })
                }
                className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-[14px] font-semibold shadow-sm hover:bg-gray-50 transition-colors"
              >
                Create Goal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {goalsList.map((goal) => {
                const isCompleted =
                  goal.status === "completed" || goal.completed;
                const progressValue = goal.progress || 0;

                return (
                  <div
                    key={goal.id}
                    className="bg-[#faf5ff] rounded-xl p-5 border border-purple-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleGoalStatus(goal)}
                          className={`flex items-center justify-center w-[22px] h-[22px] rounded-md border-2 transition-colors ${
                            isCompleted
                              ? "bg-gray-900 border-gray-900 text-white"
                              : "bg-white border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {isCompleted && (
                            <Check strokeWidth={3} className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span
                          className={`text-[16px] font-bold ${isCompleted ? "text-gray-400 line-through" : "text-gray-900"}`}
                        >
                          {goal.title}
                        </span>
                      </div>
                      <span className="text-[12px] font-bold text-gray-700 bg-white border border-gray-200 shadow-sm px-2.5 py-1 rounded-md">
                        {goal.area || goal.category || "Relationships"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pl-9">
                      <span className="text-[13px] text-gray-500 font-medium">
                        Progress
                      </span>

                      {/* Interactive Native Slider matching the video */}
                      <div className="flex-1 relative flex items-center h-6">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressValue}
                          onChange={(e) =>
                            handleProgressChange(
                              goal.id,
                              parseInt(e.target.value),
                            )
                          }
                          onMouseUp={(e) =>
                            handleProgressCommit(
                              goal.id,
                              parseInt((e.target as HTMLInputElement).value),
                            )
                          }
                          onTouchEnd={(e) =>
                            handleProgressCommit(
                              goal.id,
                              parseInt((e.target as HTMLInputElement).value),
                            )
                          }
                          className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer bg-transparent z-10
                                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                     [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-800 [&::-webkit-slider-thumb]:rounded-full
                                     [&::-webkit-slider-thumb]:shadow-md"
                          style={{
                            background: `linear-gradient(to right, #1f2937 0%, #1f2937 ${progressValue}%, #e5e7eb ${progressValue}%, #e5e7eb 100%)`,
                          }}
                        />
                      </div>
                      <span className="text-[14px] font-bold text-purple-700 w-9 text-right">
                        {progressValue}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Say No */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[16px] font-bold text-gray-800">
              What I'll Say NO To
            </h3>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </div>
          <textarea
            value={data.sayNoText}
            onChange={handleSayNoChange}
            placeholder="List things you'll decline or avoid to create space for your priorities..."
            className="w-full min-h-[100px] p-4 bg-white border border-gray-300 rounded-xl text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-y shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default FocusAndBoundaries;
