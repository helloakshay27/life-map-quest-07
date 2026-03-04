import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Save, Trash2, Edit2, Plus, X, 
  CheckCircle, AlertCircle, Calendar, ChevronDown, ChevronUp 
} from "lucide-react";

const API_BASE_URL = "https://api.lifecompass.lockated.com";

interface Letter {
  id: number;
  subject: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const LettersSection = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [letterSubject, setLetterSubject] = useState("");
  const [letterBody, setLetterBody] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedLetters, setExpandedLetters] = useState<Set<number>>(new Set());

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── GET: fetch all letters ─────────────────────────────────────────────
  const fetchLetters = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${API_BASE_URL}/user_letters`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status !== 404) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message ?? `Failed to fetch (${res.status})`);
        }
        return;
      }

      const data = await res.json();
      // Handle both array response and paginated response
      const items = Array.isArray(data) ? data : data.letters ?? [];
      setLetters(items);
    } catch (err: unknown) {
      console.error("Letters fetch error:", err);
      showToast("Failed to load letters", "error");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  // ── POST: create new letter ────────────────────────────────────────────
  const handleCreateLetter = async () => {
    if (!letterBody.trim()) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token");

      const payload = {
        letter: {
          subject: letterSubject.trim() || "Untitled Letter",
          content: letterBody.trim(),
        },
      };

      const res = await fetch(`${API_BASE_URL}/user_letters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message ?? `Failed to create (${res.status})`);
      }

      const data = await res.json();
      const newLetter = data.letter ?? data;
      
      setLetters(prev => [newLetter, ...prev]);
      resetForm();
      showToast("Letter saved successfully!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save letter.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── GET single letter for editing ──────────────────────────────────────
  const fetchSingleLetter = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${API_BASE_URL}/user_letters/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message ?? `Failed to fetch (${res.status})`);
      }

      const data = await res.json();
      const letter = data.letter ?? data;
      
      setLetterSubject(letter.subject || "");
      setLetterBody(letter.content || "");
      setEditingId(letter.id);
      setShowForm(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to load letter.", "error");
    }
  };

  // ── PUT: update letter ─────────────────────────────────────────────────
  const handleUpdateLetter = async (id: number) => {
    if (!letterBody.trim()) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token");

      const payload = {
        letter: {
          subject: letterSubject.trim() || "Untitled Letter",
          content: letterBody.trim(),
        },
      };

      const res = await fetch(`${API_BASE_URL}/user_letters/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message ?? `Failed to update (${res.status})`);
      }

      const data = await res.json();
      const updatedLetter = data.letter ?? data;
      
      setLetters(prev => 
        prev.map(l => l.id === id ? updatedLetter : l)
      );
      
      resetForm();
      showToast("Letter updated successfully!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update letter.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── DELETE: delete letter ──────────────────────────────────────────────
  const handleDeleteLetter = async (id: number) => {
    if (!confirm("Are you sure you want to delete this letter? This action cannot be undone.")) return;

    try {
      setIsDeleting(id);
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${API_BASE_URL}/user_letters/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message ?? `Failed to delete (${res.status})`);
      }

      setLetters(prev => prev.filter(l => l.id !== id));
      
      if (editingId === id) {
        resetForm();
      }
      
      showToast("Letter deleted successfully!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete letter.", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  // ── Edit letter ────────────────────────────────────────────────────────
  const handleEditClick = (letter: Letter) => {
    fetchSingleLetter(letter.id);
  };

  // ── Toggle letter expansion ────────────────────────────────────────────
  const toggleExpand = (id: number) => {
    setExpandedLetters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // ── Reset form ─────────────────────────────────────────────────────────
  const resetForm = () => {
    setLetterSubject("");
    setLetterBody("");
    setEditingId(null);
    setShowForm(false);
  };

  // ── Handle form submit ─────────────────────────────────────────────────
  const handleSubmit = () => {
    if (editingId) {
      handleUpdateLetter(editingId);
    } else {
      handleCreateLetter();
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Letters to Yourself
            </h3>
            <p className="text-sm text-gray-500">
              Write, reflect, and cherish your thoughts
            </p>
          </div>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4" />
            New Letter
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-bold text-gray-900">
              {editingId ? "Edit Letter" : "Write a New Letter"}
            </h4>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
                Subject (Optional)
              </label>
              <Input
                placeholder="e.g., Dear Future Me, A Letter of Gratitude..."
                value={letterSubject}
                onChange={(e) => setLetterSubject(e.target.value)}
                className="bg-gray-50 focus:bg-white border-gray-200"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
                Your Letter
              </label>
              <Textarea
                placeholder="Dear Self,

Write your thoughts, feelings, dreams, and reflections here...

What do you want to remember? What are you grateful for?"
                value={letterBody}
                onChange={(e) => setLetterBody(e.target.value)}
                className="min-h-[200px] resize-y bg-gray-50 focus:bg-white border-gray-200"
                disabled={isSaving}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={resetForm}
                className="gap-2"
              >
                Cancel
              </Button>
              <Button
                className="gap-2 bg-black hover:bg-gray-800 text-white"
                onClick={handleSubmit}
                disabled={isSaving || !letterBody.trim()}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : editingId ? "Update Letter" : "Save Letter"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Letters List */}
      <div className="space-y-4">
        {isFetching ? (
          <div className="flex justify-center py-12 bg-white rounded-2xl border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : letters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <span className="text-4xl mb-3 block">📝</span>
            <p className="text-gray-500">No letters yet. Write your first letter!</p>
          </div>
        ) : (
          letters.map((letter) => (
            <div
              key={letter.id}
              className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">
                      {letter.subject || "Untitled Letter"}
                    </h4>
                    {letter.created_at && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(letter.created_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleExpand(letter.id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title={expandedLetters.has(letter.id) ? "Collapse" : "Expand"}
                  >
                    {expandedLetters.has(letter.id) ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEditClick(letter)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteLetter(letter.id)}
                    disabled={isDeleting === letter.id}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors"
                    title="Delete"
                  >
                    {isDeleting === letter.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Content - truncated or expanded */}
              <div className={`text-gray-700 whitespace-pre-wrap ${
                expandedLetters.has(letter.id) ? '' : 'line-clamp-3'
              }`}>
                {letter.content}
              </div>

              {/* Show more/less button for long content */}
              {letter.content.length > 200 && !expandedLetters.has(letter.id) && (
                <button
                  onClick={() => toggleExpand(letter.id)}
                  className="mt-2 text-sm text-pink-500 hover:text-pink-600 font-medium"
                >
                  Read more...
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl min-w-[260px] max-w-sm text-white ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === "success"
              ? <CheckCircle className="w-4 h-4" />
              : <AlertCircle className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">{toast.type === "success" ? "Success" : "Error"}</p>
            <p className="text-sm opacity-90">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default LettersSection;