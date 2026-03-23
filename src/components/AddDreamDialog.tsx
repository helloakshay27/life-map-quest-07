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
  Plus,
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
  const [localDraftNotes, setLocalDraftNotes] = useState<
    { id: string; content: string; created_at: string }[]
  >([]);

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
      setLocalDraftNotes([]); // Clear draft notes

      const fetchDetails = async () => {
        setIsLoadingDetails(true);
        try {
          // For existing dreams, fetch linked details
          if (initialData?.id && !initialData.id.startsWith("s")) {
            const response = await fetch(
              `https://life-api.lockated.com/dreams/${initialData.id}`,
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
          } else {
            // For new dreams, fetch all user's core values and goals
            try {
              const valuesResponse = await fetch(
                `https://life-api.lockated.com/core_values`,
                { headers: getAuthHeaders() },
              );
              if (valuesResponse.ok) {
                const valuesData = await valuesResponse.json();
                const values = Array.isArray(valuesData) ? valuesData : valuesData.core_values || [];
                setCoreValues(values);
              }
            } catch (error) {
              console.error("Failed to fetch core values", error);
            }

            try {
              const goalsResponse = await fetch(
                `https://life-api.lockated.com/goals`,
                { headers: getAuthHeaders() },
              );
              if (goalsResponse.ok) {
                const goalsData = await goalsResponse.json();
                const goalsList = Array.isArray(goalsData) ? goalsData : goalsData.goals || [];
                setGoals(goalsList);
              }
            } catch (error) {
              console.error("Failed to fetch goals", error);
            }
          }
        } catch (error) {
          console.error("Failed to fetch details", error);
        } finally {
          setIsLoadingDetails(false);
        }
      };
      
      fetchDetails();
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
    if (!progressNotes.trim()) return;

    // For new dreams (no ID yet), save as draft locally
    if (!initialData?.id || initialData.id.startsWith("s")) {
      const draftNote = {
        id: `draft-${Date.now()}`,
        content: progressNotes,
        created_at: new Date().toISOString(),
      };
      setLocalDraftNotes((prev) => [...prev, draftNote]);
      setProgressNotes("");
      toast.success("Note will be added once the dream is created!");
      return;
    }

    // For existing dreams, add via API
    setIsAddingNote(true);
    try {
      const response = await fetch(
        `https://life-api.lockated.com/dreams/${initialData.id}/add_note`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ note: progressNotes }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to add note: ${response.status} ${response.statusText}`,
        );
      }

      const newNote = await response.json();
      
      // Ensure the note object has the expected structure
      const normalizedNote = {
        id: newNote.id || `note-${Date.now()}`,
        content: newNote.content || newNote.note || progressNotes,
        message: newNote.message,
        created_at: newNote.created_at || new Date().toISOString(),
        ...newNote,
      };

      setNotes((prev) => [...prev, normalizedNote]);
      setProgressNotes("");
      toast.success("Progress note added successfully!");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add progress note. Please try again.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNoteById = async (noteId: string | number) => {
    if (!initialData?.id) return;
    setIsDeletingNoteId(noteId);
    try {
      const response = await fetch(
        `https://life-api.lockated.com/dreams/${initialData.id}/notes/${noteId}`,
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

      <DialogContent className="max-w-[750px] max-h-[90vh] overflow-y-auto p-0 border-[#E8E4D9] bg-[#FDFCF9] shadow-2xl rounded-2xl custom-scrollbar">
        <DialogHeader className="p-8 pb-5 border-b border-[#E8E4D9] sticky top-0 bg-[#FAF9F6] z-10 rounded-t-2xl">
          <DialogTitle className="flex items-center gap-4 text-[24px] font-bold text-[#111111] tracking-tight">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-[#E8E4D9] shadow-sm">
              {initialData ? (
                <Edit className="h-6 w-6 text-[#BBA48B]" />
              ) : (
                <Sparkles className="h-6 w-6 text-[#BBA48B]" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] leading-tight mb-1">
                {initialData ? "Refine Your Dream" : "Envision a New Dream"}
              </span>
              <span className="text-[11px] font-bold text-[#AAAAAA] uppercase tracking-widest">
                Bucket List Mastery
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 py-8 space-y-8 text-[#334155]">
          {/* Main Input */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-bold text-[#555555] uppercase tracking-widest opacity-80">
              <Sparkles className="w-3.5 h-3.5 text-[#BBA48B]" />
              What's Your Dream? *
            </label>
            <input
              autoFocus
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
              placeholder="e.g., Visit the Northern Lights, Write a Book, Learn to Surf..."
              className="w-full bg-white border border-[#E8E4D9] rounded-xl px-5 py-4 text-[#111111] font-bold text-[16px] outline-none shadow-none focus:border-[#BBA48B] transition-all placeholder:text-[#CCCCCC]"
            />
          </div>

          {/* Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[#555555] uppercase tracking-widest opacity-80">
                Dream Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E8E4D9] rounded-xl py-3.5 pl-5 pr-12 text-sm text-[#111111] font-bold outline-none focus:border-[#BBA48B] shadow-none cursor-pointer transition-all"
                >
                  <option value="Personal">🌟 Personal</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Career">💼 Career</option>
                  <option value="Adventure">🧗 Adventure</option>
                  <option value="Learning">📚 Learning</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#AAAAAA]">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[#555555] uppercase tracking-widest opacity-80">
                Progress Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E8E4D9] rounded-xl py-3.5 pl-5 pr-12 text-sm text-[#111111] font-bold outline-none focus:border-[#BBA48B] shadow-none cursor-pointer transition-all"
                >
                  <option value="Dreaming & Ideas">Dreaming & Ideas</option>
                  <option value="Planning & Research">
                    Planning & Research
                  </option>
                  <option value="In Progress">In Progress</option>
                  <option value="Achieved">Achieved</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#AAAAAA]">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-bold text-[#555555] uppercase tracking-widest opacity-80">
              <BookOpen className="w-3.5 h-3.5 text-[#BBA48B]" />
              Describe Your Dream
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paint the picture... What will it look, feel, and mean to you when you achieve this dream?"
              className="w-full bg-white border border-[#E8E4D9] rounded-xl px-5 py-4 text-sm text-[#111111] font-medium outline-none shadow-none focus:border-[#BBA48B] resize-y min-h-[120px] transition-all placeholder:text-[#CCCCCC]"
            />
          </div>

          {/* Linked Sections */}
          <div className="space-y-5 pt-2">
            <div className="border border-[#E8E4D9] bg-[#FAF9F6] rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-[12px] font-bold text-[#333333] uppercase tracking-widest mb-3">
                <Heart className="w-[15px] h-[15px] text-[#BBA48B]" />
                Linked Core Values
              </h4>
              <p className="flex items-center gap-2 text-[11px] text-[#888888] mb-4 font-bold uppercase tracking-wide">
                <span className="text-[#BBA48B]">💡</span> Connect your dream
                to your values
              </p>

              {isLoadingDetails ? (
                <div className="flex items-center gap-2 text-[12px] text-[#BBA48B] font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> FETCHING VALUES...
                </div>
              ) : coreValues.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {coreValues.map((cv, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-[11px] font-bold bg-white border border-[#E8E4D9] text-[#777777] rounded-lg uppercase tracking-wider"
                    >
                      {String(cv.name || "Unnamed Value")}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[12px] text-[#AAAAAA] italic font-medium">
                  No Core Values defined yet
                </div>
              )}
            </div>

            <div className="border border-[#E8E4D9] bg-[#FAF9F6] rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-[12px] font-bold text-[#333333] uppercase tracking-widest mb-3">
                <Target className="w-[15px] h-[15px] text-[#BBA48B]" />
                Linked Goals
              </h4>
              <p className="flex items-center gap-2 text-[11px] text-[#888888] mb-4 font-bold uppercase tracking-wide">
                <span className="text-[#BBA48B]">💡</span> Map steps for success
              </p>

              {isLoadingDetails ? (
                <div className="flex items-center gap-2 text-[12px] text-[#BBA48B] font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> FETCHING GOALS...
                </div>
              ) : goals.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {goals.map((g, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-[11px] font-bold bg-white border border-[#E8E4D9] text-[#777777] rounded-lg uppercase tracking-wider"
                    >
                      {String(g.title || "Unnamed Goal")}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-[12px] text-[#AAAAAA] italic font-medium">
                  No goals defined yet
                </div>
              )}
            </div>

            <div className="border border-[#E8E4D9] bg-[#FDFCF9] rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-[12px] font-bold text-[#333333] uppercase tracking-widest mb-4">
                <BookOpen className="w-[15px] h-[15px] text-[#BBA48B]" />
                Progress History
              </h4>

              <div className="mb-6">
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What steps have you taken today? (Ctrl+Enter to add)"
                  className="w-full bg-white border border-[#E8E4D9] rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-[#BBA48B] min-h-[100px] transition-all placeholder:text-[#CCCCCC]"
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="text-[11px] text-[#AAAAAA] font-bold uppercase tracking-widest">
                    {!initialData?.id || initialData.id.startsWith("s") ? "Drafting Note..." : ""}
                  </div>
                  <button
                    onClick={handleAddNote}
                    disabled={isAddingNote || !progressNotes.trim()}
                    className="bg-[#BBA48B] text-white hover:bg-[#A68F76] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg px-5 py-2 text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm"
                  >
                    {isAddingNote ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    {isAddingNote ? "Adding..." : "Add Update"}
                  </button>
                </div>
              </div>

              <h4 className="text-[11px] font-bold text-[#AAAAAA] mb-4 uppercase tracking-widest px-1">
                Timeline & Updates ({notes.length + localDraftNotes.length})
              </h4>

              {isLoadingDetails ? (
                <div className="flex items-center gap-2 text-xs text-[#14b8a6] font-medium mb-3">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching
                  notes...
                </div>
              ) : notes.length > 0 || localDraftNotes.length > 0 ? (
                <div className="space-y-2">
                  {localDraftNotes.map((n) => {
                    const dateStr = new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(n.created_at));

                    return (
                      <div
                        key={n.id}
                        className="flex flex-col gap-1.5 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 shadow-sm text-xs relative opacity-75"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-yellow-700">
                            {dateStr} (Draft)
                          </span>
                          <button
                            onClick={() =>
                              setLocalDraftNotes((prev) =>
                                prev.filter((note) => note.id !== n.id),
                              )
                            }
                            className="p-1 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-800 rounded-md transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-yellow-800 w-full text-left text-sm leading-relaxed">
                          {n.content}
                        </div>
                      </div>
                    );
                  })}
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
          className={`p-6 border-t border-[#E8E4D9] bg-[#FAF9F6] sticky bottom-0 z-10 flex-row ${initialData ? "justify-between" : "justify-end"} items-center space-x-3 rounded-b-2xl`}
        >
          {initialData && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-3 text-[12px] font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setOpen(false)}
              className="px-6 py-3 text-[12px] font-bold text-[#777777] bg-white border border-[#E8E4D9] rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 text-[12px] font-bold text-white bg-[#BBA48B] hover:bg-[#A68F76] rounded-xl transition-all shadow-md uppercase tracking-widest"
            >
              <Save className="w-4 h-4" />
              {initialData ? "Save Changes" : "Forge Vision"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
