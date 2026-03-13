import DailyJournalSubmissions from "@/components/DailyJournalSubmission";
import PointsCalculation from "@/components/pointsCalculation";
import RankingsList from "@/components/RankingList";
import Rankings from "@/components/Rankings";
import YesterdaySubmissions from "@/components/YesterdaySubmissions";
import React, { useState, useEffect } from "react";

const BASE_URL = "https://life-api.lockated.com";

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Rankings");
  const tabs = ["Rankings", "Today", "Yesterday"];

  const [rankingsData, setRankingsData] = useState({ myStats: null, leaderboard: [] });
  const [todayData, setTodayData] = useState(null);
  const [yesterdayData, setYesterdayData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper: authenticated fetch
  const authFetch = (url) => {
    const token = localStorage.getItem("auth_token");
    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  };

  useEffect(() => {
    const fetchTabData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpointMap = {
          Rankings:  `${BASE_URL}/leaderboard/rankings`,
          Today:     `${BASE_URL}/leaderboard/today`,
          Yesterday: `${BASE_URL}/leaderboard/yesterday`,
        };

        const response = await authFetch(endpointMap[activeTab]);
        if (response.status === 401) throw new Error("Unauthorized. Please log in again.");
        if (!response.ok) throw new Error(`Failed to fetch data (Status: ${response.status})`);

        const data = await response.json();

        if (activeTab === "Rankings") {
          const yr = data.your_rank;
          const b  = yr?.breakdown ?? yr;

          // ── Read setup progress from localStorage (same as Dashboard) ───
          const setupCompleted = parseInt(localStorage.getItem("setupCompletedCount") || "0");
          const setupTotal     = parseInt(localStorage.getItem("setupTotalCount")     || "5");

          // ── Parallel fetch stats from 4 dedicated APIs ──────────────────
          const [dailyRes, weeklyRes, goalsRes, dreamsRes] = await Promise.allSettled([
            authFetch(`${BASE_URL}/user_journals`),
            authFetch(`${BASE_URL}/user_journals?journal_type=weekly`),
            authFetch(`${BASE_URL}/goals`),
            authFetch(`${BASE_URL}/dreams`),
          ]);

          // Extract counts — each API may return array or { data: [] } or { total: n }
          const getCount = (result) => {
            if (result.status !== "fulfilled") return 0;
            // We need to parse JSON — but allSettled gives us the Response object
            // So we parse it below asynchronously
            return result.value;
          };

          const parseCount = async (settledResult) => {
            if (settledResult.status !== "fulfilled") return 0;
            try {
              const res = settledResult.value;
              if (!res.ok) return 0;
              const json = await res.json();
              // Support: array, { data: [] }, { total: n }, { count: n }, { journals: [] }, { goals: [] }, { dreams: [] }
              if (Array.isArray(json)) return json.length;
              if (typeof json.total === "number") return json.total;
              if (typeof json.count === "number") return json.count;
              if (Array.isArray(json.data)) return json.data.length;
              if (Array.isArray(json.journals)) return json.journals.length;
              if (Array.isArray(json.goals)) return json.goals.length;
              if (Array.isArray(json.dreams)) return json.dreams.length;
              return 0;
            } catch {
              return 0;
            }
          };

          const [dailyCount, weeklyCount, goalsCount, dreamsCount] = await Promise.all([
            parseCount(dailyRes),
            parseCount(weeklyRes),
            parseCount(goalsRes),
            parseCount(dreamsRes),
          ]);

          // Build myStats in the shape Rankings.jsx expects
          const myStats = yr ? {
            rank:   yr.rank,
            name:   b?.name   ?? "",
            points: yr.points ?? 0,
            stats: [
              { id: "daily",  iconName: "book",     iconColor: "text-teal-500",   value: dailyCount,  label: "Daily Journals"  },
              { id: "weekly", iconName: "calendar", iconColor: "text-violet-500", value: weeklyCount, label: "Weekly Journals" },
              { id: "badges", iconName: "badge",    iconColor: "text-purple-500", value: b?.badges ?? 0, label: "Badges"       },
              { id: "bucket", iconName: "sparkles", iconColor: "text-amber-400",  value: dreamsCount, label: "Bucket List"     },
              { id: "goals",  iconName: "target",   iconColor: "text-blue-500",   value: goalsCount,  label: "Goals"           },
              { id: "setup",  iconName: "setup",    iconColor: setupCompleted === setupTotal ? "text-green-500" : "text-slate-400",  value: `${setupCompleted}/${setupTotal}`, label: "Setup" },
            ],
          } : null;

          // Build leaderboard in the shape RankingsList.jsx expects
          const leaderboard = (data.rankings ?? []).map((u, i) => ({
            id:         u.user_id,
            rank:       i + 1,
            name:       u.name,
            points:     u.points,
            isVerified: true,
            title:      u.latest_badge ?? null,
            stats: {
              daily:  u.daily,
              weekly: u.weekly,
              badges: u.badges,
              bucket: u.bucket,
              goals:  u.goals,
            },
          }));

          setRankingsData({ myStats, leaderboard });

        } else if (activeTab === "Today") {
          setTodayData(data);
        } else if (activeTab === "Yesterday") {
          setYesterdayData(data);
        }

      } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#f8f9fa]   font-sans flex flex-col items-center w-full">
      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-8 mt-2 w-full">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="text-yellow-500">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          <h1 className="text-[2.5rem] font-bold text-[#0f172a] tracking-tight">Leaderboard</h1>
        </div>
        <p className="mt-2 text-[1.125rem] text-[#475569]">See how you rank among the community</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#f1f5f9] p-1 rounded-lg w-full max-w-4xl mb-6 shadow-sm">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[15px] font-medium rounded-md transition-all duration-200 outline-none ${
              activeTab === tab
                ? "bg-white shadow-sm text-slate-900"
                : "text-[#475569] hover:text-slate-900 hover:bg-gray-200/50"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-4xl bg-red-50 text-red-600 p-4 rounded-md mb-4 text-center">
          Oops! {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && !error && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <div className="w-full max-w-4xl">
          {activeTab === "Rankings" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-8">
              {rankingsData.myStats && <Rankings mockMyStats={rankingsData.myStats} />}
              {rankingsData.leaderboard.length > 0 ? (
                <RankingsList leaderboardData={rankingsData.leaderboard} loading={isLoading} />
              ) : (
                <p className="text-center text-gray-500 py-4">No ranking data available.</p>
              )}
              <PointsCalculation />
            </div>
          )}
          {activeTab === "Today" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <DailyJournalSubmissions data={todayData} />
            </div>
          )}
          {activeTab === "Yesterday" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl text-center">
              <YesterdaySubmissions data={yesterdayData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;