import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rounded-2xl border border-[#e8dccf] bg-[#fdf6ec] p-4 shadow-sm", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-[#4f3f33]",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 rounded-md border-[#d7c5b2] bg-[#fff8ee] p-0 text-[#5b4638] opacity-100 hover:bg-[#f5e9da] hover:text-[#3e2f25]",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "w-9 rounded-md text-[0.8rem] font-medium text-[#7a6658]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 p-0 text-center text-sm relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-[#f2e4d4]/50 [&:has([aria-selected])]:bg-[#f2e4d4] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 rounded-md p-0 font-medium text-[#4f3f33] aria-selected:opacity-100 hover:bg-[#f4e8d9] hover:text-[#3e2f25]",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#7b1e2b] text-white hover:bg-[#6a1824] hover:text-white focus:bg-[#7b1e2b] focus:text-white",
        day_today: "bg-[#efe0ce] text-[#4f3f33]",
        day_outside:
          "day-outside text-[#a19083] opacity-60 aria-selected:bg-[#f2e4d4]/60 aria-selected:text-[#8a796c] aria-selected:opacity-50",
        day_disabled: "text-[#b9aa9e] opacity-60",
        day_range_middle: "aria-selected:bg-[#f2e4d4] aria-selected:text-[#4f3f33]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
