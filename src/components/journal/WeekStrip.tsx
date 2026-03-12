import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameWeek, isAfter, getWeek } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface WeekStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  filledDates?: Date[];
}

  const WeekStrip = ({ selectedDate, onDateChange, filledDates = [] }: WeekStripProps) => {
  const today = useMemo(() => new Date(), []);
  const selectedWeekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 0 }), [selectedDate]);

  // Generate weeks (from 6 weeks ago to 5 weeks ahead)
  const weeks = useMemo(() => {
    const weeksArray = [];
    for (let i = -6; i <= 5; i++) {
      const weekStartDate = addDays(selectedWeekStart, i * 7);
      const weekEndDate = addDays(weekStartDate, 6);
      const weekNum = getWeek(weekStartDate);
      const isCurrentWeek = isSameWeek(weekStartDate, today, { weekStartsOn: 0 });
      const isFilled = filledDates.some((d) => isSameWeek(d, weekStartDate, { weekStartsOn: 0 }));
      const isPast = isAfter(today, weekEndDate);
      
      weeksArray.push({
        start: weekStartDate,
        end: weekEndDate,
        weekNum,
        isCurrentWeek,
        isFilled,
        isPast,
      });
    }
    return weeksArray;
  }, [selectedWeekStart, today, filledDates]);

  const goToPrevWeek = () => onDateChange(addDays(selectedWeekStart, -7));
  const goToNextWeek = () => onDateChange(addDays(selectedWeekStart, 7));

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Creating Wk#{weeks.find(w => w.isCurrentWeek)?.weekNum || 1}, {format(today, "MMM d")}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={goToPrevWeek} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Previous week"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => onDateChange(today)}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button 
            onClick={goToNextWeek} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Next week"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Week Cards */}
      <div className="flex gap-3 overflow-x-auto pb-4 px-1">
        {weeks.map((week) => {
          const isSelected = isSameWeek(week.start, selectedDate, { weekStartsOn: 0 });
          let bgColor = "bg-red-100 border-red-300 text-red-700";
          
          if (week.isCurrentWeek) {
            bgColor = "bg-red-500 border-red-600 text-white";
          } else if (!week.isPast && !week.isCurrentWeek) {
            bgColor = "bg-red-100 border-red-300 text-red-700";
          }

          if (isSelected) {
            bgColor = "bg-green-50 border-green-500 text-gray-900 border-2";
          }

          return (
            <button
              key={week.start.toISOString()}
              onClick={() => onDateChange(week.start)}
              className={`flex-shrink-0 w-32 p-4 rounded-xl border-2 transition-all hover:shadow-md ${bgColor}`}
            >
              <div className="flex items-start justify-between mb-2">
                <Calendar className="h-5 w-5 opacity-70" />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold opacity-75 mb-1">
                  WK#{String(week.weekNum).padStart(2, '0')}
                </div>
                <div className="text-sm font-bold">
                  {format(week.start, "MMM d")}-{format(week.end, "d")}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm px-1 border-t border-gray-200 pt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600">Filled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600">Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-400"></div>
          <span className="text-gray-600">Current/Upcoming</span>
        </div>
      </div>
    </div>
  );
}

export default WeekStrip;