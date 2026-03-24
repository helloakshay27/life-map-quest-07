import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle, WifiOff, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const API_BASE_URL = "https://life-api.lockated.com";

const getToken = (): string | null =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  localStorage.getItem("userToken") ||
  null;

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  if (!token) return { "Content-Type": "application/json" };
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const safeFetch = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: unknown }> => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...(options.headers ?? {}) },
    });
    console.log(`[Achievements] GET ${endpoint} → ${res.status}`);
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {}
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error(`[Achievements] Network error:`, err);
    return { ok: false, status: 0, data: null };
  }
};

interface Badge {
  id: string;
  title: string;
  subtitle: string;
  locked: boolean;
  category: string;
}
interface AchievementStats {
  points: number;
  total_badges: number;
  daily_entries: number;
  weekly_entries: number;
  goals_count: number;
  bucket_list_count: number;
  unlocked_count: number;
  percent: number;
}
type ApiErrorType =
  | "no_token"
  | "unauthorized"
  | "not_found"
  | "server_error"
  | "network"
  | null;

const BADGE_DEFS: Array<{
  id: string;
  title: string;
  subtitle: string;
  category: string;
}> = [
  {
    id: "1",
    title: "Aarambhak",
    subtitle: "The Initiator",
    category: "The Disciple",
  },
  {
    id: "2",
    title: "Tapasvi",
    subtitle: "The Disciplined",
    category: "The Discipline",
  },
  {
    id: "3",
    title: "Nishthavan",
    subtitle: "The Dedicated",
    category: "The Discipline",
  },
  {
    id: "4",
    title: "Saptahik Yodha",
    subtitle: "Weekly Warrior",
    category: "The Discipline",
  },
  {
    id: "5",
    title: "Masik Vijeta",
    subtitle: "Monthly Victor",
    category: "The Discipline",
  },
  {
    id: "6",
    title: "Shatakveer",
    subtitle: "The Centurion",
    category: "The Discipline",
  },
  {
    id: "7",
    title: "Chanakya",
    subtitle: "The Strategist",
    category: "The Wiseway",
  },
  { id: "8", title: "Arjun", subtitle: "The Focused", category: "The Wiseway" },
  {
    id: "9",
    title: "Vicharak",
    subtitle: "The Thinker",
    category: "The Visionary",
  },
  {
    id: "10",
    title: "Gyani",
    subtitle: "The Wise",
    category: "The Growth Engine",
  },
  {
    id: "11",
    title: "Sankat Mochan",
    subtitle: "The Troubleshooter",
    category: "The Growth Engine",
  },
  {
    id: "12",
    title: "Karmayogi",
    subtitle: "The Doer",
    category: "The Growth Engine",
  },
  {
    id: "13",
    title: "Vijayi",
    subtitle: "The Victor",
    category: "The Growth Engine",
  },
  {
    id: "14",
    title: "Abhaari",
    subtitle: "The Grateful",
    category: "The Balanced Leader",
  },
  {
    id: "15",
    title: "Santulit",
    subtitle: "The Balanced",
    category: "The Balanced Leader",
  },
  {
    id: "16",
    title: "Sanskar",
    subtitle: "Man of Values",
    category: "The Balanced Leader",
  },
  {
    id: "17",
    title: "Grihastha",
    subtitle: "The Family Man",
    category: "The Balanced Leader",
  },
  {
    id: "18",
    title: "Samrat",
    subtitle: "The Emperor",
    category: "Ultimate Rank",
  },
];

