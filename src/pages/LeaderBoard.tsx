import DailyJournalSubmissions from "@/components/DailyJournalSubmission";
import PointsCalculation from "@/components/pointsCalculation";
import RankingsList from "@/components/RankingList";
import Rankings from "@/components/Rankings";
import YesterdaySubmissions from "@/components/YesterdaySubmissions";
import { apiRequest } from "@/config/api";
import React, { useCallback, useEffect, useState } from "react";

// ---- Types from API ----
interface RankingEntry {
  user_id: number;
  name: string;
  points: number;
  daily: number;
  weekly: number;
  badges: number;
  bucket: number;
  goals: number;
  latest_badge: string | null;
}

interface YourRank {
  rank: number;
  points: number;
  breakdown: RankingEntry;
}

interface LeaderboardApiResponse {
  rankings: RankingEntry[];
  your_rank: YourRank;
}

interface TodayUser {
  user_id: number;
  name: string;
  submitted_at: string;
}

interface TodayApiResponse {
  date: string;
  total: number;
  users: TodayUser[];
}

// ---- Mappers ----

/** Map a ranking entry + its 1-based index to the shape RankingsList expects */
const mapToLeaderboardItem = (entry: RankingEntry, index: number) => ({
  id: entry.user_id,
  rank: index + 1,
  name: entry.name,
  points: entry.points,
  isVerified: false,
  title: entry.latest_badge ?? undefined,
  stats: {
    daily: entry.daily,
    weekly: entry.weekly,
    badges: entry.badges,
    bucket: entry.bucket,
    goals: entry.goals,
  },
});

