import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft,
  HelpCircle,
  Calendar,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Info,
  Calendar as CalendarIcon,
  AlertCircle,
  Loader2,
  Target, // <-- Added Target icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfWeek, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

import AddAchievementDialog from "@/components/journal/AddAchievementDialog";

// ── Global Constants & Interfaces ─────────────────────────────────────────────
const LIFE_API = "https://life-api.lockated.com";
const API_BASE_URL = "https://life-api.lockated.com";
const API_BASE = "https://life-api.lockated.com";

const getToken = (t?: string) => t || "";

const LIFE_AREAS = [
  "Career",
  "Health",
  "Relationships",
  "Personal Growth",
  "Finance",
];

const MOODS = [
  "Peaceful",
  "Energized",
  "Grateful",
  "Anxious",
  "Tired",
  "Stressed",
  "Focused",
  "Content",
  "Joyful",
  "Inspired",
  "Calm",
  "Excited",
];

const PROGRESS_OPTIONS = ["Dreaming", "Planning", "In Progress", "Achieved"];
const CATEGORY_OPTIONS = [
  "Personal",
  "Career",
  "Travel",
  "Adventure",
  "Learning",
  "Health",
  "Relationships",
  "Finance",
  "Other",
];

interface PastLetter {
  id: number;
  subject: string;
  written_on: string;
  formatted_date?: string;
  content?: string;
}

interface PastJournal {
  id: number;
  journal_type: string;
  start_date: string;
  formatted_date?: string;
  energy_score: number;
  alignment_score: number;
  affirmation?: string;
  priorities?: string[];
}

interface DetailedJournal extends PastJournal {
  description?: string;
  gratitude_note?: string;
  challenges_note?: string;
  mood_tags?: string[];
  accomplishments?: { title: string }[];
  todos_snapshot?: { title: string; priority: string; status: string }[];
  habits_snapshot?: { habit_id?: number; name: string; completed: boolean }[];
  bucket_updates?: { title: string; update: string }[];
  core_values_snapshot?: string[];
  data?: {
    selected_life_areas?: string[];
    description?: string;
  };
}

