import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Calendar, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const { user } = useAuth();

  const timePeriods = [
    { label: "Daily", active: true },
    { label: "Weekly", active: false },
    { label: "Monthly", active: false },
    { label: "Q1-Q2", active: false },
    { label: "Skiller", active: false },
  ];

  const motivationItems = [
    { icon: "🔥", label: "DAILY MOTIVATOR", desc: "Let the seeds you plant today blossom tomorrow. Find those one light..." },
    { icon: "🎯", label: "ACTION", desc: "Take 10 mins right now to guide you. Discover a new habit card today." },
    { icon: "⭐", label: "PURPOSE", desc: "Give your year a purpose. Check priorities in daily journal." },
  ];

  const leaderboardData = [
    { name: "Ravi Naik", score: 1000 },
    { name: "Anil Gupta", score: 880 },
    { name: "Yash Mhasunure", score: 840 },
    { name: "Kul Kul", score: 770 },
    { name: "LS Mazara", score: 760 },
    { name: "Suman Agarwal", score: 695 },
    { name: "Deepti Tolia", score: 672 },
    { name: "Rusali K Gaonka", score: 670 },
    { name: "Dr Mandi Gupta", score: 615 },
    { name: "Vikas Agarwala", score: 605 },
    { name: "Sunandsvedi Patil", score: 580 },
  ];

  const bucketListItems = [
    { title: "Run a marathon", tags: ["Planning", "Personal"] },
    { title: "Start a side business", tags: ["Completed", "Career"] },
    { title: "Write a book", tags: ["Dreaming", "Personal"] },
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const lifeAreas = ["Career", "Finances", "Health", "Personal Growth", "Relationships"];

  return (
    <div className="animate-fade-in space-y-6 w-full max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8">

      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome Back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground mt-1">Let's align your day with your purpose</p>
      </div>

      {/* Time Period Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {timePeriods.map((period) => (
          <Badge
            key={period.label}
            variant={period.active ? "default" : "outline"}
            className="cursor-pointer px-3 py-1.5 text-xs font-medium whitespace-nowrap flex-shrink-0"
          >
            {period.label}
          </Badge>
        ))}
      </div>

      {/* Daily Focus & Inspiration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Daily Focus & Inspiration</h2>
        </div>
        {/* Stack on mobile, 3-col on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {motivationItems.map((item) => (
            <Card
              key={item.label}
              className="p-4 border-l-4 border-l-orange-400 hover:shadow-md transition-shadow w-full"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-foreground">{item.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Priorities, Aura Energy, Alignment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-t-4 border-t-blue-400">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="text-lg">📋</span> Priorities
          </h3>
          <p className="text-xs text-muted-foreground mb-2">For Mar 04</p>
          <div className="space-y-2">
            <p className="text-xs text-center text-gray-400">No priorities or todos</p>
            <p className="text-xs text-blue-600 hover:underline cursor-pointer">Set in daily journal →</p>
          </div>
        </Card>

        <Card className="p-4 border-t-4 border-t-orange-400">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" /> Aura Energy
          </h3>
          <div className="flex justify-between">
            {weekDays.map((day) => (
              <div key={day} className="text-xs text-center font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Upcoming</p>
        </Card>

        <Card className="p-4 border-t-4 border-t-purple-400">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="text-lg">✨</span> Alignment
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>This Week</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="text-xs text-gray-400 text-center">Upcoming</div>
          </div>
        </Card>
      </div>

      {/* Highlight Rank & Journaling Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 border-t-4 border-t-yellow-400">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-500" /> Highlight Rank
          </h3>
          <p className="text-xs text-gray-500 mb-2">View All</p>
          <p className="text-xs text-gray-400">No bangers yet</p>
          <p className="text-xs text-gray-500 mt-2">Start journaling to see bangers</p>
          <div className="mt-3 pt-3 border-t text-xs">
            <p className="font-medium">Total Unlocked</p>
          </div>
        </Card>

        <Card className="p-4 border-t-4 border-t-cyan-400">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-500" /> Journaling Status
          </h3>
          <p className="text-xs text-gray-500 mb-2">Daily (0)| Hrs - 4 Mins</p>
          <div className="flex justify-between">
            {weekDays.map((day) => (
              <div key={day} className="text-xs text-center text-gray-400">
                {day.substring(0, 1)}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">0% Complete</p>
        </Card>
      </div>

      {/* Purpose & Direction Banner */}
      <Card className="p-8 bg-red-500 text-white text-center rounded-lg">
        <div className="flex justify-center mb-2">
          <span className="text-3xl">✨</span>
        </div>
        <h3 className="font-semibold text-lg">Define your mission to guide your journey</h3>
      </Card>

      {/* Execution & Tracking */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Execution & Tracking</h2>
        <Card className="p-6 border-t-4 border-t-orange-400">
          <h3 className="font-semibold text-sm mb-6 flex items-center gap-2">
            <span className="text-lg">📓</span> Journaling Consistency
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Last 30 Days</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground mb-2">Consistency Score</p>
            <div className="bg-gray-200 rounded-full h-2 mb-2"></div>
            <p className="text-xs text-gray-500">0%</p>
          </div>
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs font-medium text-foreground mb-4">Life Balance (Last 7 Days)</p>
            <div className="h-40 flex items-end justify-around gap-2">
              {lifeAreas.map((label) => (
                <div key={label} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full max-w-[40px] h-20 bg-gray-200 rounded mx-auto"></div>
                  <span className="text-[10px] sm:text-xs text-gray-500 text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Review & Growth */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Review & Growth</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">Recent Journal Entries</h3>
            <p className="text-xs text-gray-400 text-center py-4">No entries yet. Start journaling today!</p>
          </Card>

          <Card className="p-4 bg-purple-50">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="text-lg">✨</span> Personalized Insights
            </h3>
            <p className="text-xs text-gray-600">Start journaling to discover patterns and insights about your journey</p>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">Bucket List Dreams</h3>
              <a href="#" className="text-xs text-blue-600 hover:underline">View All</a>
            </div>
            <div className="space-y-2">
              {bucketListItems.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Leaderboard */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="text-lg">🏆</span> Leaderboard
          </h3>
          <a href="#" className="text-xs text-blue-600 hover:underline">View All</a>
        </div>
        <div className="space-y-2">
          {leaderboardData.map((person, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 text-sm border-b last:border-b-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {person.name[0]}
                </div>
                <span className="text-foreground truncate">{person.name}</span>
              </div>
              <span className="font-semibold text-foreground ml-4 flex-shrink-0">{person.score}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Beta Testing Notice */}
      <Card className="p-4 bg-red-50 border-l-4 border-l-red-500">
        <div className="flex gap-3">
          <span className="text-lg flex-shrink-0">🔔</span>
          <div>
            <h4 className="font-semibold text-sm text-red-800">Beta Testing Notice</h4>
            <p className="text-xs text-red-700 mt-1">
              We are continuously improving your experience. If you face any challenges, we cannot provide performance guarantees at this stage. We recommend bookmarking your regularly for safekeeping.
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default Dashboard;