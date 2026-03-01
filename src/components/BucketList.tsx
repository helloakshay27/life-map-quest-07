import React, { useState } from "react";

// ==========================================
// 1. MOCK DATA
// ==========================================
const defaultBucketList = [
  {
    id: 1,
    title: "Visit Japan",
    notes: "",
    progress: "Planning",
    category: "Personal",
  },
  {
    id: 2,
    title: "Start a side business",
    notes: "",
    progress: "Dreaming",
    category: "Career",
  },
  {
    id: 3,
    title: "Write a book",
    notes: "",
    progress: "Dreaming",
    category: "Personal",
  },
  {
    id: 4,
    title: "Go skydiving",
    notes: "",
    progress: "Dreaming",
    category: "Adventure",
  },
  {
    id: 5,
    title: "Learn to play guitar",
    notes: "",
    progress: "In Progress",
    category: "Learning",
  },
  {
    id: 6,
    title: "Travel across Europe",
    notes: "",
    progress: "Planning",
    category: "Travel",
  },
  {
    id: 7,
    title: "Run a marathon",
    notes: "",
    progress: "Dreaming",
    category: "Personal",
  },
];

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================
const getProgressStyle = (progress) => {
  switch (progress) {
    case "Dreaming":
      return "bg-[#f3e8ff] text-[#9333ea]";
    case "Planning":
      return "bg-[#e0f2fe] text-[#0284c7]";
    case "In Progress":
      return "bg-[#dcfce7] text-[#16a34a]";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getCategoryStyle = (category) => {
  switch (category) {
    case "Personal":
      return "bg-[#fce7f3] text-[#db2777]";
    case "Career":
      return "bg-[#ede9fe] text-[#7c3aed]";
    case "Travel":
      return "bg-[#e0e7ff] text-[#4f46e5]";
    case "Adventure":
      return "bg-[#ffedd5] text-[#ea580c]";
    case "Learning":
      return "bg-[#ccfbf1] text-[#0d9488]";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function BucketList({ data = defaultBucketList }) {
  const [progressFilter, setProgressFilter] = useState("All Progress");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const filteredData = data.filter((item) => {
    const matchProgress =
      progressFilter === "All Progress" || item.progress === progressFilter;
    const matchCategory =
      categoryFilter === "All Categories" || item.category === categoryFilter;
    return matchProgress && matchCategory;
  });

  return (
    <div className="w-full max-w-4xl mx-auto border border-[#fde68a] rounded-lg overflow-hidden font-sans bg-[#fffbeb]">
      {/* --- HEADER SECTION (Fixed / Will not scroll) --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#fffdf5] border-b border-[#fde68a]">
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-bold text-[#1e293b]">
            Bucket List Progress
          </h2>

          <div className="relative group flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-[1.5px] border-[#fbbf24] text-[#f59e0b] flex items-center justify-center text-xs font-bold cursor-help">
              i
            </div>
            <div className="absolute top-full mt-2 left-0 hidden group-hover:block bg-[#1e293b] text-white text-xs px-3 py-2 rounded shadow-lg w-48 z-10">
              Track progress on your dreams and long-term aspirations
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={progressFilter}
              onChange={(e) => setProgressFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm text-[#334155] font-medium outline-none hover:border-gray-300 cursor-pointer shadow-sm"
            >
              <option value="All Progress">All Progress</option>
              <option value="Dreaming">Dreaming</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
            </select>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm text-[#334155] font-medium outline-none hover:border-gray-300 cursor-pointer shadow-sm"
            >
              <option value="All Categories">All Categories</option>
              <option value="Travel">Travel</option>
              <option value="Career">Career</option>
              <option value="Personal">Personal</option>
              <option value="Adventure">Adventure</option>
              <option value="Learning">Learning</option>
            </select>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* --- LIST SECTION (Scrollable) --- */}
      {/* 🟢 Yahan max-h-[400px] aur overflow-y-auto lagaya hai */}
      <div className="flex flex-col gap-[6px] p-[6px] max-h-[400px] overflow-y-auto custom-scrollbar">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-white px-5 py-3 rounded-sm shadow-sm shrink-0"
            >
              <h3 className="font-bold text-[#0f172a] text-[15px] mb-1">
                {item.title}
              </h3>
              <input
                type="text"
                placeholder="..."
                defaultValue={item.notes}
                className="w-full outline-none text-sm text-[#64748b] placeholder-gray-400 bg-transparent mb-3"
              />
              <div className="flex gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${getProgressStyle(item.progress)}`}
                >
                  {item.progress}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${getCategoryStyle(item.category)}`}
                >
                  {item.category}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white px-5 py-8 text-center rounded-sm text-gray-500 text-sm shadow-sm">
            No bucket list items match your selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
