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
    <div className="w-full mx-auto flex flex-col h-full bg-[#FDFCF9] font-sans max-w-[1400px] p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[31px] font-bold text-[#111111] tracking-tight">
            Bucket List
          </h1>
          <p className="text-[#BBA48B] font-bold mt-1 text-sm sm:text-base uppercase tracking-widest opacity-80">
            What you Seek, is Seeking You !
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center border border-[#E8E4D9] rounded-md p-1 bg-white">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "list" ? "bg-[#FAF9F6] text-[#BBA48B]" : "text-[#CCCCCC] hover:text-[#BBA48B] hover:bg-[#FAF9F6]"}`}
            >
              <List className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === "board" ? "bg-[#FAF9F6] text-[#BBA48B]" : "text-[#CCCCCC] hover:text-[#BBA48B] hover:bg-[#FAF9F6]"}`}
            >
              <LayoutGrid className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </div>

          {!samplesLoaded && (
            <button
              onClick={loadSamples}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FAF9F6] border border-[#E8E4D9] rounded-md text-sm font-bold text-[#BBA48B] hover:bg-white transition-colors shadow-none"
            >
              <Sparkles className="w-4 h-4" />
              Load Samples
            </button>
          )}

          <AddDreamDialog onSave={handleSave}>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#BBA48B] text-white rounded-md text-sm font-bold hover:bg-[#A68F76] transition-colors shadow-none">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Dream
            </button>
          </AddDreamDialog>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#FAF9F6] border-l-[3px] border-[#BBA48B] p-5 rounded-r-xl mb-8 border border-y-[#E8E4D9] border-r-[#E8E4D9]">
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
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-5 h-5 text-gray-400" />
        <div className="relative w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category)}
            className="w-full appearance-none bg-white border border-[#E8E4D9] rounded-md py-1.5 pl-3 pr-8 text-sm text-[#333333] font-bold outline-none hover:border-[#BBA48B] focus:border-[#BBA48B] cursor-pointer shadow-none"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 min-h-[400px] pb-4">
          {COLUMNS.map((col) => {
            const colItems = filteredItems.filter((i) => i.progress === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col rounded-2xl border-2 ${col.borderColor} ${col.bgColor} p-6 h-full`}
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-extrabold text-[#333333] text-[16px] uppercase tracking-wider opacity-90">
                    {col.title}
                  </h3>
                  <span
                    className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full border border-[#E8E4D9] bg-white text-[#BBA48B] shadow-none`}
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
                            className="bg-white p-5 rounded-xl shadow-none border border-[#E8E4D9] flex flex-col cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-[#BBA48B] transition-all text-left grab"
                          >
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4 shadow-sm ${CATEGORY_COLORS[item.category] || "bg-[#BBA48B]"}`}
                            >
                              <Star className="w-5 h-5 fill-current" />
                            </div>
                            <h4 className="font-bold text-[15px] text-[#111111] leading-tight mb-2">
                              {item.title}
                            </h4>
                            <div className="mb-4">
                              <span className="inline-block border border-[#E8E4D9] text-[#777777] bg-[#FAF9F6] px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                                {item.category}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[13px] text-[#6B7280] leading-relaxed max-w-full font-medium">
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
            <div className="overflow-x-auto border border-[#E8E4D9] rounded-xl bg-white shadow-none">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#E8E4D9]">
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
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm ${CATEGORY_COLORS[item.category] || "bg-[#BBA48B]"}`}
                          >
                            <Star className="w-4.5 h-4.5 fill-current" />
                          </div>
                          <p className="font-bold text-[#111111] text-[15px]">
                            {item.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold text-[#777777] rounded border border-[#E8E4D9] bg-[#FAF9F6] uppercase tracking-wider"
                        >
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
                              className="p-2 rounded-lg text-[#BBA48B] hover:bg-[#FAF9F6] transition-colors"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </button>
                          </AddDreamDialog>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete dream"
                            className="p-2 rounded-lg text-[#BBA48B] hover:bg-[#FAF9F6] transition-colors"
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
