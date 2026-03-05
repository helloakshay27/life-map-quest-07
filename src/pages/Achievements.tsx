import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// ─── API Config ───────────────────────────────────────────────────────────────
const API_BASE_URL = "https://life-api.lockated.com";

/**
 * Reads auth token — checks multiple common localStorage keys so it works
 * regardless of what key your auth layer uses.
 */
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

/**
 * Single safe fetch helper.
 * - Returns { ok, status, data } — never throws.
 * - Logs every call + status to console so you can debug in the Network tab.
 */
const safeFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: unknown }> => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...(options.headers ?? {}) },
    });

    // Always log status so it's visible in console
    console.log(`[Achievements API] ${options.method ?? "GET"} ${endpoint} → ${res.status}`);

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      // Non-JSON response body (e.g. 204 No Content)
    }

    if (!res.ok) {
      console.warn(`[Achievements API] Non-OK response from ${endpoint}:`, res.status, data);
    }

    return { ok: res.ok, status: res.status, data };
  } catch (networkErr) {
    // Only reaches here on real network failure (CORS, offline, etc.)
    console.error(`[Achievements API] Network error for ${endpoint}:`, networkErr);
    return { ok: false, status: 0, data: null };
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Badge {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  locked: boolean;
  category?: string;
}

interface AchievementStats {
  points: number;
  badges_count: number;
  daily_entries: number;
  weekly_entries: number;
  goals_count: number;
  bucket_list_count: number;
  unlocked_count: number;
  total_badges: number;
}

type ApiErrorType = "no_token" | "unauthorized" | "not_found" | "server_error" | "network" | null;

// ─── Static Data ──────────────────────────────────────────────────────────────
const DEFAULT_BADGES: Badge[] = [
  { id: "1",  title: "Aarakthis",      subtitle: "The Initiator",     icon: "🏆", locked: true, category: "The Disciple"       },
  { id: "2",  title: "Tapasvi",        subtitle: "The Disciplined",   icon: "⚡", locked: true, category: "The Discipline"     },
  { id: "3",  title: "Nishthavan",     subtitle: "The Dedicated",     icon: "📚", locked: true, category: "The Discipline"     },
  { id: "4",  title: "Saptahik Yodha", subtitle: "Weekly Warrior",    icon: "🎯", locked: true, category: "The Discipline"     },
  { id: "5",  title: "Masik Vijeta",   subtitle: "Monthly Victor",    icon: "🎪", locked: true, category: "The Discipline"     },
  { id: "6",  title: "Shaklaveer",     subtitle: "The Centurion",     icon: "💭", locked: true, category: "The Discipline"     },
  { id: "7",  title: "Chanakya",       subtitle: "The Strategist",    icon: "📖", locked: true, category: "The Wiseway"        },
  { id: "8",  title: "Arjun",          subtitle: "The Focused",       icon: "🧘", locked: true, category: "The Wiseway"        },
  { id: "9",  title: "Lakshya Vedhi",  subtitle: "The Goal Hitter",   icon: "⚙️", locked: true, category: "The Visionary"      },
  { id: "10", title: "Vicharak",       subtitle: "The Thinker",       icon: "👑", locked: true, category: "The Visionary"      },
  { id: "11", title: "Gyani",          subtitle: "The Wise",          icon: "📜", locked: true, category: "The Growth Engine"  },
  { id: "12", title: "Sankat Mochan",  subtitle: "The Troubleshooter",icon: "🌟", locked: true, category: "The Growth Engine"  },
  { id: "13", title: "Karmayogi",      subtitle: "The Doer",          icon: "❤️", locked: true, category: "The Growth Engine"  },
  { id: "14", title: "Vijayi",         subtitle: "The Victor",        icon: "⚔️", locked: true, category: "The Growth Engine"  },
  { id: "15", title: "Abhaari",        subtitle: "The Grateful",      icon: "🔮", locked: true, category: "The Balanced Leader"},
  { id: "16", title: "Santulti",       subtitle: "The Balanced",      icon: "🌍", locked: true, category: "The Balanced Leader"},
  { id: "17", title: "Sanskari",       subtitle: "Man of Values",     icon: "🎖️", locked: true, category: "The Balanced Leader"},
  { id: "18", title: "Grihastha",      subtitle: "The Family Man",    icon: "🗺️", locked: true, category: "The Balanced Leader"},
  { id: "19", title: "Samrat",         subtitle: "The Emperor",       icon: "✨", locked: true, category: "Ultimate Rank"      },
];

const DEFAULT_STATS: AchievementStats = {
  points: 0, badges_count: 0, daily_entries: 0, weekly_entries: 0,
  goals_count: 0, bucket_list_count: 0, unlocked_count: 0, total_badges: 19,
};

const BADGE_REQUIREMENTS = [
  { id: "1",  title: "Aarakthis (The Initiator)",          subtitle: "The Disciple",        description: '"Every empire began with a single step."',                                                    requirement: "Submit at least 5 Daily Journal entries.",                                                                      category: "The Disciple"        },
  { id: "2",  title: "Tapasvi (The Disciplined)",          subtitle: "The Discipline",      description: '"Consistency is your tapasya."',                                                              requirement: "Maintain a consecutive Daily Journal streak of 14 days.",                                                      category: "The Discipline"      },
  { id: "3",  title: "Nishthavan (The Dedicated)",         subtitle: "The Discipline",      description: '"You have made growth a daily habit."',                                                        requirement: "Maintain a consecutive Daily Journal streak of 60 days.",                                                      category: "The Discipline"      },
  { id: "4",  title: "Saptahik Yodha (Weekly Warrior)",   subtitle: "The Discipline",      description: '"A true warrior of time management."',                                                         requirement: "Complete all 7 days of a single week in your Daily Journal.",                                                  category: "The Discipline"      },
  { id: "5",  title: "Masik Vijeta (Monthly Victor)",     subtitle: "The Discipline",      description: '"You owned your calendar."',                                                                   requirement: "Submit 25 or more Daily Journal entries in a single calendar month.",                                          category: "The Discipline"      },
  { id: "6",  title: "Shaklaveer (The Centurion)",        subtitle: "The Discipline",      description: '"You are a veteran of self-growth."',                                                          requirement: "Submit 100 or more Daily Journal entries in total.",                                                           category: "The Discipline"      },
  { id: "7",  title: "Chanakya (The Strategist)",         subtitle: "The Wiseway",         description: '"You don\'t just work hard; you work smart."',                                                 requirement: 'Fill in "Strategic Priorities" in at least 20 Weekly Journal entries.',                                        category: "The Wiseway"         },
  { id: "8",  title: "Arjun (The Focused)",               subtitle: "The Wiseway",         description: '"You have mastered the art of focus."',                                                        requirement: 'Fill in "Say \'No\' To" in at least 20 Weekly Journal entries.',                                               category: "The Wiseway"         },
  { id: "9",  title: "Lakshya Vedhi (The Goal Hitter)",   subtitle: "The Visionary",       description: '"Your actions are aimed straight at your targets."',                                           requirement: 'Link goals in the "Goals to Focus" section of at least 20 Weekly Journal entries.',                           category: "The Visionary"       },
  { id: "10", title: "Vicharak (The Thinker)",            subtitle: "The Visionary",       description: '"You pause to think, so you can run faster."',                                                 requirement: "Submit 20 or more Weekly Journal entries in total.",                                                           category: "The Visionary"       },
  { id: "11", title: "Gyani (The Wise)",                  subtitle: "The Growth Engine",   description: '"You are accumulating a treasury of wisdom."',                                                 requirement: 'Write meaningful insights (50+ chars) in "Challenges & Insights" in 50+ Daily Journal entries.',               category: "The Growth Engine"   },
  { id: "12", title: "Sankat Mochan (The Troubleshooter)",subtitle: "The Growth Engine",   description: '"You turn challenges into stepping stones."',                                                   requirement: 'Write meaningful insights in "Challenges & Insights" in 40+ Daily Journal entries.',                           category: "The Growth Engine"   },
  { id: "13", title: "Karmayogi (The Doer)",              subtitle: "The Growth Engine",   description: '"You don\'t just plan; you execute with precision."',                                           requirement: "In the last 14 journal entries, have 20+ tracked items with 90%+ completion.",                                 category: "The Growth Engine"   },
  { id: "14", title: "Vijayi (The Victor)",               subtitle: "The Growth Engine",   description: '"You celebrate victories that drive your business forward."',                                  requirement: 'Mention victory keywords in "Top Wins" across 20+ Daily Journal entries.',                                     category: "The Growth Engine"   },
  { id: "15", title: "Abhaari (The Grateful)",            subtitle: "The Balanced Leader", description: '"You have a rich heart."',                                                                      requirement: 'Fill in the "Gratitude" section in 100+ Daily Journal entries.',                                               category: "The Balanced Leader" },
  { id: "16", title: "Santulti (The Balanced)",           subtitle: "The Balanced Leader", description: '"You are mastering the art of balance."',                                                       requirement: "Maintain an average Alignment Score above 8 across your last 50 Daily Journal entries.",                      category: "The Balanced Leader" },
  { id: "17", title: "Sanskari (Man of Values)",          subtitle: "The Balanced Leader", description: '"You are building a legacy on a strong foundation."',                                           requirement: "Record values lived in 80+ Daily Journal entries.",                                                            category: "The Balanced Leader" },
  { id: "18", title: "Grihastha (The Family Man)",        subtitle: "The Balanced Leader", description: '"You are a hero at work and a hero at home."',                                                  requirement: 'Mention family-related keywords in "Gratitude" across 20+ Daily Journal entries.',                             category: "The Balanced Leader" },
  { id: "19", title: "Samrat (The Emperor)",              subtitle: "Ultimate Rank",        description: '"You have mastered discipline, strategy, execution, and balance."',                            requirement: "Unlock 18 or more other badges.",                                                                              category: "Ultimate Rank"       },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * Maps raw API badge list onto our local badge definitions.
 * Handles every common field-name variant.
 */
const mergeBadges = (apiList: Record<string, unknown>[]): Badge[] =>
  DEFAULT_BADGES.map((local) => {
    const match = apiList.find(
      (b) => String(b.id ?? b.badge_id ?? b.badge_number ?? "") === local.id
    );
    if (!match) return local;
    const unlocked =
      match.unlocked === true ||
      match.earned   === true ||
      match.is_earned === true ||
      match.locked   === false ||
      match.status   === "earned" ||
      match.status   === "unlocked";
    return { ...local, locked: !unlocked };
  });

/**
 * Normalises the stats object regardless of field-name variant.
 */
const normalizeStats = (raw: Record<string, unknown>): AchievementStats => ({
  points:            Number(raw.points            ?? raw.total_points      ?? raw.score          ?? 0),
  badges_count:      Number(raw.badges_count      ?? raw.total_badges      ?? raw.badge_count    ?? 0),
  daily_entries:     Number(raw.daily_entries     ?? raw.daily_count       ?? raw.daily_journals ?? 0),
  weekly_entries:    Number(raw.weekly_entries    ?? raw.weekly_count      ?? raw.weekly_journals?? 0),
  goals_count:       Number(raw.goals_count       ?? raw.goals             ?? raw.goals_total    ?? 0),
  bucket_list_count: Number(raw.bucket_list_count ?? raw.bucket_list       ?? raw.bucket_items   ?? 0),
  unlocked_count:    Number(raw.unlocked_count    ?? raw.earned_badges     ?? raw.unlocked       ?? 0),
  total_badges:      Number(raw.total_badges      ?? 19),
});

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatIcon = ({ type }: { type: string }) => {
  const icons: Record<string, JSX.Element> = {
    badges:   <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#e07b39" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><circle cx="12" cy="8" r="6"/></svg>,
    daily:    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg>,
    weekly:   <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    goals:    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    bucket:   <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    unlocked: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#8b5cf6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  };
  return icons[type] ?? null;
};

const BadgeSVG = ({ id, locked }: { id: string; locked: boolean }) => {
  const paths: Record<string, JSX.Element> = {
    "1":  (<><ellipse cx="10" cy="14" rx="2.5" ry="3.5" transform="rotate(-10 10 14)" stroke="#fff" strokeWidth="1.4" fill="none"/><ellipse cx="15" cy="12" rx="2.5" ry="3.5" transform="rotate(10 15 12)" stroke="#fff" strokeWidth="1.4" fill="none"/><circle cx="8" cy="10" r="1" fill="#fff"/><circle cx="11" cy="9" r="1" fill="#fff"/><circle cx="14" cy="8.5" r="1" fill="#fff"/><circle cx="17" cy="9.5" r="1" fill="#fff"/></>),
    "2":  (<path d="M12 4c0 0-5 4-5 9a5 5 0 0 0 10 0c0-2.5-2-5-2-5s-1 2.5-3 3c0-2-1-4 0-7z" stroke="#fff" strokeWidth="1.4" fill="none"/>),
    "3":  (<><polygon points="12,5 6,14 18,14" stroke="#fff" strokeWidth="1.3" fill="none"/><polygon points="12,10 7,18 17,18" stroke="#fff" strokeWidth="1.3" fill="none"/><line x1="12" y1="18" x2="12" y2="22" stroke="#fff" strokeWidth="1.4"/></>),
    "4":  (<><path d="M8 20 L16 8 L18 10 L10 22 Z" stroke="#fff" strokeWidth="1.3" fill="none"/><path d="M16 8 L18 6 L20 8 L18 10 Z" stroke="#fff" strokeWidth="1.3" fill="none"/><path d="M6 18 L8 20" stroke="#fff" strokeWidth="1.3"/></>),
    "5":  (<><path d="M8 6 h8 v6 a4 4 0 0 1-8 0 Z" stroke="#fff" strokeWidth="1.4" fill="none"/><path d="M8 9 H6 a2 2 0 0 1 0-3 H8" stroke="#fff" strokeWidth="1.3" fill="none"/><path d="M16 9 H18 a2 2 0 0 0 0-3 H16" stroke="#fff" strokeWidth="1.3" fill="none"/><line x1="12" y1="16" x2="12" y2="19" stroke="#fff" strokeWidth="1.4"/><line x1="9" y1="19" x2="15" y2="19" stroke="#fff" strokeWidth="1.4"/></>),
    "6":  (<text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff" fontFamily="sans-serif">100</text>),
    "7":  (<><rect x="7" y="6" width="10" height="13" rx="1" stroke="#fff" strokeWidth="1.4" fill="none"/><line x1="9.5" y1="10" x2="14.5" y2="10" stroke="#fff" strokeWidth="1.2"/><line x1="9.5" y1="13" x2="14.5" y2="13" stroke="#fff" strokeWidth="1.2"/><line x1="9.5" y1="16" x2="12.5" y2="16" stroke="#fff" strokeWidth="1.2"/><path d="M7 7 Q5 7 5 9 Q5 11 7 11" stroke="#fff" strokeWidth="1.2" fill="none"/></>),
    "8":  (<><path d="M7 5 Q18 12 7 19" stroke="#fff" strokeWidth="1.4" fill="none"/><line x1="17" y1="8" x2="8" y2="16" stroke="#fff" strokeWidth="1.3"/><polygon points="8,16 10,14 11,17" fill="#fff"/></>),
    "9":  (<><circle cx="12" cy="12" r="7" stroke="#fff" strokeWidth="1.3" fill="none"/><circle cx="12" cy="12" r="4.5" stroke="#fff" strokeWidth="1.3" fill="none"/><circle cx="12" cy="12" r="2" stroke="#fff" strokeWidth="1.3" fill="none"/><line x1="18" y1="6" x2="14" y2="10" stroke="#fff" strokeWidth="1.3"/><polygon points="18,4 20,8 16,8" fill="#fff"/></>),
    "10": (<><path d="M8 14 V9 a1.5 1.5 0 0 1 3 0 V13" stroke="#fff" strokeWidth="1.3" fill="none"/><path d="M11 12 V8 a1.5 1.5 0 0 1 3 0 V12" stroke="#fff" strokeWidth="1.3" fill="none"/><path d="M14 12.5 V9 a1.5 1.5 0 0 1 3 0 V14 a3 3 0 0 1-3 3 H11 a3 3 0 0 1-3-3 V14" stroke="#fff" strokeWidth="1.3" fill="none"/></>),
    "11": (<><path d="M4 19 V7 Q12 5 12 8 Q12 5 20 7 V19 Q12 17 12 19 Q12 17 4 19 Z" stroke="#fff" strokeWidth="1.3" fill="none"/><line x1="12" y1="8" x2="12" y2="19" stroke="#fff" strokeWidth="1.2"/></>),
    "12": (<><rect x="8" y="10" width="8" height="7" rx="2" stroke="#fff" strokeWidth="1.4" fill="none"/><rect x="8" y="7" width="2" height="5" rx="1" stroke="#fff" strokeWidth="1.2" fill="none"/><rect x="10" y="6" width="2" height="5" rx="1" stroke="#fff" strokeWidth="1.2" fill="none"/><rect x="12" y="6.5" width="2" height="5" rx="1" stroke="#fff" strokeWidth="1.2" fill="none"/><rect x="14" y="7" width="2" height="5" rx="1" stroke="#fff" strokeWidth="1.2" fill="none"/></>),
    "13": (<><circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.4" fill="none"/><path d="M12 5V7M12 17V19M5 12H7M17 12H19M7.05 7.05l1.41 1.41M15.54 15.54l1.41 1.41M7.05 16.95l1.41-1.41M15.54 8.46l1.41-1.41" stroke="#fff" strokeWidth="1.3"/></>),
    "14": (<><path d="M8 18 Q4 14 5 10 Q6 6 8 7 Q6 11 8 14" stroke="#fff" strokeWidth="1.3" fill="none"/><path d="M16 18 Q20 14 19 10 Q18 6 16 7 Q18 11 16 14" stroke="#fff" strokeWidth="1.3" fill="none"/><path d="M9 7 Q10 5 12 5 Q14 5 15 7" stroke="#fff" strokeWidth="1.3" fill="none"/><line x1="9" y1="19" x2="15" y2="19" stroke="#fff" strokeWidth="1.4"/></>),
    "15": (<><path d="M12 19 Q6 13 9 8 Q11 5 12 7 Q13 5 15 8 Q18 13 12 19Z" stroke="#fff" strokeWidth="1.3" fill="none"/><line x1="12" y1="7" x2="12" y2="19" stroke="#fff" strokeWidth="1.1"/></>),
    "16": (<><line x1="12" y1="5" x2="12" y2="19" stroke="#fff" strokeWidth="1.4"/><line x1="6" y1="8" x2="18" y2="8" stroke="#fff" strokeWidth="1.3"/><path d="M6 8 l-2 4 a2 2 0 0 0 4 0 Z" stroke="#fff" strokeWidth="1.2" fill="none"/><path d="M18 8 l-2 4 a2 2 0 0 0 4 0 Z" stroke="#fff" strokeWidth="1.2" fill="none"/><line x1="9" y1="19" x2="15" y2="19" stroke="#fff" strokeWidth="1.4"/></>),
    "17": (<><path d="M7 14 Q7 18 12 19 Q17 18 17 14 H7Z" stroke="#fff" strokeWidth="1.3" fill="none"/><path d="M10 14 Q11 11 12 9 Q13 11 14 14" stroke="#fff" strokeWidth="1.3" fill="none"/><path d="M12 9 Q11 7 12 5 Q13 7 12 9" stroke="#fff" strokeWidth="1.4" fill="none"/></>),
    "18": (<><path d="M3 12 L12 4 L21 12" stroke="#fff" strokeWidth="1.4" fill="none"/><path d="M5 10 V20 H10 V15 H14 V20 H19 V10" stroke="#fff" strokeWidth="1.3" fill="none"/><rect x="10" y="15" width="4" height="5" stroke="#fff" strokeWidth="1.2" fill="none"/></>),
    "19": (<><path d="M4 17 L4 11 L8 14 L12 7 L16 14 L20 11 L20 17 Z" stroke="#fff" strokeWidth="1.4" fill="none"/><line x1="4" y1="19" x2="20" y2="19" stroke="#fff" strokeWidth="1.5"/><circle cx="12" cy="7" r="1.2" fill="#fff"/><circle cx="4" cy="11" r="1" fill="#fff"/><circle cx="20" cy="11" r="1" fill="#fff"/></>),
  };
  return (
    <svg viewBox="0 0 24 24" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`lg-${id}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#d1d5db"/><stop offset="100%" stopColor="#6b7280"/>
        </radialGradient>
        <radialGradient id={`eg-${id}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#d97706"/>
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={locked ? `url(#lg-${id})` : `url(#eg-${id})`} />
      <circle cx="12" cy="12" r="11" fill="none" stroke={locked ? "#9ca3af" : "#f59e0b"} strokeWidth="0.5" opacity="0.6"/>
      {paths[id] ?? null}
    </svg>
  );
};

const BadgeCircle = ({ id, title, subtitle, locked }: { id: string; title: string; subtitle: string; locked: boolean }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full relative" style={{ filter: locked ? "grayscale(0.3)" : "none" }}>
      <BadgeSVG id={id} locked={locked} />
      {locked && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm border border-gray-200">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="#6b7280" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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

const Pulse = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// ─── Error Banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ type }: { type: ApiErrorType }) => {
  const messages: Record<NonNullable<ApiErrorType>, { icon: JSX.Element; text: string; hint: string }> = {
    no_token:     { icon: <AlertCircle className="w-4 h-4" />, text: "Not logged in",       hint: "No auth token found in storage. Please log in again."       },
    unauthorized: { icon: <AlertCircle className="w-4 h-4" />, text: "Session expired",     hint: "Your token is invalid or expired. Please log in again."     },
    not_found:    { icon: <AlertCircle className="w-4 h-4" />, text: "Endpoint not found",  hint: "The achievements API endpoint returned 404. Check your API." },
    server_error: { icon: <AlertCircle className="w-4 h-4" />, text: "Server error",        hint: "The server returned 5xx. Please try again later."           },
    network:      { icon: <WifiOff    className="w-4 h-4" />, text: "Network error",        hint: "Could not reach the server. Check your internet connection." },
  };
  if (!type) return null;
  const { icon, text, hint } = messages[type];
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <span className="font-semibold">{text}: </span>
        <span className="text-red-600">{hint}</span>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Achievements = () => {
  const [isLoading,    setIsLoading]    = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [badges,       setBadges]       = useState<Badge[]>(DEFAULT_BADGES);
  const [stats,        setStats]        = useState<AchievementStats>(DEFAULT_STATS);
  const [apiError,     setApiError]     = useState<ApiErrorType>(null);
  const [activeTab,    setActiveTab]    = useState("earned");
  const [requirementsLoading, setRequirementsLoading] = useState(false);
  const [badgeRequirements, setBadgeRequirements] = useState(BADGE_REQUIREMENTS);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // ── Core fetch (single endpoint, no wild guessing) ─────────────────────────
  const fetchAchievements = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setApiError(null);

    // ── Step 1: Validate token exists before making ANY network call ──────────
    const token = getToken();
    if (!token) {
      console.warn("[Achievements API] No auth token found. Skipping fetch.");
      setApiError("no_token");
      if (!silent) setIsLoading(false);
      // Still show cached data if available
      try {
        const cached = localStorage.getItem("user_achievements");
        if (cached) {
          const { badges: b, stats: s } = JSON.parse(cached);
          if (b) setBadges(b);
          if (s) setStats(s);
        }
      } catch { /* ignore */ }
      return;
    }

    // ── Step 2: Single achievements fetch ─────────────────────────────────────
    // Using /achievements — most common endpoint for this kind of API.
    // This fires ONE request, no red-error spam from probing fallbacks.
    const { ok, status, data } = await safeFetch("/achievements");

    if (status === 401 || status === 403) {
      setApiError("unauthorized");
      if (!silent) setIsLoading(false);
      return;
    }
    if (status === 404) {
      setApiError("not_found");
      console.error("[Achievements API] 404 — endpoint /achievements does not exist on this server.");
      if (!silent) setIsLoading(false);
      return;
    }
    if (status >= 500) {
      setApiError("server_error");
      if (!silent) setIsLoading(false);
      return;
    }
    if (status === 0) {
      // Network/CORS failure
      setApiError("network");
      if (!silent) setIsLoading(false);
      return;
    }

    if (ok && data) {
      const raw = data as Record<string, unknown>;
      console.log("[Achievements API] Response payload:", raw);

      // Extract badges list from wherever it lives in the response
      const badgeList: Record<string, unknown>[] =
        (Array.isArray(raw)            ? raw              : null) ??
        (Array.isArray(raw.badges)     ? raw.badges       : null) ??
        (Array.isArray(raw.data)       ? raw.data         : null) ??
        (Array.isArray(raw.user_badges)? raw.user_badges  : null) ??
        [];

      // Extract stats from wherever they live
      const statsRaw: Record<string, unknown> =
        (raw.stats    as Record<string, unknown>) ??
        (raw.progress as Record<string, unknown>) ??
        (raw.summary  as Record<string, unknown>) ??
        raw;

      const merged = badgeList.length > 0 ? mergeBadges(badgeList) : DEFAULT_BADGES;
      const normalized = normalizeStats(statsRaw);

      setBadges(merged);
      setStats(normalized);
      localStorage.setItem(
        "user_achievements",
        JSON.stringify({ badges: merged, stats: normalized, cachedAt: Date.now() })
      );
    } else {
      // Response not ok — show cached if available
      try {
        const cached = localStorage.getItem("user_achievements");
        if (cached) {
          const { badges: b, stats: s } = JSON.parse(cached);
          if (b) setBadges(b);
          if (s) setStats(s);
        }
      } catch { /* ignore */ }
      if (!ok) setApiError("server_error");
    }

    if (!silent) setIsLoading(false);
  }, []);

  // ── Fetch Badge Requirements ──────────────────────────────────────────────
  const fetchBadgeRequirements = useCallback(async () => {
    console.log("[Achievements API] fetchBadgeRequirements called");
    
    const token = getToken();
    if (!token) {
      console.warn("[Achievements API] No auth token found for requirements fetch.");
      // Still show default data if no token
      setBadgeRequirements(BADGE_REQUIREMENTS);
      return;
    }

    setRequirementsLoading(true);
    console.log("[Achievements API] Fetching badge requirements from /achievements...");

    // Use the main achievements endpoint which already works
    const { ok, status, data } = await safeFetch("/achievements");

    if (ok && data) {
      const raw = data as Record<string, unknown>;
      console.log("[Achievements API] Badge requirements response:", raw);

      // Extract requirements array from response - check multiple possible locations
      const requirementsList: Record<string, unknown>[] =
        (Array.isArray(raw.requirements) ? raw.requirements : null) ??
        (Array.isArray(raw.badge_requirements) ? raw.badge_requirements : null) ??
        (Array.isArray(raw.how_to_earn) ? raw.how_to_earn : null) ??
        [];

      if (requirementsList.length > 0) {
        // Map API response to our badge requirements format
        const mappedRequirements = BADGE_REQUIREMENTS.map((localReq) => {
          const apiReq = requirementsList.find(
            (r) => String(r.id ?? r.badge_id ?? r.badge_number ?? "") === localReq.id
          );
          if (!apiReq) return localReq;

          return {
            ...localReq,
            requirement: (apiReq.requirement ?? apiReq.description ?? localReq.requirement) as string,
            description: (apiReq.hint ?? apiReq.details ?? localReq.description) as string,
          };
        });
        setBadgeRequirements(mappedRequirements);
        console.log("[Achievements API] Badge requirements updated from API");
      } else {
        console.log("[Achievements API] No requirements data in response, using defaults.");
        setBadgeRequirements(BADGE_REQUIREMENTS);
      }
    } else {
      console.warn(`[Achievements API] Failed to fetch requirements. Status: ${status}`);
      // Use default data on error
      setBadgeRequirements(BADGE_REQUIREMENTS);
    }

    setRequirementsLoading(false);
  }, []);

  // ── Mount: show cache instantly, then hit API ─────────────────────────────
  useEffect(() => {
    try {
      const cached = localStorage.getItem("user_achievements");
      if (cached) {
        const { badges: b, stats: s } = JSON.parse(cached);
        if (b) setBadges(b);
        if (s) setStats(s);
        setIsLoading(false);
        fetchAchievements(true); // silent background refresh
        return;
      }
    } catch { /* fresh load */ }
    fetchAchievements(false);
  }, [fetchAchievements]);

  // ── Fetch requirements when 'how-to-earn' tab is clicked ──────────────────
  useEffect(() => {
    console.log("[Achievements] Active tab changed to:", activeTab);
    if (activeTab === "how-to-earn" && !hasLoadedOnce) {
      console.log("[Achievements] Triggering API call for badge requirements...");
      setHasLoadedOnce(true);
      fetchBadgeRequirements();
    }
  }, [activeTab, hasLoadedOnce, fetchBadgeRequirements]);

  // ── Refresh ───────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Refreshing badges…", { id: "refresh" });
    await fetchAchievements(true);
    toast.dismiss("refresh");
    if (apiError) toast.error("Could not refresh — check console for details.");
    else          toast.success("Badges refreshed!");
    setIsRefreshing(false);
  };

  // ── Handle tab change ─────────────────────────────────────────────────────
  const handleTabChange = (value: string) => {
    console.log("[Achievements] Tab change handler called with value:", value);
    setActiveTab(value);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const earnedBadges  = badges.filter((b) => !b.locked);
  const lockedBadges  = badges.filter((b) =>  b.locked);
  const progressPct   = Math.round((earnedBadges.length / badges.length) * 100);

  const statItems = [
    { type: "badges",   value: String(stats.badges_count  || earnedBadges.length), label: "Badges"         },
    { type: "daily",    value: String(stats.daily_entries),                         label: "Daily Entries"  },
    { type: "weekly",   value: String(stats.weekly_entries),                        label: "Weekly Entries" },
    { type: "goals",    value: String(stats.goals_count),                           label: "Goals"          },
    { type: "bucket",   value: String(stats.bucket_list_count),                     label: "Bucket List"    },
    { type: "unlocked", value: `${stats.unlocked_count || earnedBadges.length} / ${badges.length}`, label: "Unlocked" },
  ];

  return (
    <div className="animate-fade-in space-y-4 p-4 sm:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Achievements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your Hall of Fame</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={handleRefresh} disabled={isRefreshing || isLoading}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing…" : "Refresh Badges"}
        </Button>
      </div>

      {/* API Error Banner */}
      {apiError && <ErrorBanner type={apiError} />}

      {/* Progress Card */}
      <Card className="p-4 sm:p-6 space-y-4 sm:space-y-5" style={{ backgroundColor: "#fdf8f3" }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Your Progress</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Unlock achievements by journaling consistently</p>
          </div>
          <div className="text-right">
            {isLoading
              ? <Pulse className="w-16 h-10" />
              : <><div className="text-3xl sm:text-4xl font-bold text-red-500">{stats.points}</div><p className="text-xs sm:text-sm text-muted-foreground">points</p></>
            }
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {statItems.map(({ type, value, label }) => (
            <div key={type} className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-border space-y-1 sm:space-y-2">
              <StatIcon type={type} />
              {isLoading ? <Pulse className="w-10 h-6" /> : <div className="text-lg sm:text-2xl font-bold text-foreground">{value}</div>}
              <p className="text-[10px] sm:text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="relative w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#f0e6d8" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#f97316,#ef4444)", boxShadow: "0 0 8px rgba(249,115,22,0.4)" }} />
          </div>
          <p className="text-xs text-center text-muted-foreground">{progressPct}% Badges Unlocked</p>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <Tabs defaultValue="earned" className="space-y-4" onValueChange={handleTabChange}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="earned"     className="flex-1 sm:flex-none text-sm">My Badges ({earnedBadges.length})</TabsTrigger>
            <TabsTrigger value="how-to-earn" className="flex-1 sm:flex-none text-sm">How to Earn</TabsTrigger>
          </TabsList>

          <TabsContent value="earned" className="space-y-4">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">Earned ({earnedBadges.length})</h3>
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="flex flex-col items-center gap-2"><Pulse className="w-16 h-16 rounded-full" /><Pulse className="w-14 h-3" /></div>))}
              </div>
            ) : earnedBadges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 w-12 h-12 opacity-30"><BadgeSVG id="5" locked={true} /></div>
                <p className="text-sm text-muted-foreground max-w-xs">No badges earned yet. Start journaling to unlock your first badge!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {earnedBadges.map((b) => <BadgeCircle key={b.id} id={b.id} title={b.title} subtitle={b.subtitle} locked={false} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="how-to-earn" className="space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">How to Earn Badges</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Complete the following activities to unlock each badge.</p>
            </div>
            {requirementsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="p-3 sm:p-4 border border-border">
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
              {badgeRequirements.map((b) => (
                <Card key={b.id} className="p-3 sm:p-4 border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 mt-0.5"><BadgeSVG id={b.id} locked={true} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-0.5 xs:gap-2">
                        <div>
                          <h4 className="font-semibold text-sm text-foreground leading-snug">{b.title}</h4>
                          <p className="text-[11px] text-muted-foreground">{b.subtitle}</p>
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 mt-0.5">{b.category}</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic my-1.5 leading-snug">{b.description}</p>
                      <div className="flex items-start gap-1.5">
                        <span className="text-orange-500 text-xs flex-shrink-0 mt-0.5">⊙</span>
                        <p className="text-xs text-foreground leading-snug">{b.requirement}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Locked */}
      <Card className="p-4 sm:p-6 space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-foreground">Locked ({lockedBadges.length})</h3>
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (<div key={i} className="flex flex-col items-center gap-2"><Pulse className="w-16 h-16 rounded-full" /><Pulse className="w-14 h-3" /></div>))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {lockedBadges.map((b) => <BadgeCircle key={b.id} id={b.id} title={b.title} subtitle={b.subtitle} locked={true} />)}
          </div>
        )}
      </Card>

    </div>
  );
};

export default Achievements;