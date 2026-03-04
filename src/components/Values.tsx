import React, { useState, useEffect } from "react";
import { Heart, Plus, X, Trash2 } from "lucide-react";

// 👇 Yahan par ab localhost ki jagah .env se aayega
// 👇 .env ko hata kar humne seedha live URL fix kar diya hai
const API_BASE_URL = "https://life-api.lockated.com";

function Values() {
  // --- STATE ---
  const [values, setValues] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 
  const [isSaving, setIsSaving] = useState(false); 
  const [isFetchingDetails, setIsFetchingDetails] = useState(false); // To handle specific GET fetch state
  
  // 👇 NAYA CODE: Toast Notification ke liye State
  const [toast, setToast] = useState(null); 

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    meaning: "",
    priority: 5,
    color: "teal",
  });

  const colorMap = {
    blue: { bg: "bg-blue-500", pillBg: "bg-blue-50", text: "text-blue-600" },
    green: { bg: "bg-green-500", pillBg: "bg-green-50", text: "text-green-600" },
    red: { bg: "bg-red-500", pillBg: "bg-red-50", text: "text-red-600" },
    teal: { bg: "bg-teal-500", pillBg: "bg-teal-50", text: "text-teal-600" },
    purple: { bg: "bg-purple-500", pillBg: "bg-purple-50", text: "text-purple-600" },
    orange: { bg: "bg-orange-500", pillBg: "bg-orange-50", text: "text-orange-600" },
  };

  // 👇 NAYA CODE: Toast Dikhane ka Function
  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // =========================================
  // API INTEGRATION: FETCH ALL VALUES (List)
  // =========================================
  useEffect(() => {
    fetchCoreValues();
  }, []);

  const fetchCoreValues = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      console.log("🕵️‍♂️ Bheja gaya Token (GET ALL):", token); 
      
      const response = await fetch(`${API_BASE_URL}/core_values`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const mappedData = Array.isArray(data) ? data.map(item => ({
          ...item,
          meaning: item.description || item.meaning || ""
        })) : []; 
        setValues(mappedData);
      }
    } catch (error) {
      console.error("Error fetching list:", error);
      showToast("Could not load values. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  const openAddModal = () => {
    setFormData({ id: null, name: "", meaning: "", priority: 5, color: "teal" });
    setModalMode("add");
    setIsModalOpen(true);
  };

  // =========================================
  // API INTEGRATION: FETCH SPECIFIC VALUE BY ID
  // =========================================
  const openEditModal = async (valueItem) => {
    // Optimistically open modal with current data for good UX
    setFormData({ ...valueItem }); 
    setModalMode("edit");
    setIsModalOpen(true);
    setIsFetchingDetails(true);

    try {
      const token = localStorage.getItem("auth_token"); // ✅ Fixed "token" to "auth_token"
      
      // Hit specific API: e.g., /core_values/1
      const response = await fetch(`${API_BASE_URL}/core_values/${valueItem.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch specific details");

      const data = await response.json();
      
      // Update modal with fresh data directly from backend
      setFormData({
        id: data.id,
        name: data.name || "",
        meaning: data.description || data.meaning || "", 
        priority: data.priority || 5,
        color: data.color || "teal"
      });

    } catch (error) {
      console.error("Error fetching specific value details:", error);
      // If error occurs, the user still sees the local data we set at the top
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // =========================================
  // API INTEGRATION: POST (Add) & PUT (Update)
  // =========================================
  const handleSaveValue = async () => {
    if (!formData.name.trim()) return;

    setIsSaving(true);

    try {
      const token = localStorage.getItem("auth_token");
      console.log("🕵️‍♂️ Bheja gaya Token (SAVE):", token); 

      // Expected payload format { core_value: { ... } }
      const payload = {
        core_value: {
          name: formData.name,
          description: formData.meaning, 
          priority: parseInt(formData.priority),
          color: formData.color
        }
      };

      if (modalMode === "add") {
      
        const response = await fetch(`${API_BASE_URL}/core_values`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        });

        // 👇 NAYA CODE: Backend ka actual error read karne ke liye
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (errorData && errorData.errors && errorData.errors.length > 0) {
            throw new Error(errorData.errors[0]); // E.g., "Priority has already been taken"
          }
          throw new Error("Failed to save.");
        }

        const newSavedValue = await response.json();
        newSavedValue.meaning = newSavedValue.description || newSavedValue.meaning || "";
        setValues([...values, newSavedValue]);
        showToast("Core value added successfully!", "success");
        
      } else {
        const response = await fetch(`${API_BASE_URL}/core_values/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(payload)
        });

        // 👇 NAYA CODE: Edit ke time bhi actual error read karne ke liye
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (errorData && errorData.errors && errorData.errors.length > 0) {
            throw new Error(errorData.errors[0]); 
          }
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
      // 👇 NAYA CODE: alert() ki jagah Toast
      showToast(error.message || "Something went wrong while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================
  // API INTEGRATION: DELETE
  // =========================================
  const handleDeleteValue = async () => {
    try {
      const token = localStorage.getItem("auth_token"); // ✅ Fixed "token" to "auth_token"
      const response = await fetch(`${API_BASE_URL}/core_values/${formData.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
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
            className="bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus size={18} />
            Add Value
          </button>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-md shadow-sm">
          <p className="text-sm text-orange-900 leading-relaxed">
            <span className="mr-1">💡</span>
            <span className="font-bold">What are Core Values?</span> Your non-negotiable principles that guide every decision. Examples: Integrity, Family, Health, Growth, Freedom, Compassion. Rank them by priority (1 = most important). Your daily actions should reflect these values.
          </p>
        </div>

        {values.length === 0 ? (
           <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-white text-gray-400 font-medium">
             No core values added yet. Click "Add Value" to create your first one.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.sort((a, b) => a.priority - b.priority).map((val) => {
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
                    <p className="text-gray-600 text-sm mt-1 ml-11">
                      {val.meaning}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col relative">
            
            {/* Loading Indicator inside the modal while specific item fetches */}
            {isFetchingDetails && (
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-100 overflow-hidden">
                <div className="h-full bg-orange-500 animate-pulse w-full"></div>
              </div>
            )}

            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Add Core Value" : "Edit Value"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-5 space-y-5">
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
                  className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  What does this value mean to you?
                </label>
                <textarea
                  name="meaning"
                  value={formData.meaning}
                  onChange={handleInputChange}
                  disabled={isFetchingDetails}
                  className="w-full h-24 border border-gray-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none disabled:bg-gray-50"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Priority (1-10)
                  </label>
                  <span className="text-orange-500 font-bold text-lg">{formData.priority}</span>
                </div>
                <input
                  type="range"
                  name="priority"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={handleInputChange}
                  disabled={isFetchingDetails}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#f97316] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Color Tag
                </label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm ${colorMap[formData.color]?.bg || "bg-gray-500"}`}></div>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    disabled={isFetchingDetails}
                    className="w-full border border-gray-300 rounded-md p-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white disabled:bg-gray-50"
                  >
                    <option value="blue">blue</option>
                    <option value="green">green</option>
                    <option value="red">red</option>
                    <option value="teal">teal</option>
                    <option value="purple">purple</option>
                    <option value="orange">orange</option>
                  </select>
                </div>
              </div>

            </div>

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
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveValue}
                  disabled={isSaving || isFetchingDetails}
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white px-5 py-2 rounded-md font-medium text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? "Saving..." : (modalMode === "add" ? "Create" : "Update")}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 👇 NAYA CODE: TOAST NOTIFICATION UI */}
      {toast && (
        <div className={`fixed bottom-6 right-6 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-3 rounded shadow-lg flex flex-col min-w-[250px] animate-fade-in z-50`}>
          <span className="font-bold text-sm">{toast.type === 'error' ? 'Error' : 'Success'}</span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Values;