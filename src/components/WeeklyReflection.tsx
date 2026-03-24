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
  { key: "Career",        emoji: "💼", label: "Career"  },
  { key: "Health",        emoji: "❤️", label: "Health"  },
  { key: "Relations",     emoji: "🤝", label: "Relation" },
  { key: "Personal Growth", emoji: "🌱", label: "Growth" },
  { key: "Finance",       emoji: "💰", label: "Finance" },
];

// Mapped directly to the Semantic & Dashboard Tertiary colors from your palette
const CATEGORY_COLORS: Record<string, string> = {
  Career:            "#1858A5",  // Sky
  Health:            "#DA7756",  // Coral
  Relations:         "#534AB7",  // Violet
  "Personal Growth": "#0B5D41",  // Forest
  Finance:           "#BA7517",  // Amber
};

// Using Mist (#D5D8D8) for the inactive background of the bars
const CATEGORY_BG_INACTIVE: Record<string, string> = {
  Career:            "#D5D8D8",
  Health:            "#D5D8D8",
  Relations:         "#D5D8D8",
  "Personal Growth": "#D5D8D8",
  Finance:           "#D5D8D8",
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
    setWins([...wins, { description: "", day: "Tue", category: "Career", completed: true }]);
  };

  const updateWin = (index: number, field: keyof Win, value: string | boolean) => {
    const updatedWins = [...wins];
    updatedWins[index] = { ...updatedWins[index], [field]: value };
    setWins(updatedWins);
  };

  const removeWin = (index: number) => setWins(wins.filter((_, i) => i !== index));

  const toggleAllWins = () => {
    const allCompleted = wins.every((w) => w.completed);
    setWins(wins.map((w) => ({ ...w, completed: !allCompleted })));
  };

  // ── Auto-calculate life balance from wins ─────────────────────────────────
  const categoryCounts = LIFE_BALANCE_CATEGORIES.map(({ key }) => ({
    key,
    count: wins.filter((w) => w.category === key && w.completed).length,
  }));

  const totalWins = categoryCounts.reduce((sum, c) => sum + c.count, 0);
  const filledCategories = categoryCounts.filter((c) => c.count > 0).length;
  const autoScore = totalWins === 0 ? 0 : Math.round((filledCategories / 5) * 10);

  // ── Local storage helpers ─────────────────────────────────────────────────
  const getWeekEntriesFromLocalStorage = (): { date: Date; entry: DailyEntry }[] => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const result: { date: Date; entry: DailyEntry }[] = [];
    for (const day of days) {
      const dateKey = format(day, "yyyy-MM-dd");
      try {
        const stored = localStorage.getItem(`daily_journal_${dateKey}`);
        if (stored) result.push({ date: day, entry: JSON.parse(stored) });
      } catch { /* skip */ }
    }
    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const importDayToStory = (date: Date, entry: DailyEntry) => {
    const dateLabel = format(date, "EEEE, MMMM d");
    const lines: string[] = [`**${dateLabel}**`];
    for (const acc of entry.accomplishments ?? []) {
      if (acc.title?.trim()) lines.push(acc.checked ? `✅ ${acc.title}` : `• ${acc.title}`);
    }
    setWeeklyStory((prev) => (prev ? `${prev}\n\n${lines.join("\n")}` : lines.join("\n")));
    setIsPopoverOpen(false);
  };

  const importAllToStory = () => {
    const entries = getWeekEntriesFromLocalStorage();
    if (entries.length === 0) return;
    const allLines: string[] = [];
    for (const { date, entry } of entries) {
      allLines.push(`**${format(date, "EEEE, MMMM d")}**`);
      for (const acc of entry.accomplishments ?? []) {
        if (acc.title?.trim()) allLines.push(acc.checked ? `✅ ${acc.title}` : `• ${acc.title}`);
      }
      allLines.push("");
    }
    const text = allLines.join("\n").trim();
    if (text) setWeeklyStory((prev) => (prev ? `${prev}\n\n${text}` : text));
    setIsPopoverOpen(false);
  };

  const localEntries = getWeekEntriesFromLocalStorage();

  // ── Shared select chevron ─────────────────────────────────────────────────
  const ChevronDown = () => (
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888780]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );

  // ── Tooltip wrapper ───────────────────────────────────────────────────────
  const Tooltip = ({ text }: { text: string }) => (
    <span className="relative group">
      <Info className="w-4 h-4 text-[#DA7756] cursor-help" />
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-[#2C2C2A] text-white text-xs font-medium rounded-lg px-3 py-2 w-72 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
        {text}
        <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-4 border-transparent border-t-[#2C2C2A]" />
      </span>
    </span>
  );

  return (
    <div className="font-sans bg-[#FEF4EE]">

      {/* ── Section Header ──────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-6 border-b border-[#D6B99D] bg-[#FEF4EE]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#DA7756] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Lightbulb className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-[18px] font-bold text-[#2C2C2A] flex items-center gap-2">
            Review of Past Week
            <Tooltip text="Review what happened in the past 7 days — your wins, challenges, gratitude, insights, and life balance." />
          </h1>
        </div>

        {/* Weekly Story */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-2">
            My Weekly Story
            <Tooltip text="Reflect on the past week — what happened each day, accomplishments, learnings, and feelings. Use the import button to bring in your daily journal entries automatically." />
          </span>

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="text-[13px] font-semibold text-[#DA7756] border border-[#D6B99D] bg-white px-3 py-1.5 rounded-lg hover:bg-[#FEF4EE] hover:border-[#DA7756] transition-all shadow-sm">
                Import from Daily Journal
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-[320px] p-0 z-50 rounded-xl border border-[#D6B99D] shadow-lg" align="end">
              <div className="px-4 py-3 border-b border-[#D6B99D] bg-[#FEF4EE] flex justify-between items-center rounded-t-xl">
                <span className="font-bold text-sm text-[#2C2C2A]">Daily Entries</span>
                <button
                  onClick={importAllToStory}
                  className="text-xs text-[#DA7756] font-bold hover:text-[#C26547] transition-colors"
                >
                  Import All
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-3 flex flex-col gap-2 bg-white rounded-b-xl">
                {localEntries.length === 0 ? (
                  <p className="text-sm text-[#888780] text-center py-4">
                    No daily entries found for this week.
                    <br />
                    <span className="text-xs text-[#888780] mt-1 block">
                      Save a Daily Journal entry first.
                    </span>
                  </p>
                ) : (
                  localEntries.map(({ date, entry }) => {
                    const accs = entry.accomplishments ?? [];
                    return (
                      <div
                        key={format(date, "yyyy-MM-dd")}
                        className="group flex flex-col gap-1 cursor-pointer bg-[#FEF4EE] border border-[#D6B99D] p-3 rounded-xl hover:border-[#DA7756] transition-all"
                        onClick={() => importDayToStory(date, entry)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-[#2C2C2A]">
                            {format(date, "EEEE, MMMM d")}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-[#DA7756] opacity-0 group-hover:opacity-100 transition-opacity bg-[#DA7756]/10 px-1.5 py-0.5 rounded-full">
                            + Import
                          </span>
                        </div>
                        <div className="text-xs text-[#2C2C2A] whitespace-pre-wrap mt-0.5">
                          {accs.length === 0 ? (
                            <span className="italic text-[#888780]">No accomplishments</span>
                          ) : (
                            accs
                              .filter((a) => a.title?.trim())
                              .map((a, i) => (
                                <div key={i}>{a.checked ? `✅ ${a.title}` : `• ${a.title}`}</div>
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
          className="w-full min-h-[80px] p-4 text-[14px] text-[#2C2C2A] placeholder:text-[#888780] outline-none resize-y border border-[#D6B99D] rounded-xl focus:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 bg-white shadow-sm leading-relaxed transition-all"
          placeholder="Reflect on your week — what happened each day, what you accomplished, what you learned, and how you felt..."
        />
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="p-6 pt-5 space-y-6 bg-white">

        {/* 1. TOP WINS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-2">
              Top Wins of Past Week
              <Tooltip text="What did you achieve last week? Check off items as you accomplished them. These were your strategic priorities from the previous week." />
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAllWins}
                className="text-xs font-medium text-[#888780] hover:text-[#2C2C2A] transition-colors"
              >
                Uncheck All
              </button>
              <button
                onClick={addNewWin}
                className="flex items-center gap-1 bg-[#DA7756] hover:bg-[#C26547] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Win
              </button>
            </div>
          </div>

          <div
            className={`rounded-xl min-h-[100px] flex flex-col ${
              wins.length === 0
                ? "border-2 border-dashed border-[#D6B99D] bg-[#FEF4EE]"
                : "border border-[#D6B99D] bg-[#FEF4EE]"
            }`}
          >
            {wins.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <p className="text-sm text-[#888780] mb-3">No wins added yet</p>
                <button
                  onClick={addNewWin}
                  className="flex items-center gap-1.5 border border-[#D6B99D] hover:border-[#DA7756] text-[#2C2C2A] text-xs font-medium px-4 py-1.5 rounded-lg bg-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Your First Win
                </button>
              </div>
            ) : (
              <div className="flex flex-col w-full p-2 gap-2">
                {wins.map((win, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 border border-[#D6B99D] rounded-xl bg-white shadow-sm"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={win.completed}
                      onChange={(e) => updateWin(idx, "completed", e.target.checked)}
                      className="w-4 h-4 ml-1 mt-1 rounded border-[#D6B99D] cursor-pointer shrink-0 accent-[#0B5D41]"
                    />

                    {/* Description */}
                    <textarea
                      value={win.description}
                      onChange={(e) => updateWin(idx, "description", e.target.value)}
                      autoFocus
                      rows={1}
                      placeholder="Describe your win..."
                      className={`flex-1 outline-none text-[14px] bg-transparent px-2 resize-y leading-relaxed min-h-[28px] placeholder:text-[#888780] ${
                        win.completed ? "line-through text-[#888780]" : "text-[#2C2C2A]"
                      }`}
                    />

                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      {/* Day dropdown */}
                      <div className="relative">
                        <select
                          value={win.day}
                          onChange={(e) => updateWin(idx, "day", e.target.value)}
                          className="appearance-none text-[13px] font-medium border border-[#D6B99D] rounded-lg pl-3 pr-7 py-1.5 text-[#2C2C2A] outline-none bg-white cursor-pointer hover:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 transition-all"
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

                      {/* Category dropdown */}
                      <div className="relative">
                        <select
                          value={win.category}
                          onChange={(e) => updateWin(idx, "category", e.target.value)}
                          className="appearance-none text-[13px] font-medium border border-[#D6B99D] rounded-lg pl-3 pr-7 py-1.5 text-[#2C2C2A] outline-none bg-white cursor-pointer hover:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 transition-all"
                        >
                          <option value="Career">💼 Career</option>
                          <option value="Health">❤️ Health</option>
                          <option value="Relations">🤝 Relations</option>
                          <option value="Personal Growth">🌱 Growth</option>
                          <option value="Finance">💰 Finance</option>
                        </select>
                        <ChevronDown />
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeWin(idx)}
                        className="p-1.5 text-[#888780] hover:text-[#A32D2D] transition-colors"
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

        {/* 2. BIGGEST CHALLENGE */}
        <section>
          <div className="bg-[#FEF4EE] border border-[#D6B99D] rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-[#D6B99D]">
              <h2 className="text-sm font-semibold text-[#2C2C2A]">
                Biggest Challenge &amp; Cause
              </h2>
            </div>
            <textarea
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              rows={3}
              className="w-full min-h-[88px] p-4 text-[14px] text-[#2C2C2A] placeholder:text-[#888780] outline-none resize-y bg-white focus:ring-1 focus:ring-[#DA7756]/30 transition-all"
              placeholder="What was your biggest challenge this week, perhaps a recurring behavior, and what caused it?"
            />
          </div>
        </section>

        {/* 3. GRATITUDE & KEY INSIGHT */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: "Gratitude",
              value: gratitude,
              setter: setGratitude,
              placeholder: "What are you grateful for?",
            },
            {
              label: "Key Insight",
              value: insight,
              setter: setInsight,
              placeholder:
                "You are the ultimate creator for everything that manifests in your life. What were your insights this week?",
            },
          ].map(({ label, value, setter, placeholder }) => (
            <div
              key={label}
              className="bg-[#FEF4EE] border border-[#D6B99D] rounded-xl overflow-hidden flex flex-col shadow-sm"
            >
              <div className="px-4 py-3 border-b border-[#D6B99D]">
                <h2 className="text-sm font-semibold text-[#2C2C2A]">{label}</h2>
              </div>
              <textarea
                value={value}
                onChange={(e) => setter(e.target.value)}
                rows={3}
                className="w-full min-h-[100px] p-4 text-[14px] text-[#2C2C2A] placeholder:text-[#888780] outline-none resize-y bg-white focus:ring-1 focus:ring-[#DA7756]/30 transition-all"
                placeholder={placeholder}
              />
            </div>
          ))}
        </section>

        {/* 4. AUTO-CALCULATED LIFE BALANCE */}
        <section className="bg-[#FEF4EE] border border-[#D6B99D] rounded-xl p-5 shadow-sm">
          {/* Auto score header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-2">
              Auto-Calculated Life Balance
              <Tooltip text="Automatically calculated based on how balanced your wins are across all 5 life areas. 10/10 means equal focus on all areas." />
            </span>
            <span className="text-[22px] font-extrabold text-[#DA7756]">
              {autoScore}/10
            </span>
          </div>

          {/* Category bars */}
          <div className="flex gap-2 mb-3">
            {LIFE_BALANCE_CATEGORIES.map(({ key }) => {
              const count = categoryCounts.find((c) => c.key === key)?.count ?? 0;
              const isActive = count > 0;
              return (
                <div
                  key={key}
                  className="flex-1 h-[68px] rounded-xl transition-all duration-300 relative overflow-hidden border border-[#D6B99D]"
                  style={{
                    backgroundColor: isActive
                      ? CATEGORY_COLORS[key]
                      : CATEGORY_BG_INACTIVE[key],
                  }}
                >
                  {isActive && (
                    <span className="absolute top-1.5 right-2 text-[11px] font-bold text-white/90 drop-shadow-sm">
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Emoji labels */}
          <div className="flex justify-around px-1 mb-6">
            {LIFE_BALANCE_CATEGORIES.map(({ key, emoji, label }) => {
              const count = categoryCounts.find((c) => c.key === key)?.count ?? 0;
              const isActive = count > 0;
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-0.5 transition-colors ${
                    isActive ? "text-[#2C2C2A]" : "text-[#888780]"
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-[11px] font-semibold">{label}</span>
                  <span className="text-[12px] font-bold">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Manual slider */}
          <div className="pt-2 border-t border-[#D6B99D]">
            <div className="flex items-center justify-between mb-3 mt-4">
              <span className="text-sm font-semibold text-[#2C2C2A]">
                Your Life Balance Rating
              </span>
              <span className="text-[22px] font-extrabold text-[#DA7756]">
                {balanceRating}/10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={balanceRating}
              onChange={(e) => setBalanceRating(parseFloat(e.target.value))}
              className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #DA7756 0%, #DA7756 ${(balanceRating / 10) * 100}%, #D6B99D ${(balanceRating / 10) * 100}%, #D6B99D 100%)`,
              }}
            />
            <style>{`input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: white; border: 2px solid #DA7756; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }`}</style>
          </div>
        </section>

      </div>
    </div>
  );
}