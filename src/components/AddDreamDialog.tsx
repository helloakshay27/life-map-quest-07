import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Heart,
  Target,
  BookOpen,
  Save,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";
import { getAuthHeaders } from "@/config/api";
import { toast } from "sonner";

export interface BucketListItem {
  id?: string;
  title: string;
  progress: string;
  category: string;
  description?: string;
}

export function AddDreamDialog({
  children,
  initialData,
  onSave,
  onDelete,
}: {
  children: React.ReactNode;
  initialData?: BucketListItem;
  onSave?: (data: BucketListItem) => void;
  onDelete?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dreamTitle, setDreamTitle] = useState("");
  const [category, setCategory] = useState("Personal");
  const [status, setStatus] = useState("Dreaming");
  const [description, setDescription] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [coreValues, setCoreValues] = useState<Record<string, unknown>[]>([]);
  const [goals, setGoals] = useState<Record<string, unknown>[]>([]);
  const [notes, setNotes] = useState<Record<string, unknown>[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNoteId, setIsDeletingNoteId] = useState<
    string | number | null
  >(null);

  // Initialize form when dialog opens
  React.useEffect(() => {
    if (open) {
      setDreamTitle(initialData?.title || "");
      setCategory(initialData?.category || "Personal");
      setStatus(initialData?.progress || "Dreaming & Ideas");
      setDescription(initialData?.description || "");
      setProgressNotes("");
      setCoreValues([]);
      setGoals([]);
      setNotes([]);

      if (initialData?.id && !initialData.id.startsWith("s")) {
        const fetchDetails = async () => {
          setIsLoadingDetails(true);
          try {
            const response = await fetch(
              `https://api.lifecompass.lockated.com/dreams/${initialData.id}`,
              { headers: getAuthHeaders() },
            );
            if (response.ok) {
              const data = await response.json();
              // Update core content in case it's fresher than the shallow list view cache
              setDreamTitle(data.title || initialData.title);
              setDescription(data.description || initialData.description || "");

              setCoreValues(data.core_values || []);
              setGoals(data.goals || []);
              setNotes(data.notes || []);
            }
          } catch (error) {
            console.error("Failed to fetch dream details", error);
          } finally {
            setIsLoadingDetails(false);
          }
        };
        fetchDetails();
      }
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    if (onSave) {
      onSave({
        id: initialData?.id, // undefined means it's a new item
        title: dreamTitle,
        category,
        progress: status,
        description,
      });
    }
    setOpen(false);
  };

  const handleDelete = () => {
    if (onDelete && initialData?.id) {
      onDelete(initialData.id);
    }
    setOpen(false);
  };

  const handleAddNote = async () => {
    if (
      !initialData?.id ||
      initialData.id.startsWith("s") ||
      !progressNotes.trim()
    )
      return;

    setIsAddingNote(true);
    try {
      const response = await fetch(
        `https://api.lifecompass.lockated.com/dreams/${initialData.id}/add_note`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ note: progressNotes }),
        },
      );

      if (!response.ok) throw new Error("Failed to add note");

      const newNote = await response.json();
      setNotes((prev) => [...prev, newNote]);
      setProgressNotes("");
      toast.success("Progress note added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add progress note.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNoteById = async (noteId: string | number) => {
    if (!initialData?.id) return;
    setIsDeletingNoteId(noteId);
    try {
      const response = await fetch(
        `https://api.lifecompass.lockated.com/dreams/${initialData.id}/notes/${noteId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );
      if (!response.ok) throw new Error("Failed to delete note");

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("Progress note deleted!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete progress note.");
    } finally {
      setIsDeletingNoteId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddNote();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[750px] max-h-[90vh] overflow-y-auto p-0 border-[#fde68a] bg-[#fffcf0] shadow-2xl rounded-xl custom-scrollbar sm:rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-[#fef3c7] sticky top-0 bg-[#fffcf0] z-10">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-[#ea580c]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7] to-[#8b5cf6] shadow-inner">
              {initialData ? (
                <Edit className="h-5 w-5 text-yellow-300" />
              ) : (
                <Sparkles className="h-6 w-6 text-yellow-300" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {initialData ? (
                <Edit className="h-5 w-5 text-[#ea580c]" />
              ) : (
                <Sparkles className="h-5 w-5 text-[#ea580c]" />
              )}
              {initialData ? "Edit Dream" : "Add New Dream"}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 py-6 space-y-7 text-[#334155]">
          {/* Main Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[14px] font-bold text-[#ea580c]">
              <Sparkles className="w-4 h-4" />
              What's Your Dream? *
            </label>
            <input
              autoFocus
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
              placeholder="e.g., Visit the Northern Lights, Write a Book, Learn to Surf..."
              className="w-full bg-white border-2 border-[#ea580c] rounded-lg px-4 py-3 text-[#1e293b] outline-none shadow-sm focus:ring-4 focus:ring-[#ffedd5] font-medium"
            />
          </div>

          {/* Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#475569]">
                Dream Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#fed7aa] rounded-lg py-2.5 pl-4 pr-10 text-sm text-[#334155] font-semibold outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ffedd5] shadow-sm cursor-pointer"
                >
                  <option value="Personal">🌟 Personal</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Career">💼 Career</option>
                  <option value="Adventure">🧗 Adventure</option>
                  <option value="Learning">📚 Learning</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
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

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#475569]">
                Progress Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#fed7aa] rounded-lg py-2.5 pl-4 pr-10 text-sm text-[#334155] font-semibold outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ffedd5] shadow-sm cursor-pointer"
                >
                  <option value="Dreaming & Ideas">Dreaming & Ideas</option>
                  <option value="Planning & Research">
                    Planning & Research
                  </option>
                  <option value="In Progress">In Progress</option>
                  <option value="Achieved">Achieved</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[14px] font-bold text-[#b45309]">
              <BookOpen className="w-4 h-4" />
              Describe Your Dream
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paint the picture... What will it look, feel, and mean to you when you achieve this dream?"
              className="w-full bg-white border border-[#fef08a] rounded-lg px-4 py-3 text-sm text-[#334155] outline-none shadow-sm focus:border-[#fcd34d] focus:ring-2 focus:ring-[#fef08a] resize-y min-h-[120px]"
            />
          </div>

          {/* Linked Sections */}
          <div className="space-y-4 pt-2">
            <div className="border border-[#e9d5ff] bg-[#faf5ff] rounded-xl p-4">
              <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#9333ea] mb-2">
                <Heart className="w-[15px] h-[15px]" />
                Linked Core Values
              </h4>
              <p className="flex items-center gap-1.5 text-xs text-[#a855f7] mb-3">
                <span className="text-yellow-500">💡</span> Connect your dream
                to your{" "}
                <span className="font-bold cursor-pointer hover:underline">
                  Core Values
                </span>
              </p>

              {isLoadingDetails ? (
                <div className="flex items-center gap-2 text-xs text-[#c084fc] font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching
                  values...
                </div>
              ) : coreValues.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {coreValues.map((cv, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#d8b4fe] text-[#9333ea] rounded-md shadow-sm"
                    >
                      {String(cv.name || "Unnamed Value")}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#c084fc] italic font-medium">
                  No Core Values defined yet
                </div>
              )}
            </div>

            <div className="border border-[#bfdbfe] bg-[#eff6ff] rounded-xl p-4">
              <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#2563eb] mb-2">
                <Target className="w-[15px] h-[15px]" />
                Linked Goals
              </h4>
              {isLoadingDetails ? (
                <div className="flex items-center gap-2 text-xs text-[#60a5fa] font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching
                  goals...
                </div>
              ) : goals.length > 0 ? (
                <div className="flex flex-col gap-2 mt-2">
                  {goals.map((g, idx) => (
                    <div
                      key={idx}
                      className="bg-white px-3 py-2 border border-[#93c5fd] rounded-md shadow-sm text-xs font-semibold text-[#2563eb]"
                    >
                      {String(g.title || "Unnamed Goal")}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#60a5fa] italic font-medium">
                  No goals defined yet
                </div>
              )}
            </div>

            <div className="border-2 border-[#99f6e4] bg-[#f0fdfa] rounded-xl p-4">
              <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#0d9488] mb-2">
                <BookOpen className="w-[15px] h-[15px]" />
                Progress Notes
              </h4>

              <div className="text-xs text-[#0f766e] mb-3 font-medium bg-white px-3 py-1.5 rounded-md shadow-sm opacity-80">
                Track your journey towards this dream - document milestones,
                learnings, and steps taken
              </div>

              <div className="mb-4">
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a progress update... What steps have you taken? What did you learn? (Ctrl+Enter to add)"
                  className="w-full bg-white border border-[#5eead4] rounded-lg px-3 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-[#99f6e4] min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddNote}
                    disabled={
                      isAddingNote ||
                      !progressNotes.trim() ||
                      !initialData?.id ||
                      initialData.id.startsWith("s")
                    }
                    className="bg-[#76dec9] text-white hover:bg-[#5fcbb5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow-sm"
                  >
                    {isAddingNote ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isAddingNote ? "Adding..." : "Add Note"}
                  </button>
                </div>
              </div>

              <h4 className="text-xs font-bold text-[#134e4a] mb-2 font-sans">
                Progress History ({notes.length})
              </h4>

              {isLoadingDetails ? (
                <div className="flex items-center gap-2 text-xs text-[#14b8a6] font-medium mb-3">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching
                  notes...
                </div>
              ) : notes.length > 0 ? (
                <div className="space-y-2">
                  {notes.map((n, idx) => {
                    const dateStr = n.created_at
                      ? new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(
                          new Date(n.created_at as string | number | Date),
                        )
                      : "";

                    return (
                      <div
                        key={idx}
                        className="flex flex-col gap-1.5 bg-white border border-[#5eead4] rounded-lg p-3 shadow-sm text-xs relative"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-[#0d9488]">
                            {dateStr}
                          </span>
                          <button
                            onClick={() =>
                              n.id &&
                              handleDeleteNoteById(n.id as string | number)
                            }
                            disabled={isDeletingNoteId === n.id || !n.id}
                            className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md transition-all disabled:opacity-50"
                          >
                            {isDeletingNoteId === n.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="text-[#334155] w-full text-left text-sm leading-relaxed">
                          {String(
                            n.content || n.message || n.note || "Unknown note",
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-[#14b8a6] italic font-medium">
                  No notes added yet
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter
          className={`p-5 border-t border-[#fef3c7] bg-[#fffcf0] sticky bottom-0 z-10 flex-row ${initialData ? "justify-between" : "justify-end"} space-x-2`}
        >
          {initialData && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-white bg-[#ea580c] hover:bg-[#c2410c] rounded-lg transition-colors shadow-md"
            >
              <Save className="w-4 h-4" />
              {initialData ? "Save Changes" : "Create Dream"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
