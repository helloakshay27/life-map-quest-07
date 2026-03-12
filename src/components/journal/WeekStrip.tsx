import React, { useState } from "react";

// ── Helpers ────────────────────────────────────────────────
const DAY_LABELS = ["SU", "M", "TU", "W", "TH", "F", "SA"];

const formatHeaderDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const getWeekStart = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // go to Sunday
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatWeekRange = (weekStart) => {
  const weekEnd = addDays(weekStart, 6);
  const opts = { month: "short", day: "numeric" };
  const startStr = weekStart.toLocaleDateString("en-US", opts);
  return `${startStr.replace(",", "")} - ${weekEnd.getDate()}`;
};

// Simulate filled/missed: past days before "today" that are not selected = missed
const FILLED_DATES = new Set(); // you can populate from API

export default function JournalWeekPicker({ onSelectDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(new Date(today));
  const [weekStart, setWeekStart] = useState(getWeekStart(today));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));

  const handleSelect = (day) => {
    setSelectedDate(day);
    onSelectDate?.(day);
  };

  const getDayStatus = (day) => {
    if (isSameDay(day, selectedDate)) return "selected";
    if (day > today) return "upcoming";
    const key = day.toISOString().split("T")[0];
    if (FILLED_DATES.has(key)) return "filled";
    return "missed";
  };

  // Check if this is the current week
  const todayWeekStart = getWeekStart(today);
  const isCurrentWeek = isSameDay(weekStart, todayWeekStart);

  const weekLabel = isCurrentWeek
    ? "This Week"
    : formatWeekRange(weekStart);

  return (
    <div className="bg-orange-50 rounded-2xl border border-orange-300 p-5 w-full font-sans">

      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          {/* Calendar icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="white" strokeWidth="2"/>
            <path d="M3 9h18" stroke="white" strokeWidth="2"/>
            <path d="M8 2v3M16 2v3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <rect x="7" y="13" width="2" height="2" rx="0.5" fill="white"/>
            <rect x="11" y="13" width="2" height="2" rx="0.5" fill="white"/>
            <rect x="15" y="13" width="2" height="2" rx="0.5" fill="white"/>
          </svg>
        </div>
        <span className="font-bold text-[16px] text-gray-900">
          {formatHeaderDate(selectedDate)}
        </span>
      </div>

      {/* ── Week Nav ── */}
      <div className="flex items-center gap-3">
        {/* Prev */}
        <button
          onClick={prevWeek}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all shadow-sm text-lg"
        >
          ‹
        </button>

        {/* Days */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 tracking-wide">{weekLabel}</span>
          <div className="flex gap-1.5 w-full justify-between">
            {weekDays.map((day, i) => {
              const status = getDayStatus(day);
              const isSelected = status === "selected";
              const isMissed = status === "missed";
              const isFilled = status === "filled";
              const isUpcoming = status === "upcoming";
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(day)}
                  className={`
                    flex flex-col items-center justify-center rounded-xl
                    flex-1 py-2.5 min-h-[64px] gap-0.5 transition-all relative
                    ${isSelected && !isUpcoming ? "bg-green-500 text-white border-2 border-orange-400" : ""}
                    ${isSelected && isUpcoming ? "bg-white text-gray-800 border-2 border-orange-400 shadow-sm" : ""}
                    ${!isSelected && isMissed ? "bg-red-400 text-white" : ""}
                    ${!isSelected && isFilled ? "bg-green-500 text-white" : ""}
                    ${!isSelected && isUpcoming ? "bg-gray-100 text-gray-500 border border-gray-200 hover:border-orange-300" : ""}
                  `}
                  style={{}}
                >
                  <span className="text-[10px] font-bold opacity-80 leading-none">
                    {DAY_LABELS[day.getDay()]}
                  </span>
                  <span className="text-base font-bold leading-tight">
                    {day.getDate()}
                  </span>
                  {/* -10 badge for missed */}
                  {isMissed && !isSelected && (
                    <span className="text-[9px] font-bold bg-red-600 text-white rounded px-1 leading-tight mt-0.5">
                      -10
                    </span>
                  )}
                  {isSelected && !isUpcoming && (
                    <span className="text-[9px] font-bold bg-green-600 text-white rounded px-1 leading-tight mt-0.5">
                      -10
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next */}
        <button
          onClick={nextWeek}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all shadow-sm text-lg"
        >
          ›
        </button>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          <span className="text-xs text-gray-500">Filled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          <span className="text-xs text-gray-500">Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
          <span className="text-xs text-gray-500">Upcoming</span>
        </div>
      </div>
    </div>
  );
}