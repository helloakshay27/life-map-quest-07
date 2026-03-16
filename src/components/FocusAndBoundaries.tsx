import React, { useState } from "react";
import { Target, Info, Check, CircleDot } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  apiGoals?: {
    id: string | number;
    title: string;
    category?: string;
    area?: string;
    progress?: number;
    status?: string;
    completed?: boolean;
  }[];
}

function FocusAndBoundaries({ data, setData, apiGoals = [] }: FocusAndBoundariesProps) {
  const navigate = useNavigate();
  
  // Use apiGoals if provided, otherwise fallback to data.goals
  const displayGoals = apiGoals.length > 0 ? apiGoals : data.goals;

  const toggleGoal = (goalId: number) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((goal) =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal,
      ),
    }));
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
              <h2 className="text-[17px] font-bold text-gray-900">Focus & Boundaries</h2>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">Prioritize what matters and protect your focus</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 bg-violet-50/30">
        {/* Matrix + Life Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-xl p-4 border border-sky-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[15px] font-bold text-gray-800">Eisenhower Matrix</h3>
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
                  <span className="text-[26px] font-extrabold leading-none">{item.value}</span>
                  <span className="text-[12px] font-bold uppercase mt-1">{key}</span>
                  <span className="text-[12px] mt-1 font-medium text-center">
                    {item.emoji} {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-gray-500 italic mt-3">Focus on Q2 for growth</p>
          </div>

          <div className="bg-[#fff8f8] rounded-xl p-4 border border-rose-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[15px] font-bold text-gray-800">Life Balance Overview</h3>
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
            <p className="text-[13px] text-gray-500 italic mt-4">Balance across all areas</p>
          </div>
        </div>

        {/* Goals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-gray-800">Goals in Focus</h3>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <button
              onClick={() => navigate("/goals-habits")}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 text-[14px] font-semibold shadow-sm hover:bg-gray-50 transition-colors"
            >
              Manage Goals
            </button>
          </div>

          {displayGoals.length === 0 ? (
            <div className="bg-white/80 border border-violet-100 rounded-xl min-h-[190px] flex flex-col items-center justify-center text-center p-6">
              <CircleDot className="w-14 h-14 text-gray-300 mb-3" strokeWidth={1.5} />
              <p className="text-[30px] text-gray-500 mb-3">No goals yet. Create your first goal!</p>
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
            <div className="bg-white rounded-xl p-5 border border-violet-100 shadow-sm space-y-4">
              {displayGoals.map((goal) => (
                <div key={goal.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${
                          goal.completed || goal.status === 'completed'
                            ? "bg-black border-black text-white"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {(goal.completed || goal.status === 'completed') && <Check strokeWidth={3} className="w-3 h-3" />}
                      </button>
                      <span className="text-[16px] font-medium text-gray-900">{goal.title}</span>
                    </div>
                    <span className="text-[12px] font-bold text-violet-900 bg-violet-50 px-2.5 py-1 rounded-md">
                      {goal.category || goal.area || 'Other'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 pl-8">
                    <span className="text-[13px] text-gray-400 font-medium">Progress</span>
                    <div className="flex-1 relative flex items-center">
                      <div className="w-full h-[3px] bg-gray-200 rounded-full" />
                      <div
                        className="absolute left-0 h-[3px] bg-gray-800 rounded-full"
                        style={{ width: `${goal.progress}%` }}
                      />
                      <div
                        className="absolute w-3.5 h-3.5 bg-white border-2 border-gray-300 rounded-full shadow-sm"
                        style={{ left: `calc(${goal.progress}% - 6px)` }}
                      />
                    </div>
                    <span className="text-[13px] font-bold text-violet-700 w-8 text-right">
                      {goal.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Say No */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[16px] font-bold text-gray-800">What I'll Say NO To</h3>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </div>
          <textarea
            value={data.sayNoText}
            onChange={handleSayNoChange}
            placeholder="List things you'll decline or avoid to create space for your priorities..."
            className="w-full min-h-[100px] p-4 bg-white border border-gray-300 rounded-xl text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-200 resize-y"
          />
        </div>
      </div>
    </div>
  );
}

export default FocusAndBoundaries;