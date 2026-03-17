import React, { useState, useEffect } from "react";
import { ArrowUpRight, Info, Check, X as XIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface MissionHabitsConnectionProps {
  coreValue: string;
  setCoreValue: React.Dispatch<React.SetStateAction<string>>;
  missionText: string;
  setMissionText: React.Dispatch<React.SetStateAction<string>>;
  habitsText: string;
  setHabitsText: React.Dispatch<React.SetStateAction<string>>;
  currentDate?: Date;
}

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
  const [loading, setLoading] = useState(true);

  // Calculate Date Ranges
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const dateRangeStr = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  // 🚨 FIX: Extract primitive string for safe useEffect dependency
  const weekStartDateStr = format(weekStart, "yyyy-MM-dd");

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch Core Values & Habits for the selected week
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("auth_token") || "";
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [cvRes, habitsRes] = await Promise.all([
          fetch("https://life-api.lockated.com/core_values", { headers }).catch(
            () => null,
          ),
          fetch(
            `https://life-api.lockated.com/habits?date=${weekStartDateStr}`,
            { headers },
          ).catch(() => null),
        ]);

        if (cvRes && cvRes.ok) {
          const cvData = await cvRes.json();
          setCoreValues(Array.isArray(cvData) ? cvData : cvData.data || []);
        }
        if (habitsRes && habitsRes.ok) {
          const habitsData = await habitsRes.json();
          setHabits(
            Array.isArray(habitsData) ? habitsData : habitsData.data || [],
          );
        }
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weekStartDateStr]); // 🚨 FIX: Depend strictly on the string, not the Date object!

  return (
    <div className="font-sans bg-white flex flex-col h-full rounded-2xl">
      {/* 1. Header Area */}
      <div className="px-6 py-4 border-b border-purple-100 flex items-center gap-3 bg-white">
        <div className="w-8 h-8 rounded-md bg-[#a855f7] flex items-center justify-center shrink-0 shadow-sm">
          <ArrowUpRight className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-[17px] font-bold text-gray-900">
          Mission & Habits Connection
        </h2>
      </div>

      {/* 2. Core Value & Mission Setup */}
      <div className="p-6 space-y-6 bg-white">
        {/* Core Value Dropdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <label className="text-[14px] font-semibold text-gray-800">
                Core Value Lived Most This Week
              </label>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <button
              onClick={() => navigate("/vision-values")}
              className="text-[13px] font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors shadow-sm"
            >
              Manage Core Values
            </button>
          </div>
          <select
            value={coreValue}
            onChange={(e) => setCoreValue(e.target.value)}
            className="w-full p-2.5 text-[14px] text-gray-700 border border-gray-200 rounded-lg outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 bg-white cursor-pointer shadow-sm appearance-none"
          >
            <option value="" disabled className="text-gray-400">
              Select a core value
            </option>
            {coreValues.map((cv) => (
              <option key={cv.id} value={cv.name}>
                {cv.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mission Connection Textarea */}
        <div>
          <label className="text-[14px] font-semibold text-gray-800 block mb-2">
            Mission Connection
          </label>
          <textarea
            value={missionText}
            onChange={(e) => setMissionText(e.target.value)}
            placeholder="How did your behaviors this week align with or challenge your mission?"
            className="w-full h-[88px] p-3 text-[14px] text-gray-800 border border-gray-200 rounded-lg outline-none resize-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 shadow-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 3. Habits Summary Header Strip */}
      <div className="bg-[#fdf4ff] border-y border-purple-100 px-6 py-3 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-gray-800">
          Habits Summary ({dateRangeStr})
        </h3>
      </div>

      {/* 4. Habits Tracker & Reflection */}
      <div className="p-6 space-y-6 bg-white flex-1">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-semibold text-purple-600">
              Weekly Habits Tracker (Read-Only)
            </span>
            <button
              onClick={() => navigate("/goals-habits")}
              className="text-[13px] font-medium text-purple-600 hover:text-purple-800 hover:underline"
            >
              Manage Habits
            </button>
          </div>

          {/* Tracker Data Rendering */}
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : habits && habits.length > 0 ? (
            <div className="space-y-6">
              {habits.map((habit, idx) => {
                // Calculate completion
                const completedCount = habit.week_history
                  ? habit.week_history.filter(Boolean).length
                  : 0;

                return (
                  <div key={idx} className="flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-bold text-[15px] text-gray-900 block">
                          {habit.name}
                        </span>
                        <span className="text-[12px] text-gray-400 font-medium">
                          {completedCount}/7 days completed
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-0.5 rounded-full bg-gray-50 text-gray-600 text-[12px] font-medium border border-gray-200">
                          {habit.category || "Other"}
                        </span>
                        <span className="text-gray-500 text-[12px] font-medium">
                          {habit.frequency || "Daily"}
                        </span>
                      </div>
                    </div>

                    {/* Day Grid - Separated labels from the continuous bar */}
                    <div>
                      {/* Day Labels */}
                      <div className="grid grid-cols-7 mb-1.5">
                        {daysOfWeek.map((day) => (
                          <div
                            key={day}
                            className="text-center text-[12px] font-medium text-gray-500"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Continuous Visual Bar */}
                      <div className="grid grid-cols-7 h-[30px] rounded-md overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                        {daysOfWeek.map((day, i) => {
                          const isCompleted = habit.week_history
                            ? habit.week_history[i]
                            : false;
                          return (
                            <div
                              key={day}
                              className={`flex items-center justify-center border-r last:border-r-0 border-white/60 ${
                                isCompleted ? "bg-[#4ade80]" : "bg-[#ffe4e6]"
                              }`}
                            >
                              {isCompleted ? (
                                <Check
                                  className="w-4 h-4 text-white"
                                  strokeWidth={3.5}
                                />
                              ) : (
                                <XIcon
                                  className="w-4 h-4 text-[#f43f5e]"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-[14px] text-gray-500 font-medium mb-3">
                No weekly habits defined yet
              </p>
              <button
                onClick={() => navigate("/goals-habits")}
                className="border border-gray-200 bg-white text-gray-700 text-[13px] font-medium px-4 py-1.5 rounded hover:bg-gray-50 shadow-sm transition-colors"
              >
                Create Your First Habit
              </button>
            </div>
          )}
        </div>

        {/* Habits Reflection Textarea */}
        <textarea
          value={habitsText}
          onChange={(e) => setHabitsText(e.target.value)}
          placeholder="How did your habits go this week? Which ones did you maintain consistently?"
          className="w-full h-[88px] p-3 text-[14px] text-gray-800 border border-gray-200 rounded-lg outline-none resize-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 shadow-sm placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
