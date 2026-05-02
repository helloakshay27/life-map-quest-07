import React, { useState, useEffect } from "react";
import { Loader2, ChevronDown, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "@/config/api";

const API_BASE = "https://life-api.lockated.com";

// --- HELPERS ---
const getProgressStyle = (progress) => {
  switch (progress) {
    case "Dreaming":
      return "bg-[#D5D8D8]/40 text-[#888780]";
    case "Planning":
      return "bg-[#1858A5]/[0.08] text-[#1858A5]";
    case "In Progress":
      return "bg-[#0B5D41]/[0.08] text-[#0B5D41]";
    case "Achieved":
      return "bg-[#DA7756] text-white";
    default:
      return "bg-[#FEF4EE] text-[#888780]";
  }
};

const getCategoryStyle = () => {
  return "bg-white text-[#2C2C2A] border border-[#D6B99D]";
};

const statusToProgress = (status) => {
  switch (status) {
    case "dreaming":
      return "Dreaming";
    case "planning":
      return "Planning";
    case "in_progress":
      return "In Progress";
    case "achieved":
      return "Achieved";
    default:
      return "Dreaming";
  }
};

const progressToStatus = (progress) =>
  ({
    Dreaming: "dreaming",
    Planning: "planning",
    "In Progress": "in_progress",
    Achieved: "achieved",
  })[progress] || "dreaming";

const PROGRESS_OPTIONS = ["Dreaming", "Planning", "In Progress", "Achieved"];

const CATEGORY_OPTIONS = [
  "Personal",
  "Career",
  "Travel",
  "Adventure",
  "Learning",
  "Health",
  "Relationships",
  "Finance",
  "Other",
];

// --- CUSTOM PILL SELECT ---
const PillSelect = ({ value, options, onChange, colorFn }) => (
  <div className="relative inline-flex items-center">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none pl-2.5 pr-6 py-1 rounded-full text-[11px] font-semibold cursor-pointer outline-none ${colorFn(
        value,
      )}`}
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-white text-[#2C2C2A]">
          {o}
        </option>
      ))}
    </select>

    <ChevronDown className="pointer-events-none absolute right-1.5 w-3 h-3 opacity-60" />
  </div>
);

// --- MAIN COMPONENT ---
const BucketListProgress = () => {
  const navigate = useNavigate();

  const [bucketList, setBucketList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTexts, setUpdateTexts] = useState({});
  const [progressFilter, setProgressFilter] = useState("All Progress");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/dreams`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch dreams");

      const data = await response.json();

      let mapped = [];

      if (Array.isArray(data)) {
        mapped = data.map((item) => ({
          id: item.id.toString(),
          title: item.title || "",
          category: item.category || "Personal",
          progress: statusToProgress(item.status || "dreaming"),
        }));
      } else {
        const mapCategory = (arr, progressLabel) => {
          if (!Array.isArray(arr)) return;

          arr.forEach((item) =>
            mapped.push({
              id: item.id.toString(),
              title: item.title || "",
              category: item.category || "Personal",
              progress: progressLabel,
            }),
          );
        };

        mapCategory(data.dreaming, "Dreaming");
        mapCategory(data.planning, "Planning");
        mapCategory(data.in_progress, "In Progress");
        mapCategory(data.achieved, "Achieved");
      }

      setBucketList(mapped);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bucket list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalUpdate = (id, field, value) => {
    setBucketList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleProgressChange = async (id, newProgress) => {
    const oldItem = bucketList.find((i) => i.id === id);

    if (!oldItem || oldItem.progress === newProgress) return;

    // Optimistic UI update
    handleLocalUpdate(id, "progress", newProgress);

    try {
      const response = await fetch(`${API_BASE}/dreams/${id}/change_status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: progressToStatus(newProgress),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(`Status updated to ${newProgress}`);
    } catch (error) {
      console.error(error);

      // Rollback on failure
      handleLocalUpdate(id, "progress", oldItem.progress);

      toast.error("Failed to update status");
    }
  };

  const handleCategoryChange = async (id, newCategory) => {
    const oldItem = bucketList.find((i) => i.id === id);

    if (!oldItem || oldItem.category === newCategory) return;

    // Optimistic UI update
    handleLocalUpdate(id, "category", newCategory);

    try {
      const response = await fetch(`${API_BASE}/dreams/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: oldItem.title,
          category: newCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      toast.success(`Category updated to ${newCategory}`);
    } catch (error) {
      console.error(error);

      // Rollback on failure
      handleLocalUpdate(id, "category", oldItem.category);

      toast.error("Failed to update category");
    }
  };

  // --- API CALL TO ADD NOTE ---
  const handleAddUpdate = async (id) => {
    const text = updateTexts[id] || "";

    if (!text.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/dreams/${id}/add_note`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          note: text.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      toast.success("Note added successfully!");

      setUpdateTexts((prev) => ({
        ...prev,
        [id]: "",
      }));
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while adding the note");
    }
  };

  const filtered = bucketList.filter((item) => {
    const matchProgress =
      progressFilter === "All Progress" || item.progress === progressFilter;

    const matchCategory =
      categoryFilter === "All Categories" ||
      item.category === categoryFilter;

    return matchProgress && matchCategory;
  });

  return (
    <>
      <div className="bg-[#FEF4EE] rounded-2xl p-5 border border-[#D6B99D] font-sans w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#DA7756] flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 2L19.8 5.2L23 6L19.8 6.8L19 10L18.2 6.8L15 6L18.2 5.2L19 2Z"
                  fill="white"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 16L5.5 18L7.5 18.5L5.5 19L5 21L4.5 19L2.5 18.5L4.5 18L5 16Z"
                  fill="white"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-[15px] font-bold text-[#2C2C2A] flex items-center gap-2">
              Bucket List Progress

              <span className="relative group">
                <span className="w-[17px] h-[17px] rounded-full border border-[#DA7756] inline-flex items-center justify-center text-[#DA7756] text-[10px] font-bold cursor-pointer">
                  i
                </span>

                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-[#2C2C2A] text-white text-xs font-medium rounded-lg px-3 py-2 w-48 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                  Track progress on your dreams and long-term aspirations
                  <span className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-4 border-transparent border-r-[#2C2C2A]" />
                </span>
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/bucket-list")}
              className="flex items-center gap-1 h-8 px-3 rounded-lg bg-[#DA7756] hover:bg-[#C26547] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Dream
            </button>

            <div className="relative">
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-7 rounded-lg border border-[#D6B99D] bg-white text-xs text-[#2C2C2A] outline-none cursor-pointer"
              >
                <option>All Progress</option>
                {PROGRESS_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888780]" />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-7 rounded-lg border border-[#D6B99D] bg-white text-xs text-[#2C2C2A] outline-none cursor-pointer"
              >
                <option>All Categories</option>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888780]" />
            </div>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#DA7756]" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-0.5">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[#D6B99D] shadow-sm px-4 pt-3 pb-3 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-3">
                    {item.progress === "Achieved" ? (
                      <div className="w-5 h-5 rounded-md bg-[#DA7756] flex items-center justify-center text-white flex-shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-[#DA7756] text-base leading-none">
                        ✦
                      </span>
                    )}

                    <span
                      className={`font-semibold text-sm transition-all duration-300 ${
                        item.progress === "Achieved"
                          ? "line-through text-[#888780]"
                          : "text-[#2C2C2A]"
                      }`}
                    >
                      {item.title || "Untitled Dream"}
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Add update..."
                    value={updateTexts[item.id] || ""}
                    onChange={(e) =>
                      setUpdateTexts((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[#D6B99D] bg-[#FEF4EE] px-3 py-2 text-xs text-[#2C2C2A] placeholder:text-[#888780] resize-none outline-none focus:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 transition-all"
                  />

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleAddUpdate(item.id)}
                      className="flex items-center gap-1 h-7 px-3 rounded-full bg-white border border-[#D6B99D] hover:border-[#DA7756] text-[#2C2C2A] text-[11px] font-semibold transition-colors"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="inline-block"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="3"
                          fill="currentColor"
                          opacity="0.2"
                        />
                        <path
                          d="M12 8v8M8 12h8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      Add Progress
                    </button>

                    <PillSelect
                      value={item.progress}
                      options={PROGRESS_OPTIONS}
                      onChange={(val) => handleProgressChange(item.id, val)}
                      colorFn={getProgressStyle}
                    />

                    <PillSelect
                      value={item.category}
                      options={CATEGORY_OPTIONS}
                      onChange={(val) => handleCategoryChange(item.id, val)}
                      colorFn={getCategoryStyle}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 mt-2">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D6B99D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-3"
                >
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.275 1.275L3 12l5.8 1.9a2 2 0 0 1 1.275 1.275L12 21l1.9-5.8a2 2 0 0 1 1.275-1.275L21 12l-5.8-1.9a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>

                <p className="text-[15px] font-medium text-[#888780] mb-4">
                  No bucket list items matching filters
                </p>

                <button
                  onClick={() => navigate("/bucket-list")}
                  className="bg-white border border-[#D6B99D] text-[#2C2C2A] font-semibold text-[14px] px-5 py-2 rounded-lg shadow-sm hover:bg-[#FEF4EE] transition-colors"
                >
                  Create Your First Dream
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BucketListProgress;