const BADGE_REQUIREMENTS = [
  {
    id: "1",
    title: "Aarambhak (The Initiator)",
    category: "The Disciple",
    description: '"Every empire began with a single step."',
    requirement: "Submit at least 5 Daily Journal entries.",
  },
  {
    id: "2",
    title: "Tapasvi (The Disciplined)",
    category: "The Discipline",
    description: '"Consistency is your tapasya."',
    requirement: "Maintain a consecutive Daily Journal streak of 14 days.",
  },
  {
    id: "3",
    title: "Nishthavan (The Dedicated)",
    category: "The Discipline",
    description: '"You have made growth a daily habit."',
    requirement: "Maintain a consecutive Daily Journal streak of 60 days.",
  },
  {
    id: "4",
    title: "Saptahik Yodha (Weekly Warrior)",
    category: "The Discipline",
    description: '"A true warrior of time management."',
    requirement: "Complete all 7 days of a single week in your Daily Journal.",
  },
  {
    id: "5",
    title: "Masik Vijeta (Monthly Victor)",
    category: "The Discipline",
    description: '"You owned your calendar."',
    requirement:
      "Submit 25 or more Daily Journal entries in a single calendar month.",
  },
  {
    id: "6",
    title: "Shatakveer (The Centurion)",
    category: "The Discipline",
    description: '"You are a veteran of self-growth."',
    requirement: "Submit 100 or more Daily Journal entries in total.",
  },
  {
    id: "7",
    title: "Chanakya (The Strategist)",
    category: "The Wiseway",
    description: '"You don\'t just work hard; you work smart."',
    requirement:
      'Fill in "Strategic Priorities" in at least 20 Weekly Journal entries.',
  },
  {
    id: "8",
    title: "Arjun (The Focused)",
    category: "The Wiseway",
    description: '"You have mastered the art of focus."',
    requirement: 'Fill in "Say No To" in at least 20 Weekly Journal entries.',
  },
  {
    id: "9",
    title: "Vicharak (The Thinker)",
    category: "The Visionary",
    description: '"You pause to think, so you can run faster."',
    requirement: "Submit 20 or more Weekly Journal entries in total.",
  },
  {
    id: "10",
    title: "Gyani (The Wise)",
    category: "The Growth Engine",
    description: '"You are accumulating a treasury of wisdom."',
    requirement:
      'Write meaningful insights (50+ chars) in "Challenges & Insights" in 50+ Daily Journal entries.',
  },
  {
    id: "11",
    title: "Sankat Mochan (The Troubleshooter)",
    category: "The Growth Engine",
    description: '"You turn challenges into stepping stones."',
    requirement:
      'Write meaningful insights in "Challenges & Insights" in 40+ Daily Journal entries.',
  },
  {
    id: "12",
    title: "Karmayogi (The Doer)",
    category: "The Growth Engine",
    description: '"You don\'t just plan; you execute with precision."',
    requirement:
      "In the last 14 journal entries, have 20+ tracked items with 90%+ completion.",
  },
  {
    id: "13",
    title: "Vijayi (The Victor)",
    category: "The Growth Engine",
    description: '"You celebrate victories that drive your business forward."',
    requirement:
      'Mention victory keywords in "Top Wins" across 20+ Daily Journal entries.',
  },
  {
    id: "14",
    title: "Abhaari (The Grateful)",
    category: "The Balanced Leader",
    description: '"You have a rich heart."',
    requirement:
      'Fill in the "Gratitude" section in 100+ Daily Journal entries.',
  },
  {
    id: "15",
    title: "Santulit (The Balanced)",
    category: "The Balanced Leader",
    description: '"You are mastering the art of balance."',
    requirement:
      "Maintain an average Alignment Score above 8 across your last 50 Daily Journal entries.",
  },
  {
    id: "16",
    title: "Sanskar (Man of Values)",
    category: "The Balanced Leader",
    description: '"You are building a legacy on a strong foundation."',
    requirement: "Record values lived in 80+ Daily Journal entries.",
  },
  {
    id: "17",
    title: "Grihastha (The Family Man)",
    category: "The Balanced Leader",
    description: '"You are a hero at work and a hero at home."',
    requirement:
      'Mention family-related keywords in "Gratitude" across 20+ Daily Journal entries.',
  },
  {
    id: "18",
    title: "Samrat (The Emperor)",
    category: "Ultimate Rank",
    description:
      '"You have mastered discipline, strategy, execution, and balance."',
    requirement: "Unlock 17 or more other badges.",
  },
];

