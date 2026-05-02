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
  ExternalLink,
} from "lucide-react";
import { getAuthHeaders } from "@/config/api";
import { toast } from "sonner";
import { L } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";
import { Link } from "react-router-dom";

export interface BucketListItem {
  id?: string;
  title: string;
  progress: string;
  category: string;
  description?: string;
  core_value_ids?: number[];
  goal_ids?: number[];
}

interface CoreValue {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface Goal {
  id: number;
  title: string;
  [key: string]: unknown;
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
  const [status, setStatus] = useState("Dreaming & Ideas");
  const [description, setDescription] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Core values & goals as typed arrays
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Selected IDs for the payload
  const [selectedCoreValueIds, setSelectedCoreValueIds] = useState<number[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<number[]>([]);

  const [notes, setNotes] = useState<Record<string, unknown>[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNoteId, setIsDeletingNoteId] = useState<string | number | null>(null);
  const [localDraftNotes, setLocalDraftNotes] = useState<
    { id: string; content: string; created_at: string }[]
  >([]);

  // Validation errors
  const [errors, setErrors] = useState<{ title?: string; category?: string }>({});

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
      setLocalDraftNotes([]);
      setSelectedCoreValueIds(initialData?.core_value_ids || []);
      setSelectedGoalIds(initialData?.goal_ids || []);
      setErrors({});

      const fetchDetails = async () => {
        setIsLoadingDetails(true);
        try {
          if (initialData?.id && !initialData.id.startsWith("s")) {
            // Existing dream — fetch full detail (includes linked values/goals/notes)
            const response = await fetch(
              `https://life-api.lockated.com/dreams/${initialData.id}`,
              { headers: getAuthHeaders() },
            );
            if (response.ok) {
              const data = await response.json();
              setDreamTitle(data.title || initialData.title);
              setDescription(data.description || initialData.description || "");
              setNotes(data.notes || []);

              // Fetch all values & goals for the selection UI
              const [valRes, goalRes] = await Promise.allSettled([
                fetch("https://life-api.lockated.com/core_values", { headers: getAuthHeaders() }),
                fetch("https://life-api.lockated.com/goals", { headers: getAuthHeaders() }),
              ]);

              if (valRes.status === "fulfilled" && valRes.value.ok) {
                const vd = await valRes.value.json();
                const allValues: CoreValue[] = Array.isArray(vd) ? vd : vd.core_values || [];
                setCoreValues(allValues);
                // Pre-select the values already linked to this dream
                const linkedIds = (data.core_values || []).map((cv: CoreValue) => cv.id);
                setSelectedCoreValueIds(linkedIds);
              }

              if (goalRes.status === "fulfilled" && goalRes.value.ok) {
                const gd = await goalRes.value.json();
                const allGoals: Goal[] = Array.isArray(gd) ? gd : gd.goals || [];
                setGoals(allGoals);
                const linkedGoalIds = (data.goals || []).map((g: Goal) => g.id);
                setSelectedGoalIds(linkedGoalIds);
              }
            }
          } else {
            // New dream — fetch all values & goals for selection
            const [valRes, goalRes] = await Promise.allSettled([
              fetch("https://life-api.lockated.com/core_values", { headers: getAuthHeaders() }),
              fetch("https://life-api.lockated.com/goals", { headers: getAuthHeaders() }),
            ]);

            if (valRes.status === "fulfilled" && valRes.value.ok) {
              const vd = await valRes.value.json();
              setCoreValues(Array.isArray(vd) ? vd : vd.core_values || []);
            }

            if (goalRes.status === "fulfilled" && goalRes.value.ok) {
              const gd = await goalRes.value.json();
              setGoals(Array.isArray(gd) ? gd : gd.goals || []);
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

  const toggleCoreValue = (id: number) => {
    setSelectedCoreValueIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const toggleGoal = (id: number) => {
    setSelectedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const validate = () => {
    const newErrors: { title?: string; category?: string } = {};
    if (!dreamTitle.trim()) newErrors.title = "Dream title is required.";
    if (!category) newErrors.category = "Category is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (onSave) {
      onSave({
        id: initialData?.id,
        title: dreamTitle.trim(),
        category,
        progress: status,
        description,
        core_value_ids: selectedCoreValueIds,
        goal_ids: selectedGoalIds,
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
        throw new Error(`Failed to add note: ${response.status} ${response.statusText}`);
      }

      const newNote = await response.json();
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

      <DialogContent className="max-w-[750px] max-h-[90vh] overflow-y-auto p-0 border border-gray-200 bg-white shadow-2xl rounded-2xl custom-scrollbar">
        <DialogHeader className="p-8 pb-5 border-b border-gray-200 sticky top-0 bg-[#F6F4EE] z-10 rounded-t-2xl">
          <DialogTitle className="flex items-center gap-4 text-[24px] font-bold text-[#111111] tracking-tight">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm">
              {initialData ? (
                <Edit className="h-6 w-6 text-[#DA7756]" />
              ) : (
                <Sparkles className="h-6 w-6 text-[#DA7756]" />
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
          {/* Dream Title — required */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-bold text-[#555555] uppercase tracking-widest opacity-80">
              <Sparkles className="w-3.5 h-3.5 text-[#DA7756]" />
              What's Your Dream?{" "}
              <span className="text-[#DA7756] opacity-100 normal-case">*</span>
            </label>
            <input
              autoFocus
              value={dreamTitle}
              onChange={(e) => {
                setDreamTitle(e.target.value);
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g., Visit the Northern Lights, Write a Book, Learn to Surf..."
              className={`w-full bg-white border rounded-xl px-5 py-4 text-[#111111] font-bold text-[16px] outline-none shadow-none focus:border-[#DA7756] transition-all placeholder:text-[#CCCCCC] ${
                errors.title ? "border-red-400 bg-red-50" : "border-gray-200"
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 font-semibold">{errors.title}</p>
            )}
          </div>

          {/* Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category — required */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[#555555] uppercase tracking-widest opacity-80">
                Dream Category{" "}
                <span className="text-[#DA7756] opacity-100 normal-case">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value)
                      setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                  className={`w-full appearance-none bg-white border rounded-xl py-3.5 pl-5 pr-12 text-sm text-[#111111] font-bold outline-none focus:border-[#DA7756] shadow-none cursor-pointer transition-all ${
                    errors.category ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                >
                  <option value="Personal">🌟 Personal</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Career">💼 Career</option>
                  <option value="Adventure">🧗 Adventure</option>
                  <option value="Learning">📚 Learning</option>
                  <option value="Other">🔖 Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#AAAAAA]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.category && (
                <p className="text-xs text-red-500 font-semibold">{errors.category}</p>
              )}
            </div>

            {/* Progress Status */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[#555555] uppercase tracking-widest opacity-80">
                Progress Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-3.5 pl-5 pr-12 text-sm text-[#111111] font-bold outline-none focus:border-[#DA7756] shadow-none cursor-pointer transition-all"
                >
                  <option value="Dreaming & Ideas">Dreaming & Ideas</option>
                  <option value="Planning & Research">Planning & Research</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Achieved">Achieved</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#AAAAAA]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-bold text-[#555555] uppercase tracking-widest opacity-80">
              <BookOpen className="w-3.5 h-3.5 text-[#DA7756]" />
              Describe Your Dream
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paint the picture... What will it look, feel, and mean to you when you achieve this dream?"
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm text-[#111111] font-medium outline-none shadow-none focus:border-[#DA7756] resize-y min-h-[120px] transition-all placeholder:text-[#CCCCCC]"
            />
          </div>

          {/* Linked Sections */}
          <div className="space-y-5 pt-2">

            {/* Core Values — selectable pills */}
            <div className="border border-gray-200 bg-[#F6F4EE] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="flex items-center gap-2 text-[12px] font-bold text-[#333333] uppercase tracking-widest">
                  <Heart className="w-[15px] h-[15px] text-[#DA7756]" />
                  Linked Core Values
                </h4>
                <Link
                  to="/vision-values?tab=Values"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#DA7756] hover:underline uppercase tracking-wider"
                >
                  Manage   <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#888888] mb-4 font-bold uppercase tracking-wide">
                <span className="text-[#DA7756]">💡</span> Select values this dream reflects
              </p>

              {isLoadingDetails ? (
                <div className="flex items-center gap-2 text-[12px] text-[#DA7756] font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> FETCHING VALUES...
                </div>
              ) : coreValues.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {coreValues.map((cv) => {
                    const selected = selectedCoreValueIds.includes(cv.id);
                    return (
                      <button
                        key={cv.id}
                        type="button"
                        onClick={() => toggleCoreValue(cv.id)}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider border transition-all ${
                          selected
                            ? "bg-[#DA7756] border-[#DA7756] text-white shadow-sm"
                            : "bg-white border-gray-200 text-[#777777] hover:border-[#DA7756]/50"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {cv.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[12px] text-[#AAAAAA] italic font-medium">
                  No Core Values defined yet
                </div>
              )}
            </div>

            {/* Goals — selectable pills */}
            <div className="border border-gray-200 bg-[#F6F4EE] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="flex items-center gap-2 text-[12px] font-bold text-[#333333] uppercase tracking-widest">
                  <Target className="w-[15px] h-[15px] text-[#DA7756]" />
                  Linked Goals
                </h4>
                <Link
                  to="/goals-habits"
                  className="flex items-center gap-1 text-[11px] font-bold text-[#DA7756] hover:underline uppercase tracking-wider"
                >
                  Manage <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#888888] mb-4 font-bold uppercase tracking-wide">
                <span className="text-[#DA7756]">💡</span> Select goals this dream supports
              </p>

              {isLoadingDetails ? (
                <div className="flex items-center gap-2 text-[12px] text-[#DA7756] font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> FETCHING GOALS...
                </div>
              ) : goals.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {goals.map((g) => {
                    const selected = selectedGoalIds.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoal(g.id)}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg uppercase tracking-wider border transition-all ${
                          selected
                            ? "bg-[#DA7756] border-[#DA7756] text-white shadow-sm"
                            : "bg-white border-gray-200 text-[#777777] hover:border-[#DA7756]/50"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {g.title}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[12px] text-[#AAAAAA] italic font-medium">
                  No goals defined yet
                </div>
              )}
            </div>

            {/* Progress Notes */}
            <div className="border border-gray-200 bg-white rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-[12px] font-bold text-[#333333] uppercase tracking-widest mb-4">
                <BookOpen className="w-[15px] h-[15px] text-[#DA7756]" />
                Progress History
              </h4>

              <div className="mb-6">
                <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What steps have you taken today? (Ctrl+Enter to add)"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-[#DA7756] min-h-[100px] transition-all placeholder:text-[#CCCCCC]"
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="text-[11px] text-[#AAAAAA] font-bold uppercase tracking-widest">
                    {!initialData?.id || initialData.id.startsWith("s") ? "Drafting Note..." : ""}
                  </div>
                  <button
                    onClick={handleAddNote}
                    disabled={isAddingNote || !progressNotes.trim()}
                    className="bg-[#DA7756] hover:bg-[#C96B4D] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg px-5 py-2 text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm"
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
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching notes...
                </div>
              ) : notes.length > 0 || localDraftNotes.length > 0 ? (
                <div className="space-y-2">
                  {localDraftNotes.map((n) => {
                    const dateStr = new Intl.DateTimeFormat("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    }).format(new Date(n.created_at));
                    return (
                      <div
                        key={n.id}
                        className="flex flex-col gap-1.5 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 shadow-sm text-xs relative opacity-75"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-yellow-700">{dateStr} (Draft)</span>
                          <button
                            onClick={() =>
                              setLocalDraftNotes((prev) => prev.filter((note) => note.id !== n.id))
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
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        }).format(new Date(n.created_at as string | number | Date))
                      : "";
                    return (
                      <div
                        key={idx}
                        className="flex flex-col gap-1.5 bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-xs relative"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-bold text-[#DA7756]">{dateStr}</span>
                          <button
                            onClick={() => n.id && handleDeleteNoteById(n.id as string | number)}
                            disabled={isDeletingNoteId === n.id || !n.id}
                            className="p-1 text-[#DA7756] hover:bg-[#DA7756]/10 hover:text-[#C96B4D] rounded-md transition-all disabled:opacity-50"
                          >
                            {isDeletingNoteId === n.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="text-[#334155] w-full text-left text-sm leading-relaxed">
                          {String(n.content || n.message || n.note || "Unknown note")}
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
          className={`p-6 border-t border-gray-200 bg-[#F6F4EE] sticky bottom-0 z-10 flex-row ${
            initialData ? "justify-between" : "justify-end"
          } items-center space-x-3 rounded-b-2xl`}
        >
          {initialData && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-3 text-[12px] font-bold text-[#DA7756] bg-white border border-[#DA7756]/30 hover:bg-[#DA7756]/10 rounded-xl transition-all uppercase tracking-widest shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setOpen(false)}
              className="px-6 py-3 text-[12px] font-bold text-[#777777] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 text-[12px] font-bold text-white bg-[#DA7756] hover:bg-[#C96B4D] rounded-xl transition-all shadow-md uppercase tracking-widest"
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