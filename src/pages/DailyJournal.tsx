import { useState, useMemo } from "react";
import { ArrowLeft, HelpCircle, Plus, Calendar, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import WeekStrip from "@/components/journal/WeekStrip";
import AddAchievementDialog from "@/components/journal/AddAchievementDialog";
import CreateToDoDialog, {
  type TodoItem,
} from "@/components/journal/CreateToDoDialog";

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

// Bucket List Initial Data
const DEFAULT_BUCKET_LIST = [
  {
    id: 1,
    title: "Visit Japan",
    notes: "",
    progress: "Planning",
    category: "Travel",
  },
  {
    id: 2,
    title: "Start a side business",
    notes: "",
    progress: "Dreaming",
    category: "Career",
  },
  {
    id: 3,
    title: "Write a book",
    notes: "",
    progress: "Dreaming",
    category: "Personal",
  },
  {
    id: 4,
    title: "Go skydiving",
    notes: "",
    progress: "Dreaming",
    category: "Adventure",
  },
  {
    id: 5,
    title: "Learn to play guitar",
    notes: "",
    progress: "In Progress",
    category: "Learning",
  },
];

// Tag Colors for Bucket List
const getProgressStyle = (progress: string) => {
  switch (progress) {
    case "Dreaming":
      return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300";
    case "Planning":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
    case "In Progress":
      return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getCategoryStyle = (category: string) => {
  switch (category) {
    case "Personal":
      return "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300";
    case "Career":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300";
    case "Travel":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
    case "Adventure":
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300";
    case "Learning":
      return "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300";
    case "Health":
      return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
    case "Relationships":
      return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
    case "Finance":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const DailyJournal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new");
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Data state
  const [achievements, setAchievements] = useState<
    { title: string; points: number }[]
  >([]);
  const [priorities, setPriorities] = useState<string[]>([""]);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // 🟢 Bucket List State & Filters
  const [bucketList, setBucketList] = useState(DEFAULT_BUCKET_LIST);
  const [bucketProgressFilter, setBucketProgressFilter] =
    useState("All Progress");
  const [bucketCategoryFilter, setBucketCategoryFilter] =
    useState("All Categories");

  // Dialog state
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [showTodoDialog, setShowTodoDialog] = useState(false);

  const filledDates = useMemo(() => [], [] as Date[]);

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

  const handleSaveEntry = () => {
    toast({
      title: "Journal Entry Saved ✅",
      description: `Entry for ${format(selectedDate, "MMMM d, yyyy")} saved successfully.`,
    });
  };

  const handleSaveLetter = () => {
    if (!letterBody.trim()) return;
    toast({
      title: "Letter Saved 💌",
      description: "Your letter has been saved.",
    });
    setLetterSubject("");
    setLetterBody("");
  };

  // 🟢 BUCKET LIST DYNAMIC FUNCTIONS
  const addBucketItem = () => {
    const newItem = {
      id: Date.now(),
      title: "",
      notes: "",
      progress: "Dreaming",
      category: "Personal",
    };
    setBucketList([newItem, ...bucketList]);
  };

  const removeBucketItem = (id: number) => {
    setBucketList(bucketList.filter((item) => item.id !== id));
  };

  const updateBucketItem = (id: number, field: string, value: string) => {
    setBucketList(
      bucketList.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const filteredBucketList = bucketList.filter((item) => {
    const matchProgress =
      bucketProgressFilter === "All Progress" ||
      item.progress === bucketProgressFilter;
    const matchCategory =
      bucketCategoryFilter === "All Categories" ||
      item.category === bucketCategoryFilter;
    return matchProgress && matchCategory;
  });

  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-1 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-title-1 text-foreground">Daily Journal</h1>
            <p className="text-body-5 text-muted-foreground">
              5-minute reflection on your day
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-body-6 text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" /> Help
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="new" className="flex-1">
            New
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past ({todos.length > 0 ? 1 : 0})
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex-1">
            Insights
          </TabsTrigger>
          <TabsTrigger value="letters" className="flex-1">
            Letters
          </TabsTrigger>
        </TabsList>

        {/* NEW TAB */}
        <TabsContent value="new" className="space-y-4">
          <WeekStrip
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            filledDates={filledDates}
          />

          {/* Guiding Principles */}
          <div className="journal-section-purple rounded-xl p-4">
            <h3 className="mb-3 text-body-3 font-semibold text-foreground">
              Guiding Principles
            </h3>
            <p className="mb-1 text-body-5 font-medium text-foreground">
              Core Values Lived Today
            </p>
            <p className="mb-2 text-body-5 text-muted-foreground">
              Life Areas Focused On
            </p>
            <div className="flex flex-wrap gap-2">
              {LIFE_AREAS.map((area) => (
                <Badge
                  key={area}
                  variant={selectedAreas.includes(area) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArea(area)}
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* Today's Reflection */}
          <div className="journal-section-yellow rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-body-3 font-semibold text-foreground">
                Today's Reflection
              </h3>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => setShowAchievementDialog(true)}
              >
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>
            {achievements.length === 0 ? (
              <div className="mb-4 rounded-lg bg-card p-4 text-center">
                <p className="text-body-5 text-muted-foreground">
                  No achievements added yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 gap-1"
                  onClick={() => setShowAchievementDialog(true)}
                >
                  <Plus className="h-3 w-3" /> Add Your First Win
                </Button>
              </div>
            ) : (
              <div className="mb-4 space-y-2">
                {achievements.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-card px-3 py-2 border"
                  >
                    <span className="text-body-5 text-foreground">
                      🏆 {a.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-body-6">
                        +{a.points}pts
                      </Badge>
                      <button
                        onClick={() =>
                          setAchievements(
                            achievements.filter((_, j) => j !== i),
                          )
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-body-5 font-medium text-foreground">
                  What are you grateful for today?
                </p>
                <Textarea
                  placeholder="Express your thanks..."
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  className="min-h-[80px] resize-none bg-background"
                />
              </div>
              <div>
                <p className="mb-1 text-body-5 font-medium text-foreground">
                  Challenges, Changes & Key Insights?
                </p>
                <Textarea
                  placeholder="Challenges you face today..."
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="min-h-[80px] resize-none bg-background"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-body-5 font-medium text-foreground">
                Mood
              </p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <Badge
                    key={mood}
                    variant={
                      selectedMoods.includes(mood) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleMood(mood)}
                  >
                    {mood}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-body-5">
                  <span className="font-medium text-foreground">Energy</span>
                  <span className="text-primary">{energy[0]}/10</span>
                </div>
                <Slider
                  value={energy}
                  onValueChange={setEnergy}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-body-5">
                  <span className="font-medium text-foreground">Alignment</span>
                  <span className="text-primary">{alignment[0]}/10</span>
                </div>
                <Slider
                  value={alignment}
                  onValueChange={setAlignment}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Shaping Tomorrow */}
          <div className="journal-section-blue rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-body-3 font-semibold text-foreground">
                Shaping Tomorrow
              </h3>
              <Button
                size="sm"
                className="gap-1"
                onClick={addPriority}
                disabled={priorities.length >= 5}
              >
                <Plus className="h-3 w-3" /> Add Priority
              </Button>
            </div>
            <div className="space-y-2">
              {priorities.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder={`Priority #${i + 1}`}
                    value={p}
                    onChange={(e) => updatePriority(i, e.target.value)}
                    className="bg-background"
                  />
                  {priorities.length > 1 && (
                    <button
                      onClick={() => removePriority(i)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Affirmation */}
          <div className="journal-section-pink rounded-xl p-4">
            <h3 className="mb-3 text-body-3 font-semibold text-foreground">
              Your Daily Affirmation
            </h3>
            <Textarea
              placeholder="A positive statement about yourself..."
              value={affirmation}
              onChange={(e) => setAffirmation(e.target.value)}
              className="min-h-[60px] resize-none bg-background"
            />
            <p className="mt-1 text-body-6 text-muted-foreground">
              Present tense ("I am"), positive, specific, repeat daily with
              emotion.
            </p>
          </div>

          {/* Review To Do's */}
          <div className="journal-section-orange rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-body-3 font-semibold text-foreground">
                Review To Do's & Goals
              </h3>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => setShowTodoDialog(true)}
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            {todos.length === 0 ? (
              <div className="mt-3 rounded-lg bg-card p-4 text-center">
                <p className="text-body-5 text-muted-foreground">
                  No to-do's yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowTodoDialog(true)}
                >
                  Create Your First To Do
                </Button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between rounded-lg bg-card px-3 py-2 border"
                  >
                    <div>
                      <p className="text-body-5 font-medium text-foreground">
                        {todo.title}
                      </p>
                      <div className="mt-1 flex gap-2">
                        <Badge variant="outline" className="text-body-6">
                          {todo.lifeArea}
                        </Badge>
                        <Badge variant="secondary" className="text-body-6">
                          {todo.priority}
                        </Badge>
                        <Badge
                          variant={
                            todo.status === "Completed" ? "default" : "outline"
                          }
                          className="text-body-6"
                        >
                          {todo.status}
                        </Badge>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setTodos(todos.filter((t) => t.id !== todo.id))
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* =========================================
              EMBEDDED BUCKET LIST SECTION (FULLY DYNAMIC & FUNCTIONAL)
              ========================================= */}
          <div className="journal-section-purple rounded-xl p-4">
            {/* Header */}
            <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-body-3 font-semibold text-foreground">
                  Bucket List Progress
                </h3>

                {/* 🟢 Add Button for Bucket List */}
                <Button
                  size="sm"
                  className="gap-1 h-7 px-2 ml-1"
                  onClick={addBucketItem}
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>

                <div className="relative group flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full border border-yellow-500 text-yellow-500 flex items-center justify-center text-[10px] font-bold cursor-help">
                    i
                  </div>
                  <div className="absolute top-full mt-1 left-0 hidden group-hover:block bg-foreground text-background text-xs px-2 py-1.5 rounded shadow-lg w-48 z-10">
                    Track progress on your dreams and long-term aspirations
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={bucketProgressFilter}
                  onChange={(e) => setBucketProgressFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="All Progress">All Progress</option>
                  <option value="Dreaming">Dreaming</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                </select>
                <select
                  value={bucketCategoryFilter}
                  onChange={(e) => setBucketCategoryFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Travel">Travel</option>
                  <option value="Career">Career</option>
                  <option value="Personal">Personal</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Learning">Learning</option>
                  <option value="Health">Health</option>
                  <option value="Relationships">Relationships</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* List (Scrollable) */}
            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {filteredBucketList.length > 0 ? (
                filteredBucketList.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col gap-1 rounded-lg bg-card px-3 py-3 border shadow-sm shrink-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* 🟢 Live Editable Title */}
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          updateBucketItem(item.id, "title", e.target.value)
                        }
                        placeholder="What is your dream...?"
                        className="font-medium text-foreground text-sm bg-transparent outline-none w-full"
                      />
                      {/* 🟢 Delete Button (Shows on Hover) */}
                      <button
                        onClick={() => removeBucketItem(item.id)}
                        className="text-muted-foreground hover:text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* 🟢 Live Editable Notes */}
                    <input
                      type="text"
                      placeholder="Add notes..."
                      value={item.notes}
                      onChange={(e) =>
                        updateBucketItem(item.id, "notes", e.target.value)
                      }
                      className="w-full bg-transparent outline-none text-xs text-muted-foreground placeholder:text-muted-foreground/50 mb-1"
                    />

                    {/* 🟢 Editable Badges (Dropdowns styled as badges) */}
                    <div className="flex gap-2">
                      <select
                        value={item.progress}
                        onChange={(e) =>
                          updateBucketItem(item.id, "progress", e.target.value)
                        }
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold appearance-none cursor-pointer outline-none text-center ${getProgressStyle(item.progress)}`}
                      >
                        <option
                          className="bg-background text-foreground"
                          value="Dreaming"
                        >
                          Dreaming
                        </option>
                        <option
                          className="bg-background text-foreground"
                          value="Planning"
                        >
                          Planning
                        </option>
                        <option
                          className="bg-background text-foreground"
                          value="In Progress"
                        >
                          In Progress
                        </option>
                      </select>

                      <select
                        value={item.category}
                        onChange={(e) =>
                          updateBucketItem(item.id, "category", e.target.value)
                        }
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold appearance-none cursor-pointer outline-none text-center ${getCategoryStyle(item.category)}`}
                      >
                        <option
                          className="bg-background text-foreground"
                          value="Personal"
                        >
                          Personal
                        </option>
                        <option
                          className="bg-background text-foreground"
                          value="Career"
                        >
                          Career
                        </option>
                        <option
                          className="bg-background text-foreground"
                          value="Travel"
                        >
                          Travel
                        </option>
                        <option
                          className="bg-background text-foreground"
                          value="Adventure"
                        >
                          Adventure
                        </option>
                        <option
                          className="bg-background text-foreground"
                          value="Learning"
                        >
                          Learning
                        </option>
                        <option
                          className="bg-background text-foreground"
                          value="Health"
                        >
                          Health
                        </option>
                        <option
                          className="bg-background text-foreground"
                          value="Relationships"
                        >
                          Relationships
                        </option>
                        <option
                          className="bg-background text-foreground"
                          value="Finance"
                        >
                          Finance
                        </option>
                        <option
                          className="bg-background text-foreground"
                          value="Other"
                        >
                          Other
                        </option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-card p-4 text-center">
                  <p className="text-body-5 text-muted-foreground">
                    No bucket list items match your filters.
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* ========================================= */}
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-pink-300 bg-pink-50/50 py-12 dark:border-pink-800 dark:bg-pink-950/20">
            <Calendar
              className="mb-3 h-10 w-10 text-pink-500"
              strokeWidth={1.5}
            />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No people added yet
            </p>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-background py-3 z-10">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEntry}>
              Save Entry - {format(selectedDate, "MMM d, yyyy")}
            </Button>
          </div>
        </TabsContent>

        {/* PAST TAB */}
        <TabsContent value="past">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-foreground" />
                <span className="text-body-4 font-medium text-foreground">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-destructive text-destructive-foreground">
                  Energy {energy[0]}/10
                </Badge>
                <Badge className="bg-primary text-primary-foreground">
                  Align {alignment[0]}/10
                </Badge>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* INSIGHTS TAB */}
        <TabsContent value="insights">
          <div className="rounded-xl border bg-card p-8 text-center">
            <div className="mx-auto mb-3 text-4xl text-muted-foreground/30">
              💡
            </div>
            <h3 className="text-body-3 font-medium text-foreground">
              No reflections yet
            </h3>
            <p className="mt-1 text-body-5 text-muted-foreground">
              Start journaling to see your challenges, insights, and gratitude
              here!
            </p>
          </div>
        </TabsContent>

        {/* LETTERS TAB */}
        <TabsContent value="letters" className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">✨</span>
              <div>
                <h3 className="text-body-3 font-semibold text-foreground">
                  Write a Letter to Yourself
                </h3>
                <p className="text-body-5 text-muted-foreground">
                  Share your thoughts, dreams, and reflections
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-body-5 font-medium text-foreground">
                  Subject (Optional)
                </label>
                <Input
                  placeholder="e.g., Dear Future Me, A Letter of Gratitude..."
                  value={letterSubject}
                  onChange={(e) => setLetterSubject(e.target.value)}
                  className="mt-1 bg-background"
                />
              </div>
              <div>
                <label className="text-body-5 font-medium text-foreground">
                  Your Letter
                </label>
                <Textarea
                  placeholder={
                    "Dear Self,\n\nWrite your thoughts, feelings, dreams, and reflections here...\n\nWhat do you want to remember? What are you grateful for?"
                  }
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  className="mt-1 min-h-[160px] resize-none bg-background"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  className="gap-1"
                  onClick={handleSaveLetter}
                  disabled={!letterBody.trim()}
                >
                  💾 Save Letter
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddAchievementDialog
        open={showAchievementDialog}
        onOpenChange={setShowAchievementDialog}
        onSubmit={(a) => setAchievements([...achievements, a])}
      />
      <CreateToDoDialog
        open={showTodoDialog}
        onOpenChange={setShowTodoDialog}
        onSubmit={(todo) => setTodos([...todos, todo])}
      />
    </div>
  );
};

export default DailyJournal;
