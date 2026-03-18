import React, { useState } from "react";
import { Info, Plus, Lightbulb, X } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Win {
  description: string;
  day: string;
  category: string;
  completed: boolean;
}

interface DailyEntry {
  accomplishments: { title: string; checked: boolean }[];
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
  weeklyStory: string;
  setWeeklyStory: React.Dispatch<React.SetStateAction<string>>;
  currentDate?: Date;
  challengeCause?: string;
  setChallengeCause?: React.Dispatch<React.SetStateAction<string>>;
  dailyJournals?: any[];
}

// ── Life Balance categories config ────────────────────────────────────────────
const LIFE_BALANCE_CATEGORIES = [
  { key: "Career", emoji: "💼", label: "Career" },
  { key: "Health", emoji: "❤️", label: "Health" },
  { key: "Relations", emoji: "🤝", label: "Relations" },
  { key: "Personal Growth", emoji: "🌱", label: "Growth" },
  { key: "Finance", emoji: "💰", label: "Finance" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Career: "#a78bfa",
  Health: "#f472b6",
  Relations: "#fb923c",
  "Personal Growth": "#4ade80",
  Finance: "#facc15",
};

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
  weeklyStory,
  setWeeklyStory,
  currentDate = new Date(),
  dailyJournals = [],
}: WeeklyReflectionProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const addNewWin = () => {
    setWins([
      ...wins,
      { description: "", day: "Tue", category: "Career", completed: true },
    ]);
  };

  const updateWin = (
    index: number,
    field: keyof Win,
    value: string | boolean,
  ) => {
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

  // ── Auto-calculate life balance from wins ──────────────────────────────────
  const categoryCounts = LIFE_BALANCE_CATEGORIES.map(({ key }) => ({
    key,
    count: wins.filter((w) => w.category === key && w.completed).length,
  }));

  const totalWins = categoryCounts.reduce((sum, c) => sum + c.count, 0);
  const filledCategories = categoryCounts.filter((c) => c.count > 0).length;
  const autoScore =
    totalWins === 0 ? 0 : Math.round((filledCategories / 5) * 10);

  // ─── READ FROM LOCALSTORAGE FOR THE CURRENT WEEK ───────────────────────────
  const getWeekEntriesFromLocalStorage = (): {
    date: Date;
    entry: DailyEntry;
  }[] => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const result: { date: Date; entry: DailyEntry }[] = [];
    for (const day of days) {
      const dateKey = format(day, "yyyy-MM-dd");
      try {
        const stored = localStorage.getItem(`daily_journal_${dateKey}`);
        if (stored) {
          const parsed: DailyEntry = JSON.parse(stored);
          result.push({ date: day, entry: parsed });
        }
      } catch {
        // skip corrupted keys
      }
    }

    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const importDayToStory = (date: Date, entry: DailyEntry) => {
    const dateLabel = format(date, "EEEE, MMMM d");
    const lines: string[] = [`**${dateLabel}**`];

    for (const acc of entry.accomplishments ?? []) {
      if (acc.title?.trim()) {
        lines.push(acc.checked ? `✅ ${acc.title}` : `• ${acc.title}`);
      }
    }

    const text = lines.join("\n");
    setWeeklyStory((prev) => (prev ? `${prev}\n\n${text}` : text));
    setIsPopoverOpen(false);
  };

  const importAllToStory = () => {
    const entries = getWeekEntriesFromLocalStorage();
    if (entries.length === 0) return;

    const allLines: string[] = [];
    for (const { date, entry } of entries) {
      const dateLabel = format(date, "EEEE, MMMM d");
      allLines.push(`**${dateLabel}**`);

      for (const acc of entry.accomplishments ?? []) {
        if (acc.title?.trim()) {
          allLines.push(acc.checked ? `✅ ${acc.title}` : `• ${acc.title}`);
        }
      }

      allLines.push("");
    }

    const text = allLines.join("\n").trim();
    if (text) {
      setWeeklyStory((prev) => (prev ? `${prev}\n\n${text}` : text));
    }
    setIsPopoverOpen(false);
  };

  const localEntries = getWeekEntriesFromLocalStorage();

  // ── Chevron SVG ────────────────────────────────────────────────────────────
  const ChevronDown = () => (
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  return (
    <div className="font-sans bg-[#fffaf5]">
      {/* Orange Header & Weekly Story Area */}
      <div className="px-6 pt-5 pb-6 border-b border-orange-100 bg-white">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100 shrink-0">
              <Lightbulb className="w-5 h-5 text-orange-500" strokeWidth={2} />
            </div>
            <h1 className="text-lg font-bold text-gray-800">
              Review of Past Week
            </h1>
            <span className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-gray-900 text-white text-xs font-medium rounded-lg px-3 py-2 w-72 text-center leading-relaxed opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 pointer-events-none transition-all duration-200 ease-out z-50 shadow-lg whitespace-normal">
                Review what happened in the past 7 days - your wins, challenges,
                gratitude, insights, and life balance.
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-4 border-transparent border-b-gray-900" />
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-gray-800">
              My Weekly Story
            </span>
            <span className="relative group">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-gray-900 text-white text-xs font-medium rounded-lg px-3 py-2 w-80 text-center leading-relaxed opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 pointer-events-none transition-all duration-200 ease-out z-50 shadow-lg whitespace-normal">
                Reflect on the past week - what happened each day,
                accomplishments, learnings, and feelings. Use the import button
                to bring in your daily journal entries automatically.
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-4 border-transparent border-b-gray-900" />
              </span>
            </span>
          </div>

          {/* ─── IMPORT POPOVER ─── */}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="text-[13px] font-medium text-orange-600 border border-orange-200 bg-orange-50 px-3 py-1.5 rounded-md hover:bg-orange-100 transition-colors shadow-sm">
                Import from Daily Journal
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-[320px] p-0 z-50" align="end">
              <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center rounded-t-md">
                <span className="font-bold text-sm text-gray-800">
                  Daily Entries
                </span>
                <button
                  onClick={importAllToStory}
                  className="text-xs text-orange-600 font-bold hover:underline"
                >
                  Import All
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-4 flex flex-col gap-4">
                {localEntries.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center">
                    No daily entries found for this week.
                    <br />
                    <span className="text-xs text-gray-400 mt-1 block">
                      Save a Daily Journal entry first.
                    </span>
                  </p>
                ) : (
                  localEntries.map(({ date, entry }) => {
                    const accs = entry.accomplishments ?? [];
                    return (
                      <div
                        key={format(date, "yyyy-MM-dd")}
                        className="group flex flex-col gap-1 cursor-pointer bg-white border border-gray-100 p-2.5 rounded-lg hover:border-orange-200 hover:bg-orange-50/30 transition-colors"
                        onClick={() => importDayToStory(date, entry)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-gray-900">
                            {format(date, "EEEE, MMMM d")}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity bg-orange-100 px-1.5 py-0.5 rounded">
                            + Import
                          </span>
                        </div>

                        <div className="text-xs text-gray-600 whitespace-pre-wrap mt-0.5">
                          {accs.length === 0 ? (
                            <span className="italic text-gray-400">
                              No accomplishments
                            </span>
                          ) : (
                            accs
                              .filter((a) => a.title?.trim())
                              .map((a, i) => (
                                <div key={i}>
                                  {a.checked ? `✅ ${a.title}` : `• ${a.title}`}
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <textarea
          value={weeklyStory}
          onChange={(e) => setWeeklyStory(e.target.value)}
          rows={3}
          className="w-full min-h-[80px] p-4 text-[14px] text-gray-800 outline-none resize-y border border-gray-200 rounded-lg focus:border-orange-300 focus:ring-1 focus:ring-orange-300 bg-white shadow-sm leading-relaxed"
          placeholder="Reflect on your week - what happened each day, what you accomplished, what you learned, and how you felt..."
        />
      </div>

      <div className="p-6 pt-5 space-y-8 bg-white">
        {/* 1. TOP WINS OF PAST WEEK */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-gray-800">
                Top Wins of Past Week
              </h2>
              <span className="relative group">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-900 text-white text-xs font-medium rounded-lg px-3 py-2 w-80 text-center leading-relaxed opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 pointer-events-none transition-all duration-200 ease-out z-50 shadow-lg whitespace-normal">
                  What did you achieve last week? Check off items as you
                  accomplished them. These were your strategic priorities from
                  the previous week.
                  <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-4 border-transparent border-t-gray-900" />
                </span>
              </span>{" "}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAllWins}
                className="text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Uncheck All
              </button>
              <button
                onClick={addNewWin}
                className="text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded bg-white hover:bg-gray-50 flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Win
              </button>
            </div>
          </div>

          <div
            className={`rounded-md min-h-[100px] flex flex-col ${
              wins.length === 0
                ? "border-2 border-dashed border-gray-200 bg-[#fafafa]"
                : "border border-gray-200 bg-[#fafafa]"
            }`}
          >
            {wins.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <p className="text-sm text-gray-500 mb-3">No wins added yet</p>
                <button
                  onClick={addNewWin}
                  className="text-sm font-medium text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-500" /> Add Your First Win
                </button>
              </div>
            ) : (
              <div className="flex flex-col w-full p-2 space-y-2">
                {wins.map((win, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-md bg-white shadow-sm transition-colors"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={win.completed}
                      onChange={(e) =>
                        updateWin(idx, "completed", e.target.checked)
                      }
                      className="w-4 h-4 ml-1 mt-1 rounded border-gray-300 text-gray-800 focus:ring-gray-800 cursor-pointer shrink-0"
                    />

                    {/* Description textarea - expandable */}
                    <textarea
                      value={win.description}
                      onChange={(e) =>
                        updateWin(idx, "description", e.target.value)
                      }
                      autoFocus
                      rows={1}
                      placeholder="Describe your win..."
                      className={`flex-1 outline-none text-[14px] bg-transparent px-2 resize-y leading-relaxed min-h-[28px] ${
                        win.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    />

                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      {/* ── Day dropdown ── */}
                      <div className="relative">
                        <select
                          value={win.day}
                          onChange={(e) =>
                            updateWin(idx, "day", e.target.value)
                          }
                          className="appearance-none text-[13px] font-medium border border-orange-200 rounded-md pl-3 pr-8 py-1.5 text-gray-700 outline-none bg-white cursor-pointer hover:border-orange-300 focus:ring-1 focus:ring-orange-200 shadow-sm"
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
                        <ChevronDown />
                      </div>

                      {/* ── Category dropdown ── */}
                      <div className="relative">
                        <select
                          value={win.category}
                          onChange={(e) =>
                            updateWin(idx, "category", e.target.value)
                          }
                          className="appearance-none text-[13px] font-medium border border-orange-200 rounded-md pl-3 pr-8 py-1.5 text-gray-700 outline-none bg-white cursor-pointer hover:border-orange-300 focus:ring-1 focus:ring-orange-200 shadow-sm"
                        >
                          <option value="Career">💼 Career</option>
                          <option value="Health">❤️ Health</option>
                          <option value="Relations">🤝 Relations</option>
                          <option value="Personal Growth">🌱 Growth</option>
                          <option value="Finance">💰 Finance</option>
                        </select>
                        <ChevronDown />
                      </div>

                      {/* ── Remove button ── */}
                      <button
                        onClick={() => removeWin(idx)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded ml-1 transition-colors"
                      >
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
          <div className="border border-orange-100 rounded-md overflow-hidden bg-white shadow-sm">
            <div className="bg-[#fffdfa] px-4 py-3 border-b border-orange-100">
              <h2 className="text-[14px] font-semibold text-gray-800">
                Biggest Challenge & Cause
              </h2>
            </div>
            <textarea
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              rows={3}
              className="w-full min-h-[88px] p-4 text-[14px] text-gray-800 outline-none resize-y placeholder-gray-400"
              placeholder="What was your biggest challenge this week, perhaps a recurring behavior, and what caused it?"
            />
          </div>
        </section>

        {/* 3. GRATITUDE & KEY INSIGHT */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-orange-100 rounded-md overflow-hidden flex flex-col bg-white shadow-sm">
            <div className="bg-[#fffdfa] px-4 py-3 border-b border-orange-100">
              <h2 className="text-[14px] font-semibold text-gray-800">
                Gratitude
              </h2>
            </div>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              rows={3}
              className="w-full min-h-[100px] p-4 text-[14px] text-gray-800 outline-none resize-y placeholder-gray-400"
              placeholder="What are you grateful for?"
            />
          </div>

          <div className="border border-orange-100 rounded-md overflow-hidden flex flex-col bg-white shadow-sm">
            <div className="bg-[#fffdfa] px-4 py-3 border-b border-orange-100">
              <h2 className="text-[14px] font-semibold text-gray-800">
                Key Insight
              </h2>
            </div>
            <textarea
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              rows={3}
              className="w-full min-h-[100px] p-4 text-[14px] text-gray-800 outline-none resize-y placeholder-gray-400"
              placeholder="You are the ultimate creator for everything that manifests in your life. What were your insights this week?"
            />
          </div>
        </section>

        {/* 4. AUTO-CALCULATED LIFE BALANCE */}
        <section className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-gray-800">
                Auto-Calculated Life Balance
              </h2>
              <span className="relative group">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-900 text-white text-xs font-medium rounded-lg px-3 py-2 w-80 text-center leading-relaxed opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 pointer-events-none transition-all duration-200 ease-out z-50 shadow-lg whitespace-normal">
                  Automatically calculated based on how balanced your wins are
                  across all 5 life areas. 10/10 means equal focus on all areas.
                  <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-4 border-transparent border-t-gray-900" />
                </span>
              </span>{" "}
            </div>
            <span className="text-2xl font-bold text-[#4ade80]">
              {autoScore}/10
            </span>
          </div>

          <div className="flex gap-2 mb-3">
            {LIFE_BALANCE_CATEGORIES.map(({ key }) => {
              const count =
                categoryCounts.find((c) => c.key === key)?.count ?? 0;
              const isActive = count > 0;
              return (
                <div
                  key={key}
                  className="flex-1 h-[68px] rounded-lg transition-all duration-300 relative overflow-hidden"
                  style={{
                    backgroundColor: isActive
                      ? CATEGORY_COLORS[key]
                      : "#f3f4f6",
                  }}
                >
                  {isActive && (
                    <span className="absolute top-1.5 right-2 text-[11px] font-bold text-white/90">
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-around px-2 mb-10 text-[13px] font-semibold">
            {LIFE_BALANCE_CATEGORIES.map(({ key, emoji, label }) => {
              const count =
                categoryCounts.find((c) => c.key === key)?.count ?? 0;
              const isActive = count > 0;
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-gray-800" : "text-gray-400"}`}
                >
                  <span className="text-xl">{emoji}</span>
                  {count}
                </div>
              );
            })}
          </div>

          {/* Manual slider */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-gray-800">
              Your Life Balance Rating
            </h2>
            <span className="text-[22px] font-bold text-[#f97316]">
              {balanceRating}/10
            </span>
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
          </div>
        </section>
      </div>
    </div>
  );
}
