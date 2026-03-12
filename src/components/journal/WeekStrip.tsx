import { useMemo } from "react";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
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
  const selectedWeekStart = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 0 }),
    [selectedDate],
  );

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(selectedWeekStart, i);
      const isFilled = filledDates.some((d) => isSameDay(d, day));
      const isPast = isBefore(day, today) && !isSameDay(day, today);
      const isUpcoming = isAfter(day, today) && !isSameDay(day, today);

      days.push({
        date: day,
        isFilled,
        isPast,
        isUpcoming,
      });
    }
    return days;
  }, [selectedWeekStart, today, filledDates]);

  const goToPrevWeek = () => onDateChange(addDays(selectedWeekStart, -7));
  const goToNextWeek = () => onDateChange(addDays(selectedWeekStart, 7));
  const isTodayWeek = isSameWeek(selectedDate, today, { weekStartsOn: 0 });

  return (
    <div className="w-full rounded-3xl border-2 border-orange-300 bg-orange-50/40 p-3.5 sm:p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
          <CalendarDays className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
        </div>
      </div>

      <div className="mb-2.5 text-center text-base font-semibold text-slate-500">This Week</div>

      {/* Day Cards */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5">
        <button
          onClick={goToPrevWeek}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-slate-500 shadow-sm transition-colors hover:bg-slate-200"
          title="Previous week"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {weekDays.map((day) => {
          const isSelected = isSameDay(day.date, selectedDate);

          let cardStyles =
            "border-slate-300 bg-slate-200 text-slate-500";
          if (day.isPast && !day.isFilled) {
            cardStyles = "border-red-400 bg-red-400 text-white";
          }
          if (day.isFilled || isSelected) {
            cardStyles = "border-green-500 bg-green-500 text-white";
          }

          const isMissed = day.isPast && !day.isFilled;

          return (
            <button
              key={day.date.toISOString()}
              onClick={() => onDateChange(day.date)}
              className={`relative min-w-[92px] sm:min-w-[100px] rounded-xl border p-2 sm:p-2.5 text-center shadow-sm transition-all hover:opacity-95 ${cardStyles} ${
                isSelected
                  ? "ring-1 ring-orange-300 border-orange-300"
                  : ""
              }`}
            >
              <div className="text-[11px] font-semibold uppercase leading-none opacity-80 sm:text-xs">
                {format(day.date, "EEE")}
              </div>

              <div className="mt-1 text-lg font-bold leading-none sm:text-xl">
                {format(day.date, "d")}
              </div>

              {isMissed && (
                <div className="mx-auto mt-1 inline-flex rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white sm:text-[10px]">
                  -10
                </div>
              )}

              {(day.isFilled || isSelected) && (
                <div className="mx-auto mt-1 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-green-700 px-1 text-white">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </button>
          );
        })}

        <button
          onClick={goToNextWeek}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-slate-500 shadow-sm transition-colors hover:bg-slate-200"
          title="Next week"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Legend */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-3 border-t border-orange-200 pt-2.5 text-xs">
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
            className="rounded-full border border-orange-300 bg-orange-100 px-5 py-2 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-200"
          >
            Jump to this week
          </button>
        </div>
      )}
    </div>
  );
};

export default WeekStrip;