interface HabitItem {
  habit_id?: number;
  name: string;
  completed: boolean;
  frequency?: string;
  category?: string;
  week_history?: boolean[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const getProgressStyle = (progress: string) => {
  switch (progress) {
    case "Dreaming":
      return "bg-purple-100 text-purple-700";
    case "Planning":
      return "bg-orange-100 text-orange-600";
    case "In Progress":
      return "bg-green-100 text-green-700";
    case "Achieved":
      return "bg-teal-100 text-teal-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getCategoryStyle = (category: string) => {
  switch (category) {
    case "Personal":
      return "bg-pink-100 text-pink-700";
    case "Career":
      return "bg-indigo-100 text-indigo-700";
    case "Travel":
      return "bg-blue-100 text-blue-700";
    case "Adventure":
      return "bg-orange-100 text-orange-700";
    case "Learning":
      return "bg-teal-100 text-teal-600";
    case "Health":
      return "bg-red-100 text-red-700";
    case "Relationships":
      return "bg-rose-100 text-rose-700";
    case "Finance":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const statusToProgress = (status: string) => {
  switch (status) {
    case "dreaming":
      return "Dreaming";
    case "planning":
      return "Planning";
    case "in_progress":
      return "In Progress";
    case "achieved":
      return "Achieved";
    default:
      return "Dreaming";
  }
};

const progressToStatus = (progress: string) =>
  ({
    Dreaming: "dreaming",
    Planning: "planning",
    "In Progress": "in_progress",
    Achieved: "achieved",
  })[progress] || "dreaming";

// ==============================================================================
// ── CHILD COMPONENTS ──────────────────────────────────────────────────────────
// ==============================================================================

// ── Daily Fortune Modal ───────────────────────────────────────────────────────
const DailyFortuneModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const fortune =
    "The universe whispers: Your patience is transforming into wisdom. Continue to trust the journey you're on.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]">
      <div className="bg-[#FFFCF5] rounded-[24px] shadow-2xl w-full max-w-[420px] p-8 relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-[64px] h-[64px] bg-gradient-to-b from-orange-400 to-[#EA580C] rounded-full flex items-center justify-center shadow-lg mb-5 border-4 border-white">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                fill="white"
              />
              <path
                d="M19 2L19.8 5.2L23 6L19.8 6.8L19 10L18.2 6.8L15 6L18.2 5.2L19 2Z"
                fill="white"
              />
            </svg>
          </div>
          <h2 className="text-[22px] font-extrabold text-[#78350F] mb-1 flex items-center justify-center gap-2">
            <span className="text-2xl">🥠</span> Your Daily Fortune
          </h2>
          <p className="text-[14px] text-[#D97706] font-medium mb-6">
            A special message just for you
          </p>
          <div className="bg-white border-[1.5px] border-[#FCD34D] rounded-xl p-6 mb-7 shadow-sm w-full relative">
            <p className="text-[#334155] italic font-medium leading-relaxed text-[15px]">
              "{fortune}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-8 py-3.5 bg-[#EA580C] hover:bg-[#C2410C] text-white text-[15px] font-bold rounded-full shadow-md transition-all active:scale-95 w-3/4"
          >
            Continue Your Journey
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Dailystrip ────────────────────────────────────────────────────────────────
// ── Dailystrip ────────────────────────────────────────────────────────────────
const DAY_LABELS_STRIP = ["SU", "M", "TU", "W", "TH", "F", "SA"];

const formatHeaderDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatHoverDate = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekStartStrip = (date: Date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDaysStrip = (date: Date, n: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const isSameDayStrip = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatWeekRange = (weekStart: Date) => {
  const weekEnd = addDaysStrip(weekStart, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = weekStart.toLocaleDateString("en-US", opts);
  return `${startStr.replace(",", "")} - ${weekEnd.getDate()}`;
};

function Dailystrip({
  onSelectDate,
  filledDates = [],
  selectedDateExternal,
}: {
  onSelectDate: any;
  filledDates: Date[];
  selectedDateExternal: Date;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [weekStart, setWeekStart] = useState(
    getWeekStartStrip(selectedDateExternal),
  );
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDaysStrip(weekStart, i),
  );

  const prevWeek = () => setWeekStart((w) => addDaysStrip(w, -7));
  const nextWeek = () => setWeekStart((w) => addDaysStrip(w, 7));

  const filledSet = new Set(
    filledDates.map((d) => {
      const nd = new Date(d);
      nd.setHours(0, 0, 0, 0);
      return nd.toISOString().split("T")[0];
    }),
  );

  const getDayStatus = (day: Date) => {
    if (day > today) return "upcoming";
    const key = day.toISOString().split("T")[0];
    if (filledSet.has(key)) return "filled";
    return "missed";
  };

  const todayWeekStart = getWeekStartStrip(today);
  const isCurrentWeek = isSameDayStrip(weekStart, todayWeekStart);
  const weekLabel = isCurrentWeek ? "This Week" : formatWeekRange(weekStart);

  return (
    <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4 sm:p-5 w-full font-sans">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect
              x="3"
              y="4"
              width="18"
              height="17"
              rx="2"
              stroke="white"
              strokeWidth="2"
            />
            <path d="M3 9h18" stroke="white" strokeWidth="2" />
            <path
              d="M8 2v3M16 2v3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="7" y="13" width="2" height="2" rx="0.5" fill="white" />
            <rect x="11" y="13" width="2" height="2" rx="0.5" fill="white" />
            <rect x="15" y="13" width="2" height="2" rx="0.5" fill="white" />
          </svg>
        </div>
        <span className="font-bold text-[16px] text-gray-900">
          {formatHeaderDate(selectedDateExternal)}
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 w-full">
        <button
          onClick={prevWeek}
          className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all shadow-sm text-lg outline-none"
        >
          ‹
        </button>

        <div className="flex-1 flex flex-col items-center gap-3 w-full">
          <span className="text-[13px] font-bold text-slate-600 tracking-wide">
            {weekLabel}
          </span>

          {/* Use Grid with 7 columns to prevent scrolling and breaking */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2.5 w-full max-w-[480px] mx-auto">
            {weekDays.map((day, i) => {
              const status = getDayStatus(day);
              const isSelected = isSameDayStrip(day, selectedDateExternal);
              const isMissed = status === "missed";
              const isFilled = status === "filled";
              const isUpcoming = status === "upcoming";

              return (
                <button
                  key={i}
                  title={formatHoverDate(day)}
                  onClick={() => onSelectDate(day)}
                  className={`
                    flex flex-col items-center justify-center rounded-xl sm:rounded-2xl
                    w-full py-2 min-h-[75px] sm:min-h-[90px] transition-all duration-200 ease-in-out relative outline-none
                    ${isSelected ? "ring-[1.5px] sm:ring-2 ring-orange-400 ring-offset-[2px] sm:ring-offset-[3px] ring-offset-orange-50 z-10 scale-105 sm:scale-110 shadow-md" : "border border-transparent scale-100"}
                    ${isFilled ? "bg-[#22C55E] text-white" : ""}
                    ${isMissed ? "bg-[#EF4444] text-white" : ""}
                    ${isUpcoming ? "bg-[#E2E8F0] text-slate-800 hover:bg-gray-300" : ""}
                    ${isSelected && isUpcoming ? "bg-white text-slate-800 ring-offset-orange-50" : ""}
                  `}
                >
                  <span className="text-[10px] sm:text-[12px] font-bold tracking-wide opacity-90 leading-none mt-1">
                    {DAY_LABELS_STRIP[day.getDay()]}
                  </span>
                  <span className="text-[18px] sm:text-[22px] font-extrabold leading-none mt-1 sm:mt-1.5 mb-1 sm:mb-1.5 tracking-tight">
                    {day.getDate()}
                  </span>

                  <div className="h-4 flex items-center justify-center">
                    {isMissed && (
                      <span className="text-[9px] sm:text-[10px] font-bold bg-white/30 text-white rounded-full px-1.5 sm:px-2 py-[2px] leading-none tracking-wide">
                        -10
                      </span>
                    )}
                    {isFilled && (
                      <span className="text-[9px] sm:text-[10px] font-bold bg-white/30 text-white rounded-full px-1.5 sm:px-2 py-[2px] leading-none tracking-wide">
                        +10
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={nextWeek}
          className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all shadow-sm text-lg outline-none"
        >
          ›
        </button>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] inline-block shadow-sm" />
          <span className="text-[12px] sm:text-[13px] font-medium text-gray-600">
            Filled
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block shadow-sm" />
          <span className="text-[12px] sm:text-[13px] font-medium text-gray-600">
            Missed
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0] border border-gray-300 inline-block shadow-sm" />
          <span className="text-[12px] sm:text-[13px] font-medium text-gray-600">
            Upcoming
          </span>
        </div>
      </div>
    </div>
  );
}
// ── GuidingPrinciples ─────────────────────────────────────────────────────────
interface GuidingPrinciplesProps {
  coreValues: { id: number; name: string }[];
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAreas: string[];
  setSelectedAreas: React.Dispatch<React.SetStateAction<string[]>>;
}

const GuidingPrinciples = ({
  coreValues,
  selectedValues,
  setSelectedValues,
  selectedAreas,
  setSelectedAreas,
}: GuidingPrinciplesProps) => {
  const navigate = useNavigate();
  const valuesScrollRef = useRef<HTMLDivElement>(null);
  const areasScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, dir: number) => {
    if (ref.current)
      ref.current.scrollBy({ left: dir * 150, behavior: "smooth" });
  };

  const toggle = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string,
  ) => {
    setList((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item],
    );
  };

  return (
    <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5 w-full font-sans">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21C12 21 3 14.5 3 8.5a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12.5-9 12.5z"
              fill="white"
            />
          </svg>
        </div>
        <span className="font-bold text-[16px] text-gray-900">
          Guiding Principles
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-800">
            Core Values Lived Today
          </span>
          <button
            onClick={() => navigate("/vision-values")}
            className="text-purple-600 hover:text-purple-800 text-xs font-semibold transition-colors"
          >
            Manage Values
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll(valuesScrollRef, -1)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-purple-500 transition-colors"
          >
            ‹
          </button>
          <div
            ref={valuesScrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-none flex-1 min-h-[32px] items-center"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {coreValues.length === 0 ? (
              <span className="text-xs text-gray-500 italic px-2">
                No core values found.
              </span>
            ) : (
              coreValues.map((valObj) => {
                const active = selectedValues.includes(valObj.name);
                return (
                  <button
                    key={valObj.id}
                    onClick={() =>
                      toggle(selectedValues, setSelectedValues, valObj.name)
                    }
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-purple-500 text-white border-purple-500" : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"}`}
                  >
                    {valObj.name}
                  </button>
                );
              })
            )}
          </div>
          <button
            onClick={() => scroll(valuesScrollRef, 1)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-purple-500 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <div>
        <span className="text-sm font-semibold text-gray-800 block mb-2">
          Life Areas Focused On
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll(areasScrollRef, -1)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-purple-500 transition-colors"
          >
            ‹
          </button>
          <div
            ref={areasScrollRef}
            className="flex gap-2 overflow-x-auto flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {LIFE_AREAS.map((area) => {
              const active = selectedAreas.includes(area);
              return (
                <button
                  key={area}
                  onClick={() => toggle(selectedAreas, setSelectedAreas, area)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${active ? "bg-purple-500 text-white border-purple-500" : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"}`}
                >
                  {area}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => scroll(areasScrollRef, 1)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-purple-500 transition-colors"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

// ── TodaysReflection ──────────────────────────────────────────────────────────
interface TodaysReflectionProps {
  accomplishments: any[];
  setAccomplishments: any;
  gratitude: string;
  setGratitude: any;
  challenges: string;
  setChallenges: any;
  selectedMoods: string[];
  setSelectedMoods: any;
  energy: number;
  setEnergy: any;
  alignment: number;
  setAlignment: any;
  habits: HabitItem[];
  setHabits: React.Dispatch<React.SetStateAction<HabitItem[]>>;
  selectedDate: Date;
}

const TodaysReflection = ({
  accomplishments,
  setAccomplishments,
  gratitude,
  setGratitude,
  challenges,
  setChallenges,
  selectedMoods,
  setSelectedMoods,
  energy,
  setEnergy,
  alignment,
  setAlignment,
  habits,
  setHabits,
  selectedDate,
}: TodaysReflectionProps) => {
  const navigate = useNavigate();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
  const selectedDayIdx = selectedDate.getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addAccomplishment = () =>
    setAccomplishments((prev: any) => [
      ...prev,
      { id: Date.now(), title: "", checked: false },
    ]);
  const removeAccomplishment = (id: number) =>
    setAccomplishments((prev: any) => prev.filter((a: any) => a.id !== id));
  const updateAccomplishment = (id: number, field: string, value: any) =>
    setAccomplishments((prev: any) =>
      prev.map((a: any) => (a.id === id ? { ...a, [field]: value } : a)),
    );
  const toggleMood = (mood: string) =>
    setSelectedMoods((prev: any) =>
      prev.includes(mood)
        ? prev.filter((m: any) => m !== mood)
        : [...prev, mood],
    );
  const toggleHabit = (idx: number) => {
    const updated = [...habits];
    updated[idx] = { ...updated[idx], completed: !updated[idx].completed };
    setHabits(updated);
  };

  return (
    <div className="bg-teal-50/40 rounded-2xl border border-teal-300 p-5 w-full font-sans">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl bg-teal-400 flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21h6M12 3a6 6 0 0 1 4 10.47V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3.53A6 6 0 0 1 12 3z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-bold text-[16px] text-gray-900">
          Today's Reflection
        </span>
      </div>

      {/* Accomplishments */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm text-gray-800">
            Today's Accomplishments
          </span>
          <button
            onClick={addAccomplishment}
            className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>
        {accomplishments.length === 0 ? (
          <div className="border-2 border-dashed border-teal-300 rounded-xl py-6 flex flex-col items-center gap-3 bg-white/50">
            <p className="text-sm text-gray-500">No achievements added yet</p>
            <button
              onClick={addAccomplishment}
              className="flex items-center gap-1.5 border border-gray-300 hover:border-teal-400 text-gray-700 text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Your First Win
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {accomplishments.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) =>
                    updateAccomplishment(item.id, "checked", e.target.checked)
                  }
                  className="w-4 h-4 accent-teal-500 cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={item.title}
                  placeholder="Achievement #1"
                  onChange={(e) =>
                    updateAccomplishment(item.id, "title", e.target.value)
                  }
                  className={`flex-1 text-sm bg-transparent outline-none ${item.checked ? "line-through text-gray-400" : "text-gray-700"} placeholder:text-gray-400`}
                />
                <button
                  onClick={() => removeAccomplishment(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habits */}
      <div className="bg-white rounded-xl border border-teal-200 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-semibold text-sm text-gray-900">
            Today's Habits
          </span>
          <button
            onClick={() => navigate("/goals-habits")}
            className="text-teal-500 hover:text-teal-700 text-xs font-semibold transition-colors"
          >
            Manage Habits
          </button>
        </div>
        {habits.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 px-4 border-t border-gray-100">
            <p className="text-sm text-orange-500 font-medium">
              No habits scheduled for today
            </p>
            <button
              onClick={() => navigate("/goals-habits")}
              className="border border-gray-300 hover:border-teal-400 text-gray-700 text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-3 pb-3">
            {habits.map((habit, idx) => {
              const habitHistory: boolean[] = habit.week_history || [];
              return (
                <div
                  key={habit.habit_id || idx}
                  className="rounded-xl overflow-hidden border border-gray-200 mt-1"
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3 bg-white cursor-pointer hover:bg-teal-50/40 transition-colors"
                    onClick={() => toggleHabit(idx)}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${habit.completed ? "border-teal-400 bg-teal-400" : "border-teal-300 bg-white"}`}
                    >
                      {habit.completed && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="white"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 leading-tight">
                        {habit.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[12px]">🗓️</span>
                        <span className="text-xs text-gray-500 font-medium">
                          {habit.frequency || "Daily"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full border border-gray-300 text-gray-600 flex-shrink-0">
                      {habit.category || "Other"}
                    </span>
                  </div>
                  <div className="px-4 pb-3 pt-1 bg-white border-t border-gray-100">
                    <div className="grid grid-cols-7 gap-1.5">
                      {DAY_LABELS.map((label, i) => (
                        <div
                          key={i}
                          className="text-center text-[10px] font-semibold text-gray-400 mb-1"
                        >
                          {label}
                        </div>
                      ))}
                      {weekDates.map((date, i) => {
                        const dateNorm = new Date(date);
                        dateNorm.setHours(0, 0, 0, 0);
                        const isSelectedDay = i === selectedDayIdx;
                        const isPast = dateNorm < today;
                        const completed = isSelectedDay
                          ? habit.completed
                          : isPast
                            ? (habitHistory[i] ?? false)
                            : false;

                        if (isSelectedDay) {
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-center"
                            >
                              <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-blue-500 border-2 border-blue-400 bg-white">
                                {date.getDate()}
                              </div>
                            </div>
                          );
                        }
                        if (isPast && completed) {
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-center"
                            >
                              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-teal-500">
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                >
                                  <path
                                    d="M2 6l3 3 5-5"
                                    stroke="white"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          );
                        }
                        if (isPast && !completed) {
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-center"
                            >
                              <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-red-500 bg-red-100">
                                {date.getDate()}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-center"
                          >
                            <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-medium text-gray-400 bg-gray-50">
                              {date.getDate()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gratitude & Challenges */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-800 mb-1.5">
            What are you grateful for today?
          </p>
          <textarea
            rows={3}
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="Express your thanks..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 resize-none outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 transition-all"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 mb-1.5">
            Challenges, Changes & Key Insights?
          </p>
          <textarea
            rows={3}
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            placeholder="Challenges you face today, changes you want to make tomorrow & key learnings."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 resize-none outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100 transition-all"
          />
        </div>
      </div>

      {/* Mood */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">Mood</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {MOODS.map((mood) => {
            const active = selectedMoods.includes(mood);
            return (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${active ? "bg-teal-500 text-white border-teal-500" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"}`}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy & Alignment sliders */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">Energy</span>
            <span className="text-teal-500 font-bold text-sm">{energy}/10</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #111 0%, #111 ${energy * 10}%, #e5e7eb ${energy * 10}%, #e5e7eb 100%)`,
            }}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">
              Alignment
            </span>
            <span className="text-teal-500 font-bold text-sm">
              {alignment}/10
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={alignment}
            onChange={(e) => setAlignment(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${alignment * 10}%, #e5e7eb ${alignment * 10}%, #e5e7eb 100%)`,
            }}
          />
        </div>
      </div>
      <style>{`input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: white; border: 2px solid #9ca3af; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }`}</style>
    </div>
  );
};

// ── ShapingTomorrow ───────────────────────────────────────────────────────────
const ShapingTomorrow = ({
  priorities,
  setPriorities,
  token,
}: {
  priorities: string[];
  setPriorities: any;
  token?: string;
}) => {
  const [calendars, setCalendars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user_calendars`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken(token)}`,
          },
        });
        const data = await res.json();
        setCalendars(
          Array.isArray(data)
            ? data.map((item) => ({
                id: String(item.id),
                name: item.name,
                embedUrl: item.embed_url,
              }))
            : [],
        );
      } catch {
        setCalendars([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalendars();
  }, [token]);

  const addPriority = () => setPriorities([...priorities, ""]);
  const updatePriority = (index: number, value: string) => {
    const updated = [...priorities];
    updated[index] = value;
    setPriorities(updated);
  };

  return (
    <div className="w-full bg-[#F4F9FF] border border-[#E2E8F0] rounded-xl p-6 font-sans shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#4285F4] w-10 h-10 rounded-xl shadow-sm flex items-center justify-center">
          <div className="relative flex items-center justify-center w-5 h-5">
            <div className="absolute w-full h-full rounded-full border-[1.5px] border-white/90"></div>
            <div className="absolute w-[60%] h-[60%] rounded-full border-[1.5px] border-white/90"></div>
            <div className="absolute w-[20%] h-[20%] rounded-full bg-white/90"></div>
          </div>
        </div>
        <h2 className="text-[18px] font-bold text-[#1E293B]">
          Shaping Tomorrow
        </h2>
      </div>

      <div className="mb-4">
        {isLoading ? (
          <div className="bg-white border border-[#E2E8F0] rounded-lg flex items-center justify-center min-h-[140px] shadow-sm">
            <p className="text-sm font-medium text-gray-400 animate-pulse">
              Loading calendars...
            </p>
          </div>
        ) : calendars.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center min-h-[140px] p-8 text-center shadow-sm">
            <CalendarIcon
              className="w-8 h-8 text-[#CBD5E1] mb-3"
              strokeWidth={1.5}
            />
            <p className="text-[15px] font-semibold text-[#64748B] mb-1">
              No calendars configured
            </p>
            <p className="text-[13px] text-[#94A3B8]">
              Add calendars in the Calendar page
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {calendars.map((calendar) => (
              <div
                key={calendar.id}
                className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm"
              >
                <div className="flex items-center gap-2 px-4 py-3 bg-[#F0F6FF] border-b border-[#E2E8F0]">
                  <CalendarIcon className="w-4 h-4 text-[#4285F4]" />
                  <span className="text-sm font-semibold text-[#334155]">
                    {calendar.name}
                  </span>
                </div>
                <iframe
                  src={calendar.embedUrl}
                  title={calendar.name}
                  className="w-full border-0"
                  style={{ height: "500px" }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#FFFCE8] border border-[#FDE047] rounded-md px-4 py-3 mb-6 flex items-center gap-2 shadow-sm">
        <span className="text-[15px] leading-none">💡</span>
        <p className="text-[13.5px] text-[#475569]">
          <span className="font-bold text-[#1E293B]">Review Your 'Why':</span>{" "}
          Does your schedule reflect your long-term goals?
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold text-[#334155]">
            Priorities for Tomorrow?
          </h3>
          <button
            onClick={addPriority}
            className="flex items-center gap-1.5 bg-[#4285F4] hover:bg-[#3b77db] text-white text-[13px] font-semibold px-4 py-2 rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Add Priority
          </button>
        </div>
        <div className="space-y-3">
          {priorities.map((priority, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Priority #${index + 1}`}
              value={priority}
              onChange={(e) => updatePriority(index, e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-md px-4 py-3 text-[14px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 focus:border-[#4285F4] transition-all shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ── DailyAffirmation ──────────────────────────────────────────────────────────
const DailyAffirmation = ({
  affirmation,
  setAffirmation,
  token,
}: {
  affirmation: string;
  setAffirmation: any;
  token?: string;
}) => {
  const [affirmationsList, setAffirmationsList] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAffirmations = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/affirmations`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken(token)}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setAffirmationsList(Array.isArray(data) ? data : (data.data ?? []));
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchAffirmations();
  }, [token]);

  const total = affirmationsList.length;
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const getText = (item: any) => {
    if (!item) return "";
    if (typeof item === "string") return `"${item}"`;
    return `"${item.statement ?? item.text ?? item.affirmation ?? item.content ?? ""}"`;
  };

  return (
    <div className="bg-purple-50 rounded-2xl p-6 w-full font-sans">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
              fill="white"
              stroke="white"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
            <path
              d="M19 2L19.8 5.2L23 6L19.8 6.8L19 10L18.2 6.8L15 6L18.2 5.2L19 2Z"
              fill="white"
              strokeLinejoin="round"
            />
            <path
              d="M5 16L5.5 18L7.5 18.5L5.5 19L5 21L4.5 19L2.5 18.5L4.5 18L5 16Z"
              fill="white"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-bold text-base text-gray-900">
          Your Daily Affirmation
        </span>
      </div>

      <div className="bg-yellow-50 rounded-xl px-4 py-3 flex items-center justify-between mb-3 min-h-[66px]">
        <button
          onClick={prev}
          disabled={loading || total === 0}
          className="text-purple-500 text-2xl font-light px-2 hover:text-purple-700 disabled:opacity-30 transition-colors"
        >
          ‹
        </button>
        <div className="flex-1 text-center">
          {loading ? (
            <div className="text-purple-400 text-sm">Loading...</div>
          ) : total === 0 ? (
            <div className="text-purple-400 text-sm">
              No affirmations found.
            </div>
          ) : (
            <>
              <div className="text-purple-500 font-semibold text-xs mb-1">
                Affirmation ({current + 1} of {total})
              </div>
              <div className="text-purple-700 italic text-sm font-medium">
                {getText(affirmationsList[current])}
              </div>
            </>
          )}
        </div>
        <button
          onClick={next}
          disabled={loading || total === 0}
          className="text-purple-500 text-2xl font-light px-2 hover:text-purple-700 disabled:opacity-30 transition-colors"
        >
          ›
        </button>
      </div>

      <textarea
        value={affirmation}
        onChange={(e) => setAffirmation(e.target.value)}
        placeholder="A positive statement about yourself..."
        className="w-full min-h-[90px] rounded-xl border border-gray-300 px-3 py-3 text-sm text-gray-700 resize-y outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-white mb-3 font-sans"
      />

      <div className="bg-violet-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
        <span className="text-sm">💡</span>
        <span className="text-violet-700 text-xs italic">
          Present tense ("I am"), positive, specific, repeat daily with emotion.
        </span>
      </div>
    </div>
  );
};

// ── BucketListProgress ────────────────────────────────────────────────────────
const PillSelect = ({ value, options, onChange, colorFn }: any) => (
  <div className="relative inline-flex items-center">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none pl-2.5 pr-6 py-1 rounded-full text-[11px] font-semibold cursor-pointer outline-none ${colorFn(value)}`}
    >
      {options.map((o: string) => (
        <option key={o} value={o} className="bg-white text-gray-900">
          {o}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-1.5 w-3 h-3 opacity-60" />
  </div>
);

const AddDreamModal = ({
  onClose,
  onAdd,
  token,
}: {
  onClose: () => void;
  onAdd: (i: any) => void;
  token?: string;
}) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Personal",
    status: "dreaming",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      sonnerToast.error("Title is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/dreams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken(token)}`,
        },
        body: JSON.stringify({ ...form, core_value_ids: [], goal_ids: [] }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onAdd({
        id: (data.id || data.dream?.id || Date.now()).toString(),
        title: data.title || data.dream?.title || form.title,
        category: data.category || data.dream?.category || form.category,
        progress: statusToProgress(
          data.status || data.dream?.status || form.status,
        ),
      });
      sonnerToast.success("Dream added!");
      onClose();
    } catch {
      sonnerToast.error("Failed to add dream");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base text-gray-900">Add New Dream</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Visit Northern Lights"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Travel to Iceland"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none resize-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Category
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="appearance-none w-full rounded-lg border border-gray-200 px-3 py-2 pr-7 text-sm text-gray-800 outline-none focus:border-amber-400 cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Status
              </label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="appearance-none w-full rounded-lg border border-gray-200 px-3 py-2 pr-7 text-sm text-gray-800 outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="dreaming">Dreaming</option>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="achieved">Achieved</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-50 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {isSubmitting ? "Adding..." : "Add Dream"}
          </button>
        </div>
      </div>
    </div>
  );
};

const BucketListProgress = ({ token }: { token?: string }) => {
  const [bucketList, setBucketList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTexts, setUpdateTexts] = useState<any>({});
  const [progressFilter, setProgressFilter] = useState("All Progress");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchDreams = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/dreams`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken(token)}`,
          },
        });
        const data = await res.json();
        let mapped: any[] = [];
        if (Array.isArray(data)) {
          mapped = data.map((item) => ({
            id: item.id.toString(),
            title: item.title || "",
            category: item.category || "Personal",
            progress: statusToProgress(item.status || "dreaming"),
          }));
        } else {
          const mapCat = (arr: any, pLabel: string) => {
            if (Array.isArray(arr))
              arr.forEach((item) =>
                mapped.push({
                  id: item.id.toString(),
                  title: item.title || "",
                  category: item.category || "Personal",
                  progress: pLabel,
                }),
              );
          };
          mapCat(data.dreaming, "Dreaming");
          mapCat(data.planning, "Planning");
          mapCat(data.in_progress, "In Progress");
          mapCat(data.achieved, "Achieved");
        }
        setBucketList(mapped);
      } catch {
        sonnerToast.error("Failed to load bucket list");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDreams();
  }, [token]);

  const handleProgressChange = async (id: string, val: string) => {
    setBucketList((p) =>
      p.map((i) => (i.id === id ? { ...i, progress: val } : i)),
    );
    fetch(`${API_BASE}/dreams/${id}/change_status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken(token)}`,
      },
      body: JSON.stringify({ status: progressToStatus(val) }),
    }).catch(() => sonnerToast.error("Failed update"));
  };

  const handleCategoryChange = async (id: string, val: string) => {
    setBucketList((p) =>
      p.map((i) => (i.id === id ? { ...i, category: val } : i)),
    );
    fetch(`${API_BASE}/dreams/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken(token)}`,
      },
      body: JSON.stringify({
        title: bucketList.find((i) => i.id === id)?.title,
        category: val,
      }),
    }).catch(() => sonnerToast.error("Failed update"));
  };

  const handleAddUpdate = (id: string) => {
    if (!updateTexts[id]?.trim()) return;
    sonnerToast.success("Update added!");
    setUpdateTexts((prev: any) => ({ ...prev, [id]: "" }));
  };

  const filtered = bucketList.filter(
    (item) =>
      (progressFilter === "All Progress" || item.progress === progressFilter) &&
      (categoryFilter === "All Categories" || item.category === categoryFilter),
  );

  return (
    <>
      {showAddModal && (
        <AddDreamModal
          token={token}
          onClose={() => setShowAddModal(false)}
          onAdd={(i: any) => setBucketList((p) => [i, ...p])}
        />
      )}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 font-sans w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 2L19.8 5.2L23 6L19.8 6.8L19 10L18.2 6.8L15 6L18.2 5.2L19 2Z"
                  fill="white"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 16L5.5 18L7.5 18.5L5.5 19L5 21L4.5 19L2.5 18.5L4.5 18L5 16Z"
                  fill="white"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-bold text-[15px] text-gray-900">
              Bucket List Progress
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Dream
            </button>
            <div className="relative">
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-7 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 outline-none"
              >
                <option>All Progress</option>
                {PROGRESS_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-7 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 outline-none"
              >
                <option>All Categories</option>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-0.5">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 pt-3 pb-3 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-base leading-none">
                      ✦
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {item.title}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Add update..."
                    value={updateTexts[item.id] || ""}
                    onChange={(e) =>
                      setUpdateTexts((p: any) => ({
                        ...p,
                        [item.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 resize-none outline-none"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleAddUpdate(item.id)}
                      className="flex items-center gap-1 h-7 px-3 rounded-full bg-orange-100 text-orange-600 text-[11px] font-semibold"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="inline-block"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="3"
                          fill="currentColor"
                          opacity="0.2"
                        />
                        <path
                          d="M12 8v8M8 12h8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>{" "}
                      Add
                    </button>
                    <PillSelect
                      value={item.progress}
                      options={PROGRESS_OPTIONS}
                      onChange={(val: string) =>
                        handleProgressChange(item.id, val)
                      }
                      colorFn={getProgressStyle}
                    />
                    <PillSelect
                      value={item.category}
                      options={CATEGORY_OPTIONS}
                      onChange={(val: string) =>
                        handleCategoryChange(item.id, val)
                      }
                      colorFn={getCategoryStyle}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 mt-2">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-3"
                >
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.275 1.275L3 12l5.8 1.9a2 2 0 0 1 1.275 1.275L12 21l1.9-5.8a2 2 0 0 1 1.275-1.275L21 12l-5.8-1.9a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M19 8v1" />
                  <path d="M18.5 8.5h1" />
                  <path d="M6 18v1" />
                  <path d="M5.5 18.5h1" />
                </svg>
                <p className="text-[15px] font-medium text-[#64748B] mb-4">
                  No bucket list items matching filters
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-white border border-[#E2E8F0] text-[#1E293B] font-semibold text-[14px] px-5 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Create Your First Dream
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ── PastJournalRow ────────────────────────────────────────────────────────────
const PastJournalRow = ({
  journal,
  token,
  onDelete,
  onEdit,
}: {
  journal: PastJournal;
  token?: string;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<DetailedJournal | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!expanded && !detail) {
      setLoading(true);
      try {
        const res = await fetch(`${LIFE_API}/user_journals/${journal.id}`, {
          headers: { Authorization: `Bearer ${getToken(token)}` },
        });
        const data = await res.json();
        setDetail(data?.user_journal ?? data);
      } catch {
        toast({ title: "Error", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    setExpanded((p) => !p);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this journal entry?")) return;
    try {
      await fetch(`${LIFE_API}/user_journals/${journal.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken(token)}` },
      });
      toast({ title: "Deleted" });
      localStorage.removeItem(`daily_journal_${journal.start_date}`);
      onDelete(journal.id);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const dateLabel =
    journal.formatted_date ||
    format(new Date(journal.start_date), "EEEE, MMMM d, yyyy");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-4 h-4 text-teal-500" />
        </div>
        <span className="font-semibold text-gray-900 text-sm flex-1 min-w-0 truncate">
          {dateLabel}
        </span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-100 whitespace-nowrap">
          Energy {journal.energy_score}/10
        </span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-600 border border-teal-100 whitespace-nowrap">
          Align {journal.alignment_score}/10
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(journal.id);
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold border border-blue-100"
        >
          <Pencil className="w-3 h-3" /> Update
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-400 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleToggle}
          className="p-1.5 text-gray-400 hover:text-gray-700"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-3 border-t border-gray-50 pt-3">
          {loading && (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          )}
          {detail && (
            <>
              {detail.core_values_snapshot &&
                detail.core_values_snapshot.length > 0 && (
                  <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
                    <p className="text-xs font-bold text-purple-700 mb-2">
                      Core Values Lived Today
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.core_values_snapshot.map((v, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full bg-purple-500 text-white text-[11px] font-semibold shadow-sm"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {detail.data?.selected_life_areas &&
                detail.data.selected_life_areas.length > 0 && (
                  <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
                    <p className="text-xs font-bold text-indigo-700 mb-2">
                      Life Areas Focused On
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.data.selected_life_areas.map((a, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {detail.affirmation && (
                <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="white"
                      >
                        <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-purple-800">
                      Daily Affirmation
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 italic">
                    "{detail.affirmation}"
                  </p>
                </div>
              )}
              {detail.priorities && detail.priorities.length > 0 && (
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <circle cx="12" cy="12" r="4" fill="white" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-blue-800">
                      Priorities for Tomorrow
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {detail.priorities.map((p, i) => (
                      <li
                        key={i}
                        className="text-sm text-blue-700 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(detail.gratitude_note || detail.challenges_note) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detail.gratitude_note && (
                    <div className="rounded-xl bg-yellow-50 border border-yellow-100 px-4 py-3">
                      <p className="text-xs font-bold text-yellow-700 mb-1">
                        Gratitude
                      </p>
                      <p className="text-sm text-yellow-800">
                        {detail.gratitude_note}
                      </p>
                    </div>
                  )}
                  {detail.challenges_note && (
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
                      <p className="text-xs font-bold text-indigo-700 mb-1">
                        Challenges & Insights
                      </p>
                      <p className="text-sm text-indigo-800">
                        {detail.challenges_note}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {detail.mood_tags && detail.mood_tags.length > 0 && (
                <div className="rounded-xl bg-pink-50 border border-pink-100 px-4 py-3">
                  <p className="text-xs font-bold text-pink-700 mb-2">Mood</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.mood_tags.map((m, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 text-[11px] font-semibold"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {detail.accomplishments && detail.accomplishments.length > 0 && (
                <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                  <p className="text-xs font-bold text-green-700 mb-2">
                    Accomplishments
                  </p>
                  <ul className="space-y-1">
                    {detail.accomplishments.map((a, i) => (
                      <li
                        key={i}
                        className="text-sm text-green-800 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        {a.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detail.habits_snapshot && detail.habits_snapshot.length > 0 && (
                <div className="rounded-xl bg-teal-50 border border-teal-100 px-4 py-3">
                  <p className="text-xs font-bold text-teal-700 mb-2">Habits</p>
                  <div className="flex flex-col gap-1.5">
                    {detail.habits_snapshot.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-teal-800">{h.name}</span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${h.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                        >
                          {h.completed ? "Done" : "Missed"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detail.bucket_updates && detail.bucket_updates.length > 0 && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  <p className="text-xs font-bold text-amber-700 mb-2">
                    Bucket List Updates
                  </p>
                  {detail.bucket_updates.map((u, i) => (
                    <div key={i} className="mb-1.5">
                      <p className="text-sm font-semibold text-amber-800">
                        {u.title}
                      </p>
                      <p className="text-xs text-amber-700">{u.update}</p>
                    </div>
                  ))}
                </div>
              )}
              {detail.description && (
                <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                  <p className="text-xs font-bold text-gray-600 mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700">{detail.description}</p>
                </div>
              )}
              {detail.todos_snapshot && detail.todos_snapshot.length > 0 && (
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    To-Dos Snapshot
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {detail.todos_snapshot.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-slate-800">
                          {t.title}
                        </span>
                        <div className="flex gap-1.5">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {t.priority}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── PastLetterRow ─────────────────────────────────────────────────────────────
const PastLetterRow = ({
  letter,
  token,
  onDelete,
  onEdit,
}: {
  letter: PastLetter;
  token?: string;
  onDelete: (id: number) => void;
  onEdit: (letter: PastLetter & { content?: string }) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState<string | null>(letter.content ?? null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!expanded && content === null) {
      setLoading(true);
      try {
        const res = await fetch(`${LIFE_API}/user_letters/${letter.id}`, {
          headers: { Authorization: `Bearer ${getToken(token)}` },
        });
        if (res.ok) {
          const data = await res.json();
          const fetched = data?.letter ?? data?.user_letter ?? data;
          setContent(fetched?.content ?? "");
        }
      } catch {
        toast({ title: "Error loading letter", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    setExpanded((p) => !p);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this letter?")) return;
    try {
      const res = await fetch(`${LIFE_API}/user_letters/${letter.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken(token)}` },
      });
      if (!res.ok) throw new Error();
      toast({ title: "Letter deleted" });
      onDelete(letter.id);
    } catch {
      toast({ title: "Failed to delete letter", variant: "destructive" });
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit({ ...letter, content: content ?? "" });
  };

  const dateLabel =
    letter.formatted_date ||
    (letter.written_on
      ? format(new Date(letter.written_on), "EEEE, MMMM d, yyyy")
      : "");

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className="flex items-center gap-3 py-4 cursor-pointer hover:bg-gray-50/60 px-2 rounded-lg transition-colors"
        onClick={handleToggle}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {letter.subject || "Dear Future Me"}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{dateLabel}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </div>

      {expanded && (
        <div className="px-2 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 mb-3 text-sm text-gray-700 whitespace-pre-wrap min-h-[60px]">
                {content || (
                  <span className="text-gray-400 italic">No content.</span>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-sm font-semibold text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── PeopleUpcomingDates ───────────────────────────────────────────────────────
const PeopleUpcomingDates = ({ token }: { token?: string }) => {
  const [people, setPeople] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const res = await fetch(`${LIFE_API}/people`, {
          headers: { Authorization: `Bearer ${getToken(token)}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPeople(Array.isArray(data) ? data : (data.data ?? []));
        }
      } catch (err) {
        console.error("Failed to fetch people:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPeople();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 py-8 shadow-sm animate-pulse">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-pink-100 flex items-center justify-center mb-3">
          <Calendar className="h-5 w-5 text-pink-300" strokeWidth={2} />
        </div>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 py-8 shadow-sm">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-pink-100 flex items-center justify-center mb-3">
          <Calendar className="h-5 w-5 text-pink-400" strokeWidth={2} />
        </div>
        <p className="text-[15px] font-semibold text-gray-600">
          No people added yet
        </p>
        <p className="text-sm text-gray-400 mt-0.5">
          Connect with friends to share progress
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-[#F48FB1] bg-[#FFF0F5]/50 px-5 pt-4 pb-8 font-sans w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-[8px] bg-[#F06292] flex items-center justify-center shadow-sm">
            <CalendarIcon
              className="w-[18px] h-[18px] text-white"
              strokeWidth={2}
            />
          </div>
          <span className="font-bold text-[#0F172A] text-[15px]">
            Upcoming Dates
          </span>
        </div>
        <button className="text-[13px] font-medium text-[#1E293B] hover:text-[#0F172A] transition-colors">
          View All
        </button>
      </div>
      <div className="text-center">
        <p className="text-[14px] text-[#64748B]">
          No upcoming dates in the next 30 days
        </p>
      </div>
    </div>
  );
};

// ── ReviewToDos ───────────────────────────────────────────────────────────────
interface Goal {
  id: number | string;
  title: string;
  category?: string;
  area?: string;
  progress: number;
}

const getStatusText = (progress: number) => {
  if (progress === 0) return "Not Started";
  if (progress > 0 && progress <= 25) return "Just Started";
  if (progress > 25 && progress <= 50) return "Making Progress";
  if (progress > 50 && progress <= 75) return "Halfway There";
  if (progress > 75 && progress < 100) return "Almost Done";
  return "Completed";
};

const ReviewToDos = ({ goals }: { goals: Goal[] }) => {
  return (
    <div className="w-full bg-[#f8f9fc] border border-indigo-200 rounded-2xl p-6 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-[#7c83fd] rounded-xl shadow-sm">
          <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-1.5">
          <h2 className="text-[18px] font-bold text-gray-900">Review Goals</h2>
          <Info className="w-4 h-4 text-indigo-500 cursor-help" />
        </div>
      </div>

      <h3 className="text-[13px] font-bold text-indigo-700 uppercase tracking-wider mb-3">
        THIS WEEK'S GOALS
      </h3>

      <div className="space-y-3">
        {goals && goals.length > 0 ? (
          goals.map((goal) => {
            const progress = goal.progress || 0;
            const statusText = getStatusText(progress);

            return (
              <div
                key={goal.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0 mt-0.5"></div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-900 leading-tight">
                      {goal.title}
                    </h4>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {goal.category || goal.area || "Relationships"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="bg-gray-100 text-gray-700 text-[12px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
                    {statusText}
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[13px] font-bold text-indigo-600 w-8 text-right">
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-4 text-gray-500 text-sm bg-white rounded-xl border border-gray-200">
            No active goals found for this week.
          </div>
        )}
      </div>
    </div>
  );
};

// ==============================================================================
// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
// ==============================================================================
const DailyJournal = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState("new");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [journalId, setJournalId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);
  const [showFortuneModal, setShowFortuneModal] = useState(false);

  // Form state
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [energy, setEnergy] = useState<number>(5);
  const [alignment, setAlignment] = useState<number>(5);
  const [gratitude, setGratitude] = useState("");
  const [challenges, setChallenges] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [description, setDescription] = useState("");
  const [priorities, setPriorities] = useState<string[]>([""]);
  const [achievements, setAchievements] = useState<
    { id: number; title: string; checked: boolean }[]
  >([]);
  const [habitsSnapshot, setHabitsSnapshot] = useState<HabitItem[]>([]);

  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [allCoreValues, setAllCoreValues] = useState<
    { id: number; name: string }[]
  >([]);

  // Goals State (Added for ReviewToDos)
  const [goalsList, setGoalsList] = useState<any[]>([]);

  // Letters state
  const [letterSubject, setLetterSubject] = useState("");
  const [letterBody, setLetterBody] = useState("");
  const [isSavingLetter, setIsSavingLetter] = useState(false);
  const [pastLetters, setPastLetters] = useState<PastLetter[]>([]);
  const [isLoadingLetters, setIsLoadingLetters] = useState(false);
  const [editingLetter, setEditingLetter] = useState<
    (PastLetter & { content?: string }) | null
  >(null);

  // Insights & Past
  const [insightsData, setInsightsData] = useState<{
    message?: string;
    hint?: string;
  } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [pastJournals, setPastJournals] = useState<PastJournal[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  const filledDates = useMemo(() => {
    return pastJournals.map((j) => new Date(j.start_date + "T00:00:00"));
  }, [pastJournals]);

  // ── Fetch Goals ──
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/goals`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken(token)}`,
          },
        });
        if (res.ok) {
          const responseData = await res.json();
          const rawGoals = Array.isArray(responseData)
            ? responseData
            : responseData.goals || responseData.data || [];
          setGoalsList(rawGoals);
        }
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      }
    };
    if (token) fetchGoals();
  }, [token]);

  // ── 1. Fetch Core Values ──
  useEffect(() => {
    const fetchCoreValues = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/core_values`, {
          headers: { Authorization: `Bearer ${getToken(token)}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAllCoreValues(Array.isArray(data) ? data : (data.data ?? []));
        }
      } catch {}
    };
    fetchCoreValues();
  }, [token]);

  // ── 2. Fetch past journals list ──
  const fetchPastJournals = async () => {
    try {
      const res = await fetch(`${LIFE_API}/user_journals`, {
        headers: { Authorization: `Bearer ${getToken(token)}` },
      });
      if (res.ok) {
        const data = await res.json();
        const journals = Array.isArray(data)
          ? data
          : (data?.user_journals ?? []);
        setPastJournals(journals);
        return journals;
      }
    } catch {}
    return [];
  };

  useEffect(() => {
    fetchPastJournals();
  }, [token]);

  // ── 3. Sync form when date changes ──
  useEffect(() => {
    let isMounted = true;

    const fetchDateData = async () => {
      setIsLoadingDaily(true);
      try {
        const d = format(selectedDate, "yyyy-MM-dd");

        const jRes = await fetch(
          `${LIFE_API}/user_journals/0?date=${d}&journal_type=daily`,
          {
            headers: { Authorization: `Bearer ${getToken(token)}` },
          },
        );

        let existingJournal = null;
        if (jRes.ok) {
          const jData = await jRes.json();
          const parsedJ = Array.isArray(jData)
            ? jData.length > 0
              ? jData[0]
              : null
            : (jData?.user_journal ?? jData);
          if (parsedJ && parsedJ.id) existingJournal = parsedJ;
        }

        let fetchedHabits: any[] = [];
        try {
          const hRes = await fetch(`${API_BASE_URL}/habits?date=${d}`, {
            headers: { Authorization: `Bearer ${getToken(token)}` },
          });
          if (hRes.ok) {
            const hData = await hRes.json();
            fetchedHabits = Array.isArray(hData) ? hData : (hData.data ?? []);
          }
        } catch {}

        if (!isMounted) return;

        if (existingJournal) {
          setJournalId(existingJournal.id);
          setIsEditMode(false);
          setAffirmation(existingJournal.affirmation || "");
          setGratitude(existingJournal.gratitude_note || "");
          setChallenges(existingJournal.challenges_note || "");
          setDescription(existingJournal.data?.description || "");
          setEnergy(existingJournal.energy_score ?? 5);
          setAlignment(existingJournal.alignment_score ?? 5);
          setPriorities(
            existingJournal.priorities?.length
              ? existingJournal.priorities
              : [""],
          );
          setSelectedMoods(existingJournal.mood_tags || []);
          setAchievements(
            existingJournal.accomplishments?.map((a: any, i: number) => ({
              id: i,
              title: a.title,
              checked: true,
            })) || [],
          );
          setSelectedValues(existingJournal.core_values_snapshot || []);
          setSelectedAreas(existingJournal.data?.selected_life_areas || []);

          const savedHabits = existingJournal.habits_snapshot || [];
          const enrichedHabits = savedHabits.map((sh: any) => {
            const match = fetchedHabits.find(
              (ah) => (ah.id || ah.habit_id) === sh.habit_id,
            );
            return {
              ...sh,
              frequency: match?.frequency || match?.repeat_type || "Daily",
              category: match?.category || match?.habit_category || "Other",
              week_history:
                match?.week_history || match?.weekly_completion || [],
            };
          });
          setHabitsSnapshot(enrichedHabits);
        } else {
          setJournalId(null);
          setIsEditMode(false);
          setGratitude("");
          setChallenges("");
          setDescription("");
          setEnergy(5);
          setAlignment(5);
          setPriorities([""]);
          setSelectedMoods([]);
          setAchievements([]);
          setSelectedAreas([]);
          setSelectedValues([]);
          setAffirmation("");
          setHabitsSnapshot(
            fetchedHabits.map((h: any) => ({
              habit_id: h.id || h.habit_id,
              name: h.name || h.title || "Habit",
              completed: false,
              frequency: h.frequency || h.repeat_type || "Daily",
              category: h.category || h.habit_category || "Other",
              week_history: h.week_history || h.weekly_completion || [],
            })),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoadingDaily(false);
      }
    };

    fetchDateData();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, token]);

  // ── Load a past journal into edit mode ──
  const loadJournalIntoForm = async (id: number) => {
    try {
      const res = await fetch(`${LIFE_API}/user_journals/${id}`, {
        headers: { Authorization: `Bearer ${getToken(token)}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const j = data?.user_journal ?? data;

      if (j.start_date) {
        setSelectedDate(new Date(j.start_date + "T00:00:00"));
        setTimeout(() => setIsEditMode(true), 500);
      }

      setActiveTab("new");
      toast({
        title: "Ready to edit ✏️",
        description: "Make your changes and click Update Entry.",
      });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  // ── Tab change side effects ──
  useEffect(() => {
    if (activeTab === "past") {
      setIsLoadingPast(true);
      fetchPastJournals().finally(() => setIsLoadingPast(false));
    }
    if (activeTab === "letters") {
      setIsLoadingLetters(true);
      fetch(`${LIFE_API}/user_letters`, {
        headers: { Authorization: `Bearer ${getToken(token)}` },
      })
        .then((r) => r.json())
        .then((d) =>
          setPastLetters(Array.isArray(d) ? d : (d?.user_letters ?? [])),
        )
        .catch(() => {})
        .finally(() => setIsLoadingLetters(false));
    }
    if (activeTab === "insights") {
      setIsLoadingInsights(true);
      fetch(`${LIFE_API}/user_journals/daily_journals_insights`, {
        headers: { Authorization: `Bearer ${getToken(token)}` },
      })
        .then((r) => r.json())
        .then(setInsightsData)
        .catch(() => {})
        .finally(() => setIsLoadingInsights(false));
    }
  }, [activeTab, token]);

  // ── Save / Update journal entry ──
  const handleSaveEntry = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDate = new Date(selectedDate);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate > today) {
      return toast({
        title: "Cannot Create Future Entry",
        description:
          "You can only create journal entries for today or past dates.",
        variant: "destructive",
      });
    }

    if (journalId && !isEditMode)
      return toast({
        title: "Entry Already Exists ⚠️",
        description: "Use the Past tab to update it.",
        variant: "destructive",
      });

    setIsSaving(true);
    try {
      const isUpdate = isEditMode && !!journalId;
      const selectedCoreValueIds = selectedValues
        .map((valName) => allCoreValues.find((cv) => cv.name === valName)?.id)
        .filter(Boolean);

      const journalPayload = {
        journal_type: "daily",
        start_date: format(selectedDate, "yyyy-MM-dd"),
        affirmation,
        gratitude_note: gratitude,
        challenges_note: challenges,
        energy_score: energy,
        alignment_score: alignment,
        mood_tags: selectedMoods,
        priorities: priorities.filter((p) => p.trim() !== ""),
        accomplishments: achievements.map((a) => ({ title: a.title })),
        todos_snapshot: [],
        habits_snapshot: habitsSnapshot,
        bucket_updates: [],
        core_value_ids: selectedCoreValueIds,
        core_values_snapshot: selectedValues,
        data: {
          selected_life_areas: selectedAreas,
          description: description || "Overall productive and reflective day.",
        },
      };

      const url = isUpdate
        ? `${LIFE_API}/user_journals/${journalId}`
        : `${LIFE_API}/user_journals`;
      const res = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken(token)}`,
        },
        body: JSON.stringify({ user_journal: journalPayload }),
      });
      if (!res.ok) throw new Error();

      const resData = await res.json();
      const savedJournal = resData?.user_journal ?? resData?.journal ?? resData;
      if (savedJournal?.id) setJournalId(savedJournal.id);

      setIsEditMode(false);
      toast({
        title: isUpdate ? "Journal Updated ✅" : "Journal Entry Saved ✅",
      });

      const dateKey = format(selectedDate, "yyyy-MM-dd");
      localStorage.setItem(
        `daily_journal_${dateKey}`,
        JSON.stringify({
          accomplishments: achievements
            .filter((a) => a.title?.trim())
            .map((a) => ({ title: a.title, checked: a.checked })),
        }),
      );

      if (!isUpdate) {
        setShowFortuneModal(true);
      }

      await fetchPastJournals();
    } catch {
      toast({ title: "Error saving entry", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Save new letter ──
  const handleSaveLetter = async () => {
    if (!letterBody.trim()) return;
    setIsSavingLetter(true);
    try {
      const res = await fetch(`${LIFE_API}/user_letters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken(token)}`,
        },
        body: JSON.stringify({
          letter: {
            subject: letterSubject.trim() || "Dear Future Me",
            content: letterBody,
            written_on: format(selectedDate, "yyyy-MM-dd"),
          },
        }),
      });
      if (!res.ok) throw new Error();
      const resData = await res.json();
      const savedLetter = resData?.letter ?? resData?.user_letter ?? resData;
      if (savedLetter?.id) setPastLetters((prev) => [savedLetter, ...prev]);
      toast({ title: "Letter Saved 💌" });
      setLetterSubject("");
      setLetterBody("");
    } catch {
      toast({ title: "Error saving letter", variant: "destructive" });
    } finally {
      setIsSavingLetter(false);
    }
  };

  // ── Load letter into edit form ──
  const handleEditLetter = (letter: PastLetter & { content?: string }) => {
    setEditingLetter(letter);
    setLetterSubject(letter.subject || "");
    setLetterBody(letter.content || "");
  };

  // ── Update existing letter ──
  const handleUpdateLetter = async () => {
    if (!editingLetter || !letterBody.trim()) return;
    setIsSavingLetter(true);
    try {
      const res = await fetch(`${LIFE_API}/user_letters/${editingLetter.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken(token)}`,
        },
        body: JSON.stringify({
          letter: {
            subject: letterSubject.trim() || "Dear Future Me",
            content: letterBody,
          },
        }),
      });
      if (!res.ok) throw new Error();
      const resData = await res.json();
      const updated = resData?.letter ?? resData?.user_letter ?? resData;
      setPastLetters((prev) =>
        prev.map((l) => (l.id === editingLetter.id ? { ...l, ...updated } : l)),
      );
      toast({ title: "Letter updated ✅" });
      setEditingLetter(null);
      setLetterSubject("");
      setLetterBody("");
    } catch {
      toast({ title: "Failed to update letter", variant: "destructive" });
    } finally {
      setIsSavingLetter(false);
    }
  };

  return (
    <div className="min-h-screen animate-fade-in font-sans py-4 relative">
      <DailyFortuneModal
        isOpen={showFortuneModal}
        onClose={() => setShowFortuneModal(false)}
      />
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Daily Journal
              </h1>
              <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
                5-minute reflection on your day
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 bg-white/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-all mt-2">
            <HelpCircle className="h-4 w-4" /> Help
          </button>
        </div>

        {/* Edit mode banner */}
        {isEditMode && (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-700">
                Editing entry for {format(selectedDate, "MMMM d, yyyy")}
              </span>
            </div>
            <button
              onClick={() => {
                setIsEditMode(false);
                setSelectedDate(new Date(selectedDate));
              }}
              className="text-xs text-blue-500 hover:text-blue-700 font-semibold underline"
            >
              Cancel Edit
            </button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 w-full p-1.5 bg-gray-100/80 border border-gray-200/60 rounded-xl h-auto shadow-inner">
            {["new", "past", "insights", "letters"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide capitalize"
              >
                {tab === "past"
                  ? `Past (${pastJournals.length})`
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── NEW ENTRY TAB ── */}
          <TabsContent value="new" className="focus:outline-none">
            {isLoadingDaily ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                  <p className="text-sm text-gray-500 font-medium">
                    Loading {format(selectedDate, "MMMM d, yyyy")}...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Dailystrip
                  selectedDateExternal={selectedDate}
                  onSelectDate={(date: any) => setSelectedDate(date)}
                  filledDates={filledDates}
                />
                <GuidingPrinciples
                  coreValues={allCoreValues}
                  selectedValues={selectedValues}
                  setSelectedValues={setSelectedValues}
                  selectedAreas={selectedAreas}
                  setSelectedAreas={setSelectedAreas}
                />
                <TodaysReflection
                  accomplishments={achievements}
                  setAccomplishments={setAchievements}
                  gratitude={gratitude}
                  setGratitude={setGratitude}
                  challenges={challenges}
                  setChallenges={setChallenges}
                  selectedMoods={selectedMoods}
                  setSelectedMoods={setSelectedMoods}
                  energy={energy}
                  setEnergy={setEnergy}
                  alignment={alignment}
                  setAlignment={setAlignment}
                  habits={habitsSnapshot}
                  setHabits={setHabitsSnapshot}
                  selectedDate={selectedDate}
                />
                <ShapingTomorrow
                  priorities={priorities}
                  setPriorities={setPriorities}
                  token={token}
                />
                <DailyAffirmation
                  affirmation={affirmation}
                  setAffirmation={setAffirmation}
                  token={token}
                />

                <ReviewToDos goals={goalsList} />

                <BucketListProgress token={token} />
                <PeopleUpcomingDates token={token} />
              </div>
            )}

            {/* Save bar */}
            <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 flex justify-center z-50">
              <div className="w-full flex justify-end gap-3 px-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="bg-white hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEntry}
                  disabled={
                    isSaving || isLoadingDaily || (!!journalId && !isEditMode)
                  }
                  className={`text-white shadow-md ${
                    isEditMode
                      ? "bg-blue-600 hover:bg-blue-700"
                      : journalId
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#B62134] hover:bg-[#9e1a2c]"
                  }`}
                >
                  {isSaving
                    ? "Saving..."
                    : isEditMode
                      ? `Update Entry — ${format(selectedDate, "MMM d, yyyy")}`
                      : journalId
                        ? `Already Saved — ${format(selectedDate, "MMM d, yyyy")}`
                        : `Save Entry — ${format(selectedDate, "MMM d, yyyy")}`}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── PAST TAB ── */}
          <TabsContent value="past" className="focus:outline-none">
            {isLoadingPast ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-medium">
                  Loading past entries...
                </p>
              </div>
            ) : pastJournals.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
                <p className="text-gray-500 font-medium">
                  Past entries will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pastJournals.map((journal) => (
                  <PastJournalRow
                    key={journal.id}
                    journal={journal}
                    token={token}
                    onDelete={(id) =>
                      setPastJournals((p) => p.filter((j) => j.id !== id))
                    }
                    onEdit={loadJournalIntoForm}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── INSIGHTS TAB ── */}
          <TabsContent value="insights" className="focus:outline-none">
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
              {isLoadingInsights ? (
                <p className="text-gray-500 font-medium">Loading insights...</p>
              ) : insightsData?.message ? (
                <>
                  <div className="mb-4 text-5xl">💡</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {insightsData.message}
                  </h3>
                  {insightsData.hint && (
                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      {insightsData.hint}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4 text-5xl">💡</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No reflections yet
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Start journaling to see your challenges, insights, and
                    gratitude patterns appear here over time.
                  </p>
                </>
              )}
            </div>
          </TabsContent>

          {/* ── LETTERS TAB ── */}
          <TabsContent value="letters" className="focus:outline-none">
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {editingLetter
                          ? "Edit Your Letter"
                          : "Write a Letter to Yourself"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Share your thoughts, dreams, and reflections
                      </p>
                    </div>
                  </div>
                  {editingLetter && (
                    <button
                      onClick={() => {
                        setEditingLetter(null);
                        setLetterSubject("");
                        setLetterBody("");
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 font-semibold underline flex-shrink-0"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
                      Subject (Optional)
                    </label>
                    <Input
                      placeholder="e.g., Dear Future Me..."
                      value={letterSubject}
                      onChange={(e) => setLetterSubject(e.target.value)}
                      className="bg-gray-50/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
                      Your Letter
                    </label>
                    <Textarea
                      placeholder={
                        "Dear Self,\n\nWrite your thoughts, feelings, dreams, and reflections here...\n\nWhat do you want to remember? What are you grateful for?"
                      }
                      value={letterBody}
                      onChange={(e) => setLetterBody(e.target.value)}
                      className="min-h-[200px] resize-y bg-gray-50/50"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      className="gap-2 px-6 bg-[#B62134] hover:bg-[#9e1a2c] text-white shadow-md"
                      onClick={
                        editingLetter ? handleUpdateLetter : handleSaveLetter
                      }
                      disabled={!letterBody.trim() || isSavingLetter}
                    >
                      {isSavingLetter
                        ? "Saving..."
                        : editingLetter
                          ? "✏️ Update Letter"
                          : "💾 Save Letter"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Past Letters
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Click to expand and read your past letters
                  </p>
                </div>
                {isLoadingLetters ? (
                  <p className="text-gray-500 text-center py-4">
                    Loading past letters...
                  </p>
                ) : pastLetters.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No past letters found. Write your first one above!
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pastLetters.map((l) => (
                      <PastLetterRow
                        key={l.id}
                        letter={l}
                        token={token}
                        onDelete={(id) =>
                          setPastLetters((p) => p.filter((x) => x.id !== id))
                        }
                        onEdit={handleEditLetter}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddAchievementDialog
        open={showAchievementDialog}
        onOpenChange={setShowAchievementDialog}
        onSubmit={(a: any) => setAchievements([...achievements, a])}
      />
    </div>
  );
};

export default DailyJournal;
