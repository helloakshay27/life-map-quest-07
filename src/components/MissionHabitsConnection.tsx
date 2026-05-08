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
  addDays,
} from "date-fns";

let missionHabitsDataCache: {
  coreValues: { id: number; name: string }[];
  habits: any[];
  visionImages: string[];
} | null = null;
let missionHabitsDataRequest: Promise<typeof missionHabitsDataCache> | null = null;

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

const getHabitApiDayForDate = (habit: any, dateKey: string) =>
  [...(habit?.this_week || []), ...(habit?.calendar_days || [])].find(
    (day: any) => String(day?.date || "").slice(0, 10) === dateKey,
  );

const parseDateOnly = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const normalizeDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const getHabitWeekdays = (habit: any) =>
  (habit?.target_days || habit?.weekdays || habit?.days || []).map((day: any) =>
    String(day).slice(0, 3).toLowerCase(),
  );

const isHabitScheduledOnDate = (habit: any, date: Date) => {
  const normalizedDate = normalizeDate(date);
  const startDate = parseDateOnly(habit?.start_date || habit?.startDate);
  if (startDate && normalizedDate < startDate) return false;

  const frequency = String(habit?.frequency || "daily").toLowerCase();
  if (frequency === "daily") return true;

  if (frequency === "weekly") {
    const weekdays = getHabitWeekdays(habit);
    return weekdays.includes(format(normalizedDate, "EEE").toLowerCase());
  }

  if (frequency === "monthly") {
    return Number(habit?.day_of_month || habit?.target_days?.[0]) === normalizedDate.getDate();
  }

  return false;
};

const fetchMissionHabitsData = async () => {
  if (missionHabitsDataCache) return missionHabitsDataCache;
  if (missionHabitsDataRequest) return missionHabitsDataRequest;

  missionHabitsDataRequest = (async () => {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const [cvRes, habitsRes, visionRes] = await Promise.all([
      fetch("https://life-api.lockated.com/core_values", { headers }).catch(() => null),
      fetch("https://life-api.lockated.com/habits", { headers }).catch(() => null),
      fetch("https://life-api.lockated.com/vision.json", { headers }).catch(() => null),
    ]);

    let coreValues: { id: number; name: string }[] = [];
    if (cvRes && cvRes.ok) {
      const cvData = await cvRes.json();
      coreValues = Array.isArray(cvData) ? cvData : cvData.data || [];
    }

    let habits: any[] = [];
    if (habitsRes && habitsRes.ok) {
      const habitsData = await habitsRes.json();
      habits = Array.isArray(habitsData) ? habitsData : habitsData.data || [];
    }

    let visionImages: string[] = [];
    if (visionRes && visionRes.ok) {
      const vData = await visionRes.json();
      const vision = Array.isArray(vData) ? vData[0] : vData?.vision || vData;
      if (vision) {
        if (Array.isArray(vision.images)) {
          visionImages = vision.images
            .map((img: any) => (typeof img === "object" ? img.url : img))
            .filter(Boolean);
        } else if (vision.image) {
          visionImages = typeof vision.image === "object" ? [vision.image.url] : [vision.image];
        }
      }
    }

    missionHabitsDataCache = { coreValues, habits, visionImages };
    return missionHabitsDataCache;
  })().finally(() => {
    missionHabitsDataRequest = null;
  });

  return missionHabitsDataRequest;
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
  const [rawHabits, setRawHabits] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [visionImages, setVisionImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i),
  );
  const weekStartDateStr = format(weekStart, "yyyy-MM-dd");

  const dateRangeStr = `${format(weekStart, "MMM d")} - ${format(
    weekEnd,
    "MMM d, yyyy",
  )}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchMissionHabitsData()
      .then((data) => {
        if (!isMounted || !data) return;
        setCoreValues(data.coreValues);
        setRawHabits(data.habits);
        setVisionImages(data.visionImages);
      })
      .catch((err) => console.error("Error fetching data", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setHabits(
      rawHabits.map((habit: any) => {
        const fetchedHistory = habit.week_history || habit.weekly_completion || [];
        const weekDaysState = weekDays.map((day, i) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const normalizedDay = normalizeDate(day);
          const apiDay = getHabitApiDayForDate(habit, dateKey);

          if (apiDay) {
            const scheduled = Boolean(apiDay.scheduled);
            const completed = Boolean(apiDay.completed);
            const future = Boolean(apiDay.future) || normalizedDay > today;
            return {
              scheduled,
              completed,
              missed: Boolean(apiDay.missed) || (scheduled && !completed && normalizedDay < today),
              future,
              today: Boolean(apiDay.today),
            };
          }

          const scheduled = isHabitScheduledOnDate(habit, normalizedDay);
          const completed = scheduled && Boolean(fetchedHistory[i]);
          const future = normalizedDay > today;
          return {
            scheduled,
            completed,
            missed: scheduled && !completed && normalizedDay < today,
            future,
            today: normalizedDay.getTime() === today.getTime(),
          };
        });

        return {
          ...habit,
          week_days: weekDaysState,
          week_history: weekDaysState.map((day) => day.completed),
        };
      }),
    );
  }, [rawHabits, weekStartDateStr]);


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
                const weekDayStates = Array.isArray(habit.week_days)
                  ? habit.week_days
                  : [];
                const completedCount = weekDayStates.filter(
                  (day: any) => day.completed,
                ).length;
                const scheduledCount = weekDayStates.filter(
                  (day: any) => day.scheduled,
                ).length;

                return (
                  <div key={idx} className="flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-[15px] text-[#2C2C2A] block">
                          {habit.name}
                        </span>

                        <span className="text-[12px] text-[#888780] font-medium">
                          {scheduledCount > 0
                            ? `${completedCount}/${scheduledCount} days completed`
                            : "No scheduled days this week"}
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
                        const dayState = weekDayStates[i] || {
                          scheduled: false,
                          completed: false,
                          missed: false,
                          future: true,
                        };
                        const isNeutral =
                          !dayState.scheduled || dayState.future;

                        return (
                          <div
                            key={day}
                            className={`flex items-center justify-center border-r last:border-r-0 border-white/60 transition-colors ${
                              dayState.completed
                                ? "bg-[#0B5D41]/[0.08]"
                                : dayState.missed
                                  ? "bg-[#A32D2D]/[0.08]"
                                  : "bg-gray-50"
                            }`}
                          >
                            {dayState.completed ? (
                              <Check
                                className="w-4 h-4 text-[#0B5D41]"
                                strokeWidth={3.5}
                              />
                            ) : dayState.missed ? (
                              <XIcon
                                className="w-4 h-4 text-[#A32D2D]"
                                strokeWidth={3}
                              />
                            ) : (
                              <span
                                className={`text-[10px] font-bold ${
                                  isNeutral ? "text-gray-300" : "text-[#888780]"
                                }`}
                              >
                                {format(weekDays[i], "d")}
                              </span>
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
