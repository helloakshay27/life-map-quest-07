import React from "react";

// ==========================================
// 1. MOCK DATA: Aapke screenshot ke hisaab se data
// ==========================================

// ==========================================
// 2. HELPER COMPONENTS (Ye code ko clean rakhte hain)
// ==========================================

// A. Rank Badge (Gold Crown, Silver Medal, Bronze, ya Normal Number)
const RankBadge = ({ rank }) => {
  if (rank === 1) {
    // Gold Crown
    return (
      <div className="w-12 h-12 rounded-full bg-[#fbbf24] flex items-center justify-center shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      </div>
    );
  }
  if (rank === 2) {
    // Silver Medal
    return (
      <div className="w-12 h-12 rounded-full bg-[#cbd5e1] flex items-center justify-center shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    );
  }
  if (rank === 3) {
    // Bronze Medal
    return (
      <div className="w-12 h-12 rounded-full bg-[#f97316] flex items-center justify-center shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-3-3m0 0l-3 3m3-3v6m-9-3l-3-3m0 0l-3 3m3-3v6"
          />
        </svg>
      </div>
    );
  }

  // Normal Number (4, 5, etc.)
  return (
    <div className="w-12 h-12 rounded-full bg-[#94a3b8] flex items-center justify-center shrink-0 font-bold text-white text-xl">
      {rank}
    </div>
  );
};

// B. Green Verified Tick
const VerifiedTick = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4 text-green-500"
  >
    <path
      fillRule="evenodd"
      d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
      clipRule="evenodd"
    />
  </svg>
);

// ==========================================
// 3. MAIN COMPONENT (Pura Table/List)
// ==========================================
function RankingsList({ leaderboardData }) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden font-sans">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 text-gray-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
          />
        </svg>
        <h3 className="font-bold text-gray-800 text-lg">Rankings</h3>
      </div>

      {/* List items map karna */}
      <div className="flex flex-col">
        {leaderboardData.map((user, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
          >
            {/* Left Side: Rank, Name, Badges, and Stats */}
            <div className="flex items-center gap-4">
              <RankBadge rank={user.rank} />

              <div>
                {/* Name and Tagline Row */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h4 className="font-bold text-[#0f172a] text-[17px]">
                    {user.name}
                  </h4>

                  {user.isVerified && <VerifiedTick />}

                  {/* Agar user ka tagline hai toh ye dikhega */}
                  {user.tagline && (
                    <span className="px-2.5 py-0.5 bg-[#fef3c7] text-[#b45309] text-xs font-semibold rounded-full border border-[#fde68a] flex items-center gap-1">
                      <span>{user.tagline.icon}</span> {user.tagline.text}
                    </span>
                  )}
                </div>

                {/* Bottom Stats Row */}
                <div className="flex gap-4 text-xs font-medium text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="text-teal-500 text-sm">📖</span>{" "}
                    {user.stats.daily} daily
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-indigo-400 text-sm">📅</span>{" "}
                    {user.stats.weekly} weekly
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-purple-400 text-sm">🏅</span>{" "}
                    {user.stats.badges} badges
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-500 text-sm">✨</span>{" "}
                    {user.stats.bucket} bucket
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-blue-400 text-sm">🎯</span>{" "}
                    {user.stats.goals} goals
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: Points */}
            <div className="text-right pl-4">
              <div
                className={`text-xl font-bold ${
                  user.rank === 1
                    ? "text-[#ca8a04]"
                    : user.rank === 2 || user.rank === 3
                      ? "text-[#ea580c]"
                      : "text-[#334155]"
                }`}
              >
                {user.points}
              </div>
              <div className="text-xs text-gray-400 font-medium">points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingsList;
