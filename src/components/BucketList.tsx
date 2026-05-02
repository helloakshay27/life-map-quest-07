import React, { useState } from "react";
import { List, LayoutGrid, Sparkles, Plus, Filter, Star, Edit, Trash2, X } from "lucide-react";
import { AddDreamDialog } from "@/components/AddDreamDialog";
import { toast } from "sonner";
import { getAuthHeaders } from "@/config/api";

const LANE_COLORS: Record<string, { base: string; hover: string }> = {
  "Dreaming & Ideas": {
    base: "bg-indigo-50 border-indigo-200",
    hover: "bg-indigo-100 border-indigo-500 shadow-lg shadow-indigo-100",
  },
  "Planning & Research": {
    base: "bg-blue-50 border-blue-200",
    hover: "bg-blue-100 border-blue-500 shadow-lg shadow-blue-100",
  },
  "In Progress": {
    base: "bg-green-50 border-green-200",
    hover: "bg-green-100 border-green-500 shadow-lg shadow-green-100",
  },
  Achieved: {
    base: "bg-purple-50 border-purple-200",
    hover: "bg-purple-100 border-purple-500 shadow-lg shadow-purple-100",
  },
};

// Types
type Category =
  | "All Categories"
  | "Travel"
  | "Career"
  | "Personal"
  | "Adventure"
  | "Learning"
  | "Other";

type Progress =
  | "Dreaming & Ideas"
  | "Planning & Research"
  | "In Progress"
  | "Achieved";

interface BucketListItem {
  id: string;
  title: string;
  progress: Progress;
  category: string;
  description?: string;
  core_value_ids?: number[];
  goal_ids?: number[];
}

