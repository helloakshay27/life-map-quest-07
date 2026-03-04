import { useState, useEffect } from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeekStrip from "@/components/journal/WeekStrip";
import { subDays, startOfWeek, endOfWeek, format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import WeeklyReflection from "@/components/WeeklyReflection";
import MissionHabitsConnection from "@/components/MissionHabitsConnection";
import WeeklyPlanComponent from "@/components/WeeklyPlanComponent";
import FocusAndBoundaries from "@/components/FocusAndBoundaries";
import ReviewToDos from "@/components/ReviewToDos";
import BucketListProgress from "@/components/BucketListProgress";

const WeeklyJournal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new");

  const [currentDate, setCurrentDate] = useState(new Date());
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // States lifted from WeeklyReflection
  const [challenge, setChallenge] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [insight, setInsight] = useState("");
  const [balanceRating, setBalanceRating] = useState(3);

  // States lifted from MissionHabitsConnection
  const [coreValue, setCoreValue] = useState("");
  const [missionText, setMissionText] = useState("");
  const [habitsText, setHabitsText] = useState("");

  const [insightsData, setInsightsData] = useState<{
    total_weeks?: number;
    average_life_balance?: number;
    alignment_average?: number;
    most_productive_day?: [string, number];
    common_challenges?: [string, number][];
    gratitude_highlights?: string[];
    message?: string;
    hint?: string;
    [key: string]: unknown;
  } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  interface PastWeeklyJournal {
    id: number;
    journal_type: string;
    start_date: string;
    formatted_date?: string;
    energy_score: number | null;
    alignment_score: number | null;
    affirmation: string | null;
    priorities: string[] | null;
    data?: {
      key_insight?: string;
      weekly_story?: string;
      mission_connection?: string;
      biggest_challenge?: string;
      life_balance_rating?: number;
      wins?: {
        day: string;
        category: string;
        description: string;
        completed: boolean;
      }[];
    };
  }
  const [pastJournals, setPastJournals] = useState<PastWeeklyJournal[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState(false);

  const myFilledDates = [
    new Date(), // Today
    subDays(new Date(), 2), // 2 days ago
    subDays(new Date(), 4), // 4 days ago
  ];

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
        journal: {
          user_id: user?.id ? parseInt(user.id, 10) : 1,
          journal_type: "weekly",
          start_date: startDate,
          end_date: endDate,
          description: null,
          gratitude_note: gratitude,
          alignment_score: balanceRating,
          data: {
            weekly_story: habitsText, // Mapping narrative blocks
            wins: [],
            biggest_challenge: challenge,
            challenge_cause: challenge,
            key_insight: insight,
            mission_connection: missionText,
            life_balance_rating: balanceRating,
          },
        },
      };

      const res = await fetch("https://life-api.lockated.com/user_journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save weekly journal");

      toast({
        title: "Weekly plan saved ✅",
        description: `Plan for week ${format(currentDate, "MMMM d")} saved successfully.`,
      });
    } catch (error) {
      console.error("Save weekly journal error:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your weekly plan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === "insights") {
      const fetchInsights = async () => {
        setIsLoadingInsights(true);
        try {
          const res = await fetch(
            "https://life-api.lockated.com/user_journals/weekly_journals_insights",
            {
              headers: {
                Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
              },
            },
          );
          const data = await res.json();
          setInsightsData(data);
        } catch (error) {
          console.error("Failed to fetch insights", error);
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
          const res = await fetch(
            "https://life-api.lockated.com/user_journals?journal_type=weekly",
            {
              headers: {
                Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
              },
            },
          );
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

  return (
    <div className="min-h-screen bg-[#fdfbf9] animate-fade-in font-sans relative pb-24">
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header Area */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Weekly Journal
              </h1>
              <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
                Strategic review and planning
              </p>
            </div>
          </div>

          <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 bg-white/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-all mt-2">
            <HelpCircle className="h-4 w-4" /> Help
          </button>
        </div>

        {/* Tabs Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-10 w-full p-1.5 bg-gray-100/80 border border-gray-200/60 rounded-xl h-auto shadow-inner">
            <TabsTrigger
              value="new"
              className="flex-1 py-2.5 rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide"
            >
              New
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide"
            >
              Past (0)
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide"
            >
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="focus:outline-none">
            <div className="flex flex-col w-full space-y-12">
              <WeekStrip
                selectedDate={currentDate}
                onDateChange={(newDate) => setCurrentDate(newDate)}
                filledDates={myFilledDates}
              />

              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <WeeklyReflection
                  challenge={challenge}
                  setChallenge={setChallenge}
                  gratitude={gratitude}
                  setGratitude={setGratitude}
                  insight={insight}
                  setInsight={setInsight}
                  balanceRating={balanceRating}
                  setBalanceRating={setBalanceRating}
                />
              </div>

              <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <MissionHabitsConnection
                  coreValue={coreValue}
                  setCoreValue={setCoreValue}
                  missionText={missionText}
                  setMissionText={setMissionText}
                  habitsText={habitsText}
                  setHabitsText={setHabitsText}
                />
              </div>

              <WeeklyPlanComponent />

              <FocusAndBoundaries />

              <ReviewToDos />

              <BucketListProgress />
            </div>
          </TabsContent>

          <TabsContent value="past" className="focus:outline-none">
            {isLoadingPast ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-medium">
                  Loading past entries...
                </p>
              </div>
            ) : pastJournals.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-medium">
                  No past entries yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastJournals.map((journal) => (
                  <div
                    key={journal.id}
                    className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all text-left"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-lg text-gray-900">
                        {journal.formatted_date ||
                          format(new Date(journal.start_date), "MMMM d, yyyy")}
                      </h4>
                      {journal.alignment_score !== null && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          Alignment: {journal.alignment_score}/10
                        </span>
                      )}
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="focus:outline-none">
            {isLoadingInsights ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-medium">Loading insights...</p>
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
                <p className="text-gray-500 font-medium">
                  Complete a journal to see insights.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* EXACT STICKY FOOTER FROM SCREENSHOT */}
      <div className=" bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-5xl mx-auto flex items-center justify-end gap-3 px-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-[#0f4c81] font-semibold text-[15px] hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSavePlan}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#c69cf4] hover:bg-[#b58ce3] text-white font-bold text-[15px] transition-colors shadow-sm disabled:opacity-50"
          >
            {/* Custom SVG Save Icon matching your image */}
            <svg
              className="w-5 h-5"
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
            {isSaving ? "Saving..." : "Save Plan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyJournal;
