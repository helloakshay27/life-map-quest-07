import React, { useState } from "react";
import { Info, Plus, Lightbulb, X } from "lucide-react";

export interface Win {
  description: string;
  day: string;
  category: string;
  completed: boolean;
}

interface WeeklyReflectionProps {
  wins: Win[];
  setWins: React.Dispatch<React.SetStateAction<Win[]>>;
  challenge: string;
  setChallenge: React.Dispatch<React.SetStateAction<string>>;
  gratitude: string;
  setGratitude: React.Dispatch<React.SetStateAction<string>>;
  insight: string;
  setInsight: React.Dispatch<React.SetStateAction<string>>;
  balanceRating: number;
  setBalanceRating: React.Dispatch<React.SetStateAction<number>>;
  // Keeping unused props from your original signature so it doesn't break your parent component
  currentDate?: Date;
  challengeCause?: string;
  setChallengeCause?: React.Dispatch<React.SetStateAction<string>>;
}

export default function WeeklyReflection({
  wins,
  setWins,
  challenge,
  setChallenge,
  gratitude,
  setGratitude,
  insight,
  setInsight,
  balanceRating,
  setBalanceRating,
}: WeeklyReflectionProps) {
  
  // Handlers for inline Win editing
  const addNewWin = () => {
    setWins([...wins, { description: "", day: "", category: "Career", completed: false }]);
  };

  const updateWin = (index: number, field: keyof Win, value: string | boolean) => {
    const updatedWins = [...wins];
    updatedWins[index] = { ...updatedWins[index], [field]: value };
    setWins(updatedWins);
  };

  const removeWin = (index: number) => {
    setWins(wins.filter((_, i) => i !== index));
  };

  const toggleAllWins = () => {
    const allCompleted = wins.every((w) => w.completed);
    setWins(wins.map((w) => ({ ...w, completed: !allCompleted })));
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
          <h1 className="text-lg font-bold text-gray-800">Review of Past Week</h1>
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-700">
              My Weekly Story for Mar 8 - Mar 14, 2026
            </span>
            <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
          </div>
          <button className="text-[13px] font-medium text-orange-600 border border-orange-200 bg-orange-50 px-3 py-1.5 rounded hover:bg-orange-100 transition-colors">
            Import from Daily Journal
          </button>
        </div>

        <p className="text-[13px] text-gray-500 pb-4 border-b border-gray-100">
          Reflect on your week - what happened each day, what you accomplished, what you learned, and how you felt...
        </p>
      </div>

      <div className="p-6 pt-2 space-y-8">
        
        {/* 1. TOP WINS OF PAST WEEK */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-gray-800">Top Wins of Past Week</h2>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleAllWins}
                className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50"
              >
                {wins.length > 0 && wins.every(w => w.completed) ? "Uncheck All" : "Check All"}
              </button>
              <button 
                onClick={addNewWin} 
                className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Win
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-md bg-[#fafafa] min-h-[100px] flex flex-col">
            {wins.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <p className="text-sm text-gray-500 mb-2">No wins added yet</p>
                <button 
                  onClick={addNewWin} 
                  className="text-sm font-medium text-gray-600 flex items-center gap-1 hover:text-gray-900"
                >
                  <Plus className="w-4 h-4" /> Add Your First Win
                </button>
              </div>
            ) : (
              <div className="flex flex-col w-full">
                {wins.map((win, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 border-b border-gray-200 bg-white first:rounded-t-md last:rounded-b-md last:border-0 hover:bg-gray-50/50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={win.completed} 
                      onChange={(e) => updateWin(idx, "completed", e.target.checked)} 
                      className="w-4 h-4 ml-1 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer" 
                    />
                    <input 
                      type="text" 
                      value={win.description} 
                      onChange={(e) => updateWin(idx, "description", e.target.value)} 
                      autoFocus
                      className="flex-1 outline-none text-[13px] text-gray-800 bg-transparent px-2" 
                    />
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <select 
                        value={win.day} 
                        onChange={(e) => updateWin(idx, "day", e.target.value)} 
                        className="text-[13px] border border-gray-200 rounded px-2 py-1.5 text-gray-600 outline-none bg-white cursor-pointer hover:border-gray-300"
                      >
                        <option value="">Day?</option>
                        <option value="Sun">Sun</option>
                        <option value="Mon">Mon</option>
                        <option value="Tue">Tue</option>
                        <option value="Wed">Wed</option>
                        <option value="Thu">Thu</option>
                        <option value="Fri">Fri</option>
                        <option value="Sat">Sat</option>
                      </select>
                      
                      <select 
                        value={win.category} 
                        onChange={(e) => updateWin(idx, "category", e.target.value)} 
                        className="text-[13px] border border-gray-200 rounded px-2 py-1.5 text-gray-600 outline-none bg-white cursor-pointer hover:border-gray-300"
                      >
                        <option value="Career">💼 Career</option>
                        <option value="Health">❤️ Health</option>
                        <option value="Relationships">🤝 Relationships</option>
                        <option value="Personal Growth">🌱 Personal Growth</option>
                        <option value="Finance">💰 Finance</option>
                      </select>
                      
                      <button onClick={() => removeWin(idx)} className="p-1 text-gray-400 hover:text-gray-700 ml-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 2. BIGGEST CHALLENGE & CAUSE */}
        <section>
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
            <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-gray-200">
              <h2 className="text-[14px] font-semibold text-gray-800">Biggest Challenge & Cause</h2>
            </div>
            <textarea
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              className="w-full h-[88px] p-4 text-[13px] text-gray-800 outline-none resize-none placeholder-gray-400"
              placeholder="What was your biggest challenge this week, perhaps a recurring behavior, and what caused it?"
            />
          </div>
        </section>

        {/* 3. GRATITUDE & KEY INSIGHT (Grid) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-md overflow-hidden flex flex-col bg-white">
            <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-gray-200">
              <h2 className="text-[14px] font-semibold text-gray-800">Gratitude</h2>
            </div>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="w-full h-[100px] p-4 text-[13px] text-gray-800 outline-none resize-none placeholder-gray-400"
              placeholder="What are you grateful for?"
            />
          </div>

          <div className="border border-gray-200 rounded-md overflow-hidden flex flex-col bg-white">
            <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-gray-200">
              <h2 className="text-[14px] font-semibold text-gray-800">Key Insight</h2>
            </div>
            <textarea
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              className="w-full h-[100px] p-4 text-[13px] text-gray-800 outline-none resize-none placeholder-gray-400"
              placeholder="You are the ultimate creator for everything that manifests in your life. What were your insights this week?"
            />
          </div>
        </section>

        {/* 4. AUTO-CALCULATED LIFE BALANCE */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-gray-800">Auto-Calculated Life Balance</h2>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <span className="text-2xl font-bold text-[#22c55e]">9/10</span>
          </div>

          {/* 5 Blocks representation */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1 h-[68px] bg-[#86efac] rounded-lg"></div>
            <div className="flex-1 h-[68px] bg-[#e5e7eb] rounded-lg"></div>
            <div className="flex-1 h-[68px] bg-[#e5e7eb] rounded-lg"></div>
            <div className="flex-1 h-[68px] bg-[#e5e7eb] rounded-lg"></div>
            <div className="flex-1 h-[68px] bg-[#e5e7eb] rounded-lg"></div>
          </div>

          {/* Icons row */}
          <div className="flex justify-between px-10 mb-10 text-[13px] font-semibold text-gray-600">
            <div className="flex flex-col items-center gap-1"><span className="text-lg">💧</span> 0</div>
            <div className="flex flex-col items-center gap-1"><span className="text-lg">🔥</span> 0</div>
            <div className="flex flex-col items-center gap-1"><span className="text-lg">❤️</span> 0</div>
            <div className="flex flex-col items-center gap-1"><span className="text-lg">⚖️</span> 0</div>
            <div className="flex flex-col items-center gap-1"><span className="text-lg">💼</span> 1</div>
          </div>

          {/* Slider */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-gray-800">Your Life Balance Rating</h2>
            <span className="text-[22px] font-bold text-[#f97316]">{balanceRating}/10</span>
          </div>

          <div className="relative pt-2 pb-6">
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={balanceRating}
              onChange={(e) => setBalanceRating(parseFloat(e.target.value))}
              className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:bg-gray-800 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:shadow-sm"
              style={{
                background: `linear-gradient(to right, #1f2937 0%, #1f2937 ${(balanceRating / 10) * 100}%, #e5e7eb ${(balanceRating / 10) * 100}%, #e5e7eb 100%)`,
              }}
            />
            {/* Slider marks (0 and 10) */}
            <div className="absolute top-6 left-0 text-xs text-gray-500 font-medium">0</div>
            <div className="absolute top-6 right-0 text-xs text-gray-500 font-medium">10</div>
          </div>
        </section>

      </div>
    </div>
  );
}