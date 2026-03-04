import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, HelpCircle, Plus, Calendar, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import WeekStrip from "@/components/journal/WeekStrip";
import AddAchievementDialog from "@/components/journal/AddAchievementDialog";
import BucketListProgress from "@/components/BucketListProgress"; // <-- IMPORTED HERE
import DailyAffirmation from "@/components/DailyAffirmation";
import LettersSection from "@/components/LettersSection";

// ==========================================
// MOCK DATA & HELPERS
// ==========================================
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

const LIFE_AREAS = [
  "Career",
  "Health",
  "Relationships",
  "Personal Growth",
  "Finance",
];

// ==========================================
// MAIN COMPONENT
// ==========================================
const DailyJournal = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState("new");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [journalId, setJournalId] = useState<number | null>(null);

  // Form state
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [energy, setEnergy] = useState([5]);
  const [alignment, setAlignment] = useState([5]);
  const [gratitude, setGratitude] = useState("");
  const [challenges, setChallenges] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [letterSubject, setLetterSubject] = useState("");
  const [letterBody, setLetterBody] = useState("");
  const [isSavingLetter, setIsSavingLetter] = useState(false);

  interface PastLetter {
    id: number;
    subject: string;
    written_on: string;
    formatted_date?: string;
    content?: string;
  }
  const [pastLetters, setPastLetters] = useState<PastLetter[]>([]);
  const [isLoadingLetters, setIsLoadingLetters] = useState(false);

  // Insights state
  const [insightsData, setInsightsData] = useState<{
    message?: string;
    hint?: string;
    [key: string]: unknown;
  } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Past journals state
  interface PastJournal {
    id: number;
    journal_type: string;
    start_date: string;
    formatted_date?: string;
    energy_score: number;
    alignment_score: number;
    affirmation?: string;
    priorities?: string[];
    data?: unknown;
  }
  interface DetailedJournal extends PastJournal {
    description?: string;
    gratitude_note?: string;
    challenges_note?: string;
    mood_tags?: string[];
    accomplishments?: { title: string }[];
    todos_snapshot?: { title: string; priority: string; status: string }[];
    habits_snapshot?: { name: string; completed: boolean }[];
    bucket_updates?: { title: string; update: string }[];
  }
  const [pastJournals, setPastJournals] = useState<PastJournal[]>([]);
  const [isLoadingPast, setIsLoadingPast] = useState(false);
  const [selectedPastJournal, setSelectedPastJournal] =
    useState<DetailedJournal | null>(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isLoadingJournal, setIsLoadingJournal] = useState(false);

  // Data state
  const [achievements, setAchievements] = useState<
    { title: string; points: number }[]
  >([]);
  const [priorities, setPriorities] = useState<string[]>([""]);

  // Dialog state
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);

  const filledDates = useMemo(() => [], [] as Date[]);

  interface DailyInfo {
    affirmations?: { content?: string; name?: string }[];
    core_values?: { id: number; name: string }[];
    journal?: {
      id: number;
      affirmation?: string;
      gratitude_note?: string;
      challenges_note?: string;
      energy_score?: number;
      alignment_score?: number;
      priorities?: string[];
      mood_tags?: string[];
      accomplishments?: { title: string; points?: number }[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }

  const [dailyData, setDailyData] = useState<DailyInfo | null>(null);

  useEffect(() => {
    const fetchDailyInfo = async () => {
      try {
        const d = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(
          `https://life-api.lockated.com/dashboard/daily?date=${d}`,
          {
            headers: {
              Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
            },
          },
        );
        const data = await res.json();
        setDailyData(data);

        // Populate form if journal exists
        if (data.journal?.id) {
          setJournalId(data.journal.id);
          setAffirmation(data.journal.affirmation || "");
          setGratitude(data.journal.gratitude_note || "");
          setChallenges(data.journal.challenges_note || "");
          setEnergy([data.journal.energy_score || 5]);
          setAlignment([data.journal.alignment_score || 5]);
          setPriorities(
            data.journal.priorities && data.journal.priorities.length > 0
              ? data.journal.priorities
              : [""],
          );
          setSelectedMoods(data.journal.mood_tags || []);
          setAchievements(
            data.journal.accomplishments?.map((a) => ({
              title: a.title,
              points: a.points || 10,
            })) || [],
          );
        } else {
          setJournalId(null);
          setGratitude("");
          setChallenges("");
          setEnergy([5]);
          setAlignment([5]);
          setPriorities([""]);
          setSelectedMoods([]);
          setAchievements([]);

          if (data.affirmations && data.affirmations.length > 0) {
            setAffirmation(
              (prev) =>
                prev ||
                data.affirmations![0].content ||
                data.affirmations![0].name ||
                "",
            );
          } else {
            setAffirmation("");
          }
        }
      } catch (err) {
        console.error("Failed to load daily info", err);
      }
    };
    fetchDailyInfo();
  }, [selectedDate, token]);

  useEffect(() => {
    if (activeTab === "past") {
      const fetchPastJournals = async () => {
        setIsLoadingPast(true);
        try {
          const res = await fetch(
            "https://life-api.lockated.com/user_journals",
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

  useEffect(() => {
    if (activeTab === "letters") {
      const fetchPastLetters = async () => {
        setIsLoadingLetters(true);
        try {
          const res = await fetch(
            "https://life-api.lockated.com/user_letters",
            {
              headers: {
                Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
              },
            },
          );
          const data = await res.json();
          setPastLetters(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to fetch past letters", error);
        } finally {
          setIsLoadingLetters(false);
        }
      };
      fetchPastLetters();
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab === "insights") {
      const fetchInsights = async () => {
        setIsLoadingInsights(true);
        try {
          const res = await fetch(
            "https://life-api.lockated.com/user_journals/daily_journals_insights",
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

  const fetchPastJournalById = async (id: number) => {
    setIsJournalModalOpen(true);
    setIsLoadingJournal(true);
    setSelectedPastJournal(null);
    try {
      const res = await fetch(
        `https://life-api.lockated.com/user_journals/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
          },
        },
      );
      const data = await res.json();
      setSelectedPastJournal(data);
    } catch (error) {
      console.error("Failed to fetch journal", error);
      toast({
        title: "Error",
        description: "Could not load journal details.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingJournal(false);
    }
  };

  const handleDeletePastJournal = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    if (!window.confirm("Are you sure you want to delete this journal entry?"))
      return;

    try {
      const res = await fetch(
        `https://life-api.lockated.com/user_journals/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to delete journal");

      toast({
        title: "Deleted",
        description: "Journal entry removed successfully.",
      });

      // Update local state by filtering out the deleted journal
      setPastJournals((prev) => prev.filter((j) => j.id !== id));

      // If we just deleted the entry we currently have selected for editing, clear it
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

  // Helper logic
  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood],
    );
  };

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area],
    );
  };

  const addPriority = () => {
    if (priorities.length < 5) setPriorities([...priorities, ""]);
  };

  const updatePriority = (index: number, value: string) => {
    const updated = [...priorities];
    updated[index] = value;
    setPriorities(updated);
  };

  const removePriority = (index: number) => {
    setPriorities(priorities.filter((_, i) => i !== index));
  };

  const handleSaveEntry = async () => {
    setIsSaving(true);
    try {
      const payload = {
        journal: {
          user_id: user?.id ? parseInt(user.id, 10) : 1,
          journal_type: "daily",
          start_date: format(selectedDate, "yyyy-MM-dd"),
          affirmation,
          description: "",
          gratitude_note: gratitude,
          challenges_note: challenges,
          energy_score: energy[0],
          alignment_score: alignment[0],
          priorities: priorities.filter((p) => p.trim() !== ""),
          mood_tags: selectedMoods,
          accomplishments: achievements.map((a) => ({ title: a.title })),
          core_values_snapshot:
            dailyData?.core_values?.map((cv) => cv.name) || null,
        },
      };

      const url = journalId
        ? `https://life-api.lockated.com/user_journals/${journalId}`
        : "https://life-api.lockated.com/user_journals";
      const method = journalId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save journal");
      }

      const responseData = await response.json();
      if (responseData.journal?.id) {
        setJournalId(responseData.journal.id);
      }

      toast({
        title: "Journal Entry Saved ✅",
        description: `Entry for ${format(selectedDate, "MMMM d, yyyy")} saved successfully.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error saving entry",
        description: "There was a problem saving your journal entry.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLetter = async () => {
    if (!letterBody.trim()) return;
    setIsSavingLetter(true);

    try {
      const payload = {
        letter: {
          subject: letterSubject || "Dear Future Me",
          content: letterBody,
          written_on: format(selectedDate, "yyyy-MM-dd"),
        },
      };

      const response = await fetch(
        "https://life-api.lockated.com/user_letters",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save letter");
      }

      const responseData = await response.json();
      if (responseData.letter) {
        setPastLetters((prev) => [responseData.letter, ...prev]);
      }

      toast({
        title: "Letter Saved 💌",
        description: "Your letter has been saved successfully.",
      });
      setLetterSubject("");
      setLetterBody("");
    } catch (error) {
      console.error("Failed to save letter:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your letter.",
        variant: "destructive",
      });
    } finally {
      setIsSavingLetter(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf9] animate-fade-in font-sans py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
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

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 w-full p-1.5 bg-gray-100/80 border border-gray-200/60 rounded-xl h-auto shadow-inner">
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
            <TabsTrigger
              value="letters"
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide"
            >
              Letters
            </TabsTrigger>
          </TabsList>

          {/* NEW TAB CONTENT */}
          <TabsContent value="new" className="focus:outline-none">
            <div className="flex flex-col space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <WeekStrip
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                filledDates={filledDates}
              />

              {/* Guiding Principles */}
              <div className="journal-section-purple rounded-xl p-6 shadow-sm border border-purple-100/50 bg-white">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Guiding Principles
                </h3>

                {dailyData?.core_values && dailyData.core_values.length > 0 && (
                  <div className="mb-6">
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      Core Values Lived Today
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dailyData.core_values.map((cv) => (
                        <Badge
                          key={cv.id}
                          variant="outline"
                          className="cursor-pointer transition-colors px-3 py-1 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                        >
                          {cv.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mb-3 text-sm font-semibold text-gray-700">
                  Life Areas Focused On
                </p>
                <div className="flex flex-wrap gap-2">
                  {LIFE_AREAS.map((area) => (
                    <Badge
                      key={area}
                      variant={
                        selectedAreas.includes(area) ? "default" : "outline"
                      }
                      className={`cursor-pointer transition-colors px-3 py-1 text-sm ${selectedAreas.includes(area) ? "bg-purple-600 hover:bg-purple-700 text-white" : "hover:bg-purple-50"}`}
                      onClick={() => toggleArea(area)}
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Today's Reflection */}
              <div className="journal-section-yellow rounded-xl p-6 shadow-sm border border-yellow-100/50 bg-white">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Today's Reflection
                  </h3>
                  <Button
                    size="sm"
                    className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={() => setShowAchievementDialog(true)}
                  >
                    <Plus className="h-4 w-4" /> Add Item
                  </Button>
                </div>

                {achievements.length === 0 ? (
                  <div className="mb-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
                    <p className="text-sm font-medium text-gray-500 mb-3">
                      No achievements added yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-white hover:bg-gray-50"
                      onClick={() => setShowAchievementDialog(true)}
                    >
                      <Plus className="h-4 w-4" /> Add Your First Win
                    </Button>
                  </div>
                ) : (
                  <div className="mb-6 space-y-3">
                    {achievements.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-gray-100 shadow-sm transition-all hover:border-yellow-200"
                      >
                        <span className="text-sm font-medium text-gray-800">
                          🏆 {a.title}
                        </span>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="text-xs bg-yellow-100 text-yellow-800"
                          >
                            +{a.points}pts
                          </Badge>
                          <button
                            onClick={() =>
                              setAchievements(
                                achievements.filter((_, j) => j !== i),
                              )
                            }
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-800">
                      What are you grateful for today?
                    </p>
                    <Textarea
                      placeholder="Express your thanks..."
                      value={gratitude}
                      onChange={(e) => setGratitude(e.target.value)}
                      className="min-h-[100px] resize-y bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-800">
                      Challenges, Changes & Key Insights?
                    </p>
                    <Textarea
                      placeholder="Challenges you face today..."
                      value={challenges}
                      onChange={(e) => setChallenges(e.target.value)}
                      className="min-h-[100px] resize-y bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="mb-3 text-sm font-semibold text-gray-800">
                    Mood
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((mood) => (
                      <Badge
                        key={mood}
                        variant={
                          selectedMoods.includes(mood) ? "default" : "outline"
                        }
                        className={`cursor-pointer px-3 py-1.5 transition-colors ${selectedMoods.includes(mood) ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-white hover:bg-yellow-50 text-gray-600"}`}
                        onClick={() => toggleMood(mood)}
                      >
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="font-semibold text-gray-800">
                        Energy Level
                      </span>
                      <span className="font-bold text-yellow-600">
                        {energy[0]}/10
                      </span>
                    </div>
                    <Slider
                      value={energy}
                      onValueChange={setEnergy}
                      max={10}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="font-semibold text-gray-800">
                        Alignment
                      </span>
                      <span className="font-bold text-yellow-600">
                        {alignment[0]}/10
                      </span>
                    </div>
                    <Slider
                      value={alignment}
                      onValueChange={setAlignment}
                      max={10}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Shaping Tomorrow */}
              <div className="journal-section-blue rounded-xl p-6 shadow-sm border border-blue-100/50 bg-white">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Shaping Tomorrow
                  </h3>
                  <Button
                    size="sm"
                    className="gap-1 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={addPriority}
                    disabled={priorities.length >= 5}
                  >
                    <Plus className="h-4 w-4" /> Add Priority
                  </Button>
                </div>
                <div className="space-y-3">
                  {priorities.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Input
                        placeholder={`Priority #${i + 1}`}
                        value={p}
                        onChange={(e) => updatePriority(i, e.target.value)}
                        className="bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-blue-400 h-11"
                      />
                      {priorities.length > 1 && (
                        <button
                          onClick={() => removePriority(i)}
                          className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Affirmation */}
              <div className="journal-section-pink rounded-xl p-6 shadow-sm border border-pink-100/50 bg-white">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Your Daily Affirmation
                </h3>
                <Textarea
                  placeholder="A positive statement about yourself..."
                  value={affirmation}
                  onChange={(e) => setAffirmation(e.target.value)}
                  className="min-h-[80px] resize-none bg-pink-50/30 border-pink-200 focus:bg-white focus:ring-pink-400 focus:border-pink-400 text-gray-800"
                />
                <p className="mt-2 text-xs font-medium text-pink-500">
                  Present tense ("I am"), positive, specific, repeat daily with
                  emotion.
                </p>
              </div>

              {/* 🟢 REPLACED WITH IMPORTED COMPONENT */}
              <BucketListProgress />

              {/* Empty People Section */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 py-16 shadow-sm">
                <div className="w-14 h-14 bg-white rounded-full shadow-sm border border-pink-100 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-pink-400" strokeWidth={2} />
                </div>
                <p className="text-[15px] font-semibold text-gray-600">
                  No people added yet
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Connect with friends to share progress
                </p>
              </div>

              {/* Sticky Action Footer */}
              <div className="  bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 flex justify-center z-50">
                <div className="w-full max-w-4xl flex justify-end gap-3 px-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEntry}
                    disabled={isSaving}
                    className="bg-black hover:bg-gray-800 text-white shadow-md"
                  >
                    {isSaving
                      ? "Saving..."
                      : `Save Entry - ${format(selectedDate, "MMM d, yyyy")}`}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* PAST TAB CONTENT */}
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
                  Past entries will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastJournals.map((journal) => (
                  <div
                    key={journal.id}
                    onClick={() => fetchPastJournalById(journal.id)}
                    className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all text-left cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-lg text-gray-900">
                        {journal.formatted_date ||
                          format(new Date(journal.start_date), "MMMM d, yyyy")}
                      </h4>
                      <div className="flex gap-2">
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200"
                        >
                          Energy: {journal.energy_score}/10
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Alignment: {journal.alignment_score}/10
                        </Badge>
                        <button
                          onClick={(e) =>
                            handleDeletePastJournal(journal.id, e)
                          }
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {journal.affirmation && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700">
                          Affirmation:
                        </p>
                        <p className="text-sm text-gray-600 italic">
                          "{journal.affirmation}"
                        </p>
                      </div>
                    )}
                    {journal.priorities && journal.priorities.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Priorities:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {journal.priorities.map((p: string, idx: number) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* INSIGHTS TAB CONTENT */}
          <TabsContent value="insights" className="focus:outline-none">
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
              {isLoadingInsights ? (
                <p className="text-gray-500 font-medium">Loading insights...</p>
              ) : insightsData?.message ? (
                <>
                  <div className="mx-auto mb-4 text-5xl">💡</div>
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
                  <div className="mx-auto mb-4 text-5xl">💡</div>
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

          {/* LETTERS TAB CONTENT */}
          <TabsContent value="letters" className="focus:outline-none">
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Write a Letter to Yourself
                    </h3>
                    <p className="text-sm text-gray-500">
                      Share your thoughts, dreams, and reflections
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
                      Subject (Optional)
                    </label>
                    <Input
                      placeholder="e.g., Dear Future Me, A Letter of Gratitude..."
                      value={letterSubject}
                      onChange={(e) => setLetterSubject(e.target.value)}
                      className="bg-gray-50/50 focus:bg-white"
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
                      className="min-h-[200px] resize-y bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      className="gap-2 bg-black hover:bg-gray-800 text-white px-6"
                      onClick={handleSaveLetter}
                      disabled={!letterBody.trim() || isSavingLetter}
                    >
                      {isSavingLetter ? "Saving..." : "💾 Save Letter"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Past Letters
                </h3>
                {isLoadingLetters ? (
                  <p className="text-gray-500 text-center py-4">
                    Loading past letters...
                  </p>
                ) : pastLetters.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No past letters found. Write your first one above!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pastLetters.map((letter) => (
                      <div
                        key={letter.id}
                        className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:border-gray-200"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {letter.subject || "Dear Future Me"}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {letter.formatted_date ||
                              (letter.written_on &&
                                format(
                                  new Date(letter.written_on),
                                  "MMMM d, yyyy",
                                ))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddAchievementDialog
        open={showAchievementDialog}
        onOpenChange={setShowAchievementDialog}
        onSubmit={(a) => setAchievements([...achievements, a])}
      />

      <Dialog open={isJournalModalOpen} onOpenChange={setIsJournalModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Journal Entry</DialogTitle>
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
              <div className="flex gap-4">
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200"
                >
                  Energy: {selectedPastJournal.energy_score}/10
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  Alignment: {selectedPastJournal.alignment_score}/10
                </Badge>
              </div>

              {selectedPastJournal.affirmation && (
                <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                  <p className="text-sm font-bold text-gray-800 mb-1">
                    Affirmation
                  </p>
                  <p className="text-gray-700 italic">
                    "{selectedPastJournal.affirmation}"
                  </p>
                </div>
              )}

              {selectedPastJournal.description && (
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1">
                    Description
                  </p>
                  <p className="text-gray-700 text-sm">
                    {selectedPastJournal.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedPastJournal.gratitude_note && (
                  <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                    <p className="text-sm font-bold text-gray-800 mb-1">
                      Gratitude
                    </p>
                    <p className="text-gray-700 text-sm">
                      {selectedPastJournal.gratitude_note}
                    </p>
                  </div>
                )}
                {selectedPastJournal.challenges_note && (
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-sm font-bold text-gray-800 mb-1">
                      Challenges
                    </p>
                    <p className="text-gray-700 text-sm">
                      {selectedPastJournal.challenges_note}
                    </p>
                  </div>
                )}
              </div>

              {selectedPastJournal.mood_tags &&
                selectedPastJournal.mood_tags.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-2">
                      Moods
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPastJournal.mood_tags.map(
                        (tag: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {selectedPastJournal.priorities &&
                selectedPastJournal.priorities.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-2">
                      Priorities
                    </p>
                    <ul className="list-disc list-inside text-gray-700 text-sm">
                      {selectedPastJournal.priorities.map(
                        (p: string, idx: number) => (
                          <li key={idx}>{p}</li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

              {selectedPastJournal.accomplishments &&
                selectedPastJournal.accomplishments.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-2">
                      Accomplishments
                    </p>
                    <ul className="list-disc list-inside text-gray-700 text-sm">
                      {selectedPastJournal.accomplishments.map(
                        (a: { title: string }, idx: number) => (
                          <li key={idx}>{a.title}</li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

              {selectedPastJournal.todos_snapshot &&
                selectedPastJournal.todos_snapshot.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-2">
                      To-Dos Snapshot
                    </p>
                    <div className="space-y-2">
                      {selectedPastJournal.todos_snapshot.map(
                        (
                          todo: {
                            title: string;
                            priority: string;
                            status: string;
                          },
                          idx: number,
                        ) => (
                          <div
                            key={idx}
                            className="p-3 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50/50"
                          >
                            <span className="text-gray-800 text-sm font-medium">
                              {todo.title}
                            </span>
                            <div className="flex gap-2">
                              <Badge variant="outline">{todo.priority}</Badge>
                              <Badge variant="secondary">{todo.status}</Badge>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {selectedPastJournal.habits_snapshot &&
                selectedPastJournal.habits_snapshot.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-2">
                      Habits Snapshot
                    </p>
                    <div className="space-y-2">
                      {selectedPastJournal.habits_snapshot.map(
                        (
                          habit: { name: string; completed: boolean },
                          idx: number,
                        ) => (
                          <div
                            key={idx}
                            className="p-3 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50/50"
                          >
                            <span className="text-gray-800 text-sm font-medium">
                              {habit.name}
                            </span>
                            <Badge
                              variant={habit.completed ? "default" : "outline"}
                              className={
                                habit.completed
                                  ? "bg-green-500 hover:bg-green-600"
                                  : ""
                              }
                            >
                              {habit.completed ? "Completed" : "Missed"}
                            </Badge>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {selectedPastJournal.bucket_updates &&
                selectedPastJournal.bucket_updates.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-gray-800 mb-2">
                      Bucket List Updates
                    </p>
                    <div className="space-y-2">
                      {selectedPastJournal.bucket_updates.map(
                        (
                          update: { title: string; update: string },
                          idx: number,
                        ) => (
                          <div
                            key={idx}
                            className="p-3 border border-gray-100 rounded-lg bg-gray-50/50"
                          >
                            <p className="text-sm font-semibold text-gray-800">
                              {update.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {update.update}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="py-10 text-center text-red-500">
              Failed to load journal.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyJournal;
