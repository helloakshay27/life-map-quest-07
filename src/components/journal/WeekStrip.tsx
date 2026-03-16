import { useMemo } from "react";
import {
  addDays,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameWeek,
  startOfWeek,
} from "date-fns";
import { CalendarDays, Check, ChevronLeft, ChevronRight } from "lucide-react";

interface WeekStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  filledDates?: Date[];
}

const WeekStrip = ({ selectedDate, onDateChange, filledDates = [] }: WeekStripProps) => {
  const today = useMemo(() => new Date(), []);
  const todayWeekStart = useMemo(() => startOfWeek(today, { weekStartsOn: 0 }), [today]);
  const selectedWeekStart = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 0 }),
    [selectedDate],
  );
  const selectedWeekEnd = useMemo(
    () => endOfWeek(selectedDate, { weekStartsOn: 0 }),
    [selectedDate],
  );

  const weeks = useMemo(() => {
    // Show 6 weeks ending with currently selected week (like the screenshot strip)
    return Array.from({ length: 6 }).map((_, i) => {
      const weekStart = addDays(selectedWeekStart, (i - 5) * 7);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const isFilled = filledDates.some((d) => isSameWeek(d, weekStart, { weekStartsOn: 0 }));
      const isPast = isBefore(weekEnd, todayWeekStart);
      const isUpcoming = isAfter(weekStart, todayWeekStart);

      const rangeLabel =
        format(weekStart, "MMM") === format(weekEnd, "MMM")
          ? `${format(weekStart, "MMM d")}-${format(weekEnd, "d")}`
          : `${format(weekStart, "MMM d")}-${format(weekEnd, "MMM d")}`;

      return {
        weekStart,
        weekEnd,
        isFilled,
        isPast,
        isUpcoming,
        weekLabel: `WK#${format(weekStart, "ww")}`,
        rangeLabel: rangeLabel.toUpperCase(),
      };
    });
  }, [selectedWeekStart, filledDates, todayWeekStart]);

  const goToPrevWeek = () => onDateChange(addDays(selectedWeekStart, -7));
  const goToNextWeek = () => onDateChange(addDays(selectedWeekStart, 7));
  const isTodayWeek = isSameWeek(selectedDate, today, { weekStartsOn: 0 });

  return (
    <div className="w-full rounded-3xl border-2 border-green-300 bg-orange-50/40 p-3.5 sm:p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 shadow-sm">
          <CalendarDays className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
            {`Creating WK#${format(selectedWeekStart, "ww")}, ${format(selectedWeekStart, "MMM d")}-${format(selectedWeekEnd, "d")}`.toUpperCase()}
          </h3>
          <p className="text-sm font-semibold text-slate-500">
            {`WK#${format(selectedWeekStart, "ww")} • ${format(selectedWeekStart, "MMM d")}-${format(selectedWeekEnd, "d")}`}
          </p>
        </div>
      </div>

      <div className="mb-2.5 text-center text-base font-semibold text-slate-500">
        {`This Week (WK#${format(selectedWeekStart, "ww")})`}
      </div>

      {/* Week Cards */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1.5">
        <button
          onClick={goToPrevWeek}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-500 shadow-sm transition-colors hover:bg-slate-200"
          title="Previous week"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>

        {weeks.map((week) => {
          const isSelected = isSameWeek(week.weekStart, selectedDate, { weekStartsOn: 0 });

          let cardStyles =
            "border-slate-300 bg-slate-200 text-slate-600";
          if (week.isPast && !week.isFilled) {
            cardStyles = "border-red-400 bg-red-400 text-white";
          }
          if (week.isFilled) {
            cardStyles = "border-green-500 bg-green-500 text-white";
          }
          if (isSelected) {
            cardStyles = "border-green-400 bg-slate-200 text-slate-900";
          }

          const isMissed = week.isPast && !week.isFilled;

          return (
            <button
              key={week.weekStart.toISOString()}
              onClick={() => onDateChange(week.weekStart)}
              className={`relative min-w-[80px] sm:min-w-[90px] rounded-lg border p-2 text-center shadow-sm transition-all hover:opacity-95 ${cardStyles} ${
                isSelected ? "ring-1 ring-green-300 border-green-300" : ""
              }`}
            >
              <div className="text-sm font-bold leading-none tracking-tight sm:text-base">
                {week.weekLabel}
              </div>

              <div className="mt-0.5 text-xs font-bold leading-tight sm:text-sm">
                {week.rangeLabel}
              </div>

              {isMissed && (
                <div className="mx-auto mt-1 inline-flex rounded-full bg-red-600 px-1 py-0.5 text-[8px] font-bold text-white sm:text-[9px]">
                  -10
                </div>
              )}

              {(week.isFilled || isSelected) && (
                <div className="mx-auto mt-1 inline-flex h-3 min-w-3 items-center justify-center rounded-full bg-green-700 px-0.5 text-white">
                  <Check className="h-2 w-2" />
                </div>
              )}
            </button>
          );
        })}

        <button
          onClick={goToNextWeek}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-500 shadow-sm transition-colors hover:bg-slate-200"
          title="Next week"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Legend */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-3 border-t border-slate-200 pt-2.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-slate-500">Filled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400"></div>
          <span className="text-slate-500">Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-300"></div>
          <span className="text-slate-500">Upcoming</span>
        </div>
      </div>

      {!isTodayWeek && (
        <div className="mt-4 text-center">
          <button
            onClick={() => onDateChange(today)}
            className="rounded-full border border-green-300 bg-green-100 px-5 py-2 text-sm font-semibold text-green-700 transition-colors hover:bg-green-200"
          >
            Jump to this week
          </button>
        </div>
      )}
    </div>
  );
};

export default WeekStrip;