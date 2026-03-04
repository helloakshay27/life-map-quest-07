import React, { useState } from "react";
import { TrendingUp, Info, ChevronDown } from "lucide-react";

interface MissionHabitsConnectionProps {
  coreValue: string;
  setCoreValue: (val: string) => void;
  missionText: string;
  setMissionText: (val: string) => void;
  habitsText: string;
  setHabitsText: (val: string) => void;
}

function MissionHabitsConnection({
  coreValue,
  setCoreValue,
  missionText,
  setMissionText,
  habitsText,
  setHabitsText,
}: MissionHabitsConnectionProps) {
  return (
    <div className="w-full max-w-4xl p-6 md:p-8 rounded-2xl border border-purple-100 bg-gradient-to-br from-[#fcfaff] to-white shadow-sm font-sans">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#9b51e0] shadow-sm">
          <TrendingUp className="text-white w-5 h-5" strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          Mission & Habits Connection
        </h2>
      </div>

      <div className="space-y-6">
        {/* SECTION 1: CORE VALUE */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <h3 className="text-[15px] font-bold text-gray-800">
              Core Value Lived Most This Week
            </h3>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <select
                value={coreValue}
                onChange={(e) => setCoreValue(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 text-gray-500 text-[15px] rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 cursor-pointer"
              >
                <option value="" disabled hidden>
                  Select a core value
                </option>
                <option value="integrity">Integrity</option>
                <option value="innovation">Innovation</option>
                <option value="teamwork">Teamwork</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button className="shrink-0 bg-white border border-gray-200 text-gray-800 text-[14px] font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              Manage Core Values
            </button>
          </div>
        </section>

        {/* SECTION 2: MISSION CONNECTION */}
        <section>
          <h3 className="text-[15px] font-bold text-gray-800 mb-2">
            Mission Connection
          </h3>
          <textarea
            value={missionText}
            onChange={(e) => setMissionText(e.target.value)}
            placeholder="How did your behaviors this week align with or challenge your mission?"
            className="w-full min-h-[80px] p-4 bg-white border border-gray-200 rounded-xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 resize-y shadow-sm"
          />
        </section>

        {/* SECTION 3: HABITS SUMMARY */}
        <section>
          <h3 className="text-[15px] font-bold text-gray-800 mb-2">
            Habits Summary
          </h3>

          <div className="space-y-3">
            {/* Weekly Habits Tracker Box */}
            <div className="border border-purple-200 bg-[#faf5ff] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-purple-100/50">
                <span className="text-[13px] font-bold text-[#8b5cf6]">
                  Weekly Habits Tracker
                </span>
                <button className="text-[13px] font-medium text-[#8b5cf6] hover:text-purple-700 transition-colors">
                  Manage Habits
                </button>
              </div>

              <div className="flex flex-col items-center justify-center py-8 bg-white">
                <p className="text-[15px] text-gray-600 mb-3">
                  No weekly habits defined yet
                </p>
                <button className="bg-white border border-gray-200 text-gray-800 text-[14px] font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                  Create Your First Habit
                </button>
              </div>
            </div>

            {/* Bottom Textarea */}
            <textarea
              value={habitsText}
              onChange={(e) => setHabitsText(e.target.value)}
              placeholder="How did your habits go this week? Which ones did you maintain consistently?"
              className="w-full min-h-[80px] p-4 bg-white border border-gray-200 rounded-xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 resize-y shadow-sm"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default MissionHabitsConnection;
