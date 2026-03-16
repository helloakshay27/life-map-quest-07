import { useState, useEffect } from "react";
import {
  HelpCircle,
  Loader2,
  Lightbulb,
  Trash2,
  CalendarIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/config/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import WeekStrip from "@/components/journal/WeekStrip";
import { subDays, startOfWeek, endOfWeek, format, isSameWeek } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import WeeklyReflection, { Win } from "@/components/WeeklyReflection";
import MissionHabitsConnection from "@/components/MissionHabitsConnection";
import WeeklyPlanComponent, { generateEmptyWeekData } from "@/components/WeeklyPlanComponent";
import FocusAndBoundaries, { FocusData, defaultFocusData } from "@/components/FocusAndBoundaries";
import ReviewToDos from "@/components/ReviewToDos";
import BucketListProgress from "@/components/BucketListProgress";

const WeeklyJournal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new");
  const [currentDate, setCurrentDate] = useState(new Date());
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [journalId, setJournalId] = useState<number | null>(null);

  // States lifted from WeeklyReflection
  const [challenge, setChallenge] = useState("");
  const [challengeCause, setChallengeCause] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [insight, setInsight] = useState("");
  const [balanceRating, setBalanceRating] = useState(3);
  const [wins, setWins] = useState<Win[]>([]);

  // States lifted from MissionHabitsConnection
  const [coreValue, setCoreValue] = useState("");
  const [missionText, setMissionText] = useState("");
  const [habitsText, setHabitsText] = useState("");
  
  // States lifted from WeeklyPlanComponent
  const [weeklyPlanData, setWeeklyPlanData] = useState(generateEmptyWeekData());

  // States lifted from FocusAndBoundaries
  const [focusData, setFocusData] = useState<FocusData>(defaultFocusData);

  const [insightsData, setInsightsData] = useState<{
    total_weeks?: number;
    average_life_balance?: number;
    alignment_average?: number;
    most_productive_day?: [string, number];
    common_challenges?: [string, number][];
    category_distribution?: Record<string, number>;
    gratitude_highlights?: string[];
    message?: string;
    hint?: string;
    [key: string]: unknown;
  } | null>(null);

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

  const [pastJournals, setPastJournals] = useState<PastWeeklyJournal[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState(false);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // === INSIGHTS STATE ===
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [selectedPastJournal, setSelectedPastJournal] =
    useState<PastWeeklyJournal | null>(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isLoadingJournal, setIsLoadingJournal] = useState(false);

  const myFilledDates = [
    new Date(), // Today
    subDays(new Date(), 2), // 2 days ago
    subDays(new Date(), 4), // 4 days ago
  ];

  // ==========================================
  // 🚨 FIXED SAVE PLAN LOGIC
  // ==========================================
  const handleSavePlan = async () => {
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
            wins: wins,
            biggest_challenge: challenge,
            challenge_cause: challengeCause,
            key_insight: insight,
            mission_connection: missionText,
            life_balance_rating: balanceRating,
            weekly_plan: weeklyPlanData,
            focus_and_boundaries: focusData
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
        console.error("🚨 Payload sent:", JSON.stringify(payload, null, 2));
        throw new Error(`Failed to save weekly journal: ${res.status}`);
      }

      const responseData = await res.json();

      // Capture the id returned by the API for subsequent PUT calls
      const newId =
        responseData.journal?.id ??
        responseData.user_journal?.id ??
        responseData.id;
      if (newId) setJournalId(newId);

      toast({
        title: "Weekly plan saved ✅",
        description: `Plan for week ${format(currentDate, "MMMM d")} saved successfully.`,
      });
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

  // Fetch journal dynamically based on the active currentDate
  useEffect(() => {
    if (activeTab === "new") {
      const fetchJournalForDate = async () => {
        try {
          const formattedDate = format(currentDate, "yyyy-MM-dd");
          const res = await apiRequest(`/user_journals/0?date=${formattedDate}&journal_type=weekly`);
          
          if (res.ok) {
            const data = await res.json();
            
            // If data exists, populate the form
            if (data.id) {
              setJournalId(data.id);
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
          
          // If no journal is returned (e.g. 404 or empty response), reset the form for a fresh entry
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

  useEffect(() => {
    if (activeTab === "insights") {
      const fetchInsights = async () => {
        setIsLoadingInsights(true);
        try {
          const res = await apiRequest(
            "/user_journals/weekly_journals_insights",
          );

          if (res.ok) {
            const data = await res.json();

            if (Array.isArray(data) || data.insights || data.data) {
              const rawInsights = Array.isArray(data)
                ? data
                : data.insights || data.data || [];
              const formattedInsights = rawInsights.map(
                (
                  i:
                    | string
                    | { insight?: string; message?: string; content?: string },
                ) =>
                  typeof i === "string"
                    ? i
                    : i.insight || i.message || i.content || JSON.stringify(i),
              );
              setInsights(formattedInsights);
            } else {
              setInsightsData(data);
            }
          } else {
            console.error("Failed to fetch insights");
          }
        } catch (error) {
          console.error("Error fetching insights:", error);
        } finally {
          setIsLoadingInsights(false);
        }
      };

      fetchInsights();
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab === "past") {
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
      fetchPastJournals();
    }
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

  const fetchPastJournalById = async (id: number) => {
    setIsJournalModalOpen(true);
    setIsLoadingJournal(true);
    try {
      const res = await apiRequest(`/user_journals/${id}?journal_type=weekly`);
      const data = await res.json();
      setSelectedPastJournal(data);
    } catch (error) {
      console.error("Failed to fetch detailed journal", error);
      toast({
        title: "Error",
        description: "Could not load journal details.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingJournal(false);
    }
  };

  const handleEditPastJournal = () => {
    if (!selectedPastJournal) return;
    
    // Set active tab to 'new' (which is the form)
    setActiveTab("new");
    setIsJournalModalOpen(false);
    
    // Populate form data
    setJournalId(selectedPastJournal.id);
    setCurrentDate(new Date(selectedPastJournal.start_date));
    
    // Reflection
    setGratitude(selectedPastJournal.gratitude_note || "");
    setBalanceRating(selectedPastJournal.data?.life_balance_rating ?? selectedPastJournal.alignment_score ?? 3);
    setChallenge(selectedPastJournal.data?.biggest_challenge || "");
    setChallengeCause(selectedPastJournal.data?.challenge_cause || "");
    setInsight(selectedPastJournal.data?.key_insight || "");
    
    if (selectedPastJournal.data?.wins) {
      setWins(selectedPastJournal.data.wins);
    } else {
      setWins([]);
    }

    // Mission & Habits
    setMissionText(selectedPastJournal.data?.mission_connection || "");
    setHabitsText(selectedPastJournal.data?.weekly_story || "");
    
    // Weekly Plan and Focus & Boundaries
    if (selectedPastJournal.data?.weekly_plan) {
      setWeeklyPlanData(selectedPastJournal.data.weekly_plan);
    }
    if (selectedPastJournal.data?.focus_and_boundaries) {
      setFocusData(selectedPastJournal.data.focus_and_boundaries);
    }
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

      if (!res.ok) throw new Error("Failed to delete weekly journal");

      toast({
        title: "Deleted",
        description: "Weekly journal entry removed successfully.",
      });

      setPastJournals((prev) => prev.filter((j) => j.id !== id));

      if (journalId === id) {
        setJournalId(null);
      }
    } catch (error) {
      console.error("Failed to delete journal", error);
      toast({
        title: "Error",
        description: "Could not delete journal entry.",
        variant: "destructive",
      });
    }
  };

  // Reset form when clicking "New" tab explicitly
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "new" && journalId !== null) {
      // Optional: reset to a fresh blank slate when they manually click the 'New' tab
      // uncomment the lines below if you want "New" to always be explicitly new
      // setJournalId(null);
      // setChallenge("");
      // ... reset others
    }
  };

  return (
    <div className="relative w-full animate-fade-in space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Weekly Journal</h1>
            <p className="text-sm text-muted-foreground">Strategic review and planning</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/help")}
              className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-100"
              title="Help"
            >
              <HelpCircle className="h-4 w-4" />
              Help?
            </button>
          </div>
        </div>
      <div className="w-full">

        {/* Tabs Area */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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

          {/* NEW TAB CONTENT */}
          <TabsContent value="new" className="focus:outline-none">
            <div className="flex flex-col w-full gap-6">
              {/* Week Strip */}
              <div>
                <WeekStrip
                  selectedDate={currentDate}
                  onDateChange={(newDate) => setCurrentDate(newDate)}
                  filledDates={myFilledDates}
                />
              </div>

              {/* Weekly Reflection */}
              <div className="border-2 border-orange-300 bg-orange-50/20 rounded-2xl overflow-hidden">
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
                />
              </div>

              {/* Mission & Habits Connection */}
              <div className="border-2 border-purple-300 bg-purple-50/20 rounded-2xl overflow-hidden">
                <MissionHabitsConnection
                  coreValue={coreValue}
                  setCoreValue={setCoreValue}
                  missionText={missionText}
                  setMissionText={setMissionText}
                  habitsText={habitsText}
                  setHabitsText={setHabitsText}
                />
              </div>

              {/* Weekly Plan */}
              <div className="border-2 border-red-300 bg-red-50/20 rounded-2xl overflow-hidden">
                <WeeklyPlanComponent data={weeklyPlanData} setData={setWeeklyPlanData} />
              </div>

              {/* Focus & Boundaries */}
              <div className="border-2 border-violet-300 bg-violet-50/20 rounded-2xl overflow-hidden">
                <FocusAndBoundaries data={focusData} setData={setFocusData} apiGoals={goals} />
              </div>

              {/* Review ToDos */}
              <div className="border-2 border-indigo-300 bg-indigo-50/20 rounded-2xl overflow-hidden">
                <ReviewToDos initialGoals={goals} />
              </div>

              {/* Bucket List Progress */}
              <div className="rounded-2xl overflow-hidden">
                <BucketListProgress />
              </div>
            </div>
          </TabsContent>

          {/* PAST TAB CONTENT */}
          <TabsContent value="past" className="focus:outline-none">
            {/* Calendar Date Picker */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold text-sm shadow-sm hover:bg-red-100 transition-colors">
                    <CalendarIcon className="w-4 h-4" />
                    {calendarDate
                      ? format(calendarDate, "MMMM d, yyyy")
                      : "Pick a date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={(date) => {
                      setCalendarDate(date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {calendarDate && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-800 font-semibold text-sm">
                    <CalendarIcon className="w-4 h-4 text-green-600" />
                    <span>Selected: <span className="text-green-700 font-bold">{format(calendarDate, "EEEE, MMMM d, yyyy")}</span></span>
                  </div>
                  <button
                    onClick={() => setCalendarDate(undefined)}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-500 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {isLoadingPast ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <p className="text-gray-500 font-medium">Loading past entries...</p>
                </div>
              </div>
            ) : pastJournals.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-medium">No past entries yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pastJournals
                  .filter((journal) => {
                    if (!calendarDate) return true;
                    return isSameWeek(new Date(journal.start_date), calendarDate, { weekStartsOn: 0 });
                  })
                  .map((journal) => (
                  <div
                    key={journal.id}
                    onClick={() => fetchPastJournalById(journal.id)}
                    className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all text-left cursor-pointer hover:border-gray-300 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {journal.formatted_date ||
                            format(
                              new Date(journal.start_date),
                              "MMMM d, yyyy",
                            )}
                        </h4>
                        {journal.alignment_score !== null && (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-2 inline-block">
                            Alignment: {journal.alignment_score}/10
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeletePastJournal(journal.id, e)}
                        className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {journal.data?.key_insight && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700">
                          Key Insight:
                        </p>
                        <p className="text-sm text-gray-600 italic">
                          "{journal.data.key_insight}"
                        </p>
                      </div>
                    )}
                    {journal.data?.biggest_challenge && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700">
                          Biggest Challenge:
                        </p>
                        <p className="text-sm text-gray-600">
                          {journal.data.biggest_challenge}
                        </p>
                        {journal.data?.challenge_cause && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium text-gray-700">Cause:</span> {journal.data.challenge_cause}
                          </p>
                        )}
                      </div>
                    )}
                    {journal.data?.wins && journal.data.wins.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Wins:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {journal.data.wins.map((win, idx) => (
                            <li key={idx}>
                              <strong>{win.day}</strong>: {win.description}{" "}
                              {win.completed ? "✅" : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                {calendarDate && pastJournals.filter((j) =>
                  isSameWeek(new Date(j.start_date), calendarDate, { weekStartsOn: 0 })
                ).length === 0 && (
                  <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No journal found for the week of</p>
                    <p className="text-gray-700 font-bold mt-1">{format(calendarDate, "MMMM d, yyyy")}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* INSIGHTS TAB CONTENT */}
          <TabsContent value="insights" className="focus:outline-none">
            {isLoadingInsights ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#c69cf4]" />
                  <p className="text-gray-500 font-medium">
                    Generating your insights...
                  </p>
                </div>
              </div>
            ) : insights.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[300px]">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                  <Lightbulb className="w-6 h-6 text-[#c69cf4]" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Weekly Insights
                  </h2>
                </div>
                <div className="space-y-4">
                  {insights.map((insightItem, index) => (
                    <div
                      key={index}
                      className="p-5 bg-gray-50/80 rounded-xl border border-gray-100 text-gray-800 font-medium text-[15px] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      {insightItem}
                    </div>
                  ))}
                </div>
              </div>
            ) : insightsData?.total_weeks ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      Total Weeks
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {insightsData.total_weeks}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      Avg Alignment
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {insightsData.alignment_average?.toFixed(1) || "-"}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      Avg Balance
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {insightsData.average_life_balance?.toFixed(1) || "-"}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-semibold text-gray-500 mb-1">
                      Top Day
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {insightsData.most_productive_day?.[0] || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insightsData.common_challenges &&
                    insightsData.common_challenges.length > 0 && (
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Common Challenges
                        </h3>
                        <ul className="space-y-3">
                          {insightsData.common_challenges.map(
                            (challenge: [string, number], idx: number) => (
                              <li
                                key={idx}
                                className="flex justify-between items-center text-gray-700"
                              >
                                <span>{challenge[0]}</span>
                                <span className="bg-gray-100 px-2.5 py-0.5 rounded-full text-sm font-medium">
                                  {challenge[1]}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {insightsData.category_distribution &&
                    Object.keys(insightsData.category_distribution).length > 0 && (
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Win Categories
                        </h3>
                        <ul className="space-y-3">
                          {Object.entries(insightsData.category_distribution).map(
                            ([category, count], idx: number) => (
                              <li
                                key={idx}
                                className="flex justify-between items-center text-gray-700"
                              >
                                <span className="capitalize">{category.replace("_", " ")}</span>
                                <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full text-sm font-medium border border-orange-200">
                                  {count}
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {insightsData.gratitude_highlights &&
                    insightsData.gratitude_highlights.length > 0 && (
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Gratitude Highlights
                        </h3>
                        <ul className="space-y-3">
                          {insightsData.gratitude_highlights.map(
                            (note: string, idx: number) => (
                              <li
                                key={idx}
                                className="text-gray-700 p-3 bg-pink-50/50 border border-pink-100 rounded-lg italic text-sm"
                              >
                                "{note}"
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            ) : insightsData?.message ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="mx-auto mb-4 text-5xl">💡</div>
                <p className="text-lg font-bold text-gray-900">
                  {insightsData.message}
                </p>
                {insightsData.hint && (
                  <p className="text-sm text-gray-500 mt-2">
                    {insightsData.hint}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-medium text-[15px]">
                  Complete a journal to see insights.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isJournalModalOpen} onOpenChange={setIsJournalModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center pr-6">
              <DialogTitle>Weekly Journal Entry</DialogTitle>
              {selectedPastJournal && (
                <button
                  onClick={handleEditPastJournal}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                  Edit Entry
                </button>
              )}
            </div>
            <DialogDescription>
              {selectedPastJournal?.formatted_date ||
                (selectedPastJournal?.start_date &&
                  format(
                    new Date(selectedPastJournal.start_date),
                    "MMMM d, yyyy",
                  ))}
            </DialogDescription>
          </DialogHeader>

          {isLoadingJournal ? (
            <div className="py-10 text-center text-gray-500">
              Loading details...
            </div>
          ) : selectedPastJournal ? (
            <div className="space-y-6 mt-4">
              {/* Date Range Banner */}
              {selectedPastJournal.start_date && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100">
                  <CalendarIcon className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm font-bold text-red-700">
                    Review of Past Week:{" "}
                    <span className="text-red-600">
                      {format(new Date(selectedPastJournal.start_date), "MMM d")} –{" "}
                      {format(endOfWeek(new Date(selectedPastJournal.start_date), { weekStartsOn: 0 }), "MMM d, yyyy")}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                {selectedPastJournal.alignment_score !== null && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                    Alignment: {selectedPastJournal.alignment_score}/10
                  </span>
                )}
                {selectedPastJournal.data?.life_balance_rating && (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-sm font-semibold">
                    Balance: {selectedPastJournal.data.life_balance_rating}/5
                  </span>
                )}
              </div>

              {selectedPastJournal.gratitude_note && (
                <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                  <p className="text-sm font-bold text-gray-800 mb-1">
                    Gratitude
                  </p>
                  <p className="text-gray-700 text-sm italic">
                    "{selectedPastJournal.gratitude_note}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPastJournal.data?.biggest_challenge && (
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-sm font-bold text-gray-800 mb-1">
                      Biggest Challenge
                    </p>
                    <p className="text-gray-700 text-sm">
                      {selectedPastJournal.data.biggest_challenge}
                    </p>
                    {selectedPastJournal.data?.challenge_cause && (
                      <p className="text-gray-500 text-xs mt-2 border-t border-indigo-100 pt-2">
                        Cause: {selectedPastJournal.data.challenge_cause}
                      </p>
                    )}
                  </div>
                )}

                {selectedPastJournal.data?.key_insight && (
                  <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                    <p className="text-sm font-bold text-gray-800 mb-1">
                      Key Insight
                    </p>
                    <p className="text-gray-700 text-sm">
                      {selectedPastJournal.data.key_insight}
                    </p>
                  </div>
                )}
              </div>

              {selectedPastJournal.data?.weekly_story && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm font-bold text-gray-800 mb-1">
                    My Weekly Story for{" "}
                    {selectedPastJournal.start_date && (
                      <span className="text-gray-600 font-semibold">
                        {format(new Date(selectedPastJournal.start_date), "MMM d")} –{" "}
                        {format(endOfWeek(new Date(selectedPastJournal.start_date), { weekStartsOn: 0 }), "MMM d, yyyy")}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {selectedPastJournal.data.weekly_story}
                  </p>
                </div>
              )}

              {selectedPastJournal.data?.mission_connection && (
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-sm font-bold text-gray-800 mb-1">
                    Mission Connection
                  </p>
                  <p className="text-gray-700 text-sm">
                    {selectedPastJournal.data.mission_connection}
                  </p>
                </div>
              )}

              {selectedPastJournal.data?.wins &&
                selectedPastJournal.data.wins.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-3">
                      Weekly Wins
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedPastJournal.data.wins.map((win, i) => (
                        <div
                          key={i}
                          className="flex gap-3 p-3 border border-gray-100 rounded-lg bg-white shadow-sm"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                              {win.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {win.day} • {win.category}
                            </p>
                          </div>
                          {win.completed && (
                            <div className="flex-shrink-0 flex items-center justify-center">
                              <span className="text-green-500 text-xl">✅</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* STICKY FOOTER - Save / Cancel (ONLY FOR NEW TAB) */}
      {activeTab === "new" && (
        <div className=" z-30 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-red-200 bg-white text-red-700 font-semibold text-sm hover:bg-red-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePlan}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
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
                : `Save Plan WK#${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "ww")} ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d")}-${format(endOfWeek(currentDate, { weekStartsOn: 0 }), "d")}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyJournal;