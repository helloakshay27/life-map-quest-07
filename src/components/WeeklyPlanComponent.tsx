import { useState, useEffect } from "react";
import {
  Target,
  Info,
  Calendar,
  Plus,
  ChevronDown,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { startOfWeek, addDays, format } from "date-fns";

// --- CONFIGURATION & COLORS FOR EACH DAY ---
// Mapped exactly to your Semantic & Dashboard Tertiary colors from the palette image
const dayTheme: Record<string, any> = {
  Sun: {
    text: "text-[#DA7756]", // Coral
    border: "border-[#DA7756]/30",
    bg: "bg-[#DA7756]/[0.08]",
    dashed: "border-[#DA7756]/40",
  },
  Mon: {
    text: "text-[#534AB7]", // Violet
    border: "border-[#534AB7]/30",
    bg: "bg-[#534AB7]/[0.08]",
    dashed: "border-[#534AB7]/40",
  },
  Tue: {
    text: "text-[#1858A5]", // Sky
    border: "border-[#1858A5]/30",
    bg: "bg-[#1858A5]/[0.08]",
    dashed: "border-[#1858A5]/40",
  },
  Wed: {
    text: "text-[#BA7517]", // Amber
    border: "border-[#BA7517]/30",
    bg: "bg-[#BA7517]/[0.08]",
    dashed: "border-[#BA7517]/40",
  },
  Thu: {
    text: "text-[#0B5D41]", // Forest
    border: "border-[#0B5D41]/30",
    bg: "bg-[#0B5D41]/[0.08]",
    dashed: "border-[#0B5D41]/40",
  },
  Fri: {
    text: "text-[#A32D2D]", // Crimson
    border: "border-[#A32D2D]/30",
    bg: "bg-[#A32D2D]/[0.08]",
    dashed: "border-[#A32D2D]/40",
  },
  Sat: {
    text: "text-[#3B6D11]", // Leaf
    border: "border-[#3B6D11]/30",
    bg: "bg-[#3B6D11]/[0.08]",
    dashed: "border-[#3B6D11]/40",
  },
};

// --- DYNAMIC WEEK GENERATOR ---
export const generateEmptyWeekData = (baseDate = new Date()) => {
  const start = startOfWeek(baseDate, { weekStartsOn: 0 });
  const end = addDays(start, 6);

  const title = `Plan for ${format(start, "MMM d")} - ${format(end, "MMM d")}`;

  const defaultThemes = [
    "Theme (e.g., Relax & Create)",
    "Theme (e.g., Review Day)",
    "Theme (e.g., Sales & Marketing)",
    "Theme (e.g., HR & Finance)",
    "Theme (e.g., Learning)",
    "Theme (e.g., Admin)",
    "Theme (e.g., Creation)",
  ];

  const days = Array.from({ length: 7 }).map((_, index) => {
    const currentDate = addDays(start, index);
    const dayStr = format(currentDate, "EEE");
    return {
      id: dayStr.toLowerCase(),
      day: dayStr,
      date: format(currentDate, "d MMM"),
      theme: "",
      defaultTheme: defaultThemes[index],
      priorities: [],
    };
  });

  return { title, days };
};

// --- Calendar type ---
interface UserCalendar {
  id: number;
  user_id: number;
  name: string;
  embed_url: string;
  created_at: string;
  updated_at: string;
}

// ─── CalendarSection ────────────────────────────────────────────────────────
function CalendarSection() {
  const [calendars, setCalendars] = useState<UserCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCalendarId, setActiveCalendarId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCalendars = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch("https://life-api.lockated.com/user_calendars", {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (res.ok) {
          const data = await res.json();
          const parsedCalendars = Array.isArray(data)
            ? data
            : data.data || data.calendars || [];
          setCalendars(parsedCalendars);
          if (parsedCalendars.length > 0) {
            setActiveCalendarId(parsedCalendars[0].id);
          }
        } else {
          console.error("Failed to fetch calendars");
        }
      } catch (error) {
        console.error("Error fetching calendars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendars();
  }, []);

  const activeCalendar = calendars.find((c) => c.id === activeCalendarId) ?? null;

  if (loading) {
    return (
      <div className="border border-dashed border-[#D6B99D] bg-[#FEF4EE] rounded-xl p-8 flex flex-col items-center justify-center mb-10 gap-3">
        <Loader2 className="w-8 h-8 text-[#DA7756] animate-spin" strokeWidth={1.5} />
        <p className="text-[13px] text-[#888780] font-medium">Loading your calendar...</p>
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <div className="border border-dashed border-[#D6B99D] bg-[#FEF4EE] rounded-xl p-8 flex flex-col items-center justify-center mb-10 gap-2">
        <Calendar className="text-[#DA7756] w-10 h-10 mb-2" strokeWidth={1.5} />
        <p className="text-[14px] font-semibold text-[#2C2C2A]">No calendars configured</p>
        <p className="text-[13px] text-[#888780]">Add calendars in the Calendar page</p>
      </div>
    );
  }

  return (
    <div className="mb-10">
      {calendars.length > 1 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {calendars.map((cal) => (
            <button
              key={cal.id}
              onClick={() => setActiveCalendarId(cal.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-all ${
                activeCalendarId === cal.id
                  ? "bg-white border-[#DA7756] text-[#2C2C2A] shadow-sm"
                  : "bg-transparent border-[#D6B99D] text-[#888780] hover:text-[#2C2C2A] hover:border-[#DA7756]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {cal.name}
            </button>
          ))}
        </div>
      )}

      {activeCalendar && (
        <div className="rounded-xl border border-[#D6B99D] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#D6B99D] bg-[#FEF4EE]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#DA7756] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-[14px] font-bold text-[#2C2C2A]">
                {activeCalendar.name}
              </span>
            </div>
            <a
              href={activeCalendar.embed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[12px] text-[#DA7756] hover:text-[#C26547] font-semibold transition-colors"
            >
              Open <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="w-full" style={{ height: 420 }}>
            <iframe
              src={activeCalendar.embed_url}
              title={activeCalendar.name}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              className="block"
              style={{ border: "none" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main WeeklyPlanComponent ────────────────────────────────────────────────
interface WeeklyPlanComponentProps {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

export default function WeeklyPlanComponent({
  data,
  setData,
}: WeeklyPlanComponentProps) {
  const handleThemeChange = (dayId: string, newTheme: string) => {
    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) =>
        d.id === dayId ? { ...d, theme: newTheme } : d,
      ),
    }));
  };

  const handlePriorityTextChange = (
    dayId: string,
    priorityId: number,
    newText: string,
  ) => {
    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) => {
        if (d.id === dayId) {
          return {
            ...d,
            priorities: d.priorities.map((p: any) =>
              p.id === priorityId ? { ...p, text: newText } : p,
            ),
          };
        }
        return d;
      }),
    }));
  };

  const addPriority = (dayId: string) => {
    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) => {
        if (d.id === dayId) {
          return {
            ...d,
            priorities: [
              ...d.priorities,
              {
                id: Date.now(),
                dayAssign: d.day,
                category: "📌 New Category",
                quadrant: "Q2: Important, Not Urgent",
                text: "",
              },
            ],
          };
        }
        return d;
      }),
    }));
  };

  return (
    <div className="w-full font-sans bg-[#FEF4EE]">

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#D6B99D] bg-[#FEF4EE]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#DA7756] shadow-sm shrink-0">
            <Target className="text-white w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-bold text-[#2C2C2A]">{data.title}</h2>
            <span className="relative group">
              <Info className="w-4 h-4 text-[#DA7756] cursor-help" />
              <span className="absolute left-0 top-full mt-2 bg-[#2C2C2A] text-white text-xs font-medium rounded-lg px-3 py-2 w-[480px] text-center leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                Set strategic priorities for the upcoming week. Assign each task
                to a specific day and life area. Use the calendar buttons to add
                tasks to Google Calendar.
                <span className="absolute left-3 bottom-full w-0 h-0 border-4 border-transparent border-b-[#2C2C2A]" />
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-white">
        {/* CALENDAR SECTION */}
        <CalendarSection />

        {/* DAILY PLAN LIST */}
        <div className="space-y-6">
          {data.days.map((dayObj: any) => {
            const themeColor = dayTheme[dayObj.day];
            const hasPriorities = dayObj.priorities.length > 0;

            return (
              <div key={dayObj.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-3">
                  <span className={`w-28 text-right font-bold text-[15px] ${themeColor.text}`}>
                    {dayObj.day} ({dayObj.date})
                  </span>

                  <input
                    type="text"
                    value={dayObj.theme}
                    onChange={(e) => handleThemeChange(dayObj.id, e.target.value)}
                    placeholder={dayObj.defaultTheme}
                    className={`w-64 px-4 py-2 text-[14px] rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#DA7756]/30 transition-all placeholder:text-[#888780] text-[#2C2C2A] ${themeColor.border}`}
                  />

                  <button
                    onClick={() => addPriority(dayObj.id)}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border bg-white hover:bg-[#FEF4EE] transition-colors ${themeColor.border}`}
                  >
                    <Plus className={`w-5 h-5 ${themeColor.text}`} />
                  </button>
                </div>

                <div className="flex justify-center">
                  {!hasPriorities ? (
                    <div
                      className={`w-full border-2 border-dashed rounded-xl py-4 text-center text-[13px] font-medium ${themeColor.dashed} ${themeColor.text} ${themeColor.bg}`}
                    >
                      No priorities for this day yet. Click + above to add one.
                    </div>
                  ) : (
                    <div className={`w-full border rounded-xl p-4 ${themeColor.border} ${themeColor.bg}`}>
                      {dayObj.priorities.map((priority: any) => (
                        <div key={priority.id} className="flex flex-col gap-3 mt-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center gap-1 bg-white border rounded-lg px-3 py-1.5 text-[13px] font-medium ${themeColor.border} ${themeColor.text} cursor-pointer`}
                            >
                              {priority.dayAssign}
                              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                            </div>
                            <div
                              className={`flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 text-[13px] font-medium ${themeColor.border} text-[#2C2C2A] cursor-pointer`}
                            >
                              {priority.category}
                              <ChevronDown className="w-3.5 h-3.5 text-[#888780]" />
                            </div>
                            <div
                              className={`flex items-center gap-1 bg-white border rounded-lg px-3 py-1.5 text-[13px] font-bold ${themeColor.border} text-[#DA7756] cursor-pointer`}
                            >
                              {priority.quadrant}
                              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                            </div>
                          </div>
                          <input
                            type="text"
                            value={priority.text}
                            onChange={(e) =>
                              handlePriorityTextChange(dayObj.id, priority.id, e.target.value)
                            }
                            placeholder="Priority details..."
                            className={`w-full px-4 py-2.5 text-[14px] rounded-xl border bg-white focus:outline-none focus:ring-1 focus:ring-[#DA7756]/30 placeholder:text-[#888780] text-[#2C2C2A] transition-all ${themeColor.border}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}