/** Map your_rank to the shape Rankings (the "My Stats" card) expects */
const mapToMyStats = (yourRank: YourRank) => ({
  rank: yourRank.rank,
  name: yourRank.breakdown.name,
  points: yourRank.points,
  stats: [
    {
      id: 1,
      label: "Daily Journals",
      value: String(yourRank.breakdown.daily),
      iconName: "book",
      iconColor: "text-teal-500",
    },
    {
      id: 2,
      label: "Weekly Journals",
      value: String(yourRank.breakdown.weekly),
      iconName: "calendar",
      iconColor: "text-indigo-500",
    },
    {
      id: 3,
      label: "Badges",
      value: String(yourRank.breakdown.badges),
      iconName: "badge",
      iconColor: "text-purple-500",
    },
    {
      id: 4,
      label: "Bucket List",
      value: String(yourRank.breakdown.bucket),
      iconName: "sparkles",
      iconColor: "text-yellow-500",
    },
    {
      id: 5,
      label: "Goals",
      value: String(yourRank.breakdown.goals),
      iconName: "target",
      iconColor: "text-blue-500",
    },
    {
      id: 6,
      label: "Setup",
      value: "-",
      iconName: "setup",
      iconColor: "text-slate-300",
    },
  ],
});

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Rankings");
  const tabs = ["Rankings", "Today", "Yesterday"];

  // ---- Rankings state ----
  const [myStats, setMyStats] = useState<ReturnType<
    typeof mapToMyStats
  > | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<
    ReturnType<typeof mapToLeaderboardItem>[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Today state ----
  const [todaySubmissions, setTodaySubmissions] = useState<
    { id: number; name: string; time: string }[]
  >([]);
  const [todayDate, setTodayDate] = useState<string | undefined>(undefined);
  const [todayLoading, setTodayLoading] = useState(false);
  const [todayError, setTodayError] = useState<string | null>(null);
  const [todayFetched, setTodayFetched] = useState(false);

  // ---- Yesterday state ----
  const [yesterdaySubmissions, setYesterdaySubmissions] = useState<
    { id: number; name: string; time: string }[]
  >([]);
  const [yesterdayDate, setYesterdayDate] = useState<string | undefined>(
    undefined,
  );
  const [yesterdayLoading, setYesterdayLoading] = useState(false);
  const [yesterdayError, setYesterdayError] = useState<string | null>(null);
  const [yesterdayFetched, setYesterdayFetched] = useState(false);

  // ---- Fetch Rankings ----
  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest("/leaderboard/rankings");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: LeaderboardApiResponse = await res.json();

      setLeaderboardData(data.rankings.map(mapToLeaderboardItem));
      setMyStats(mapToMyStats(data.your_rank));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load rankings.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---- Fetch Today ----
  const fetchToday = useCallback(async () => {
    setTodayLoading(true);
    setTodayError(null);
    try {
      const res = await apiRequest("/leaderboard/today");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: TodayApiResponse = await res.json();

      setTodayDate(data.date);
      setTodaySubmissions(
        data.users.map((u) => ({
          id: u.user_id,
          name: u.name,
          time: u.submitted_at,
        })),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load today's submissions.";
      setTodayError(message);
    } finally {
      setTodayLoading(false);
      setTodayFetched(true);
    }
  }, []);

  // ---- Fetch Yesterday ----
  const fetchYesterday = useCallback(async () => {
    setYesterdayLoading(true);
    setYesterdayError(null);
    try {
      const res = await apiRequest("/leaderboard/yesterday");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: TodayApiResponse = await res.json(); // same shape as Today

      setYesterdayDate(data.date);
      setYesterdaySubmissions(
        data.users.map((u) => ({
          id: u.user_id,
          name: u.name,
          time: u.submitted_at,
        })),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load yesterday's submissions.";
      setYesterdayError(message);
    } finally {
      setYesterdayLoading(false);
      setYesterdayFetched(true);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // Lazy-fetch today's data only when the tab is first opened
  useEffect(() => {
    if (activeTab === "Today" && !todayFetched) {
      fetchToday();
    }
  }, [activeTab, todayFetched, fetchToday]);

  // Lazy-fetch yesterday's data only when the tab is first opened
  useEffect(() => {
    if (activeTab === "Yesterday" && !yesterdayFetched) {
      fetchYesterday();
    }
  }, [activeTab, yesterdayFetched, fetchYesterday]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-8 font-sans flex flex-col items-center">
      {/* 1. Header Section (Trophy + Title) */}
      <div className="flex flex-col items-center justify-center mb-8 mt-4 w-full">
        <div className="flex items-center gap-3">
          {/* Trophy Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-yellow-500"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>

          {/* Main Title */}
          <h1 className="text-[2.5rem] font-bold text-[#0f172a] tracking-tight">
            Leaderboard
          </h1>
        </div>

        {/* Subtitle */}
        <p className="mt-2 text-[1.125rem] text-[#475569]">
          See how you rank among the community
        </p>
      </div>

      {/* 2. Tabs Section */}
      <div className="flex bg-[#f1f5f9] p-1 rounded-lg w-full max-w-4xl mb-6 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[15px] font-medium rounded-md transition-all duration-200 outline-none ${
              activeTab === tab
                ? "bg-white shadow-sm text-slate-900"
                : "text-[#475569] hover:text-slate-900 hover:bg-gray-200/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Tab Content Section */}
      <div className="w-full max-w-4xl">
        {activeTab === "Rankings" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-8">
            {/* Error Banner */}
            {error && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <span>{error}</span>
                <button
                  onClick={fetchRankings}
                  className="ml-auto text-red-600 font-semibold underline underline-offset-2 hover:text-red-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* My Stats Card — skeleton while loading */}
            {loading ? (
              <div className="w-full border border-gray-200 bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200" />
                    <div>
                      <div className="h-4 bg-slate-200 rounded w-28 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-10 w-16 bg-slate-200 rounded" />
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : myStats ? (
              <Rankings mockMyStats={myStats} />
            ) : null}

            {/* Rankings List */}
            <RankingsList leaderboardData={leaderboardData} loading={loading} />

            <PointsCalculation />
          </div>
        )}

        {activeTab === "Today" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-4">
            {/* Today error banner */}
            {todayError && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <span>{todayError}</span>
                <button
                  onClick={() => {
                    setTodayFetched(false);
                    fetchToday();
                  }}
                  className="ml-auto text-red-600 font-semibold underline underline-offset-2 hover:text-red-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            <DailyJournalSubmissions
              submissions={todaySubmissions}
              loading={todayLoading}
              date={todayDate}
            />
          </div>
        )}

        {activeTab === "Yesterday" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-4">
            {/* Yesterday error banner */}
            {yesterdayError && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <span>{yesterdayError}</span>
                <button
                  onClick={() => {
                    setYesterdayFetched(false);
                    fetchYesterday();
                  }}
                  className="ml-auto text-red-600 font-semibold underline underline-offset-2 hover:text-red-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            <YesterdaySubmissions
              submissions={yesterdaySubmissions}
              loading={yesterdayLoading}
              date={yesterdayDate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
