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
import BucketListProgress from "@/components/BucketListProgress"; // <-- IMPORTED HERE
import DailyAffirmation from "@/components/DailyAffirmation";
import LettersSection from "@/components/LettersSection";

// ==========================================
// MOCK DATA & HELPERS
// ==========================================
const MOODS = [
  "Peaceful", "Energized", "Grateful", "Anxious", "Tired", 
  "Stressed", "Focused", "Content", "Joyful", "Inspired", "Calm", "Excited"
];

const LIFE_AREAS = [
  "Career", "Health", "Relationships", "Personal Growth", "Finance",
];

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
  const [achievements, setAchievements] = useState<{ title: string; points: number }[]>([]);
  const [priorities, setPriorities] = useState<string[]>([""]);

  // Dialog state
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);

  const filledDates = useMemo(() => [], [] as Date[]);

  // Helper logic
  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) => prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]);
  };

  const toggleArea = (area: string) => {
    setSelectedAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]);
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
            <TabsTrigger value="new" className="flex-1 py-2.5 rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide">
              New
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide">
              Past (0)
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide">
              Insights
            </TabsTrigger>
            <TabsTrigger value="letters" className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide">
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
                <p className="mb-1 text-sm font-semibold text-gray-700">
                  Core Values Lived Today
                </p>
                <p className="mb-4 text-sm text-gray-500">
                  Life Areas Focused On
                </p>
                <div className="flex flex-wrap gap-2">
                  {LIFE_AREAS.map((area) => (
                    <Badge
                      key={area}
                      variant={selectedAreas.includes(area) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors px-3 py-1 text-sm ${selectedAreas.includes(area) ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'hover:bg-purple-50'}`}
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
                  <Button size="sm" className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => setShowAchievementDialog(true)}>
                    <Plus className="h-4 w-4" /> Add Item
                  </Button>
                </div>
                
                {achievements.length === 0 ? (
                  <div className="mb-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
                    <p className="text-sm font-medium text-gray-500 mb-3">
                      No achievements added yet
                    </p>
                    <Button variant="outline" size="sm" className="gap-1 bg-white hover:bg-gray-50" onClick={() => setShowAchievementDialog(true)}>
                      <Plus className="h-4 w-4" /> Add Your First Win
                    </Button>
                  </div>
                ) : (
                  <div className="mb-6 space-y-3">
                    {achievements.map((a, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-gray-100 shadow-sm transition-all hover:border-yellow-200">
                        <span className="text-sm font-medium text-gray-800">
                          🏆 {a.title}
                        </span>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            +{a.points}pts
                          </Badge>
                          <button
                            onClick={() => setAchievements(achievements.filter((_, j) => j !== i))}
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
                  <p className="mb-3 text-sm font-semibold text-gray-800">Mood</p>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((mood) => (
                      <Badge
                        key={mood}
                        variant={selectedMoods.includes(mood) ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1.5 transition-colors ${selectedMoods.includes(mood) ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-white hover:bg-yellow-50 text-gray-600'}`}
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
                      <span className="font-semibold text-gray-800">Energy Level</span>
                      <span className="font-bold text-yellow-600">{energy[0]}/10</span>
                    </div>
                    <Slider value={energy} onValueChange={setEnergy} max={10} step={1} className="cursor-pointer" />
                  </div>
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="font-semibold text-gray-800">Alignment</span>
                      <span className="font-bold text-yellow-600">{alignment[0]}/10</span>
                    </div>
                    <Slider value={alignment} onValueChange={setAlignment} max={10} step={1} className="cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Shaping Tomorrow */}
              <div className="journal-section-blue rounded-xl p-6 shadow-sm border border-blue-100/50 bg-white">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Shaping Tomorrow
                  </h3>
                  <Button size="sm" className="gap-1 bg-blue-500 hover:bg-blue-600 text-white" onClick={addPriority} disabled={priorities.length >= 5}>
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
             <DailyAffirmation/>

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
                <p className="text-sm text-gray-400 mt-1">Connect with friends to share progress</p>
              </div>

              {/* Sticky Action Footer */}
              <div className="  bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 flex justify-center z-50">
                <div className="w-full max-w-4xl flex justify-end gap-3 px-4">
                  <Button variant="outline" onClick={() => navigate(-1)} className="bg-white hover:bg-gray-50">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEntry} className="bg-black hover:bg-gray-800 text-white shadow-md">
                    Save Entry - {format(selectedDate, "MMM d, yyyy")}
                  </Button>
                </div>
              </div>

            </div>
          </TabsContent>

          {/* PAST TAB CONTENT */}
          <TabsContent value="past" className="focus:outline-none">
            <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">Past entries will appear here.</p>
            </div>
          </TabsContent>

          {/* INSIGHTS TAB CONTENT */}
          <TabsContent value="insights" className="focus:outline-none">
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 text-5xl">💡</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No reflections yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Start journaling to see your challenges, insights, and gratitude patterns appear here over time.
              </p>
            </div>
          </TabsContent>

          {/* LETTERS TAB CONTENT */}
          <TabsContent value="letters" className="focus:outline-none">
  <LettersSection />
</TabsContent>
        </Tabs>

      </div>

      {/* Dialogs */}
      <AddAchievementDialog
        open={showAchievementDialog}
        onOpenChange={setShowAchievementDialog}
        onSubmit={(a) => setAchievements([...achievements, a])}
      />
    </div>
  );
};

export default DailyJournal;