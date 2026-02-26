import { useState } from "react";
import { ArrowLeft, HelpCircle, Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MOODS = ["Peaceful", "Energized", "Grateful", "Anxious", "Tired", "Stressed", "Focused", "Content", "Joyful", "Inspired", "Calm", "Excited"];

const LIFE_AREAS = ["Career", "Health", "Relationships", "Personal Growth", "Finance"];

const WEEKDAYS = [
  { day: "SU", date: 22, filled: true },
  { day: "M", date: 23, filled: true },
  { day: "TU", date: 24, filled: true },
  { day: "W", date: 25, filled: true, today: true },
  { day: "TH", date: 26, filled: false },
  { day: "F", date: 27, filled: false },
  { day: "SA", date: 28, filled: false },
];

const DailyJournal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [energy, setEnergy] = useState([5]);
  const [alignment, setAlignment] = useState([5]);
  const [gratitude, setGratitude] = useState("");
  const [challenges, setChallenges] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [letterSubject, setLetterSubject] = useState("");
  const [letterBody, setLetterBody] = useState("");

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
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
        <button className="flex items-center gap-1 text-body-6 text-muted-foreground">
          <HelpCircle className="h-4 w-4" /> Help
        </button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="new" className="flex-1">New</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">Past (1)</TabsTrigger>
          <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
          <TabsTrigger value="letters" className="flex-1">Letters</TabsTrigger>
        </TabsList>

        {/* NEW TAB */}
        <TabsContent value="new" className="space-y-4">
          {/* Calendar Week */}
          <div className="journal-section-green rounded-xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-foreground" />
              <span className="text-body-4 font-medium text-foreground">Wednesday, February 25, 2026</span>
            </div>
            <p className="mb-2 text-center text-body-6 text-muted-foreground">This Week</p>
            <div className="flex justify-center gap-2">
              {WEEKDAYS.map((d) => (
                <div
                  key={d.date}
                  className={`flex h-12 w-10 flex-col items-center justify-center rounded-lg text-body-6 ${
                    d.today
                      ? "bg-primary text-primary-foreground"
                      : d.filled
                      ? "bg-destructive/80 text-primary-foreground"
                      : "bg-card text-foreground"
                  }`}
                >
                  <span className="text-[10px] font-medium">{d.day}</span>
                  <span className="font-semibold">{d.date}</span>
                  {d.filled && !d.today && (
                    <span className="text-[8px]">+10</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-center gap-4 text-body-6 text-muted-foreground">
              <span>● Filled</span>
              <span>● Missed</span>
              <span>○ Upcoming</span>
            </div>
          </div>

          {/* Guiding Principles */}
          <div className="journal-section-purple rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-body-3 font-semibold text-foreground">Guiding Principles</h3>
            </div>
            <p className="mb-1 text-body-5 font-medium text-foreground">Core Values Lived Today</p>
            <p className="mb-2 text-body-5 text-muted-foreground">Life Areas Focused On</p>
            <div className="flex flex-wrap gap-2">
              {LIFE_AREAS.map((area) => (
                <Badge key={area} variant="outline" className="cursor-pointer hover:bg-muted">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* Today's Reflection */}
          <div className="journal-section-yellow rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-body-3 font-semibold text-foreground">Today's Reflection</h3>
              <Button size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>

            <div className="mb-4 rounded-lg bg-card p-4 text-center">
              <p className="text-body-5 text-muted-foreground">No achievements added yet</p>
              <Button variant="outline" size="sm" className="mt-2 gap-1">
                <Plus className="h-3 w-3" /> Add Your First Win
              </Button>
            </div>

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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-body-5 font-medium text-foreground">What are you grateful for today?</p>
                <Textarea
                  placeholder="Express your thanks..."
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div>
                <p className="mb-1 text-body-5 font-medium text-foreground">Challenges, Changes & Key Insights?</p>
                <Textarea
                  placeholder="Challenges you face today..."
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>

            {/* Mood */}
            <div className="mt-4">
              <p className="mb-2 text-body-5 font-medium text-foreground">Mood</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <Badge
                    key={mood}
                    variant={selectedMoods.includes(mood) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMood(mood)}
                  >
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
            <h3 className="mb-3 text-body-3 font-semibold text-foreground">Shaping Tomorrow</h3>
            <div className="mb-3 rounded-lg bg-card p-4 text-center">
              <Calendar className="mx-auto mb-1 h-8 w-8 text-muted-foreground/40" />
              <p className="text-body-5 text-muted-foreground">No calendars configured</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-body-5 font-medium text-foreground">Priorities for Tomorrow?</p>
              <Button size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> Add Priority
              </Button>
            </div>
            <Input placeholder="Priority #1" className="mt-2" />
          </div>

          {/* Daily Affirmation */}
          <div className="journal-section-pink rounded-xl p-4">
            <h3 className="mb-3 text-body-3 font-semibold text-foreground">Your Daily Affirmation</h3>
            <Textarea
              placeholder="A positive statement about yourself..."
              value={affirmation}
              onChange={(e) => setAffirmation(e.target.value)}
              className="min-h-[60px] resize-none"
            />
            <p className="mt-1 text-body-6 text-muted-foreground">
              Present tense ("I am"), positive, specific, repeat daily with emotion.
            </p>
          </div>

          {/* Review Goals */}
          <div className="journal-section-orange rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-body-3 font-semibold text-foreground">Review To Do's & Goals</h3>
              <Button size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            <div className="mt-3 rounded-lg bg-card p-4 text-center">
              <p className="text-body-5 text-muted-foreground">No to-do's yet</p>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-background py-3">
            <Button variant="outline">Cancel</Button>
            <Button>Save Entry - Feb 25, 2026</Button>
          </div>
        </TabsContent>

        {/* PAST TAB */}
        <TabsContent value="past">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-foreground" />
                <span className="text-body-4 font-medium text-foreground">Wednesday, February 25, 2026</span>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-error text-error-foreground">Energy 10/10</Badge>
                <Badge className="bg-success text-success-foreground">Align 5/10</Badge>
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
                <p className="text-body-5 text-muted-foreground">
                  Write to your future or present self - share your thoughts, dreams, and reflections
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-body-5 font-medium text-foreground">Subject (Optional)</label>
                <Input
                  placeholder="e.g., Dear Future Me, A Letter of Gratitude..."
                  value={letterSubject}
                  onChange={(e) => setLetterSubject(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-body-5 font-medium text-foreground">Your Letter</label>
                <Textarea
                  placeholder="Dear Self,&#10;&#10;Write your thoughts, feelings, dreams, and reflections here...&#10;&#10;What do you want to remember? What are you grateful for? What are your hopes and dreams?"
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  className="mt-1 min-h-[160px] resize-none"
                />
              </div>
              <div className="flex justify-end">
                <Button className="gap-1">💾 Save Letter</Button>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-8 text-center">
            <span className="text-3xl">✨</span>
            <p className="mt-2 text-body-5 text-muted-foreground">No letters yet. Write your first letter to yourself!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyJournal;
