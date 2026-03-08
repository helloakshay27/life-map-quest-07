import React, { useState, useEffect } from "react";
import { Copy, Save, Plus, Trash2 } from "lucide-react";

const API_BASE_URL = "https://life-api.lockated.com";

function Vision() {
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [visionStatement, setVisionStatement] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [legacyStatement, setLegacyStatement] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [visionId, setVisionId] = useState(null);

  // =========================================
  // TOAST TIMER FIX (Prevents Memory Leaks)
  // =========================================
  useEffect(() => {
    let timer;
    if (toast) {
      timer = setTimeout(() => setToast(null), 3000);
    }
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // =========================================
  // FETCH VISION DATA (GET)
  // =========================================
  useEffect(() => {
    fetchVisionData();
  }, []);

  const fetchVisionData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE_URL}/vision.json`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // 🚨 FIX: Agar GET request fail ho, toh API ka error catch karo
      if (!response.ok) {
        let errMessage = "Could not load your vision board";
        try {
          const errData = await response.json();
          errMessage =
            errData.message || errData.error || errData.detail || errMessage;
        } catch (e) {
          // ignore
        }
        throw new Error(errMessage);
      }

      const data = await response.json();
      const visionData = Array.isArray(data) ? data[0] : data;

      if (visionData) {
        setVisionId(visionData.id || null);
        setImages(visionData.images || []);
        setVisionStatement(visionData.vision_statement || "");
        setMissionStatement(visionData.mission_statement || "");
        setLegacyStatement(visionData.legacy_statement || "");
      }
    } catch (error) {
      console.error("Error fetching vision data:", error);
      // Backend error toast me dikhega
      showToast(error.message || "Could not load your vision board", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================
  // FILE HELPERS & UPLOAD
  // =========================================
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file", "error");
      e.target.value = "";
      return;
    }

    if (images.length >= 12) {
      showToast("Maximum 12 images allowed", "error");
      e.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      showToast("File size must be less than 1MB", "error");
      e.target.value = "";
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setImages([...images, base64]);
      showToast("Image added successfully!", "success");
    } catch (error) {
      console.error("Error processing image:", error);
      showToast("Failed to process image file.", "error");
    } finally {
      e.target.value = "";
    }
  };

  // =========================================
  // HANDLE ADD URL
  // =========================================
  const handleAddUrl = () => {
    const trimmedUrl = imageUrl.trim();
    if (!trimmedUrl) {
      showToast("Please enter an image URL", "error");
      return;
    }

    const urlPattern = /^(http|https):\/\/[^ "]+$/;
    if (!urlPattern.test(trimmedUrl)) {
      showToast("Please enter a valid URL (http/https)", "error");
      return;
    }

    if (images.length >= 12) {
      showToast("Maximum 12 images allowed", "error");
      return;
    }

    setImages([...images, trimmedUrl]);
    setImageUrl("");
    showToast("URL added successfully!", "success");
  };

  const handleDeleteImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    showToast("Image removed", "success");
  };

  const handleCopyPrompt = () => {
    if (visionStatement.length < 20) {
      showToast("Please write a more detailed vision first", "error");
      return;
    }
    navigator.clipboard.writeText(visionStatement);
    showToast("Prompt copied to clipboard!", "success");
  };

  // =========================================
  // SAVE VISION DATA (POST)
  // =========================================
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const payload = {
        vision: {
          vision_statement: visionStatement,
          mission_statement: missionStatement,
          legacy_statement: legacyStatement,
        },
        images: images,
      };

      const response = await fetch(`${API_BASE_URL}/vision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // 🚨 FIX: Backend se exact error nikaal ke Toast me bhejna
      if (!response.ok) {
        let errorMessage = "Failed to save. Please try again.";
        try {
          const errorData = await response.json();
          // Backend chahe .message de, .error de ya .detail de, hum sab catch karenge
          errorMessage =
            errorData.message ||
            errorData.error ||
            errorData.detail ||
            errorMessage;
        } catch (e) {
          console.error("Could not parse error response JSON");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setVisionId(data.id || null);
      showToast("Vision & Mission saved successfully! 🎉", "success");
    } catch (error) {
      console.error("Error saving data:", error);
      // Seedha backend ka error Toast me dikhega
      showToast(error.message || "Something went wrong!", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">
          Loading your Vision Board...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9fc] p-4 md:p-8 font-sans text-gray-800 relative">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* ===== VISION BOARD SECTION ===== */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <span className="text-purple-600 text-2xl">👁️</span> Vision Board
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Upload images or add URLs (max 12 images)
            </p>
          </div>

          <div className="space-y-2">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-md">
              <p className="text-sm text-purple-900 leading-relaxed">
                <span className="font-semibold">
                  💡 What is a Vision Board?
                </span>{" "}
                A collection of images that represent your dreams and
                aspirations.
              </p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-md">
              <p className="text-sm text-blue-900 leading-relaxed">
                <span className="font-semibold">📥 Upload Images:</span> Files
                must be under 1 MB.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg min-h-[200px] p-4">
            {images.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-gray-400 text-sm font-medium">
                  No vision board images yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-video bg-gray-200 rounded-md overflow-hidden relative group shadow-sm"
                  >
                    <img
                      src={img}
                      alt={`Vision ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=Invalid+Image";
                      }}
                    />
                    <button
                      onClick={() => handleDeleteImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Upload Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border border-gray-200 rounded-md p-1 bg-white"
              />
              <p className="text-xs text-gray-500 mt-2">📁 Max 1 MB per file</p>
            </div>

            <div className="flex items-center text-gray-400 text-sm font-medium">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4">OR</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Add Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="flex-1 border border-gray-200 rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddUrl}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus size={16} />({images.length}/12)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== VISION STATEMENT ===== */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <span className="text-blue-400 text-2xl">✨</span> Your Vision
            </h2>
            <button
              onClick={handleCopyPrompt}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
            >
              <Copy size={16} /> Copy Image Prompt
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Vision Statement</h3>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md">
              <p className="text-sm text-blue-900 leading-relaxed">
                <span className="font-bold">💡 How to write your Vision:</span>{" "}
                Describe your ideal future in vivid detail.
              </p>
            </div>
            <textarea
              value={visionStatement}
              onChange={(e) => setVisionStatement(e.target.value)}
              placeholder="What is your vision? What does your ideal future look like?"
              className="w-full min-h-[120px] p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
            />
          </div>
        </section>

        {/* ===== MISSION & LEGACY ===== */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <span className="text-teal-400 text-2xl">✨</span> Your Life Mission
          </h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Mission Statement</h3>
            <div className="bg-teal-50/50 border-l-4 border-teal-400 p-3 rounded-r-md">
              <p className="text-sm text-teal-900 leading-relaxed">
                <span className="font-bold">💡 Your Mission:</span> Your purpose
                - why you exist.
              </p>
            </div>
            <textarea
              value={missionStatement}
              onChange={(e) => setMissionStatement(e.target.value)}
              placeholder="What is your life's mission?"
              className="w-full min-h-[100px] p-3 border border-teal-100 bg-[#f4faf9] rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 text-sm"
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">
              How do I want to be remembered as?
            </h3>
            <div className="bg-teal-50/50 border-l-4 border-teal-400 p-3 rounded-r-md">
              <p className="text-sm text-teal-900 leading-relaxed">
                <span className="font-bold">💡 Your Legacy:</span> Your lasting
                impact.
              </p>
            </div>
            <textarea
              value={legacyStatement}
              onChange={(e) => setLegacyStatement(e.target.value)}
              placeholder="How do you want people to remember you?"
              className="w-full min-h-[100px] p-3 border border-teal-100 bg-[#f4faf9] rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 text-sm"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#20b2aa] hover:bg-[#1a968f] text-white px-6 py-2.5 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Vision & Mission"}
            </button>
          </div>
        </section>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 ${toast.type === "error" ? "bg-red-500" : "bg-green-500"} text-white px-4 py-3 rounded shadow-lg min-w-[250px] z-50 transition-opacity duration-300`}
        >
          <span className="font-bold text-sm block">
            {toast.type === "error" ? "Error" : "Success"}
          </span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Vision;
