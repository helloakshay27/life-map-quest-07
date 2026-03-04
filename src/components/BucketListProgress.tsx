import React, { useState, useEffect } from "react";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAuthHeaders } from "@/config/api";

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
  // --- STATE ---
  const [bucketList, setBucketList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bucketProgressFilter, setBucketProgressFilter] =
    useState("All Progress");
  const [bucketCategoryFilter, setBucketCategoryFilter] =
    useState("All Categories");

  // --- API FETCH (GET) ---
  useEffect(() => {
    fetchDreams();
  }, []);

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

  return (
    <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100 font-sans">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-semibold text-gray-900">
            Bucket List Progress
          </h3>

          {/* Add Button */}
          <button
            className="flex items-center gap-1 h-7 px-2 ml-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors shadow-sm"
            onClick={addBucketItem}
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={bucketProgressFilter}
            onChange={(e) => setBucketProgressFilter(e.target.value)}
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
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
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
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
      </div>

      {/* List Area */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
          {filteredBucketList.length > 0 ? (
            filteredBucketList.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col gap-1 rounded-lg bg-white px-4 py-3 border border-gray-100 shadow-sm shrink-0 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Live Editable Title (Syncs on Blur) */}
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleLocalUpdate(item.id, "title", e.target.value)
                    }
                    onBlur={() => syncItemData(item)}
                    placeholder="What is your dream...?"
                    className="font-medium text-gray-900 text-sm bg-transparent outline-none w-full"
                  />
                  {/* Delete Button */}
                  <button
                    onClick={() => removeBucketItem(item.id)}
                    className="text-gray-400 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Live Editable Notes (Syncs on Blur) */}
                <input
                  type="text"
                  placeholder="Add notes..."
                  value={item.notes}
                  onChange={(e) =>
                    handleLocalUpdate(item.id, "notes", e.target.value)
                  }
                  onBlur={() => syncItemData(item)}
                  className="w-full bg-transparent outline-none text-xs text-gray-500 placeholder:text-gray-400 mb-2"
                />

                {/* API Synced Dropdowns */}
                <div className="flex gap-2">
                  <select
                    value={item.progress}
                    onChange={(e) =>
                      handleProgressChange(item.id, e.target.value)
                    }
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold appearance-none cursor-pointer outline-none text-center ${getProgressStyle(item.progress)}`}
                  >
                    <option className="bg-white text-gray-900" value="Dreaming">
                      Dreaming
                    </option>
                    <option className="bg-white text-gray-900" value="Planning">
                      Planning
                    </option>
                    <option
                      className="bg-white text-gray-900"
                      value="In Progress"
                    >
                      In Progress
                    </option>
                    <option className="bg-white text-gray-900" value="Achieved">
                      Achieved
                    </option>
                  </select>

                  <select
                    value={item.category}
                    onChange={(e) => {
                      handleLocalUpdate(item.id, "category", e.target.value);
                      syncItemData({ ...item, category: e.target.value });
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold appearance-none cursor-pointer outline-none text-center ${getCategoryStyle(item.category)}`}
                  >
                    <option className="bg-white text-gray-900" value="Personal">
                      Personal
                    </option>
                    <option className="bg-white text-gray-900" value="Career">
                      Career
                    </option>
                    <option className="bg-white text-gray-900" value="Travel">
                      Travel
                    </option>
                    <option
                      className="bg-white text-gray-900"
                      value="Adventure"
                    >
                      Adventure
                    </option>
                    <option className="bg-white text-gray-900" value="Learning">
                      Learning
                    </option>
                    <option className="bg-white text-gray-900" value="Health">
                      Health
                    </option>
                    <option
                      className="bg-white text-gray-900"
                      value="Relationships"
                    >
                      Relationships
                    </option>
                    <option className="bg-white text-gray-900" value="Finance">
                      Finance
                    </option>
                    <option className="bg-white text-gray-900" value="Other">
                      Other
                    </option>
                  </select>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-white p-6 text-center border border-gray-100">
              <p className="text-sm text-gray-500">
                No bucket list items match your filters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BucketListProgress;
