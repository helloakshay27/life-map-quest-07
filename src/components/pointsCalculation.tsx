import React from "react";

const scoreItems = [
  {
    title: "Daily Journals",
    description: "Each daily journal entry you submit = ",
    points: "5 points",
    bg: "#ECFDF5",
    color: "#0D9488",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    ),
  },
  {
    title: "Weekly Journals",
    description: "Each weekly journal entry you submit = ",
    points: "10 points",
    bg: "#EEF2FF",
    color: "#6366F1",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25M3 10.5h18" />
    ),
  },
  {
    title: "Badges Earned",
    description: "Each badge you unlock = ",
    points: "25 points",
    bg: "#FAF5FF",
    color: "#A855F7",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25l3.75-8.25M19.5 20.25 15.75 12M8.25 12h7.5" />
    ),
  },
  {
    title: "Bucket List Items",
    description: "Each item you add to your bucket list = ",
    points: "5 points",
    bg: "#FFF7ED",
    color: "#F97316",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
    ),
  },
  {
    title: "Goals Created",
    description: "Each goal you set = ",
    points: "5 points",
    bg: "#EFF6FF",
    color: "#3B82F6",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
  },
  {
    title: "Complete Setup",
    description: "Completing your profile setup = ",
    points: "50 points (one-time bonus)",
    bg: "#F0FDF4",
    color: "#22C55E",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    ),
  },
];

export default function PointsCalculation() {
  return (
    <div className="w-full rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4 shadow-sm font-sans sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-[17px] font-bold text-[#2563EB]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#3B82F6] text-[13px] font-bold">i</span>
        How Leaderboard Scores Are Calculated
      </h2>

      <div className="rounded-xl bg-white p-4 sm:p-5">
        <h3 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-[#111827]">
          <span className="text-[16px]">📊</span>
          Scoring System
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-[#334155]">
          Your leaderboard score is calculated based on your engagement across different areas of Life Compass.
          Each activity contributes points to your total score.
        </p>

        <div className="space-y-3">
          {scoreItems.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-lg px-3 py-3"
              style={{ background: item.bg }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 flex-shrink-0"
                style={{ color: item.color }}
              >
                {item.icon}
              </svg>
              <div>
                <p className="text-[13px] font-bold text-[#111827]">{item.title}</p>
                <p className="text-[11px] text-[#334155]">
                  {item.description}
                  <span className="font-bold" style={{ color: item.color }}>{item.points}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
