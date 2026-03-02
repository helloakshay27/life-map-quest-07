import React from 'react';
import { TrendingUp } from 'lucide-react';

function ScoreCard({ data }) {
  const { score, title, message } = data || {};
  
  const hasData = score && typeof score.achieved === 'number' && typeof score.total === 'number';
  const percentage = hasData ? (score.achieved / score.total) * 100 : 0;

  return (
    // Clean solid orange background with subtle shadow, removed harsh borders
    <div className="relative w-full max-w-4xl overflow-hidden bg-[#f46d14] rounded-[16px] p-6 md:p-8 shadow-md font-sans transition-all duration-500">
      
      {/* Top Right Decorative Circle with Icon (Fixed Absolute Positioning) */}
      <div className="absolute top-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
        <TrendingUp className="text-white w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
      </div>

      <div className="relative z-10">
        {/* Score Header */}
        <h4 className="text-orange-100 text-[14px] font-semibold mb-1">
          Your Total Score
        </h4>
        
        <div className="flex items-baseline mb-6">
          <span className="text-5xl md:text-6xl font-extrabold text-white leading-none tracking-tight">
            {hasData ? score.achieved : '--'}
          </span>
          <span className="text-2xl md:text-3xl font-medium text-orange-200 ml-1">
            /{hasData ? score.total : '--'}
          </span>
        </div>

        {/* Title and Message */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 pr-16">
          {hasData ? title : "No Data"}
        </h3>
        <p className="text-orange-100 text-[14px] md:text-[15px] mb-8 pr-12 md:pr-20 leading-relaxed">
          {hasData ? message : "No score data available right now."}
        </p>
      </div>

      {/* Sleek Progress Bar (Removed extra border-t) */}
      <div className="relative w-full bg-orange-950/20 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-white h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>

    </div>
  );
}

export default ScoreCard;