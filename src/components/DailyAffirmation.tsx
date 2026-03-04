import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, Save, CheckCircle, AlertCircle, 
  Trash2, Plus, Edit2, X 
} from "lucide-react";

const API_BASE_URL = "https://life-api.lockated.com";

interface Affirmation {
  id: number;
  statement: string;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const DailyAffirmation = () => {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [currentAffirmation, setCurrentAffirmation] = useState("");
  const [currentPriority, setCurrentPriority] = useState<number>(5);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── GET: fetch all affirmations ───────────────────────────────────────
  const fetchAffirmations = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${API_BASE_URL}/affirmations`, {
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
      const items = Array.isArray(data) ? data : data.affirmations ?? [];
      setAffirmations(items);
    } catch (err: unknown) {
      console.error("Affirmations fetch error:", err);
      showToast("Failed to load affirmations", "error");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchAffirmations();
  }, []);

  // ── POST: create new affirmation ────────────────────────────────────────
  const handleCreate = async () => {
    if (!currentAffirmation.trim()) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token");

      const payload = {
        affirmation: {
          statement: currentAffirmation.trim(),
          priority: currentPriority,
        },
      };

      const res = await fetch(`${API_BASE_URL}/affirmations`, {
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
      const newAffirmation = data.affirmation ?? data;
      
      setAffirmations(prev => [newAffirmation, ...prev]);
      resetForm();
      showToast("Affirmation created!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create affirmation.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── PUT: update affirmation ────────────────────────────────────────
  const handleUpdate = async (id: number) => {
    if (!currentAffirmation.trim()) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token");

      const payload = {
        affirmation: {
          statement: currentAffirmation.trim(),
          priority: currentPriority,
        },
      };

      const res = await fetch(`${API_BASE_URL}/affirmations/${id}`, {
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
      const updatedAffirmation = data.affirmation ?? data;
      
      setAffirmations(prev => 
        prev.map(a => a.id === id ? updatedAffirmation : a)
      );
      
      resetForm();
      showToast("Affirmation updated!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update affirmation.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── DELETE: delete affirmation ────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this affirmation?")) return;

    try {
      setIsDeleting(id);
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${API_BASE_URL}/affirmations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message ?? `Failed to delete (${res.status})`);
      }

      setAffirmations(prev => prev.filter(a => a.id !== id));
      
      if (editingId === id) {
        resetForm();
      }
      
      showToast("Affirmation deleted!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete affirmation.", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  // ── Edit affirmation ────────────────────────────────────────
  const handleEdit = (affirmation: Affirmation) => {
    setCurrentAffirmation(affirmation.statement);
    setCurrentPriority(affirmation.priority);
    setEditingId(affirmation.id);
    setShowForm(true);
  };

  // ── Reset form ────────────────────────────────────────
  const resetForm = () => {
    setCurrentAffirmation("");
    setCurrentPriority(5);
    setEditingId(null);
    setShowForm(false);
  };

  // ── Handle form submit ────────────────────────────────────────
  const handleSubmit = () => {
    if (editingId) {
      handleUpdate(editingId);
    } else {
      handleCreate();
    }
  };

  // ── Auto-save (optional, for form) ─────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAffirmation(e.target.value);
    // Auto-save only for existing affirmations (optional)
    if (editingId) {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        if (e.target.value.trim()) handleUpdate(editingId);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Daily Affirmations</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Affirmation
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="journal-section-pink rounded-xl p-6 shadow-sm border border-pink-100/50 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {editingId ? "Edit Affirmation" : "New Affirmation"}
            </h3>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Priority selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Priority:</label>
              <select
                value={currentPriority}
                onChange={(e) => setCurrentPriority(Number(e.target.value))}
                className="text-sm border border-pink-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                disabled={isSaving}
              >
                {[1, 2, 3, 4, 5].map((p) => (
                  <option key={p} value={p}>Priority {p} {p === 1 ? '(Highest)' : p === 5 ? '(Lowest)' : ''}</option>
                ))}
              </select>
            </div>

            {/* Textarea */}
            <Textarea
              placeholder="A positive statement about yourself..."
              value={currentAffirmation}
              onChange={handleChange}
              disabled={isSaving}
              className="min-h-[100px] resize-none bg-pink-50/30 border-pink-200 focus:bg-white focus:ring-pink-400 focus:border-pink-400 text-gray-800"
            />

            <p className="text-xs font-medium text-pink-500">
              Present tense ("I am"), positive, specific, repeat daily with emotion.
            </p>

            {/* Form actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving || !currentAffirmation.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Affirmations List */}
      <div className="space-y-4">
        {isFetching ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
          </div>
        ) : affirmations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No affirmations yet. Create your first one!</p>
          </div>
        ) : (
          affirmations.map((aff) => (
            <div
              key={aff.id}
              className="group relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Priority badge */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  aff.priority === 1 ? 'bg-red-100 text-red-700' :
                  aff.priority === 2 ? 'bg-orange-100 text-orange-700' :
                  aff.priority === 3 ? 'bg-yellow-100 text-yellow-700' :
                  aff.priority === 4 ? 'bg-green-100 text-green-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  P{aff.priority}
                </span>
                
                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(aff)}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(aff.id)}
                    disabled={isDeleting === aff.id}
                    className="p-1.5 hover:bg-red-100 rounded-full"
                    title="Delete"
                  >
                    {isDeleting === aff.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Affirmation content */}
              <div className="pr-32">
                <p className="text-lg text-gray-800 italic">"{aff.statement}"</p>
                {aff.created_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(aff.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
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

export default DailyAffirmation;