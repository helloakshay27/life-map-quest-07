import React, { useState, useEffect } from "react";
import { Loader2, ChevronDown, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { getAuthHeaders } from "@/config/api";

const API_BASE = "https://life-api.lockated.com";

// --- HELPERS ---
const getProgressStyle = (progress) => {
  switch (progress) {
    case "Dreaming":    return "bg-purple-100 text-purple-700";
    case "Planning":    return "bg-orange-100 text-orange-600";
    case "In Progress": return "bg-green-100 text-green-700";
    case "Achieved":    return "bg-teal-100 text-teal-700";
    default:            return "bg-gray-100 text-gray-700";
  }
};

const getCategoryStyle = (category) => {
  switch (category) {
    case "Personal":      return "bg-pink-100 text-pink-700";
    case "Career":        return "bg-indigo-100 text-indigo-700";
    case "Travel":        return "bg-blue-100 text-blue-700";
    case "Adventure":     return "bg-orange-100 text-orange-700";
    case "Learning":      return "bg-teal-100 text-teal-600";
    case "Health":        return "bg-red-100 text-red-700";
    case "Relationships": return "bg-rose-100 text-rose-700";
    case "Finance":       return "bg-emerald-100 text-emerald-700";
    default:              return "bg-gray-100 text-gray-700";
  }
};

const statusToProgress = (status) => {
  switch (status) {
    case "dreaming":     return "Dreaming";
    case "planning":     return "Planning";
    case "in_progress":  return "In Progress";
    case "achieved":     return "Achieved";
    default:             return "Dreaming";
  }
};

const progressToStatus = (progress) => ({
  "Dreaming": "dreaming",
  "Planning": "planning",
  "In Progress": "in_progress",
  "Achieved": "achieved",
})[progress] || "dreaming";

const PROGRESS_OPTIONS = ["Dreaming", "Planning", "In Progress", "Achieved"];
const CATEGORY_OPTIONS = ["Personal", "Career", "Travel", "Adventure", "Learning", "Health", "Relationships", "Finance", "Other"];

// --- CUSTOM PILL SELECT ---
const PillSelect = ({ value, options, onChange, colorFn }) => (
  <div className="relative inline-flex items-center">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none pl-2.5 pr-6 py-1 rounded-full text-[11px] font-semibold cursor-pointer outline-none ${colorFn(value)}`}
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-white text-gray-900">{o}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-1.5 w-3 h-3 opacity-60" />
  </div>
);

// --- ADD DREAM MODAL ---
const AddDreamModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Personal",
    status: "dreaming",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/dreams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          status: form.status,
          core_value_ids: [],
          goal_ids: [],
        }),
      });

      if (!res.ok) throw new Error("Failed to add dream");
      const data = await res.json();

      // Normalise response → UI shape
      const newItem = {
        id: (data.id || data.dream?.id || Date.now()).toString(),
        title: data.title || data.dream?.title || form.title,
        category: data.category || data.dream?.category || form.category,
        progress: statusToProgress(data.status || data.dream?.status || form.status),
      };

      toast.success("Dream added!");
      onAdd(newItem);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add dream");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base text-gray-900">Add New Dream</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Title *</label>
            <input
              type="text"
              placeholder="e.g. Visit Northern Lights"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Travel to Iceland"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none resize-none focus:border-amber-400 focus:ring-1 focus:ring-amber-100 transition-all"
            />
          </div>

          {/* Category + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="appearance-none w-full rounded-lg border border-gray-200 px-3 py-2 pr-7 text-sm text-gray-800 outline-none focus:border-amber-400 cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Status</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="appearance-none w-full rounded-lg border border-gray-200 px-3 py-2 pr-7 text-sm text-gray-800 outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="dreaming">Dreaming</option>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="achieved">Achieved</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isSubmitting ? "Adding..." : "Add Dream"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const BucketListProgress = () => {
  const [bucketList, setBucketList]         = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [updateTexts, setUpdateTexts]       = useState({});
  const [progressFilter, setProgressFilter] = useState("All Progress");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showAddModal, setShowAddModal]     = useState(false);

  // ── GET: fetch on mount ──────────────────────────────────
  useEffect(() => { fetchDreams(); }, []);

  const fetchDreams = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE}/dreams`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch dreams");
      const data = await response.json();

      // Support both flat array and categorised { dreaming: [], planning: [], ... }
      let mapped = [];
      if (Array.isArray(data)) {
        mapped = data.map((item) => ({
          id: item.id.toString(),
          title: item.title || "",
          category: item.category || "Personal",
          progress: statusToProgress(item.status || "dreaming"),
        }));
      } else {
        const mapCategory = (arr, progressLabel) => {
          if (!Array.isArray(arr)) return;
          arr.forEach((item) =>
            mapped.push({
              id: item.id.toString(),
              title: item.title || "",
              category: item.category || "Personal",
              progress: progressLabel,
            })
          );
        };
        mapCategory(data.dreaming,    "Dreaming");
        mapCategory(data.planning,    "Planning");
        mapCategory(data.in_progress, "In Progress");
        mapCategory(data.achieved,    "Achieved");
      }

      setBucketList(mapped);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bucket list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalUpdate = (id, field, value) =>
    setBucketList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

  const handleProgressChange = async (id, newProgress) => {
    handleLocalUpdate(id, "progress", newProgress);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/dreams/${id}/change_status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: progressToStatus(newProgress) }),
      });
    } catch { toast.error("Failed to update status"); }
  };

  const handleCategoryChange = async (id, newCategory) => {
    handleLocalUpdate(id, "category", newCategory);
    const item = bucketList.find((i) => i.id === id);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/dreams/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: item.title, category: newCategory }),
      });
    } catch { toast.error("Failed to update category"); }
  };

  const handleAddUpdate = async (id) => {
    const text = updateTexts[id] || "";
    if (!text.trim()) return;
    toast.success("Update added!");
    setUpdateTexts((prev) => ({ ...prev, [id]: "" }));
  };

  // ── Called by modal on success ───────────────────────────
  const handleDreamAdded = (newItem) => {
    setBucketList((prev) => [newItem, ...prev]);
  };

  const filtered = bucketList.filter((item) => {
    const matchProgress = progressFilter === "All Progress" || item.progress === progressFilter;
    const matchCategory = categoryFilter === "All Categories" || item.category === categoryFilter;
    return matchProgress && matchCategory;
  });

  const activeCount = bucketList.filter(
    (i) => i.progress !== "Achieved",
  ).length;
  const doneCount = bucketList.filter((i) => i.progress === "Achieved").length;

  return (
    <>
      {/* Add Dream Modal */}
      {showAddModal && (
        <AddDreamModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleDreamAdded}
        />
      )}

      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 font-sans w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
                <path d="M19 2L19.8 5.2L23 6L19.8 6.8L19 10L18.2 6.8L15 6L18.2 5.2L19 2Z" fill="white" strokeLinejoin="round"/>
                <path d="M5 16L5.5 18L7.5 18.5L5.5 19L5 21L4.5 19L2.5 18.5L4.5 18L5 16Z" fill="white" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] text-gray-900">Bucket List Progress</span>
            <span className="w-[17px] h-[17px] rounded-full border border-gray-400 inline-flex items-center justify-center text-gray-400 text-[10px] font-bold cursor-pointer">i</span>
          </div>

          <div className="flex items-center gap-2">
            {/* ── Add Dream Button ── */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Dream
            </button>

            {/* Progress Filter */}
            <div className="relative">
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-7 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 outline-none focus:ring-1 focus:ring-amber-300 cursor-pointer"
              >
                <option>All Progress</option>
                {PROGRESS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-7 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 outline-none focus:ring-1 focus:ring-amber-300 cursor-pointer"
              >
                <option>All Categories</option>
                {CATEGORY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* ── List ── */}
        {isLoading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-0.5">
            {filtered.length > 0 ? filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 pt-3 pb-3 flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  {item.progress === "Achieved" ? (
                    <div className="w-5 h-5 rounded-md bg-pink-500 flex items-center justify-center text-white flex-shrink-0">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                  ) : (
                    <span className="text-amber-400 text-base leading-none">✦</span>
                  )}
                  <span className={`font-semibold text-sm transition-all duration-300 ${item.progress === "Achieved" ? "line-through text-gray-400 decoration-gray-400" : "text-gray-900"}`}>
                    {item.title || "Untitled Dream"}
                  </span>
                </div>

                {/* Textarea */}
                <textarea
                  rows={2}
                  placeholder="Add update..."
                  value={updateTexts[item.id] || ""}
                  onChange={(e) => setUpdateTexts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 resize-none outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-100 transition-all"
                />

                {/* Footer Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleAddUpdate(item.id)}
                    className="flex items-center gap-1 h-7 px-3 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 text-[11px] font-semibold transition-colors"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="inline-block">
                      <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.2"/>
                      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add
                  </button>
                  <PillSelect
                    value={item.progress}
                    options={PROGRESS_OPTIONS}
                    onChange={(val) => handleProgressChange(item.id, val)}
                    colorFn={getProgressStyle}
                  />
                  <PillSelect
                    value={item.category}
                    options={CATEGORY_OPTIONS}
                    onChange={(val) => handleCategoryChange(item.id, val)}
                    colorFn={getCategoryStyle}
                  />
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                <p className="text-sm text-gray-400">No items match your filters.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 flex items-center gap-1 mx-auto px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Your First Dream
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BucketListProgress;