import Tobe from "@/components/Tobe";
import Values from "@/components/Values";
import Vision from "@/components/Vision";
import React, { useState } from "react";

function VisionAndValues() {
  const [activeTab, setActiveTab] = useState("Vision");
  const tabs = ["Vision", "Values", "Be-Do-Have"];

  return (
    <>
      {/* 2. Added bg-white and border so the shadow-sm actually looks like a card */}
      <div className="w-full  mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        {/* ==============================
            SECTION 1: HEADER
        ============================== */}
        {/* 3. Changed items-start to items-center for perfect vertical alignment */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Back Button */}
            <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 hover:text-gray-900 text-gray-500 transition-colors flex-shrink-0">
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>

            {/* Title & Subtitle */}
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                Vision & Values
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Your guiding principles
              </p>
            </div>
          </div>

          {/* Help Button */}
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors flex-shrink-0">
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
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>

        {/* ==============================
            SECTION 2: TABS
        ============================== */}
        {/* 4. Made the tabs slightly thicker and gave the active tab a purple accent */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 sm:py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 truncate px-2 ${
                activeTab === tab
                  ? "bg-white text-purple-700 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ==============================
            SECTION 3: CONTENT AREA
        ============================== */}
        {/* 5. Removed the nested purple background & extra paddings because child components usually have their own backgrounds/padding */}
        <div className="w-full min-h-[400px]">
          {activeTab === "Vision" && <Vision />}
          {activeTab === "Values" && <Values />}
          {activeTab === "Be-Do-Have" && <Tobe />}
        </div>
      </div>
    </>
  );
}

export default VisionAndValues;
