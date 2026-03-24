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

  // Mapped existing keys to Semantic/Tertiary palette colors to avoid breaking backend data
  const colorMap = {
    teal:   { hex: "#0B5D41", bg: "bg-[#0B5D41]", pillBg: "bg-[#0B5D41]/10", text: "text-[#0B5D41]" }, // Forest
    orange: { hex: "#DA7756", bg: "bg-[#DA7756]", pillBg: "bg-[#DA7756]/10", text: "text-[#DA7756]" }, // Coral
    purple: { hex: "#534AB7", bg: "bg-[#534AB7]", pillBg: "bg-[#534AB7]/10", text: "text-[#534AB7]" }, // Violet
    blue:   { hex: "#1858A5", bg: "bg-[#1858A5]", pillBg: "bg-[#1858A5]/10", text: "text-[#1858A5]" }, // Sky
    green:  { hex: "#3B6D11", bg: "bg-[#3B6D11]", pillBg: "bg-[#3B6D11]/10", text: "text-[#3B6D11]" }, // Leaf
    pink:   { hex: "#A32D2D", bg: "bg-[#A32D2D]", pillBg: "bg-[#A32D2D]/10", text: "text-[#A32D2D]" }, // Crimson
    yellow: { hex: "#BA7517", bg: "bg-[#BA7517]", pillBg: "bg-[#BA7517]/10", text: "text-[#BA7517]" }, // Amber
    red:    { hex: "#A32D2D", bg: "bg-[#A32D2D]", pillBg: "bg-[#A32D2D]/10", text: "text-[#A32D2D]" }, // Crimson
  };

  const getPriorityColor = (priority) => {
    if (priority <= 3) return "text-[#0B5D41]"; // Forest
    if (priority <= 6) return "text-[#BA7517]"; // Amber
    if (priority <= 8) return "text-[#DA7756]"; // Coral
    return "text-[#A32D2D]"; // Crimson
  };

  const getPriorityAccent = (priority) => {
    if (priority <= 3) return "#0B5D41";
    if (priority <= 6) return "#BA7517";
    if (priority <= 8) return "#DA7756";
    return "#A32D2D";
  };

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      <div className="min-h-[300px] bg-[#FEF4EE] flex items-center justify-center font-sans">
        <p className="text-[#888780] font-medium animate-pulse">Loading your Core Values...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEF4EE] p-4 md:p-8 font-sans animate-fade-in relative">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-[#2C2C2A]">
              <Heart className="text-[#DA7756]" size={24} strokeWidth={2.5} />
              Core Values
            </h2>
            <p className="text-[#888780] text-sm mt-1 font-medium">
              Maximum 10 values that guide your decisions
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-[#DA7756] hover:bg-[#C26547] text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto text-sm outline-none"
          >
            <Plus size={18} />
            Add Value
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-[#FEF4EE] border-l-4 border-[#DA7756] p-4 rounded-r-xl shadow-sm border border-[#D6B99D]">
          <p className="text-sm text-[#2C2C2A] leading-relaxed">
            <span className="mr-1">💡</span>
            <span className="font-bold">What are Core Values?</span> Your non-negotiable principles that guide every decision. Examples: Integrity, Family, Health, Growth, Freedom, Compassion. Rank them by priority (1 = most important). Your daily actions should reflect these values.
          </p>
        </div>

        {/* Values Grid */}
        {values.length === 0 ? (
          <div className="flex items-center justify-center p-12 border-2 border-dashed border-[#D6B99D] rounded-2xl bg-white text-[#888780] font-medium">
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
                    className="bg-white border border-[#D6B99D] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FEF4EE] border border-[#D6B99D] text-[#DA7756] font-bold flex items-center justify-center text-lg shadow-sm">
                          {val.priority}
                        </div>
                        <h3 className="text-lg font-bold text-[#2C2C2A]">{val.name}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wide ${colors.pillBg} ${colors.text}`}>
                        {val.color}
                      </span>
                    </div>
                    {val.meaning && (
                      <p className="text-[#2C2C2A] text-sm mt-1 ml-11 leading-relaxed">{val.meaning}</p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-visible flex flex-col relative border border-[#D6B99D]">

            {isFetchingDetails && (
              <div className="absolute top-0 left-0 w-full h-1 bg-[#D6B99D] overflow-hidden rounded-t-2xl">
                <div className="h-full bg-[#DA7756] animate-pulse w-full"></div>
              </div>
            )}

            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-[#D6B99D]">
              <h3 className="text-[18px] font-bold text-[#2C2C2A]">
                {modalMode === "add" ? "Add Core Value" : "Edit Value"}
              </h3>
              <button onClick={closeModal} className="text-[#888780] hover:text-[#2C2C2A] transition-colors outline-none">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-visible">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2C2A] mb-1">
                  Value Name <span className="text-[#A32D2D]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isFetchingDetails}
                  placeholder="e.g., Integrity, Growth, Family..."
                  className="w-full border border-[#D6B99D] rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#DA7756] focus:border-[#DA7756] disabled:bg-[#FEF4EE] placeholder:text-[#888780] text-[#2C2C2A] transition-all"
                />
              </div>

              {/* Meaning */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2C2A] mb-1">
                  What does this value mean to you?
                </label>
                <textarea
                  name="meaning"
                  value={formData.meaning}
                  onChange={handleInputChange}
                  disabled={isFetchingDetails}
                  placeholder="e.g., Integrity means always being honest, even when it's difficult..."
                  className="w-full h-24 border border-[#D6B99D] rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#DA7756] focus:border-[#DA7756] resize-y min-h-[96px] disabled:bg-[#FEF4EE] placeholder:text-[#888780] text-[#2C2C2A] transition-all"
                />
                <p className="text-xs text-[#888780] mt-1 font-medium">Optional: Add a personal definition to make this value more meaningful</p>
              </div>

              {/* Priority Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-[#2C2C2A]">Priority (1-10)</label>
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
                  className="w-full h-2 bg-[#D6B99D] rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* Color Picker Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-[#2C2C2A] mb-1">
                  Color Tag
                </label>
                <div className="relative" ref={colorDropdownRef}>
                  <button
                    type="button"
                    disabled={isFetchingDetails}
                    onClick={() => setColorDropdownOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between border border-[#D6B99D] rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#DA7756] disabled:bg-[#FEF4EE] disabled:cursor-not-allowed hover:border-[#DA7756] transition-colors outline-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: colorMap[formData.color]?.hex || "#999" }}
                      />
                      <span className="text-[#2C2C2A] capitalize">{formData.color}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-[#888780] transition-transform duration-200 ${colorDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {colorDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#D6B99D] rounded-xl shadow-lg z-[9999] overflow-y-auto max-h-52">
                      {Object.entries(colorMap).map(([colorName, colorValues]) => (
                        <button
                          key={colorName}
                          type="button"
                          onClick={() => handleColorSelect(colorName)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FEF4EE] transition-colors outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-5 h-5 rounded-md flex-shrink-0 border border-[#D6B99D]/50"
                              style={{ backgroundColor: colorValues.hex }}
                            />
                            <span className="text-[#2C2C2A] text-sm capitalize font-medium">{colorName}</span>
                          </div>
                          {formData.color === colorName && (
                            <Check size={16} className="text-[#DA7756]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#D6B99D] flex justify-between items-center bg-[#FEF4EE] rounded-b-2xl">
              <div>
                {modalMode === "edit" && (
                  <button
                    onClick={handleDeleteValue}
                    className="flex items-center gap-1.5 text-[#A32D2D] hover:text-white hover:bg-[#A32D2D] border border-[#A32D2D] px-3 py-2 rounded-xl transition-colors text-sm font-semibold outline-none"
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
                  className="text-[#888780] hover:text-[#2C2C2A] text-sm font-bold px-4 py-2 disabled:opacity-50 transition-colors outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveValue}
                  disabled={isSaving || isFetchingDetails}
                  className="bg-[#DA7756] hover:bg-[#C26547] text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2 uppercase tracking-wider outline-none"
                >
                  {isSaving ? "Saving..." : modalMode === "add" ? "Create" : "Update"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 ${
            toast.type === "error" ? "bg-[#A32D2D]" : "bg-[#0B5D41]"
          } text-white px-4 py-3 rounded-xl shadow-lg flex flex-col min-w-[250px] animate-fade-in z-50`}
        >
          <span className="font-bold text-sm">{toast.type === "error" ? "Error" : "Success"}</span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Values;