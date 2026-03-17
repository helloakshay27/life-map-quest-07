import React from "react";
import { Target, Info } from "lucide-react";

interface Goal {
  id: number | string;
  title: string;
  category?: string;
  area?: string;
  progress: number;
}

interface ReviewGoalsProps {
  goals: Goal[];
}

// Helper to determine status text based on percentage
const getStatusText = (progress: number) => {
  if (progress === 0) return "Not Started";
  if (progress > 0 && progress <= 25) return "Just Started";
  if (progress > 25 && progress <= 50) return "Making Progress";
  if (progress > 50 && progress <= 75) return "Halfway There";
  if (progress > 75 && progress < 100) return "Almost Done";
  return "Completed";
};

export default function ReviewToDos({ goals }: ReviewGoalsProps) {
  return (
    <div className="w-full bg-[#f8f9fc] border border-indigo-200 rounded-2xl p-6 font-sans">
      {/* Header section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-[#7c83fd] rounded-xl shadow-sm">
          <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-1.5">
          <h2 className="text-[18px] font-bold text-gray-900">Review Goals</h2>
          <Info className="w-4 h-4 text-indigo-500 cursor-help" />
        </div>
      </div>

      {/* Sub-header */}
      <h3 className="text-[13px] font-bold text-indigo-700 uppercase tracking-wider mb-3">
        THIS WEEK'S GOALS
      </h3>

      {/* Goals List */}
      <div className="space-y-3">
        {goals && goals.length > 0 ? (
          goals.map((goal) => {
            const progress = goal.progress || 0;
            const statusText = getStatusText(progress);

            return (
              <div
                key={goal.id}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                {/* Left Side: Dot, Title, Category */}
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0 mt-0.5"></div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-900 leading-tight">
                      {goal.title}
                    </h4>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {goal.category || goal.area || "Relationships"}
                    </p>
                  </div>
                </div>

                {/* Right Side: Status Badge, Progress Bar, Percentage */}
                <div className="flex items-center gap-4">
                  <span className="bg-gray-100 text-gray-700 text-[12px] font-medium px-3 py-1 rounded-full whitespace-nowrap">
                    {statusText}
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[13px] font-bold text-indigo-600 w-8 text-right">
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-4 text-gray-500 text-sm bg-white rounded-xl border border-gray-200">
            No active goals found for this week.
          </div>
        )}
      </div>
    </div>
  );
}
