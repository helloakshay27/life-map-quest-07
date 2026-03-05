import DailyJournalSubmissions from "@/components/DailyJournalSubmission";
import PointsCalculation from "@/components/pointsCalculation";
import RankingsList from "@/components/RankingList";
import Rankings from "@/components/Rankings";
import YesterdaySubmissions from "@/components/YesterdaySubmissions";
import React, { useState, useEffect } from "react";

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Rankings");
  const tabs = ["Rankings", "Today", "Yesterday"];

  // --- API STATE ---
  const [rankingsData, setRankingsData] = useState({
    myStats: null,
    leaderboard: [],
  });
  const [todayData, setTodayData] = useState(null);
  const [yesterdayData, setYesterdayData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- API FETCHING LOGIC ---
  useEffect(() => {
    const fetchTabData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Base URL define kar diya to avoid typos
        const BASE_URL = "https://life-api.lockated.com";
        let url = "";

        // Active tab ke hisaab se URL decide karo
        if (activeTab === "Rankings") {
          url = `${BASE_URL}/leaderboard/rankings`;
        } else if (activeTab === "Today") {
          url = `${BASE_URL}/leaderboard/today`;
        } else if (activeTab === "Yesterday") {
          url = `${BASE_URL}/leaderboard/yesterday`;
        }

        // LocalStorage se token get karo
        // Note: Make sure "auth_token" matches exactly what you used during login
        const token = localStorage.getItem("auth_token");

        // Fetch API setup with Authorization header
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "", // Agar token hai tabhi bhejega
          },
        });

        // Error handling for 401 Unauthorized etc.
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.");
        }
        if (!response.ok) {
          throw new Error(
            `Failed to fetch data for ${activeTab} (Status: ${response.status})`,
          );
        }

        const data = await response.json();

        // Data ko respective state mein save karo
        if (activeTab === "Rankings") {
          setRankingsData({
            myStats: data.myStats || data.mockMyStats || null,
            leaderboard: data.leaderboardData || data.leaderboard || [],
          });
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
  }, [activeTab]); // Jab bhi tab change hoga, ye effect wapas chalega

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-8 font-sans flex flex-col items-center">
      {/* 1. Header Section */}
      <div className="flex flex-col items-center justify-center mb-8 mt-4 w-full">
        <div className="flex items-center gap-3">
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
          <h1 className="text-[2.5rem] font-bold text-[#0f172a] tracking-tight">
            Leaderboard
          </h1>
        </div>
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

      {/* 3. Error and Loading States */}
      {error && (
        <div className="w-full max-w-4xl bg-red-50 text-red-600 p-4 rounded-md mb-4 text-center">
          Oops! {error}
        </div>
      )}

      {isLoading && !error && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      )}

      {/* 4. Tab Content Section */}
      {!isLoading && !error && (
        <div className="w-full max-w-4xl">
          {activeTab === "Rankings" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col gap-8">
              {/* API se aaye hue data ko child components mein pass kiya hai */}
              {rankingsData.myStats && (
                <Rankings mockMyStats={rankingsData.myStats} />
              )}
              {rankingsData.leaderboard.length > 0 ? (
                <RankingsList leaderboardData={rankingsData.leaderboard} />
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No ranking data available.
                </p>
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
