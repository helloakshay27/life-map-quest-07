import React, { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Loader2,
  Sparkles,
  Info,
  FileText,
  CalendarDays,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { getAuthHeaders } from "@/config/api";
import { useNavigate } from "react-router-dom";

// --- HELPERS ---
const getProgressStyle = (progress) => {
  switch (progress) {
    case "Dreaming":
      return "bg-purple-100 text-purple-700";
    case "Planning":
      return "bg-blue-100 text-blue-700";
    case "In Progress":
      return "bg-green-100 text-green-700";
    case "Achieved":
      return "bg-teal-100 text-teal-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getCategoryStyle = (category) => {
  switch (category) {
    case "Personal":
      return "bg-pink-100 text-pink-700";
    case "Career":
      return "bg-indigo-100 text-indigo-700";
    case "Travel":
      return "bg-blue-100 text-blue-700";
    case "Adventure":
      return "bg-orange-100 text-orange-700";
    case "Learning":
      return "bg-teal-100 text-teal-700";
    case "Health":
      return "bg-red-100 text-red-700";
    case "Relationships":
      return "bg-rose-100 text-rose-700";
    case "Finance":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const BucketListProgress = () => {
  const navigate = useNavigate();
  // --- STATE ---
  const [bucketList, setBucketList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [peopleCount, setPeopleCount] = useState(0);
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);
  const [bucketProgressFilter, setBucketProgressFilter] =
    useState("All Progress");
  const [bucketCategoryFilter, setBucketCategoryFilter] =
    useState("All Categories");

  // --- API FETCH (GET) ---
  useEffect(() => {
    fetchDreams();
    fetchPeopleCount();
  }, []);

  const fetchPeopleCount = async () => {
    setIsLoadingPeople(true);
    try {
      const response = await fetch("https://life-api.lockated.com/people", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Failed to fetch people");
      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : data.people || data.data || data.items || [];
      setPeopleCount(Array.isArray(list) ? list.length : 0);
    } catch (error) {
      console.error("Error fetching people:", error);
      setPeopleCount(0);
    } finally {
      setIsLoadingPeople(false);
    }
  };

  const fetchDreams = async () => {
    try {
      const response = await fetch("https://life-api.lockated.com/dreams", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch dreams");
      const data = await response.json();

      const mappedItems = [];
      const mapCategory = (itemsArray, progressLabel) => {
        if (!Array.isArray(itemsArray)) return;
        itemsArray.forEach((item) => {
          mappedItems.push({
            id: item.id.toString(),
            title: item.title || "",
            notes: item.description || "",
            category: item.category || "Personal",
            progress: progressLabel,
          });
        });
      };

      mapCategory(data.dreaming, "Dreaming");
      mapCategory(data.planning, "Planning");
      mapCategory(data.in_progress, "In Progress");
      mapCategory(data.achieved, "Achieved");

      setBucketList(mappedItems);
    } catch (error) {
      console.error("Error fetching dreams:", error);
      toast.error("Failed to load bucket list");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOCAL STATE UPDATER ---
  const handleLocalUpdate = (id, field, value) => {
    setBucketList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  // --- CREATE (POST) ---
  const addBucketItem = async () => {
    try {
      // Backend par instantly empty goal create karo taaki uski real ID mil sake
      const payload = {
        title: "",
        description: "",
        category: "Personal",
        status: "dreaming",
      };

      const response = await fetch("https://life-api.lockated.com/dreams", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create dream");
      const data = await response.json();

      const newItem = {
        id: data.id.toString(),
        title: data.title || "",
        notes: data.description || "",
        category: data.category || "Personal",
        progress: "Dreaming",
      };

      setBucketList([newItem, ...bucketList]);
    } catch (error) {
      console.error(error);
      toast.error("Could not add item");
    }
  };

  // --- DELETE (DELETE) ---
  const removeBucketItem = async (id) => {
    // Optimistic delete from UI
    setBucketList((prev) => prev.filter((item) => item.id !== id));

    try {
      const response = await fetch(
        `https://life-api.lockated.com/dreams/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );
      if (!response.ok) throw new Error("Delete failed");
      toast.success("Item deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item");
      fetchDreams(); // Rollback if failed
    }
  };

  // --- UPDATE STATUS (PATCH) ---
  const handleProgressChange = async (id, newProgress) => {
    handleLocalUpdate(id, "progress", newProgress);

    const apiStatus =
      newProgress === "Dreaming"
        ? "dreaming"
        : newProgress === "Planning"
          ? "planning"
          : newProgress === "In Progress"
            ? "in_progress"
            : "achieved";

    try {
      await fetch(`https://life-api.lockated.com/dreams/${id}/change_status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: apiStatus }),
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  // --- UPDATE DETAILS ON BLUR (PUT) ---
  const syncItemData = async (item) => {
    // Assuming you have a general PUT endpoint for editing descriptions/titles
    try {
      await fetch(`https://life-api.lockated.com/dreams/${item.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: item.title,
          description: item.notes,
          category: item.category,
        }),
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    }
  };

  // --- FILTER LOGIC ---
  const filteredBucketList = bucketList.filter((item) => {
    const matchProgress =
      bucketProgressFilter === "All Progress" ||
      item.progress === bucketProgressFilter;
    const matchCategory =
      bucketCategoryFilter === "All Categories" ||
      item.category === bucketCategoryFilter;
    return matchProgress && matchCategory;
  });

  const activeCount = bucketList.filter(
    (i) => i.progress !== "Achieved",
  ).length;
  const doneCount = bucketList.filter((i) => i.progress === "Achieved").length;

  return (
    <div className="border-2 border-amber-300 bg-amber-50/30 rounded-2xl overflow-hidden font-sans">

      {/* ── HEADER ── */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: icon + title + info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[17px] font-bold text-gray-900">Bucket List Progress</h3>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </div>
              <p className="text-[13px] text-gray-500 mt-0.5">Track progress on your dreams this week</p>
            </div>
          </div>
          {/* Right: Active / Done pills */}
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <span className="px-3 py-1 rounded-full border border-amber-400 text-amber-700 bg-amber-50 text-[12px] font-bold">
              {activeCount} Active
            </span>
            <span className="px-3 py-1 rounded-full border border-green-400 text-green-700 bg-green-50 text-[12px] font-bold">
              {doneCount} Done
            </span>
          </div>
        </div>

      </div>

      <div className="px-6 pb-6 space-y-4">
        {/* ── ADD BUTTON ── */}
        <button
          onClick={addBucketItem}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[15px] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Add New Bucket List Item
        </button>

        {/* ── FILTERS ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={bucketProgressFilter}
            onChange={(e) => setBucketProgressFilter(e.target.value)}
            className="h-8 rounded-lg border border-amber-200 bg-white px-2 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            <option value="All Progress">All Progress</option>
            <option value="Dreaming">Dreaming</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="Achieved">Achieved</option>
          </select>
          <select
            value={bucketCategoryFilter}
            onChange={(e) => setBucketCategoryFilter(e.target.value)}
            className="h-8 rounded-lg border border-amber-200 bg-white px-2 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            <option value="All Categories">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Career">Career</option>
            <option value="Personal">Personal</option>
            <option value="Adventure">Adventure</option>
            <option value="Learning">Learning</option>
            <option value="Health">Health</option>
            <option value="Relationships">Relationships</option>
            <option value="Finance">Finance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* ── LIST ── */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : filteredBucketList.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center border border-amber-100">
            <p className="text-sm text-gray-500">No bucket list items match your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredBucketList.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl border-l-4 border-l-amber-400 border border-amber-100 shadow-sm overflow-hidden"
              >
                {/* Row: icon + title + badge + Add Note + delete */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={1.5} />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleLocalUpdate(item.id, "title", e.target.value)}
                    onBlur={() => syncItemData(item)}
                    placeholder="What is your dream...?"
                    className="font-semibold text-gray-900 text-[14px] bg-transparent outline-none flex-1 min-w-0"
                  />
                  <select
                    value={item.progress}
                    onChange={(e) => handleProgressChange(item.id, e.target.value)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold appearance-none cursor-pointer outline-none shrink-0 ${getProgressStyle(item.progress)}`}
                  >
                    <option value="Dreaming">Dreaming</option>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Achieved">Achieved</option>
                  </select>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[12px] font-semibold hover:bg-amber-100 transition-colors shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                    Add Note
                  </button>
                  <button
                    onClick={() => removeBucketItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress update textarea */}
                <div className="px-4 pb-3">
                  <textarea
                    value={item.notes}
                    onChange={(e) => handleLocalUpdate(item.id, "notes", e.target.value)}
                    onBlur={() => syncItemData(item)}
                    placeholder="Add progress update for this week..."
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg text-[13px] text-gray-600 placeholder-gray-400 px-3 py-2 outline-none resize-none focus:ring-1 focus:ring-amber-300"
                  />
                </div>

                {/* Category badge row */}
                <div className="px-4 pb-3 flex items-center gap-2">
                  <select
                    value={item.category}
                    onChange={(e) => {
                      handleLocalUpdate(item.id, "category", e.target.value);
                      syncItemData({ ...item, category: e.target.value });
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold appearance-none cursor-pointer outline-none ${getCategoryStyle(item.category)}`}
                  >
                    <option value="Personal">Personal</option>
                    <option value="Career">Career</option>
                    <option value="Travel">Travel</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Learning">Learning</option>
                    <option value="Health">Health</option>
                    <option value="Relationships">Relationships</option>
                    <option value="Finance">Finance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* People Status Banner (footer) */}
        <button
          onClick={() => navigate("/people")}
          className="mt-4 w-full rounded-2xl border-2 border-pink-300 bg-pink-50/40 py-5 px-4 text-center transition-colors hover:bg-pink-50"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            {isLoadingPeople ? (
              <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
            ) : peopleCount > 0 ? (
              <Users className="w-7 h-7 text-pink-500" />
            ) : (
              <CalendarDays className="w-7 h-7 text-pink-500" />
            )}

            <p className="text-[15px] font-medium text-gray-700">
              {isLoadingPeople
                ? "Checking people..."
                : peopleCount > 0
                  ? `${peopleCount} people added`
                  : "No people added yet"}
            </p>
            <span className="text-[12px] text-pink-600 font-semibold">
              {peopleCount > 0 ? "Click to view people" : "Click to add people"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default BucketListProgress;
