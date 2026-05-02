import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Info,
  Check,
  X as XIcon,
  Loader2,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  addDays,
} from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MissionHabitsConnectionProps {
  coreValue: string;
  setCoreValue: React.Dispatch<React.SetStateAction<string>>;
  missionText: string;
  setMissionText: React.Dispatch<React.SetStateAction<string>>;
  habitsText: string;
  setHabitsText: React.Dispatch<React.SetStateAction<string>>;
  currentDate?: Date;
}

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

const getEntryHabits = (entry: any) => {
  return (
    entry?.habits_snapshot ||
    entry?.data?.habits_snapshot ||
    entry?.user_journal?.habits_snapshot ||
    entry?.user_journal?.data?.habits_snapshot ||
    []
  );
};

const getHabitKey = (habit: any) => String(habit?.habit_id ?? habit?.id ?? "");

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

export default function MissionHabitsConnection({
  coreValue,
  setCoreValue,
  missionText,
  setMissionText,
  habitsText,
  setHabitsText,
  currentDate = new Date(),
}: MissionHabitsConnectionProps) {
  const navigate = useNavigate();

  const [coreValues, setCoreValues] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [habits, setHabits] = useState<any[]>([]);
  const [visionImages, setVisionImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [dailyEntries, setDailyEntries] = useState<any[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  const dateRangeStr = `${format(weekStart, "MMM d")} - ${format(
    weekEnd,
    "MMM d, yyyy",
  )}`;

  const weekStartDateStr = format(weekStart, "yyyy-MM-dd");

  const previousWeekStart = subWeeks(weekStart, 1);
  const previousWeekEnd = endOfWeek(previousWeekStart, { weekStartsOn: 0 });

  const previousWeekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(previousWeekStart, i),
  );

  const previousWeekDateKeys = previousWeekDays.map((day) =>
    format(day, "yyyy-MM-dd"),
  );

  const previousWeekRangeLabel = `${format(
    previousWeekStart,
    "MMM d",
  )} - ${format(previousWeekEnd, "MMM d")}`;

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const token = getAuthToken();

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const weekDays = Array.from({ length: 7 }, (_, i) =>
          addDays(weekStart, i),
        );

        const [cvRes, habitsRes, visionRes, dailyJournalResults] = await Promise.all([
          fetch("https://life-api.lockated.com/core_values", {
            headers,
          }).catch(() => null),
          fetch(`https://life-api.lockated.com/habits?date=${weekStartDateStr}`, {
            headers,
          }).catch(() => null),
          fetch("https://life-api.lockated.com/vision.json", {
            headers,
          }).catch(() => null),
          Promise.all(
            weekDays.map((day) =>
              fetch(
                `https://life-api.lockated.com/user_journals/0?date=${format(day, "yyyy-MM-dd")}&journal_type=daily`,
                { headers },
              ).catch(() => null),
            ),
          ),
        ]);

        if (cvRes && cvRes.ok) {
          const cvData = await cvRes.json();
          setCoreValues(Array.isArray(cvData) ? cvData : cvData.data || []);
        }

        if (habitsRes && habitsRes.ok) {
          const habitsData = await habitsRes.json();
          const fetchedHabits = Array.isArray(habitsData)
            ? habitsData
            : habitsData.data || [];

          const submittedHabitHistory: Record<string, boolean[]> = {};

          await Promise.all(
            dailyJournalResults.map(async (res, dayIdx) => {
              if (!res || !res.ok) return;

              try {
                const data = await res.json();
                const journal = Array.isArray(data)
                  ? data[0]
                  : data?.user_journal ?? data;

                getEntryHabits(journal).forEach((habit: any) => {
                  const key = getHabitKey(habit);
                  if (!key || !habit.completed) return;

                  submittedHabitHistory[key] =
                    submittedHabitHistory[key] || [];
                  submittedHabitHistory[key][dayIdx] = true;
                });
              } catch {
                // Keep the weekly tracker usable even if one day cannot parse.
              }
            }),
          );

          setHabits(
            fetchedHabits.map((habit: any) => {
              const fetchedHistory =
                habit.week_history || habit.weekly_completion || [];
              const submittedHistory =
                submittedHabitHistory[getHabitKey(habit)] || [];

              return {
                ...habit,
                week_history: Array.from({ length: 7 }, (_, i) =>
                  Boolean(fetchedHistory[i] || submittedHistory[i]),
                ),
              };
            }),
          );
        }

        if (visionRes && visionRes.ok) {
          const vData = await visionRes.json();
          const vision = Array.isArray(vData)
            ? vData[0]
            : vData?.vision || vData;

          if (vision) {
            let imageUrls: string[] = [];

            if (Array.isArray(vision.images)) {
              imageUrls = vision.images
                .map((img: any) => (typeof img === "object" ? img.url : img))
                .filter(Boolean);
            } else if (vision.image) {
              imageUrls =
                typeof vision.image === "object"
                  ? [vision.image.url]
                  : [vision.image];
            }

            setVisionImages(imageUrls);
          }
        }
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weekStartDateStr]);

  useEffect(() => {
    if (!isImportOpen) return;

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

        setDailyEntries(previousWeekEntries);
      } catch (error) {
        console.error("Failed to fetch daily journal entries", error);
        setDailyEntries([]);
      } finally {
        setIsLoadingEntries(false);
      }
    };

    fetchPreviousWeekDailyJournals();
  }, [isImportOpen, currentDate]);

  const importDayToHabitsText = (entry: any) => {
    const entryDateString = getEntryDate(entry);

    if (!entryDateString) return;

    const localDate = getLocalDateFromKey(entryDateString);
    const accomplishments = getEntryAccomplishments(entry);

    const validAchievements = accomplishments
      .map((achievement: any) => getAchievementTitle(achievement).trim())
      .filter(Boolean);

    if (validAchievements.length === 0) {
      setIsImportOpen(false);
      return;
    }

    const lines: string[] = [`${format(localDate, "EEEE, MMMM d")}`];

    validAchievements.forEach((title: string) => {
      lines.push(`✅ ${title}`);
    });

    const text = lines.join("\n");

    setHabitsText((prev) => (prev ? `${prev}\n\n${text}` : text));
    setIsImportOpen(false);
  };

  const importAllToHabitsText = () => {
    if (dailyEntries.length === 0) return;

    const allLines: string[] = [];

    dailyEntries.forEach((entry) => {
      const entryDateString = getEntryDate(entry);

      if (!entryDateString) return;

      const localDate = getLocalDateFromKey(entryDateString);
      const accomplishments = getEntryAccomplishments(entry);

      const validAchievements = accomplishments
        .map((achievement: any) => getAchievementTitle(achievement).trim())
        .filter(Boolean);

      if (validAchievements.length === 0) return;

      allLines.push(`${format(localDate, "EEEE, MMMM d")}`);

      validAchievements.forEach((title: string) => {
        allLines.push(`✅ ${title}`);
      });

      allLines.push("");
    });

    const text = allLines.join("\n").trim();

    if (text) {
      setHabitsText((prev) => (prev ? `${prev}\n\n${text}` : text));
    }

    setIsImportOpen(false);
  };

  return (
    <div className="font-sans bg-[#FEF4EE] flex flex-col h-full rounded-2xl">
      {/* 1. Header */}
      <div className="px-6 py-4 border-b border-[#D6B99D] flex items-center gap-3 bg-[#FEF4EE] rounded-t-2xl">
        <div className="w-10 h-10 rounded-xl bg-[#DA7756] flex items-center justify-center shrink-0 shadow-sm">
          <ArrowUpRight className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>

        <h2 className="text-[18px] font-bold text-[#2C2C2A]">
          Mission &amp; Habits Connection
        </h2>
      </div>

      {/* 2. Core Value & Mission Setup */}
      <div className="p-6 space-y-6 bg-[#FEF4EE]">
        {/* Core Value Dropdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-[#2C2C2A]">
                Core Value Lived Most This Week
              </label>

              <span className="relative group">
                <Info className="w-4 h-4 text-[#DA7756] cursor-help" />
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-[#2C2C2A] text-white text-xs font-medium rounded-lg px-3 py-2 w-64 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                  Which of your core values did you embody most strongly this
                  week?
                  <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-4 border-transparent border-t-[#2C2C2A]" />
                </span>
              </span>
            </div>

            <button
              onClick={() => navigate("/vision-values")}
              className="text-[#DA7756] hover:text-[#C26547] text-xs font-semibold transition-colors"
            >
              Manage Core Values
            </button>
          </div>

          <div className="relative">
            <select
              value={coreValue}
              onChange={(e) => setCoreValue(e.target.value)}
              className="w-full appearance-none p-2.5 pr-8 text-[14px] text-[#2C2C2A] border border-[#D6B99D] rounded-xl outline-none focus:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 bg-white cursor-pointer shadow-sm transition-all"
            >
              <option value="" disabled className="text-[#888780]">
                Select a core value
              </option>

              {coreValues.map((cv) => (
                <option key={cv.id} value={cv.name}>
                  {cv.name}
                </option>
              ))}
            </select>

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
          </div>
        </div>

        {/* Vision Board */}
        {visionImages.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-[#D6B99D] shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-5 h-5 text-[#DA7756]" strokeWidth={2.5} />

              <h3 className="font-bold text-[16px] text-[#2C2C2A]">
                Vision Board
              </h3>
            </div>

            <p className="text-sm text-[#888780] mb-4">
              Keep your dreams visible as you reflect on your week
            </p>

            <div className="relative rounded-lg overflow-hidden bg-[#FEF4EE] border border-[#D6B99D]">
              <img
                src={visionImages[0]}
                alt="Vision Board"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        {/* Mission Connection Textarea */}
        <div>
          <label className="text-sm font-semibold text-[#2C2C2A] block mb-2">
            Mission Connection
          </label>

          <textarea
            value={missionText}
            onChange={(e) => setMissionText(e.target.value)}
            placeholder="How did your behaviors this week align with or challenge your mission?"
            className="w-full h-[88px] p-3 text-[14px] text-[#2C2C2A] placeholder:text-[#888780] border border-[#D6B99D] rounded-xl outline-none resize-none focus:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 bg-white shadow-sm transition-all"
          />
        </div>
      </div>

      {/* 3. Habits Summary Header Strip */}
      <div className="bg-[#FEF4EE] border-y border-[#D6B99D] px-6 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#2C2C2A]">
          Habits Summary ({dateRangeStr})
        </h3>
      </div>

      {/* 4. Habits Tracker & Reflection */}
      <div className="p-6 space-y-6 bg-white flex-1 rounded-b-2xl">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#DA7756]">
              Weekly Habits Tracker (Read-Only)
            </span>

            <button
              onClick={() => navigate("/goals-habits")}
              className="text-[#DA7756] hover:text-[#C26547] text-xs font-semibold transition-colors"
            >
              Manage Habits
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-[#DA7756]" />
            </div>
          ) : habits && habits.length > 0 ? (
            <div className="space-y-6">
              {habits.map((habit, idx) => {
                const completedCount = habit.week_history
                  ? habit.week_history.filter(Boolean).length
                  : 0;

                return (
                  <div key={idx} className="flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-[15px] text-[#2C2C2A] block">
                          {habit.name}
                        </span>

                        <span className="text-[12px] text-[#888780] font-medium">
                          {completedCount}/7 days completed
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-0.5 rounded-full bg-[#FEF4EE] text-[#2C2C2A] text-[12px] font-semibold border border-[#D6B99D]">
                          {habit.category || "Other"}
                        </span>

                        <span className="text-[#888780] text-[12px] font-medium">
                          {habit.frequency || "Daily"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 mb-1.5">
                      {daysOfWeek.map((day) => (
                        <div
                          key={day}
                          className="text-center text-[12px] font-medium text-[#888780]"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 h-[30px] rounded-xl overflow-hidden bg-[#FEF4EE] shadow-sm border border-[#D6B99D]">
                      {daysOfWeek.map((day, i) => {
                        const isCompleted = habit.week_history
                          ? habit.week_history[i]
                          : false;

                        return (
                          <div
                            key={day}
                            className={`flex items-center justify-center border-r last:border-r-0 border-white/60 transition-colors ${
                              isCompleted
                                ? "bg-[#0B5D41]/[0.08]"
                                : "bg-[#A32D2D]/[0.08]"
                            }`}
                          >
                            {isCompleted ? (
                              <Check
                                className="w-4 h-4 text-[#0B5D41]"
                                strokeWidth={3.5}
                              />
                            ) : (
                              <XIcon
                                className="w-4 h-4 text-[#A32D2D]"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-sm text-[#888780] font-medium mb-3">
                No weekly habits defined yet
              </p>

              <button
                onClick={() => navigate("/goals-habits")}
                className="border border-[#D6B99D] hover:border-[#DA7756] bg-white text-[#2C2C2A] text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
              >
                Create Your First Habit
              </button>
            </div>
          )}
        </div>

        {/* Habits Reflection Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-[#2C2C2A]">
              Habits Reflection
            </label>

            <Popover open={isImportOpen} onOpenChange={setIsImportOpen}>
              <PopoverTrigger asChild>
                <button className="text-xs font-semibold text-[#DA7756] border border-[#D6B99D] bg-white px-3 py-1.5 rounded-lg hover:bg-[#FEF4EE] hover:border-[#DA7756] transition-all shadow-sm">
                  Import
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
                        Daily Journal Entries
                      </span>

                      <p className="text-xs text-[#888780] mt-0.5">
                        Importing from {previousWeekRangeLabel}
                      </p>
                    </div>

                    <button
                      onClick={importAllToHabitsText}
                      disabled={dailyEntries.length === 0}
                      className="text-xs text-[#DA7756] font-bold hover:text-[#C26547] transition-colors disabled:opacity-50 disabled:hover:text-[#DA7756]"
                    >
                      Import All
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto p-3 flex flex-col gap-2 bg-white rounded-b-xl">
                  {isLoadingEntries ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-[#888780]">
                      <Loader2 className="w-5 h-5 animate-spin text-[#DA7756]" />
                      <p className="text-sm">Fetching entries...</p>
                    </div>
                  ) : dailyEntries.length === 0 ? (
                    <p className="text-sm text-[#888780] text-center py-4">
                      No daily journal entries found for {previousWeekRangeLabel}.
                      <br />
                      <span className="text-xs text-[#888780] mt-1 block">
                        Save Daily Journal entries for the previous week first.
                      </span>
                    </p>
                  ) : (
                    dailyEntries.map((entry) => {
                      const entryDateString = getEntryDate(entry);
                      const localDate = getLocalDateFromKey(entryDateString);
                      const accomplishments = getEntryAccomplishments(entry);

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
                                .filter((a: any) =>
                                  getAchievementTitle(a).trim(),
                                )
                                .map((a: any, i: number) => (
                                  <div key={i}>
                                    ✅ {getAchievementTitle(a)}
                                  </div>
                                ))
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => importDayToHabitsText(entry)}
                              className="text-[11px] font-bold text-white bg-[#DA7756] px-2.5 py-1 rounded-full hover:bg-[#C26547] transition-colors"
                            >
                              Import
                            </button>
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
            value={habitsText}
            onChange={(e) => setHabitsText(e.target.value)}
            placeholder="How did your habits go this week? Which ones did you maintain consistently?"
            className="w-full h-[88px] p-3 text-[14px] text-[#2C2C2A] placeholder:text-[#888780] border border-[#D6B99D] rounded-xl outline-none resize-none focus:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 bg-white shadow-sm transition-all"
          />
        </div>
      </div>
    </div>
  );
}
