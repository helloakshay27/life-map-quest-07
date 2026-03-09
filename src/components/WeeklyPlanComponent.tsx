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
const dayTheme: Record<string, any> = {
  Sun: { text: "text-purple-600", border: "border-purple-300", bg: "bg-purple-50", dashed: "border-purple-300" },
  Mon: { text: "text-blue-500", border: "border-blue-300", bg: "bg-blue-50", dashed: "border-blue-300" },
  Tue: { text: "text-green-500", border: "border-green-300", bg: "bg-green-50", dashed: "border-green-300" },
  Wed: { text: "text-yellow-600", border: "border-yellow-300", bg: "bg-yellow-50", dashed: "border-yellow-300" },
  Thu: { text: "text-red-500", border: "border-red-300", bg: "bg-red-50", dashed: "border-red-300" },
  Fri: { text: "text-pink-600", border: "border-pink-300", bg: "bg-pink-50", dashed: "border-pink-300" },
  Sat: { text: "text-indigo-600", border: "border-indigo-300", bg: "bg-indigo-50", dashed: "border-indigo-300" },
};

// --- DYNAMIC WEEK GENERATOR (REPLACED MOCK DATA) ---
const generateEmptyWeekData = (baseDate = new Date()) => {
  const start = startOfWeek(baseDate, { weekStartsOn: 0 }); // Week starts on Sunday
  const end = addDays(start, 6);
  
  const title = `Plan for ${format(start, "MMM d")} - ${format(end, "MMM d")}`;
  
  const defaultThemes = [
    "Theme (e.g., Relax & Create)",
    "Theme (e.g., Review Day)",
    "Theme (e.g., Sales & Marketing)",
    "Theme (e.g., HR & Finance)",
    "Theme (e.g., Learning)",
    "Theme (e.g., Admin)",
    "Theme (e.g., Creation)"
  ];

  const days = Array.from({ length: 7 }).map((_, index) => {
    const currentDate = addDays(start, index);
    const dayStr = format(currentDate, "EEE"); // "Sun", "Mon", etc.
    return {
      id: dayStr.toLowerCase(),
      day: dayStr,
      date: format(currentDate, "d MMM"), // Dynamically sets "1 Mar", "2 Mar" based on real calendar
      theme: "",
      defaultTheme: defaultThemes[index],
      priorities: [], // Fresh empty array
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
          const parsedCalendars = Array.isArray(data) ? data : (data.data || data.calendars || []);
          
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
      <div className="border border-dashed border-gray-200 bg-[#fefdfc] rounded-xl p-8 flex flex-col items-center justify-center mb-10 max-w-4xl mx-auto gap-3">
        <Loader2 className="w-8 h-8 text-gray-300 animate-spin" strokeWidth={1.5} />
        <p className="text-[13px] text-gray-400 font-medium">Loading your calendar...</p>
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <div className="border border-dashed border-gray-200 bg-[#fefdfc] rounded-xl p-8 flex flex-col items-center justify-center mb-10 max-w-4xl mx-auto gap-2">
        <Calendar className="text-gray-200 w-10 h-10 mb-2" strokeWidth={1.5} />
        <p className="text-[14px] font-semibold text-gray-600">No calendars configured</p>
        <p className="text-[13px] text-gray-500">Add calendars in the Calendar page</p>
      </div>
    );
  }

  return (
    <div className="mb-10 max-w-4xl mx-auto">
      {calendars.length > 1 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {calendars.map((cal) => (
            <button
              key={cal.id}
              onClick={() => setActiveCalendarId(cal.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-all ${
                activeCalendarId === cal.id
                  ? "bg-white border-gray-300 text-gray-900 shadow-sm"
                  : "bg-transparent border-gray-200 text-gray-400 hover:text-gray-700"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {cal.name}
            </button>
          ))}
        </div>
      )}

      {activeCalendar && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-[14px] font-bold text-gray-800">
                {activeCalendar.name}
              </span>
            </div>
            <a
              href={activeCalendar.embed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[12px] text-blue-500 hover:text-blue-700 font-semibold transition-colors"
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
  initialData?: any;
}

export default function WeeklyPlanComponent({ initialData }: WeeklyPlanComponentProps) {
  // If no existing data is passed down from the parent, generate fresh data for this week!
  const [data, setData] = useState(initialData || generateEmptyWeekData());

  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);

  const handleThemeChange = (dayId: string, newTheme: string) => {
    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) => (d.id === dayId ? { ...d, theme: newTheme } : d)),
    }));
  };

  const handlePriorityTextChange = (dayId: string, priorityId: number, newText: string) => {
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
    <div className="w-full max-w-5xl mx-auto p-6 md:p-8 font-sans bg-[#fcfaf9] min-h-screen border border-red-50 rounded-xl shadow-sm">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 shadow-sm">
          <Target className="text-white w-5 h-5" strokeWidth={2.5} />
        </div>
        <h2 className="text-[22px] font-bold text-gray-900">{data.title}</h2>
        <Info className="w-4 h-4 text-gray-400 cursor-help" />
      </div>

      {/* CALENDAR SECTION */}
      <CalendarSection />

      {/* DAILY PLAN LIST */}
      <div className="space-y-6 max-w-4xl mx-auto">
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
                  className={`w-64 px-4 py-2 text-[14px] rounded-lg border bg-white focus:outline-none focus:ring-1 transition-all ${themeColor.border} placeholder:text-gray-400`}
                />

                <button
                  onClick={() => addPriority(dayObj.id)}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg border bg-white hover:bg-gray-50 transition-colors ${themeColor.border}`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center">
                {!hasPriorities ? (
                  <div className={`w-full border-2 border-dashed rounded-xl py-4 text-center text-[13px] font-medium ${themeColor.dashed} ${themeColor.text} ${themeColor.bg} bg-opacity-40`}>
                    No priorities for this day yet. Click + above to add one.
                  </div>
                ) : (
                  <div className={`w-full border rounded-xl p-4 ${themeColor.border} ${themeColor.bg}`}>
                    {dayObj.priorities.map((priority: any) => (
                      <div key={priority.id} className="flex flex-col gap-3 mt-2">
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 bg-white border rounded px-3 py-1.5 text-[13px] font-medium ${themeColor.border} ${themeColor.text} cursor-pointer`}>
                            {priority.dayAssign} <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                          </div>
                          <div className={`flex items-center gap-2 bg-white border rounded px-3 py-1.5 text-[13px] font-medium ${themeColor.border} text-gray-700 cursor-pointer`}>
                            {priority.category} <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <div className={`flex items-center gap-1 bg-white border rounded px-3 py-1.5 text-[13px] font-bold ${themeColor.border} text-[#00a67e] cursor-pointer`}>
                            {priority.quadrant} <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                          </div>
                        </div>
                        <input
                          type="text"
                          value={priority.text}
                          onChange={(e) => handlePriorityTextChange(dayObj.id, priority.id, e.target.value)}
                          placeholder="Priority details..."
                          className={`w-full px-4 py-2.5 text-[14px] rounded border bg-white focus:outline-none focus:ring-1 ${themeColor.border}`}
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
  );
}