const SAMPLE_DATA: BucketListItem[] = [
  {
    id: "s1",
    title: "Travel to Japan",
    category: "Travel",
    progress: "Dreaming & Ideas",
    description: "Experience cherry blossoms and traditional culture",
  },
  {
    id: "s2",
    title: "Start a side business",
    category: "Career",
    progress: "Dreaming & Ideas",
    description: "Launch an online business",
  },
  {
    id: "s3",
    title: "Write a book",
    category: "Personal",
    progress: "Dreaming & Ideas",
    description: "Publish my first book",
  },
  {
    id: "s4",
    title: "Skydiving",
    category: "Adventure",
    progress: "Dreaming & Ideas",
    description: "Jump from a plane",
  },
  {
    id: "s5",
    title: "Learn a new language",
    category: "Learning",
    progress: "Planning & Research",
    description: "Become fluent in Spanish",
  },
  {
    id: "s6",
    title: "Run a marathon",
    category: "Personal",
    progress: "Planning & Research",
    description: "Complete a full 42km marathon",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Travel: "#3b82f6",    // blue
  Career: "#a855f7",    // purple
  Personal: "#ec4899",  // pink
  Adventure: "#f97316", // orange
  Learning: "#14b8a6",  // teal
  Other: "#6b7280",     // gray
};

const COLUMNS: {
  id: Progress;
  title: string;
  borderColor: string;
  bgColor: string;
}[] = [
  {
    id: "Dreaming & Ideas",
    title: "Dreaming & Ideas",
    borderColor: "border-[#E8E4D9]",
    bgColor: "bg-[#FAF9F6]",
  },
  {
    id: "Planning & Research",
    title: "Planning & Research",
    borderColor: "border-[#E8E4D9]",
    bgColor: "bg-[#FAF9F6]",
  },
  {
    id: "In Progress",
    title: "In Progress",
    borderColor: "border-[#E8E4D9]",
    bgColor: "bg-[#FAF9F6]",
  },
  {
    id: "Achieved",
    title: "Achieved",
    borderColor: "border-[#E8E4D9]",
    bgColor: "bg-[#FAF9F6]",
  },
];

/** Map frontend Progress label → API status string */
const toApiStatus = (progress: Progress): string => {
  switch (progress) {
    case "Dreaming & Ideas":    return "dreaming";
    case "Planning & Research": return "planning";
    case "In Progress":         return "in_progress";
    case "Achieved":            return "achieved";
  }
};

/** Map API status string → frontend Progress label */
const fromApiStatus = (status: string): Progress => {
  switch (status) {
    case "planning":    return "Planning & Research";
    case "in_progress":
    case "in progress": return "In Progress";
    case "achieved":    return "Achieved";
    default:            return "Dreaming & Ideas";
  }
};

export default function BucketList({ data = [] }: { data?: BucketListItem[] }) {
  const [items, setItems] = useState<BucketListItem[]>(data);
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [categoryFilter, setCategoryFilter] =
    useState<Category>("All Categories");
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [hoveredLane, setHoveredLane] = useState<Progress | null>(null);

  React.useEffect(() => {
    const fetchDreams = async () => {
      try {
        const response = await fetch("https://life-api.lockated.com/dreams", {
          headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to fetch dreams");
        const data = await response.json();

        const mappedItems: BucketListItem[] = [];

        const mapCategory = (
          itemsArray: unknown[],
          progressLabel: Progress,
        ) => {
          if (!Array.isArray(itemsArray)) return;
          itemsArray.forEach((itemObj: unknown) => {
            const item = itemObj as {
              id: string | number;
              title: string;
              description?: string;
              category: string;
              core_value_ids?: number[];
              goal_ids?: number[];
            };
            mappedItems.push({
              id: item.id.toString(),
              title: item.title,
              description: item.description,
              category: item.category,
              progress: progressLabel,
              core_value_ids: item.core_value_ids || [],
              goal_ids: item.goal_ids || [],
            });
          });
        };

        mapCategory(data.dreaming, "Dreaming & Ideas");
        mapCategory(data.planning, "Planning & Research");
        mapCategory(data.in_progress, "In Progress");
        mapCategory(data.achieved, "Achieved");

        setItems(mappedItems);
        if (mappedItems.length > 0) setSamplesLoaded(true);
      } catch (error) {
        console.error("Error fetching dreams:", error);
      }
    };

    fetchDreams();
  }, []);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
  };

  const handleDrop = async (e: React.DragEvent, progressLane: Progress) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (!itemId) return;

    const itemObj = items.find((i) => i.id === itemId);
    if (!itemObj || itemObj.progress === progressLane) return;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, progress: progressLane } : item,
      ),
    );

    // 💡 Early return for sample items
    if (itemId.startsWith("s")) {
      toast.success(`Moved to ${progressLane}`);
      return;
    }

    try {
      const response = await fetch(
        `https://life-api.lockated.com/dreams/${itemId}/change_status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: toApiStatus(progressLane) }),
        },
      );

      if (!response.ok) throw new Error("Failed to change status");
      toast.success(`Moved to ${progressLane}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync move to API.");
      // Rollback
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, progress: itemObj.progress } : item,
        ),
      );
    }
  };

  const loadSamples = () => {
    setItems((prev) => [...prev, ...SAMPLE_DATA]);
    setSamplesLoaded(true);
  };

  const handleSave = async (
    itemToSave: Omit<BucketListItem, "id"> & { id?: string },
  ) => {
    if (itemToSave.id) {
      // ── EDIT ──────────────────────────────────────────────────────────────
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemToSave.id
            ? { ...itemToSave, id: itemToSave.id as string }
            : item,
        ),
      );

      // 💡 Early return for sample items
      if (itemToSave.id.startsWith("s")) {
        toast.success("Dream updated successfully!");
        return;
      }

      try {
        const response = await fetch(
          `https://life-api.lockated.com/dreams/${itemToSave.id}/change_status`,
          {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: toApiStatus(itemToSave.progress) }),
          },
        );

        if (!response.ok) throw new Error("Failed to update status");
        toast.success("Dream updated successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to sync status update to API.");
      }
    } else {
      // ── CREATE ─────────────────────────────────────────────────────────────
      try {
        const payload = {
          title: itemToSave.title,
          description: itemToSave.description || "",
          category: itemToSave.category,
          status: toApiStatus(itemToSave.progress),
          core_value_ids: itemToSave.core_value_ids || [],
          goal_ids: itemToSave.goal_ids || [],
        };

        const response = await fetch("https://life-api.lockated.com/dreams", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to create dream");

        const data = await response.json();

        const newItem: BucketListItem = {
          id: data.id?.toString() || Math.random().toString(36).substring(2, 9),
          title: data.title || itemToSave.title,
          category: data.category || itemToSave.category,
          progress: fromApiStatus(data.status) || itemToSave.progress,
          description: data.description || itemToSave.description,
          core_value_ids: data.core_value_ids || itemToSave.core_value_ids || [],
          goal_ids: data.goal_ids || itemToSave.goal_ids || [],
        };

        setItems((prev) => [...prev, newItem]);
        toast.success("Dream created successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to create Dream via API. Please try again.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    const deletedItem = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));

    // Sample items only exist locally — skip the API call
    if (id.startsWith("s")) {
      toast.success("Sample removed!");
      return;
    }

    try {
      const response = await fetch(
        `https://life-api.lockated.com/dreams/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) throw new Error(`Failed to delete dream: ${response.status}`);
      toast.success("Dream deleted successfully!");
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream. Please try again.");
      if (deletedItem) setItems((prev) => [...prev, deletedItem]);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      categoryFilter === "All Categories" || item.category === categoryFilter,
  );

  return (
    <div
      className="w-full mx-auto flex flex-col h-full font-sans max-w-[1400px] p-3 sm:p-4"
      style={{ background: "#F6F4EE" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3 sm:mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bucket List</h1>
          <p className="text-sm text-muted-foreground">
            Dreams, plans, and achievements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center rounded-md p-1 bg-white border border-gray-200">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "list" ? "bg-[#DA7756] text-white border-[#DA7756]" : "text-[#DA7756] hover:bg-[#DA7756]/10"}`}
            >
              <List className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "board" ? "bg-[#DA7756] text-white border-[#DA7756]" : "text-[#DA7756] hover:bg-[#DA7756]/10"}`}
            >
              <LayoutGrid className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </div>

          {!samplesLoaded && (
            <button
              onClick={loadSamples}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-none text-[#DA7756] border border-[#DA7756]/40 hover:bg-[#DA7756]/10"
            >
              <Sparkles className="w-4 h-4" />
              Load Samples
            </button>
          )}

          <AddDreamDialog onSave={handleSave}>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#DA7756] hover:bg-[#C96B4D] text-white rounded-md text-sm font-bold transition-colors shadow-none">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Dream
            </button>
          </AddDreamDialog>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 sm:p-5 rounded-xl mb-4 border border-gray-200 bg-white">
        <p className="text-[14px] text-[#555555] leading-relaxed font-medium">
          <span className="font-bold text-[#333333]">
            💡 What is a Bucket List?
          </span>{" "}
          A collection of experiences, achievements, and goals you want to
          accomplish in your lifetime. Start with dreams (ideas you're
          exploring), move them to planning (actively researching), then in
          progress (taking action), and finally achieved (celebrate your wins!).
          Drag and drop items between columns to track your progress.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-5 h-5 text-[#DA7756]" />
        <div className="relative w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category)}
            className="w-full appearance-none bg-white border rounded-md py-1.5 pl-3 pr-8 text-sm text-[#333333] font-bold outline-none cursor-pointer shadow-none"
            style={{ borderColor: "#DA7756" }}
          >
            <option value="All Categories">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Career">Career</option>
            <option value="Personal">Personal</option>
            <option value="Adventure">Adventure</option>
            <option value="Learning">Learning</option>
            <option value="Other">Other</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Board View */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-h-[400px] pb-4">
          {COLUMNS.map((col) => {
            const colItems = filteredItems.filter((i) => i.progress === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoveredLane(col.id);
                }}
                onDragLeave={() => setHoveredLane(null)}
                onDrop={(e) => {
                  handleDrop(e, col.id);
                  setHoveredLane(null);
                }}
                className={`flex flex-col rounded-lg border-2 border-dashed p-3 sm:p-4 min-h-64 sm:min-h-80 lg:min-h-96 transition-all ${
                  hoveredLane === col.id
                    ? LANE_COLORS[col.id].hover
                    : LANE_COLORS[col.id].base
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                    {col.title}
                  </h3>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs sm:text-sm font-medium text-gray-700">
                    {colItems.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col">
                  {colItems.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {colItems.map((item) => (
                        <AddDreamDialog
                          key={item.id}
                          initialData={item}
                          onSave={handleSave}
                          onDelete={handleDelete}
                        >
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            className="relative group bg-white p-2 sm:p-3 rounded-lg shadow-sm border flex flex-col select-none touch-none cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5"
                          >
                            {/* Quick-delete X button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              title="Delete dream"
                              className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white border border-gray-200 text-gray-400 opacity-0 group-hover:opacity-100 hover:!bg-red-50 hover:!border-red-300 hover:!text-red-500 transition-all duration-150 shadow-sm"
                            >
                              <X className="w-3 h-3" strokeWidth={2.5} />
                            </button>

                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3 shadow-sm"
                              style={{
                                background:
                                  CATEGORY_COLORS[item.category] || "#DA7756",
                              }}
                            >
                              <Star className="w-5 h-5 fill-current" />
                            </div>
                            <h4 className="font-medium text-foreground text-sm sm:text-base leading-tight mb-1.5">
                              {item.title}
                            </h4>
                            <div className="mb-4">
                              <span className="inline-block text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                {item.category}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-full">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </AddDreamDialog>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-48 sm:min-h-56 flex-col items-center justify-center">
                      <svg
                        className="mb-3 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mx-auto"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                        <circle cx="12" cy="12" r="6" fill="none" />
                        <circle cx="12" cy="12" r="10" fill="none" />
                      </svg>
                      <p className="text-center text-xs sm:text-sm text-muted-foreground">
                        No items
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="flex-1 flex flex-col">
          {filteredItems.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-none">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F6F4EE] border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#777777] uppercase tracking-widest">
                      Dream Title
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#777777] uppercase tracking-widest">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#777777] uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#777777] uppercase tracking-widest">
                      Description
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold text-[#777777] uppercase tracking-widest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#EFEDE7]">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FAF9F6]/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm"
                            style={{ background: CATEGORY_COLORS[item.category] || "#6b7280" }}
                          >
                            <Star className="w-4.5 h-4.5 fill-current" />
                          </div>
                          <p className="font-bold text-[#111111] text-[15px]">
                            {item.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold text-[#777777] rounded border border-[#E8E4D9] bg-[#FAF9F6] uppercase tracking-wider">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                            item.progress === "Dreaming & Ideas"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : item.progress === "Planning & Research"
                                ? "bg-purple-50 text-purple-600 border border-purple-100"
                                : item.progress === "In Progress"
                                  ? "bg-orange-50 text-orange-600 border border-orange-100"
                                  : "bg-green-50 text-green-600 border border-green-100"
                          }`}
                        >
                          {item.progress}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] text-[#6B7280] font-medium truncate max-w-xs leading-relaxed">
                          {item.description || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <AddDreamDialog
                            initialData={item}
                            onSave={handleSave}
                            onDelete={handleDelete}
                          >
                            <button
                              title="Edit dream"
                              className="p-2 rounded-lg text-[#DA7756] hover:bg-[#DA7756]/10 transition-colors"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </button>
                          </AddDreamDialog>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete dream"
                            className="p-2 rounded-lg text-[#DA7756] hover:bg-[#DA7756]/10 transition-colors"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
              No dreams yet. Create your first dream!
            </div>
          )}
        </div>
      )}
    </div>
  );
}