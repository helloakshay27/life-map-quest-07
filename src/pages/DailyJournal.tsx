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
import CreateToDoDialog, { type TodoItem } from "@/components/journal/CreateToDoDialog";

const MOODS = ["Peaceful", "Energized", "Grateful", "Anxious", "Tired", "Stressed", "Focused", "Content", "Joyful", "Inspired", "Calm", "Excited"];
const LIFE_AREAS = ["Career", "Health", "Relationships", "Personal Growth", "Finance"];

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
  const [achievements, setAchievements] = useState<{ title: string; points: number }[]>([]);
  const [priorities, setPriorities] = useState<string[]>([""]);
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // Dialog state
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [showTodoDialog, setShowTodoDialog] = useState(false);

  const filledDates = useMemo(() => [], [] as Date[]);

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
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
    toast({ title: "Letter Saved 💌", description: "Your letter has been saved." });
    setLetterSubject("");
    setLetterBody("");
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full p-1 hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-title-1 text-foreground">Daily Journal</h1>
            <p className="text-body-5 text-muted-foreground">5-minute reflection on your day</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-body-6 text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" /> Help
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="new" className="flex-1">New</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">Past ({todos.length > 0 ? 1 : 0})</TabsTrigger>
          <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
          <TabsTrigger value="letters" className="flex-1">Letters</TabsTrigger>
        </TabsList>

        {/* NEW TAB */}
        <TabsContent value="new" className="space-y-4">
          {/* Week Strip */}
          <WeekStrip selectedDate={selectedDate} onDateChange={setSelectedDate} filledDates={filledDates} />

          {/* Guiding Principles */}
          <div className="journal-section-purple rounded-xl p-4">
            <h3 className="mb-3 text-body-3 font-semibold text-foreground">Guiding Principles</h3>
            <p className="mb-1 text-body-5 font-medium text-foreground">Core Values Lived Today</p>
            <p className="mb-2 text-body-5 text-muted-foreground">Life Areas Focused On</p>
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
              <h3 className="text-body-3 font-semibold text-foreground">Today's Reflection</h3>
              <Button size="sm" className="gap-1" onClick={() => setShowAchievementDialog(true)}>
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>

            {/* Achievements */}
            {achievements.length === 0 ? (
              <div className="mb-4 rounded-lg bg-card p-4 text-center">
                <p className="text-body-5 text-muted-foreground">No achievements added yet</p>
                <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={() => setShowAchievementDialog(true)}>
                  <Plus className="h-3 w-3" /> Add Your First Win
                </Button>
              </div>
            ) : (
              <div className="mb-4 space-y-2">
                {achievements.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-card px-3 py-2">
                    <span className="text-body-5 text-foreground">🏆 {a.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-body-6">+{a.points}pts</Badge>
                      <button onClick={() => setAchievements(achievements.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Habits placeholder */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-body-5 font-medium text-foreground">Today's Habits</p>
                <button className="text-body-6 text-primary hover:underline">Manage Habits</button>
              </div>
              <div className="rounded-lg bg-card p-4 text-center">
                <p className="text-body-5 text-muted-foreground">No habits scheduled for today</p>
                <Button variant="outline" size="sm" className="mt-2">Create Your First Habit</Button>
              </div>
            </div>

            {/* Gratitude & Challenges */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-body-5 font-medium text-foreground">What are you grateful for today?</p>
                <Textarea placeholder="Express your thanks..." value={gratitude} onChange={(e) => setGratitude(e.target.value)} className="min-h-[80px] resize-none" />
              </div>
              <div>
                <p className="mb-1 text-body-5 font-medium text-foreground">Challenges, Changes & Key Insights?</p>
                <Textarea placeholder="Challenges you face today..." value={challenges} onChange={(e) => setChallenges(e.target.value)} className="min-h-[80px] resize-none" />
              </div>
            </div>

            {/* Mood */}
            <div className="mt-4">
              <p className="mb-2 text-body-5 font-medium text-foreground">Mood</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <Badge key={mood} variant={selectedMoods.includes(mood) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleMood(mood)}>
                    {mood}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Energy & Alignment */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-body-5">
                  <span className="font-medium text-foreground">Energy</span>
                  <span className="text-primary">{energy[0]}/10</span>
                </div>
                <Slider value={energy} onValueChange={setEnergy} max={10} step={1} className="mt-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-body-5">
                  <span className="font-medium text-foreground">Alignment</span>
                  <span className="text-primary">{alignment[0]}/10</span>
                </div>
                <Slider value={alignment} onValueChange={setAlignment} max={10} step={1} className="mt-2" />
              </div>
            </div>
          </div>

          {/* Shaping Tomorrow */}
          <div className="journal-section-blue rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-body-3 font-semibold text-foreground">Shaping Tomorrow</h3>
              <Button size="sm" className="gap-1" onClick={addPriority} disabled={priorities.length >= 5}>
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
                  />
                  {priorities.length > 1 && (
                    <button onClick={() => removePriority(i)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Daily Affirmation */}
          <div className="journal-section-pink rounded-xl p-4">
            <h3 className="mb-3 text-body-3 font-semibold text-foreground">Your Daily Affirmation</h3>
            <Textarea placeholder='A positive statement about yourself...' value={affirmation} onChange={(e) => setAffirmation(e.target.value)} className="min-h-[60px] resize-none" />
            <p className="mt-1 text-body-6 text-muted-foreground">
              Present tense ("I am"), positive, specific, repeat daily with emotion.
            </p>
          </div>

          {/* Review To Do's & Goals */}
          <div className="journal-section-orange rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-body-3 font-semibold text-foreground">Review To Do's & Goals</h3>
              <Button size="sm" className="gap-1" onClick={() => setShowTodoDialog(true)}>
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            {todos.length === 0 ? (
              <div className="mt-3 rounded-lg bg-card p-4 text-center">
                <p className="text-body-5 text-muted-foreground">No to-do's yet</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowTodoDialog(true)}>
                  Create Your First To Do
                </Button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center justify-between rounded-lg bg-card px-3 py-2">
                    <div>
                      <p className="text-body-5 font-medium text-foreground">{todo.title}</p>
                      <div className="mt-1 flex gap-2">
                        <Badge variant="outline" className="text-body-6">{todo.lifeArea}</Badge>
                        <Badge variant="secondary" className="text-body-6">{todo.priority}</Badge>
                        <Badge variant={todo.status === "Completed" ? "default" : "outline"} className="text-body-6">{todo.status}</Badge>
                      </div>
                    </div>
                    <button onClick={() => setTodos(todos.filter((t) => t.id !== todo.id))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-background py-3">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
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
                <span className="text-body-4 font-medium text-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-error text-error-foreground">Energy {energy[0]}/10</Badge>
                <Badge className="bg-success text-success-foreground">Align {alignment[0]}/10</Badge>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* INSIGHTS TAB */}
        <TabsContent value="insights">
          <div className="rounded-xl border bg-card p-8 text-center">
            <div className="mx-auto mb-3 text-4xl text-muted-foreground/30">💡</div>
            <h3 className="text-body-3 font-medium text-foreground">No reflections yet</h3>
            <p className="mt-1 text-body-5 text-muted-foreground">
              Start journaling to see your challenges, insights, and gratitude here!
            </p>
          </div>
        </TabsContent>

        {/* LETTERS TAB */}
        <TabsContent value="letters" className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">✨</span>
              <div>
                <h3 className="text-body-3 font-semibold text-foreground">Write a Letter to Yourself</h3>
                <p className="text-body-5 text-muted-foreground">Share your thoughts, dreams, and reflections</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-body-5 font-medium text-foreground">Subject (Optional)</label>
                <Input placeholder="e.g., Dear Future Me, A Letter of Gratitude..." value={letterSubject} onChange={(e) => setLetterSubject(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-body-5 font-medium text-foreground">Your Letter</label>
                <Textarea
                  placeholder={"Dear Self,\n\nWrite your thoughts, feelings, dreams, and reflections here...\n\nWhat do you want to remember? What are you grateful for?"}
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  className="mt-1 min-h-[160px] resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button className="gap-1" onClick={handleSaveLetter} disabled={!letterBody.trim()}>
                  💾 Save Letter
                </Button>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-8 text-center">
            <span className="text-3xl">✨</span>
            <p className="mt-2 text-body-5 text-muted-foreground">No letters yet. Write your first letter to yourself!</p>
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
