import { useState, useEffect, useMemo } from "react";
import {
  Target,
  Info,
  Calendar,
  Plus,
  ChevronDown,
  Loader2,
  ExternalLink,
  X,
  GripVertical,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import { startOfWeek, addDays, format } from "date-fns";

// --- BASE URL ---
const BASE_URL = "https://life-api.lockated.com";

// --- CONFIGURATION & COLORS FOR EACH DAY ---
const dayTheme: Record<string, any> = {
  Sun: {
    text: "text-[#DA7756]",
    border: "border-[#DA7756]/30",
    bg: "bg-[#DA7756]/[0.08]",
    dashed: "border-[#DA7756]/40",
    solid: "#DA7756",
  },
  Mon: {
    text: "text-[#534AB7]",
    border: "border-[#534AB7]/30",
    bg: "bg-[#534AB7]/[0.08]",
    dashed: "border-[#534AB7]/40",
    solid: "#534AB7",
  },
  Tue: {
    text: "text-[#1858A5]",
    border: "border-[#1858A5]/30",
    bg: "bg-[#1858A5]/[0.08]",
    dashed: "border-[#1858A5]/40",
    solid: "#1858A5",
  },
  Wed: {
    text: "text-[#BA7517]",
    border: "border-[#BA7517]/30",
    bg: "bg-[#BA7517]/[0.08]",
    dashed: "border-[#BA7517]/40",
    solid: "#BA7517",
  },
  Thu: {
    text: "text-[#0B5D41]",
    border: "border-[#0B5D41]/30",
    bg: "bg-[#0B5D41]/[0.08]",
    dashed: "border-[#0B5D41]/40",
    solid: "#0B5D41",
  },
  Fri: {
    text: "text-[#A32D2D]",
    border: "border-[#A32D2D]/30",
    bg: "bg-[#A32D2D]/[0.08]",
    dashed: "border-[#A32D2D]/40",
    solid: "#A32D2D",
  },
  Sat: {
    text: "text-[#3B6D11]",
    border: "border-[#3B6D11]/30",
    bg: "bg-[#3B6D11]/[0.08]",
    dashed: "border-[#3B6D11]/40",
    solid: "#3B6D11",
  },
};

const CATEGORY_OPTIONS = [
  { value: "Career", label: "\uD83D\uDCBC Career" },
  { value: "Health", label: "\uD83D\uDCAA Health" },
  { value: "Relationships", label: "\uD83D\uDC96 Relationships" },
  { value: "Personal Growth", label: "\uD83C\uDF31 Personal Growth" },
  { value: "Finance", label: "\uD83D\uDCB0 Finance" },
];

const getCategoryLabel = (category?: string) =>
  CATEGORY_OPTIONS.find((option) => option.value === category)?.label ??
  CATEGORY_OPTIONS.find(
    (option) => option.value.toLowerCase() === category?.toLowerCase(),
  )?.label ??
  (category || "Career");

const CATEGORY_NAME_BY_ID: Record<number, string> = {
  1: "Career",
  2: "Health",
  3: "Career",
  4: "Personal Growth",
  5: "Finance",
};

const getTodoCategoryValue = (todo: any) => {
  const areaFromId = CATEGORY_NAME_BY_ID[Number(todo.life_area_id)];
  if (areaFromId) return areaFromId;

  const rawLifeArea = (todo.life_area || todo.category || "").toLowerCase().trim();
  return (
    CATEGORY_OPTIONS.find((opt) => opt.value.toLowerCase() === rawLifeArea)?.value ??
    CATEGORY_OPTIONS.find(
      (opt) =>
        opt.value.toLowerCase().includes(rawLifeArea) ||
        rawLifeArea.includes(opt.value.toLowerCase()),
    )?.value ??
    "Career"
  );
};

const QUADRANT_OPTIONS = [
  { value: "Q1 - Urgent & Important", label: "🔴 Q1 - Urgent & Important" },
  { value: "Q2 - Important, Not Urgent", label: "🟢 Q2 - Important, Not Urgent" },
  { value: "Q3 - Urgent, Not Important", label: "🟡 Q3 - Urgent, Not Important" },
  { value: "Q4 - Not Urgent or Important", label: "🔵 Q4 - Not Urgent or Important" },
];

const DEFAULT_QUADRANT = "Q2 - Important, Not Urgent";

const normalizeQuadrantValue = (quadrant?: string) => {
  const clean = String(quadrant || "").trim();
  const matched = QUADRANT_OPTIONS.find(
    (option) =>
      option.value === clean ||
      option.value.replace(" - ", ": ") === clean ||
      clean.startsWith(option.value.slice(0, 2)),
  );
  return matched?.value ?? DEFAULT_QUADRANT;
};

const getPriorityDescription = (priority: any) =>
  String(priority?.description ?? priority?.text ?? "").trim();

const getPriorityLifeArea = (priority: any) =>
  CATEGORY_OPTIONS.some((option) => option.value === priority?.life_area)
    ? priority.life_area
    : CATEGORY_OPTIONS.some((option) => option.value === priority?.category)
      ? priority.category
      : "Career";

const getPriorityPlannedFor = (priority: any, fallbackDate: string) =>
  String(priority?.planned_for || fallbackDate);

const getPlanWeekDateByDay = (baseDate?: Date) => {
  if (!baseDate) return {};
  const start = addDays(startOfWeek(baseDate, { weekStartsOn: 0 }), 7);
  return Array.from({ length: 7 }).reduce<Record<string, string>>((dates, _, index) => {
    const date = addDays(start, index);
    dates[format(date, "EEE").toLowerCase()] = format(date, "yyyy-MM-dd");
    return dates;
  }, {});
};

export const normalizeWeeklyPlanPayload = (weeklyPlanData: any, baseDate?: Date) => {
  const days = Array.isArray(weeklyPlanData?.days) ? weeklyPlanData.days : [];
  const plannedForByDay = getPlanWeekDateByDay(baseDate);
  return {
    ...weeklyPlanData,
    days: days.map((day: any) => ({
      ...day,
      planned_for: day?.planned_for || plannedForByDay[String(day?.id || "").toLowerCase()] || "",
      priorities: Array.isArray(day?.priorities)
        ? day.priorities
            .map((priority: any) => ({
              description: getPriorityDescription(priority),
              life_area: getPriorityLifeArea(priority),
              quadrant: normalizeQuadrantValue(priority?.quadrant),
              dayAssign: priority?.dayAssign || day?.day || "",
              planned_for: getPriorityPlannedFor(
                priority,
                day?.planned_for || plannedForByDay[String(day?.id || "").toLowerCase()] || "",
              ),
            }))
            .filter((priority: any) => priority.description)
        : [],
    })),
  };
};

// Drag type constants
const DRAG_TYPE_PRIORITY = "priority";
const DRAG_TYPE_TODO = "todo";

const isInteractiveDragTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  Boolean(target.closest("input, select, textarea, button, a"));

const normalizeWeekday = (value: string) => String(value || "").trim().slice(0, 3).toLowerCase();

const todoMatchesAnyDate = (todo: Todo, dates: Date[]) => {
  if (!todo?.recurring) return true;
  const recurrenceDays = Array.isArray(todo.recurrence_days)
    ? todo.recurrence_days
    : Array.isArray(todo.recurringDays)
      ? todo.recurringDays
      : [];
  if (recurrenceDays.length === 0) return true;
  const allowedDays = new Set(recurrenceDays.map((day: string) => normalizeWeekday(day)));
  return dates.some((date) => allowedDays.has(normalizeWeekday(format(date, "EEE"))));
};

// --- DYNAMIC WEEK GENERATOR ---
export const generateEmptyWeekData = (baseDate = new Date()) => {
  const start = addDays(startOfWeek(baseDate, { weekStartsOn: 0 }), 7);
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
      planned_for: format(currentDate, "yyyy-MM-dd"),
      theme: "",
      defaultTheme: defaultThemes[index],
      priorities: [],
    };
  });

  return { title, days };
};

