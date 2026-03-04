import { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const API_BASE_URL = "https://api.lifecompass.lockated.com";

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

// ── Stat Icons (colored SVGs) ──────────────────────────────────────────────
const StatIcon = ({ type }: { type: string }) => {
  const icons: Record<string, JSX.Element> = {
    badges: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#e07b39" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <circle cx="12" cy="8" r="6" />
      </svg>
    ),
    daily: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="13" x2="15" y2="13" />
      </svg>
    ),
    weekly: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="9" y1="15" x2="9.01" y2="15" /><line x1="12" y1="15" x2="12.01" y2="15" /><line x1="15" y1="15" x2="15.01" y2="15" />
      </svg>
    ),
    goals: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
    bucket: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    unlocked: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        <line x1="12" y1="2" x2="12" y2="22" strokeOpacity="0" />
      </svg>
    ),
  };
  return icons[type] ?? null;
};

// ── Badge SVG Icon Map ─────────────────────────────────────────────────────
const BadgeSVG = ({ id, locked }: { id: string; locked: boolean }) => {
  const color = locked ? "#9ca3af" : "#d97706";
  const bg = locked
    ? "url(#lockedGrad)"
    : "url(#earnedGrad)";

  const paths: Record<string, JSX.Element> = {
    // Aarambhak – footprint
    "1": (
      <>
        <ellipse cx="10" cy="14" rx="2.5" ry="3.5" transform="rotate(-10 10 14)" stroke={locked ? "#fff" : "#fff"} strokeWidth="1.4" fill="none"/>
        <ellipse cx="15" cy="12" rx="2.5" ry="3.5" transform="rotate(10 15 12)" stroke={locked ? "#fff" : "#fff"} strokeWidth="1.4" fill="none"/>
        <circle cx="8" cy="10" r="1" fill={locked ? "#fff" : "#fff"}/>
        <circle cx="11" cy="9" r="1" fill={locked ? "#fff" : "#fff"}/>
        <circle cx="14" cy="8.5" r="1" fill={locked ? "#fff" : "#fff"}/>
        <circle cx="17" cy="9.5" r="1" fill={locked ? "#fff" : "#fff"}/>
      </>
    ),
    // Tapasvi – flame
    "2": (
      <path d="M12 4c0 0-5 4-5 9a5 5 0 0 0 10 0c0-2.5-2-5-2-5s-1 2.5-3 3c0-2-1-4 0-7z" stroke="#fff" strokeWidth="1.4" fill="none"/>
    ),
    // Nishthavan – tree
    "3": (
      <>
        <polygon points="12,5 6,14 18,14" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <polygon points="12,10 7,18 17,18" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <line x1="12" y1="18" x2="12" y2="22" stroke="#fff" strokeWidth="1.4"/>
      </>
    ),
    // Saptahik Yodha – sword + shield
    "4": (
      <>
        <path d="M8 20 L16 8 L18 10 L10 22 Z" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <path d="M16 8 L18 6 L20 8 L18 10 Z" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <path d="M6 18 L8 20" stroke="#fff" strokeWidth="1.3"/>
      </>
    ),
    // Masik Vijeta – trophy
    "5": (
      <>
        <path d="M8 6 h8 v6 a4 4 0 0 1-8 0 Z" stroke="#fff" strokeWidth="1.4" fill="none"/>
        <path d="M8 9 H6 a2 2 0 0 1 0-3 H8" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <path d="M16 9 H18 a2 2 0 0 0 0-3 H16" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <line x1="12" y1="16" x2="12" y2="19" stroke="#fff" strokeWidth="1.4"/>
        <line x1="9" y1="19" x2="15" y2="19" stroke="#fff" strokeWidth="1.4"/>
      </>
    ),
    // Shaklaveer – "100"
    "6": (
      <>
        <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff" fontFamily="sans-serif">100</text>
      </>
    ),
    // Chanakya – scroll
    "7": (
      <>
        <rect x="7" y="6" width="10" height="13" rx="1" stroke="#fff" strokeWidth="1.4" fill="none"/>
        <line x1="9.5" y1="10" x2="14.5" y2="10" stroke="#fff" strokeWidth="1.2"/>
        <line x1="9.5" y1="13" x2="14.5" y2="13" stroke="#fff" strokeWidth="1.2"/>
        <line x1="9.5" y1="16" x2="12.5" y2="16" stroke="#fff" strokeWidth="1.2"/>
        <path d="M7 7 Q5 7 5 9 Q5 11 7 11" stroke="#fff" strokeWidth="1.2" fill="none"/>
      </>
    ),
    // Arjun – bow & arrow
    "8": (
      <>
        <path d="M7 5 Q18 12 7 19" stroke="#fff" strokeWidth="1.4" fill="none"/>
        <line x1="17" y1="8" x2="8" y2="16" stroke="#fff" strokeWidth="1.3"/>
        <polygon points="8,16 10,14 11,17" fill="#fff"/>
        <line x1="7" y1="5" x2="7" y2="19" stroke="#fff" strokeWidth="1.1" strokeDasharray="2,2"/>
      </>
    ),
    // Lakshya Vedhi – bullseye target
    "9": (
      <>
        <circle cx="12" cy="12" r="7" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <circle cx="12" cy="12" r="4.5" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <circle cx="12" cy="12" r="2" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <line x1="18" y1="6" x2="14" y2="10" stroke="#fff" strokeWidth="1.3"/>
        <polygon points="18,4 20,8 16,8" fill="#fff"/>
      </>
    ),
    // Vicharak – open hand with book
    "10": (
      <>
        <path d="M8 14 V9 a1.5 1.5 0 0 1 3 0 V13" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <path d="M11 12 V8 a1.5 1.5 0 0 1 3 0 V12" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <path d="M14 12.5 V9 a1.5 1.5 0 0 1 3 0 V14 a3 3 0 0 1-3 3 H11 a3 3 0 0 1-3-3 V14" stroke="#fff" strokeWidth="1.3" fill="none"/>
      </>
    ),
    // Gyani – open book
    "11": (
      <>
        <path d="M4 19 V7 Q12 5 12 8 Q12 5 20 7 V19 Q12 17 12 19 Q12 17 4 19 Z" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <line x1="12" y1="8" x2="12" y2="19" stroke="#fff" strokeWidth="1.2"/>
      </>
    ),
    // Sankat Mochan – raised fist
    "12": (
      <>
        <rect x="8" y="10" width="8" height="7" rx="2" stroke="#fff" strokeWidth="1.4" fill="none"/>
        <rect x="8" y="7" width="2" height="5" rx="1" stroke="#fff" strokeWidth="1.2" fill="none"/>
        <rect x="10" y="6" width="2" height="5" rx="1" stroke="#fff" strokeWidth="1.2" fill="none"/>
        <rect x="12" y="6.5" width="2" height="5" rx="1" stroke="#fff" strokeWidth="1.2" fill="none"/>
        <rect x="14" y="7" width="2" height="5" rx="1" stroke="#fff" strokeWidth="1.2" fill="none"/>
        <path d="M6 12 Q5 12 5 13.5 Q5 15 6 15 H8" stroke="#fff" strokeWidth="1.2" fill="none"/>
      </>
    ),
    // Karmayogi – gear with hand/action
    "13": (
      <>
        <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.4" fill="none"/>
        <path d="M12 5V7M12 17V19M5 12H7M17 12H19M7.05 7.05l1.41 1.41M15.54 15.54l1.41 1.41M7.05 16.95l1.41-1.41M15.54 8.46l1.41-1.41" stroke="#fff" strokeWidth="1.3"/>
      </>
    ),
    // Vijayi – laurel wreath
    "14": (
      <>
        <path d="M8 18 Q4 14 5 10 Q6 6 8 7 Q6 11 8 14" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <path d="M16 18 Q20 14 19 10 Q18 6 16 7 Q18 11 16 14" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <path d="M9 7 Q10 5 12 5 Q14 5 15 7" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <line x1="9" y1="19" x2="15" y2="19" stroke="#fff" strokeWidth="1.4"/>
      </>
    ),
    // Abhaari – lotus / leaf
    "15": (
      <>
        <path d="M12 19 Q6 13 9 8 Q11 5 12 7 Q13 5 15 8 Q18 13 12 19Z" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <path d="M12 7 L12 19" stroke="#fff" strokeWidth="1.1"/>
        <path d="M9 8 Q10 12 12 13" stroke="#fff" strokeWidth="1.1" fill="none"/>
        <path d="M15 8 Q14 12 12 13" stroke="#fff" strokeWidth="1.1" fill="none"/>
      </>
    ),
    // Santulti – balance scales
    "16": (
      <>
        <line x1="12" y1="5" x2="12" y2="19" stroke="#fff" strokeWidth="1.4"/>
        <line x1="6" y1="8" x2="18" y2="8" stroke="#fff" strokeWidth="1.3"/>
        <path d="M6 8 l-2 4 a2 2 0 0 0 4 0 Z" stroke="#fff" strokeWidth="1.2" fill="none"/>
        <path d="M18 8 l-2 4 a2 2 0 0 0 4 0 Z" stroke="#fff" strokeWidth="1.2" fill="none"/>
        <line x1="9" y1="19" x2="15" y2="19" stroke="#fff" strokeWidth="1.4"/>
      </>
    ),
    // Sanskari – diya / flame lamp
    "17": (
      <>
        <path d="M7 14 Q7 18 12 19 Q17 18 17 14 H7Z" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <path d="M10 14 Q11 11 12 9 Q13 11 14 14" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <path d="M12 9 Q11 7 12 5 Q13 7 12 9" stroke="#fff" strokeWidth="1.4" fill="none"/>
      </>
    ),
    // Grihastha – house
    "18": (
      <>
        <path d="M3 12 L12 4 L21 12" stroke="#fff" strokeWidth="1.4" fill="none"/>
        <path d="M5 10 V20 H10 V15 H14 V20 H19 V10" stroke="#fff" strokeWidth="1.3" fill="none"/>
        <rect x="10" y="15" width="4" height="5" stroke="#fff" strokeWidth="1.2" fill="none"/>
      </>
    ),
    // Samrat – crown
    "19": (
      <>
        <path d="M4 17 L4 11 L8 14 L12 7 L16 14 L20 11 L20 17 Z" stroke="#fff" strokeWidth="1.4" fill="none"/>
        <line x1="4" y1="19" x2="20" y2="19" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="12" cy="7" r="1.2" fill="#fff"/>
        <circle cx="4" cy="11" r="1" fill="#fff"/>
        <circle cx="20" cy="11" r="1" fill="#fff"/>
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lockedGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#d1d5db"/>
          <stop offset="100%" stopColor="#6b7280"/>
        </radialGradient>
        <radialGradient id="earnedGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#d97706"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={bg} />
      <circle cx="12" cy="12" r="11" fill="none" stroke={locked ? "#9ca3af" : "#f59e0b"} strokeWidth="0.5" opacity="0.6"/>
      {paths[id] ?? null}
    </svg>
  );
};

// ── Circular Badge Component ───────────────────────────────────────────────
const BadgeCircle = ({
  id,
  title,
  subtitle,
  locked,
  size = "md",
}: {
  id: string;
  title: string;
  subtitle: string;
  locked: boolean;
  size?: "sm" | "md";
}) => {
  const dim = size === "sm" ? "w-14 h-14 sm:w-16 sm:h-16" : "w-16 h-16 sm:w-20 sm:h-20";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`${dim} rounded-full relative`} style={{ filter: locked ? "grayscale(0.3)" : "none" }}>
        <BadgeSVG id={id} locked={locked} />
        {locked && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm border border-gray-200">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-[11px] sm:text-xs font-medium text-foreground leading-tight">{title}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">{subtitle}</p>
      </div>
    </div>
  );
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
    { id: "1", title: "Aarakthis (The Initiator)", subtitle: "The Disciple", description: '"Every empire began with a single step. You have moved from thinking to doing."', requirement: "Submit at least 5 Daily Journal entries.", category: "The Disciple", icon: "🏆" },
    { id: "2", title: "Tapasvi (The Disciplined)", subtitle: "The Discipline", description: '"Consistency is your tapasya. You are building the muscle of discipline."', requirement: "Maintain a consecutive Daily Journal streak of 14 days.", category: "The Discipline", icon: "⚡" },
    { id: "3", title: "Nishthavan (The Dedicated)", subtitle: "The Discipline", description: '"You don\'t rely on motivation you rely on dedication. You have made growth a daily habit."', requirement: "Maintain a consecutive Daily Journal streak of 60 days.", category: "The Discipline", icon: "📚" },
    { id: "4", title: "Saptahik Yodha (Weekly Warrior)", subtitle: "The Discipline", description: '"She conquered the week without missing a beat. A true warrior of time management."', requirement: "Complete all 7 days of a single week in your Daily Journal.", category: "The Discipline", icon: "🎯" },
    { id: "5", title: "Masik Vijeta (Monthly Victor)", subtitle: "The Discipline", description: '"While others had a busy month, you had a productive one. You owned your calendar."', requirement: "Submit 25 or more Daily Journal entries in a single calendar month.", category: "The Discipline", icon: "🎪" },
    { id: "6", title: "Shaklaveer (The Centurion)", subtitle: "The Discipline", description: '"Like a master batsman, you have raised the bar for a century. You are a veteran of self-growth."', requirement: "Submit 100 or more Daily Journal entries in total.", category: "The Discipline", icon: "💭" },
    { id: "7", title: "Chanakya (The Strategist)", subtitle: "The Wiseway", description: '"You don\'t just work hard; you work smart. Like Chanakya, you arm the war before it begins."', requirement: 'Fill in "Strategic Priorities" in at least 20 Weekly Journal entries.', category: "The Wiseway", icon: "📖" },
    { id: "8", title: "Arjun (The Focused)", subtitle: "The Wiseway", description: '"You see only the bird\'s eye. By saying \'No\' to distractions, you have mastered the art of focus."', requirement: 'Fill in "Say \'No\' To" in at least 20 Weekly Journal entries.', category: "The Wiseway", icon: "🧘" },
    { id: "9", title: "Lakshya Vedhi (The Goal Hitter)", subtitle: "The Visionary", description: '"Your actions are not aimless; they are aimed straight at your targets."', requirement: 'Link goals in the "Goals to Focus" section of at least 20 Weekly Journal entries.', category: "The Visionary", icon: "⚙️" },
    { id: "10", title: "Vicharak (The Thinker)", subtitle: "The Visionary", description: '"You understand that an unexamined life is not worth living. You pause to think, so you can run faster."', requirement: "Submit 20 or more Weekly Journal entries in total.", category: "The Visionary", icon: "👑" },
    { id: "11", title: "Gyani (The Wise)", subtitle: "The Growth Engine", description: '"Knowledge is your greatest asset. You are accumulating a treasury of wisdom."', requirement: 'Write meaningful insights (50+ chars) in the "Challenges & Insights" field of 50+ Daily Journal entries.', category: "The Growth Engine", icon: "📜" },
    { id: "12", title: "Sankat Mochan (The Troubleshooter)", subtitle: "The Growth Engine", description: '"Problems do not scare you. You face challenges head-on and turn them into stepping stones."', requirement: 'Write meaningful insights in the "Challenges & Insights" field of 40+ Daily Journal entries.', category: "The Growth Engine", icon: "🌟" },
    { id: "13", title: "Karmayogi (The Doer)", subtitle: "The Growth Engine", description: '"You believe in Karma (Action). You don\'t just plan; you execute with precision."', requirement: "In the last 14 journal entries, have at least 20 tracked items with 90%+ completion rate.", category: "The Growth Engine", icon: "❤️" },
    { id: "14", title: "Vijayi (The Victor)", subtitle: "The Growth Engine", description: '"You keep your eye on the prize. You celebrate the victories that drive your business forward."', requirement: 'Mention victory keywords (title, revenue, deal, client, etc.) in "Top Wins" across 20+ Daily Journal entries.', category: "The Growth Engine", icon: "⚔️" },
    { id: "15", title: "Abhaari (The Grateful)", subtitle: "The Balanced Leader", description: '"You know that wealth is nothing without appreciation. You have a rich heart."', requirement: 'Fill in the "Gratitude" section in 100+ Daily Journal entries.', category: "The Balanced Leader", icon: "🔮" },
    { id: "16", title: "Santulti (The Balanced)", subtitle: "The Balanced Leader", description: '"Success is not just money; it is a peace of mind. You are mastering the art of balance."', requirement: "Maintain an average Alignment Score above 8 across your last 50 Daily Journal entries.", category: "The Balanced Leader", icon: "🌍" },
    { id: "17", title: "Sanskari (Man of Values)", subtitle: "The Balanced Leader", description: '"Business changes, but values remain. You are building a legacy on a strong foundation."', requirement: "Record values lived in 80+ Daily Journal entries.", category: "The Balanced Leader", icon: "🎖️" },
    { id: "18", title: "Grihastha (The Family Man)", subtitle: "The Balanced Leader", description: '"You work for them, not away from them. You are a hero at work and a hero at home."', requirement: 'Mention family-related keywords (wife, son, daughter, family, etc.) in "Gratitude" across 20+ Daily Journal entries.', category: "The Balanced Leader", icon: "🗺️" },
    { id: "19", title: "Samrat (The Emperor)", subtitle: "Ultimate Rank", description: '"You have mastered discipline, strategy, execution, and balance. You rule your life."', requirement: "Unlock 18 or more other badges.", category: "Ultimate Rank", icon: "✨" },
  ];

  // Load badges from localStorage on mount
  useEffect(() => {
    const loadBadges = async () => {
      try {
        const savedBadges = localStorage.getItem("user_badges");
        if (savedBadges) {
          setBadges(JSON.parse(savedBadges));
        }
      } catch (error) {
        console.log("Error loading badges from storage");
      }
    };
    loadBadges();
  }, []);

  const handleRefreshBadges = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing badges...", { id: "refresh-badges" });
    try {
      // Refresh from localStorage
      const savedBadges = localStorage.getItem("user_badges");
      if (savedBadges) {
        setBadges(JSON.parse(savedBadges));
        toast.success("Badges refreshed successfully!", { id: "refresh-badges" });
      } else {
        toast.info("No cached badges found.", { id: "refresh-badges" });
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
          {[
            { type: "badges", value: "0", label: "Badges" },
            { type: "daily", value: "0", label: "Daily Entries" },
            { type: "weekly", value: "0", label: "Weekly Entries" },
            { type: "goals", value: "0", label: "Goals" },
            { type: "bucket", value: "6", label: "Bucket List" },
            { type: "unlocked", value: "0 / 19", label: "Unlocked" },
          ].map(({ type, value, label }) => (
            <div
              key={type}
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-border space-y-1 sm:space-y-2"
            >
              <StatIcon type={type} />
              <div className="text-lg sm:text-2xl font-bold text-foreground">{value}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#f0e6d8" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: "0%",
                background: "linear-gradient(90deg, #f97316 0%, #ef4444 100%)",
                boxShadow: "0 0 8px rgba(249,115,22,0.4)",
              }}
            />
          </div>
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
                <div className="mb-3 w-12 h-12 opacity-30">
                  <BadgeSVG id="5" locked={true} />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  No badges earned yet. Start journaling to unlock your first badge!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {earnedBadges.map((badge) => (
                  <BadgeCircle
                    key={badge.id}
                    id={badge.id}
                    title={badge.title}
                    subtitle={badge.subtitle}
                    locked={false}
                  />
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
                      {/* Circular badge icon */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 mt-0.5">
                        <BadgeSVG id={badge.id} locked={true} />
                      </div>
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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {lockedBadges.map((badge) => (
            <BadgeCircle
              key={badge.id}
              id={badge.id}
              title={badge.title}
              subtitle={badge.subtitle}
              locked={true}
            />
          ))}
        </div>
      </Card>

    </div>
  );
};

export default Achievements;