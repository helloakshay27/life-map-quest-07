import React from "react";
import { TrendingUp, Info, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Habit {
  id: string;
  title: string;
  progress?: number;
  streak?: number;
}

interface MissionHabitsConnectionProps {
  coreValue: string;
  setCoreValue: (val: string) => void;
  missionText: string;
  setMissionText: (val: string) => void;
  habitsText: string;
  setHabitsText: (val: string) => void;
  apiHabits?: Habit[];
}

function MissionHabitsConnection({
  coreValue,
  setCoreValue,
  missionText,
  setMissionText,
  habitsText,
  setHabitsText,
  apiHabits = [],
}: MissionHabitsConnectionProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full font-sans">
      {/* Purple Header */}
      <div className="px-6 pt-5 pb-4 border-b border-purple-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#9b51e0] shadow-sm shrink-0">
            <TrendingUp className="text-white w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-[17px] font-bold text-gray-900">Mission & Habits Connection</h2>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">Align your week with your mission and values</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
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

          <div className="space-y-4">
            {/* Weekly Habits Tracker Box */}
            <div className="border border-purple-200 bg-[#faf5ff] rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-purple-100/50 bg-white">
                <span className="text-[13px] font-bold text-[#8b5cf6] flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Weekly Habits Tracker
                </span>
                <button 
                  onClick={() => navigate("/goals-habits")}
                  className="text-[12px] font-bold text-[#8b5cf6] hover:text-purple-700 transition-colors bg-purple-50 px-3 py-1 rounded-full border border-purple-100"
                >
                  Manage Habits
                </button>
              </div>

              <div className="bg-white">
                {apiHabits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <p className="text-[14px] text-gray-500 mb-4 font-medium">
                      No weekly habits defined yet
                    </p>
                    <button 
                      onClick={() => navigate("/goals-habits")}
                      className="bg-purple-600 text-white text-[13px] font-bold px-5 py-2 rounded-lg hover:bg-purple-700 transition-all shadow-sm"
                    >
                      Create Your First Habit
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {apiHabits.map((habit) => (
                      <div key={habit.id} className="p-4 hover:bg-purple-50/30 transition-colors">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
                            <span className="text-[14px] font-bold text-gray-800">{habit.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                              🔥 {habit.streak || 0} day streak
                            </span>
                            <span className="text-[13px] font-extrabold text-[#8b5cf6] w-9 text-right">
                              {habit.progress || 0}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-700 ease-out" 
                              style={{ width: `${habit.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Textarea */}
            <div className="relative">
              <label className="text-[12px] font-bold text-purple-400 absolute -top-2.5 left-4 bg-white px-2 z-10">
                Reflection Note
              </label>
              <textarea
                value={habitsText}
                onChange={(e) => setHabitsText(e.target.value)}
                placeholder="How did your habits go this week? Which ones did you maintain consistently?"
                className="w-full min-h-[100px] p-4 bg-white border border-purple-100 rounded-xl text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 resize-y shadow-sm"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MissionHabitsConnection;