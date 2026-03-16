import React, { useState, useEffect } from "react";
import {
  Info,
  Plus,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Edit,
  Trash2,
  Lightbulb,
} from "lucide-react";
import { apiRequest } from "@/config/api";
import { format, startOfWeek, endOfWeek } from "date-fns";

export interface Win {
  description: string;
  day: string;
  category: string;
  completed: boolean;
}

interface WeeklyReflectionProps {
  currentDate: Date;
  wins: Win[];
  setWins: React.Dispatch<React.SetStateAction<Win[]>>;
  challenge: string;
  setChallenge: React.Dispatch<React.SetStateAction<string>>;
  challengeCause: string;
  setChallengeCause: React.Dispatch<React.SetStateAction<string>>;
  gratitude: string;
  setGratitude: React.Dispatch<React.SetStateAction<string>>;
  insight: string;
  setInsight: React.Dispatch<React.SetStateAction<string>>;
  balanceRating: number;
  setBalanceRating: React.Dispatch<React.SetStateAction<number>>;
}

function WeeklyReflection({
  currentDate,
  wins,
  setWins,
  challenge,
  setChallenge,
  challengeCause,
  setChallengeCause,
  gratitude,
  setGratitude,
  insight,
  setInsight,
  balanceRating,
  setBalanceRating,
}: WeeklyReflectionProps) {
  // Friend's Auto-Calculated Life Balance placeholder data
  const lifeBalanceStats = [
    { id: 1, emoji: "💼", score: 0 },
    { id: 2, emoji: "🤝", score: 0 },
    { id: 3, emoji: "❤️", score: 0 },
    { id: 4, emoji: "⚖️", score: 0 },
    { id: 5, emoji: "🔥", score: 0 },
  ];

  const [isAddingWin, setIsAddingWin] = useState(false);
  const [newWin, setNewWin] = useState<Partial<Win>>({
    description: "",
    day: "Monday",
    category: "career",
    completed: true,
  });

  const handleAddWin = () => {
    if (!newWin.description?.trim()) return;
    setWins((prev) => [...prev, newWin as Win]);
    setNewWin({ description: "", day: "Monday", category: "career", completed: true });
    setIsAddingWin(false);
  };

  const removeWin = (index: number) => {
    setWins((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="font-sans">
      {/* Orange Header */}
      <div className="px-6 pt-5 pb-4 border-b border-orange-100 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500 shadow-sm shrink-0">
              <Lightbulb className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">
                Review of Past Week
              </h2>
              <p className="text-[13px] text-gray-500 mt-0.5">Wins, challenges, gratitude & life balance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10">

      {/* 1. WINS OF PAST WEEK */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              Wins of Past Week
            </h2>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </div>
        </div>
        <div className="border-y-2 border-dashed border-orange-200/60 bg-[#fefdfb] py-6 flex flex-col px-4 rounded-sm">
          {wins.length > 0 ? (
            <div className="w-full mb-6 space-y-3">
              {wins.map((win, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-3 border border-gray-100 rounded-lg shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{win.description}</p>
                    <p className="text-xs text-gray-500">{win.day} • {win.category}</p>
                  </div>
                  <button onClick={() => removeWin(idx)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mb-6">
              <p className="text-[15px] font-medium text-gray-800 mb-3">No wins added yet</p>
            </div>
          )}

          {!isAddingWin ? (
            <div className="flex justify-center">
              <button onClick={() => setIsAddingWin(true)} className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" /> Add Win
              </button>
            </div>
          ) : (
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm w-full space-y-4">
              <input
                type="text"
                placeholder="What did you accomplish?"
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm"
                value={newWin.description}
                onChange={(e) => setNewWin({ ...newWin, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="p-2 border border-gray-200 rounded-md bg-white text-sm outline-none"
                  value={newWin.day}
                  onChange={(e) => setNewWin({ ...newWin, day: e.target.value })}
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  className="p-2 border border-gray-200 rounded-md bg-white text-sm outline-none"
                  value={newWin.category}
                  onChange={(e) => setNewWin({ ...newWin, category: e.target.value })}
                >
                  {["career", "health", "relationships", "personal_growth", "finance", "other"].map(c => (
                    <option key={c} value={c}>{c.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <button
                  onClick={() => setIsAddingWin(false)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWin}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-orange-500 text-white hover:bg-orange-600"
                >
                  Save Win
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. BIGGEST CHALLENGE & CAUSE */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Biggest Challenge
        </h2>
        <p className="text-[15px] text-gray-600 mb-3">
          What was your biggest challenge this week, perhaps a recurring
          behavior?
        </p>
        <textarea
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          className="w-full min-h-[80px] mb-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-y"
          placeholder="Describe your biggest challenge..."
        />

        <h2 className="text-lg font-bold text-gray-900 mb-1 mt-4">
          Challenge Cause
        </h2>
        <p className="text-[15px] text-gray-600 mb-3">
          What caused it?
        </p>
        <textarea
          value={challengeCause}
          onChange={(e) => setChallengeCause(e.target.value)}
          className="w-full min-h-[80px] p-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-y"
          placeholder="Describe what caused this challenge..."
        />
      </section>

      {/* 3. GRATITUDE & KEY INSIGHT */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Gratitude</h2>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-y"
            placeholder="What are you grateful for?"
          />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Key Insight</h2>
          <p className="text-[15px] text-gray-600 mb-3 line-clamp-1">
            You are the ultimate creator for everything that manifests in
            your... What were your insights this week?
          </p>
          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-y"
            placeholder="What were your insights this week?"
          />
        </div>
      </section>

      {/* 4. BALANCE SLIDER */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Auto-Calculated Life Balance
          </h2>
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
        </div>

        {/* 5 Balance Categories Row */}
        <div className="flex items-center justify-between gap-4 mb-8">
          {lifeBalanceStats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center flex-1">
              <div className="w-full h-14 bg-gray-200/70 rounded-xl mb-3"></div>
              <div className="flex flex-col items-center">
                <span className="text-lg mb-0.5">{stat.emoji}</span>
                <span className="text-sm font-bold text-gray-900">
                  {stat.score}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Section */}
        <div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">
            Life Balance Rating: {balanceRating}
          </h3>
          <div className="px-1 relative">
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={balanceRating}
              onChange={(e) => setBalanceRating(parseFloat(e.target.value))}
              className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer bg-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-md"
              style={{
                background: `linear-gradient(to right, #111827 0%, #111827 ${((balanceRating - 1) / 4) * 100}%, #e5e7eb ${((balanceRating - 1) / 4) * 100}%, #e5e7eb 100%)`,
              }}
            />
          </div>
        </div>
      </section>

      </div>
    </div>
  );
}

export default WeeklyReflection;
