import Tobe from "@/components/Tobe";
import Values from "@/components/Values";
import Vision from "@/components/Vision";
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { HelpCircle } from "lucide-react";

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
      <div className="w-full p-4 sm:p-8 rounded-2xl font-sans">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2C2A] leading-tight tracking-tight">
              Vision & Values
            </h1>
            <p className="text-[#888780] text-sm mt-0.5 font-medium">
              Your guiding principles
            </p>
          </div>

          <button
            onClick={() => navigate("/help")}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#888780] hover:text-[#2C2C2A] bg-white/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-[#D6B99D] transition-all outline-none"
          >
            <HelpCircle className="w-4 h-4 text-[#DA7756]" />
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#FEF4EE] border border-[#D6B99D] p-1.5 rounded-xl mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-2.5 text-[13px] font-bold rounded-lg transition-all duration-200 truncate px-2 uppercase tracking-wider outline-none ${
                activeTab === tab
                  ? "bg-white text-[#2C2C2A] shadow-sm"
                  : "text-[#888780] hover:text-[#2C2C2A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
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