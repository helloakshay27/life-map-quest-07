import React, { useState } from "react";
import { List, LayoutGrid, Sparkles, Plus, Filter, Star, Edit, Trash2 } from "lucide-react";
import { AddDreamDialog } from "@/components/AddDreamDialog";
import { toast } from "sonner";
import { getAuthHeaders } from "@/config/api";

// Types
type Category =
  | "All Categories"
  | "Travel"
  | "Career"
  | "Personal"
  | "Adventure"
  | "Learning";
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
  Travel: "bg-[#3b82f6]", // blue
  Career: "bg-[#a855f7]", // purple
  Personal: "bg-[#ec4899]", // pink
  Adventure: "bg-[#f97316]", // orange
  Learning: "bg-[#14b8a6]", // teal
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
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50/50",
  },
  {
    id: "Planning & Research",
    title: "Planning & Research",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50/50",
  },
  {
    id: "In Progress",
    title: "In Progress",
    borderColor: "border-orange-200",
    bgColor: "bg-orange-50/50",
  },
  {
    id: "Achieved",
    title: "Achieved",
    borderColor: "border-teal-200",
    bgColor: "bg-teal-50/50",
  },
];

export default function BucketList({ data = [] }: { data?: BucketListItem[] }) {
  const [items, setItems] = useState<BucketListItem[]>(data);
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [categoryFilter, setCategoryFilter] =
    useState<Category>("All Categories");
  const [viewMode, setViewMode] = useState<"list" | "board">("board");

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
            };
            mappedItems.push({
              id: item.id.toString(),
              title: item.title,
              description: item.description,
              category: item.category,
              progress: progressLabel,
            });
          });
        };

        mapCategory(data.dreaming, "Dreaming & Ideas");
        mapCategory(data.planning, "Planning & Research");
        mapCategory(data.in_progress, "In Progress");
        mapCategory(data.achieved, "Achieved");

        // Merge with existing data (e.g., if props provided data), but typically we just overwrite with API data
        setItems(mappedItems);

        if (mappedItems.length > 0) {
          setSamplesLoaded(true); // Auto-hide 'Load Samples' if we have real API data
        }
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

    try {
      const apiStatus =
        progressLane === "Dreaming & Ideas"
          ? "dreaming"
          : progressLane === "Planning & Research"
            ? "planning"
            : progressLane === "In Progress"
              ? "in_progress"
              : "achieved";

      const response = await fetch(
        `https://life-api.lockated.com/dreams/${itemId}/change_status`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: apiStatus }),
        },
      );

      if (!response.ok) throw new Error("Failed to change status");
      toast.success(`Moved to ${progressLane}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync move to API.");
      // Rollback logic could be added here
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
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemToSave.id
            ? { ...itemToSave, id: itemToSave.id as string }
            : item,
        ),
      );

      try {
        const apiStatus =
          itemToSave.progress === "Dreaming & Ideas"
            ? "dreaming"
            : itemToSave.progress === "Planning & Research"
              ? "planning"
              : itemToSave.progress === "In Progress"
                ? "in_progress"
                : "achieved";

        const response = await fetch(
          `https://life-api.lockated.com/dreams/${itemToSave.id}/change_status`,
          {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: apiStatus }),
          },
        );

        if (!response.ok) throw new Error("Failed to update status");
        toast.success("Dream updated successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to sync status update to API.");
      }
    } else {
      try {
        const apiStatus =
          itemToSave.progress === "Dreaming & Ideas"
            ? "dreaming"
            : itemToSave.progress === "Planning & Research"
              ? "planning"
              : itemToSave.progress === "In Progress"
                ? "in_progress"
                : "achieved";

        const payload = {
          title: itemToSave.title,
          description: itemToSave.description || "",
          category: itemToSave.category,
          status: apiStatus,
        };

        const response = await fetch("https://life-api.lockated.com/dreams", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to create dream");
        }

        const data = await response.json();

        const frontendStatus =
          data.status === "dreaming"
            ? "Dreaming & Ideas"
            : data.status === "planning"
              ? "Planning & Research"
              : data.status === "in_progress" || data.status === "in progress"
                ? "In Progress"
                : "Achieved";

        const newItem: BucketListItem = {
          id: data.id?.toString() || Math.random().toString(36).substring(2, 9),
          title: data.title || itemToSave.title,
          category: data.category || itemToSave.category,
          progress: frontendStatus as Progress,
          description: data.description || itemToSave.description,
        };

        setItems((prev) => [...prev, newItem]);
        toast.success("Dream created successfully via API!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to create Dream via API. Please try again.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic UI update - remove from state immediately
    const deletedItem = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const response = await fetch(
        `https://life-api.lockated.com/dreams/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to delete dream: ${response.status}`);
      }

      toast.success("Dream deleted successfully!");
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream. Please try again.");
      
      // Rollback: restore the deleted item if API call failed
      if (deletedItem) {
        setItems((prev) => [...prev, deletedItem]);
      }
    }
  };

  const filteredItems = items.filter(
    (item) =>
      categoryFilter === "All Categories" || item.category === categoryFilter,
  );

  return (
    <div className="w-full mx-auto flex flex-col h-full bg-white font-sans max-w-[1400px] p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Bucket List
          </h1>
          <p className="text-[#e11d48] font-medium mt-1 text-sm sm:text-base">
            What you Seek, is Seeking You !
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center border border-gray-200 rounded-md p-1 bg-white">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-sm ${viewMode === "list" ? "bg-red-100 text-red-700" : "text-red-400 hover:text-red-700 hover:bg-red-50"}`}
            >
              <List className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-sm ${viewMode === "board" ? "bg-red-100 text-red-700" : "text-red-400 hover:text-red-700 hover:bg-red-50"}`}
            >
              <LayoutGrid className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
          </div>

          {!samplesLoaded && (
            <button
              onClick={loadSamples}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 rounded-md text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Load Samples
            </button>
          )}

          <AddDreamDialog onSave={handleSave}>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Dream
            </button>
          </AddDreamDialog>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#eff6ff] border-l-[3px] border-[#3b82f6] p-4 rounded-r-md mb-8">
        <p className="text-[13px] text-[#475569] leading-relaxed">
          <span className="font-semibold text-[#1e293b]">
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
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-5 h-5 text-gray-400" />
        <div className="relative w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm text-gray-700 outline-none hover:border-gray-300 focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] cursor-pointer shadow-sm"
          >
            <option value="All Categories">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Career">Career</option>
            <option value="Personal">Personal</option>
            <option value="Adventure">Adventure</option>
            <option value="Learning">Learning</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Board View */}
      {viewMode === "board" && (
        <div className="flex flex-1 gap-4 sm:gap-5 overflow-x-auto min-h-[400px] pb-4 snap-x snap-mandatory">
          {COLUMNS.map((col) => {
            const colItems = filteredItems.filter((i) => i.progress === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col flex-1 min-w-[280px] sm:min-w-[250px] shrink-0 snap-center sm:snap-align-none rounded-xl border-2 ${col.borderColor} ${col.bgColor} p-4`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 text-[15px]">
                    {col.title}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-white text-gray-700`}
                  >
                    {colItems.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col">
                  {colItems.length > 0 ? (
                    <div className="space-y-3">
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
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-orange-200 transition-all text-left grab sm:active:cursor-grabbing"
                          >
                            <div
                              className={`w-9 h-9 rounded-md flex items-center justify-center text-white mb-3 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] ${CATEGORY_COLORS[item.category] || "bg-gray-400"}`}
                            >
                              <Star className="w-5 h-5 fill-current" />
                            </div>
                            <h4 className="font-bold text-[14px] text-gray-900 leading-snug">
                              {item.title}
                            </h4>
                            <div className="mt-2 mb-4">
                              <span className="inline-block border border-gray-200 text-gray-600 bg-white px-2 py-0.5 rounded text-[11px] font-bold">
                                {item.category}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[12px] text-gray-500 leading-relaxed max-w-full">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </AddDreamDialog>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-[#94a3b8] text-sm font-medium">
                      No items yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View placeholder if needed */}
      {viewMode === "list" && (
        <div className="flex-1 flex flex-col">
          {filteredItems.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Dream Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center text-white shadow-sm ${CATEGORY_COLORS[item.category] || "bg-gray-400"}`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {item.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-3 py-1 text-xs font-bold text-white rounded-full bg-gray-400"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[item.category] || "#9ca3af",
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                            item.progress === "Dreaming & Ideas"
                              ? "bg-blue-100 text-blue-800"
                              : item.progress === "Planning & Research"
                                ? "bg-purple-100 text-purple-800"
                                : item.progress === "In Progress"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-teal-100 text-teal-800"
                          }`}
                        >
                          {item.progress}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 truncate max-w-xs">
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
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </AddDreamDialog>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete dream"
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
