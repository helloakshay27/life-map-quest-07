import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowLeft, HelpCircle, Calendar, Trash2, Pencil, ChevronDown, ChevronUp,
  Plus, X, Info, Calendar as CalendarIcon, AlertCircle, Loader2, Target,
  Heart, Sparkles, ListTodo, BookOpen, Lightbulb, Zap, Edit2, CheckCircle,
  ListOrdered,
  ArrowRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfWeek, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddAchievementDialog from "@/components/journal/AddAchievementDialog";
import CreateToDoDialog from "@/components/journal/CreateToDoDialog"; // <-- IMPORTED DIALOG

// ─── EXACT BRAND PALETTE ──────────────────────────────────────────────────────
const C = {
  coral:     "#DA7756",
  coral8:    "rgba(213,71,68,0.08)",
  coral15:   "rgba(213,71,68,0.15)",
  charcoal:  "#1A1A2A",
  cream:     "#F0CEAA",
  forest:    "#0B5541",
  forest8:   "rgba(11,85,65,0.08)",
  forest15:  "rgba(11,85,65,0.15)",
  violet:    "#5034BB",
  violet8:   "rgba(80,52,187,0.08)",
  sand:      "#C5A881",
  sand15:    "rgba(197,168,129,0.15)",
  sand30:    "rgba(197,168,129,0.30)",
  dune:      "#D1BC88",
  mist:      "#D1D6A6",
  stone:     "#888763",
  muted:     "#AAAAAA",
  crimson:   "#B72B2D",
  crimson8:  "rgba(183,43,45,0.08)",
  success:   "#44FBD0",
  success8:  "rgba(68,251,208,0.08)",
  warning:   "#E4A948",
  sky:       "#3A6CC5",
  pageBg:    "#F7F3EE",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const LIFE_API     = "https://life-api.lockated.com";
const API_BASE_URL = "https://life-api.lockated.com";
const API_BASE     = "https://life-api.lockated.com";
const getToken = (t?: string) => t || "";

const LIFE_AREAS       = ["Career", "Health", "Relationships", "Personal Growth", "Finance"];
const MOODS            = ["Peaceful", "Energized", "Grateful", "Anxious", "Tired", "Stressed", "Focused", "Content", "Joyful", "Inspired", "Calm", "Excited"];
const PROGRESS_OPTIONS = ["Dreaming", "Planning", "In Progress", "Achieved"];
const CATEGORY_OPTIONS = ["Personal", "Career", "Travel", "Adventure", "Learning", "Health", "Relationships", "Finance", "Other"];

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface PastLetter {
  id: number; subject: string; written_on: string; formatted_date?: string; content?: string;
}
interface PastJournal {
  id: number; journal_type: string; start_date: string; formatted_date?: string;
  energy_score: number; alignment_score: number; affirmation?: string; priorities?: string[];
}
interface DetailedJournal extends PastJournal {
  description?: string; gratitude_note?: string; challenges_note?: string; mood_tags?: string[];
  accomplishments?: { title: string }[];
  todos_snapshot?: { title: string; priority: string; status: string }[];
  habits_snapshot?: { habit_id?: number; name: string; completed: boolean }[];
  bucket_updates?: { title: string; update: string }[];
  core_values_snapshot?: string[];
  data?: { selected_life_areas?: string[]; description?: string };
}
interface HabitItem {
  habit_id?: number; name: string; completed: boolean;
  frequency?: string; category?: string; week_history?: boolean[];
}

// ─── Mapping Helpers for To-Do API ────────────────────────────────────────────
const toApiStatus = (ui: string) => {
  const map: Record<string, string> = { "Not Started": "not_started", "In Progress": "in_progress", "Completed": "completed", "Someday": "someday" };
  return map[ui] ?? ui.toLowerCase().replace(/ /g, "_");
};

const toApiPriority = (ui: string) => ui.toLowerCase();

const fromApiStatus = (api: string) => {
  const map: Record<string, string> = { "not_started": "Not Started", "in_progress": "In Progress", "completed": "Completed", "someday": "Someday" };
  return map[api] || "Not Started";
}

const fromApiPriority = (api: string) => {
  const map: Record<string, string> = { "low": "Low", "medium": "Medium", "high": "High", "urgent": "Urgent" };
  return map[api] || "Medium";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getProgressStyle = (progress: string) => {
  switch (progress) {
    case "Dreaming":    return { background: C.sand15,        color: C.stone };
    case "Planning":    return { background: C.mist + "40",   color: C.charcoal };
    case "In Progress": return { background: C.forest8,       color: C.forest };
    case "Achieved":    return { background: C.dune,          color: C.charcoal };
    default:            return { background: C.sand15,        color: C.stone };
  }
};
const getProgressClass = (progress: string) => {
  switch (progress) {
    case "In Progress": return "bg-[#0B5541]/10 text-[#0B5541]";
    case "Achieved":    return "bg-[#D1BC88] text-[#1A1A2A]";
    case "Planning":    return "bg-[#D1D6A6]/40 text-[#1A1A2A]";
    default:            return "bg-[#C5A881]/20 text-[#888763]";
  }
};
const statusToProgress  = (s: string) => ({ dreaming: "Dreaming", planning: "Planning", in_progress: "In Progress", achieved: "Achieved" }[s] || "Dreaming");
const progressToStatus  = (p: string) => ({ Dreaming: "dreaming", Planning: "planning", "In Progress": "in_progress", Achieved: "achieved" }[p] || "dreaming");
const habitKey = (habit: any) => String(habit?.habit_id ?? habit?.id ?? "");
const normalizeDateOnly = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const weeklyPlanPrioritiesForDate = (weeklyJournals: any[], selectedDate: Date) => {
  const selected = normalizeDateOnly(selectedDate);

  for (const journal of weeklyJournals) {
    const planDays = journal?.data?.weekly_plan?.days;
    if (!journal?.start_date || !Array.isArray(planDays)) continue;

    const journalWeekStart = startOfWeek(new Date(`${journal.start_date}T00:00:00`), { weekStartsOn: 0 });
    const planWeekStart = addDays(journalWeekStart, 7);
    const dayIndex = Math.round((selected.getTime() - planWeekStart.getTime()) / (1000 * 60 * 60 * 24));

    if (dayIndex < 0 || dayIndex > 6) continue;

    const planDay = planDays[dayIndex];
    const priorities = Array.isArray(planDay?.priorities) ? planDay.priorities : [];
    return priorities
      .map((priority: any, index: number) => ({
        id: Number(priority?.id) || Number(`${format(selected, "yyyyMMdd")}${index + 1}`),
        title: String(priority?.text || priority?.title || "").trim(),
        checked: false,
      }))
      .filter((priority: any) => priority.title);
  }

  return [];
};

const tomorrowPrioritiesToAchievements = (journal: any) => {
  const priorities = Array.isArray(journal?.priorities) ? journal.priorities : [];
  const idPrefix = journal?.start_date
    ? format(new Date(`${journal.start_date}T00:00:00`), "yyyyMMdd")
    : "0";

  return priorities
    .map((priority: any, index: number) => ({
      id: Number(`${idPrefix}${index + 1}`),
      title: String(priority || "").trim(),
      checked: false,
    }))
    .filter((priority: any) => priority.title);
};

const mergeSuggestedAchievements = (
  ...groups: { id: number; title: string; checked: boolean }[][]
) => {
  const seen = new Set<string>();
  return groups.flat().filter((achievement) => {
    const key = achievement.title.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ─── DailyFortuneModal ────────────────────────────────────────────────────────
const DailyFortuneModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  const fortune = "The universe whispers: Your patience is transforming into wisdom. Continue to trust the journey you're on.";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]">
      <div className="rounded-[24px] shadow-2xl w-full max-w-[420px] p-8 relative animate-in fade-in zoom-in-95 duration-300 border"
        style={{ background: C.pageBg, borderColor: C.dune }}>
        <button onClick={onClose} className="absolute right-4 top-4 transition-colors" style={{ color: C.muted }}>
          <X className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center text-center mt-2">
          {/* Solid Coral Background */}
          <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center shadow-lg mb-5 border-4 border-white"
            style={{ background: C.coral }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-[22px] font-extrabold mb-1 flex items-center justify-center gap-2" style={{ color: C.charcoal }}>
            <span className="text-2xl">🥠</span> Your Daily Fortune
          </h2>
          <p className="text-[14px] font-medium mb-6" style={{ color: C.sand }}>A special message just for you</p>
          <div className="bg-white border rounded-xl p-6 mb-7 shadow-sm w-full relative" style={{ borderColor: C.cream }}>
            <p className="italic font-medium leading-relaxed text-[15px]" style={{ color: C.stone }}>"{fortune}"</p>
          </div>
          <button onClick={onClose}
            className="px-8 py-3.5 text-white text-[15px] font-bold rounded-full shadow-md transition-all active:scale-95 w-3/4"
            style={{ background: C.coral }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
            Continue Your Journey
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Dailystrip ───────────────────────────────────────────────────────────────
const DAY_LABELS_STRIP = ["SU", "M", "TU", "W", "TH", "F", "SA"];
const formatHeaderDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const formatHoverDate  = (date: Date) => { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const getWeekStartStrip = (date: Date) => { const d = new Date(date); d.setDate(d.getDate()-d.getDay()); d.setHours(0,0,0,0); return d; };
const addDaysStrip = (date: Date, n: number) => { const d = new Date(date); d.setDate(d.getDate()+n); return d; };
const isSameDayStrip = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const formatWeekRange = (weekStart: Date) => { const weekEnd = addDaysStrip(weekStart, 6); const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }; return `${weekStart.toLocaleDateString("en-US", opts).replace(",","")} - ${weekEnd.getDate()}`; };

function Dailystrip({ onSelectDate, filledDates = [], selectedDateExternal }: { onSelectDate: any; filledDates: Date[]; selectedDateExternal: Date }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [weekStart, setWeekStart] = useState(getWeekStartStrip(selectedDateExternal));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDaysStrip(weekStart, i));
  const prevWeek = () => setWeekStart(w => addDaysStrip(w,-7));
  const nextWeek = () => setWeekStart(w => addDaysStrip(w, 7));
  const filledSet = new Set(filledDates.map(d => { const nd = new Date(d); nd.setHours(0,0,0,0); return nd.toISOString().split("T")[0]; }));
  const getDayStatus = (day: Date) => { if (day > today) return "upcoming"; return filledSet.has(day.toISOString().split("T")[0]) ? "filled" : "missed"; };
  const isCurrentWeek = isSameDayStrip(weekStart, getWeekStartStrip(today));
  const weekLabel = isCurrentWeek ? "This Week" : formatWeekRange(weekStart);

  return (
    <div className="rounded-2xl border p-4 sm:p-5 w-full font-sans" style={{ background: "white", borderColor: C.cream }}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: C.coral }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="white" strokeWidth="2"/>
            <path d="M3 9h18" stroke="white" strokeWidth="2"/>
            <path d="M8 2v3M16 2v3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <rect x="7" y="13" width="2" height="2" rx="0.5" fill="white"/>
            <rect x="11" y="13" width="2" height="2" rx="0.5" fill="white"/>
            <rect x="15" y="13" width="2" height="2" rx="0.5" fill="white"/>
          </svg>
        </div>
        <span className="font-bold text-[16px]" style={{ color: C.charcoal }}>{formatHeaderDate(selectedDateExternal)}</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 w-full">
        <button onClick={prevWeek}
          className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border shadow-sm text-lg outline-none transition-all"
          style={{ borderColor: C.cream, color: C.stone }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.sand; e.currentTarget.style.color = C.sand; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.cream; e.currentTarget.style.color = C.stone; }}>‹</button>

        <div className="flex-1 flex flex-col items-center gap-3 w-full">
          <span className="text-[13px] font-bold tracking-wide" style={{ color: C.stone }}>{weekLabel}</span>
          <div className="grid grid-cols-7 gap-1 sm:gap-2.5 w-full max-w-[480px] mx-auto">
            {weekDays.map((day, i) => {
              const status = getDayStatus(day);
              const isSelected = isSameDayStrip(day, selectedDateExternal);
              const isMissed   = status === "missed";
              const isFilled   = status === "filled";
              const isUpcoming = status === "upcoming";

              let bg = "", color = "", ringColor = "";
              if (isFilled   && !isSelected) { bg = C.forest8;   color = C.forest; }
              if (isFilled   &&  isSelected) { bg = C.forest;    color = "#fff"; }
              if (isMissed   && !isSelected) { bg = C.crimson8;  color = C.crimson; }
              if (isMissed   &&  isSelected) { bg = C.crimson;   color = "#fff"; }
              if (isUpcoming && !isSelected) { bg = C.mist+"30"; color = C.stone; }
              if (isSelected &&  isUpcoming) { bg = "#fff";      color = C.charcoal; }
              if (isSelected) ringColor = C.sand;

              return (
                <button key={i} title={formatHoverDate(day)} onClick={() => onSelectDate(day)}
                  className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl w-full py-2 min-h-[75px] sm:min-h-[90px] transition-all duration-200 relative outline-none"
                  style={{ background: bg, color, ...(isSelected ? { boxShadow: `0 0 0 2px ${ringColor}, 0 0 0 4px ${C.pageBg}`, transform: "scale(1.08)", zIndex: 10 } : { border: "1px solid transparent" }) }}>
                  <span className="text-[10px] sm:text-[12px] font-bold tracking-wide opacity-90 leading-none mt-1"
                    style={isSelected && isUpcoming ? { color: C.sand } : {}}>{DAY_LABELS_STRIP[day.getDay()]}</span>
                  <span className="text-[18px] sm:text-[22px] font-extrabold leading-none mt-1 sm:mt-1.5 mb-1 sm:mb-1.5 tracking-tight">{day.getDate()}</span>
                  <div className="h-4 flex items-center justify-center">
                    {isMissed && <span className="text-[9px] sm:text-[10px] font-bold rounded-full px-1.5 sm:px-2 py-[2px] leading-none tracking-wide"
                      style={{ background: isSelected ? "rgba(255,255,255,0.3)" : C.crimson8, color: isSelected ? "#fff" : C.crimson }}>-10</span>}
                    {isFilled && <span className="text-[9px] sm:text-[10px] font-bold rounded-full px-1.5 sm:px-2 py-[2px] leading-none tracking-wide"
                      style={{ background: isSelected ? "rgba(255,255,255,0.3)" : C.forest8, color: isSelected ? "#fff" : C.forest }}>+10</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={nextWeek}
          className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border shadow-sm text-lg outline-none transition-all"
          style={{ borderColor: C.cream, color: C.stone }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.sand; e.currentTarget.style.color = C.sand; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.cream; e.currentTarget.style.color = C.stone; }}>›</button>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-5">
        {[
          { color: C.forest,  label: "Filled" },
          { color: C.crimson, label: "Missed" },
          { color: C.mist,    label: "Upcoming", border: true },
        ].map(({ color, label, border }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{ background: border ? C.mist+"30" : color, ...(border ? { border: `1px solid ${C.cream}` } : {}) }}/>
            <span className="text-[12px] sm:text-[13px] font-medium" style={{ color: C.stone }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/// ─── GuidingPrinciples ────────────────────────────────────────────────────────
interface GuidingPrinciplesProps {
  coreValues: { id: number; name: string }[];
  selectedValues: string[]; setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAreas: string[];  setSelectedAreas:  React.Dispatch<React.SetStateAction<string[]>>;
  token?: string;
}
const GuidingPrinciples = ({ coreValues, selectedValues, setSelectedValues, selectedAreas, setSelectedAreas, token }: GuidingPrinciplesProps) => {
  const navigate = useNavigate();
  const valuesScrollRef = useRef<HTMLDivElement>(null);
  const areasScrollRef  = useRef<HTMLDivElement>(null);
  const [visionImages, setVisionImages] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch("https://life-api.lockated.com/vision.json", { headers: { Authorization: `Bearer ${getToken(token)}` } })
      .then(r => r.ok ? r.json() : null).then(data => {
        if (!data) return;
        const vision = Array.isArray(data) ? data[0] : data?.vision || data;
        if (!vision) return;
        let imageUrls: string[] = [];
        if (Array.isArray(vision.images)) imageUrls = vision.images.map((img: any) => typeof img === "object" ? img.url : img).filter(Boolean);
        else if (vision.image) imageUrls = typeof vision.image === "object" ? [vision.image.url] : [vision.image];
        setVisionImages(imageUrls);
      }).catch(() => {});
  }, [token]);

  const scroll = (ref: React.RefObject<HTMLDivElement>, dir: number) => ref.current?.scrollBy({ left: dir*150, behavior: "smooth" });
  const toggle = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) =>
    setList(prev => prev.includes(item) ? prev.filter(v => v !== item) : [...prev, item]);

  const pillBtn = (active: boolean) => ({
    padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
    border: `1.5px solid ${active ? C.coral : C.cream}`,
    background: active ? C.coral : "#fff",
    color: active ? "#fff" : C.stone,
    cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
  } as React.CSSProperties);

  return (
    <div className="rounded-2xl border p-5 w-full font-sans" style={{ background: C.pageBg, borderColor: C.cream }}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: C.coral }}>
          <Heart className="w-5 h-5 text-white" strokeWidth={2.5}/>
        </div>
        <span className="font-bold text-[18px] flex items-center gap-2" style={{ color: C.charcoal }}>
          Guiding Principles
          <span className="relative group">
            <Info className="w-4 h-4 cursor-help" style={{ color: C.sand }}/>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 text-white text-xs font-medium rounded-lg px-3 py-2 w-52 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg"
              style={{ background: C.charcoal }}>
              Reflect on which values guided your actions and which life areas you focused on today
              <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-4 border-transparent" style={{ borderTopColor: C.charcoal }}/>
            </span>
          </span>
        </span>
      </div>

      {visionImages.length > 0 && (
        <div className="bg-white rounded-xl p-5 border shadow-sm mb-6" style={{ borderColor: C.cream }}>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5" style={{ color: C.coral }} strokeWidth={2.5}/>
            <h3 className="font-bold text-[16px]" style={{ color: C.charcoal }}>Vision Board</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: C.stone }}>Your dreams and aspirations visualized</p>
          <div className="relative rounded-lg overflow-hidden border" style={{ background: C.pageBg, borderColor: C.cream }}>
            <img src={visionImages[0]} alt="Vision Board" className="w-full h-auto object-cover" onError={e => { e.currentTarget.style.display = "none"; }}/>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: C.stone }}>Core Values Lived Today</span>
          <button onClick={() => navigate("/vision-values")} className="text-xs font-semibold transition-colors" style={{ color: C.coral }}
            onMouseEnter={e => (e.currentTarget.style.color = C.charcoal)} onMouseLeave={e => (e.currentTarget.style.color = C.coral)}>Manage Values</button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => scroll(valuesScrollRef, -1)} className="flex-shrink-0 w-5 h-5 flex items-center justify-center transition-colors" style={{ color: C.muted }}>‹</button>
          <div ref={valuesScrollRef} className="flex gap-2 overflow-x-auto flex-1 min-h-[32px] items-center" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {coreValues.length === 0
              ? <span className="text-xs italic px-2" style={{ color: C.muted }}>No core values found.</span>
              : coreValues.map(valObj => (
                <button key={valObj.id} onClick={() => toggle(selectedValues, setSelectedValues, valObj.name)} style={pillBtn(selectedValues.includes(valObj.name))}>
                  {valObj.name}
                </button>
              ))}
          </div>
          <button onClick={() => scroll(valuesScrollRef, 1)} className="flex-shrink-0 w-5 h-5 flex items-center justify-center transition-colors" style={{ color: C.muted }}>›</button>
        </div>
      </div>

      <div>
        <span className="text-sm font-semibold block mb-2" style={{ color: C.stone }}>Life Areas Focused On</span>
        <div className="flex items-center gap-1">
          <button onClick={() => scroll(areasScrollRef, -1)} className="flex-shrink-0 w-5 h-5 flex items-center justify-center" style={{ color: C.muted }}>‹</button>
          <div ref={areasScrollRef} className="flex gap-2 overflow-x-auto flex-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {LIFE_AREAS.map(area => (
              <button key={area} onClick={() => toggle(selectedAreas, setSelectedAreas, area)} style={pillBtn(selectedAreas.includes(area))}>{area}</button>
            ))}
          </div>
          <button onClick={() => scroll(areasScrollRef, 1)} className="flex-shrink-0 w-5 h-5 flex items-center justify-center" style={{ color: C.muted }}>›</button>
        </div>
      </div>
    </div>
  );
};

// ─── TodaysReflection ─────────────────────────────────────────────────────────
const TodaysReflection = ({
  accomplishments, setAccomplishments, gratitude, setGratitude,
  challenges, setChallenges, selectedMoods, setSelectedMoods,
  energy, setEnergy, alignment, setAlignment, habits, setHabits, selectedDate,
}: any) => {
  const navigate = useNavigate();
  const weekStart    = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDates    = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const DAY_LABELS   = ["S","M","T","W","T","F","S"];
  const selectedDayIdx = selectedDate.getDay();
  const today = new Date(); today.setHours(0,0,0,0);

  const addAccomplishment = () => setAccomplishments((p: any) => [...p, { id: Date.now(), title: "", checked: true }]);
  const removeAccomplishment = (id: number) => setAccomplishments((p: any) => p.filter((a: any) => a.id !== id));
  const updateAccomplishment = (id: number, field: string, value: any) => setAccomplishments((p: any) => p.map((a: any) => a.id === id ? { ...a, [field]: value } : a));
  const toggleMood  = (mood: string) => setSelectedMoods((p: any) => p.includes(mood) ? p.filter((m: any) => m !== mood) : [...p, mood]);
  const toggleHabit = (idx: number) => {
    const u = [...habits];
    const nextCompleted = !u[idx].completed;
    const weekHistory = [...(u[idx].week_history || [])];
    weekHistory[selectedDayIdx] = nextCompleted;
    u[idx] = { ...u[idx], completed: nextCompleted, week_history: weekHistory };
    setHabits(u);
  };
  const setAllHabitsCompleted = (completed: boolean) => {
    setHabits(habits.map((habit: any) => {
      const weekHistory = [...(habit.week_history || [])];
      weekHistory[selectedDayIdx] = completed;
      return { ...habit, completed, week_history: weekHistory };
    }));
  };

  const pillBtn = (active: boolean): React.CSSProperties => ({
    flexShrink: 0, padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 500,
    border: `1.5px solid ${active ? C.coral : C.cream}`,
    background: active ? C.coral : "#fff",
    color: active ? "#fff" : C.stone,
    cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <div className="rounded-2xl border p-5 w-full font-sans" style={{ background: C.pageBg, borderColor: C.cream }}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: C.coral }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 21h6M12 3a6 6 0 0 1 4 10.47V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3.53A6 6 0 0 1 12 3z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-[16px] flex items-center gap-2" style={{ color: C.charcoal }}>
          Today's Reflection
          <span className="relative group">
            <Info className="w-4 h-4 cursor-help" style={{ color: C.sand }}/>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 text-white text-xs font-medium rounded-lg px-3 py-2 w-48 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg"
              style={{ background: C.charcoal }}>
              Capture your wins, habits, gratitude, challenges, and key insights from today
              <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-4 border-transparent" style={{ borderTopColor: C.charcoal }}/>
            </span>
          </span>
        </span>
      </div>

      {/* Accomplishments */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm" style={{ color: C.stone }}>Today's Accomplishments</span>
          <button onClick={addAccomplishment}
            className="flex items-center gap-1 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
            style={{ background: C.coral }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
            <Plus className="w-3.5 h-3.5"/> Add Item
          </button>
        </div>
        {accomplishments.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl py-6 flex flex-col items-center gap-3 bg-white/50" style={{ borderColor: C.cream }}>
            <p className="text-sm" style={{ color: C.muted }}>No achievements added yet</p>
            <button onClick={addAccomplishment}
              className="flex items-center gap-1.5 border text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
              style={{ borderColor: C.cream, color: C.stone }}>
              <Plus className="w-3.5 h-3.5"/> Add Your First Win
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {accomplishments.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 bg-white border rounded-xl px-4 py-2.5 shadow-sm" style={{ borderColor: C.cream }}>
                <input type="checkbox" checked={item.checked} onChange={e => updateAccomplishment(item.id, "checked", e.target.checked)}
                  className="w-4 h-4 cursor-pointer flex-shrink-0" style={{ accentColor: C.coral }}/>
                <input type="text" value={item.title} placeholder="Achievement #1"
                  onChange={e => updateAccomplishment(item.id, "title", e.target.value)}
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-[#AAAAAA]"
                  style={{ color: item.checked ? C.muted : C.charcoal, textDecoration: item.checked ? "line-through" : "none" }}/>
                <button onClick={() => removeAccomplishment(item.id)} className="transition-colors" style={{ color: C.muted }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.crimson)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                  <X className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Habits */}
      <div className="bg-white rounded-2xl border overflow-hidden mb-4 p-4" style={{ borderColor: C.cream }}>
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-bold text-sm" style={{ color: C.charcoal }}>Today's Habits ({format(selectedDate, "EEE dd MMM")})</span>
          <div className="flex flex-wrap items-center gap-3">
            {habits.length > 0 && (
              <>
                <button onClick={() => setAllHabitsCompleted(true)} className="text-xs font-semibold transition-colors" style={{ color: C.forest }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.charcoal)} onMouseLeave={e => (e.currentTarget.style.color = C.forest)}>Check All</button>
                <button onClick={() => setAllHabitsCompleted(false)} className="text-xs font-semibold transition-colors" style={{ color: C.crimson }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.charcoal)} onMouseLeave={e => (e.currentTarget.style.color = C.crimson)}>Uncheck All</button>
              </>
            )}
            <button onClick={() => navigate("/goals-habits")} className="text-xs font-semibold transition-colors" style={{ color: C.coral }}
              onMouseEnter={e => (e.currentTarget.style.color = C.charcoal)} onMouseLeave={e => (e.currentTarget.style.color = C.coral)}>Manage Habits</button>
          </div>
        </div>
        {habits.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 px-4 border-t" style={{ borderColor: C.cream }}>
            <p className="text-sm font-medium" style={{ color: C.sand }}>No habits scheduled for today</p>
            <button onClick={() => navigate("/goals-habits")} className="border text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
              style={{ borderColor: C.cream, color: C.stone }}>Create Your First Habit</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map((habit: any, idx: number) => {
              const habitHistory: boolean[] = habit.week_history || [];
              return (
                <div key={habit.habit_id || idx} className="rounded-lg overflow-hidden border transition-all" style={{ borderColor: habit.completed ? C.forest15 : C.cream }}>
                  <div className="flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors"
                    onClick={() => toggleHabit(idx)}
                    style={{ background: habit.completed ? C.forest : "#fff" }}>
                    <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ borderColor: habit.completed ? "rgba(255,255,255,0.65)" : C.coral, background: habit.completed ? "rgba(255,255,255,0.16)" : "#fff" }}>
                      {habit.completed && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-tight" style={{ color: habit.completed ? "#fff" : C.charcoal }}>{habit.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CalendarIcon className="w-3 h-3" style={{ color: habit.completed ? "rgba(255,255,255,0.75)" : C.sand }} />
                        <span className="text-xs font-medium" style={{ color: habit.completed ? "rgba(255,255,255,0.75)" : C.stone }}>{habit.frequency || "Daily"}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full border flex-shrink-0"
                      style={{ borderColor: habit.completed ? "rgba(255,255,255,0.35)" : C.cream, color: habit.completed ? "#fff" : C.stone, background: habit.completed ? "rgba(255,255,255,0.12)" : "#fff" }}>
                      {habit.category || "Other"}
                    </span>
                  </div>
                  <div className="px-3 pb-2 pt-1.5 border-t" style={{ borderColor: C.cream, background: habit.completed ? C.forest8 : C.pageBg }}>
                    <div className="inline-grid grid-cols-7 gap-1">
                      {DAY_LABELS.map((label, i) => (
                        <div key={i} className="text-center text-[9px] font-semibold leading-none" style={{ color: C.muted }}>{label}</div>
                      ))}
                      {weekDates.map((date, i) => {
                        const dateNorm = new Date(date); dateNorm.setHours(0,0,0,0);
                        const isSelectedDay = i === selectedDayIdx;
                        const isPast        = dateNorm < today;
                        const completed     = isSelectedDay ? habit.completed : isPast ? (habitHistory[i] ?? false) : false;

                        if (isSelectedDay) return (
                          <div key={i} className="flex items-center justify-center">
                            <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border-2"
                              style={{
                                color: completed ? "#fff" : C.coral,
                                borderColor: completed ? C.forest : C.coral,
                                background: completed ? C.forest : "#fff",
                              }}>
                              {completed ? (
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              ) : date.getDate()}
                            </div>
                          </div>
                        );
                        if (isPast && completed) return (
                          <div key={i} className="flex items-center justify-center">
                            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: C.forest }}>
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          </div>
                        );
                        if (isPast && !completed) return (
                          <div key={i} className="flex items-center justify-center">
                            <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold"
                              style={{ color: C.crimson, background: C.crimson8 }}>{date.getDate()}</div>
                          </div>
                        );
                        return (
                          <div key={i} className="flex items-center justify-center">
                            <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-medium"
                              style={{ color: C.muted, background: C.mist+"30" }}>{date.getDate()}</div>
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
        {[
          { label: "What are you grateful for today?", val: gratitude, set: setGratitude, ph: "Express your thanks..." },
          { label: "Challenges, Changes & Key Insights?", val: challenges, set: setChallenges, ph: "Challenges you face today, changes you want to make tomorrow & key learnings." },
        ].map(({ label, val, set, ph }) => (
          <div key={label}>
            <p className="text-sm font-medium mb-1.5" style={{ color: C.stone }}>{label}</p>
            <textarea rows={3} value={val} onChange={e => set(e.target.value)} placeholder={ph}
              className="w-full rounded-lg border bg-white px-3 py-2 text-xs resize-none outline-none transition-all"
              style={{ borderColor: C.cream, color: C.charcoal }}
              onFocus={e => { e.target.style.borderColor = C.coral; e.target.style.boxShadow = `0 0 0 3px ${C.coral15}`; }}
              onBlur={e => { e.target.style.borderColor = C.cream; e.target.style.boxShadow = "none"; }}/>
          </div>
        ))}
      </div>

      {/* Mood */}
      <div className="mb-4">
        <p className="text-sm font-semibold mb-2" style={{ color: C.stone }}>Mood</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MOODS.map(mood => {
            const active = selectedMoods.includes(mood);
            return <button key={mood} onClick={() => toggleMood(mood)} style={pillBtn(active)}>{mood}</button>;
          })}
        </div>
      </div>

      {/* Energy & Alignment */}
      <div className="grid grid-cols-2 gap-6">
        {[
          { label: "Energy",    val: energy,    set: setEnergy,    fillColor: C.coral },
          { label: "Alignment", val: alignment, set: setAlignment, fillColor: C.coral },
        ].map(({ label, val, set, fillColor }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: C.stone }}>{label}</span>
              <span className="font-bold text-sm" style={{ color: fillColor }}>{val}/10</span>
            </div>
            <input type="range" min={0} max={10} value={val} onChange={e => set(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${val*10}%, ${C.cream} ${val*10}%, ${C.cream} 100%)` }}/>
          </div>
        ))}
      </div>
      <style>{`input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: white; border: 2px solid ${C.coral}; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }`}</style>
    </div>
  );
};

// ─── ShapingTomorrow ──────────────────────────────────────────────────────────
const ShapingTomorrow = ({ priorities, setPriorities, token, showToast }: { priorities: string[]; setPriorities: any; token?: string; showToast: (msg: string, type?: "success" | "error") => void }) => {
  const [calendars, setCalendars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ── To-Dos State ──
  const [todos, setTodos] = useState<any[]>([]);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);
  const [isTodoDialogOpen, setIsTodoDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);

  // Fetch Calendars
  useEffect(() => {
    fetch(`${API_BASE_URL}/user_calendars`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken(token)}` } })
      .then(r => r.json()).then(data => setCalendars(Array.isArray(data) ? data.map(item => ({ id: String(item.id), name: item.name, embedUrl: item.embed_url })) : []))
      .catch(() => setCalendars([])).finally(() => setIsLoading(false));
  }, [token]);

  // Fetch Todos
  const fetchTodos = async () => {
    setIsLoadingTodos(true);
    try {
      const res = await fetch(`${API_BASE_URL}/todos`, {
        headers: { Authorization: `Bearer ${getToken(token)}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || data.todos || []);
        setTodos(list.filter((t: any) => t.status !== 'completed'));
      }
    } catch (err) {
      console.error("Failed to fetch todos:", err);
    } finally {
      setIsLoadingTodos(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [token]);

  // Handle Edit Submission
  const handleUpdateTodo = async (updated: any) => {
    try {
      const payloadWrapped = {
        todo: {
          title: updated.title,
          description: updated.description,
          life_area: updated.lifeArea,
          priority: toApiPriority(updated.priority),
          status: toApiStatus(updated.status),
          recurring: updated.recurring,
          target_date: updated.targetDate ? new Date(updated.targetDate).toISOString().split("T")[0] : null,
          goal_id: updated.goalId ? Number(updated.goalId) : null,
        },
      };

      const tokenToUse = token || localStorage.getItem("auth_token") || "";
      let res = await fetch(`https://life-api.lockated.com/todos/${updated.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${tokenToUse}`, "Content-Type": "application/json" },
        body: JSON.stringify(payloadWrapped),
      });

      if (!res.ok) {
        res = await fetch(`https://life-api.lockated.com/todos/${updated.id}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${tokenToUse}`, "Content-Type": "application/json" },
          body: JSON.stringify(payloadWrapped),
        });
      }

      if (res.ok) {
        showToast("To do updated successfully.", "success");
        setIsTodoDialogOpen(false);
        fetchTodos(); // Refresh the to-dos list
      } else {
        throw new Error("Update failed");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to update to do.", "error");
    }
  };

  const addPriority    = () => setPriorities([...priorities, ""]);
  const removePriority = (index: number) => setPriorities(priorities.filter((_, i) => i !== index));
  const updatePriority = (index: number, value: string) => { const u = [...priorities]; u[index] = value; setPriorities(u); };

  return (
    <div className="w-full border rounded-xl p-6 font-sans shadow-sm" style={{ background: C.pageBg, borderColor: C.cream }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl shadow-sm flex items-center justify-center"
          style={{ background: C.coral }}>
          <div className="relative flex items-center justify-center w-5 h-5">
            <div className="absolute w-full h-full rounded-full border-[1.5px] border-white/90"/>
            <div className="absolute w-[60%] h-[60%] rounded-full border-[1.5px] border-white/90"/>
            <div className="absolute w-[20%] h-[20%] rounded-full bg-white/90"/>
          </div>
        </div>
        <h2 className="text-[18px] font-bold flex items-center gap-2" style={{ color: C.charcoal }}>
          Shaping Tomorrow
          <span className="relative group">
            <Info className="w-4 h-4 cursor-help" style={{ color: C.sand }}/>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 text-white text-xs font-medium rounded-lg px-3 py-2 w-44 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg"
              style={{ background: C.charcoal }}>
              Set your top priorities for tomorrow and plan ahead
              <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-4 border-transparent" style={{ borderTopColor: C.charcoal }}/>
            </span>
          </span>
        </h2>
      </div>

      <div className="mb-4">
        {isLoading ? (
          <div className="bg-white border rounded-lg flex items-center justify-center min-h-[140px] shadow-sm" style={{ borderColor: C.cream }}>
            <p className="text-sm font-medium animate-pulse" style={{ color: C.muted }}>Loading calendars...</p>
          </div>
        ) : calendars.length === 0 ? (
          <div className="bg-white border rounded-lg flex flex-col items-center justify-center min-h-[140px] p-8 text-center shadow-sm" style={{ borderColor: C.cream }}>
            <CalendarIcon className="w-8 h-8 mb-3" style={{ color: C.muted }} strokeWidth={1.5}/>
            <p className="text-[15px] font-semibold mb-1" style={{ color: C.stone }}>No calendars configured</p>
            <p className="text-[13px]" style={{ color: C.stone }}>Add calendars in the Calendar page</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {calendars.map(calendar => (
              <div key={calendar.id} className="bg-white border rounded-lg overflow-hidden shadow-sm" style={{ borderColor: C.cream }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: C.pageBg, borderColor: C.cream }}>
                  <CalendarIcon className="w-4 h-4" style={{ color: C.coral }}/>
                  <span className="text-sm font-semibold" style={{ color: C.charcoal }}>{calendar.name}</span>
                </div>
                <iframe src={calendar.embedUrl} title={calendar.name} className="w-full border-0" style={{ height: "500px" }} loading="lazy"/>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tomorrow's Headstart Alert ── */}
      <div className="bg-[#FFFDE7] border border-[#FDE047] rounded-md px-4 py-3 mb-6 flex items-start gap-2 shadow-sm">
        <span className="text-[15px] leading-none mt-0.5">💡</span>
        <p className="text-[13.5px] text-[#854D0E]">
          <span className="font-bold">Tomorrow's Headstart:</span> Write down your top 3 priorities for tomorrow tonight.
        </p>
      </div>

      {/* ── To Do's Card ── */}
      <div className="border border-[#D5DDFA] rounded-xl overflow-hidden bg-white mb-6 shadow-sm">
        <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#D5DDFA] flex justify-between items-center">
          <h3 className="font-bold text-[#5034BB] text-[15px] flex items-center gap-1.5">
            <ListOrdered className="w-4 h-4" /> Top To-Do's ({todos.length})
          </h3>
          <Link to="/todos" className="text-[13px] font-bold flex items-center gap-1 hover:underline" style={{ color: "#5034BB" }}>
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {isLoadingTodos ? (
             <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#5034BB]" /></div>
          ) : todos.length > 0 ? (
            todos.slice(0, 3).map((todo, idx) => {
              const p = (todo.priority || "Medium").toLowerCase();
              return (
                <div key={todo.id || idx} className="flex items-center justify-between border border-[#E2E8F0] rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      title="Mark as Completed"
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#5034BB] focus:ring-[#5034BB] cursor-pointer"
                      onChange={() => {
                        const updatedTodo = {
                          ...todo,
                          status: "Completed"
                        };
                        handleUpdateTodo(updatedTodo);
                      }}
                    />
                    <div>
                      <p className="text-[14px] font-medium text-[#2C2C2A]">{todo.title || todo.name || "Untitled Task"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-medium text-gray-500">{todo.life_area || todo.lifeArea || "General"}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold capitalize ${
                          p === 'high' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                          p === 'low' ? 'bg-[#DCFCE7] text-[#166534]' :
                          'bg-[#FEF08A] text-[#854D0E]'
                        }`}>
                          {todo.priority || "Medium"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                     <Edit2 
                       className="w-4 h-4 cursor-pointer hover:text-[#5034BB] transition-colors" 
                       onClick={() => {
                         setEditingTodo({
                           ...todo,
                           id: String(todo.id),
                           title: todo.title || todo.name,
                           description: todo.description || "",
                           lifeArea: todo.life_area || todo.lifeArea || "General",
                           priority: fromApiPriority(todo.priority),
                           status: fromApiStatus(todo.status),
                           recurring: todo.recurring || "None",
                           targetDate: todo.target_date || null,
                           goalId: todo.goal_id || null
                         });
                         setIsTodoDialogOpen(true);
                       }} 
                     />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No active to-do's found.</p>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-md px-4 py-3 mb-6 flex items-center gap-2 shadow-sm" style={{ borderColor: C.cream }}>
        <span className="text-[15px] leading-none">💡</span>
        <p className="text-[13.5px]" style={{ color: C.stone }}>
          <span className="font-bold" style={{ color: C.charcoal }}>Review Your 'Why':</span> Does your schedule reflect your long-term goals?
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold" style={{ color: C.charcoal }}>Priorities for Tomorrow?</h3>
          <button onClick={addPriority}
            className="flex items-center gap-1.5 text-white text-[13px] font-semibold px-4 py-2 rounded-md transition-all shadow-sm"
            style={{ background: C.coral }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
            <Plus className="w-4 h-4" strokeWidth={2.5}/> Add Priority
          </button>
        </div>
        <div className="space-y-3">
          {priorities.map((priority: string, index: number) => (
            <div key={index} className="flex items-center gap-3 bg-white border rounded-md px-4 py-3 shadow-sm transition-all" style={{ borderColor: C.cream }}>
              <input type="text" placeholder={`Priority #${index+1}`} value={priority} onChange={e => updatePriority(index, e.target.value)}
                className="flex-1 bg-transparent text-[14px] outline-none"
                style={{ color: C.charcoal }}
                onFocus={e => {
                  const wrapper = e.currentTarget.parentElement;
                  if (!wrapper) return;
                  wrapper.style.borderColor = C.coral;
                  wrapper.style.boxShadow = `0 0 0 3px ${C.coral15}`;
                }}
                onBlur={e => {
                  const wrapper = e.currentTarget.parentElement;
                  if (!wrapper) return;
                  wrapper.style.borderColor = C.cream;
                  wrapper.style.boxShadow = "none";
                }}/>
              <button type="button" onClick={() => removePriority(index)} className="transition-colors flex-shrink-0" style={{ color: C.muted }}
                onMouseEnter={e => (e.currentTarget.style.color = C.crimson)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                aria-label={`Remove priority ${index + 1}`}>
                <X className="w-4 h-4"/>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Todo Modal */}
      <CreateToDoDialog
        open={isTodoDialogOpen}
        onOpenChange={(open) => {
          setIsTodoDialogOpen(open);
          if (!open) setEditingTodo(null);
        }}
        initialData={editingTodo}
        onSubmit={async (todo) => {
          await handleUpdateTodo(todo);
        }}
      />
    </div>
  );
};

// ─── DailyAffirmation ─────────────────────────────────────────────────────────
const DailyAffirmation = ({ affirmation, setAffirmation, token }: { affirmation: string; setAffirmation: any; token?: string }) => {
  const [affirmationsList, setAffirmationsList] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/affirmations`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken(token)}` } })
      .then(r => r.ok ? r.json() : null).then(data => { if (data) setAffirmationsList(Array.isArray(data) ? data : (data.data ?? [])); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const total   = affirmationsList.length;
  const prev    = () => setCurrent(c => (c-1+total) % total);
  const next    = () => setCurrent(c => (c+1) % total);
  const getText = (item: any) => { if (!item) return ""; if (typeof item === "string") return `"${item}"`; return `"${item.statement ?? item.text ?? item.affirmation ?? item.content ?? ""}"`; };

  return (
    <div className="border rounded-2xl p-6 w-full font-sans" style={{ background: C.pageBg, borderColor: C.cream }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0"
          style={{ background: C.coral }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
            <path d="M19 2L19.8 5.2L23 6L19.8 6.8L19 10L18.2 6.8L15 6L18.2 5.2L19 2Z" fill="white" strokeLinejoin="round"/>
            <path d="M5 16L5.5 18L7.5 18.5L5.5 19L5 21L4.5 19L2.5 18.5L4.5 18L5 16Z" fill="white" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-base flex items-center gap-2" style={{ color: C.charcoal }}>
          Your Daily Affirmation
          <span className="relative group">
            <Info className="w-4 h-4 cursor-help" style={{ color: C.sand }}/>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 text-white text-xs font-medium rounded-lg px-3 py-2 w-48 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg"
              style={{ background: C.charcoal }}>
              Choose or create a positive statement to empower yourself today
              <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-4 border-transparent" style={{ borderTopColor: C.charcoal }}/>
            </span>
          </span>
        </span>
      </div>

      <div className="bg-white border rounded-xl px-4 py-3 flex items-center justify-between mb-3 min-h-[66px]" style={{ borderColor: C.cream }}>
        <button onClick={prev} disabled={loading || total === 0} className="text-2xl font-light px-2 disabled:opacity-30 transition-colors" style={{ color: C.coral }}>‹</button>
        <div className="flex-1 text-center">
          {loading ? <div className="text-sm" style={{ color: C.muted }}>Loading...</div>
            : total === 0 ? <div className="text-sm" style={{ color: C.muted }}>No affirmations found.</div>
            : <>
              <div className="font-semibold text-xs mb-1" style={{ color: C.coral }}>Affirmation ({current+1} of {total})</div>
              <div className="italic text-sm font-medium" style={{ color: C.charcoal }}>{getText(affirmationsList[current])}</div>
            </>}
        </div>
        <button onClick={next} disabled={loading || total === 0} className="text-2xl font-light px-2 disabled:opacity-30 transition-colors" style={{ color: C.coral }}>›</button>
      </div>

      <textarea value={affirmation} onChange={e => setAffirmation(e.target.value)} placeholder="A positive statement about yourself..."
        className="w-full min-h-[90px] rounded-xl border px-3 py-3 text-sm resize-y outline-none transition-all bg-white mb-3 font-sans"
        style={{ borderColor: C.cream, color: C.charcoal }}
        onFocus={e => { e.target.style.borderColor = C.coral; e.target.style.boxShadow = `0 0 0 3px ${C.coral15}`; }}
        onBlur={e => { e.target.style.borderColor = C.cream; e.target.style.boxShadow = "none"; }}/>

      <div className="bg-white border rounded-lg px-4 py-2.5 flex items-center gap-2" style={{ borderColor: C.cream }}>
        <span className="text-sm">💡</span>
        <span className="text-xs italic" style={{ color: C.stone }}>Present tense ("I am"), positive, specific, repeat daily with emotion.</span>
      </div>
    </div>
  );
};

// ─── BucketListProgress ───────────────────────────────────────────────────────
const PillSelect = ({ value, options, onChange, styleFn }: any) => (
  <div className="relative inline-flex items-center">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none pl-2.5 pr-6 py-1 rounded-full text-[11px] font-semibold cursor-pointer outline-none"
      style={styleFn(value)}
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

const BucketListProgress = ({
  token,
  showToast,
}: {
  token?: string;
  showToast: (msg: string, type?: "success" | "error") => void;
}) => {
  const navigate = useNavigate();

  const [bucketList, setBucketList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTexts, setUpdateTexts] = useState<any>({});
  const [progressFilter, setProgressFilter] = useState("All Progress");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken(token)}`,
  };

  useEffect(() => {
    const fetchDreams = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE}/dreams`, {
          headers: authHeaders,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dreams");
        }

        const data = await response.json();

        let mapped: any[] = [];

        if (Array.isArray(data)) {
          mapped = data.map((item) => ({
            id: item.id.toString(),
            title: item.title || "",
            category: item.category || "Personal",
            progress: statusToProgress(item.status || "dreaming"),
          }));
        } else {
          const mapCat = (arr: any, progressLabel: string) => {
            if (!Array.isArray(arr)) return;

            arr.forEach((item) =>
              mapped.push({
                id: item.id.toString(),
                title: item.title || "",
                category: item.category || "Personal",
                progress: progressLabel,
              }),
            );
          };

          mapCat(data.dreaming, "Dreaming");
          mapCat(data.planning, "Planning");
          mapCat(data.in_progress, "In Progress");
          mapCat(data.achieved, "Achieved");
        }

        setBucketList(mapped);
      } catch (error) {
        console.error(error);
        showToast("Failed to load bucket list", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDreams();
  }, [token]);

  const handleLocalUpdate = (id: string, field: string, value: string) => {
    setBucketList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleProgressChange = async (id: string, newProgress: string) => {
    const oldItem = bucketList.find((i) => i.id === id);

    if (!oldItem || oldItem.progress === newProgress) return;

    // Optimistic UI update
    handleLocalUpdate(id, "progress", newProgress);

    try {
      const response = await fetch(`${API_BASE}/dreams/${id}/change_status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          status: progressToStatus(newProgress),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      showToast(`Status updated to ${newProgress}`, "success");
    } catch (error) {
      console.error(error);

      // Rollback UI if API fails
      handleLocalUpdate(id, "progress", oldItem.progress);

      showToast("Failed to update status", "error");
    }
  };

  const handleCategoryChange = async (id: string, newCategory: string) => {
    const oldItem = bucketList.find((i) => i.id === id);

    if (!oldItem || oldItem.category === newCategory) return;

    // Optimistic UI update
    handleLocalUpdate(id, "category", newCategory);

    try {
      const response = await fetch(`${API_BASE}/dreams/${id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          title: oldItem.title,
          category: newCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      showToast(`Category updated to ${newCategory}`, "success");
    } catch (error) {
      console.error(error);

      // Rollback UI if API fails
      handleLocalUpdate(id, "category", oldItem.category);

      showToast("Failed to update category", "error");
    }
  };

  const handleAddUpdate = async (id: string) => {
    const text = updateTexts[id] || "";

    if (!text.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/dreams/${id}/add_note`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          note: text.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add update");
      }

      showToast("Update added!", "success");

      setUpdateTexts((prev: any) => ({
        ...prev,
        [id]: "",
      }));
    } catch (error) {
      console.error(error);
      showToast("Failed to add update", "error");
    }
  };

  const filtered = bucketList.filter(
    (item) =>
      (progressFilter === "All Progress" ||
        item.progress === progressFilter) &&
      (categoryFilter === "All Categories" ||
        item.category === categoryFilter),
  );

  return (
    <>
      <div
        className="rounded-2xl p-5 border font-sans w-full"
        style={{ background: C.pageBg, borderColor: C.cream }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: C.coral }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <span
              className="font-bold text-[15px] flex items-center gap-2"
              style={{ color: C.charcoal }}
            >
              Bucket List Progress

              <span className="relative group">
                <Info
                  className="w-4 h-4 cursor-help"
                  style={{ color: C.sand }}
                />

                <span
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-2 text-white text-xs font-medium rounded-lg px-3 py-2 w-48 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg"
                  style={{ background: C.charcoal }}
                >
                  Track progress on your dreams and long-term aspirations
                  <span
                    className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-4 border-transparent"
                    style={{ borderRightColor: C.charcoal }}
                  />
                </span>
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/bucket-list")}
              className="flex items-center gap-1 h-8 px-3 rounded-lg text-white text-xs font-semibold transition-all shadow-sm"
              style={{ background: C.coral }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.85";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Dream
            </button>

            {[
              {
                val: progressFilter,
                set: setProgressFilter,
                opts: ["All Progress", ...PROGRESS_OPTIONS],
              },
              {
                val: categoryFilter,
                set: setCategoryFilter,
                opts: ["All Categories", ...CATEGORY_OPTIONS],
              },
            ].map(({ val, set, opts }, i) => (
              <div key={i} className="relative">
                <select
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="appearance-none h-8 pl-3 pr-7 rounded-lg border bg-white text-xs outline-none"
                  style={{ borderColor: C.cream, color: C.stone }}
                >
                  {opts.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>

                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: C.muted }}
                />
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: C.coral }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-0.5">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border shadow-sm px-4 pt-3 pb-3 flex flex-col gap-2"
                  style={{ borderColor: C.cream }}
                >
                  <div className="flex items-center gap-2">
                    {item.progress === "Achieved" ? (
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: C.coral }}
                      />
                    ) : (
                      <span
                        className="text-base leading-none"
                        style={{ color: C.coral }}
                      >
                        ✦
                      </span>
                    )}

                    <span
                      className="font-semibold text-sm"
                      style={{
                        color:
                          item.progress === "Achieved"
                            ? C.muted
                            : C.charcoal,
                        textDecoration:
                          item.progress === "Achieved"
                            ? "line-through"
                            : "none",
                      }}
                    >
                      {item.title || "Untitled Dream"}
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Add update..."
                    value={updateTexts[item.id] || ""}
                    onChange={(e) =>
                      setUpdateTexts((prev: any) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border px-3 py-2 text-xs resize-none outline-none"
                    style={{
                      borderColor: C.cream,
                      background: C.pageBg,
                      color: C.charcoal,
                    }}
                  />

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleAddUpdate(item.id)}
                      className="flex items-center gap-1 h-7 px-3 rounded-full bg-white border text-[11px] font-semibold"
                      style={{ borderColor: C.cream, color: C.stone }}
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
                      </svg>
                      Add progress
                    </button>

                    <PillSelect
                      value={item.progress}
                      options={PROGRESS_OPTIONS}
                      onChange={(val: string) =>
                        handleProgressChange(item.id, val)
                      }
                      styleFn={getProgressStyle}
                    />

                    <PillSelect
                      value={item.category}
                      options={CATEGORY_OPTIONS}
                      onChange={(val: string) =>
                        handleCategoryChange(item.id, val)
                      }
                      styleFn={() => ({
                        background: "#fff",
                        color: C.stone,
                        border: `1px solid ${C.cream}`,
                      })}
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
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-3"
                  style={{ stroke: C.cream }}
                >
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.275 1.275L3 12l5.8 1.9a2 2 0 0 1 1.275 1.275L12 21l1.9-5.8a2 2 0 0 1 1.275-1.275L21 12l-5.8-1.9a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>

                <p
                  className="text-[15px] font-medium mb-4"
                  style={{ color: C.stone }}
                >
                  No bucket list items matching filters
                </p>

                <button
                  onClick={() => navigate("/bucket-list")}
                  className="bg-white border font-semibold text-[14px] px-5 py-2 rounded-lg shadow-sm transition-colors"
                  style={{
                    borderColor: C.cream,
                    color: C.charcoal,
                  }}
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
// ─── PastJournalRow ───────────────────────────────────────────────────────────
const PastJournalRow = ({ journal, token, onDelete, onEdit, showToast }: { journal: PastJournal; token?: string; onDelete: (id: number) => void; onEdit: (id: number) => void; showToast: (msg: string, type?: "success"| "error") => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail]     = useState<DetailedJournal | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleToggle = async () => {
    if (!expanded && !detail) {
      setLoading(true);
      try {
        const res  = await fetch(`${LIFE_API}/user_journals/${journal.id}`, { headers: { Authorization: `Bearer ${getToken(token)}` } });
        const data = await res.json();
        setDetail(data?.user_journal ?? data);
      } catch { showToast("Error loading details", "error"); } finally { setLoading(false); }
    }
    setExpanded(p => !p);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this journal entry?")) return;
    try {
      await fetch(`${LIFE_API}/user_journals/${journal.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken(token)}` } });
      showToast("Entry Deleted", "success");
      localStorage.removeItem(`daily_journal_${journal.start_date}`);
      onDelete(journal.id);
    } catch { showToast("Error deleting entry", "error"); }
  };

  const dateLabel   = journal.formatted_date || format(new Date(journal.start_date), "EEEE, MMMM d, yyyy");
  const infoChip    = (children: React.ReactNode) => (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap"
      style={{ background: C.pageBg, color: C.stone, borderColor: C.cream }}>{children}</span>
  );
  const sectionBlock = (title: string, children: React.ReactNode) => (
    <div className="rounded-xl border px-4 py-3" style={{ background: C.pageBg, borderColor: C.cream }}>
      <p className="text-xs font-bold mb-2" style={{ color: C.stone }}>{title}</p>
      {children}
    </div>
  );
  const pill = (text: string, bg: string, color: string) => (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-sm" style={{ background: bg, color }}>{text}</span>
  );

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: C.cream }}>
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.pageBg }}>
          <Calendar className="w-4 h-4" style={{ color: C.coral }}/>
        </div>
        <span className="font-semibold text-sm flex-1 min-w-0 truncate" style={{ color: C.charcoal }}>{dateLabel}</span>
        {infoChip(`Energy ${journal.energy_score}/10`)}
        {infoChip(`Align ${journal.alignment_score}/10`)}
        <button onClick={e => { e.stopPropagation(); onEdit(journal.id); }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border text-xs font-semibold transition-colors"
          style={{ color: C.charcoal, borderColor: C.cream }}
          onMouseEnter={e => (e.currentTarget.style.background = C.pageBg)} onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
          <Pencil className="w-3 h-3"/> Update
        </button>
        <button onClick={handleDelete} className="p-1.5 transition-colors" style={{ color: C.muted }}
          onMouseEnter={e => (e.currentTarget.style.color = C.crimson)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
          <Trash2 className="w-4 h-4"/>
        </button>
        <button onClick={handleToggle} className="p-1.5 transition-colors" style={{ color: C.muted }}
          onMouseEnter={e => (e.currentTarget.style.color = C.charcoal)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
          {expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-3 border-t pt-3" style={{ borderColor: C.cream }}>
          {loading && <p className="text-sm text-center py-4" style={{ color: C.muted }}>Loading...</p>}
          {detail && <>
            {detail.core_values_snapshot?.length > 0 && sectionBlock("Core Values Lived Today",
              <div className="flex flex-wrap gap-1.5">{detail.core_values_snapshot.map((v,i) => pill(v, C.dune, C.charcoal))}</div>
            )}
            {detail.data?.selected_life_areas?.length > 0 && sectionBlock("Life Areas Focused On",
              <div className="flex flex-wrap gap-1.5">{detail.data.selected_life_areas.map((a,i) => <span key={i} className="px-2.5 py-1 rounded-full bg-white border text-[11px] font-semibold" style={{ color: C.charcoal, borderColor: C.cream }}>{a}</span>)}</div>
            )}
            {detail.affirmation && sectionBlock("Daily Affirmation",
              <p className="text-sm italic" style={{ color: C.stone }}>"{detail.affirmation}"</p>
            )}
            {detail.priorities?.length > 0 && sectionBlock("Priorities for Tomorrow",
              <ul className="space-y-1">{detail.priorities.map((p,i) => <li key={i} className="text-sm flex items-center gap-2" style={{ color: C.stone }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.coral }}/>{p}</li>)}</ul>
            )}
            {(detail.gratitude_note || detail.challenges_note) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detail.gratitude_note && sectionBlock("Gratitude", <p className="text-sm" style={{ color: C.charcoal }}>{detail.gratitude_note}</p>)}
                {detail.challenges_note && sectionBlock("Challenges & Insights", <p className="text-sm" style={{ color: C.charcoal }}>{detail.challenges_note}</p>)}
              </div>
            )}
            {detail.mood_tags?.length > 0 && sectionBlock("Mood",
              <div className="flex flex-wrap gap-1.5">{detail.mood_tags.map((m,i) => <span key={i} className="px-2.5 py-1 rounded-full bg-white border text-[11px] font-semibold" style={{ color: C.charcoal, borderColor: C.cream }}>{m}</span>)}</div>
            )}
            {detail.accomplishments?.length > 0 && sectionBlock("Accomplishments",
              <ul className="space-y-1">{detail.accomplishments.map((a,i) => <li key={i} className="text-sm flex items-center gap-2" style={{ color: C.charcoal }}><span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: C.coral }}/>{a.title}</li>)}</ul>
            )}
            {detail.habits_snapshot?.length > 0 && sectionBlock("Habits",
              <div className="flex flex-col gap-1.5">{detail.habits_snapshot.map((h,i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: C.charcoal }}>{h.name}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: h.completed ? C.forest8 : C.crimson8, color: h.completed ? C.forest : C.crimson }}>
                    {h.completed ? "Done" : "Missed"}
                  </span>
                </div>
              ))}</div>
            )}
            {detail.description && sectionBlock("Description", <p className="text-sm" style={{ color: C.charcoal }}>{detail.description}</p>)}
            {detail.todos_snapshot?.length > 0 && sectionBlock("To-Dos Snapshot",
              <div className="flex flex-col gap-1.5">{detail.todos_snapshot.map((t,i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: C.charcoal }}>{t.title}</span>
                  <div className="flex gap-1.5">
                    {[t.priority, t.status].map((s,j) => <span key={j} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border" style={{ color: C.stone, borderColor: C.cream }}>{s}</span>)}
                  </div>
                </div>
              ))}</div>
            )}
          </>}
        </div>
      )}
    </div>
  );
};

// ─── PastLetterRow ────────────────────────────────────────────────────────────
const PastLetterRow = ({ letter, token, onDelete, onEdit, showToast }: { letter: PastLetter; token?: string; onDelete: (id: number) => void; onEdit: (l: PastLetter & { content?: string }) => void; showToast: (msg: string, type?: "success"|"error") => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent]   = useState<string | null>(letter.content ?? null);
  const [loading, setLoading]   = useState(false);

  const handleToggle = async () => {
    if (!expanded && content === null) {
      setLoading(true);
      try {
        const res = await fetch(`${LIFE_API}/user_letters/${letter.id}`, { headers: { Authorization: `Bearer ${getToken(token)}` } });
        if (res.ok) { const data = await res.json(); setContent((data?.letter ?? data?.user_letter ?? data)?.content ?? ""); }
      } catch { showToast("Error loading letter", "error"); } finally { setLoading(false); }
    }
    setExpanded(p => !p);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this letter?")) return;
    try {
      const res = await fetch(`${LIFE_API}/user_letters/${letter.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken(token)}` } });
      if (!res.ok) throw new Error();
      showToast("Letter deleted", "success"); onDelete(letter.id);
    } catch { showToast("Failed to delete letter", "error"); }
  };

  const dateLabel = letter.formatted_date || (letter.written_on ? format(new Date(letter.written_on), "EEEE, MMMM d, yyyy") : "");

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: C.cream }}>
      <div className="flex items-center gap-3 py-4 cursor-pointer px-2 rounded-lg transition-colors" onClick={handleToggle}
        onMouseEnter={e => (e.currentTarget.style.background = C.pageBg)} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
        <div className="w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0" style={{ background: C.pageBg, borderColor: C.cream }}>
          <BookOpen className="w-4 h-4" style={{ color: C.coral }}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" style={{ color: C.charcoal }}>{letter.subject || "Dear Future Me"}</p>
          <p className="text-sm mt-0.5" style={{ color: C.stone }}>{dateLabel}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }}/> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }}/>}
      </div>
      {expanded && (
        <div className="px-2 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" style={{ color: C.muted }}/></div>
          ) : (
            <>
              <div className="border rounded-xl px-4 py-3 mb-3 text-sm whitespace-pre-wrap min-h-[60px]"
                style={{ background: C.pageBg, borderColor: C.cream, color: C.charcoal }}>
                {content || <span className="italic" style={{ color: C.muted }}>No content.</span>}
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={e => { e.stopPropagation(); onEdit({ ...letter, content: content ?? "" }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white text-sm font-semibold transition-colors"
                  style={{ borderColor: C.cream, color: C.charcoal }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.pageBg)} onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                  <Pencil className="w-3.5 h-3.5"/> Edit
                </button>
                <button onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white text-sm font-semibold transition-colors"
                  style={{ borderColor: C.crimson8, color: C.crimson }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.crimson8)} onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                  <Trash2 className="w-3.5 h-3.5"/> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── PeopleUpcomingDates ──────────────────────────────────────────────────────
const PeopleUpcomingDates = ({ token }: { token?: string }) => {
  const [people, setPeople]     = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetch(`${LIFE_API}/people`, { headers: { Authorization: `Bearer ${getToken(token)}` } })
      .then(r => r.ok ? r.json() : null).then(data => { if (data) setPeople(Array.isArray(data) ? data : (data.data ?? [])); })
      .catch(err => console.error("Failed to fetch people:", err)).finally(() => setIsLoading(false));
  }, [token]);

  const emptyCard = (animate = false) => (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed py-8 shadow-sm ${animate ? "animate-pulse" : ""}`}
      style={{ borderColor: C.cream, background: C.pageBg }}>
      <div className="w-12 h-12 bg-white rounded-full shadow-sm border flex items-center justify-center mb-3" style={{ borderColor: C.cream }}>
        <CalendarIcon className="h-5 w-5" style={{ color: animate ? C.cream : C.coral }} strokeWidth={2}/>
      </div>
      {!animate && <>
        <p className="text-[15px] font-semibold" style={{ color: C.stone }}>No people added yet</p>
        <p className="text-sm mt-0.5" style={{ color: C.stone }}>Connect with friends to share progress</p>
      </>}
    </div>
  );

  if (isLoading) return emptyCard(true);
  if (people.length === 0) return emptyCard(false);

  return (
    <div className="rounded-[16px] border px-5 pt-4 pb-8 font-sans w-full" style={{ background: "white", borderColor: C.cream }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shadow-sm"
            style={{ background: C.coral }}>
            <CalendarIcon className="w-[18px] h-[18px] text-white" strokeWidth={2}/>
          </div>
          <span className="font-bold text-[15px]" style={{ color: C.charcoal }}>Upcoming Dates</span>
        </div>
        <button className="text-[13px] font-medium transition-colors" style={{ color: C.stone }}>View All</button>
      </div>
      <div className="text-center"><p className="text-[14px]" style={{ color: C.stone }}>No upcoming dates in the next 30 days</p></div>
    </div>
  );
};

// ─── ReviewToDos ──────────────────────────────────────────────────────────────
interface Goal { id: number | string; title: string; category?: string; area?: string; progress: number; }
const getStatusText = (p: number) => p === 0 ? "Not Started" : p <= 25 ? "Just Started" : p <= 50 ? "Making Progress" : p <= 75 ? "Halfway There" : p < 100 ? "Almost Done" : "Completed";

const ReviewToDos = ({ goals }: { goals: Goal[] }) => (
  <div className="w-full border rounded-2xl p-6 font-sans" style={{ background: C.pageBg, borderColor: C.cream }}>
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl shadow-sm"
        style={{ background: C.coral }}>
        <Target className="w-5 h-5 text-white" strokeWidth={2.5}/>
      </div>
      <div className="flex items-center gap-1.5">
        <h2 className="text-[18px] font-bold" style={{ color: C.charcoal }}>Review Goals</h2>
        <span className="relative group">
          <Info className="w-4 h-4 cursor-help" style={{ color: C.muted }}/>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 text-white text-xs font-medium rounded-lg px-3 py-2 w-48 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg"
            style={{ background: C.charcoal }}>
            Review your weekly goals and overdue goals to stay on track
            <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-4 border-transparent" style={{ borderTopColor: C.charcoal }}/>
          </span>
        </span>
      </div>
    </div>
    <h3 className="text-[13px] font-bold uppercase tracking-wider mb-3" style={{ color: C.stone }}>THIS WEEK'S GOALS</h3>
    <div className="space-y-3">
      {goals?.length > 0 ? goals.map(goal => (
        <div key={goal.id} className="flex items-center justify-between bg-white border rounded-xl p-4 shadow-sm" style={{ borderColor: C.cream }}>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: C.dune }}/>
            <div>
              <h4 className="text-[15px] font-bold leading-tight" style={{ color: C.charcoal }}>{goal.title}</h4>
              <p className="text-[13px] mt-0.5" style={{ color: C.stone }}>{goal.category || goal.area || "Relationships"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="border text-[12px] font-medium px-3 py-1 rounded-full whitespace-nowrap"
              style={{ background: C.pageBg, color: C.stone, borderColor: C.cream }}>{getStatusText(goal.progress)}</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1.5 rounded-full overflow-hidden flex" style={{ background: C.cream+"60" }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${goal.progress}%`, background: C.coral }}/>
              </div>
              <span className="text-[13px] font-bold w-8 text-right" style={{ color: C.charcoal }}>{goal.progress}%</span>
            </div>
          </div>
        </div>
      )) : (
        <div className="text-center p-4 text-sm bg-white rounded-xl border" style={{ borderColor: C.cream, color: C.stone }}>No active goals found for this week.</div>
      )}
    </div>
  </div>
);

// ─── Main DailyJournal Component ──────────────────────────────────────────────
const DailyJournal = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // ─── CUSTOM TOAST STATE ─────────────────────────────────────────────────────
  const [customToast, setCustomToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setCustomToast({ message, type });
    setTimeout(() => setCustomToast(null), 3000);
  };

  const [activeTab, setActiveTab]         = useState("new");
  const [isSaving, setIsSaving]           = useState(false);
  const [selectedDate, setSelectedDate]   = useState(new Date());
  const [journalId, setJournalId]         = useState<number | null>(null);
  const [isEditMode, setIsEditMode]       = useState(false);
  const [isEditingFromPast, setIsEditingFromPast] = useState(false);
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);
  const [showFortuneModal, setShowFortuneModal] = useState(false);

  const [selectedMoods, setSelectedMoods]     = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas]     = useState<string[]>([]);
  const [selectedValues, setSelectedValues]   = useState<string[]>([]);
  const [energy, setEnergy]         = useState<number>(5);
  const [alignment, setAlignment]   = useState<number>(5);
  const [gratitude, setGratitude]   = useState("");
  const [challenges, setChallenges] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [description, setDescription] = useState("");
  const [priorities, setPriorities]   = useState<string[]>([""]);
  const [achievements, setAchievements] = useState<{ id: number; title: string; checked: boolean }[]>([]);
  const [habitsSnapshot, setHabitsSnapshot] = useState<HabitItem[]>([]);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [allCoreValues, setAllCoreValues] = useState<{ id: number; name: string }[]>([]);
  const [goalsList, setGoalsList] = useState<any[]>([]);

  const [letterSubject, setLetterSubject]   = useState("");
  const [letterBody, setLetterBody]         = useState("");
  const [isSavingLetter, setIsSavingLetter] = useState(false);
  const [pastLetters, setPastLetters]       = useState<PastLetter[]>([]);
  const [isLoadingLetters, setIsLoadingLetters] = useState(false);
  const [editingLetter, setEditingLetter]   = useState<(PastLetter & { content?: string }) | null>(null);

  const [insightsData, setInsightsData]     = useState<{ message?: string; hint?: string } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [pastJournals, setPastJournals]     = useState<PastJournal[]>([]);
  const [isLoadingPast, setIsLoadingPast]   = useState(false);

  const filledDates = useMemo(() => pastJournals.map(j => new Date(j.start_date + "T00:00:00")), [pastJournals]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/goals`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken(token)}` } })
      .then(r => r.ok ? r.json() : null).then(data => { if (data) { const raw = Array.isArray(data) ? data : data.goals || data.data || []; setGoalsList(raw); } })
      .catch(err => console.error("Failed to fetch goals:", err));
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/core_values`, { headers: { Authorization: `Bearer ${getToken(token)}` } })
      .then(r => r.ok ? r.json() : null).then(data => { if (data) setAllCoreValues(Array.isArray(data) ? data : (data.data ?? [])); }).catch(() => {});
  }, [token]);

  const fetchPastJournals = async () => {
    try {
      const res = await fetch(`${LIFE_API}/user_journals`, { headers: { Authorization: `Bearer ${getToken(token)}` } });
      if (res.ok) {
        const data     = await res.json();
        const journals = Array.isArray(data) ? data : (data?.user_journals ?? []);
        setPastJournals(journals); return journals;
      }
    } catch {} return [];
  };
  useEffect(() => { fetchPastJournals(); }, [token]);

  useEffect(() => {
    let isMounted = true;
    const fetchDateData = async () => {
      setIsLoadingDaily(true);
      try {
        const d = format(selectedDate, "yyyy-MM-dd");
        const jRes = await fetch(`${LIFE_API}/user_journals/0?date=${d}&journal_type=daily`, { headers: { Authorization: `Bearer ${getToken(token)}` } });
        let existingJournal = null;
        if (jRes.ok) {
          const jData   = await jRes.json();
          const parsedJ = Array.isArray(jData) ? (jData.length > 0 ? jData[0] : null) : (jData?.user_journal ?? jData);
          if (parsedJ && parsedJ.id) existingJournal = parsedJ;
        }
        let fetchedHabits: any[] = [];
        try {
          const hRes = await fetch(`${API_BASE_URL}/habits?date=${d}`, { headers: { Authorization: `Bearer ${getToken(token)}` } });
          if (hRes.ok) { const hData = await hRes.json(); fetchedHabits = Array.isArray(hData) ? hData : (hData.data ?? []); }
        } catch {}
        const weekHabitHistory: Record<string, boolean[]> = {};
        try {
          const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
          const today = new Date(); today.setHours(0,0,0,0);
          const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
          await Promise.all(weekDates.map(async (date, dayIdx) => {
            const normalizedDate = new Date(date); normalizedDate.setHours(0,0,0,0);
            if (normalizedDate > today) return;
            const dateKey = format(date, "yyyy-MM-dd");
            const res = await fetch(`${LIFE_API}/user_journals/0?date=${dateKey}&journal_type=daily`, { headers: { Authorization: `Bearer ${getToken(token)}` } });
            if (!res.ok) return;
            const data = await res.json();
            const journal = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : (data?.user_journal ?? data);
            const savedHabits = journal?.habits_snapshot || [];
            savedHabits.forEach((habit: any) => {
              const key = habitKey(habit);
              if (!key || !habit.completed) return;
              weekHabitHistory[key] = weekHabitHistory[key] || [];
              weekHabitHistory[key][dayIdx] = true;
            });
          }));
        } catch {}
        const mergeWeekHistory = (habit: any) => {
          const fetchedHistory = habit.week_history || habit.weekly_completion || [];
          const completedHistory = weekHabitHistory[habitKey(habit)] || [];
          return Array.from({ length: 7 }, (_, i) => Boolean(fetchedHistory[i] || completedHistory[i]));
        };
        if (!isMounted) return;
        if (existingJournal) {
          setJournalId(existingJournal.id); 
          setIsEditMode(true);
          setIsEditingFromPast(false);
          setAffirmation(existingJournal.affirmation || ""); setGratitude(existingJournal.gratitude_note || "");
          setChallenges(existingJournal.challenges_note || ""); setDescription(existingJournal.data?.description || "");
          setEnergy(existingJournal.energy_score ?? 5); setAlignment(existingJournal.alignment_score ?? 5);
          setPriorities(existingJournal.priorities?.length ? existingJournal.priorities : [""]);
          setSelectedMoods(existingJournal.mood_tags || []);
          setAchievements(existingJournal.accomplishments?.map((a: any, i: number) => ({ id: i, title: a.title, checked: true })) || []);
          setSelectedValues(existingJournal.core_values_snapshot || []);
          setSelectedAreas(existingJournal.data?.selected_life_areas || []);
          const savedHabits = existingJournal.habits_snapshot || [];
          setHabitsSnapshot(savedHabits.map((sh: any) => {
            const match = fetchedHabits.find(ah => habitKey(ah) === habitKey(sh));
            return { ...sh, frequency: match?.frequency || match?.repeat_type || "Daily", category: match?.category || match?.habit_category || "Other", week_history: mergeWeekHistory({ ...match, ...sh }) };
          }));
        } else {
          let weeklyPlanAchievements: { id: number; title: string; checked: boolean }[] = [];
          let previousDayPriorityAchievements: { id: number; title: string; checked: boolean }[] = [];
          try {
            const weeklyRes = await fetch(`${LIFE_API}/user_journals?journal_type=weekly`, { headers: { Authorization: `Bearer ${getToken(token)}` } });
            if (weeklyRes.ok) {
              const weeklyData = await weeklyRes.json();
              const weeklyJournals = Array.isArray(weeklyData) ? weeklyData : (weeklyData?.user_journals ?? weeklyData?.data ?? []);
              weeklyPlanAchievements = weeklyPlanPrioritiesForDate(weeklyJournals, selectedDate);
            }
          } catch {}
          try {
            const previousDate = format(addDays(selectedDate, -1), "yyyy-MM-dd");
            const previousRes = await fetch(`${LIFE_API}/user_journals/0?date=${previousDate}&journal_type=daily`, { headers: { Authorization: `Bearer ${getToken(token)}` } });
            if (previousRes.ok) {
              const previousData = await previousRes.json();
              const previousJournal = Array.isArray(previousData) ? (previousData.length > 0 ? previousData[0] : null) : (previousData?.user_journal ?? previousData);
              previousDayPriorityAchievements = tomorrowPrioritiesToAchievements(previousJournal);
            }
          } catch {}
          const suggestedAchievements = mergeSuggestedAchievements(
            previousDayPriorityAchievements,
            weeklyPlanAchievements,
          );

          setJournalId(null); 
          setIsEditMode(false); 
          setIsEditingFromPast(false);
          setGratitude(""); setChallenges(""); setDescription("");
          setEnergy(5); setAlignment(5); setPriorities([""]); setSelectedMoods([]); setAchievements(suggestedAchievements);
          setSelectedAreas([]); setSelectedValues([]); setAffirmation("");
          setHabitsSnapshot(fetchedHabits.map((h: any) => ({ habit_id: h.id || h.habit_id, name: h.name || h.title || "Habit", completed: false, frequency: h.frequency || h.repeat_type || "Daily", category: h.category || h.habit_category || "Other", week_history: mergeWeekHistory(h) })));
        }
      } catch (err) { console.error(err); } finally { if (isMounted) setIsLoadingDaily(false); }
    };
    fetchDateData();
    return () => { isMounted = false; };
  }, [selectedDate, token]);

  const loadJournalIntoForm = async (id: number) => {
    try {
      const res = await fetch(`${LIFE_API}/user_journals/${id}`, { headers: { Authorization: `Bearer ${getToken(token)}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const j    = data?.user_journal ?? data;
      if (j.start_date) { 
        setSelectedDate(new Date(j.start_date + "T00:00:00")); 
        setTimeout(() => {
          setIsEditMode(true);
          setIsEditingFromPast(true);
        }, 500); 
      }
      setActiveTab("new");
      showToast("Ready to edit ✏️", "success");
    } catch { showToast("Error loading entry", "error"); }
  };

  useEffect(() => {
    if (activeTab === "past") {
      setIsLoadingPast(true); fetchPastJournals().finally(() => setIsLoadingPast(false));
    }
    if (activeTab === "letters") {
      setIsLoadingLetters(true);
      fetch(`${LIFE_API}/user_letters`, { headers: { Authorization: `Bearer ${getToken(token)}` } })
        .then(r => r.json()).then(d => setPastLetters(Array.isArray(d) ? d : (d?.user_letters ?? [])))
        .catch(() => {}).finally(() => setIsLoadingLetters(false));
    }
    if (activeTab === "insights") {
      setIsLoadingInsights(true);
      fetch(`${LIFE_API}/user_journals/daily_journals_insights`, { headers: { Authorization: `Bearer ${getToken(token)}` } })
        .then(r => r.json()).then(setInsightsData).catch(() => {}).finally(() => setIsLoadingInsights(false));
    }
  }, [activeTab, token]);

  const handleSaveEntry = async () => {
    const today     = new Date(); today.setHours(0,0,0,0);
    const entryDate = new Date(selectedDate); entryDate.setHours(0,0,0,0);
    if (entryDate > today) return showToast("Cannot Create Future Entry", "error");
    setIsSaving(true);
    try {
      const isUpdate             = isEditMode && !!journalId;
      const selectedCoreValueIds = selectedValues.map(valName => allCoreValues.find(cv => cv.name === valName)?.id).filter(Boolean);
      const journalPayload = {
        journal_type: "daily", start_date: format(selectedDate, "yyyy-MM-dd"), affirmation,
        gratitude_note: gratitude, challenges_note: challenges, energy_score: energy, alignment_score: alignment,
        mood_tags: selectedMoods, priorities: priorities.filter(p => p.trim() !== ""),
        accomplishments: achievements.map(a => ({ title: a.title })), todos_snapshot: [],
        habits_snapshot: habitsSnapshot, bucket_updates: [], core_value_ids: selectedCoreValueIds,
        core_values_snapshot: selectedValues, data: { selected_life_areas: selectedAreas, description: description || "Overall productive and reflective day." },
      };
      const url = isUpdate ? `${LIFE_API}/user_journals/${journalId}` : `${LIFE_API}/user_journals`;
      const res = await fetch(url, { method: isUpdate ? "PUT" : "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken(token)}` }, body: JSON.stringify({ user_journal: journalPayload }) });
      if (!res.ok) throw new Error();
      const resData      = await res.json();
      const savedJournal = resData?.user_journal ?? resData?.journal ?? resData;
      if (savedJournal?.id) setJournalId(savedJournal.id);
      setIsEditMode(false);
      setIsEditingFromPast(false);
      showToast(isUpdate ? "Journal Updated ✅" : "Journal Entry Saved ✅", "success");
      const dateKey = format(selectedDate, "yyyy-MM-dd");
      localStorage.setItem(`daily_journal_${dateKey}`, JSON.stringify({ accomplishments: achievements.filter(a => a.title?.trim()).map(a => ({ title: a.title, checked: a.checked })) }));
      if (!isUpdate) setShowFortuneModal(true);
      await fetchPastJournals();
      setActiveTab("past");
    } catch { showToast("Error saving entry", "error"); } finally { setIsSaving(false); }
  };

  const handleSaveLetter = async () => {
    if (!letterBody.trim()) return;
    setIsSavingLetter(true);
    try {
      const res = await fetch(`${LIFE_API}/user_letters`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken(token)}` }, body: JSON.stringify({ letter: { subject: letterSubject.trim() || "Dear Future Me", content: letterBody, written_on: format(selectedDate, "yyyy-MM-dd") } }) });
      if (!res.ok) throw new Error();
      const resData = await res.json();
      const saved   = resData?.letter ?? resData?.user_letter ?? resData;
      if (saved?.id) setPastLetters(prev => [saved, ...prev]);
      showToast("Letter Saved 💌", "success"); setLetterSubject(""); setLetterBody("");
    } catch { showToast("Error saving letter", "error"); } finally { setIsSavingLetter(false); }
  };

  const handleEditLetter   = (letter: PastLetter & { content?: string }) => { setEditingLetter(letter); setLetterSubject(letter.subject || ""); setLetterBody(letter.content || ""); };
  const handleUpdateLetter = async () => {
    if (!editingLetter || !letterBody.trim()) return;
    setIsSavingLetter(true);
    try {
      const res = await fetch(`${LIFE_API}/user_letters/${editingLetter.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken(token)}` }, body: JSON.stringify({ letter: { subject: letterSubject.trim() || "Dear Future Me", content: letterBody } }) });
      if (!res.ok) throw new Error();
      const updated = (await res.json())?.letter ?? (await res.json())?.user_letter ?? (await res.json());
      setPastLetters(prev => prev.map(l => l.id === editingLetter.id ? { ...l, ...updated } : l));
      showToast("Letter updated ✅", "success"); setEditingLetter(null); setLetterSubject(""); setLetterBody("");
    } catch { showToast("Failed to update letter", "error"); } finally { setIsSavingLetter(false); }
  };

  return (
    <div className="min-h-screen animate-fade-in font-sans py-4 relative" style={{ background: C.pageBg }}>
      <DailyFortuneModal isOpen={showFortuneModal} onClose={() => setShowFortuneModal(false)}/>
      <div className="w-full mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: C.charcoal }}>Daily Journal</h1>
              <p className="mt-1 font-medium text-sm sm:text-base" style={{ color: C.stone }}>5-minute reflection on your day</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-sm font-semibold bg-white/50 px-3 py-1.5 rounded-lg border border-transparent transition-all mt-2"
            style={{ color: C.stone }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.cream; e.currentTarget.style.color = C.charcoal; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = C.stone; }}>
            <HelpCircle className="h-4 w-4" style={{ color: C.coral }}/> Help
          </button>
        </div>

        {/* Edit mode banner */}
        {isEditingFromPast && (
          <div className="mb-4 px-4 py-3 border rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ background: C.coral8, borderColor: C.coral15 }}>
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4" style={{ color: C.coral }}/>
              <span className="text-sm font-bold" style={{ color: C.charcoal }}>Editing entry for {format(selectedDate, "MMMM d, yyyy")}</span>
            </div>
            <button onClick={() => { 
                setIsEditingFromPast(false); 
                setIsEditMode(false);
                setJournalId(null);
                setSelectedDate(new Date()); 
              }}
              className="text-xs font-bold uppercase tracking-wider underline" style={{ color: C.coral }}>Cancel Edit</button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab bar */}
          <TabsList className="mb-8 w-full p-1.5 rounded-xl h-auto shadow-none"
            style={{ background: C.pageBg, border: `1px solid ${C.cream}` }}>
            {["new","past","insights","letters"].map(tab => (
              <TabsTrigger key={tab} value={tab}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all uppercase tracking-wider data-[state=active]:shadow-sm"
                style={{
                  color: activeTab === tab ? C.coral : C.stone,
                  background: activeTab === tab ? "#fff" : "transparent",
                }}>
                {tab === "past" ? `Past (${pastJournals.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* NEW ENTRY */}
          <TabsContent value="new" className="focus:outline-none outline-none">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isLoadingDaily ? (
                <div className="flex items-center justify-center py-32">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.coral }}/>
                    <p className="text-sm font-bold uppercase tracking-wider" style={{ color: C.stone }}>Loading {format(selectedDate, "MMMM d, yyyy")}...</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-8 pb-32">
                  <Dailystrip selectedDateExternal={selectedDate} onSelectDate={(date: any) => setSelectedDate(date)} filledDates={filledDates}/>
                  <GuidingPrinciples coreValues={allCoreValues} selectedValues={selectedValues} setSelectedValues={setSelectedValues} selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas} token={token}/>
                  <TodaysReflection accomplishments={achievements} setAccomplishments={setAchievements} gratitude={gratitude} setGratitude={setGratitude} challenges={challenges} setChallenges={setChallenges} selectedMoods={selectedMoods} setSelectedMoods={setSelectedMoods} energy={energy} setEnergy={setEnergy} alignment={alignment} setAlignment={setAlignment} habits={habitsSnapshot} setHabits={setHabitsSnapshot} selectedDate={selectedDate}/>
                  <ShapingTomorrow priorities={priorities} setPriorities={setPriorities} token={token} showToast={showToast} />
                  <DailyAffirmation affirmation={affirmation} setAffirmation={setAffirmation} token={token}/>
                  <ReviewToDos goals={goalsList}/>
                  <BucketListProgress token={token} showToast={showToast} />
                  <PeopleUpcomingDates token={token}/>
                </div>
              )}

              {/* Save bar */}
              <div className=" backdrop-blur-md border-t p-4 flex justify-center z-40" style={{ borderColor: C.cream }}>
                <div className="w-full flex justify-end gap-3 px-4">
                  <Button variant="outline" onClick={() => navigate(-1)}
                    className="font-bold uppercase tracking-wider"
                    style={{ background: "#fff", borderColor: C.cream, color: C.charcoal }}>Cancel</Button>
                  <Button onClick={handleSaveEntry}
                    disabled={isSaving || isLoadingDaily}
                    className="text-white shadow-md font-bold uppercase tracking-wider"
                    style={{
                      background: isEditMode ? C.coral 
                        : journalId ? C.muted
                        : C.coral,
                    }}>
                    {isSaving ? "Saving..."
                      : isEditMode ? `Update Entry — ${format(selectedDate, "MMM d, yyyy")}`
                      : journalId ? `Already Saved — ${format(selectedDate, "MMM d, yyyy")}`
                      : `Save Entry — ${format(selectedDate, "MMM d, yyyy")}`}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* PAST */}
          <TabsContent value="past" className="focus:outline-none outline-none">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isLoadingPast ? (
                <div className="py-20 text-center bg-white rounded-xl border" style={{ borderColor: C.cream }}>
                  <p className="font-bold uppercase tracking-wider" style={{ color: C.stone }}>Loading past entries...</p>
                </div>
              ) : pastJournals.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-xl border" style={{ borderColor: C.cream }}>
                  <p className="font-bold uppercase tracking-wider" style={{ color: C.stone }}>Past entries will appear here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pastJournals.map(journal => <PastJournalRow key={journal.id} journal={journal} token={token} onDelete={id => setPastJournals(p => p.filter(j => j.id !== id))} onEdit={loadJournalIntoForm} showToast={showToast} />)}
                </div>
              )}
            </div>
          </TabsContent>

          {/* INSIGHTS */}
          <TabsContent value="insights" className="focus:outline-none outline-none">
            <div className="rounded-xl border bg-white p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ borderColor: C.cream }}>
              {isLoadingInsights ? <p className="font-bold uppercase tracking-wider" style={{ color: C.stone }}>Loading insights...</p>
                : insightsData?.message ? (
                  <>
                    <div className="mb-4 text-5xl">💡</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: C.charcoal }}>{insightsData.message}</h3>
                    {insightsData.hint && <p className="text-sm max-w-sm mx-auto" style={{ color: C.stone }}>{insightsData.hint}</p>}
                  </>
                ) : (
                  <>
                    <div className="mb-4 text-5xl">💡</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: C.charcoal }}>No reflections yet</h3>
                    <p className="text-sm max-w-sm mx-auto" style={{ color: C.stone }}>Start journaling to see your challenges, insights, and gratitude patterns appear here over time.</p>
                  </>
                )}
            </div>
          </TabsContent>

          {/* LETTERS */}
          <TabsContent value="letters" className="focus:outline-none outline-none">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-xl border bg-white p-8" style={{ borderColor: C.cream }}>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: C.charcoal }}>{editingLetter ? "Edit Your Letter" : "Write a Letter to Yourself"}</h3>
                      <p className="text-sm" style={{ color: C.stone }}>Share your thoughts, dreams, and reflections</p>
                    </div>
                  </div>
                  {editingLetter && (
                    <button onClick={() => { setEditingLetter(null); setLetterSubject(""); setLetterBody(""); }}
                      className="text-xs font-bold uppercase tracking-wider underline flex-shrink-0" style={{ color: C.coral }}>Cancel Edit</button>
                  )}
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Subject (Optional)", val: letterSubject, set: setLetterSubject, ph: "e.g., Dear Future Me...", rows: undefined },
                    { label: "Your Letter",        val: letterBody,    set: setLetterBody, ph: "Dear Self,\n\nWrite your thoughts, feelings, dreams, and reflections here...\n\nWhat do you want to remember? What are you grateful for?", rows: 8 },
                  ].map(({ label, val, set, ph, rows }) => (
                    <div key={label}>
                      <label className="text-[12px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: C.stone }}>{label}</label>
                      {rows ? (
                        <Textarea placeholder={ph} value={val} onChange={e => set(e.target.value)} className="resize-y" rows={rows} style={{ background: C.pageBg, borderColor: C.cream }}/>
                      ) : (
                        <Input placeholder={ph} value={val} onChange={e => set(e.target.value)} style={{ background: C.pageBg, borderColor: C.cream }}/>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <Button
                      className="gap-2 px-6 text-white font-bold uppercase tracking-wider shadow-md"
                      style={{ background: `linear-gradient(135deg, ${C.coral}, ${C.sand})` }}
                      onClick={editingLetter ? handleUpdateLetter : handleSaveLetter}
                      disabled={!letterBody.trim() || isSavingLetter}>
                      {isSavingLetter ? "Saving..." : editingLetter ? "✏️ Update Letter" : "💾 Save Letter"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-8" style={{ borderColor: C.cream }}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold" style={{ color: C.charcoal }}>Past Letters</h3>
                  <p className="text-sm mt-0.5" style={{ color: C.stone }}>Click to expand and read your past letters</p>
                </div>
                {isLoadingLetters ? (
                  <p className="font-bold uppercase tracking-wider text-center py-4" style={{ color: C.muted }}>Loading past letters...</p>
                ) : pastLetters.length === 0 ? (
                  <p className="font-bold uppercase tracking-wider text-center py-4" style={{ color: C.muted }}>No past letters found. Write your first one above!</p>
                ) : (
                  <div className="divide-y" style={{ borderColor: C.cream }}>
                    {pastLetters.map(l => <PastLetterRow key={l.id} letter={l} token={token} onDelete={id => setPastLetters(p => p.filter(x => x.id !== id))} onEdit={handleEditLetter} showToast={showToast} />)}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddAchievementDialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog} onSubmit={(a: any) => setAchievements([...achievements, a])}/>

      {/* ─── CUSTOM TOAST COMPONENT INJECTED HERE ───────────────────────────────── */}
      {customToast && (
        <div
          className={`fixed bottom-6 right-6 ${
            customToast.type === "error" ? "bg-[#A32D2D]" : "bg-[#0B5D41]"
          } text-white px-4 py-3 rounded-xl shadow-lg flex flex-col min-w-[250px] animate-fade-in z-50`}
        >
          <span className="font-bold text-sm">{customToast.type === "error" ? "Error" : "Success"}</span>
          <span className="text-sm">{customToast.message}</span>
        </div>
      )}
    </div>
  );
};

export default DailyJournal;
