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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/config/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startOfWeek, endOfWeek, format, addWeeks, isSameWeek } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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

// ── WeeklyStrip ───────────────────────────────────────────────────────────────
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

  const [pageOffset, setPageOffset] = useState(0);

  const viewBegin = addWeeksW(todayWeekStart, -5 + pageOffset * 6);
  const weekCells = Array.from({ length: 6 }, (_, i) =>
    addWeeksW(viewBegin, i),
  );

  const filledSet = new Set(filledWeekStarts);

  const getStatus = (ws: Date) => {
    if (filledSet.has(toDateKey(ws))) return "filled";
    if (ws.getTime() > todayWeekStart.getTime()) return "upcoming";
    return "missed";
  };

  const selWS = getWeekStartW(selectedDate);
  const selWE = new Date(selWS);
  selWE.setDate(selWE.getDate() + 6);
  const wkNum = format(selWS, "ww");
  const mon = selWS
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const headerLabel = `Wk#${wkNum}, ${mon} ${selWS.getDate()}-${selWE.getDate()}`;

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
          {journalId ? `Editing ${headerLabel}` : `Viewing ${headerLabel}`}
        </span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gray-400 flex-shrink-0"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 8v1M12 11v5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 w-full">
        <button
          onClick={() => setPageOffset((v) => v - 1)}
          className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-all shadow-sm text-lg outline-none"
        >
          ‹
        </button>

        <div className="flex-1 flex flex-col items-center w-full">
          {/* Changed to grid-cols-6 because the WeeklyStrip shows 6 weeks at a time */}
          <div className="grid grid-cols-6 gap-1 sm:gap-2.5 w-full max-w-[500px] mx-auto">
            {weekCells.map((ws, i) => {
              const status = getStatus(ws);
              const isSelected = isSameWeekW(ws, selectedDate);
              const isFilled = status === "filled";
              const isMissed = status === "missed";
              const isUpcoming = status === "upcoming";

              const we = new Date(ws);
              we.setDate(we.getDate() + 6);
              const monthStr = ws
                .toLocaleDateString("en-US", { month: "short" })
                .toUpperCase();
              const rangeStr = `${monthStr} ${ws.getDate()}-${we.getDate()}`;
              const wkLabel = `WK#${format(ws, "ww")}`;

              return (
                <button
                  key={i}
                  onClick={() => onDateChange(ws)}
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
                  <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wide opacity-90 leading-none mt-1">
                    {wkLabel}
                  </span>
                  {/* Smaller font size here compared to daily to fit the date range */}
                  <span className="text-[12px] sm:text-[13px] font-extrabold leading-tight mt-1 sm:mt-1.5 mb-1 sm:mb-1.5 text-center px-1">
                    {rangeStr}
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
          onClick={() => setPageOffset((v) => v + 1)}
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 py-8 shadow-sm animate-pulse">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-pink-100 flex items-center justify-center mb-3">
          <CalendarIcon className="h-5 w-5 text-pink-300" strokeWidth={2} />
        </div>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 py-8 shadow-sm">
        <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-pink-100 flex items-center justify-center mb-3">
          <CalendarIcon className="h-5 w-5 text-pink-400" strokeWidth={2} />
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
        <button
          onClick={() => navigate("/people")}
          className="text-[13px] font-medium text-[#1E293B] hover:text-[#0F172A] transition-colors"
        >
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

// ── Past Journal Card ─────────────────────────────────────────────────────────
interface PastJournalCardProps {
  journal: PastWeeklyJournal;
  onDelete: (id: number, e: React.MouseEvent) => void;
  onEdit: (journal: PastWeeklyJournal) => void;
}

const PastJournalCard = ({
  journal,
  onDelete,
  onEdit,
}: PastJournalCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const weekStart = new Date(journal.start_date);
  const balanceRating =
    journal.data?.life_balance_rating ?? journal.alignment_score ?? null;

  const winsByDay: Record<
    string,
    { description: string; completed: boolean }[]
  > = {};
  if (journal.data?.wins) {
    for (const win of journal.data.wins) {
      if (!winsByDay[win.day]) winsByDay[win.day] = [];
      winsByDay[win.day].push({
        description: win.description,
        completed: win.completed,
      });
    }
  }

  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const sortedDays = Object.keys(winsByDay).sort(
    (a, b) => dayOrder.indexOf(b) - dayOrder.indexOf(a),
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-violet-500" />
          <span className="font-bold text-gray-900 text-[15px]">
            Week of {format(weekStart, "MMMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {balanceRating !== null && (
            <span className="bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1 rounded-full text-xs font-semibold">
              Balance {balanceRating}/10
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(journal);
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => onDelete(journal.id, e)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {(sortedDays.length > 0 || journal.data?.weekly_story) && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-blue-800 text-[15px]">
                  My Weekly Story
                </span>
              </div>
              {sortedDays.length > 0 ? (
                <div className="space-y-3 pl-1">
                  {sortedDays.map((day) => (
                    <div key={day}>
                      <p className="text-sm font-bold text-blue-700 mb-1">
                        **{day}**
                      </p>
                      {winsByDay[day].map((win, i) => (
                        <div key={i} className="flex items-start gap-2 ml-2">
                          <CheckSquare className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-blue-900">
                            {win.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : journal.data?.weekly_story ? (
                <p className="text-sm text-blue-900 leading-relaxed pl-1">
                  {journal.data.weekly_story}
                </p>
              ) : null}
            </div>
          )}

          {journal.data?.wins && journal.data.wins.length > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50/60 p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-green-800 text-[15px]">
                  Achievements This Week
                </span>
              </div>
              <div className="space-y-3 pl-1">
                {journal.data.wins.map((win, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-green-700 capitalize">
                        {win.category}
                      </p>
                      <p className="text-sm text-green-900">
                        {win.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {journal.data?.biggest_challenge && (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50/60 p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center shadow-sm">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-orange-800 text-[15px]">
                  Biggest Challenge
                </span>
              </div>
              <p className="text-sm text-orange-900 pl-1 leading-relaxed">
                {journal.data.biggest_challenge}
              </p>
              {journal.data.challenge_cause && (
                <p className="text-xs text-orange-700 mt-2 pl-1 border-t border-yellow-200 pt-2">
                  <span className="font-semibold">Cause:</span>{" "}
                  {journal.data.challenge_cause}
                </p>
              )}
            </div>
          )}

          {journal.data?.key_insight && (
            <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-4">
              <p className="text-xs font-bold text-pink-700 mb-1">
                Key Insight
              </p>
              <p className="text-sm text-gray-700 italic">
                "{journal.data.key_insight}"
              </p>
            </div>
          )}

          {journal.gratitude_note && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <p className="text-xs font-bold text-amber-700 mb-1">Gratitude</p>
              <p className="text-sm text-gray-700 italic">
                "{journal.gratitude_note}"
              </p>
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
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [journalId, setJournalId] = useState<number | null>(null);

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

  // ✅ CHANGE 1: Future week check
  const isFutureWeek =
    startOfWeek(currentDate, { weekStartsOn: 0 }) >
    startOfWeek(new Date(), { weekStartsOn: 0 });

  // ── Save Plan ──
  const handleSavePlan = async () => {
    // ✅ CHANGE 2: Block future week save + show toast
    if (isFutureWeek) {
      toast({
        title: "Cannot Create Future Entry",
        description:
          "You can only create journal entries for today or past dates.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const startDate = format(
        startOfWeek(currentDate, { weekStartsOn: 0 }),
        "yyyy-MM-dd",
      );
      const endDate = format(
        endOfWeek(currentDate, { weekStartsOn: 0 }),
        "yyyy-MM-dd",
      );

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

      const url = journalId ? `/user_journals/${journalId}` : `/user_journals`;
      const method = journalId ? "PUT" : "POST";
      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error("🚨 Backend error:", errorData);
        throw new Error(`Failed to save weekly journal: ${res.status}`);
      }

      const responseData = await res.json();
      const newId =
        responseData.journal?.id ??
        responseData.user_journal?.id ??
        responseData.id;
      if (newId) setJournalId(newId);

      localStorage.setItem(`weekly_wins_${startDate}`, JSON.stringify(wins));

      if (journalId) {
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

      toast({
        title: journalId ? "Weekly plan updated ✅" : "Weekly plan saved ✅",
        description: `Plan for week ${format(currentDate, "MMMM d")} ${journalId ? "updated" : "saved"} successfully.`,
      });

      fetchPastJournals();
    } catch (error) {
      console.error("Save weekly journal error:", error);
      toast({
        title: "Error saving journal",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Fetch journal for date ──
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
              setGratitude(data.gratitude_note || "");
              setBalanceRating(
                data.data?.life_balance_rating ?? data.alignment_score ?? 3,
              );
              setChallenge(data.data?.biggest_challenge || "");
              setChallengeCause(data.data?.challenge_cause || "");
              setInsight(data.data?.key_insight || "");
              setWins(data.data?.wins || []);
              setMissionText(data.data?.mission_connection || "");
              setHabitsText(data.data?.weekly_story || "");
              setWeeklyPlanData(
                data.data?.weekly_plan || generateEmptyWeekData(currentDate),
              );
              setFocusData(data.data?.focus_and_boundaries || defaultFocusData);
              return;
            }
          }

          setJournalId(null);
          setGratitude("");
          setBalanceRating(3);
          setChallenge("");
          setChallengeCause("");
          setInsight("");
          setWins([]);
          setMissionText("");
          setHabitsText("");
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

  useEffect(() => {
    fetchPastJournals();
  }, [token]);
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
          const raw: any[] = Array.isArray(data)
            ? data
            : Array.isArray(data.goals)
              ? data.goals
              : Array.isArray(data.data)
                ? data.data
                : [];
          const normalized: Goal[] = raw.map((g) => ({
            ...g,
            id: String(g.id),
            status:
              (g.status === "in_progress" ? "progress" : g.status) ||
              "planning",
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
    setGratitude(journal.gratitude_note || "");
    setBalanceRating(
      journal.data?.life_balance_rating ?? journal.alignment_score ?? 3,
    );
    setChallenge(journal.data?.biggest_challenge || "");
    setChallengeCause(journal.data?.challenge_cause || "");
    setInsight(journal.data?.key_insight || "");
    setWins(journal.data?.wins ?? []);
    setMissionText(journal.data?.mission_connection || "");
    setHabitsText(journal.data?.weekly_story || "");
    if (journal.data?.weekly_plan) setWeeklyPlanData(journal.data.weekly_plan);
    if (journal.data?.focus_and_boundaries)
      setFocusData(journal.data.focus_and_boundaries);
    toast({
      title: "Editing journal",
      description: `Loaded journal for week of ${format(new Date(journal.start_date), "MMMM d, yyyy")}. Save to update.`,
    });
  };

  const handleDeletePastJournal = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this weekly journal entry?",
      )
    )
      return;
    try {
      const res = await apiRequest(`/user_journals/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast({
        title: "Deleted",
        description: "Weekly journal entry removed successfully.",
      });
      setPastJournals((prev) => prev.filter((j) => j.id !== id));
      if (journalId === id) setJournalId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete journal entry.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative w-full animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Weekly Journal</h1>
          <p className="text-sm text-muted-foreground">
            Strategic review and planning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-100"
          >
            <HelpCircle className="h-4 w-4" /> Help?
          </button>
        </div>
      </div>

      <div className="w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full p-1 bg-gray-100 border border-gray-200 rounded-xl h-auto shadow-inner flex">
            <TabsTrigger
              value="new"
              className="flex-1 py-2.5 rounded-lg text-sm font-bold data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border data-[state=active]:border-red-200 data-[state=active]:shadow-sm transition-all text-red-500"
            >
              New
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border data-[state=active]:border-red-200 data-[state=active]:shadow-sm transition-all text-red-500"
            >
              Past ({pastJournals.length})
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border data-[state=active]:border-red-200 data-[state=active]:shadow-sm transition-all text-red-500"
            >
              Insights
            </TabsTrigger>
          </TabsList>

          {/* ── NEW TAB ── */}
          <TabsContent value="new" className="focus:outline-none">
            <div className="flex flex-col w-full gap-6">
              <WeeklyStrip
                selectedDate={currentDate}
                onDateChange={(newDate) => setCurrentDate(newDate)}
                filledWeekStarts={filledWeekStarts}
                journalId={journalId}
              />
              <div className="border-2 border-orange-300 bg-white rounded-2xl overflow-hidden shadow-sm">
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
              <div className="border-2 border-purple-300 bg-purple-50/20 rounded-2xl overflow-hidden">
                <MissionHabitsConnection
                  currentDate={currentDate}
                  coreValue={coreValue}
                  setCoreValue={setCoreValue}
                  missionText={missionText}
                  setMissionText={setMissionText}
                  habitsText={habitsText}
                  setHabitsText={setHabitsText}
                />
              </div>
              <div className="border-2 border-red-300 bg-red-50/20 rounded-2xl overflow-hidden">
                <WeeklyPlanComponent
                  data={weeklyPlanData}
                  setData={setWeeklyPlanData}
                />
              </div>
              <div className="border-2 border-violet-300 bg-violet-50/20 rounded-2xl overflow-hidden">
                <FocusAndBoundaries
                  data={focusData}
                  setData={setFocusData}
                  apiGoals={goals}
                />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <BucketListProgress />
              </div>
              <PeopleUpcomingDates />
            </div>
          </TabsContent>

          {/* ── PAST TAB ── */}
          <TabsContent value="past" className="focus:outline-none">
            {isLoadingPast ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <p className="text-gray-500 font-medium">
                    Loading past entries...
                  </p>
                </div>
              </div>
            ) : pastJournals.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-medium">
                  No past entries yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pastJournals.map((journal) => (
                  <PastJournalCard
                    key={journal.id}
                    journal={journal}
                    onDelete={handleDeletePastJournal}
                    onEdit={handleEditPastJournal}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── INSIGHTS TAB ── */}
          <TabsContent value="insights" className="focus:outline-none">
            <div className="space-y-4">
              <div
                className="rounded-2xl px-6 py-5"
                style={{
                  background:
                    "linear-gradient(135deg, #FFF3E0 0%, #FCE4EC 50%, #EDE7F6 100%)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Lightbulb className="w-5 h-5 text-violet-500" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Weekly Challenges &amp; Key Insights
                  </h2>
                </div>
                <p className="text-sm text-gray-500 ml-7">
                  Review your weekly challenges and learnings over time
                </p>
              </div>

              {isLoadingPast ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Loader2 className="w-7 h-7 animate-spin text-violet-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    Loading insights...
                  </p>
                </div>
              ) : pastJournals.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-4xl mb-3">💡</div>
                  <p className="text-gray-500 font-medium">
                    Complete a journal to see insights.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastJournals.map((journal) => {
                    const weekStart = new Date(journal.start_date);
                    const balanceVal =
                      journal.data?.life_balance_rating ??
                      journal.alignment_score ??
                      null;
                    return (
                      <div
                        key={journal.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-bold text-gray-900 text-[15px]">
                              Week of {format(weekStart, "MMMM d, yyyy")}
                            </span>
                          </div>
                          {balanceVal !== null && (
                            <span className="border border-blue-200 text-blue-700 bg-white px-3 py-0.5 rounded-full text-xs font-semibold">
                              Balance: {balanceVal}/10
                            </span>
                          )}
                        </div>
                        <div className="px-5 py-4 space-y-4">
                          {journal.data?.biggest_challenge && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-bold text-gray-800">
                                  Biggest Challenge
                                </span>
                              </div>
                              <div className="bg-red-50/60 border border-red-100 rounded-xl px-4 py-3">
                                <p className="text-sm text-gray-700">
                                  {journal.data.biggest_challenge}
                                </p>
                                {journal.data.challenge_cause && (
                                  <p className="text-xs text-gray-500 mt-1.5 border-t border-red-100 pt-1.5">
                                    <span className="font-semibold">
                                      Cause:
                                    </span>{" "}
                                    {journal.data.challenge_cause}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          {journal.data?.biggest_challenge &&
                            journal.data?.wins &&
                            journal.data.wins.length > 0 && (
                              <div className="border-t border-gray-100" />
                            )}
                          {journal.data?.wins &&
                            journal.data.wins.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-bold text-gray-800">
                                    Top Wins This Week
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  {journal.data.wins.map((win, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2"
                                    >
                                      <div className="mt-1 w-2.5 h-2.5 rounded-sm bg-green-400 shrink-0" />
                                      <div>
                                        <span className="text-xs font-semibold text-green-700 capitalize mr-1.5">
                                          {win.category}
                                        </span>
                                        <span className="text-sm text-gray-700">
                                          {win.description}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          {journal.data?.key_insight && (
                            <>
                              <div className="border-t border-gray-100" />
                              <div>
                                <p className="text-xs font-bold text-violet-600 mb-1.5 uppercase tracking-wide">
                                  Key Insight
                                </p>
                                <p className="text-sm text-gray-700 italic">
                                  "{journal.data.key_insight}"
                                </p>
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

      {/* ✅ CHANGE 3: Save button — disabled + gray when future week */}
      {activeTab === "new" && (
        <div className="z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] p-4 flex justify-center">
          <div className="w-full flex justify-end gap-3 px-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-red-200 bg-white text-red-700 font-semibold text-sm hover:bg-red-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePlan}
              disabled={isSaving || isFutureWeek}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:bg-gray-400"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
              )}
              {isSaving
                ? "Saving..."
                : journalId
                  ? `Update Plan WK#${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "ww")} ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d")}-${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "d")}`
                  : `Save Plan WK#${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "ww")} ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d")}-${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "d")}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyJournal;
