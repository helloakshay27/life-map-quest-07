import DailyJournalSubmissions from "@/components/DailyJournalSubmission";
import PointsCalculation from "@/components/pointsCalculation";
import RankingsList from "@/components/RankingList";
import Rankings from "@/components/Rankings";
import YesterdaySubmissions from "@/components/YesterdaySubmissions";
import React, { useState, useEffect } from "react";

// ─── Brand Palette ────────────────────────────────────────────────────────────
const C = {
  coral:    "#D9614A",   // Primary — warm orange-coral (not red)
  coral8:   "rgba(217,97,74,0.08)",
  coral15:  "rgba(217,97,74,0.15)",
  charcoal: "#2A2A2A",   // Headings, Nav BG
  cream:    "#F5CECA",   // Brand Page BG
  forest:   "#0B5541",   // Success, Positive
  forest8:  "rgba(11,85,65,0.08)",
  violet:   "#5534B7",   // Links, Highlights
  violet8:  "rgba(85,52,183,0.08)",
  sand:     "#C5AB92",   // Accent, Dividers
  dune:     "#E8C0A8",   // Dashboard Cards
  mist:     "#D1D4A6",   // Subtle Borders
  stone:    "#888765",   // Disabled, Muted
  warning:  "#F4A94C",   // Alerts, Caution
  crimson:  "#C72540",   // Failed, Critical
  sky:      "#2B6CC5",   // Information
  pageBg:   "#FAF7F3",
};

