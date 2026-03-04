import DailyJournalSubmissions from "@/components/DailyJournalSubmission";
import PointsCalculation from "@/components/pointsCalculation";
import RankingsList from "@/components/RankingList";
import Rankings from "@/components/Rankings";
import YesterdaySubmissions from "@/components/YesterdaySubmissions";
import React, { useState } from "react";

const mockMyStats = {
  rank: 156,
  name: "Tagala Uzair",
  points: 40,
  stats: [
    {
      id: 1,
      label: "Daily Journals",
      value: "0",
      iconName: "book",
      iconColor: "text-teal-500",
    },
    {
      id: 2,
      label: "Weekly Journals",
      value: "0",
      iconName: "calendar",
      iconColor: "text-indigo-500",
    },
    {
      id: 3,
      label: "Badges",
      value: "0",
      iconName: "badge",
      iconColor: "text-purple-500",
    },
    {
      id: 4,
      label: "Bucket List",
      value: "6",
      iconName: "sparkles",
      iconColor: "text-yellow-500",
    },
    {
      id: 5,
      label: "Goals",
      value: "2",
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
};

const leaderboardData = [
  {
    rank: 1,
    name: "Anil Gupta",
    isVerified: true,
    tagline: null,
    points: 1055,
    stats: { daily: 36, weekly: 19, badges: 0, bucket: 88, goals: 39 },
  },
  {
    rank: 2,
    name: "Yash Bhanpuria",
    isVerified: true,
    tagline: { icon: "🏛️", text: "Grihastha (The Fa..." },
    points: 960,
    stats: { daily: 34, weekly: 16, badges: 9, bucket: 18, goals: 53 },
  },
  {
    rank: 3,
    name: "Kut Kut",
    isVerified: true,
    tagline: { icon: "👣", text: "Aarambhak (The I..." },
    points: 775,
    stats: { daily: 95, weekly: 11, badges: 1, bucket: 14, goals: 9 },
  },
  {
    rank: 4,
    name: "L B Maurya",
    isVerified: true,
    tagline: { icon: "⚖️", text: "Santulit (The Bala..." },
    points: 770,
    stats: { daily: 36, weekly: 21, badges: 6, bucket: 16, goals: 20 },
  },
  {
    rank: 5,
    name: "Saloni Agarwal",
    isVerified: true,
    tagline: { icon: "🏆", text: "Masik Vijeta (Mon..." },
    points: 680,
    stats: { daily: 37, weekly: 12, badges: 4, bucket: 29, goals: 16 },
  },
];

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("Rankings");
  const tabs = ["Rankings", "Today", "Yesterday"];

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
            <Rankings mockMyStats={mockMyStats} />
            <RankingsList leaderboardData={leaderboardData} />
            <PointsCalculation />
          </div>
        )}

        {activeTab === "Today" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300  ">
            <DailyJournalSubmissions />
          </div>
        )}

        {activeTab === "Yesterday" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300  rounded-xl text-center ">
            <YesterdaySubmissions />
          </div>
        )}
      </div>

      
    </div>
  );
}

export default Leaderboard;
