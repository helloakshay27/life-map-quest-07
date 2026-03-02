import React, { useState, useEffect } from 'react';
import { Target, Info, Calendar, Plus, ChevronDown } from 'lucide-react';

// --- CONFIGURATION & COLORS FOR EACH DAY ---
const dayTheme = {
  Sun: { text: 'text-purple-600', border: 'border-purple-300', bg: 'bg-purple-50', dashed: 'border-purple-300' },
  Mon: { text: 'text-blue-500', border: 'border-blue-300', bg: 'bg-blue-50', dashed: 'border-blue-300' },
  Tue: { text: 'text-green-500', border: 'border-green-300', bg: 'bg-green-50', dashed: 'border-green-300' },
  Wed: { text: 'text-yellow-600', border: 'border-yellow-300', bg: 'bg-yellow-50', dashed: 'border-yellow-300' },
  Thu: { text: 'text-red-500', border: 'border-red-300', bg: 'bg-red-50', dashed: 'border-red-300' },
  Fri: { text: 'text-pink-600', border: 'border-pink-300', bg: 'bg-pink-50', dashed: 'border-pink-300' },
  Sat: { text: 'text-indigo-600', border: 'border-indigo-300', bg: 'bg-indigo-50', dashed: 'border-indigo-300' },
};

// --- DEFAULT MOCK DATA (Matches the video exactly) ---
const defaultWeekData = {
  title: "Plan for Wk#10, MAR 1-7",
  days: [
    { 
      id: 'sun', day: 'Sun', date: '1 Mar', theme: '', defaultTheme: 'Theme (e.g., Relax & Create)',
      priorities: [
        { id: 1, dayAssign: 'Sun', category: '💼 Career', quadrant: 'Q2: Important, Not Urgent', text: '' }
      ]
    },
    { id: 'mon', day: 'Mon', date: '2 Mar', theme: '', defaultTheme: 'Theme (e.g., Review Day)', priorities: [] },
    { id: 'tue', day: 'Tue', date: '3 Mar', theme: '', defaultTheme: 'Theme (e.g., Sales & Marketing Da', priorities: [] },
    { id: 'wed', day: 'Wed', date: '4 Mar', theme: '', defaultTheme: 'Theme (e.g., HR & Finance Day)', priorities: [] },
    { id: 'thu', day: 'Thu', date: '5 Mar', theme: '', defaultTheme: 'Theme (e.g., Learning day)', priorities: [] },
    { id: 'fri', day: 'Fri', date: '6 Mar', theme: '', defaultTheme: 'Theme (e.g., Admin day)', priorities: [] },
    { id: 'sat', day: 'Sat', date: '7 Mar', theme: '', defaultTheme: 'Theme (e.g., Creation Day)', priorities: [] },
  ]
};
 function WeeklyPlanComponent({ initialData = defaultWeekData }) {
  const [data, setData] = useState(initialData);

  // Sync state if props change
  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);

  const handleThemeChange = (dayId, newTheme) => {
    setData(prev => ({
      ...prev,
      days: prev.days.map(d => d.id === dayId ? { ...d, theme: newTheme } : d)
    }));
  };

  const handlePriorityTextChange = (dayId, priorityId, newText) => {
    setData(prev => ({
      ...prev,
      days: prev.days.map(d => {
        if (d.id === dayId) {
          return {
            ...d,
            priorities: d.priorities.map(p => p.id === priorityId ? { ...p, text: newText } : p)
          };
        }
        return d;
      })
    }));
  };

  const addPriority = (dayId) => {
    setData(prev => ({
      ...prev,
      days: prev.days.map(d => {
        if (d.id === dayId) {
          return {
            ...d,
            priorities: [...d.priorities, { 
              id: Date.now(), 
              dayAssign: d.day, 
              category: '📌 New Category', 
              quadrant: 'Q2: Important, Not Urgent', 
              text: '' 
            }]
          };
        }
        return d;
      })
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-8 font-sans bg-[#fcfaf9] min-h-screen border border-red-50 rounded-xl shadow-sm">
      
      {/* 1. HEADER SECTION */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 shadow-sm">
          <Target className="text-white w-5 h-5" strokeWidth={2.5} />
        </div>
        <h2 className="text-[22px] font-bold text-gray-900">
          {data.title}
        </h2>
        <Info className="w-4 h-4 text-gray-400 cursor-help" />
      </div>

      {/* 2. NO CALENDARS BANNER */}
      <div className="border border-dashed border-gray-200 bg-[#fefdfc] rounded-xl p-8 flex flex-col items-center justify-center mb-10 max-w-4xl mx-auto">
        <Calendar className="text-gray-200 w-10 h-10 mb-2" strokeWidth={1.5} />
        <p className="text-[14px] font-semibold text-gray-400">No calendars configured</p>
        <p className="text-[13px] text-gray-400">Add calendars in the Calendar page</p>
      </div>

      {/* 3. DAILY PLAN LIST */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {data.days.map((dayObj) => {
          const themeColor = dayTheme[dayObj.day];
          const hasPriorities = dayObj.priorities.length > 0;

          return (
            <div key={dayObj.id} className="flex flex-col gap-2">
              
              {/* Day Header Row (Centered) */}
              <div className="flex items-center justify-center gap-3">
                <span className={`w-28 text-right font-bold text-[15px] ${themeColor.text}`}>
                  {dayObj.day} ({dayObj.date})
                </span>
                
                <input 
                  type="text" 
                  value={dayObj.theme}
                  onChange={(e) => handleThemeChange(dayObj.id, e.target.value)}
                  placeholder={dayObj.defaultTheme}
                  className={`w-64 px-4 py-2 text-[14px] rounded-lg border bg-white focus:outline-none focus:ring-1 transition-all
                    ${themeColor.border} placeholder:text-gray-400 focus:ring-${themeColor.border.split('-')[1]}-400`}
                />
                
                <button 
                  onClick={() => addPriority(dayObj.id)}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg border bg-white hover:bg-gray-50 transition-colors ${themeColor.border} text-${themeColor.text.split('-')[1]}-500`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Priorities Area */}
              <div className="flex justify-center">
                {!hasPriorities ? (
                  // EMPTY STATE (Dashed)
                  <div className={`w-full border-2 border-dashed rounded-xl py-4 text-center text-[13px] font-medium 
                    ${themeColor.dashed} ${themeColor.text} ${themeColor.bg} bg-opacity-40`}>
                    No priorities for this day yet. Click + above to add one.
                  </div>
                ) : (
                  // FILLED STATE (Solid box, seen in Sunday)
                  <div className={`w-full border rounded-xl p-4 ${themeColor.border} ${themeColor.bg}`}>
                    {dayObj.priorities.map((priority) => (
                      <div key={priority.id} className="flex flex-col gap-3">
                        
                        {/* Dropdown Row */}
                        <div className="flex items-center gap-2">
                          {/* Day Select Fake */}
                          <div className={`flex items-center gap-1 bg-white border rounded px-3 py-1.5 text-[13px] font-medium ${themeColor.border} ${themeColor.text} cursor-pointer`}>
                            {priority.dayAssign} <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                          </div>
                          
                          {/* Category Select Fake */}
                          <div className={`flex items-center gap-2 bg-white border rounded px-3 py-1.5 text-[13px] font-medium ${themeColor.border} text-gray-700 cursor-pointer`}>
                            {priority.category} <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          </div>

                          {/* Quadrant Select Fake */}
                          <div className={`flex items-center gap-1 bg-white border rounded px-3 py-1.5 text-[13px] font-bold ${themeColor.border} text-[#00a67e] cursor-pointer`}>
                            {priority.quadrant} <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                          </div>
                        </div>

                        {/* Text Input */}
                        <input 
                          type="text"
                          value={priority.text}
                          onChange={(e) => handlePriorityTextChange(dayObj.id, priority.id, e.target.value)}
                          placeholder="Priority for Career..."
                          className={`w-full px-4 py-2.5 text-[14px] rounded border bg-white focus:outline-none focus:ring-1 ${themeColor.border}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default WeeklyPlanComponent;