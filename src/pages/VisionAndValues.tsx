import Tobe from "@/components/Tobe";
import Values from "@/components/Values";
import Vision from "@/components/Vision";
import React, { useState } from "react";

function VisionAndValues() {
  // 1. State to keep track of which tab is currently selected
  const [activeTab, setActiveTab] = useState("Vision");

  // 2. A simple array of our tab names
  const tabs = ["Vision", "Values", "Be-Do-Have"];

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-4xl p-6 md:p-8 rounded-xl shadow-sm">
        {/* ==============================
            SECTION 1: HEADER
        ============================== */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {/* Title & Subtitle */}
            <h1 className="text-3xl font-bold text-gray-900">
              Vision & Values
            </h1>
            <p className="text-gray-500 mt-1">Your guiding principles</p>
          </div>

          {/* Help Button */}
          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm font-medium mt-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Help
          </button>
        </div>

        {/* ==============================
            SECTION 2: TABS
        ============================== */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              // The class changes based on whether the tab is active or not
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" // Active styles
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50" // Inactive styles
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ==============================
            SECTION 3: CONTENT AREA
        ============================== */}
        <div className="p-6 bg-purple-50/50 rounded-xl min-h-[300px] border border-purple-100/50">
          {/* Content for 'Vision' Tab */}
          {activeTab === "Vision" && <Vision />}

          {/* Content for 'Values' Tab */}
          {activeTab === "Values" && <Values />}

          {/* Content for 'Be-Do-Have' Tab */}
          {activeTab === "Be-Do-Have" && <Tobe />}
        </div>
      </div>
    </div>
  );
}

export default VisionAndValues;
