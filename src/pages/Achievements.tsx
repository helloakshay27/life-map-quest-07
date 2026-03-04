import { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const API_BASE_URL = "https://life-api.lockated.com";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("auth_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  return response;
};

interface Badge {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  locked: boolean;
  description?: string;
  requirement?: string;
  category?: string;
}

interface BadgeRequirement {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  requirement: string;
  category: string;
  icon: string;
}

const Achievements = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([
    { id: "1", title: "Aarakthis", subtitle: "The Initiator", icon: "🏆", locked: true, category: "The Disciple" },
    { id: "2", title: "Tapasvi", subtitle: "The Disciplined", icon: "⚡", locked: true, category: "The Discipline" },
    { id: "3", title: "Nishthavan", subtitle: "The Dedicated", icon: "📚", locked: true, category: "The Discipline" },
    { id: "4", title: "Saptahik Yodha", subtitle: "Weekly Warrior", icon: "🎯", locked: true, category: "The Discipline" },
    { id: "5", title: "Masik Vijeta", subtitle: "Monthly Victor", icon: "🎪", locked: true, category: "The Discipline" },
    { id: "6", title: "Shaklaveer", subtitle: "The Centurion", icon: "💭", locked: true, category: "The Discipline" },
    { id: "7", title: "Chanakya", subtitle: "The Strategist", icon: "📖", locked: true, category: "The Wiseway" },
    { id: "8", title: "Arjun", subtitle: "The Focused", icon: "🧘", locked: true, category: "The Wiseway" },
    { id: "9", title: "Lakshya Vedhi", subtitle: "The Goal Hitter", icon: "⚙️", locked: true, category: "The Visionary" },
    { id: "10", title: "Vicharak", subtitle: "The Thinker", icon: "👑", locked: true, category: "The Visionary" },
    { id: "11", title: "Gyani", subtitle: "The Wise", icon: "📜", locked: true, category: "The Growth Engine" },
    { id: "12", title: "Sankat Mochan", subtitle: "The Troubleshooter", icon: "🌟", locked: true, category: "The Growth Engine" },
    { id: "13", title: "Karmayogi", subtitle: "The Doer", icon: "❤️", locked: true, category: "The Growth Engine" },
    { id: "14", title: "Vijayi", subtitle: "The Victor", icon: "⚔️", locked: true, category: "The Growth Engine" },
    { id: "15", title: "Abhaari", subtitle: "The Grateful", icon: "🔮", locked: true, category: "The Balanced Leader" },
    { id: "16", title: "Santulti", subtitle: "The Balanced", icon: "🌍", locked: true, category: "The Balanced Leader" },
    { id: "17", title: "Sanskari", subtitle: "Man of Values", icon: "🎖️", locked: true, category: "The Balanced Leader" },
    { id: "18", title: "Grihastha", subtitle: "The Family Man", icon: "🗺️", locked: true, category: "The Balanced Leader" },
    { id: "19", title: "Samrat", subtitle: "The Emperor", icon: "✨", locked: true, category: "Ultimate Rank" },
  ]);

  const badgeRequirements: BadgeRequirement[] = [
    {
      id: "1",
      title: "Aarakthis (The Initiator)",
      subtitle: "The Disciple",
      description: '"Every empire began with a single step. You have moved from thinking to doing."',
      requirement: "Submit at least 5 Daily Journal entries.",
      category: "The Disciple",
      icon: "🏆",
    },
    {
      id: "2",
      title: "Tapasvi (The Disciplined)",
      subtitle: "The Discipline",
      description: '"Consistency is your tapasya. You are building the muscle of discipline."',
      requirement: "Maintain a consecutive Daily Journal streak of 14 days.",
      category: "The Discipline",
      icon: "⚡",
    },
    {
      id: "3",
      title: "Nishthavan (The Dedicated)",
      subtitle: "The Discipline",
      description: '"You don\'t rely on motivation you rely on dedication. You have made growth a daily habit."',
      requirement: "Maintain a consecutive Daily Journal streak of 60 days.",
      category: "The Discipline",
      icon: "📚",
    },
    {
      id: "4",
      title: "Saptahik Yodha (Weekly Warrior)",
      subtitle: "The Discipline",
      description: '"She conquered the week without missing a beat. A true warrior of time management."',
      requirement: "Complete all 7 days of a single week in your Daily Journal.",
      category: "The Discipline",
      icon: "🎯",
    },
    {
      id: "5",
      title: "Masik Vijeta (Monthly Victor)",
      subtitle: "The Discipline",
      description: '"While others had a busy month, you had a productive one. You owned your calendar."',
      requirement: "Submit 25 or more Daily Journal entries in a single calendar month.",
      category: "The Discipline",
      icon: "🎪",
    },
    {
      id: "6",
      title: "Shaklaveer (The Centurion)",
      subtitle: "The Discipline",
      description: '"Like a master batsman, you have raised the bar for a century. You are a veteran of self-growth."',
      requirement: "Submit 100 or more Daily Journal entries in total.",
      category: "The Discipline",
      icon: "💭",
    },
    {
      id: "7",
      title: "Chanakya (The Strategist)",
      subtitle: "The Wiseway",
      description: '"You don\'t just work hard; you work smart. Like Chanakya, you arm the war before it begins."',
      requirement: 'Fill in "Strategic Priorities" in at least 20 Weekly Journal entries.',
      category: "The Wiseway",
      icon: "📖",
    },
    {
      id: "8",
      title: "Arjun (The Focused)",
      subtitle: "The Wiseway",
      description: '"You see only the bird\'s eye. By saying \'No\' to distractions, you have mastered the art of focus."',
      requirement: 'Fill in "Say \'No\' To" in at least 20 Weekly Journal entries.',
      category: "The Wiseway",
      icon: "🧘",
    },
    {
      id: "9",
      title: "Lakshya Vedhi (The Goal Hitter)",
      subtitle: "The Visionary",
      description: '"Your actions are not aimless; they are aimed straight at your targets."',
      requirement: 'Link goals in the "Goals to Focus" section of at least 20 Weekly Journal entries.',
      category: "The Visionary",
      icon: "⚙️",
    },
    {
      id: "10",
      title: "Vicharak (The Thinker)",
      subtitle: "The Visionary",
      description: '"You understand that an unexamined life is not worth living. You pause to think, so you can run faster."',
      requirement: "Submit 20 or more Weekly Journal entries in total.",
      category: "The Visionary",
      icon: "👑",
    },
    {
      id: "11",
      title: "Gyani (The Wise)",
      subtitle: "The Growth Engine",
      description: '"Knowledge is your greatest asset. You are accumulating a treasury of wisdom."',
      requirement: 'Write meaningful insights (50+ chars) in the "Challenges & Insights" field of 50+ Daily Journal entries.',
      category: "The Growth Engine",
      icon: "📜",
    },
    {
      id: "12",
      title: "Sankat Mochan (The Troubleshooter)",
      subtitle: "The Growth Engine",
      description: '"Problems do not scare you. You face challenges head-on and turn them into stepping stones."',
      requirement: 'Write meaningful insights in the "Challenges & Insights" field of 40+ Daily Journal entries.',
      category: "The Growth Engine",
      icon: "🌟",
    },
    {
      id: "13",
      title: "Karmayogi (The Doer)",
      subtitle: "The Growth Engine",
      description: '"You believe in Karma (Action). You don\'t just plan; you execute with precision."',
      requirement: "In the last 14 journal entries, have at least 20 tracked items with 90%+ completion rate.",
      category: "The Growth Engine",
      icon: "❤️",
    },
    {
      id: "14",
      title: "Vijayi (The Victor)",
      subtitle: "The Growth Engine",
      description: '"You keep your eye on the prize. You celebrate the victories that drive your business forward."',
      requirement: 'Mention victory keywords (title, revenue, deal, client, etc.) in "Top Wins" across 20+ Daily Journal entries.',
      category: "The Growth Engine",
      icon: "⚔️",
    },
    {
      id: "15",
      title: "Abhaari (The Grateful)",
      subtitle: "The Balanced Leader",
      description: '"You know that wealth is nothing without appreciation. You have a rich heart."',
      requirement: 'Fill in the "Gratitude" section in 100+ Daily Journal entries.',
      category: "The Balanced Leader",
      icon: "🔮",
    },
    {
      id: "16",
      title: "Santulti (The Balanced)",
      subtitle: "The Balanced Leader",
      description: '"Success is not just money; it is a peace of mind. You are mastering the art of balance."',
      requirement: "Maintain an average Alignment Score above 8 across your last 50 Daily Journal entries.",
      category: "The Balanced Leader",
      icon: "🌍",
    },
    {
      id: "17",
      title: "Sanskari (Man of Values)",
      subtitle: "The Balanced Leader",
      description: '"Business changes, but values remain. You are building a legacy on a strong foundation."',
      requirement: "Record values lived in 80+ Daily Journal entries.",
      category: "The Balanced Leader",
      icon: "🎖️",
    },
    {
      id: "18",
      title: "Grihastha (The Family Man)",
      subtitle: "The Balanced Leader",
      description: '"You work for them, not away from them. You are a hero at work and a hero at home."',
      requirement: 'Mention family-related keywords (wife, son, daughter, family, etc.) in "Gratitude" across 20+ Daily Journal entries.',
      category: "The Balanced Leader",
      icon: "🗺️",
    },
    {
      id: "19",
      title: "Samrat (The Emperor)",
      subtitle: "Ultimate Rank",
      description: '"You have mastered discipline, strategy, execution, and balance. You rule your life."',
      requirement: "Unlock 18 or more other badges.",
      category: "Ultimate Rank",
      icon: "✨",
    },
  ];

  // Load badges from localStorage/API on mount
  useEffect(() => {
    const loadBadges = async () => {
      try {
        const savedBadges = localStorage.getItem("user_badges");
        if (savedBadges) {
          setBadges(JSON.parse(savedBadges));
          return;
        }

        try {
          const response = await fetchWithAuth("/badges", { method: "GET" });
          if (response.ok) {
            const data = await response.json();
            setBadges(data);
            localStorage.setItem("user_badges", JSON.stringify(data));
          }
        } catch (apiError) {
          console.log("API unavailable, using local storage for badges");
        }
      } catch (error) {
        console.log("Using local storage for badges");
      }
    };

    loadBadges();
  }, []);

  const handleRefreshBadges = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing badges...", { id: "refresh-badges" });
    
    try {
      try {
        const response = await fetchWithAuth("/badges/refresh", {
          method: "POST",
        });
        if (response.ok) {
          const data = await response.json();
          setBadges(data);
          localStorage.setItem("user_badges", JSON.stringify(data));
          toast.success("Badges refreshed successfully!", { id: "refresh-badges" });
          setIsRefreshing(false);
          return;
        } else {
          toast.error("Failed to refresh badges. Using cached data.", { id: "refresh-badges" });
        }
      } catch (apiError) {
        console.log("API unavailable for refresh, using local data");
        toast.info("API unavailable. Showing cached badges.", { id: "refresh-badges" });
      }
    } catch (error) {
      console.error("Failed to refresh badges:", error);
      toast.error("An error occurred while refreshing badges.", { id: "refresh-badges" });
    } finally {
      setIsRefreshing(false);
    }
  };

  const earnedBadges = badges.filter((badge) => !badge.locked);
  const lockedBadges = badges.filter((badge) => badge.locked);

  return (
    <div className="animate-fade-in space-y-4 p-4 sm:p-6 max-w-6xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Achievements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your Hall of Fame</p>
        </div>
        <Button 
          className="gap-2 w-full sm:w-auto" 
          onClick={handleRefreshBadges}
          disabled={isRefreshing}
        >
          <Award className="h-4 w-4" />
          {isRefreshing ? "Refreshing..." : "Refresh Badges"}
        </Button>
      </div>

      {/* ── Your Progress Card ── */}
      <Card className="p-4 sm:p-6 space-y-4 sm:space-y-5" style={{ backgroundColor: "#fdf8f3" }}>

        {/* Header row: title + red points */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Your Progress</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Unlock achievements by journaling consistently
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold text-red-500">30</div>
            <p className="text-xs sm:text-sm text-muted-foreground">points</p>
          </div>
        </div>

        {/* Stats Grid — 3 cols × 2 rows */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-border space-y-1 sm:space-y-2">
            <span className="text-xl sm:text-2xl">🏆</span>
            <div className="text-lg sm:text-2xl font-bold text-foreground">0</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Badges</p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-border space-y-1 sm:space-y-2">
            <span className="text-xl sm:text-2xl">📖</span>
            <div className="text-lg sm:text-2xl font-bold text-foreground">0</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Daily Entries</p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-border space-y-1 sm:space-y-2">
            <span className="text-xl sm:text-2xl">📅</span>
            <div className="text-lg sm:text-2xl font-bold text-foreground">0</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Weekly Entries</p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-border space-y-1 sm:space-y-2">
            <span className="text-xl sm:text-2xl">🎯</span>
            <div className="text-lg sm:text-2xl font-bold text-foreground">0</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Goals</p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-border space-y-1 sm:space-y-2">
            <span className="text-xl sm:text-2xl">✨</span>
            <div className="text-lg sm:text-2xl font-bold text-foreground">6</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Bucket List</p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-border space-y-1 sm:space-y-2">
            <span className="text-xl sm:text-2xl">⭐</span>
            <div className="text-lg sm:text-2xl font-bold text-foreground">0 / 19</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Unlocked</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={0} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">0% Badges Unlocked</p>
        </div>
      </Card>

      {/* ── Badges Tabs Card ── */}
      <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <Tabs defaultValue="earned" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="earned" className="flex-1 sm:flex-none text-sm">
              My Badges ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="how-to-earn" className="flex-1 sm:flex-none text-sm">
              How to Earn
            </TabsTrigger>
          </TabsList>

          {/* Earned Badges Tab */}
          <TabsContent value="earned" className="space-y-4">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">
              Earned ({earnedBadges.length})
            </h3>
            {earnedBadges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  No badges earned yet. Start journaling to unlock your first badge!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-3 text-center border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50"
                  >
                    <div className="text-2xl sm:text-3xl mb-1">{badge.icon}</div>
                    <p className="text-xs font-medium text-foreground leading-tight">{badge.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{badge.subtitle}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* How to Earn Tab */}
          <TabsContent value="how-to-earn" className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">How to Earn Badges</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Complete the following activities to unlock each badge. Badges are awarded automatically when you click "Refresh Badges".
                </p>
              </div>

              <div className="space-y-3">
                {badgeRequirements.map((badge) => (
                  <Card
                    key={badge.id}
                    className="p-3 sm:p-4 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">{badge.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-0.5 xs:gap-2">
                          <div>
                            <h4 className="font-semibold text-sm text-foreground leading-snug">{badge.title}</h4>
                            <p className="text-[11px] text-muted-foreground">{badge.subtitle}</p>
                          </div>
                          <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 mt-0.5">
                            {badge.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic my-1.5 leading-snug">
                          {badge.description}
                        </p>
                        <div className="flex items-start gap-1.5">
                          <span className="text-orange-500 text-xs flex-shrink-0 mt-0.5">⊙</span>
                          <p className="text-xs text-foreground leading-snug">{badge.requirement}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* ── Locked Badges Card ── */}
      <Card className="p-4 sm:p-6 space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-foreground">Locked ({lockedBadges.length})</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {lockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center p-3 text-center border border-border rounded-lg bg-muted/20 opacity-50"
            >
              <div className="text-2xl sm:text-3xl mb-1 relative">
                {badge.icon}
                <span className="absolute -top-1 -right-1 text-xs">🔒</span>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-foreground leading-tight">{badge.title}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{badge.subtitle}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default Achievements;