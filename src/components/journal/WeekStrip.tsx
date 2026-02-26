import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, isAfter } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface WeekStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  filledDates?: Date[];
}

const WeekStrip = ({ selectedDate, onDateChange, filledDates = [] }: WeekStripProps) => {
  const today = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 0 }), [selectedDate]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const isToday = isSameDay(date, today);
      const isSelected = isSameDay(date, selectedDate);
      const isFilled = filledDates.some((d) => isSameDay(d, date));
      const isFuture = isAfter(date, today);
      return { date, isToday, isSelected, isFilled, isFuture };
    });
  }, [weekStart, today, selectedDate, filledDates]);

  const goToPrevWeek = () => onDateChange(addDays(weekStart, -7));
  const goToNextWeek = () => onDateChange(addDays(weekStart, 7));

  return (
    <div className="journal-section-green rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-foreground" />
          <span className="text-body-4 font-medium text-foreground">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goToPrevWeek} className="rounded-full p-1 hover:bg-card">
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={() => onDateChange(today)}
            className="rounded-md px-2 py-0.5 text-body-6 font-medium text-primary hover:bg-card"
          >
            Today
          </button>
          <button onClick={goToNextWeek} className="rounded-full p-1 hover:bg-card">
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>
      <p className="mb-2 text-center text-body-6 text-muted-foreground">This Week</p>
      <div className="flex justify-center gap-2">
        {days.map((d) => (
          <button
            key={d.date.toISOString()}
            onClick={() => !d.isFuture && onDateChange(d.date)}
            className={`flex h-14 w-11 flex-col items-center justify-center rounded-lg text-body-6 transition-colors ${
              d.isSelected
                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                : d.isFilled
                ? "bg-success text-success-foreground cursor-pointer hover:opacity-80"
                : d.isFuture
                ? "bg-card text-muted-foreground opacity-50 cursor-not-allowed"
                : "bg-card text-foreground cursor-pointer hover:bg-muted"
            }`}
          >
            <span className="text-[10px] font-medium uppercase">
              {format(d.date, "EEE").slice(0, 2)}
            </span>
            <span className="font-semibold">{format(d.date, "d")}</span>
            {d.isFilled && !d.isSelected && (
              <span className="text-[8px]">✓</span>
            )}
            {d.isToday && !d.isSelected && (
              <span className="mt-0.5 h-1 w-1 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-4 text-body-6 text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-success" /> Filled
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-muted" /> Upcoming
        </span>
      </div>
    </div>
  );
};

export default WeekStrip;
