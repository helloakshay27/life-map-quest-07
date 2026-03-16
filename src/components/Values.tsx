import React, { useState, useEffect, useRef } from "react";
import { Heart, Plus, X, Trash2, Check, ChevronDown } from "lucide-react";

const API_BASE_URL = "https://life-api.lockated.com";

function Values() {
  const [values, setValues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [toast, setToast] = useState(null);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const colorDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    meaning: "",
    priority: 5,
    color: "teal",
  });

  // ✅ UPDATED: Added pink and yellow to match your screenshot
  const colorMap = {
    teal:   { hex: "#14b8a6", bg: "bg-teal-500",   pillBg: "bg-teal-50",   text: "text-teal-600"   },
    orange: { hex: "#f97316", bg: "bg-orange-500", pillBg: "bg-orange-50", text: "text-orange-600" },
    purple: { hex: "#a855f7", bg: "bg-purple-500", pillBg: "bg-purple-50", text: "text-purple-600" },
    blue:   { hex: "#3b82f6", bg: "bg-blue-500",   pillBg: "bg-blue-50",   text: "text-blue-600"   },
    green:  { hex: "#22c55e", bg: "bg-green-500",  pillBg: "bg-green-50",  text: "text-green-600"  },
    pink:   { hex: "#ec4899", bg: "bg-pink-500",   pillBg: "bg-pink-50",   text: "text-pink-600"   },
    yellow: { hex: "#eab308", bg: "bg-yellow-500", pillBg: "bg-yellow-50", text: "text-yellow-600" },
    red:    { hex: "#ef4444", bg: "bg-red-500",    pillBg: "bg-red-50",    text: "text-red-600"    },
  };

  const getPriorityColor = (priority) => {
    if (priority <= 3) return "text-green-500";
    if (priority <= 6) return "text-yellow-500";
    if (priority <= 8) return "text-orange-500";
    return "text-red-500";
  };

  const getPriorityAccent = (priority) => {
    if (priority <= 3) return "#22c55e";
    if (priority <= 6) return "#eab308";
    if (priority <= 8) return "#f97316";
    return "#ef4444";
  };

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(e.target)) {
        setColorDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    fetchCoreValues();
  }, []);

  const fetchCoreValues = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/core_values`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const mappedData = Array.isArray(data)
          ? data.map((item) => ({
              ...item,
              meaning: item.description || item.meaning || "",
            }))
          : [];
        setValues(mappedData);
      }
    } catch (error) {
      console.error("Error fetching list:", error);
      showToast("Could not load values. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ id: null, name: "", meaning: "", priority: 5, color: "teal" });
    setModalMode("add");
    setIsModalOpen(true);
    setColorDropdownOpen(false);
  };

  const openEditModal = async (valueItem) => {
    setFormData({ ...valueItem });
    setModalMode("edit");
    setIsModalOpen(true);
    setIsFetchingDetails(true);
    setColorDropdownOpen(false);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/core_values/${valueItem.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch specific details");
      const data = await response.json();
      setFormData({
        id: data.id,
        name: data.name || "",
        meaning: data.description || data.meaning || "",
        priority: data.priority || 5,
        color: data.color || "teal",
      });
    } catch (error) {
      console.error("Error fetching specific value details:", error);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setColorDropdownOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (colorName) => {
    setFormData((prev) => ({ ...prev, color: colorName }));
    setColorDropdownOpen(false);
  };

  const handleSaveValue = async () => {
    if (!formData.name.trim()) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const payload = {
        core_value: {
          name: formData.name,
          description: formData.meaning,
          priority: Number(formData.priority),
          color: formData.color,
        },
      };

      if (modalMode === "add") {
        const response = await fetch(`${API_BASE_URL}/core_values`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (errorData?.errors?.length > 0) throw new Error(errorData.errors[0]);
          throw new Error("Failed to save.");
        }
        const newSavedValue = await response.json();
        newSavedValue.meaning = newSavedValue.description || newSavedValue.meaning || "";
        setValues([...values, newSavedValue]);
        showToast("Core value added successfully!", "success");
      } else {
        const response = await fetch(`${API_BASE_URL}/core_values/${formData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (errorData?.errors?.length > 0) throw new Error(errorData.errors[0]);
          throw new Error("Failed to update.");
        }
        const updatedValue = await response.json();
        updatedValue.meaning = updatedValue.description || updatedValue.meaning || "";
        setValues(values.map((v) => (v.id === formData.id ? updatedValue : v)));
        showToast("Core value updated successfully!", "success");
      }
      closeModal();
    } catch (error) {
      console.error("API Error:", error);
      showToast(error.message || "Something went wrong while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteValue = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/core_values/${formData.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        setValues(values.filter((v) => v.id !== formData.id));
        closeModal();
        showToast("Core value deleted.", "success");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete value.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading your Core Values...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9fc] p-4 md:p-8 font-sans animate-fade-in relative">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
              <Heart className="text-orange-500" size={24} strokeWidth={2.5} />
              Core Values
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Maximum 10 values that guide your decisions
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus size={18} />
            Add Value
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-md shadow-sm">
          <p className="text-sm text-orange-900 leading-relaxed">
            <span className="mr-1">💡</span>
            <span className="font-bold">What are Core Values?</span> Your non-negotiable principles that guide every decision. Examples: Integrity, Family, Health, Growth, Freedom, Compassion. Rank them by priority (1 = most important). Your daily actions should reflect these values.
          </p>
        </div>

        {/* Values Grid */}
        {values.length === 0 ? (
          <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-white text-gray-400 font-medium">
            No core values added yet. Click "Add Value" to create your first one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values
              .sort((a, b) => a.priority - b.priority)
              .map((val) => {
                const colors = colorMap[val.color] || colorMap.blue;
                return (
                  <div
                    key={val.id}
                    onClick={() => openEditModal(val)}
                    className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-lg">
                          {val.priority}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{val.name}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold tracking-wide ${colors.pillBg} ${colors.text}`}>
                        {val.color}
                      </span>
                    </div>
                    {val.meaning && (
                      <p className="text-gray-600 text-sm mt-1 ml-11">{val.meaning}</p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50  flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-visible flex flex-col relative">

            {isFetchingDetails && (
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-100 overflow-hidden rounded-t-xl">
                <div className="h-full bg-orange-500 animate-pulse w-full"></div>
              </div>
            )}

            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Add Core Value" : "Edit Value"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-visible">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Value Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isFetchingDetails}
                  placeholder="e.g., Integrity, Growth, Family..."
                  className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              {/* Meaning */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  What does this value mean to you?
                </label>
                <textarea
                  name="meaning"
                  value={formData.meaning}
                  onChange={handleInputChange}
                  disabled={isFetchingDetails}
                  placeholder="e.g., Integrity means always being honest, even when it's difficult..."
                  className="w-full h-24 border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-y min-h-[96px] disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-400 mt-1">Optional: Add a personal definition to make this value more meaningful</p>
              </div>

              {/* Priority Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Priority (1-10)</label>
                  <span className={`font-bold text-lg ${getPriorityColor(Number(formData.priority))}`}>
                    {formData.priority}
                  </span>
                </div>
                <input
                  type="range"
                  name="priority"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={handleInputChange}
                  disabled={isFetchingDetails}
                  style={{ accentColor: getPriorityAccent(Number(formData.priority)) }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* ✅ CUSTOM COLOR PICKER DROPDOWN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Color Tag
                </label>
                <div className="relative" ref={colorDropdownRef}>

                  {/* Trigger Button */}
                  <button
                    type="button"
                    disabled={isFetchingDetails}
                    onClick={() => setColorDropdownOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between border border-gray-300 rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: colorMap[formData.color]?.hex || "#999" }}
                      />
                      <span className="text-gray-700 capitalize">{formData.color}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${colorDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown List - MADE SCROLLABLE HERE */}
                  {colorDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[9999] overflow-y-auto max-h-52">
                      {Object.entries(colorMap).map(([colorName, colorValues]) => (
                        <button
                          key={colorName}
                          type="button"
                          onClick={() => handleColorSelect(colorName)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-5 h-5 rounded-md flex-shrink-0"
                              style={{ backgroundColor: colorValues.hex }}
                            />
                            <span className="text-gray-700 text-sm capitalize">{colorName}</span>
                          </div>
                          {formData.color === colorName && (
                            <Check size={16} className="text-gray-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-xl">
              <div>
                {modalMode === "edit" && (
                  <button
                    onClick={handleDeleteValue}
                    className="flex items-center gap-1.5 text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-3 py-2 rounded-md transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeModal}
                  disabled={isSaving}
                  className="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveValue}
                  disabled={isSaving || isFetchingDetails}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md font-medium text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? "Saving..." : modalMode === "add" ? "Create" : "Update"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white px-4 py-3 rounded shadow-lg flex flex-col min-w-[250px] animate-fade-in z-50`}
        >
          <span className="font-bold text-sm">{toast.type === "error" ? "Error" : "Success"}</span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Values;