const DEFAULT_STATS: AchievementStats = {
  points: 0,
  total_badges: 18,
  daily_entries: 0,
  weekly_entries: 0,
  goals_count: 0,
  bucket_list_count: 0,
  unlocked_count: 0,
  percent: 0,
};

/** Figma dashboard: terracotta primary, ~8px radius, 8px×16px padding */
const figmaPrimaryButton =
  "!bg-[#D67455] !text-white shadow-sm hover:!bg-[#D67455]/92 active:!bg-[#D67455]/85 rounded-md px-4 py-2 h-auto min-h-9 font-medium border-0 [&_svg]:!text-white";

const buildBadges = (
  earned: Record<string, unknown>[],
  locked: Record<string, unknown>[],
): Badge[] =>
  BADGE_DEFS.map((def) => ({
    ...def,
    locked: !earned.some((b) => String(b.id) === def.id),
  }));

const parseStats = (raw: Record<string, unknown>): AchievementStats => {
  const p = (raw.progress as Record<string, unknown>) ?? raw;
  return {
    points: Number(p.points ?? p.total_points ?? 0),
    total_badges: Number(p.total_badges ?? 18),
    daily_entries: Number(p.daily_entries ?? p.daily_count ?? 0),
    weekly_entries: Number(p.weekly_entries ?? p.weekly_count ?? 0),
    goals_count: Number(p.goals_completed ?? p.goals_count ?? p.goals ?? 0),
    bucket_list_count: Number(p.dreams_completed ?? p.bucket_list_count ?? 0),
    unlocked_count: Number(p.unlocked_badges ?? p.unlocked_count ?? 0),
    percent: Number(p.percent ?? 0),
  };
};

const Pulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-[#E0E0E0]/90 ${className}`} />
);

