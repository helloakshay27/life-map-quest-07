import { useState, useEffect, useMemo } from "react";
import {
  HelpCircle,
  Loader2,
  Lightbulb,
  Trash2,
  CalendarIcon,
  Pencil,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/config/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startOfWeek, endOfWeek, format, addWeeks, isSameWeek } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
// Removed useToast import
import WeeklyReflection, { Win } from "@/components/WeeklyReflection";
import MissionHabitsConnection from "@/components/MissionHabitsConnection";
import WeeklyPlanComponent, {
  generateEmptyWeekData,
} from "@/components/WeeklyPlanComponent";
import FocusAndBoundaries, {
  FocusData,
  defaultFocusData,
} from "@/components/FocusAndBoundaries";
import ReviewToDos from "@/components/ReviewToDos";
import BucketListProgress from "@/components/BucketListProgress";

// ── Updated color tokens to exactly match the Values component theme ───────────
const C = {
  coral:    "#DA7756",
  coral8:   "rgba(218,119,86,0.08)",
  coral15:  "rgba(218,119,86,0.15)",
  charcoal: "#2C2C2A", // Matched Values text dark
  cream:    "#D6B99D", // Matched Values border
  forest:   "#0B5D41", // Matched Values green
  forest8:  "rgba(11,93,65,0.08)",
  crimson:  "#A32D2D", // Matched Values error/red
  crimson8: "rgba(163,45,45,0.08)",
  sand:     "#C5A881",
  dune:     "#D1BC88",
  mist:     "#D1D6A6",
  stone:    "#888780", // Matched Values muted text
  muted:    "#AAAAAA",
  pageBg:   "#F7F4EE", // Matched Values background
};

// ── WeeklyStrip ───────────────────────────────────────────────────────────────
const getWeekStartW = (date: Date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const addWeeksW = (date: Date, n: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n * 7);
  return d;
};

const isSameWeekW = (a: Date, b: Date) =>
  getWeekStartW(a).getTime() === getWeekStartW(b).getTime();

const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatWeekRangeW = (weekStart: Date) => {
  const weekEnd = addWeeksW(weekStart, 1);
  weekEnd.setDate(weekEnd.getDate() - 1);
  const monthStr = weekStart.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  return `${monthStr} ${weekStart.getDate()}-${weekEnd.getDate()}`;
};

