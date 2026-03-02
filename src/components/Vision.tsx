import React, { useState, useEffect } from "react";
import { Copy, Save, Plus } from "lucide-react";

 function Vision() {
  // State for dynamic data
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [visionStatement, setVisionStatement] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [legacyStatement, setLegacyStatement] = useState("");
  
  // State for the error/toast message
  const [toast, setToast] = useState(null);

  // Handle showing the error toast (auto-hides after 3 seconds)
  const showError = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleAddUrl = () => {
    if (!imageUrl.trim()) {
      showError("Please enter an image URL");
      return;
    }
    if (images.length >= 12) {
      showError("You have reached the maximum of 12 images");
      return;
    }
    // In a real app, you'd validate the URL here
    setImages([...images, imageUrl]);
    setImageUrl("");
  };

  const handleCopyPrompt = () => {
    if (visionStatement.length < 50) {
      showError("Please write a more detailed vision first (50+ characters).");
      return;
    }
    navigator.clipboard.writeText(visionStatement);
    // Could add a success toast here
  };

  const handleSave = () => {
    console.log("Saving data:", { images, visionStatement, missionStatement, legacyStatement });
    // Save logic goes here
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] p-4 md:p-8 font-sans text-gray-800 relative">
      <div className="max-w-4xl mx-auto space-y-10">
        
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

          {/* Alert Boxes */}
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

          {/* Dynamic Image Display Area */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg min-h-[200px] flex items-center justify-center p-4">
            {images.length === 0 ? (
              <p className="text-gray-400 text-sm font-medium">No vision board images yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-video bg-gray-200 rounded-md overflow-hidden relative group">
                    {/* Placeholder for actual image rendering */}
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 break-all p-2 text-center bg-gray-100">
                      Image URL Added
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Inputs */}
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Image File</label>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 border border-gray-200 rounded-md p-1 bg-white" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="text-yellow-500">📁</span> Max 1 MB per file. Compress at <i className="text-gray-400">squoosh.app</i> if needed
              </p>
            </div>

            {/* OR Divider */}
            <div className="flex items-center text-gray-400 text-sm font-medium">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4">OR</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* URL Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Add Image URL</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste Google Drive link or image URL..." 
                  className="flex-1 border border-gray-200 rounded-md p-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button 
                  onClick={handleAddUrl}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm transition-colors"
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
              className="bg-[#20b2aa] hover:bg-[#1a968f] text-white px-6 py-2.5 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save size={18} />
              Save Vision & Mission
            </button>
          </div>
        </section>

      </div>

      {/* =========================================
          TOAST ERROR NOTIFICATION
      ========================================= */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-red-500 text-white px-4 py-3 rounded shadow-lg flex flex-col min-w-[250px] animate-fade-in z-50">
          <span className="font-bold text-sm">Error</span>
          <span className="text-sm">{toast}</span>
        </div>
      )}

    </div>
  );
}

export default Vision;