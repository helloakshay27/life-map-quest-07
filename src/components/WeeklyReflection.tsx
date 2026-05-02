import React, { useState, useEffect } from "react";
import { Info, Plus, Lightbulb, X, Loader2 } from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  subWeeks,
} from "date-fns";
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

const LIFE_BALANCE_CATEGORIES = [
  { key: "Career", emoji: "💼", label: "Career" },
  { key: "Health", emoji: "❤️", label: "Health" },
  { key: "Relations", emoji: "🤝", label: "Relation" },
  { key: "Personal Growth", emoji: "🌱", label: "Growth" },
  { key: "Finance", emoji: "💰", label: "Finance" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Career: "#1858A5",
  Health: "#DA7756",
  Relations: "#534AB7",
  "Personal Growth": "#0B5D41",
  Finance: "#BA7517",
};

const CATEGORY_BG_INACTIVE: Record<string, string> = {
  Career: "#D5D8D8",
  Health: "#D5D8D8",
  Relations: "#D5D8D8",
  "Personal Growth": "#D5D8D8",
  Finance: "#D5D8D8",
};

const getAuthToken = () =>
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  "";

const getEntryDate = (entry: any) => {
  return (
    entry?.start_date ||
    entry?.date ||
    entry?.journal_date ||
    entry?.user_journal?.start_date ||
    ""
  );
};

const getEntryAccomplishments = (entry: any) => {
  return (
    entry?.accomplishments ||
    entry?.data?.accomplishments ||
    entry?.user_journal?.accomplishments ||
    entry?.user_journal?.data?.accomplishments ||
    []
  );
};

const getAchievementTitle = (achievement: any) => {
  return (
    achievement?.title ||
    achievement?.description ||
    achievement?.name ||
    achievement?.text ||
    ""
  );
};

const getLocalDateFromKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
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
}: WeeklyReflectionProps) {
  const [isStoryPopoverOpen, setIsStoryPopoverOpen] = useState(false);
  const [isWinsPopoverOpen, setIsWinsPopoverOpen] = useState(false);

  const [apiEntries, setApiEntries] = useState<any[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  const allWinsCompleted = wins.length > 0 && wins.every((w) => w.completed);

  const addNewWin = () => {
    setWins([
      ...wins,
      {
        description: "",
        day: "Tue",
        category: "Career",
        completed: true,
      },
    ]);
  };

  const updateWin = (
    index: number,
    field: keyof Win,
    value: string | boolean,
  ) => {
    const updatedWins = [...wins];

    updatedWins[index] = {
      ...updatedWins[index],
      [field]: value,
    };

    setWins(updatedWins);
  };

  const removeWin = (index: number) => {
    setWins(wins.filter((_, i) => i !== index));
  };

  const toggleAllWins = () => {
    setWins(wins.map((w) => ({ ...w, completed: !allWinsCompleted })));
  };

  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const previousWeekStart = subWeeks(currentWeekStart, 1);
  const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 0 });

  const previousWeekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(previousWeekStart, i),
  );

  const previousWeekDateKeys = previousWeekDays.map((day) =>
    format(day, "yyyy-MM-dd"),
  );

  const importRangeLabel = `${format(previousWeekStart, "MMM d")} - ${format(
    previousWeekEnd,
    "MMM d",
  )}`;

  const categoryCounts = LIFE_BALANCE_CATEGORIES.map(({ key }) => ({
    key,
    count: wins.filter((w) => w.category === key && w.completed).length,
  }));

  const totalWins = categoryCounts.reduce((sum, c) => sum + c.count, 0);
  const filledCategories = categoryCounts.filter((c) => c.count > 0).length;
  const autoScore =
    totalWins === 0 ? 0 : Math.round((filledCategories / 5) * 10);

  useEffect(() => {
    if (!isStoryPopoverOpen && !isWinsPopoverOpen) return;

    const fetchPreviousWeekDailyJournals = async () => {
      setIsLoadingEntries(true);

      try {
        const token = getAuthToken();

        const res = await fetch(
          "https://life-api.lockated.com/user_journals?journal_type=daily",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch daily journals");
        }

        const data = await res.json();

        const journals = Array.isArray(data)
          ? data
          : data?.user_journals || data?.journals || data?.data || [];

        const previousWeekEntries = journals.filter((journal: any) => {
          const journalDate = getEntryDate(journal);

          return (
            (journal.journal_type === "daily" || !journal.journal_type) &&
            previousWeekDateKeys.includes(journalDate)
          );
        });

        previousWeekEntries.sort((a: any, b: any) => {
          const dateA = getEntryDate(a);
          const dateB = getEntryDate(b);
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });

        setApiEntries(previousWeekEntries);
      } catch (err) {
        console.error("Failed to fetch previous week daily journals", err);
        setApiEntries([]);
      } finally {
        setIsLoadingEntries(false);
      }
    };

    fetchPreviousWeekDailyJournals();
  }, [isStoryPopoverOpen, isWinsPopoverOpen, currentDate]);

  const importDayToStory = (entry: any) => {
    const entryDateString = getEntryDate(entry);

    if (!entryDateString) return;

    const localDate = getLocalDateFromKey(entryDateString);
    const dateLabel = format(localDate, "EEEE, MMMM d");

    const lines: string[] = [`**${dateLabel}**`];

    const accomplishments = getEntryAccomplishments(entry);

    for (const achievement of accomplishments) {
      const title = getAchievementTitle(achievement).trim();

      if (title) {
        lines.push(`✅ ${title}`);
      }
    }

    setWeeklyStory((prev) =>
      prev ? `${prev}\n\n${lines.join("\n")}` : lines.join("\n"),
    );

    setIsStoryPopoverOpen(false);
  };

  const importAllToStory = () => {
    if (apiEntries.length === 0) return;

    const allLines: string[] = [];

    for (const entry of apiEntries) {
      const entryDateString = getEntryDate(entry);

      if (!entryDateString) continue;

      const localDate = getLocalDateFromKey(entryDateString);

      allLines.push(`**${format(localDate, "EEEE, MMMM d")}**`);

      const accomplishments = getEntryAccomplishments(entry);

      for (const achievement of accomplishments) {
        const title = getAchievementTitle(achievement).trim();

        if (title) {
          allLines.push(`✅ ${title}`);
        }
      }

      allLines.push("");
    }

    const text = allLines.join("\n").trim();

    if (text) {
      setWeeklyStory((prev) => (prev ? `${prev}\n\n${text}` : text));
    }

    setIsStoryPopoverOpen(false);
  };

  const buildWinsFromEntry = (entry: any): Win[] => {
    const entryDateString = getEntryDate(entry);

    if (!entryDateString) return [];

    const localDate = getLocalDateFromKey(entryDateString);
    const accomplishments = getEntryAccomplishments(entry);

    return accomplishments
      .map((achievement: any) => {
        const description = getAchievementTitle(achievement).trim();

        if (!description) return null;

        return {
          description,
          day: format(localDate, "EEE"),
          category: "Career",
          completed: true,
        };
      })
      .filter(Boolean) as Win[];
  };

  const importDayToWins = (entry: any) => {
    const newWins = buildWinsFromEntry(entry);

    if (newWins.length === 0) {
      setIsWinsPopoverOpen(false);
      return;
    }

    setWins((prev) => {
      const existingKeys = new Set(
        prev.map((win) =>
          `${win.day}-${win.category}-${win.description}`.toLowerCase(),
        ),
      );

      const uniqueWins = newWins.filter((win) => {
        const key =
          `${win.day}-${win.category}-${win.description}`.toLowerCase();

        return !existingKeys.has(key);
      });

      return [...prev, ...uniqueWins];
    });

    setIsWinsPopoverOpen(false);
  };

  const importAllToWins = () => {
    if (apiEntries.length === 0) return;

    const allImportedWins = apiEntries.flatMap((entry) =>
      buildWinsFromEntry(entry),
    );

    if (allImportedWins.length === 0) {
      setIsWinsPopoverOpen(false);
      return;
    }

    setWins((prev) => {
      const existingKeys = new Set(
        prev.map((win) =>
          `${win.day}-${win.category}-${win.description}`.toLowerCase(),
        ),
      );

      const uniqueWins = allImportedWins.filter((win) => {
        const key =
          `${win.day}-${win.category}-${win.description}`.toLowerCase();

        return !existingKeys.has(key);
      });

      return [...prev, ...uniqueWins];
    });

    setIsWinsPopoverOpen(false);
  };

  const ChevronDownIcon = () => (
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888780]"
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

  const Tooltip = ({ text }: { text: string }) => (
    <span className="relative group">
      <Info className="w-4 h-4 text-[#DA7756] cursor-help" />

      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-[#2C2C2A] text-white text-xs font-medium rounded-lg px-3 py-2 w-72 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
        {text}
        <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-4 border-transparent border-t-[#2C2C2A]" />
      </span>
    </span>
  );

  const renderDailyEntriesList = ({ mode }: { mode: "story" | "wins" }) => {
    if (isLoadingEntries) {
      return (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-[#888780]">
          <Loader2 className="w-5 h-5 animate-spin text-[#DA7756]" />
          <p className="text-sm">Fetching daily entries...</p>
        </div>
      );
    }

    if (apiEntries.length === 0) {
      return (
        <p className="text-sm text-[#888780] text-center py-4">
          No daily entries found for {importRangeLabel}.
          <br />
          <span className="text-xs text-[#888780] mt-1 block">
            Save Daily Journal entries for the previous week first.
          </span>
        </p>
      );
    }

    return apiEntries.map((entry) => {
      const entryDateString = getEntryDate(entry);
      const accomplishments = getEntryAccomplishments(entry);
      const localDate = getLocalDateFromKey(entryDateString);

      return (
        <div
          key={entry.id || entryDateString}
          className="group flex flex-col gap-2 bg-[#FEF4EE] border border-[#D6B99D] p-3 rounded-xl hover:border-[#DA7756] transition-all"
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm text-[#2C2C2A]">
              {format(localDate, "EEEE, MMMM d")}
            </span>
          </div>

          <div className="text-xs text-[#2C2C2A] whitespace-pre-wrap mt-0.5">
            {accomplishments.length === 0 ? (
              <span className="italic text-[#888780]">
                No accomplishments
              </span>
            ) : (
              accomplishments
                .filter((a: any) => getAchievementTitle(a).trim())
                .map((a: any, i: number) => (
                  <div key={i}>✅ {getAchievementTitle(a)}</div>
                ))
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            {mode === "story" ? (
              <button
                type="button"
                onClick={() => importDayToStory(entry)}
                className="text-[11px] font-bold text-white bg-[#DA7756] px-2.5 py-1 rounded-full hover:bg-[#C26547] transition-colors"
              >
                Import to Story
              </button>
            ) : (
              <button
                type="button"
                onClick={() => importDayToWins(entry)}
                className="text-[11px] font-bold text-white bg-[#DA7756] px-2.5 py-1 rounded-full hover:bg-[#C26547] transition-colors"
              >
                Import to Wins
              </button>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="font-sans bg-[#FEF4EE]">
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

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-2">
            My Weekly Story
            <Tooltip text="Reflect on the past week — what happened each day, accomplishments, learnings, and feelings. Use the import button to bring in your previous week's daily journal entries automatically." />
          </span>

          <Popover
            open={isStoryPopoverOpen}
            onOpenChange={setIsStoryPopoverOpen}
          >
            <PopoverTrigger asChild>
              <button className="text-[13px] font-semibold text-[#DA7756] border border-[#D6B99D] bg-white px-3 py-1.5 rounded-lg hover:bg-[#FEF4EE] hover:border-[#DA7756] transition-all shadow-sm">
                Import from Daily Journal
              </button>
            </PopoverTrigger>

            <PopoverContent
              className="w-[360px] p-0 z-50 rounded-xl border border-[#D6B99D] shadow-lg"
              align="end"
            >
              <div className="px-4 py-3 border-b border-[#D6B99D] bg-[#FEF4EE] rounded-t-xl">
                <div className="flex justify-between items-center gap-3">
                  <div>
                    <span className="font-bold text-sm text-[#2C2C2A]">
                      Daily Entries for Weekly Story
                    </span>
                    <p className="text-xs text-[#888780] mt-0.5">
                      Importing from {importRangeLabel}
                    </p>
                  </div>

                  <button
                    onClick={importAllToStory}
                    disabled={apiEntries.length === 0}
                    className="text-xs text-[#DA7756] font-bold hover:text-[#C26547] transition-colors disabled:opacity-50 disabled:hover:text-[#DA7756]"
                  >
                    Import All
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto p-3 flex flex-col gap-2 bg-white rounded-b-xl">
                {renderDailyEntriesList({ mode: "story" })}
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

      <div className="p-6 pt-5 space-y-6 bg-white">
        <section>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-2">
              Top Wins of Past Week
              <Tooltip text="What did you achieve last week? Use Import Past Week Wins to bring accomplishments from the previous week's daily journals into this section." />
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleAllWins}
                disabled={wins.length === 0}
                className="text-xs font-medium text-[#888780] hover:text-[#2C2C2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {allWinsCompleted ? "Uncheck All" : "Check All"}
              </button>

              <Popover
                open={isWinsPopoverOpen}
                onOpenChange={setIsWinsPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <button className="text-xs font-semibold text-[#DA7756] border border-[#D6B99D] bg-white px-3 py-1.5 rounded-lg hover:bg-[#FEF4EE] hover:border-[#DA7756] transition-all shadow-sm">
                    Import Past Week Wins
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-[360px] p-0 z-50 rounded-xl border border-[#D6B99D] shadow-lg"
                  align="end"
                >
                  <div className="px-4 py-3 border-b border-[#D6B99D] bg-[#FEF4EE] rounded-t-xl">
                    <div className="flex justify-between items-center gap-3">
                      <div>
                        <span className="font-bold text-sm text-[#2C2C2A]">
                          Past Week Achievements
                        </span>
                        <p className="text-xs text-[#888780] mt-0.5">
                          Importing wins from {importRangeLabel}
                        </p>
                      </div>

                      <button
                        onClick={importAllToWins}
                        disabled={apiEntries.length === 0}
                        className="text-xs text-[#DA7756] font-bold hover:text-[#C26547] transition-colors disabled:opacity-50 disabled:hover:text-[#DA7756]"
                      >
                        Import All
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto p-3 flex flex-col gap-2 bg-white rounded-b-xl">
                    {renderDailyEntriesList({ mode: "wins" })}
                  </div>
                </PopoverContent>
              </Popover>

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
                <p className="text-sm text-[#888780] mb-3">
                  No wins added yet
                </p>

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
                    <input
                      type="checkbox"
                      checked={win.completed}
                      onChange={(e) =>
                        updateWin(idx, "completed", e.target.checked)
                      }
                      className="w-4 h-4 ml-1 mt-1 rounded border-[#D6B99D] cursor-pointer shrink-0 accent-[#0B5D41]"
                    />

                    <textarea
                      value={win.description}
                      onChange={(e) =>
                        updateWin(idx, "description", e.target.value)
                      }
                      rows={1}
                      placeholder="Describe your win..."
                      className={`flex-1 outline-none text-[14px] bg-transparent px-2 resize-y leading-relaxed min-h-[28px] placeholder:text-[#888780] ${
                        win.completed
                          ? "line-through text-[#888780]"
                          : "text-[#2C2C2A]"
                      }`}
                    />

                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <div className="relative">
                        <select
                          value={win.day}
                          onChange={(e) =>
                            updateWin(idx, "day", e.target.value)
                          }
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
                        <ChevronDownIcon />
                      </div>

                      <div className="relative">
                        <select
                          value={win.category}
                          onChange={(e) =>
                            updateWin(idx, "category", e.target.value)
                          }
                          className="appearance-none text-[13px] font-medium border border-[#D6B99D] rounded-lg pl-3 pr-7 py-1.5 text-[#2C2C2A] outline-none bg-white cursor-pointer hover:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 transition-all"
                        >
                          <option value="Career">💼 Career</option>
                          <option value="Health">❤️ Health</option>
                          <option value="Relations">🤝 Relations</option>
                          <option value="Personal Growth">🌱 Growth</option>
                          <option value="Finance">💰 Finance</option>
                        </select>
                        <ChevronDownIcon />
                      </div>

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
                <h2 className="text-sm font-semibold text-[#2C2C2A]">
                  {label}
                </h2>
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

        <section className="bg-[#FEF4EE] border border-[#D6B99D] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#2C2C2A] flex items-center gap-2">
              Auto-Calculated Life Balance
              <Tooltip text="Automatically calculated based on how balanced your wins are across all 5 life areas. 10/10 means equal focus on all areas." />
            </span>

            <span className="text-[22px] font-extrabold text-[#DA7756]">
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

          <div className="flex justify-around px-1 mb-6">
            {LIFE_BALANCE_CATEGORIES.map(({ key, emoji, label }) => {
              const count =
                categoryCounts.find((c) => c.key === key)?.count ?? 0;
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
                background: `linear-gradient(to right, #DA7756 0%, #DA7756 ${
                  (balanceRating / 10) * 100
                }%, #D6B99D ${
                  (balanceRating / 10) * 100
                }%, #D6B99D 100%)`,
              }}
            />

            <style>{`
              input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white;
                border: 2px solid #DA7756;
                cursor: pointer;
                box-shadow: 0 1px 3px rgba(0,0,0,0.15);
              }
            `}</style>
          </div>
        </section>
      </div>
    </div>
  );
}