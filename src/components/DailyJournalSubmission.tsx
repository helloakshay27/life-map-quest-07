import React from "react";

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function DailyJournalSubmissions({
  // Parent component 'data' prop bhej raha hai
  data
}) {
  
  // 1. Data Parsing & Safety Checks
  // API se aane wale data ke structure par depend karta hai.
  let submissions = [];
  
  if (Array.isArray(data)) {
    submissions = data; // Agar API seedha array bhejti hai
  } else if (data && data.submissions && Array.isArray(data.submissions)) {
    submissions = data.submissions; // Agar API object bhejti hai jisme 'submissions' key hai
  } else if (data && data.users && Array.isArray(data.users)) {
    submissions = data.users; // Agar API object bhejti hai jisme 'users' key hai
  }

  // 2. Date Formatting
  const getTodayDateString = () => {
    if (data?.date) return data.date; // Agar API date de rahi hai
    
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  };

  const todayDate = getTodayDateString();

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#f2fcf5] border border-[#bbf7d0] rounded-xl p-5 md:p-6 font-sans text-left">
      {/* --- 1. Header Section --- */}
      <div className="flex items-center gap-2 mb-4">
        {/* Green Check Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 text-[#15803d]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <h2 className="text-[17px] font-bold text-[#15803d]">
          Today's Daily Journal Submissions
        </h2>
      </div>

      {/* --- 2. Subtitle Section --- */}
      <p className="text-[15px] text-[#475569] mb-8">
        {submissions.length} people have submitted their daily journal for{" "}
        {todayDate}
      </p>

      {/* --- 3. Dynamic Content Section (Empty vs Filled) --- */}

      {(!submissions || submissions.length === 0) ? (
        // 🔴 EMPTY STATE (Jab array empty ho ya null ho)
        <div className="flex flex-col items-center justify-center py-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-14 h-14 text-[#94a3b8] mb-3 opacity-70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-[16px] text-[#64748b] font-medium text-center">
            No submissions yet today
          </p>
        </div>
      ) : (
        // 🟢 FILLED STATE (Jab array me data ho)
        <div className="flex flex-col gap-3">
          {submissions.map((user, index) => {
            
            // Safety check: API se keys fetch karne ke liye
            const userName = user.name || user.userName || "Unknown User";
            const submissionTime = user.time || user.submittedAt || "Time not specified";
            
            // Get initial safely
            const userInitial = userName !== "Unknown User" && userName.length > 0 
                ? userName.charAt(0).toUpperCase() 
                : "?";

            return (
              <div
                key={user.id || index}
                className="flex items-center justify-between p-4 bg-white border border-[#dcfce7] rounded-lg shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {/* User Initial Circle */}
                  <div className="w-10 h-10 rounded-full bg-[#dcfce7] text-[#15803d] flex items-center justify-center font-bold shrink-0">
                    {userInitial}
                  </div>
                  <span className="font-semibold text-[#1e293b]">
                    {userName}
                  </span>
                </div>
                {/* Time Pill */}
                <span className="text-sm font-medium text-[#64748b] bg-gray-50 px-3 py-1 rounded-full border border-gray-100 shrink-0">
                  {submissionTime}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}