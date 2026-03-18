import Tobe from "@/components/Tobe";
import Values from "@/components/Values";
import Vision from "@/components/Vision";
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const TABS = ["Vision", "Values", "Be-Do-Have"];

function VisionAndValues() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("Vision");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && TABS.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <>
      <div className="w-full  mx-auto bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
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
          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors flex-shrink-0"
          >
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
        <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 truncate px-2 ${
                activeTab === tab
                  ? "bg-red-50 text-red-700 shadow-sm border border-red-200"
                  : "text-red-500 hover:text-red-700 hover:bg-red-100/70"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ==============================
            SECTION 3: CONTENT AREA
        ============================== */}
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
