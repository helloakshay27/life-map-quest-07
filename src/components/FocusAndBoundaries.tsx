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
    q1: { value: 0, label: "Imp & Urgent",       emoji: "🔥", color: "red"    },
    q2: { value: 1, label: "Imp not Urgent",      emoji: "🎯", color: "green"  },
    q3: { value: 0, label: "Not imp Urgent",      emoji: "⚡", color: "yellow" },
    q4: { value: 0, label: "Not imp not Urgent",  emoji: "💤", color: "gray"   },
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
  apiGoals?: any[];
}

function FocusAndBoundaries({ data, setData }: FocusAndBoundariesProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [goalsList, setGoalsList] = useState<any[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);

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

  const handleProgressChange = (id: number | string, newProgress: number) => {
    setGoalsList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, progress: newProgress } : g)),
    );
  };

  const handleProgressCommit = async (id: number | string, finalProgress: number) => {
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
        toast({ title: "Goal Updated", description: "Goal progress updated successfully" });
      } else {
        throw new Error("Failed to update progress");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update goal progress", variant: "destructive" });
    }
  };

  const toggleGoalStatus = async (goal: any) => {
    const isCompleted = goal.status === "completed" || goal.completed;
    const newStatus = isCompleted ? "in_progress" : "completed";
    const newProgress = newStatus === "completed" ? 100 : goal.progress;

    setGoalsList((prev) =>
      prev.map((g) =>
        g.id === goal.id ? { ...g, status: newStatus, progress: newProgress } : g,
      ),
    );

    try {
      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch(`https://life-api.lockated.com/goals/${goal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ goal: { status: newStatus, progress: newProgress } }),
      });

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
      toast({ title: "Error", description: "Failed to update goal status", variant: "destructive" });
    }
  };

  const handleSayNoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData((prev) => ({ ...prev, sayNoText: e.target.value }));
  };

  // Matrix styles mapped to Semantic Tertiary colors & Mist
  const getMatrixStyles = (color: MatrixColor) => {
    const styles: Record<MatrixColor, string> = {
      red:    "bg-[#A32D2D]/[0.08] border-[#A32D2D]/30 text-[#A32D2D]", // Crimson
      green:  "bg-[#0B5D41]/[0.08] border-[#0B5D41]/30 text-[#0B5D41]", // Forest
      yellow: "bg-[#BA7517]/[0.08] border-[#BA7517]/30 text-[#BA7517]", // Amber
      gray:   "bg-[#D5D8D8]/40 border-[#D6B99D] text-[#888780]",        // Mist / Stone
    };
    return styles[color];
  };

  // Tooltip component
  const Tooltip = ({ text, alignLeft = true }: { text: string; alignLeft?: boolean }) => (
    <span className="relative group">
      <Info className="w-4 h-4 text-[#DA7756] cursor-help" />
      <span
        className={`absolute ${alignLeft ? "left-0" : "left-1/2 -translate-x-1/2"} top-full mt-2 bg-[#2C2C2A] text-white text-xs font-medium rounded-lg px-3 py-2 w-80 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg`}
      >
        {text}
        <span className={`absolute ${alignLeft ? "left-3" : "left-1/2 -translate-x-1/2"} bottom-full w-0 h-0 border-4 border-transparent border-b-[#2C2C2A]`} />
      </span>
    </span>
  );

  return (
    <div className="w-full overflow-hidden font-sans bg-[#FEF4EE]">

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#D6B99D] bg-[#FEF4EE]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#DA7756] shadow-sm shrink-0">
            <Target className="text-white w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold text-[#2C2C2A]">
                Focus &amp; Boundaries
              </h2>
              <Tooltip text="Prioritize what matters most this week and set boundaries to protect your focus time." />
            </div>
            <p className="text-[13px] text-[#888780] mt-0.5">
              Prioritize what matters and protect your focus
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 bg-white">

        {/* Matrix + Life Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Eisenhower Matrix */}
          <div className="bg-[#FEF4EE] rounded-xl p-4 border border-[#D6B99D] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-[#2C2C2A]">
                Eisenhower Matrix
              </h3>
              <Tooltip text="Q1: Do immediately (urgent+important), Q2: Schedule it (important, not urgent - most impactful!), Q3: Delegate (urgent, not important), Q4: Eliminate (neither)" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(data.matrix).map(([key, item]) => (
                <div
                  key={key}
                  className={`min-h-[92px] rounded-xl border flex flex-col items-center justify-center px-2 ${getMatrixStyles(item.color)}`}
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
            <p className="text-[13px] text-[#888780] italic mt-3">
              Focus on Q2 for growth
            </p>
          </div>

          {/* Life Balance Overview */}
          <div className="bg-[#FEF4EE] rounded-xl p-4 border border-[#D6B99D] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-[#2C2C2A]">
                Life Balance Overview
              </h3>
              <Tooltip
                text="Shows how many priorities you've assigned to each life area. Aim for balance across all areas for holistic growth."
                alignLeft={false}
              />
            </div>

            <div className="space-y-3">
              {data.balance.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-lg w-5">{item.emoji}</span>
                  <div className="flex-1 h-4 rounded-full border border-[#D6B99D] bg-white overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#DA7756]"
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-[22px] leading-none font-semibold text-[#2C2C2A]">
                    {item.score}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-[#888780] italic mt-4">
              Balance across all areas
            </p>
          </div>
        </div>

        {/* Goals List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#2C2C2A]">
                Goals in Focus
              </h3>
              <Tooltip text="Select 2-3 goals to prioritize this week. Update progress using the sliders. Focusing on fewer goals increases completion rate." />
            </div>
            <button
              onClick={() => navigate("/goals-habits")}
              className="text-[#DA7756] hover:text-[#C26547] text-xs font-semibold transition-colors"
            >
              Manage Goals
            </button>
          </div>

          {isLoadingGoals ? (
            <div className="bg-[#FEF4EE] border border-[#D6B99D] rounded-xl min-h-[190px] flex flex-col items-center justify-center text-center p-6 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#DA7756] mb-3" />
              <p className="text-sm text-[#888780]">Loading your goals...</p>
            </div>
          ) : goalsList.length === 0 ? (
            <div className="bg-[#FEF4EE] border border-[#D6B99D] rounded-xl min-h-[190px] flex flex-col items-center justify-center text-center p-6 shadow-sm">
              <CircleDot className="w-14 h-14 text-[#D6B99D] mb-3" strokeWidth={1.5} />
              <p className="text-[15px] font-medium text-[#888780] mb-3">
                No goals yet. Create your first goal!
              </p>
              <button
                onClick={() => navigate("/goals-habits", { state: { openGoalDialog: true } })}
                className="border border-[#D6B99D] hover:border-[#DA7756] bg-white text-[#2C2C2A] text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
              >
                Create Goal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {goalsList.map((goal) => {
                const isCompleted = goal.status === "completed" || goal.completed;
                const progressValue = goal.progress || 0;

                return (
                  <div
                    key={goal.id}
                    className="bg-[#FEF4EE] rounded-xl p-5 border border-[#D6B99D] shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleGoalStatus(goal)}
                          className={`flex items-center justify-center w-[22px] h-[22px] rounded-md border-2 transition-all ${
                            isCompleted
                              ? "bg-[#DA7756] border-[#DA7756] text-white"
                              : "bg-white border-[#D6B99D] hover:border-[#DA7756]"
                          }`}
                        >
                          {isCompleted && (
                            <Check strokeWidth={3} className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span
                          className={`text-[16px] font-bold ${
                            isCompleted ? "text-[#888780] line-through" : "text-[#2C2C2A]"
                          }`}
                        >
                          {goal.title}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#2C2C2A] bg-white border border-[#D6B99D] shadow-sm px-2.5 py-1 rounded-lg">
                        {goal.area || goal.category || "Relationships"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pl-9">
                      <span className="text-[13px] text-[#888780] font-medium">Progress</span>
                      <div className="flex-1 relative flex items-center h-6">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressValue}
                          onChange={(e) =>
                            handleProgressChange(goal.id, parseInt(e.target.value))
                          }
                          onMouseUp={(e) =>
                            handleProgressCommit(goal.id, parseInt((e.target as HTMLInputElement).value))
                          }
                          onTouchEnd={(e) =>
                            handleProgressCommit(goal.id, parseInt((e.target as HTMLInputElement).value))
                          }
                          className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer z-10"
                          style={{
                            background: `linear-gradient(to right, #DA7756 0%, #DA7756 ${progressValue}%, #D6B99D ${progressValue}%, #D6B99D 100%)`,
                          }}
                        />
                        <style>{`input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: white; border: 2px solid #DA7756; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }`}</style>
                      </div>
                      <span className="text-[14px] font-extrabold text-[#DA7756] w-9 text-right">
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
            <h3 className="text-sm font-semibold text-[#2C2C2A]">
              What I'll Say NO To
            </h3>
            <Tooltip text="What distractions, commitments, or less important tasks will you intentionally avoid or delegate?" />
          </div>
          <textarea
            value={data.sayNoText}
            onChange={handleSayNoChange}
            placeholder="List things you'll decline or avoid to create space for your priorities..."
            className="w-full min-h-[100px] p-4 bg-white border border-[#D6B99D] rounded-xl text-[14px] text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 resize-y shadow-sm transition-all"
          />
        </div>

      </div>
    </div>
  );
}

export default FocusAndBoundaries;