// --- Types ---
interface UserCalendar {
  id: number;
  user_id: number;
  name: string;
  embed_url: string;
  created_at: string;
  updated_at: string;
}

interface Todo {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  life_area?: string;
  life_area_id?: number;
  priority?: string;
  status?: string;
  target_date?: string | null;
  goal_id?: number | null;
  goal_title?: string | null;
  recurring?: boolean;
  recurrence_pattern?: string | null;
  [key: string]: any;
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
        const res = await fetch(`${BASE_URL}/user_calendars`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (res.ok) {
          const data = await res.json();
          const parsed = Array.isArray(data) ? data : data.data || data.calendars || [];
          setCalendars(parsed);
          if (parsed.length > 0) setActiveCalendarId(parsed[0].id);
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
      <div className="border border-dashed border-[#D6B99D] bg-[#FEF4EE] rounded-xl p-8 flex flex-col items-center justify-center mb-6 gap-3">
        <Loader2 className="w-8 h-8 text-[#DA7756] animate-spin" strokeWidth={1.5} />
        <p className="text-[13px] text-[#888780] font-medium">Loading your calendar...</p>
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <div className="border border-dashed border-[#D6B99D] bg-[#FEF4EE] rounded-xl p-8 flex flex-col items-center justify-center mb-6 gap-2">
        <Calendar className="text-[#DA7756] w-10 h-10 mb-2" strokeWidth={1.5} />
        <p className="text-[14px] font-semibold text-[#2C2C2A]">No calendars configured</p>
        <p className="text-[13px] text-[#888780]">Add calendars in the Calendar page</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
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
              <span className="text-[14px] font-bold text-[#2C2C2A]">{activeCalendar.name}</span>
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

// ─── TodosSection ────────────────────────────────────────────────────────────
interface TodosSectionProps {
  todos: Todo[];
  loadingTodos: boolean;
  todosError: string | null;
  onTodoDragStart: (e: React.DragEvent<HTMLDivElement>, todo: Todo) => void;
}

function TodosSection({
  todos,
  loadingTodos,
  todosError,
  onTodoDragStart,
}: TodosSectionProps) {

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#534AB7] flex items-center justify-center shrink-0">
          <CheckSquare className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <h3 className="text-[15px] font-bold text-[#2C2C2A]">Your Todos</h3>
        <span className="text-[12px] text-[#888780] font-medium ml-1">
          — drag any todo onto a day to add it as a priority
        </span>
        {!loadingTodos && !todosError && (
          <span className="ml-auto text-[12px] font-semibold text-[#888780]">
            {todos.length} todo{todos.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Loading */}
      {loadingTodos && (
        <div className="border border-dashed border-[#C5BFF5] bg-[#F4F3FE] rounded-xl p-6 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-[#534AB7] animate-spin" strokeWidth={1.5} />
          <p className="text-[13px] text-[#888780] font-medium">Loading todos...</p>
        </div>
      )}

      {/* Error */}
      {!loadingTodos && todosError && (
        <div className="border border-dashed border-[#F5C5C5] bg-[#FEF4F4] rounded-xl p-6 flex items-center justify-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#A32D2D]" strokeWidth={1.5} />
          <p className="text-[13px] text-[#A32D2D] font-medium">{todosError}</p>
        </div>
      )}

      {/* Empty */}
      {!loadingTodos && !todosError && todos.length === 0 && (
        <div className="border border-dashed border-[#C5BFF5] bg-[#F4F3FE] rounded-xl p-6 flex flex-col items-center justify-center gap-2">
          <CheckSquare className="w-8 h-8 text-[#534AB7]" strokeWidth={1.5} />
          <p className="text-[13px] text-[#888780] font-medium">No todos found</p>
        </div>
      )}

      {/* Todo Grid */}
      {!loadingTodos && !todosError && todos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {todos.map((todo) => {
            const todoTitle = todo.title || todo.name || `Todo #${todo.id}`;
            return (
              <div
                key={todo.id}
                draggable
                onDragStart={(e) => onTodoDragStart(e, todo)}
                title="Drag to a day below"
                className="flex flex-col rounded-xl border px-3 py-2.5 text-[13px] select-none transition-all border-[#C5BFF5] bg-[#F4F3FE] text-[#2C2C2A] cursor-grab active:cursor-grabbing hover:border-[#534AB7]/50 hover:shadow-sm hover:scale-[1.01]"
              >
                <p className="font-semibold leading-snug truncate">{todoTitle}</p>
                {(todo.life_area || todo.life_area_id || todo.category) && (
                  <p className="text-[11px] text-[#534AB7] mt-0.5 font-medium">
                    {getCategoryLabel(getTodoCategoryValue(todo))}
                  </p>
                )}
                {todo.target_date && (
                  <p className="text-[11px] text-[#888780] mt-0.5">Due: {todo.target_date}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main WeeklyPlanComponent ────────────────────────────────────────────────
interface WeeklyPlanComponentProps {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  currentDate?: Date;
}

export default function WeeklyPlanComponent({
  data,
  setData,
  currentDate = new Date(),
}: WeeklyPlanComponentProps) {
  // Priority drag state
  const [draggedPriority, setDraggedPriority] = useState<{
    dayId: string;
    priorityId: number;
  } | null>(null);

  // Todo drag state
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);

  // Drop highlight state
  const [dropTargetDayId, setDropTargetDayId] = useState<string | null>(null);

  // Todos state
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [todosError, setTodosError] = useState<string | null>(null);
  const planWeekDates = useMemo(() => {
    const start = addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 7);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [currentDate]);

  useEffect(() => {
    if (!Array.isArray(data?.days)) return;
    let changed = false;
    const nextDays = data.days.map((day: any, dayIndex: number) => {
      const plannedFor = day.planned_for || (planWeekDates[dayIndex] ? format(planWeekDates[dayIndex], "yyyy-MM-dd") : "");
      const priorities = Array.isArray(day.priorities)
        ? day.priorities.map((priority: any, priorityIndex: number) => {
            if (priority.id && priority.planned_for) return priority;
            changed = true;
            return {
              id: priority.id || Date.now() + dayIndex * 100 + priorityIndex,
              ...priority,
              planned_for: priority.planned_for || plannedFor,
            };
          })
        : [];
      if (day.planned_for) return { ...day, priorities };
      changed = true;
      return { ...day, planned_for: plannedFor, priorities };
    });
    if (changed) setData((prev: any) => ({ ...prev, days: nextDays }));
  }, [data?.days, planWeekDates, setData]);



  // Fetch todos
  useEffect(() => {
    const fetchTodos = async () => {
      setLoadingTodos(true);
      setTodosError(null);
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${BASE_URL}/todos`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch todos (${res.status})`);
        const responseData = await res.json();
        const all: Todo[] = Array.isArray(responseData)
          ? responseData
          : responseData.data || responseData.todos || [];
        const parsed = all.filter((t) =>
          ["not_started", "in_progress"].includes((t.status || "").toLowerCase()) &&
          todoMatchesAnyDate(t, planWeekDates),
        );
        setTodos(parsed);
      } catch (err: any) {
        setTodosError(err.message || "Could not load todos");
      } finally {
        setLoadingTodos(false);
      }
    };
    fetchTodos();
  }, [planWeekDates]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleThemeChange = (dayId: string, newTheme: string) => {
    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) =>
        d.id === dayId ? { ...d, theme: newTheme } : d,
      ),
    }));
  };

  const handlePriorityTextChange = (dayId: string, priorityId: number, newText: string) => {
    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) =>
        d.id === dayId
          ? { ...d, priorities: d.priorities.map((p: any) => p.id === priorityId ? { ...p, description: newText } : p) }
          : d,
      ),
    }));
  };

  const handlePriorityFieldChange = (
    dayId: string,
    priorityId: number,
    field: "life_area" | "quadrant",
    value: string,
  ) => {
    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) =>
        d.id !== dayId ? d : {
          ...d,
          priorities: d.priorities.map((p: any) =>
            p.id === priorityId ? { ...p, [field]: value } : p,
          ),
        },
      ),
    }));
  };

  const removePriority = (dayId: string, priorityId: number) => {
    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) =>
        d.id === dayId
          ? { ...d, priorities: d.priorities.filter((p: any) => p.id !== priorityId) }
          : d,
      ),
    }));
  };

  const addPriority = (dayId: string) => {
    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) =>
        d.id === dayId
          ? {
              ...d,
              priorities: [
                ...d.priorities,
                {
                  id: Date.now(),
                  description: "",
                  life_area: "Career",
                  quadrant: DEFAULT_QUADRANT,
                  dayAssign: d.day,
                  planned_for: d.planned_for,
                },
              ],
            }
          : d,
      ),
    }));
  };

  // ── Priority drag-and-drop ─────────────────────────────────────────────────

  const handlePriorityDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    dayId: string,
    priorityId: number,
  ) => {
    if (isInteractiveDragTarget(event.target)) {
      event.preventDefault();
      return;
    }
    setDraggedPriority({ dayId, priorityId });
    setDraggedTodo(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("dragType", DRAG_TYPE_PRIORITY);
    event.dataTransfer.setData("text/plain", `${dayId}:${priorityId}`);
  };

  const movePriority = (targetDayId: string, targetIndex?: number) => {
    if (!draggedPriority) return;
    setData((prev: any) => {
      const sourceDay = prev.days.find((d: any) => d.id === draggedPriority.dayId);
      const movingPriority = sourceDay?.priorities.find((p: any) => p.id === draggedPriority.priorityId);
      if (!movingPriority) return prev;
      const targetDay = prev.days.find((d: any) => d.id === targetDayId);
      const nextPlannedFor = targetDay?.planned_for ?? movingPriority.planned_for;
      const nextDayAssign = targetDay?.day ?? movingPriority.dayAssign;
      return {
        ...prev,
        days: prev.days.map((d: any) => {
          const withoutDragged = d.priorities.filter((p: any) => p.id !== draggedPriority.priorityId);
          if (d.id !== targetDayId) return { ...d, priorities: withoutDragged };
          const insertAt = typeof targetIndex === "number"
            ? Math.min(Math.max(targetIndex, 0), withoutDragged.length)
            : withoutDragged.length;
          const nextPriorities = [...withoutDragged];
          nextPriorities.splice(insertAt, 0, { ...movingPriority, dayAssign: nextDayAssign, planned_for: nextPlannedFor });
          return { ...d, priorities: nextPriorities };
        }),
      };
    });
    setDraggedPriority(null);
  };

  // ── Todo drag-and-drop ─────────────────────────────────────────────────────

  const handleTodoDragStart = (e: React.DragEvent<HTMLDivElement>, todo: Todo) => {
    setDraggedTodo(todo);
    setDraggedPriority(null);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("dragType", DRAG_TYPE_TODO);
    e.dataTransfer.setData("text/plain", String(todo.id));
  };

  const dropTodoOnDay = (targetDayId: string, targetIndex?: number) => {
    if (!draggedTodo) return;
    const targetDay = data.days.find((d: any) => d.id === targetDayId);
    if (!targetDay) return;

    const todoTitle = draggedTodo.title || draggedTodo.name || `Todo #${draggedTodo.id}`;

    // Map todo's life area to a CATEGORY_OPTIONS value.
    const todoCategory = getTodoCategoryValue(draggedTodo);

    const newPriority = {
      id: Date.now(),
      description: todoTitle,
      life_area: todoCategory,
      quadrant: DEFAULT_QUADRANT,
      dayAssign: targetDay.day,
      planned_for: targetDay.planned_for,
      todoId: draggedTodo.id, // link back to source todo
    };

    setData((prev: any) => ({
      ...prev,
      days: prev.days.map((d: any) => {
        if (d.id !== targetDayId) return d;
        const nextPriorities = [...d.priorities];
        const insertAt = typeof targetIndex === "number"
          ? Math.min(Math.max(targetIndex, 0), nextPriorities.length)
          : nextPriorities.length;
        nextPriorities.splice(insertAt, 0, newPriority);
        return { ...d, priorities: nextPriorities };
      }),
    }));

    setDraggedTodo(null);
    setDropTargetDayId(null);
  };

  // ── Unified drop handler ──────────────────────────────────────────────────

  const handleDayDrop = (
    e: React.DragEvent,
    targetDayId: string,
    targetIndex?: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const dragType = e.dataTransfer.getData("dragType");
    setDropTargetDayId(null);

    if (dragType === DRAG_TYPE_TODO && draggedTodo) {
      dropTodoOnDay(targetDayId, targetIndex);
    } else if (dragType === DRAG_TYPE_PRIORITY && draggedPriority) {
      movePriority(targetDayId, targetIndex);
    }
  };

  const handleDayDragOver = (e: React.DragEvent, dayId: string) => {
    e.preventDefault();
    setDropTargetDayId(dayId);
  };

  const handleDayDragLeave = () => {
    setDropTargetDayId(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

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
                Set strategic priorities for the upcoming week. Drag todos from
                the panel below directly onto a day to convert them into priorities.
                <span className="absolute left-3 bottom-full w-0 h-0 border-4 border-transparent border-b-[#2C2C2A]" />
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-white">
        {/* CALENDAR SECTION */}
        <CalendarSection />

        {/* TODOS SECTION */}
        <TodosSection
          todos={todos}
          loadingTodos={loadingTodos}
          todosError={todosError}
          onTodoDragStart={handleTodoDragStart}
        />

        {/* DIVIDER */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-[#D6B99D]/60" />
          <span className="text-[12px] font-semibold text-[#888780] tracking-wide uppercase">
            Weekly Plan
          </span>
          <div className="flex-1 h-px bg-[#D6B99D]/60" />
        </div>

        {/* DAILY PLAN — 7-COLUMN KANBAN */}
        <div className="overflow-x-auto -mx-6 md:-mx-8 px-6 md:px-8">
          <div className="flex gap-3 min-w-max pb-4">
            {data.days.map((dayObj: any) => {
              const themeColor = dayTheme[dayObj.day];
              const hasPriorities = dayObj.priorities.length > 0;
              const isDropTarget = dropTargetDayId === dayObj.id && (draggedTodo !== null || draggedPriority !== null);

              return (
                <div key={dayObj.id} className="flex flex-col w-[260px] shrink-0">

                  {/* Column Header */}
                  <div
                    className={`rounded-xl border px-3 py-2.5 mb-2 ${themeColor.border} ${themeColor.bg}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className={`font-bold text-[14px] ${themeColor.text}`}>
                          {dayObj.day}
                        </span>
                        <span className="text-[12px] text-[#888780] ml-1.5 font-medium">
                          {dayObj.date}
                        </span>
                      </div>
                      <button
                        onClick={() => addPriority(dayObj.id)}
                        className={`flex items-center justify-center w-7 h-7 rounded-lg border bg-white hover:bg-[#FEF4EE] transition-colors ${themeColor.border}`}
                      >
                        <Plus className={`w-4 h-4 ${themeColor.text}`} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={dayObj.theme}
                      onChange={(e) => handleThemeChange(dayObj.id, e.target.value)}
                      placeholder={dayObj.defaultTheme}
                      className={`w-full px-2.5 py-1.5 text-[12px] rounded-lg border bg-white focus:outline-none focus:ring-1 focus:ring-[#DA7756]/30 transition-all placeholder:text-[#888780] text-[#2C2C2A] ${themeColor.border}`}
                    />
                  </div>

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => handleDayDragOver(e, dayObj.id)}
                    onDragLeave={handleDayDragLeave}
                    onDrop={(e) => handleDayDrop(e, dayObj.id)}
                    className={`flex-1 min-h-[200px] rounded-xl border-2 transition-all duration-150 ${
                      isDropTarget
                        ? "border-solid"
                        : hasPriorities
                        ? `border ${themeColor.border}`
                        : `border-dashed ${themeColor.dashed}`
                    }`}
                    style={
                      isDropTarget
                        ? {
                            borderColor: themeColor.solid,
                            backgroundColor: `${themeColor.solid}10`,
                          }
                        : {}
                    }
                  >
                    {/* Empty state */}
                    {!hasPriorities && !isDropTarget && (
                      <div className={`flex flex-col items-center justify-center h-full py-8 px-3 text-center text-[12px] font-medium ${themeColor.text} opacity-60`}>
                        <Plus className="w-5 h-5 mb-1 opacity-50" />
                        Drop a todo or click +
                      </div>
                    )}

                    {/* Drop hint */}
                    {isDropTarget && (
                      <div
                        className="flex items-center justify-center h-full py-8 text-[12px] font-bold"
                        style={{ color: themeColor.solid }}
                      >
                        ↓ Drop here
                      </div>
                    )}

                    {/* Priority Cards */}
                    {hasPriorities && (
                      <div className="p-2 flex flex-col gap-2">
                        {isDropTarget && (
                          <div
                            className="py-2 rounded-lg border-2 border-dashed text-center text-[11px] font-bold"
                            style={{ borderColor: themeColor.solid, color: themeColor.solid }}
                          >
                            ↓ Drop here
                          </div>
                        )}
                        {dayObj.priorities.map((priority: any, priorityIndex: number) => (
                          <div
                            key={priority.id}
                            draggable
                            onDragStart={(e) => handlePriorityDragStart(e, dayObj.id, priority.id)}
                            onDragEnd={() => { setDraggedPriority(null); setDropTargetDayId(null); }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => handleDayDrop(e, dayObj.id, priorityIndex)}
                            className="flex flex-col gap-2 rounded-xl border bg-white p-2.5 shadow-sm cursor-grab active:cursor-grabbing"
                            style={{ borderColor: "rgba(214,185,157,0.55)" }}
                          >
                            {/* Top row: badges + remove */}
                            <div className="flex items-center gap-1.5">

                              {priority.todoId && (
                                <div className="flex items-center gap-1 bg-[#F4F3FE] border border-[#C5BFF5] rounded-md px-1.5 py-0.5">
                                  <CheckSquare className="w-2.5 h-2.5 text-[#534AB7]" />
                                  <span className="text-[10px] font-semibold text-[#534AB7]">Todo</span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => removePriority(dayObj.id, priority.id)}
                                className="ml-auto flex h-6 w-6 items-center justify-center rounded-md border bg-white transition-colors hover:bg-[#FEF4EE] shrink-0"
                                style={{ borderColor: "#D6B99D", color: "#A32D2D" }}
                                aria-label="Remove priority"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Text input */}
                            <input
                              type="text"
                              value={getPriorityDescription(priority)}
                              onChange={(e) => handlePriorityTextChange(dayObj.id, priority.id, e.target.value)}
                              placeholder="Priority details..."
                              className={`w-full px-2.5 py-1.5 text-[12px] rounded-lg border bg-white focus:outline-none focus:ring-1 focus:ring-[#DA7756]/30 placeholder:text-[#888780] text-[#2C2C2A] transition-all ${themeColor.border}`}
                            />

                            {/* Category select */}
                            <div className="relative">
                              <select
                                value={
                                  CATEGORY_OPTIONS.some((o) => o.value === getPriorityLifeArea(priority))
                                    ? getPriorityLifeArea(priority)
                                    : "Career"
                                }
                                onChange={(e) =>
                                  handlePriorityFieldChange(dayObj.id, priority.id, "life_area", e.target.value)
                                }
                                className={`appearance-none w-full bg-white border rounded-lg pl-2.5 pr-7 py-1.5 text-[11px] font-medium ${themeColor.border} text-[#2C2C2A] cursor-pointer outline-none`}
                              >
                                {CATEGORY_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#888780]" />
                            </div>

                            {/* Quadrant select */}
                            <div className="relative">
                              <select
                                value={
                                  normalizeQuadrantValue(priority.quadrant)
                                }
                                onChange={(e) =>
                                  handlePriorityFieldChange(dayObj.id, priority.id, "quadrant", e.target.value)
                                }
                                className={`appearance-none w-full bg-white border rounded-lg pl-2.5 pr-7 py-1.5 text-[11px] font-bold ${themeColor.border} text-[#DA7756] cursor-pointer outline-none`}
                              >
                                {QUADRANT_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#DA7756]" />
                            </div>
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
    </div>
  );
}
