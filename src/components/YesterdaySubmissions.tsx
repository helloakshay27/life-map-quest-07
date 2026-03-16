import React from "react";

// Dost ka banaya hua TypeScript Interface (updated for your safety checks)
interface Submission {
  id?: number;
  name?: string;
  userName?: string;
  time?: string;
  submittedAt?: string;
}

interface YesterdaySubmissionsProps {
  submissions?: Submission[];
  loading?: boolean;
  date?: string; // e.g. "2026-03-04"
  data?: any; // Tumhara purana data prop support karne ke liye
}

export default function YesterdaySubmissions({
  submissions = [],
  loading = false,
  date,
  data,
}: YesterdaySubmissionsProps) {
  
  // 1. Tumhare Data Parsing & Safety Checks
  let finalSubmissions = submissions;

  if (!finalSubmissions || finalSubmissions.length === 0) {
    if (Array.isArray(data)) {
      finalSubmissions = data;
    } else if (data && data.submissions && Array.isArray(data.submissions)) {
      finalSubmissions = data.submissions;
    } else if (data && data.users && Array.isArray(data.users)) {
      finalSubmissions = data.users;
    }
  }

  // 2. Date Formatting (Dost ka logic + Fallback to yesterday)
  const yesterdayDate = (() => {
    if (date) {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date + "T00:00:00"));
    }
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(d);
  })();

  // ---- Dost ka Loading skeleton ----
  if (loading) {
    return (
      <div className="w-full  mx-auto bg-[#f4f7ff] border border-[#d1ddf7] rounded-2xl p-5 md:p-4 font-sans animate-pulse">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-6 h-6 rounded-full bg-blue-200" />
          <div className="h-4 bg-blue-200 rounded w-72" />
        </div>
        <div className="h-3 bg-blue-100 rounded w-64 mb-6" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-white border border-white rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                <div>
                  <div className="h-4 bg-slate-200 rounded w-36 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-24" />
                </div>
              </div>
              <div className="h-8 w-20 bg-blue-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  mx-auto bg-[#f4f7ff] border border-[#d1ddf7] rounded-2xl p-5 md:p-4 font-sans text-left">
      {/* --- 1. Header Section --- */}
      <div className="flex items-center gap-2.5 mb-4">
        {/* Blue Calendar Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6 text-[#2563eb]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
        <h2 className="text-[17px] font-bold text-[#2563eb]">
          Yesterday's Daily Journal Submissions
        </h2>
      </div>

      {/* --- 2. Subtitle Section --- */}
      <p className="text-[15px] text-[#475569] mb-6 font-medium">
        {finalSubmissions.length}{" "}
        {finalSubmissions.length === 1 ? "person submitted" : "people submitted"}{" "}
        their daily journal for {yesterdayDate}
      </p>

      {/* --- 3. Dynamic Content Section (Empty vs Filled) --- */}
      {!finalSubmissions || finalSubmissions.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-10">
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
            No submissions found for yesterday
          </p>
        </div>
      ) : (
        // Filled state
        <div className="flex flex-col gap-3">
          {finalSubmissions.map((user, index) => {
            // Tumhare safety checks API fallback ke liye
            const userName = user.name || user.userName || "Unknown User";
            const submissionTime = user.time || user.submittedAt || "Time not specified";

            return (
              <div
                key={user.id || index}
                className="flex items-center justify-between p-4 bg-white border border-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow"
              >
                {/* Left Side: Number, Name & Time */}
                <div className="flex items-center gap-4">
                  {/* Number Circle */}
                  <div className="w-11 h-11 rounded-full bg-[#e0e7ff] text-[#3b82f6] flex items-center justify-center font-bold text-lg shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-[#1e293b] text-[16px]">
                      {userName}
                    </span>
                    <span className="text-sm text-[#64748b]">
                      Submitted at {submissionTime}
                    </span>
                  </div>
                </div>

                {/* Right Side: Done Badge */}
                <div className="flex items-center gap-1.5 bg-[#3b82f6] text-white px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Done
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}``