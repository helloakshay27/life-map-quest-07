import React, { useState } from 'react';
import { Target, Info, Check } from 'lucide-react';

const defaultData = {
  matrix: {
    q1: { value: 0, label: 'Imp & Urgent', emoji: '🔥', color: 'red' },
    q2: { value: 1, label: 'Imp not Urgent', emoji: '🌱', color: 'green' },
    q3: { value: 0, label: 'Not imp Urgent', emoji: '⚡', color: 'yellow' },
    q4: { value: 0, label: 'Not imp not Urgent', emoji: '⏳', color: 'gray' },
  },
  balance: [
    { id: '1', emoji: '💼', score: 1 },
    { id: '2', emoji: '🤝', score: 0 },
    { id: '3', emoji: '❤️', score: 0 },
    { id: '4', emoji: '🌱', score: 0 },
    { id: '5', emoji: '⚖️', score: 0 },
  ],
  goals: [
    { id: 1, title: 'gold medal', category: 'Health', progress: 45, completed: true },
    { id: 2, title: 'wedding', category: 'Relationships', progress: 45, completed: false },
  ],
  sayNoText: ''
};

 function FocusAndBoundaries({ initialData = defaultData }) {
  const [data, setData] = useState(initialData);

  const toggleGoal = (goalId) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((goal) =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      ),
    }));
  };

  const handleSayNoChange = (e) => {
    setData((prev) => ({ ...prev, sayNoText: e.target.value }));
  };

  // Helper for matrix styles
  const getMatrixStyles = (color) => {
    const styles = {
      red: 'bg-red-50 border-red-200 text-red-600',
      green: 'bg-green-50 border-green-200 text-green-600',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
      gray: 'bg-slate-50 border-slate-200 text-slate-500',
    };
    return styles[color] || styles.gray;
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden font-sans border-t-[6px] border-t-purple-200">
      
      {/* HEADER */}
      <div className="p-6 md:p-8 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100">
            <Target className="text-gray-700 w-5 h-5" strokeWidth={2.5} />
          </div>
          <h2 className="text-[22px] font-bold text-gray-900">
            Focus & Boundaries
          </h2>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10 bg-[#faf9fc]">
        
        {/* ==========================================
            SECTION 1: MATRIX & LIFE BALANCE
        ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Eisenhower Matrix */}
          <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[15px] font-bold text-gray-800">Eisenhower Matrix</h3>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              {Object.entries(data.matrix).map(([key, item]) => (
                <div key={key} className={`flex flex-col items-center justify-center p-4 rounded-xl border ${getMatrixStyles(item.color)}`}>
                  <span className="text-[13px] font-bold uppercase mb-1">{key}</span>
                  <span className="text-3xl font-bold mb-1">{item.value}</span>
                  <span className="text-[11px] font-semibold flex items-center gap-1">
                    {item.emoji} {item.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-gray-500 italic">Focus on Q2 for growth</p>
          </div>

          {/* Life Balance Overview */}
          <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[15px] font-bold text-gray-800">Life Balance Overview</h3>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>

            <div className="space-y-4 mb-4">
              {data.balance.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-lg w-6">{item.emoji}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.score > 0 ? 'bg-orange-300' : 'bg-transparent'}`}
                      style={{ width: `${(item.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-[14px] font-bold text-gray-700">{item.score}</span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-gray-500 italic">Balance across all areas</p>
          </div>
        </div>

        {/* ==========================================
            SECTION 2: GOALS IN FOCUS
        ========================================== */}
        <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-gray-800">Goals in Focus</h3>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <button className="text-[14px] font-semibold text-purple-700 hover:text-purple-800 transition-colors">
              Manage Goals
            </button>
          </div>

          <div className="space-y-4">
            {data.goals.map((goal) => (
              <div key={goal.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                
                {/* Checkbox, Title & Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleGoal(goal.id)}
                      className={`flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${
                        goal.completed ? 'bg-black border-black text-white' : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {goal.completed && <Check strokeWidth={3} className="w-3 h-3" />}
                    </button>
                    <span className="text-[16px] font-medium text-gray-900">{goal.title}</span>
                  </div>
                  <span className="text-[12px] font-bold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-md">
                    {goal.category}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-4 pl-8">
                  <span className="text-[13px] text-gray-400 font-medium">Progress</span>
                  <div className="flex-1 relative flex items-center">
                    {/* Track */}
                    <div className="w-full h-[3px] bg-gray-200 rounded-full" />
                    {/* Fill */}
                    <div 
                      className="absolute left-0 h-[3px] bg-gray-800 rounded-full" 
                      style={{ width: `${goal.progress}%` }} 
                    />
                    {/* Thumb / Handle */}
                    <div 
                      className="absolute w-3.5 h-3.5 bg-white border-2 border-gray-300 rounded-full shadow-sm"
                      style={{ left: `calc(${goal.progress}% - 6px)` }}
                    />
                  </div>
                  <span className="text-[13px] font-bold text-purple-700 w-8 text-right">
                    {goal.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            SECTION 3: WHAT I'LL SAY NO TO
        ========================================== */}
        <div className="bg-white rounded-xl p-5 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-[16px] font-bold text-gray-800">What I'll Say NO To</h3>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </div>
          <textarea
            value={data.sayNoText}
            onChange={handleSayNoChange}
            placeholder="List things you'll decline or avoid to create space for your priorities..."
            className="w-full min-h-[100px] p-4 bg-purple-50/30 border border-purple-100 rounded-xl text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-y"
          />
        </div>

      </div>
    </div>
  );
}

export default FocusAndBoundaries;  