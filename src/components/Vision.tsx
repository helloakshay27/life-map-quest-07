import React, { useState, useEffect } from "react";
import { Copy, Save, Plus, Trash2 } from "lucide-react"; 

// Base URL set kar diya
const API_BASE_URL = "https://life-api.lockated.com"; 

function Vision() {
  // --- STATE ---
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [visionStatement, setVisionStatement] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [legacyStatement, setLegacyStatement] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); 
  const [isUploading, setIsUploading] = useState(false); 
  
  const [toast, setToast] = useState(null);

  // =========================================
  // API INTEGRATION: FETCH VISION DATA (GET)
  // =========================================
  useEffect(() => {
    fetchVisionData();
  }, []);

  const fetchVisionData = async () => {
    try {
      const token = localStorage.getItem("auth_token"); 
      
      const response = await fetch(`${API_BASE_URL}/vision`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (response.ok) {
        const data = await response.json();
        const visionData = Array.isArray(data) ? data[0] : data; 

        if (visionData) {
          setImages(visionData.images || visionData.image_urls || []);
          setVisionStatement(visionData.visionStatement || visionData.vision_statement || "");
          setMissionStatement(visionData.missionStatement || visionData.mission_statement || "");
          setLegacyStatement(visionData.legacyStatement || visionData.legacy_statement || "");
        }
      } else {
        console.error("Failed to fetch vision data. Status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching vision data:", error);
      showToast("Could not load your vision board. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleAddUrl = () => {
    if (!imageUrl.trim()) {
      showToast("Please enter an image URL", "error");
      return;
    }
    if (images.length >= 12) {
      showToast("You have reached the maximum of 12 images", "error");
      return;
    }
    
    // ✅ URL ko object banate waqt clear kar diya ki iski koi ID nahi hai
    setImages([...images, { id: null, url: imageUrl, isUrlOnly: true }]); 
    setImageUrl("");
  };

  // =========================================
  // API INTEGRATION: UPLOAD IMAGE (POST Base64)
  // =========================================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (images.length >= 12) {
      showToast("You have reached the maximum of 12 images", "error");
      e.target.value = ""; 
      return;
    }

    if (file.size > 1024 * 1024) {
      showToast("File size must be less than 1MB. Please compress it.", "error");
      e.target.value = ""; 
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;

      try {
        const token = localStorage.getItem("auth_token");
        const payload = {
          base64: base64String
        };

        const response = await fetch(`${API_BASE_URL}/vision/upload_image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          // ✅ Smart error handling for "Vision not found"
          if (data && data.error === "Vision not found") {
            throw new Error("VISION_NOT_FOUND");
          }
          throw new Error(data?.error || "Failed to upload image");
        }

        const uploadedUrl = data.image_url || data.url || base64String; 
        
        const newImageObj = {
          id: data.id || data.image_id, 
          url: uploadedUrl
        };
        
        setImages((prevImages) => [...prevImages, newImageObj]);
        showToast("Image uploaded successfully!", "success");

      } catch (error) {
        console.error("Error uploading image:", error);
        
        if (error.message === "VISION_NOT_FOUND") {
          showToast("Please click 'Save Vision & Mission' first to create your board, then upload images.", "error");
        } else {
          showToast("Failed to upload image. Please try again.", "error");
        }
      } finally {
        setIsUploading(false);
        e.target.value = ""; 
      }
    };
    
    reader.readAsDataURL(file); 
  };

  // =========================================
  // API INTEGRATION: DELETE IMAGE (DELETE Method)
  // =========================================
  const handleDeleteImage = async (imageObj, index) => {
    // Safe check agar image string format mein ho
    const imageId = imageObj?.id || imageObj?.image_id;

    // Agar imageId null/undefined nahi hai aur yeh sirf pasted URL nahi hai
    if (imageId && !imageObj?.isUrlOnly) {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${API_BASE_URL}/vision/delete_image?image_id=${imageId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to delete from server");
        }
        showToast("Image deleted successfully!", "success");
      } catch (error) {
        console.error("Delete Error:", error);
        showToast("Could not delete image. Please try again.", "error");
        return; // Error aaye toh frontend se remove mat karo
      }
    }

    // UI state se remove karein
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCopyPrompt = () => {
    if (visionStatement.length < 50) {
      showToast("Please write a more detailed vision first (50+ characters).", "error");
      return;
    }
    navigator.clipboard.writeText(visionStatement);
    showToast("Prompt copied to clipboard!", "success");
  };

  // =========================================
  // API INTEGRATION: SAVE VISION DATA (POST)
  // =========================================
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem("auth_token");

      const payload = {
        vision: {
          vision_statement: visionStatement,
          mission_statement: missionStatement,
          legacy_statement: legacyStatement
        }
      };

      const response = await fetch(`${API_BASE_URL}/vision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to save vision data.");
      }

      showToast("Vision & Mission saved successfully! 🎉", "success");
      
    } catch (error) {
      console.error("Error saving data:", error);
      showToast("Failed to save. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">Loading your Vision Board...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9fc] p-4 md:p-8 font-sans text-gray-800 relative">
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
        
        {/* =========================================
            SECTION 1: VISION BOARD
        ========================================= */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <span className="text-purple-600 text-2xl">👁️</span> Vision Board
            </h2>
            <p className="text-gray-500 text-sm mt-1">Upload images or add URLs (max 12 images)</p>
          </div>

          <div className="space-y-2">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-md">
              <p className="text-sm text-purple-900 leading-relaxed">
                <span className="font-semibold">💡 What is a Vision Board?</span> A collection of images that represent your dreams and aspirations. Include pictures of places you want to visit, achievements you desire, lifestyle you envision, or anything that inspires you toward your goals.
              </p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-md">
              <p className="text-sm text-blue-900 leading-relaxed">
                <span className="font-semibold">📥 Upload Images:</span> Files must be under 1 MB. If your image is too large, compress it at <a href="https://squoosh.app" className="underline font-medium" target="_blank" rel="noreferrer">squoosh.app</a> before uploading.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg min-h-[200px] flex items-center justify-center p-4 relative">
            {isUploading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-purple-700 font-medium text-sm">Uploading Image...</p>
              </div>
            )}

            {images.length === 0 ? (
              <p className="text-gray-400 text-sm font-medium">No vision board images yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {images.map((img, idx) => {
                  const srcUrl = typeof img === "string" ? img : (img.image_url || img.url);

                  return (
                    <div key={idx} className="aspect-video bg-gray-200 rounded-md overflow-hidden relative group shadow-sm">
                      <img 
                        src={srcUrl} 
                        alt={`Vision ${idx + 1}`} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = "https://via.placeholder.com/300x200?text=Invalid+Image+URL";
                        }}
                      />
                      
                      <button
                        onClick={() => handleDeleteImage(img, idx)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                        title="Delete Image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Image File</label>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border border-gray-200 rounded-md p-1 bg-white disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="text-yellow-500">📁</span> Max 1 MB per file. Compress at <i className="text-gray-400">squoosh.app</i> if needed
              </p>
            </div>

            <div className="flex items-center text-gray-400 text-sm font-medium">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4">OR</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Add Image URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={isUploading}
                  placeholder="Paste Google Drive link or image URL..." 
                  className="flex-1 border border-gray-200 rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-50"
                />
                <button 
                  onClick={handleAddUrl}
                  disabled={isUploading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm transition-colors disabled:opacity-70"
                >
                  <Plus size={16} />
                  ({images.length}/12)
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-yellow-500">⚡</span> For Google Drive: right-click image → "Get link" → "Anyone with the link" → Copy and paste here
              </p>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2: YOUR VISION
        ========================================= */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <span className="text-blue-400 text-2xl">✨</span> Your Vision
            </h2>
            <button 
              onClick={handleCopyPrompt}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
            >
              <Copy size={16} />
              Copy Image Prompt
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Vision Statement</h3>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md">
              <p className="text-sm text-blue-900 leading-relaxed">
                <span className="font-bold">💡 How to write your Vision:</span> Describe your ideal future in vivid detail. Where do you see yourself in 5-10 years? What have you achieved? How do you feel? Be specific and paint a compelling picture of success. Example: "I see myself as a respected leader in my field, living in a beautiful home by the coast, financially free, surrounded by loving relationships, and making a positive impact through my work."
              </p>
            </div>
            
            <textarea 
              value={visionStatement}
              onChange={(e) => setVisionStatement(e.target.value)}
              placeholder="What is your vision? What does your ideal future look like? Paint a picture of where you want to be..." 
              className="w-full min-h-[120px] p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
            ></textarea>

            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="text-yellow-500">✍️</span> Write a detailed vision (50+ characters), then click "Copy Image Prompt" to get an AI prompt. Paste it into your favorite AI image generator (DALL-E, Midjourney, Stable Diffusion, etc.) to create your vision image, then add the image URL above.
            </p>
          </div>
        </section>

        {/* =========================================
            SECTION 3: YOUR LIFE MISSION
        ========================================= */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <span className="text-teal-400 text-2xl">✨</span> Your Life Mission
          </h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Mission Statement</h3>
            <div className="bg-teal-50/50 border-l-4 border-teal-400 p-3 rounded-r-md">
              <p className="text-sm text-teal-900 leading-relaxed">
                <span className="font-bold">💡 How to write your Mission:</span> Your mission is your purpose - the reason you exist and what drives you. It's about WHO you serve and HOW you serve them. Example: "My mission is to empower entrepreneurs to build sustainable businesses by sharing practical strategies and inspiration, helping them achieve financial freedom while maintaining work-life balance."
              </p>
            </div>
            <textarea 
              value={missionStatement}
              onChange={(e) => setMissionStatement(e.target.value)}
              placeholder="What is your life's mission? What do you want to be known for? What impact do you want to make?" 
              className="w-full min-h-[100px] p-3 border border-teal-100 bg-[#f4faf9] rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 text-sm"
            ></textarea>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">How do I want to be remembered as?</h3>
            <div className="bg-teal-50/50 border-l-4 border-teal-400 p-3 rounded-r-md">
              <p className="text-sm text-teal-900 leading-relaxed">
                <span className="font-bold">💡 Your Legacy:</span> Think about your eulogy or obituary. What qualities and accomplishments do you want people to mention? What impact will you have left on others? Example: "A loving father who always put family first, a mentor who changed lives, an innovator who made a difference in education."
              </p>
            </div>
            <textarea 
              value={legacyStatement}
              onChange={(e) => setLegacyStatement(e.target.value)}
              placeholder="Describe the legacy you want to leave. How do you want people to remember you and your contributions?" 
              className="w-full min-h-[100px] p-3 border border-teal-100 bg-[#f4faf9] rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400 text-sm"
            ></textarea>
          </div>

          {/* Save Button */}
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

      {/* =========================================
          TOAST NOTIFICATION (SUCCESS & ERROR)
      ========================================= */}
      {toast && (
        <div className={`fixed bottom-6 right-6 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-3 rounded shadow-lg flex flex-col min-w-[250px] animate-fade-in z-50`}>
          <span className="font-bold text-sm">{toast.type === 'error' ? 'Error' : 'Success'}</span>
          <span className="text-sm">{toast.message}</span>
        </div>
      )}

    </div>
  );
}

export default Vision;