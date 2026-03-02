import React, { useState } from 'react';

// --- DATA EXACTLY AS PER MD/OWNER SCREENSHOT & VIDEO ---
const initialData = [
  { 
    id: 1, 
    icon: '🎯', 
    title: '1. Vision & Strategy', 
    description: 'Is my team crystal clear about where the company is headed and what success looks like this year?', 
    kpi: '% of team aligned with clear written goals', 
    score: 3 
  },
  { 
    id: 2, 
    icon: '⚙️', 
    title: '2. Systems & Processes', 
    description: 'Can my business run smoothly for 2 weeks without my direct involvement?', 
    kpi: 'Process adherence rate', 
    score: 3 
  },
  { 
    id: 3, 
    icon: '👥', 
    title: '3. Leadership & Team', 
    description: 'Do I have the right people leading each function, and do they take ownership?', 
    kpi: '% of key roles filled with accountable leaders', 
    score: 3 
  },
  { 
    id: 4, 
    icon: '💰', 
    title: '4. Financial Health', 
    description: 'Do I know my company\'s profit, cash flow, and break-even at any point in time?', 
    kpi: 'Accuracy of financial forecasting', 
    score: 3 
  },
  { 
    id: 5, 
    icon: '📈', 
    title: '5. Growth & Sales Engine', 
    description: 'Is my revenue growing predictably every quarter from repeat and new clients?', 
    kpi: '% revenue growth (YoY or QoQ)', 
    score: 3 
  },
  { 
    id: 6, 
    icon: '💡', 
    title: '6. Innovation & Technology', 
    description: 'Have we implemented new tools, automation, or innovations in the last 6 months?', 
    kpi: '# of new innovations / digital initiatives executed', 
    score: 3 
  },
  { 
    id: 7, 
    icon: '🌱', 
    title: '7. Personal Growth & Delegation', 
    description: 'Am I spending most of my time on strategic growth, not daily firefighting?', 
    kpi: '% of time spent on vs in the business', 
    score: 3 
  }
];

export default function QuestionsAndAnswers({header}) {
  const [questions, setQuestions] = useState(initialData);
  const [expandedId, setExpandedId] = useState(1); // Pehla wala open rakhte hain jaisa video mein hai
  const [notes, setNotes] = useState('');

  const handleScoreChange = (id, newScore) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, score: parseInt(newScore) } : q));
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 font-sans bg-[#fbfbfe] min-h-screen">
      
      {/* ================= HEADER SECTION (Exact Match) ================= */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#8b5cf6] p-3 rounded-2xl shadow-sm flex items-center justify-center w-14 h-14">
          {/* Custom SVG Icon for the chart */}
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight">{header}</h1>
          <p className="text-[15px] text-gray-500">Rate yourself on each Key Result Area</p>
        </div>
      </div>

      {/* ================= QUESTIONS LIST ================= */}
      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
            
            {/* CLOSED STATE ROW */}
            <div 
              className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-gray-50/50 transition-colors"
              onClick={() => toggleExpand(q.id)}
            >
              <div className="flex items-start gap-4 flex-1">
                <span className="text-2xl mt-0.5">{q.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-[16px]">{q.title}</h3>
                  <p className="text-gray-500 text-[14px] mt-0.5">{q.description}</p>
                </div>
              </div>

              {/* Score and Chevron */}
              <div className="flex items-center gap-8 pr-2">
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-[22px] font-bold text-[#059669]">{q.score}</span>
                  <span className="text-[12px] text-gray-400 mt-1">/ 5</span>
                </div>
                <div className="text-gray-400">
                  {expandedId === q.id ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  )}
                </div>
              </div>
            </div>

            {/* EXPANDED STATE (SLIDER) */}
            {expandedId === q.id && (
              <div className="px-5 pb-8 pt-4 border-t border-gray-100 bg-white">
                <p className="text-[13px] text-gray-500 mb-6">
                  <span className="font-bold text-gray-700">Key KPI:</span> {q.kpi}
                </p>
                
                {/* EXACT SLIDER MATCH */}
                <div className="relative px-2">
                  <input 
                    type="range" 
                    min="1" max="5" step="1"
                    value={q.score}
                    onChange={(e) => handleScoreChange(q.id, e.target.value)}
                    className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                               [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 
                               [&::-webkit-slider-thumb]:border-gray-300 [&::-webkit-slider-thumb]:shadow-sm"
                    style={{
                      // Dynamic background to make left side black and right side gray
                      background: `linear-gradient(to right, #000 0%, #000 ${((q.score - 1) / 4) * 100}%, #e5e7eb ${((q.score - 1) / 4) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between mt-4 text-[13px] text-gray-500">
                    <span>1 - Poor</span>
                    <span>3 - Average</span>
                    <span>5 - Excellent</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ================= ADDITIONAL NOTES & SAVE ================= */}
      <div className="mt-8">
        <label className="block text-[15px] font-bold text-gray-900 mb-3">
          Additional Notes (Optional)
        </label>
        <textarea 
          rows="4"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional observations or action items..."
          // Updated focus rings to Purple to match the new design
          className="w-full p-4 border border-gray-200 rounded-xl bg-white outline-none focus:border-[#5b32f5] focus:ring-1 focus:ring-[#5b32f5] transition-all resize-y shadow-sm"
        />
        
        <button 
          // Updated Button Color to Purple
          className="mt-6 w-full bg-[#5b32f5] hover:bg-[#4d28d6] text-white py-4 rounded-xl font-bold text-[16px] transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          Save Evaluation
        </button>
      </div>

    </div>
  );
}