const BASE_URL = "https://life-api.lockated.com";

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Rankings");
  const tabs = ["Rankings", "Today", "Yesterday"];

  const [rankingsData, setRankingsData]   = useState({ myStats: null, leaderboard: [] });
  const [todayData, setTodayData]         = useState(null);
  const [yesterdayData, setYesterdayData] = useState(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState(null);

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
        if (!response.ok)            throw new Error(`Failed to fetch data (Status: ${response.status})`);

        const data = await response.json();

        if (activeTab === "Rankings") {
          const yr = data.your_rank;
          const b  = yr?.breakdown ?? yr;

          const setupCompleted = parseInt(localStorage.getItem("setupCompletedCount") || "0");
          const setupTotal     = parseInt(localStorage.getItem("setupTotalCount")     || "5");

          const [dailyRes, weeklyRes, goalsRes, dreamsRes] = await Promise.allSettled([
            authFetch(`${BASE_URL}/user_journals`),
            authFetch(`${BASE_URL}/user_journals?journal_type=weekly`),
            authFetch(`${BASE_URL}/goals`),
            authFetch(`${BASE_URL}/dreams`),
          ]);

          const parseCount = async (settledResult) => {
            if (settledResult.status !== "fulfilled") return 0;
            try {
              const res = settledResult.value;
              if (!res.ok) return 0;
              const json = await res.json();
              if (Array.isArray(json))             return json.length;
              if (typeof json.total   === "number") return json.total;
              if (typeof json.count   === "number") return json.count;
              if (Array.isArray(json.data))         return json.data.length;
              if (Array.isArray(json.journals))     return json.journals.length;
              if (Array.isArray(json.goals))        return json.goals.length;
              if (Array.isArray(json.dreams))       return json.dreams.length;
              if (json.dreaming || json.planning || json.in_progress || json.achieved) {
                return (
                  (Array.isArray(json.dreaming)    ? json.dreaming.length    : 0) +
                  (Array.isArray(json.planning)    ? json.planning.length    : 0) +
                  (Array.isArray(json.in_progress) ? json.in_progress.length : 0) +
                  (Array.isArray(json.achieved)    ? json.achieved.length    : 0)
                );
              }
              return 0;
            } catch { return 0; }
          };

          const [dailyCount, weeklyCount, goalsCount, dreamsCount] = await Promise.all([
            parseCount(dailyRes),
            parseCount(weeklyRes),
            parseCount(goalsRes),
            parseCount(dreamsRes),
          ]);

          const myStats = yr ? {
            rank:   yr.rank,
            name:   b?.name ?? "",
            points: yr.points ?? 0,
            stats: [
              { id: "daily",  iconName: "book",     iconColor: "text-teal-500",   value: dailyCount,               label: "Daily Journals" },
              { id: "weekly", iconName: "calendar", iconColor: "text-violet-500", value: weeklyCount,              label: "Weekly Journals" },
              { id: "badges", iconName: "badge",    iconColor: "text-purple-500", value: b?.badges ?? 0,           label: "Badges" },
              { id: "bucket", iconName: "sparkles", iconColor: "text-amber-400",  value: dreamsCount,              label: "Bucket List" },
              { id: "goals",  iconName: "target",   iconColor: "text-blue-500",   value: goalsCount,               label: "Goals" },
              {
                id: "setup", iconName: "setup",
                iconColor: setupCompleted === setupTotal ? "text-green-500" : "text-slate-400",
                value: `${setupCompleted}/${setupTotal}`, label: "Setup",
              },
            ],
          } : null;

          const leaderboard = (data.rankings ?? []).map((u, i) => ({
            id: u.user_id, rank: i + 1, name: u.name, points: u.points,
            isVerified: true, title: u.latest_badge ?? null,
            stats: { daily: u.daily, weekly: u.weekly, badges: u.badges, bucket: u.bucket, goals: u.goals },
          }));

          setRankingsData({ myStats, leaderboard });
        } else if (activeTab === "Today") {
          setTodayData(data);
        } else {
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
    <div
      className="w-full min-h-screen font-sans flex flex-col"
      style={{ background: C.pageBg }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="w-full flex flex-col items-center justify-center mb-8 mt-2">
        <div className="flex items-center gap-3">
          {/* Trophy icon — brand Coral */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40" height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.warning}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
          <h1
            className="text-[2.5rem] font-bold tracking-tight"
            style={{ color: C.charcoal }}
          >
            Leaderboard
          </h1>
        </div>
        <p className="mt-2 text-[1.125rem]" style={{ color: C.stone }}>
          See how you rank among the community
        </p>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div
        className="flex p-1 rounded-lg w-full mb-6"
        style={{
          background: C.coral8,
          border: `1px solid ${C.coral15}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-[15px] rounded-md transition-all duration-200 outline-none"
              style={{
                background:   isActive ? "#FFFFFF"    : "transparent",
                color:        isActive ? C.coral      : C.stone,
                fontWeight:   isActive ? 700          : 500,
                boxShadow:    isActive ? `0 1px 6px ${C.coral15}` : "none",
                borderBottom: isActive ? `2.5px solid ${C.coral}` : "2.5px solid transparent",
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="w-full p-4 rounded-lg mb-4 text-center text-sm font-medium"
          style={{ background: "rgba(199,37,64,0.08)", color: C.crimson, border: `1px solid rgba(199,37,64,0.2)` }}
        >
          Oops! {error}
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────────── */}
      {isLoading && !error && (
        <div className="flex justify-center items-center w-full py-10">
          <div
            className="animate-spin rounded-full h-8 w-8"
            style={{ borderBottom: `2px solid ${C.coral}`, borderTop: `2px solid transparent`, borderLeft: `2px solid transparent`, borderRight: `2px solid transparent` }}
          />
        </div>
      )}

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {!isLoading && !error && (
        <div className="w-full flex-1">
          {activeTab === "Rankings" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-8 w-full">
              {rankingsData.myStats && (
                <Rankings mockMyStats={rankingsData.myStats} />
              )}
              {rankingsData.leaderboard.length > 0 ? (
                <RankingsList leaderboardData={rankingsData.leaderboard} loading={isLoading} />
              ) : (
                <p className="text-center py-4 w-full" style={{ color: C.stone }}>
                  No ranking data available.
                </p>
              )}
              <PointsCalculation />
            </div>
          )}

          {activeTab === "Today" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
              <DailyJournalSubmissions data={todayData} />
            </div>
          )}

          {activeTab === "Yesterday" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl text-center w-full">
              <YesterdaySubmissions data={yesterdayData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;