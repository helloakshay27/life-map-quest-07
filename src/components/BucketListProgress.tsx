import React, { useState, useEffect } from "react";
import { Loader2, ChevronDown, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { getAuthHeaders } from "@/config/api";

const API_BASE = "https://life-api.lockated.com";

// --- HELPERS ---
const getProgressStyle = (progress) => {
  switch (progress) {
    case "Dreaming":    return "bg-[#D5D8D8]/40 text-[#888780]";
    case "Planning":    return "bg-[#1858A5]/[0.08] text-[#1858A5]";
    case "In Progress": return "bg-[#0B5D41]/[0.08] text-[#0B5D41]";
    case "Achieved":    return "bg-[#DA7756] text-white";
    default:            return "bg-[#FEF4EE] text-[#888780]";
  }
};

const getCategoryStyle = (category) => {
  return "bg-white text-[#2C2C2A] border border-[#D6B99D]";
};

const statusToProgress = (status) => {
  switch (status) {
    case "dreaming":    return "Dreaming";
    case "planning":    return "Planning";
    case "in_progress": return "In Progress";
    case "achieved":    return "Achieved";
    default:            return "Dreaming";
  }
};

const progressToStatus = (progress) =>
  ({
    Dreaming:     "dreaming",
    Planning:     "planning",
    "In Progress": "in_progress",
    Achieved:     "achieved",
  })[progress] || "dreaming";

const PROGRESS_OPTIONS = ["Dreaming", "Planning", "In Progress", "Achieved"];
const CATEGORY_OPTIONS = [
  "Personal", "Career", "Travel", "Adventure", "Learning",
  "Health", "Relationships", "Finance", "Other",
];

// --- CUSTOM PILL SELECT ---
const PillSelect = ({ value, options, onChange, colorFn }) => (
  <div className="relative inline-flex items-center">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none pl-2.5 pr-6 py-1 rounded-full text-[11px] font-semibold cursor-pointer outline-none ${colorFn(value)}`}
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-white text-[#2C2C2A]">{o}</option>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200 border border-[#D6B99D]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base text-[#2C2C2A]">Add New Dream</h3>
          <button
            onClick={onClose}
            className="text-[#888780] hover:text-[#2C2C2A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-[#2C2C2A] mb-1 block">Title *</label>
            <input
              type="text"
              placeholder="e.g. Visit Northern Lights"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-[#D6B99D] px-3 py-2 text-sm text-[#2C2C2A] outline-none focus:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 transition-all placeholder:text-[#888780]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-[#2C2C2A] mb-1 block">Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Travel to Iceland"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-[#D6B99D] px-3 py-2 text-sm text-[#2C2C2A] outline-none resize-none focus:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 transition-all placeholder:text-[#888780]"
            />
          </div>

          {/* Category + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2C2C2A] mb-1 block">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="appearance-none w-full rounded-lg border border-[#D6B99D] px-3 py-2 pr-7 text-sm text-[#2C2C2A] outline-none focus:border-[#DA7756] cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888780]" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2C2C2A] mb-1 block">Status</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="appearance-none w-full rounded-lg border border-[#D6B99D] px-3 py-2 pr-7 text-sm text-[#2C2C2A] outline-none focus:border-[#DA7756] cursor-pointer"
                >
                  <option value="dreaming">Dreaming</option>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="achieved">Achieved</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888780]" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#D6B99D] text-sm text-[#2C2C2A] hover:bg-[#FEF4EE] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DA7756] hover:bg-[#C26547] text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {isSubmitting ? "Adding..." : "Add Dream"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const BucketListProgress = () => {
  const [bucketList, setBucketList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTexts, setUpdateTexts] = useState({});
  const [progressFilter, setProgressFilter] = useState("All Progress");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showAddModal, setShowAddModal] = useState(false);

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
            }),
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
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
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

  const handleDreamAdded = (newItem) => {
    setBucketList((prev) => [newItem, ...prev]);
  };

  const filtered = bucketList.filter((item) => {
    const matchProgress  = progressFilter  === "All Progress"   || item.progress === progressFilter;
    const matchCategory  = categoryFilter  === "All Categories" || item.category === categoryFilter;
    return matchProgress && matchCategory;
  });

  return (
    <>
      {showAddModal && (
        <AddDreamModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleDreamAdded}
        />
      )}

      <div className="bg-[#FEF4EE] rounded-2xl p-5 border border-[#D6B99D] font-sans w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#DA7756] flex items-center justify-center flex-shrink-0 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
                <path d="M19 2L19.8 5.2L23 6L19.8 6.8L19 10L18.2 6.8L15 6L18.2 5.2L19 2Z" fill="white" strokeLinejoin="round" />
                <path d="M5 16L5.5 18L7.5 18.5L5.5 19L5 21L4.5 19L2.5 18.5L4.5 18L5 16Z" fill="white" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-[15px] font-bold text-[#2C2C2A] flex items-center gap-2">
              Bucket List Progress
              <span className="relative group">
                <span className="w-[17px] h-[17px] rounded-full border border-[#DA7756] inline-flex items-center justify-center text-[#DA7756] text-[10px] font-bold cursor-pointer">
                  i
                </span>
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-[#2C2C2A] text-white text-xs font-medium rounded-lg px-3 py-2 w-48 text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                  Track progress on your dreams and long-term aspirations
                  <span className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-4 border-transparent border-r-[#2C2C2A]" />
                </span>
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 h-8 px-3 rounded-lg bg-[#DA7756] hover:bg-[#C26547] text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Dream
            </button>

            <div className="relative">
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-7 rounded-lg border border-[#D6B99D] bg-white text-xs text-[#2C2C2A] outline-none cursor-pointer"
              >
                <option>All Progress</option>
                {PROGRESS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888780]" />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none h-8 pl-3 pr-7 rounded-lg border border-[#D6B99D] bg-white text-xs text-[#2C2C2A] outline-none cursor-pointer"
              >
                <option>All Categories</option>
                {CATEGORY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888780]" />
            </div>
          </div>
        </div>

        {/* ── List ── */}
        {isLoading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#DA7756]" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-0.5">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[#D6B99D] shadow-sm px-4 pt-3 pb-3 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-3">
                    {item.progress === "Achieved" ? (
                      <div className="w-5 h-5 rounded-md bg-[#DA7756] flex items-center justify-center text-white flex-shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                    ) : (
                      <span className="text-[#DA7756] text-base leading-none">✦</span>
                    )}
                    <span
                      className={`font-semibold text-sm transition-all duration-300 ${
                        item.progress === "Achieved"
                          ? "line-through text-[#888780]"
                          : "text-[#2C2C2A]"
                      }`}
                    >
                      {item.title || "Untitled Dream"}
                    </span>
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={2}
                    placeholder="Add update..."
                    value={updateTexts[item.id] || ""}
                    onChange={(e) =>
                      setUpdateTexts((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[#D6B99D] bg-[#FEF4EE] px-3 py-2 text-xs text-[#2C2C2A] placeholder:text-[#888780] resize-none outline-none focus:border-[#DA7756] focus:ring-1 focus:ring-[#DA7756]/30 transition-all"
                  />

                  {/* Footer Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleAddUpdate(item.id)}
                      className="flex items-center gap-1 h-7 px-3 rounded-full bg-white border border-[#D6B99D] hover:border-[#DA7756] text-[#2C2C2A] text-[11px] font-semibold transition-colors"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="inline-block">
                        <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" opacity="0.2" />
                        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 mt-2">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D6B99D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.275 1.275L3 12l5.8 1.9a2 2 0 0 1 1.275 1.275L12 21l1.9-5.8a2 2 0 0 1 1.275-1.275L21 12l-5.8-1.9a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                <p className="text-[15px] font-medium text-[#888780] mb-4">
                  No bucket list items matching filters
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-white border border-[#D6B99D] text-[#2C2C2A] font-semibold text-[14px] px-5 py-2 rounded-lg shadow-sm hover:bg-[#FEF4EE] transition-colors"
                >
                  Create Your First Dream
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