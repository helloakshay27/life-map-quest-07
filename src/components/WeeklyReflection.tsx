import React, { useState } from 'react';
import { Info, Plus } from 'lucide-react';

 function WeeklyReflection() {
  // State for the form fields
  const [challenge, setChallenge] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [insight, setInsight] = useState('');
  const [balanceRating, setBalanceRating] = useState(3);

  // Auto-Calculated Life Balance placeholder data matching the video
  const lifeBalanceStats = [
    { id: 1, emoji: '💼', score: 0 },
    { id: 2, emoji: '🤝', score: 0 },
    { id: 3, emoji: '❤️', score: 0 },
    { id: 4, emoji: '⚖️', score: 0 },
    { id: 5, emoji: '🔥', score: 0 },
  ];

  return (
    <div className="max-w-5xl  p-6 md:p-8 font-sans space-y-10 bg-[#fdfbf9] min-h-screen">
      
      {/* =========================================
          1. WINS OF PAST WEEK
      ========================================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Wins of Past Week</h2>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </div>
          <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Dashed Empty State Box */}
        <div className="border-y-2 border-dashed border-orange-200/60 bg-[#fefdfb] py-10 flex flex-col items-center justify-center rounded-sm">
          <p className="text-[15px] font-medium text-gray-800 mb-3">No wins added yet</p>
          <button className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" /> Add Your First Win
          </button>
        </div>
      </section>

      {/* =========================================
          2. BIGGEST CHALLENGE & CAUSE
      ========================================= */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Biggest Challenge & Cause</h2>
        <p className="text-[15px] text-gray-600 mb-3">
          What was your biggest challenge this week, perhaps a recurring behavior, and what caused it?
        </p>
        <textarea
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-y transition-shadow"
          placeholder="Type your answer here..."
        />
      </section>

      {/* =========================================
          3. GRATITUDE & KEY INSIGHT (2 Columns)
      ========================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gratitude */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Gratitude</h2>
          <p className="text-[15px] text-gray-600 mb-3">
            What are you grateful for?
          </p>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-y transition-shadow"
            placeholder="Type your answer here..."
          />
        </div>

        {/* Key Insight */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Key Insight</h2>
          <p className="text-[15px] text-gray-600 mb-3 line-clamp-1">
            You are the ultimate creator for everything that manifests in your... What were your insights this week?
          </p>
          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-y transition-shadow"
            placeholder="Type your answer here..."
          />
        </div>
      </section>

      {/* =========================================
          4. AUTO-CALCULATED LIFE BALANCE
      ========================================= */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-lg font-bold text-gray-900">Auto-Calculated Life Balance</h2>
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
        </div>

        {/* 5 Balance Categories Row */}
        <div className="flex items-center justify-between gap-4 mb-8">
          {lifeBalanceStats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center flex-1">
              <div className="w-full h-14 bg-gray-200/70 rounded-xl mb-3"></div>
              <div className="flex flex-col items-center">
                <span className="text-lg mb-0.5">{stat.emoji}</span>
                <span className="text-sm font-bold text-gray-900">{stat.score}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Section */}
        <div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Life Balance Rating</h3>
          
          <div className="px-1 relative">
             <input 
              type="range" 
              min="1" max="5" step="0.1"
              value={balanceRating}
              onChange={(e) => setBalanceRating(parseFloat(e.target.value))}
              className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer
                         bg-gray-200
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                         [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 
                         [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-md"
              style={{
                // Custom gradient to fill the track with black up to the current value
                background: `linear-gradient(to right, #111827 0%, #111827 ${((balanceRating - 1) / 4) * 100}%, #e5e7eb ${((balanceRating - 1) / 4) * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>
        </div>
      </section>

    </div>
  );
}

export default WeeklyReflection;