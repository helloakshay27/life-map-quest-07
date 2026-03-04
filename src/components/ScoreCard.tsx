import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ScoreCardProps {
  data: {
    score?: { achieved: number; total: number };
    // Flat fields as fallback (in case API returns these directly)
    achieved?: number;
    total?: number;
    total_score?: number;
    max_score?: number;
    title?: string;
    level?: string;       // some APIs use 'level' instead of 'title'
    message?: string;
    feedback?: string;    // some APIs use 'feedback' instead of 'message'
  } | null;
}

function ScoreCard({ data }: ScoreCardProps) {
  if (!data) {
    return (
      <div className="relative w-full max-w-4xl overflow-hidden bg-[#f46d14] rounded-[16px] p-6 md:p-8 shadow-md font-sans">
        <p className="text-white text-sm opacity-70">No score data available.</p>
      </div>
    );
  }

  // ── Normalize: handle both { score: { achieved, total } } and flat shapes ──
  const achieved =
    data.score?.achieved ??
    data.achieved ??
    data.total_score ??
    null;

  const total =
    data.score?.total ??
    data.total ??
    data.max_score ??
    null;

  const title =
    data.title ??
    data.level ??
    null;

  const message =
    data.message ??
    data.feedback ??
    null;

  const hasScore = achieved !== null && total !== null;
  const percentage = hasScore ? Math.min((achieved! / total!) * 100, 100) : 0;

  return (
    <div className="relative w-full max-w-4xl overflow-hidden bg-[#f46d14] rounded-[16px] p-6 md:p-8 shadow-md font-sans transition-all duration-500">

      {/* Decorative circle */}
      <div className="absolute top-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
        <TrendingUp className="text-white w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
      </div>

      <div className="relative z-10">
        {/* Label */}
        <h4 className="text-orange-100 text-[14px] font-semibold mb-1">
          Your Total Score
        </h4>

        {/* Score numbers */}
        <div className="flex items-baseline mb-6">
          <span className="text-5xl md:text-6xl font-extrabold text-white leading-none tracking-tight">
            {hasScore ? achieved : '--'}
          </span>
          <span className="text-2xl md:text-3xl font-medium text-orange-200 ml-1">
            /{hasScore ? total : '--'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-1 pr-16">
          {title ?? (hasScore ? 'Score Available' : 'No Data')}
        </h3>

        {/* Message */}
        <p className="text-orange-100 text-[14px] md:text-[15px] mb-8 pr-12 md:pr-20 leading-relaxed">
          {message ?? (hasScore ? '' : 'No score data available right now.')}
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative w-full bg-orange-950/20 rounded-full h-2 overflow-hidden">
        <div
          className="bg-white h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage label */}
      {hasScore && (
        <p className="text-orange-200 text-xs mt-2 text-right">
          {Math.round(percentage)}% achieved
        </p>
      )}
    </div>
  );
}

export default ScoreCard;