const WeeklyStrip = ({
  selectedDate,
  onDateChange,
  filledWeekStarts,
  journalId,
}: {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  filledWeekStarts: string[];
  journalId: number | null;
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayWeekStart = getWeekStartW(today);

  const [viewStart, setViewStart] = useState(() => addWeeksW(todayWeekStart, -5));

  useEffect(() => {
    const selWS = getWeekStartW(selectedDate);
    const viewEnd = addWeeksW(viewStart, 5);
    if (selWS < viewStart || selWS > viewEnd) {
      setViewStart(addWeeksW(selWS, -5));
    }
  }, [selectedDate]);

  const weekCells = Array.from({ length: 6 }, (_, i) => addWeeksW(viewStart, i));
  const filledSet = new Set(filledWeekStarts);

  const getStatus = (ws: Date) => {
    if (filledSet.has(toDateKey(ws))) return "filled";
    if (ws.getTime() > todayWeekStart.getTime()) return "upcoming";
    return "missed";
  };

  const selWS = getWeekStartW(selectedDate);
  const isCurrentWeek = isSameWeekW(selWS, today);
  const weekLabel = isCurrentWeek
    ? "This Week"
    : formatWeekRangeW(selWS);

  const headerLabel = isCurrentWeek
    ? "This Week"
    : `Wk#${format(selWS, "ww")}, ${selWS.toLocaleDateString("en-US", { month: "short" }).toUpperCase()} ${selWS.getDate()}-${addWeeksW(selWS, 1).getDate() - 1}`;

  return (
    <div className="rounded-2xl border p-4 sm:p-5 w-full font-sans"
      style={{ background: "white", borderColor: C.cream }}>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: C.coral }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="white" strokeWidth="2" />
            <path d="M3 9h18" stroke="white" strokeWidth="2" />
            <path d="M8 2v3M16 2v3" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <rect x="7" y="13" width="2" height="2" rx="0.5" fill="white" />
            <rect x="11" y="13" width="2" height="2" rx="0.5" fill="white" />
            <rect x="15" y="13" width="2" height="2" rx="0.5" fill="white" />
          </svg>
        </div>
        <span className="font-bold text-[16px]" style={{ color: C.charcoal }}>
          {journalId ? `Editing ${headerLabel}` : headerLabel}
        </span>
      </div>

      {/* Navigation + cells */}
      <div className="flex items-center gap-1 sm:gap-3 w-full">
        <button
          onClick={() => setViewStart((v) => addWeeksW(v, -1))}
          className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border shadow-sm text-lg outline-none transition-all"
          style={{ borderColor: C.cream, color: C.stone }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.sand; e.currentTarget.style.color = C.sand; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.cream; e.currentTarget.style.color = C.stone; }}
        >‹</button>

        <div className="flex-1 flex flex-col items-center gap-3 w-full">
          <span className="text-[13px] font-bold tracking-wide" style={{ color: C.stone }}>
            {weekLabel}
          </span>

          <div className="grid grid-cols-6 gap-1 sm:gap-2.5 w-full max-w-[500px] mx-auto">
            {weekCells.map((ws, i) => {
              const status     = getStatus(ws);
              const isSelected = isSameWeekW(ws, selectedDate);
              const isFilled   = status === "filled";
              const isMissed   = status === "missed";
              const isUpcoming = status === "upcoming";

              const we = new Date(ws);
              we.setDate(we.getDate() + 6);
              const monthStr = ws.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
              const rangeStr = `${monthStr} ${ws.getDate()}-${we.getDate()}`;
              const wkLabel  = `WK#${format(ws, "ww")}`;

              let bg = "", color = "";
              if (isFilled   && !isSelected) { bg = C.forest8;        color = C.forest;  }
              if (isFilled   &&  isSelected) { bg = C.forest;         color = "#fff";    }
              if (isMissed   && !isSelected) { bg = C.crimson8;       color = C.crimson; }
              if (isMissed   &&  isSelected) { bg = C.crimson;        color = "#fff";    }
              if (isUpcoming && !isSelected) { bg = C.mist + "30";    color = C.stone;   }
              if (isSelected &&  isUpcoming) { bg = "#fff";           color = C.charcoal;}

              return (
                <button
                  key={i}
                  onClick={() => onDateChange(ws)}
                  className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl w-full py-2 min-h-[75px] sm:min-h-[90px] transition-all duration-200 ease-in-out relative outline-none"
                  style={{
                    background: bg,
                    color,
                    ...(isSelected
                      ? { boxShadow: `0 0 0 2px ${C.sand}, 0 0 0 4px ${C.pageBg}`, transform: "scale(1.08)", zIndex: 10 }
                      : { border: "1px solid transparent" }
                    ),
                  }}
                >
                  <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wide opacity-90 leading-none mt-1"
                    style={isSelected && isUpcoming ? { color: C.sand } : {}}>
                    {wkLabel}
                  </span>
                  <span className="text-[11px] sm:text-[12px] font-extrabold leading-tight mt-1 sm:mt-1.5 mb-1 sm:mb-1.5 text-center px-1">
                    {rangeStr}
                  </span>
                  <div className="h-4 flex items-center justify-center">
                    {isMissed && (
                      <span className="text-[9px] sm:text-[10px] font-bold rounded-full px-1.5 sm:px-2 py-[2px] leading-none tracking-wide"
                        style={{ background: isSelected ? "rgba(255,255,255,0.3)" : C.crimson8, color: isSelected ? "#fff" : C.crimson }}>
                        -10
                      </span>
                    )}
                    {isFilled && (
                      <span className="text-[9px] sm:text-[10px] font-bold rounded-full px-1.5 sm:px-2 py-[2px] leading-none tracking-wide"
                        style={{ background: isSelected ? "rgba(255,255,255,0.3)" : C.forest8, color: isSelected ? "#fff" : C.forest }}>
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
          onClick={() => setViewStart((v) => addWeeksW(v, 1))}
          className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border shadow-sm text-lg outline-none transition-all"
          style={{ borderColor: C.cream, color: C.stone }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.sand; e.currentTarget.style.color = C.sand; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.cream; e.currentTarget.style.color = C.stone; }}
        >›</button>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-5">
        {[
          { color: C.forest,  label: "Filled" },
          { color: C.crimson, label: "Missed" },
          { color: C.mist,    label: "Upcoming", border: true },
        ].map(({ color, label, border }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{ background: border ? C.mist + "30" : color, ...(border ? { border: `1px solid ${C.cream}` } : {}) }} />
            <span className="text-[12px] sm:text-[13px] font-medium" style={{ color: C.stone }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── PeopleUpcomingDates ───────────────────────────────────────────────────────
const PeopleUpcomingDates = () => {
  const [people, setPeople] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const res = await apiRequest("/people");
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
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-8 shadow-sm animate-pulse"
        style={{ borderColor: C.cream, background: "white" }}>
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3"
          style={{ border: `1px solid ${C.cream}` }}>
          <CalendarIcon className="h-5 w-5" style={{ color: C.cream }} strokeWidth={2} />
        </div>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-8 shadow-sm"
        style={{ borderColor: C.cream, background: C.pageBg }}>
        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3"
          style={{ border: `1px solid ${C.cream}` }}>
          <CalendarIcon className="h-5 w-5" style={{ color: C.coral }} strokeWidth={2} />
        </div>
        <p className="text-[15px] font-semibold" style={{ color: C.charcoal }}>No people added yet</p>
        <p className="text-sm mt-0.5" style={{ color: C.stone }}>Connect with friends to share progress</p>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] px-5 pt-4 pb-8 font-sans w-full"
      style={{ border: `1px solid ${C.cream}`, background: "white" }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shadow-sm"
            style={{ background: C.coral }}>
            <CalendarIcon className="w-[18px] h-[18px] text-white" strokeWidth={2} />
          </div>
          <span className="font-bold text-[15px]" style={{ color: C.charcoal }}>Upcoming Dates</span>
        </div>
        <button onClick={() => navigate("/people")} className="text-[13px] font-medium transition-colors"
          style={{ color: C.stone }}>View All</button>
      </div>
      <div className="text-center">
        <p className="text-[14px]" style={{ color: C.stone }}>No upcoming dates in the next 30 days</p>
      </div>
    </div>
  );
};

// ── Past Journal Card ─────────────────────────────────────────────────────────
interface PastJournalCardProps {
  journal: PastWeeklyJournal;
  onDelete: (id: number, e: React.MouseEvent) => void;
  onEdit: (journal: PastWeeklyJournal) => void;
}

const PastJournalCard = ({ journal, onDelete, onEdit }: PastJournalCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const weekStart = new Date(journal.start_date);
  const balanceRating = journal.data?.life_balance_rating ?? journal.alignment_score ?? null;

  const winsByDay: Record<string, { description: string; completed: boolean }[]> = {};
  if (journal.data?.wins) {
    for (const win of journal.data.wins) {
      if (!winsByDay[win.day]) winsByDay[win.day] = [];
      winsByDay[win.day].push({ description: win.description, completed: win.completed });
    }
  }

  const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const sortedDays = Object.keys(winsByDay).sort(
    (a, b) => dayOrder.indexOf(b) - dayOrder.indexOf(a),
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: `1px solid ${C.cream}` }}>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: C.pageBg }}>
            <CalendarIcon className="w-4 h-4" style={{ color: C.coral }} />
          </div>
          <span className="font-bold text-[15px]" style={{ color: C.charcoal }}>
            Week of {format(weekStart, "MMMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {balanceRating !== null && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: C.pageBg, color: C.charcoal, border: `1px solid ${C.cream}` }}>
              Balance {balanceRating}/10
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(journal); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-xs font-semibold transition-colors"
            style={{ color: C.charcoal, border: `1px solid ${C.cream}` }}
            onMouseEnter={e => (e.currentTarget.style.background = C.pageBg)}
            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            title="Edit"
          >
            <Pencil className="w-3 h-3" /> Update
          </button>
          <button onClick={(e) => onDelete(journal.id, e)} className="p-1.5 transition-colors"
            style={{ color: C.muted }}
            onMouseEnter={e => (e.currentTarget.style.color = C.crimson)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="p-1.5 transition-colors"
            style={{ color: C.muted }}
            onMouseEnter={e => (e.currentTarget.style.color = C.charcoal)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-3 pt-3" style={{ borderTop: `1px solid ${C.cream}` }}>

          {(sortedDays.length > 0 || journal.data?.weekly_story) && (
            <div className="rounded-xl px-4 py-3" style={{ background: C.pageBg, border: `1px solid ${C.cream}` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${C.coral}, ${C.sand})` }}>
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold" style={{ color: C.charcoal }}>My Weekly Story</span>
              </div>
              {sortedDays.length > 0 ? (
                <div className="space-y-3 pl-1">
                  {sortedDays.map((day) => (
                    <div key={day}>
                      <p className="text-sm font-bold mb-1" style={{ color: C.charcoal }}>{day}</p>
                      {winsByDay[day].map((win, i) => (
                        <div key={i} className="flex items-start gap-2 ml-2">
                          <CheckSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.forest }} />
                          <span className="text-sm" style={{ color: C.charcoal }}>{win.description}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : journal.data?.weekly_story ? (
                <p className="text-sm leading-relaxed pl-1" style={{ color: C.charcoal }}>{journal.data.weekly_story}</p>
              ) : null}
            </div>
          )}

          {journal.data?.wins && journal.data.wins.length > 0 && (
            <div className="rounded-xl px-4 py-3" style={{ background: C.pageBg, border: `1px solid ${C.cream}` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: C.forest }}>
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold" style={{ color: C.charcoal }}>Achievements This Week</span>
              </div>
              <div className="space-y-2 pl-1">
                {journal.data.wins.map((win, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: C.coral }} />
                    <div>
                      <p className="text-xs font-semibold capitalize" style={{ color: C.coral }}>{win.category}</p>
                      <p className="text-sm" style={{ color: C.charcoal }}>{win.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {journal.data?.biggest_challenge && (
            <div className="rounded-xl px-4 py-3" style={{ background: C.crimson8, border: `1px solid rgba(163,45,45,0.18)` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: C.crimson }}>
                  <AlertCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold" style={{ color: C.charcoal }}>Biggest Challenge</span>
              </div>
              <p className="text-sm pl-1 leading-relaxed" style={{ color: C.charcoal }}>{journal.data.biggest_challenge}</p>
              {journal.data.challenge_cause && (
                <p className="text-xs mt-2 pl-1 pt-2" style={{ color: C.stone, borderTop: `1px solid rgba(163,45,45,0.12)` }}>
                  <span className="font-semibold">Cause:</span> {journal.data.challenge_cause}
                </p>
              )}
            </div>
          )}

          {journal.data?.key_insight && (
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(80,52,187,0.06)", border: "1px solid rgba(80,52,187,0.14)" }}>
              <p className="text-xs font-bold mb-1" style={{ color: "#5034BB" }}>Key Insight</p>
              <p className="text-sm italic" style={{ color: C.charcoal }}>"{journal.data.key_insight}"</p>
            </div>
          )}

          {journal.gratitude_note && (
            <div className="rounded-xl px-4 py-3" style={{ background: C.pageBg, border: `1px solid ${C.cream}` }}>
              <p className="text-xs font-bold mb-1" style={{ color: C.sand }}>Gratitude</p>
              <p className="text-sm italic" style={{ color: C.charcoal }}>"{journal.gratitude_note}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface PastWeeklyJournal {
  id: number;
  journal_type: string;
  start_date: string;
  formatted_date?: string;
  energy_score: number | null;
  alignment_score: number | null;
  affirmation: string | null;
  priorities: string[] | null;
  gratitude_note?: string | null;
  data?: {
    key_insight?: string;
    weekly_story?: string;
    mission_connection?: string;
    biggest_challenge?: string;
    challenge_cause?: string;
    life_balance_rating?: number;
    weekly_plan?: Record<string, unknown>;
    focus_and_boundaries?: Record<string, unknown>;
    wins?: {
      day: string;
      category: string;
      description: string;
      completed: boolean;
    }[];
  };
}

interface Goal {
  id: string;
  title: string;
  status: "planning" | "started" | "progress" | "completed";
  area?: string;
  progress?: number;
}

const WeeklyJournal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { token, user } = useAuth();
  
  // Custom Toast State
  const [customToast, setCustomToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setCustomToast({ message, type });
    setTimeout(() => setCustomToast(null), 3000);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [journalId, setJournalId] = useState<number | null>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditingFromPast, setIsEditingFromPast] = useState(false);

  const [challenge, setChallenge] = useState("");
  const [challengeCause, setChallengeCause] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [insight, setInsight] = useState("");
  const [balanceRating, setBalanceRating] = useState(3);
  const [wins, setWins] = useState<Win[]>([]);
  const [habitsText, setHabitsText] = useState("");
  const [coreValue, setCoreValue] = useState("");
  const [missionText, setMissionText] = useState("");
  const [weeklyPlanData, setWeeklyPlanData] = useState(generateEmptyWeekData());
  const [focusData, setFocusData] = useState<FocusData>(defaultFocusData);
  const [pastJournals, setPastJournals] = useState<PastWeeklyJournal[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState(false);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);

  const filledWeekStarts = useMemo(
    () => pastJournals.map((j) => j.start_date),
    [pastJournals],
  );

  const isFutureWeek =
    startOfWeek(currentDate, { weekStartsOn: 0 }) >
    startOfWeek(new Date(), { weekStartsOn: 0 });

  const handleSavePlan = async () => {
    if (isFutureWeek) {
      showToast("You can only create journal entries for today or past dates.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const startDate = format(startOfWeek(currentDate, { weekStartsOn: 0 }), "yyyy-MM-dd");
      const endDate = format(endOfWeek(currentDate, { weekStartsOn: 0 }), "yyyy-MM-dd");

      const isUpdate = isEditMode && !!journalId;

      const payload = {
        user_journal: {
          user_id: user?.id ? parseInt(user.id, 10) : 1,
          journal_type: "weekly",
          start_date: startDate,
          end_date: endDate,
          description: null,
          gratitude_note: gratitude,
          alignment_score: balanceRating,
          data: {
            weekly_story: habitsText,
            wins,
            biggest_challenge: challenge,
            challenge_cause: challengeCause,
            key_insight: insight,
            mission_connection: missionText,
            life_balance_rating: balanceRating,
            weekly_plan: weeklyPlanData,
            focus_and_boundaries: focusData,
          },
        },
      };

      const url = isUpdate ? `/user_journals/${journalId}` : `/user_journals`;
      const method = isUpdate ? "PUT" : "POST";
      const res = await apiRequest(url, { method, body: JSON.stringify(payload) });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("🚨 Backend error:", errorData);
        throw new Error(`Failed to save weekly journal: ${res.status}`);
      }

      const responseData = await res.json();
      const newId = responseData.journal?.id ?? responseData.user_journal?.id ?? responseData.id;
      if (newId) setJournalId(newId);
      
      setIsEditMode(false);
      setIsEditingFromPast(false);

      localStorage.setItem(`weekly_wins_${startDate}`, JSON.stringify(wins));

      if (isUpdate) {
        setPastJournals((prev) =>
          prev.map((j) =>
            j.id === journalId
              ? {
                  ...j,
                  gratitude_note: gratitude,
                  alignment_score: balanceRating,
                  data: {
                    weekly_story: habitsText,
                    wins,
                    biggest_challenge: challenge,
                    challenge_cause: challengeCause,
                    key_insight: insight,
                    mission_connection: missionText,
                    life_balance_rating: balanceRating,
                    weekly_plan: weeklyPlanData,
                    focus_and_boundaries: focusData,
                  },
                }
              : j,
          ),
        );
      }

      showToast(`Plan for week ${format(currentDate, "MMMM d")} ${isUpdate ? "updated" : "saved"} successfully.`, "success");

      fetchPastJournals();
    } catch (error) {
      console.error("Save weekly journal error:", error);
      showToast("Error saving journal. Please check your connection and try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === "new") {
      const fetchJournalForDate = async () => {
        try {
          const formattedDate = format(currentDate, "yyyy-MM-dd");
          const res = await apiRequest(
            `/user_journals/0?date=${formattedDate}&journal_type=weekly`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data.id) {
              setJournalId(data.id);
              setIsEditMode(true);
              
              setGratitude(data.gratitude_note || "");
              setBalanceRating(data.data?.life_balance_rating ?? data.alignment_score ?? 3);
              setChallenge(data.data?.biggest_challenge || "");
              setChallengeCause(data.data?.challenge_cause || "");
              setInsight(data.data?.key_insight || "");
              setWins(data.data?.wins || []);
              setMissionText(data.data?.mission_connection || "");
              setHabitsText(data.data?.weekly_story || "");
              setWeeklyPlanData(data.data?.weekly_plan || generateEmptyWeekData(currentDate));
              setFocusData(data.data?.focus_and_boundaries || defaultFocusData);
              return;
            }
          }
          setJournalId(null);
          setIsEditMode(false);
          setIsEditingFromPast(false);
          
          setGratitude(""); setBalanceRating(3); setChallenge(""); setChallengeCause("");
          setInsight(""); setWins([]); setMissionText(""); setHabitsText("");
          setWeeklyPlanData(generateEmptyWeekData(currentDate));
          setFocusData(defaultFocusData);
        } catch (error) {
          console.error("Failed to fetch journal for date:", error);
        }
      };
      fetchJournalForDate();
    }
  }, [currentDate, activeTab, token]);
  
  const fetchPastJournals = async () => {
    setIsLoadingPast(true);
    try {
      const res = await apiRequest("/user_journals?journal_type=weekly");
      const data = await res.json();
      setPastJournals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch past journals", error);
    } finally {
      setIsLoadingPast(false);
    }
  };

  useEffect(() => { fetchPastJournals(); }, [token]);
  useEffect(() => {
    if (activeTab === "past" || activeTab === "insights") fetchPastJournals();
  }, [activeTab, token]);

  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoadingGoals(true);
      try {
        const res = await apiRequest("/goals");
        if (res.ok) {
          const data = await res.json();
          const raw: any[] = Array.isArray(data) ? data : Array.isArray(data.goals) ? data.goals : Array.isArray(data.data) ? data.data : [];
          const normalized: Goal[] = raw.map((g) => ({
            ...g, id: String(g.id),
            status: (g.status === "in_progress" ? "progress" : g.status) || "planning",
          }));
          setGoals(normalized);
        }
      } catch (e) {
        console.error("Error loading goals", e);
      } finally {
        setIsLoadingGoals(false);
      }
    };
    fetchGoals();
  }, [token]);

  const handleEditPastJournal = (journal: PastWeeklyJournal) => {
    setActiveTab("new");
    setJournalId(journal.id);
    setCurrentDate(new Date(journal.start_date));
    setIsEditMode(true);
    setIsEditingFromPast(true);
    
    setGratitude(journal.gratitude_note || "");
    setBalanceRating(journal.data?.life_balance_rating ?? journal.alignment_score ?? 3);
    setChallenge(journal.data?.biggest_challenge || "");
    setChallengeCause(journal.data?.challenge_cause || "");
    setInsight(journal.data?.key_insight || "");
    setWins(journal.data?.wins ?? []);
    setMissionText(journal.data?.mission_connection || "");
    setHabitsText(journal.data?.weekly_story || "");
    if (journal.data?.weekly_plan) setWeeklyPlanData(journal.data.weekly_plan);
    if (journal.data?.focus_and_boundaries) setFocusData(journal.data.focus_and_boundaries);
    
    showToast(`Loaded journal for week of ${format(new Date(journal.start_date), "MMMM d, yyyy")}. Save to update.`, "success");
  };

  const handleDeletePastJournal = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this weekly journal entry?")) return;
    try {
      const res = await apiRequest(`/user_journals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      showToast("Weekly journal entry removed successfully.", "success");
      setPastJournals((prev) => prev.filter((j) => j.id !== id));
      if (journalId === id) setJournalId(null);
    } catch (error) {
      showToast("Could not delete journal entry.", "error");
    }
  };

  return (
    <div className="min-h-screen animate-fade-in font-sans py-4 relative" style={{ background: C.pageBg }}>
      <div className="w-full mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: C.charcoal }}>
              Weekly Journal
            </h1>
            <p className="mt-1 font-medium text-sm sm:text-base" style={{ color: C.stone }}>
              Strategic review and planning
            </p>
          </div>
          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-1.5 text-sm font-semibold bg-white/50 px-3 py-1.5 rounded-lg border border-transparent transition-all mt-2"
            style={{ color: C.stone }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.cream; e.currentTarget.style.color = C.charcoal; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = C.stone; }}
          >
            <HelpCircle className="h-4 w-4" style={{ color: C.coral }} /> Help
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full p-1.5 rounded-xl h-auto shadow-none"
            style={{ background: C.pageBg, border: `1px solid ${C.cream}` }}>
            {["new", "past", "insights"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm"
                style={{ color: activeTab === tab ? C.coral : C.stone }}
              >
                {tab === "past" ? `Past (${pastJournals.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── NEW TAB ── */}
          <TabsContent value="new" className="focus:outline-none outline-none">
            <div className="flex flex-col w-full gap-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Edit mode banner */}
              {isEditingFromPast && (
                <div className="mb-6 px-5 py-3.5 border rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ background: "#FEF4EE", borderColor: "#D6B99D" }}>
                  <div className="flex items-center gap-2.5">
                    <Pencil className="w-4 h-4" style={{ color: "#DA7756" }}/>
                    <span className="text-sm font-bold" style={{ color: "#2C2C2A" }}>Editing entry for {format(currentDate, "MMMM d, yyyy")}</span>
                  </div>
                  <button onClick={() => { 
                      setIsEditingFromPast(false); 
                      setIsEditMode(false);
                      setJournalId(null);
                      setCurrentDate(new Date()); 
                    }}
                    className="text-xs font-bold uppercase tracking-wider underline hover:opacity-80 transition-opacity" style={{ color: "#DA7756" }}>
                    CANCEL EDIT
                  </button>
                </div>
              )}

            <WeeklyStrip
                selectedDate={currentDate}
                onDateChange={(newDate) => {
                  setCurrentDate(newDate);
                  setIsEditingFromPast(false); 
                }}
                filledWeekStarts={filledWeekStarts}
                journalId={journalId}
              />
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: C.pageBg, border: `1px solid ${C.cream}` }}>
                <WeeklyReflection
  currentDate={currentDate}
  wins={wins}
  setWins={setWins}
  challenge={challenge}
  setChallenge={setChallenge}
  challengeCause={challengeCause}
  setChallengeCause={setChallengeCause}
  gratitude={gratitude}
  setGratitude={setGratitude}
  insight={insight}
  setInsight={setInsight}
  balanceRating={balanceRating}
  setBalanceRating={setBalanceRating}
  weeklyStory={habitsText}
  setWeeklyStory={setHabitsText}
/>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: C.pageBg, border: `1px solid ${C.cream}` }}>
                <MissionHabitsConnection
                  currentDate={currentDate} coreValue={coreValue} setCoreValue={setCoreValue}
                  missionText={missionText} setMissionText={setMissionText}
                  habitsText={habitsText} setHabitsText={setHabitsText}
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: C.pageBg, border: `1px solid ${C.cream}` }}>
                <WeeklyPlanComponent data={weeklyPlanData} setData={setWeeklyPlanData} />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: C.pageBg, border: `1px solid ${C.cream}` }}>
                <FocusAndBoundaries data={focusData} setData={setFocusData} apiGoals={goals} />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <BucketListProgress />
              </div>
              <PeopleUpcomingDates />
            </div>
          </TabsContent>

          {/* ── PAST TAB ── */}
          <TabsContent value="past" className="focus:outline-none outline-none">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isLoadingPast ? (
                <div className="py-20 text-center bg-white rounded-xl" style={{ border: `1px solid ${C.cream}` }}>
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.coral }} />
                    <p className="font-bold uppercase tracking-wider" style={{ color: C.charcoal }}>Loading past entries...</p>
                  </div>
                </div>
              ) : pastJournals.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-xl" style={{ border: `1px solid ${C.cream}` }}>
                  <div className="flex flex-col items-center justify-center gap-3 opacity-60">
                    <CalendarDays className="h-10 w-10" style={{ color: C.stone }} strokeWidth={1.5} />
                    <p className="font-medium text-[15px]" style={{ color: C.stone }}>
                      No past reflections yet. Complete your first weekly reflection!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pastJournals.map((journal) => (
                    <PastJournalCard key={journal.id} journal={journal}
                      onDelete={handleDeletePastJournal} onEdit={handleEditPastJournal} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── INSIGHTS TAB ── */}
          <TabsContent value="insights" className="focus:outline-none outline-none">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-2xl px-6 py-5" style={{ background: C.pageBg, border: `1px solid ${C.cream}` }}>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:C.coral }}>
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-[18px] font-bold" style={{ color: C.charcoal }}>
                    Weekly Challenges &amp; Key Insights
                  </h2>
                </div>
                <p className="text-sm ml-10" style={{ color: C.stone }}>
                  Review your weekly challenges and learnings over time
                </p>
              </div>

              {isLoadingPast ? (
                <div className="py-16 text-center bg-white rounded-xl" style={{ border: `1px solid ${C.cream}` }}>
                  <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3" style={{ color: C.coral }} />
                  <p className="font-bold uppercase tracking-wider" style={{ color: C.charcoal }}>Loading insights...</p>
                </div>
              ) : pastJournals.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-xl" style={{ border: `1px solid ${C.cream}` }}>
                  <div className="text-4xl mb-3">💡</div>
                  <p className="font-bold uppercase tracking-wider" style={{ color: C.charcoal }}>Complete a journal to see insights.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pastJournals.map((journal) => {
                    const weekStart = new Date(journal.start_date);
                    const balanceVal = journal.data?.life_balance_rating ?? journal.alignment_score ?? null;
                    return (
                      <div key={journal.id} className="bg-white rounded-2xl shadow-sm overflow-hidden"
                        style={{ border: `1px solid ${C.cream}` }}>
                        <div className="flex items-center justify-between px-5 py-4"
                          style={{ borderBottom: `1px solid ${C.cream}` }}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: C.pageBg }}>
                              <CalendarIcon className="w-4 h-4" style={{ color: C.coral }} />
                            </div>
                            <span className="font-bold text-[15px]" style={{ color: C.charcoal }}>
                              Week of {format(weekStart, "MMMM d, yyyy")}
                            </span>
                          </div>
                          {balanceVal !== null && (
                            <span className="px-3 py-0.5 rounded-full text-xs font-semibold"
                              style={{ border: `1px solid ${C.cream}`, color: C.charcoal, background: C.pageBg }}>
                              Balance: {balanceVal}/10
                            </span>
                          )}
                        </div>
                        <div className="px-5 py-4 space-y-4">
                          {journal.data?.biggest_challenge && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4" style={{ color: C.crimson }} />
                                <span className="text-sm font-bold" style={{ color: C.charcoal }}>Biggest Challenge</span>
                              </div>
                              <div className="rounded-xl px-4 py-3"
                                style={{ background: C.crimson8, border: `1px solid rgba(163,45,45,0.18)` }}>
                                <p className="text-sm" style={{ color: C.charcoal }}>{journal.data.biggest_challenge}</p>
                                {journal.data.challenge_cause && (
                                  <p className="text-xs mt-1.5 pt-1.5" style={{ color: C.stone, borderTop: `1px solid rgba(163,45,45,0.1)` }}>
                                    <span className="font-semibold">Cause:</span> {journal.data.challenge_cause}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          {journal.data?.biggest_challenge && journal.data?.wins && journal.data.wins.length > 0 && (
                            <div style={{ borderTop: `1px solid ${C.cream}` }} />
                          )}
                          {journal.data?.wins && journal.data.wins.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4" style={{ color: C.forest }} />
                                <span className="text-sm font-bold" style={{ color: C.charcoal }}>Top Wins This Week</span>
                              </div>
                              <div className="space-y-1.5">
                                {journal.data.wins.map((win, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: C.coral }} />
                                    <div>
                                      <span className="text-xs font-semibold capitalize mr-1.5" style={{ color: C.coral }}>{win.category}</span>
                                      <span className="text-sm" style={{ color: C.charcoal }}>{win.description}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {journal.data?.key_insight && (
                            <>
                              <div style={{ borderTop: `1px solid ${C.cream}` }} />
                              <div>
                                <p className="text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: "#5034BB" }}>Key Insight</p>
                                <p className="text-sm italic" style={{ color: C.charcoal }}>"{journal.data.key_insight}"</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Save bar */}
      {activeTab === "new" && (
        <div className=" backdrop-blur-md p-4 flex justify-center z-40"
          style={{ borderTop: `1px solid ${C.cream}` }}>
          <div className="w-full flex justify-end gap-3 px-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm uppercase tracking-wider bg-white"
              style={{ border: `1px solid ${C.cream}`, color: C.charcoal }}
              onMouseEnter={e => (e.currentTarget.style.background = C.pageBg)}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
              Cancel
            </button>
            <button
              onClick={handleSavePlan}
              disabled={isSaving || isFutureWeek}  
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-bold text-sm transition-all shadow-md uppercase tracking-wider disabled:opacity-50"
              style={{
                background: isFutureWeek ? C.stone : C.coral,
                cursor: isFutureWeek ? "not-allowed" : "pointer",
              }}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              {isSaving
                ? "Saving..."
                : isEditMode
                  ? `Update Plan WK#${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "ww")} ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d")}-${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "d")}`
                  : `Save Plan WK#${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "ww")} ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d")}-${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "d")}`}
            </button>
          </div>
        </div>
      )}

      {/* ── Custom Toast Component injected here ── */}
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

export default WeeklyJournal;