const StatIcon = ({ type }: { type: string }) => {
  const map: Record<string, JSX.Element> = {
    badges: (
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6"
        fill="none"
        stroke="#D67455"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <circle cx="12" cy="8" r="6" />
      </svg>
    ),
    daily: (
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6"
        fill="none"
        stroke="#D67455"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="15" y2="13" />
      </svg>
    ),
    weekly: (
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6"
        fill="none"
        stroke="#D67455"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    goals: (
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6"
        fill="none"
        stroke="#D67455"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    bucket: (
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6"
        fill="none"
        stroke="#D67455"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    unlocked: (
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6"
        fill="none"
        stroke="#D67455"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  };
  return map[type] ?? null;
};

const BadgeSVG = ({ id, locked }: { id: string; locked: boolean }) => {
  const paths: Record<string, JSX.Element> = {
    "1": (
      <>
        <ellipse
          cx="10"
          cy="14"
          rx="2.5"
          ry="3.5"
          transform="rotate(-10 10 14)"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
        <ellipse
          cx="15"
          cy="12"
          rx="2.5"
          ry="3.5"
          transform="rotate(10 15 12)"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
        <circle cx="8" cy="10" r="1" fill="#fff" />
        <circle cx="11" cy="9" r="1" fill="#fff" />
        <circle cx="14" cy="8.5" r="1" fill="#fff" />
        <circle cx="17" cy="9.5" r="1" fill="#fff" />
      </>
    ),
    "2": (
      <path
        d="M12 4c0 0-5 4-5 9a5 5 0 0 0 10 0c0-2.5-2-5-2-5s-1 2.5-3 3c0-2-1-4 0-7z"
        stroke="#fff"
        strokeWidth="1.4"
        fill="none"
      />
    ),
    "3": (
      <>
        <polygon
          points="12,5 6,14 18,14"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <polygon
          points="12,10 7,18 17,18"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <line x1="12" y1="18" x2="12" y2="22" stroke="#fff" strokeWidth="1.4" />
      </>
    ),
    "4": (
      <>
        <path
          d="M8 20 L16 8 L18 10 L10 22 Z"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M16 8 L18 6 L20 8 L18 10 Z"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <path d="M6 18 L8 20" stroke="#fff" strokeWidth="1.3" />
      </>
    ),
    "5": (
      <>
        <path
          d="M8 6 h8 v6 a4 4 0 0 1-8 0 Z"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M8 9 H6 a2 2 0 0 1 0-3 H8"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M16 9 H18 a2 2 0 0 0 0-3 H16"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <line x1="12" y1="16" x2="12" y2="19" stroke="#fff" strokeWidth="1.4" />
        <line x1="9" y1="19" x2="15" y2="19" stroke="#fff" strokeWidth="1.4" />
      </>
    ),
    "6": (
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill="#fff"
        fontFamily="sans-serif"
      >
        100
      </text>
    ),
    "7": (
      <>
        <rect
          x="7"
          y="6"
          width="10"
          height="13"
          rx="1"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
        <line
          x1="9.5"
          y1="10"
          x2="14.5"
          y2="10"
          stroke="#fff"
          strokeWidth="1.2"
        />
        <line
          x1="9.5"
          y1="13"
          x2="14.5"
          y2="13"
          stroke="#fff"
          strokeWidth="1.2"
        />
        <line
          x1="9.5"
          y1="16"
          x2="12.5"
          y2="16"
          stroke="#fff"
          strokeWidth="1.2"
        />
        <path
          d="M7 7 Q5 7 5 9 Q5 11 7 11"
          stroke="#fff"
          strokeWidth="1.2"
          fill="none"
        />
      </>
    ),
    "8": (
      <>
        <path
          d="M7 5 Q18 12 7 19"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
        <line x1="17" y1="8" x2="8" y2="16" stroke="#fff" strokeWidth="1.3" />
        <polygon points="8,16 10,14 11,17" fill="#fff" />
      </>
    ),
    "9": (
      <>
        <path
          d="M8 14 V9 a1.5 1.5 0 0 1 3 0 V13"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M11 12 V8 a1.5 1.5 0 0 1 3 0 V12"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M14 12.5 V9 a1.5 1.5 0 0 1 3 0 V14 a3 3 0 0 1-3 3 H11 a3 3 0 0 1-3-3 V14"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
      </>
    ),
    "10": (
      <>
        <path
          d="M4 19 V7 Q12 5 12 8 Q12 5 20 7 V19 Q12 17 12 19 Q12 17 4 19 Z"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <line x1="12" y1="8" x2="12" y2="19" stroke="#fff" strokeWidth="1.2" />
      </>
    ),
    "11": (
      <>
        <rect
          x="8"
          y="10"
          width="8"
          height="7"
          rx="2"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
        <rect
          x="8"
          y="7"
          width="2"
          height="5"
          rx="1"
          stroke="#fff"
          strokeWidth="1.2"
          fill="none"
        />
        <rect
          x="10"
          y="6"
          width="2"
          height="5"
          rx="1"
          stroke="#fff"
          strokeWidth="1.2"
          fill="none"
        />
        <rect
          x="12"
          y="6.5"
          width="2"
          height="5"
          rx="1"
          stroke="#fff"
          strokeWidth="1.2"
          fill="none"
        />
        <rect
          x="14"
          y="7"
          width="2"
          height="5"
          rx="1"
          stroke="#fff"
          strokeWidth="1.2"
          fill="none"
        />
      </>
    ),
    "12": (
      <>
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M12 5V7M12 17V19M5 12H7M17 12H19M7.05 7.05l1.41 1.41M15.54 15.54l1.41 1.41M7.05 16.95l1.41-1.41M15.54 8.46l1.41-1.41"
          stroke="#fff"
          strokeWidth="1.3"
        />
      </>
    ),
    "13": (
      <>
        <path
          d="M8 18 Q4 14 5 10 Q6 6 8 7 Q6 11 8 14"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M16 18 Q20 14 19 10 Q18 6 16 7 Q18 11 16 14"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M9 7 Q10 5 12 5 Q14 5 15 7"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <line x1="9" y1="19" x2="15" y2="19" stroke="#fff" strokeWidth="1.4" />
      </>
    ),
    "14": (
      <>
        <path
          d="M12 19 Q6 13 9 8 Q11 5 12 7 Q13 5 15 8 Q18 13 12 19Z"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <line x1="12" y1="7" x2="12" y2="19" stroke="#fff" strokeWidth="1.1" />
      </>
    ),
    "15": (
      <>
        <line x1="12" y1="5" x2="12" y2="19" stroke="#fff" strokeWidth="1.4" />
        <line x1="6" y1="8" x2="18" y2="8" stroke="#fff" strokeWidth="1.3" />
        <path
          d="M6 8 l-2 4 a2 2 0 0 0 4 0 Z"
          stroke="#fff"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M18 8 l-2 4 a2 2 0 0 0 4 0 Z"
          stroke="#fff"
          strokeWidth="1.2"
          fill="none"
        />
        <line x1="9" y1="19" x2="15" y2="19" stroke="#fff" strokeWidth="1.4" />
      </>
    ),
    "16": (
      <>
        <path
          d="M7 14 Q7 18 12 19 Q17 18 17 14 H7Z"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M10 14 Q11 11 12 9 Q13 11 14 14"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <path
          d="M12 9 Q11 7 12 5 Q13 7 12 9"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
      </>
    ),
    "17": (
      <>
        <path
          d="M3 12 L12 4 L21 12"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M5 10 V20 H10 V15 H14 V20 H19 V10"
          stroke="#fff"
          strokeWidth="1.3"
          fill="none"
        />
        <rect
          x="10"
          y="15"
          width="4"
          height="5"
          stroke="#fff"
          strokeWidth="1.2"
          fill="none"
        />
      </>
    ),
    "18": (
      <>
        <path
          d="M4 17 L4 11 L8 14 L12 7 L16 14 L20 11 L20 17 Z"
          stroke="#fff"
          strokeWidth="1.4"
          fill="none"
        />
        <line x1="4" y1="19" x2="20" y2="19" stroke="#fff" strokeWidth="1.5" />
        <circle cx="12" cy="7" r="1.2" fill="#fff" />
        <circle cx="4" cy="11" r="1" fill="#fff" />
        <circle cx="20" cy="11" r="1" fill="#fff" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`lg-${id}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#d1d5db" />
          <stop offset="100%" stopColor="#6b7280" />
        </radialGradient>
        <radialGradient id={`eg-${id}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>
      <circle
        cx="12"
        cy="12"
        r="11"
        fill={locked ? `url(#lg-${id})` : `url(#eg-${id})`}
      />
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="none"
        stroke={locked ? "#9ca3af" : "#f59e0b"}
        strokeWidth="0.5"
        opacity="0.6"
      />
      {paths[id] ?? null}
    </svg>
  );
};

const BadgeCard = ({ id, title, subtitle, locked }: Badge) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full relative"
      style={{ filter: locked ? "grayscale(0.3)" : "none" }}
    >
      <BadgeSVG id={id} locked={locked} />
      {locked && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm border border-gray-200">
          <svg
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      )}
    </div>
    <div className="text-center">
      <p className="text-[11px] font-medium leading-tight text-[#333333] sm:text-xs">
        {title}
      </p>
      <p className="text-[10px] leading-tight text-[#666666]">{subtitle}</p>
    </div>
  </div>
);

const ErrorBanner = ({ type }: { type: ApiErrorType }) => {
  if (!type) return null;
  const map: Record<
    NonNullable<ApiErrorType>,
    { icon: JSX.Element; text: string; hint: string }
  > = {
    no_token: {
      icon: <AlertCircle className="w-4 h-4" />,
      text: "Not logged in",
      hint: "No auth token found. Please log in again.",
    },
    unauthorized: {
      icon: <AlertCircle className="w-4 h-4" />,
      text: "Session expired",
      hint: "Token invalid or expired. Please log in again.",
    },
    not_found: {
      icon: <AlertCircle className="w-4 h-4" />,
      text: "Endpoint not found",
      hint: "/achievements returned 404.",
    },
    server_error: {
      icon: <AlertCircle className="w-4 h-4" />,
      text: "Server error",
      hint: "Server returned 5xx. Please try again later.",
    },
    network: {
      icon: <WifiOff className="w-4 h-4" />,
      text: "Network error",
      hint: "Could not reach the server. Check your connection.",
    },
  };
  const { icon, text, hint } = map[type];
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200/90 bg-white px-3 py-2 text-xs text-red-800 shadow-sm">
      <span className="mt-0.5 flex-shrink-0 text-red-600">{icon}</span>
      <div>
        <span className="font-semibold">{text}: </span>
        <span className="text-red-700">{hint}</span>
      </div>
    </div>
  );
};

const Achievements = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<AchievementStats>(DEFAULT_STATS);
  const [apiError, setApiError] = useState<ApiErrorType>(null);
  const [activeTab, setActiveTab] = useState("earned");
  const [reqLoading, setReqLoading] = useState(false);
  const [reqLoaded, setReqLoaded] = useState(false);

  const fetchAchievements = useCallback(async (): Promise<boolean> => {
    setApiError(null);

    const token = getToken();
    if (!token) {
      setApiError("no_token");
      return false;
    }

    const { ok, status, data } = await safeFetch("/achievements");

    if (status === 401 || status === 403) {
      setApiError("unauthorized");
      return false;
    }
    if (status === 404) {
      setApiError("not_found");
      return false;
    }
    if (status >= 500) {
      setApiError("server_error");
      return false;
    }
    if (status === 0) {
      setApiError("network");
      return false;
    }

    if (ok && data) {
      const raw = data as Record<string, unknown>;
      console.log("[Achievements] Response:", raw);

      const earnedList = (
        Array.isArray(raw.earned)
          ? raw.earned
          : Array.isArray(raw.user_badges)
            ? raw.user_badges
            : Array.isArray(raw.badges)
              ? raw.badges
              : []
      ) as Record<string, unknown>[];

      const lockedList = (
        Array.isArray(raw.locked)
          ? raw.locked
          : Array.isArray(raw.locked_badges)
            ? raw.locked_badges
            : []
      ) as Record<string, unknown>[];

      console.log(
        `[Achievements] Earned: ${earnedList.length} | Locked: ${lockedList.length}`,
      );

      setBadges(buildBadges(earnedList, lockedList));
      setStats(parseStats(raw));
      return true;
    }

    setApiError("server_error");
    return false;
  }, []);

  // Always fresh GET on mount — no cache
  useEffect(() => {
    setIsLoading(true);
    fetchAchievements().finally(() => setIsLoading(false));
  }, [fetchAchievements]);

  // Load requirements only when tab first opens
  useEffect(() => {
    if (activeTab !== "how-to-earn" || reqLoaded) return;
    setReqLoaded(true);
    setReqLoading(true);
    setTimeout(() => setReqLoading(false), 250);
  }, [activeTab, reqLoaded]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    const toastId = toast.loading("Refreshing badges…");
    const success = await fetchAchievements();
    setIsLoading(false);
    toast.dismiss(toastId);
    if (success) toast.success("Badges refreshed!");
    else toast.error("Could not refresh. Check console for details.");
    setIsRefreshing(false);
  };

  const earnedBadges = badges.filter((b) => !b.locked);
  const lockedBadges = badges.filter((b) => b.locked);
  const totalBadges = badges.length || stats.total_badges || 18;
  const earnedCount =
    stats.unlocked_count > 0 ? stats.unlocked_count : earnedBadges.length;
  const progressPct =
    stats.percent > 0
      ? stats.percent
      : Math.round((earnedCount / totalBadges) * 100);

  const statItems = [
    { type: "badges", value: String(earnedCount), label: "Badges Earned" },
    {
      type: "daily",
      value: String(stats.daily_entries),
      label: "Daily Entries",
    },
    {
      type: "weekly",
      value: String(stats.weekly_entries),
      label: "Weekly Entries",
    },
    { type: "goals", value: String(stats.goals_count), label: "Goals Done" },
    {
      type: "bucket",
      value: String(stats.bucket_list_count),
      label: "Dreams Done",
    },
    {
      type: "unlocked",
      value: `${earnedCount} / ${totalBadges}`,
      label: "Unlocked",
    },
  ];

  return (
    <div
      className="-m-2 md:-m-3 min-h-[calc(100vh-5rem)] animate-fade-in bg-[#F8F6F1] px-4 py-6 sm:px-6 lg:px-8"
      data-page="achievements"
    >
      <div className="relative mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-[#333333] sm:text-3xl">
            <Trophy className="h-7 w-7 shrink-0 text-[#D67455]" /> Achievements
          </h1>
          <p className="mt-0.5 text-sm text-[#666666]">Your Hall of Fame</p>
        </div>
        <Button
          className={`w-full gap-2 sm:w-auto ${figmaPrimaryButton}`}
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing…" : "Refresh Badges"}
        </Button>
      </div>

      {apiError && <ErrorBanner type={apiError} />}

      {/* Progress Card */}
      <Card className="space-y-4 rounded-xl border border-[#E0E0E0]/90 bg-white p-4 shadow-sm sm:space-y-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#333333] sm:text-2xl">
              Your Progress
            </h2>
            <p className="mt-0.5 text-xs text-[#666666] sm:text-sm">
              Unlock achievements by journaling consistently
            </p>
          </div>
          <div className="text-right">
            {isLoading ? (
              <Pulse className="h-10 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-[#D67455] sm:text-4xl">
                  {stats.points}
                </div>
                <p className="text-xs text-[#666666] sm:text-sm">points</p>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {statItems.map(({ type, value, label }) => (
            <div
              key={type}
              className="flex flex-col items-center justify-center space-y-1 rounded-xl border border-[#E0E0E0]/80 bg-[#FAFAFA] p-3 sm:space-y-2 sm:p-4"
            >
              <StatIcon type={type} />
              {isLoading ? (
                <Pulse className="h-6 w-10" />
              ) : (
                <div className="text-lg font-bold text-[#333333] sm:text-2xl">
                  {value}
                </div>
              )}
              <p className="text-center text-[10px] text-[#666666] sm:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#F2EFE9]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: isLoading ? "0%" : `${progressPct}%`,
                background: "linear-gradient(90deg, #D67455, #c45a3d)",
                boxShadow: "0 0 8px rgba(214, 116, 85, 0.35)",
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#666666]">
              {isLoading
                ? "Loading…"
                : `${earnedCount} of ${totalBadges} badges unlocked`}
            </p>
            {!isLoading && (
              <p className="text-xs font-semibold text-[#333333]">
                {progressPct}%
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="space-y-4 rounded-xl border border-[#E0E0E0]/90 bg-white p-4 shadow-sm sm:space-y-6 sm:p-6">
        <Tabs
          defaultValue="earned"
          className="space-y-4"
          onValueChange={setActiveTab}
        >
          <TabsList className="h-auto w-full gap-1 rounded-full border border-[#E0E0E0]/70 bg-[#F2EFE9] p-1 sm:w-auto">
            <TabsTrigger
              value="earned"
              className="flex-1 !rounded-full px-4 py-2 text-sm text-[#666666] data-[state=active]:bg-white data-[state=active]:text-[#333333] data-[state=active]:shadow-sm sm:flex-none"
            >
              My Badges ({isLoading ? "…" : earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger
              value="how-to-earn"
              className="flex-1 !rounded-full px-4 py-2 text-sm text-[#666666] data-[state=active]:bg-white data-[state=active]:text-[#333333] data-[state=active]:shadow-sm sm:flex-none"
            >
              How to Earn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earned" className="space-y-4">
            <h3 className="text-sm font-semibold text-[#333333] sm:text-base">
              Earned ({isLoading ? "…" : earnedBadges.length})
            </h3>
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Pulse className="w-16 h-16 rounded-full" />
                    <Pulse className="w-14 h-3" />
                  </div>
                ))}
              </div>
            ) : earnedBadges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 h-12 w-12 opacity-30">
                  <BadgeSVG id="1" locked={true} />
                </div>
                <p className="mb-1 text-sm font-semibold text-[#333333]">
                  No badges earned yet
                </p>
                <p className="max-w-xs text-xs text-[#666666]">
                  Start journaling consistently to unlock your first badge!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {earnedBadges.map((b) => (
                  <BadgeCard key={b.id} {...b} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="how-to-earn" className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#333333] sm:text-base">
                How to Earn Badges
              </h3>
              <p className="mt-1 text-xs text-[#666666] sm:text-sm">
                Complete the following activities to unlock each badge.
              </p>
            </div>
            {reqLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card
                    key={i}
                    className="border border-[#E0E0E0]/80 p-3 sm:p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Pulse className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Pulse className="w-32 h-4" />
                        <Pulse className="w-full h-3" />
                        <Pulse className="w-3/4 h-3" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {BADGE_REQUIREMENTS.map((req) => {
                  const isEarned = earnedBadges.some((b) => b.id === req.id);
                  return (
                    <Card
                      key={req.id}
                      className={`border p-3 transition-colors sm:p-4 ${
                        isEarned
                          ? "border-[#D67455]/35 bg-[#D67455]/10 hover:border-[#D67455]/45"
                          : "border-[#E0E0E0]/80 hover:border-[#D67455]/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-10 w-10 shrink-0 sm:h-12 sm:w-12">
                          <BadgeSVG id={req.id} locked={!isEarned} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold leading-snug text-[#333333]">
                                {req.title}
                              </h4>
                              {isEarned && (
                                <span className="whitespace-nowrap rounded-full bg-[#D67455]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#D67455]">
                                  ✓ Earned
                                </span>
                              )}
                            </div>
                            <span className="mt-0.5 shrink-0 whitespace-nowrap text-[10px] text-[#666666] sm:text-xs">
                              {req.category}
                            </span>
                          </div>
                          <p className="my-1.5 text-xs italic leading-snug text-[#666666]">
                            {req.description}
                          </p>
                          <div className="flex items-start gap-1.5">
                            <span className="mt-0.5 shrink-0 text-xs text-[#D67455]">
                              ⊙
                            </span>
                            <p className="text-xs leading-snug text-[#333333]">
                              {req.requirement}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Locked Badges */}
      <Card className="space-y-4 rounded-xl border border-[#E0E0E0]/90 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#333333] sm:text-base">
            Locked ({isLoading ? "…" : lockedBadges.length})
          </h3>
          {!isLoading && lockedBadges.length > 0 && (
            <p className="text-xs text-[#666666]">
              {lockedBadges.length} more to unlock
            </p>
          )}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Pulse className="w-16 h-16 rounded-full" />
                <Pulse className="w-14 h-3" />
              </div>
            ))}
          </div>
        ) : lockedBadges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 text-4xl">🎉</div>
            <p className="text-sm font-semibold text-[#333333]">
              All badges unlocked!
            </p>
            <p className="mt-1 text-xs text-[#666666]">
              You are a true champion!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {lockedBadges.map((b) => (
              <BadgeCard key={b.id} {...b} />
            ))}
          </div>
        )}
      </Card>
      </div>
    </div>
  );
};

export default Achievements;
