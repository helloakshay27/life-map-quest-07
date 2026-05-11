import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  Loader2,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "https://life-api.lockated.com";

type MetricCard = {
  label: string;
  value: string;
  helper: string;
  icon: typeof BookOpen;
  card: string;
  iconBg: string;
  iconFg: string;
};

type HabitReview = {
  name: string;
  done: number[];
  statuses: Record<number, string>;
  rate: string;
};

type ScorePoint = {
  day: number;
  energy: number | null;
  alignment: number | null;
};

type MoodCount = {
  mood: string;
  count: number;
};

type PriorityStats = {
  set: number;
  accomplished: number;
  percent: number;
};

type MonthlyReviewData = {
  metrics: MetricCard[];
  habits: HabitReview[];
  scorePoints: ScorePoint[];
  moods: MoodCount[];
  priority: PriorityStats;
};

const getToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  localStorage.getItem("userToken") ||
  "";

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const shiftMonth = (date: Date, offset: number) =>
  new Date(date.getFullYear(), date.getMonth() + offset, 1);

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const percentText = (value: unknown, fallback = 0) => {
  const parsed = Math.round(toNumber(value, fallback));
  return `${parsed}%`;
};

const getDayFromDate = (value: unknown) => {
  const dateText = String(value || "").slice(0, 10);
  const day = Number(dateText.split("-")[2]);
  return Number.isFinite(day) ? day : null;
};

const buildMetrics = (
  payload: Record<string, any>,
  daysInMonth: number,
  habitCount: number,
): MetricCard[] => {
  const stats = asRecord(payload.stats);
  const journalDays = toNumber(
    stats.journal_days ??
      payload.journal_days ??
      payload.journal_entries ??
      payload.daily_entries ??
      payload.daily_journals ??
      payload.journal_count ??
      payload.journaled_days?.length,
  );
  const totalDays = toNumber(stats.days_in_month ?? payload.days_in_month, daysInMonth);
  const consistencyPct = toNumber(stats.consistency_pct ?? payload.consistency_pct);
  const avgEnergy = toNumber(
    stats.avg_energy ?? payload.avg_energy ?? payload.average_energy ?? payload.energy_average,
  );
  const avgAlignment = toNumber(
    stats.avg_alignment ?? payload.avg_alignment ?? payload.average_alignment ?? payload.alignment_average,
  );
  const habitRate = toNumber(
    stats.habit_rate_pct ??
      payload.habit_rate_pct ??
      payload.habit_rate ??
      payload.habit_completion_rate ??
      payload.habits?.completion_rate,
  );
  const activeHabitCount = toNumber(stats.active_habits_count ?? payload.active_habits_count, habitCount);

  return [
  {
    label: "Journal Days",
      value: `${journalDays}/${totalDays}`,
      helper: `${consistencyPct || Math.round((journalDays / totalDays) * 100)}% consistency`,
    icon: BookOpen,
    card: "bg-[hsl(var(--journal-green))]",
    iconBg: "bg-[hsl(var(--success))]",
    iconFg: "text-[hsl(var(--success-foreground))]",
  },
  {
    label: "Avg Energy",
      value: avgEnergy.toFixed(1),
    helper: "out of 10",
    icon: Zap,
    card: "bg-[hsl(var(--journal-orange))]",
    iconBg: "bg-[hsl(var(--warning))]",
    iconFg: "text-[hsl(var(--warning-foreground))]",
  },
  {
    label: "Avg Alignment",
      value: avgAlignment.toFixed(1),
    helper: "out of 10",
    icon: TrendingUp,
    card: "bg-[hsl(var(--journal-purple))]",
    iconBg: "bg-primary",
    iconFg: "text-primary-foreground",
  },
  {
    label: "Habit Rate",
      value: percentText(habitRate),
      helper: `${activeHabitCount} active habit${activeHabitCount === 1 ? "" : "s"}`,
    icon: Flame,
    card: "bg-[hsl(var(--journal-pink))]",
    iconBg: "bg-destructive",
    iconFg: "text-destructive-foreground",
  },
  ];
};

const normalizeScorePoints = (payload: Record<string, any>): ScorePoint[] => {
  const rows =
    payload.energy_alignment_trend ??
    payload.daily_energy_alignment ??
    payload.daily_scores ??
    payload.energy_alignment ??
    payload.journals ??
    [];

  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => {
      const item = asRecord(row);
      const day =
        toNumber(item.day) ||
        getDayFromDate(item.date ?? item.start_date ?? item.created_at) ||
        0;
      if (!day) return null;
      return {
        day,
        energy:
          (item.energy_score ?? item.energy) === null || (item.energy_score ?? item.energy) === undefined
            ? null
            : toNumber(item.energy_score ?? item.energy),
        alignment:
          (item.alignment_score ?? item.alignment) === null ||
          (item.alignment_score ?? item.alignment) === undefined
            ? null
            : toNumber(item.alignment_score ?? item.alignment),
      };
    })
    .filter(Boolean) as ScorePoint[];
};

const normalizeMoods = (payload: Record<string, any>): MoodCount[] => {
  const raw = payload.mood_frequency ?? payload.moods ?? payload.mood_counts;
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      const mood = asRecord(item);
      return {
        mood: String(mood.mood ?? mood.name ?? mood.label ?? "Mood"),
        count: toNumber(mood.count ?? mood.value),
      };
    });
  }
  const record = asRecord(raw);
  return Object.entries(record).map(([mood, count]) => ({ mood, count: toNumber(count) }));
};

const normalizePriority = (payload: Record<string, any>): PriorityStats => {
  const priority = asRecord(payload.priority_completion ?? payload.priorities);
  const set = toNumber(
    priority.set ?? priority.priorities_set ?? payload.priorities_set ?? payload.priority_count,
  );
  const accomplished = toNumber(
    priority.accomplished ??
      priority.completed ??
      priority.priorities_accomplished ??
      payload.priorities_accomplished,
  );
  return {
    set,
    accomplished,
    percent: toNumber(priority.pct ?? priority.percent, set > 0 ? Math.round((accomplished / set) * 100) : 0),
  };
};

const normalizeHabits = (payload: Record<string, any>): HabitReview[] => {
  const rows = Array.isArray(payload.habits)
    ? payload.habits
    : Array.isArray(payload.habit_tracker)
      ? payload.habit_tracker
      : Array.isArray(payload.habit_matrix)
        ? payload.habit_matrix
      : [];

  return rows.map((row) => {
    const habit = asRecord(row);
    const matrixDays = Array.isArray(habit.days) ? habit.days : [];
    const statuses = matrixDays.reduce<Record<number, string>>((acc, item) => {
      const dayInfo = asRecord(item);
      const day = getDayFromDate(dayInfo.date) ?? toNumber(dayInfo.day);
      if (day) acc[day] = String(dayInfo.status || "n/a").toLowerCase();
      return acc;
    }, {});
    const done =
      habit.done_days ??
      habit.completed_days ??
      habit.completions ??
      habit.month_history ??
      [];
    const doneDays = Array.isArray(done)
      ? done
          .map((value, index) =>
            typeof value === "boolean" ? (value ? index + 1 : null) : toNumber(value),
          )
          .filter((value): value is number => Boolean(value))
      : [];
    return {
      name: String(habit.name ?? habit.title ?? "Habit"),
      done: matrixDays.length > 0
        ? Object.entries(statuses)
            .filter(([, status]) => status === "done")
            .map(([day]) => Number(day))
        : doneDays,
      statuses,
      rate: percentText(habit.rate_pct ?? habit.rate ?? habit.completion_rate ?? habit.percentage),
    };
  });
};

const parseMonthlyReview = (raw: unknown, daysInMonth: number): MonthlyReviewData => {
  const response = asRecord(raw);
  const payload = asRecord(response.data ?? response.monthly_review ?? response);
  const habits = normalizeHabits(payload);
  return {
    metrics: buildMetrics(payload, daysInMonth, habits.length),
    habits,
    scorePoints: normalizeScorePoints(payload),
    moods: normalizeMoods(payload),
    priority: normalizePriority(payload),
  };
};

const getHabitStatusClass = (status?: string) => {
  switch (status) {
    case "done":
      return "bg-[hsl(var(--success))]";
    case "missed":
      return "bg-destructive/60";
    case "pending":
      return "bg-[hsl(var(--warning))]/60";
    case "n/a":
      return "bg-muted";
    default:
      return "bg-muted";
  }
};

const ALIGNMENT_COLOR = "#14B8A6";
const ENERGY_COLOR = "#F97316";

const MonthlyReview = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [review, setReview] = useState<MonthlyReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const monthKey = getMonthKey(selectedMonth);
  const daysInMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0,
  ).getDate();
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, index) => index + 1),
    [daysInMonth],
  );

  useEffect(() => {
    const fetchMonthlyReview = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getToken();
        const response = await fetch(
          `${API_BASE_URL}/dashboard/monthly_review?month=${encodeURIComponent(monthKey)}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to load monthly review (${response.status})`);
        }

        const data = await response.json();
        setReview(parseMonthlyReview(data, daysInMonth));
      } catch (err) {
        console.error("Monthly review API error:", err);
        setError(err instanceof Error ? err.message : "Failed to load monthly review");
        setReview(parseMonthlyReview({}, daysInMonth));
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyReview();
  }, [daysInMonth, monthKey]);

  const metrics = review?.metrics ?? buildMetrics({}, daysInMonth, 0);
  const habits = review?.habits ?? [];
  const scorePoints = review?.scorePoints ?? [];
  const moods = review?.moods ?? [];
  const priority = review?.priority ?? { set: 0, accomplished: 0, percent: 0 };
  const sortedScorePoints = [...scorePoints].sort((a, b) => a.day - b.day);
  const chart = { width: 1040, height: 330, left: 58, right: 28, top: 36, bottom: 70 };
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const xForDay = (day: number) => chart.left + ((day - 1) / Math.max(daysInMonth - 1, 1)) * plotWidth;
  const yForScore = (score: number) => chart.top + ((10 - Math.max(0, Math.min(10, score))) / 10) * plotHeight;
  const pointOffset = (point: ScorePoint, type: "energy" | "alignment") =>
    point.energy !== null && point.alignment !== null && point.energy === point.alignment
      ? type === "energy"
        ? -5
        : 5
      : 0;
  const makePath = (type: "energy" | "alignment") =>
    sortedScorePoints
      .filter((point) => point[type] !== null)
      .map((point, index) => {
        const value = point[type] ?? 0;
        return `${index === 0 ? "M" : "L"} ${xForDay(point.day) + pointOffset(point, type)} ${yForScore(value)}`;
      })
      .join(" ");
  const energyPath = makePath("energy");
  const alignmentPath = makePath("alignment");
  const chartDays = Array.from(new Set([1, 7, 14, 21, 28, daysInMonth].filter((day) => day <= daysInMonth))).sort((a, b) => a - b);

  return (
    <div className="min-h-screen animate-fade-in bg-[#F6F4EE] px-4 py-5 text-foreground sm:px-6">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-1 h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-extrabold leading-none tracking-normal text-foreground">
                Monthly Review
              </h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Personal growth dashboard - Tagala Uzair
              </p>
            </div>
          </div>

          <div className="flex h-12 w-full items-center justify-between rounded-lg border border-border bg-card px-6 shadow-sm sm:w-72">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Previous month"
              onClick={() => setSelectedMonth((current) => shiftMonth(current, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-extrabold text-foreground">{getMonthLabel(selectedMonth)}</span>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
              aria-label="Next month"
              onClick={() => setSelectedMonth((current) => shiftMonth(current, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.label}
                className={`rounded-lg border border-border p-4 shadow-md ${metric.card}`}
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm ${metric.iconBg} ${metric.iconFg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">{metric.label}</p>
                <p className="mt-0.5 text-2xl font-extrabold leading-none text-foreground">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : metric.value}
                </p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">{metric.helper}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-lg border border-[#F2B28B] bg-card px-6 py-5 shadow-md">
          <h2 className="text-lg font-extrabold text-foreground">Daily Energy &amp; Alignment</h2>

          <div className="relative mt-4 min-h-[360px] overflow-x-auto rounded-lg border border-border bg-white px-5 py-6">
            <h3 className="text-xl font-extrabold text-foreground">Alignment &amp; Energy Trends</h3>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Scores across journaled days this month</p>

            <svg className="mt-2 h-[330px] min-w-[760px] w-full" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="Daily energy and alignment trend chart">
              {[10, 6, 3, 0].map((score) => {
                const y = yForScore(score);
                return (
                  <g key={score}>
                    <line x1={chart.left} y1={y} x2={chart.left + plotWidth} y2={y} stroke="#E8E1D9" strokeDasharray="3 4" />
                    <text x={chart.left - 10} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[14px] font-medium">{score}</text>
                  </g>
                );
              })}
              {chartDays.map((day) => {
                const x = xForDay(day);
                return (
                  <g key={day}>
                    <text x={x} y={chart.top + plotHeight + 24} textAnchor="middle" className="fill-muted-foreground text-[12px] font-medium">{day}</text>
                  </g>
                );
              })}

              {alignmentPath && <path d={alignmentPath} fill="none" stroke={ALIGNMENT_COLOR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
              {energyPath && <path d={energyPath} fill="none" stroke={ENERGY_COLOR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

              {sortedScorePoints.map((point) => (
                <g key={`score-${point.day}`}>
                  {point.alignment !== null && (
                    <g className="group">
                      <circle cx={xForDay(point.day) + pointOffset(point, "alignment")} cy={yForScore(point.alignment)} r="4" fill="white" stroke={ALIGNMENT_COLOR} strokeWidth="2.5" />
                      <g className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100">
                        <rect
                          x={xForDay(point.day) + pointOffset(point, "alignment") - 54}
                          y={Math.max(chart.top + 4, yForScore(point.alignment) - 52)}
                          width="108"
                          height="38"
                          rx="7"
                          fill="white"
                          stroke="#E8E1D9"
                          filter="drop-shadow(0 2px 5px rgba(0,0,0,0.14))"
                        />
                        <text x={xForDay(point.day) + pointOffset(point, "alignment")} y={Math.max(chart.top + 4, yForScore(point.alignment) - 52) + 15} textAnchor="middle" className="fill-muted-foreground text-[10px] font-bold">
                          Day {point.day}
                        </text>
                        <circle cx={xForDay(point.day) + pointOffset(point, "alignment") - 36} cy={Math.max(chart.top + 4, yForScore(point.alignment) - 52) + 28} r="3" fill={ALIGNMENT_COLOR} />
                        <text x={xForDay(point.day) + pointOffset(point, "alignment") + 4} y={Math.max(chart.top + 4, yForScore(point.alignment) - 52) + 31} textAnchor="middle" fill={ALIGNMENT_COLOR} className="text-[10px] font-bold">
                          Alignment: {point.alignment}
                        </text>
                      </g>
                    </g>
                  )}
                  {point.energy !== null && (
                    <g className="group">
                      <circle cx={xForDay(point.day) + pointOffset(point, "energy")} cy={yForScore(point.energy)} r="4" fill="white" stroke={ENERGY_COLOR} strokeWidth="2.5" />
                      <g className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100">
                        <rect
                          x={xForDay(point.day) + pointOffset(point, "energy") - 50}
                          y={Math.max(chart.top + 4, yForScore(point.energy) - 52)}
                          width="100"
                          height="38"
                          rx="7"
                          fill="white"
                          stroke="#E8E1D9"
                          filter="drop-shadow(0 2px 5px rgba(0,0,0,0.14))"
                        />
                        <text x={xForDay(point.day) + pointOffset(point, "energy")} y={Math.max(chart.top + 4, yForScore(point.energy) - 52) + 15} textAnchor="middle" className="fill-muted-foreground text-[10px] font-bold">
                          Day {point.day}
                        </text>
                        <circle cx={xForDay(point.day) + pointOffset(point, "energy") - 30} cy={Math.max(chart.top + 4, yForScore(point.energy) - 52) + 28} r="3" fill={ENERGY_COLOR} />
                        <text x={xForDay(point.day) + pointOffset(point, "energy") + 6} y={Math.max(chart.top + 4, yForScore(point.energy) - 52) + 31} textAnchor="middle" fill={ENERGY_COLOR} className="text-[10px] font-bold">
                          Energy: {point.energy}
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              ))}

              <g transform={`translate(${chart.left + plotWidth / 2 - 95} ${chart.height - 22})`}>
                <line x1="0" y1="0" x2="18" y2="0" stroke={ALIGNMENT_COLOR} strokeWidth="2" />
                <circle cx="9" cy="0" r="3" fill="white" stroke={ALIGNMENT_COLOR} strokeWidth="2" />
                <text x="28" y="4" className="fill-muted-foreground text-[13px] font-semibold">Alignment</text>
                <line x1="124" y1="0" x2="142" y2="0" stroke={ENERGY_COLOR} strokeWidth="2" />
                <circle cx="133" cy="0" r="3" fill="white" stroke={ENERGY_COLOR} strokeWidth="2" />
                <text x="152" y="4" className="fill-muted-foreground text-[13px] font-semibold">Energy</text>
              </g>
            </svg>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/75 text-xs font-semibold text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading trend...
              </div>
            )}

            {!loading && sortedScorePoints.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                No journal data for this month
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="min-h-[350px] rounded-lg border border-[hsl(var(--journal-pink-border))] bg-card px-6 py-5 shadow-md">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
              <h2 className="text-sm font-extrabold text-foreground">Mood Frequency</h2>
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Most common moods this month</p>
            <div className="mt-5 flex h-[250px] flex-col justify-center gap-3">
              {moods.length === 0 ? (
                <div className="text-center text-xs font-medium text-muted-foreground">
                  {loading ? "Loading mood data..." : "No mood data"}
                </div>
              ) : (
                moods.map((mood) => {
                  const maxCount = Math.max(...moods.map((item) => item.count), 1);
                  return (
                    <div key={mood.mood} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="capitalize text-foreground">{mood.mood}</span>
                        <span className="text-muted-foreground">{mood.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-destructive"
                          style={{ width: `${(mood.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="min-h-[350px] rounded-lg border border-[hsl(var(--journal-blue-border))] bg-card px-6 py-5 shadow-md">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-extrabold text-foreground">Priority Completion</h2>
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Accomplishments vs priorities set</p>
            <div className="mt-5 flex flex-col items-center gap-5">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[9px] border-primary">
                <div className="text-center">
                  <p className="text-2xl font-extrabold leading-none text-foreground">{priority.percent}%</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">complete</p>
                </div>
              </div>
              <div className="grid w-full gap-4 sm:grid-cols-2">
                <div className="rounded-md bg-primary/10 px-4 py-4 text-center">
                  <p className="text-base font-extrabold text-primary">{priority.set}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">Priorities Set</p>
                </div>
                <div className="rounded-md bg-[hsl(var(--journal-green))] px-4 py-4 text-center">
                  <p className="text-base font-extrabold text-[hsl(var(--success-foreground))]">{priority.accomplished}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">Accomplished</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[hsl(var(--journal-orange-border))] bg-card px-4 py-5 shadow-md sm:px-5">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-destructive" />
            <h2 className="text-sm font-extrabold text-foreground">Habit Tracker Matrix</h2>
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Daily completion across the month</p>

          <div className="mt-4 w-full">
            <div
              className="grid items-center gap-x-1 border-b border-border pb-2 text-[8px] font-bold text-muted-foreground sm:text-[9px]"
              style={{ gridTemplateColumns: `72px repeat(${daysInMonth}, minmax(0, 1fr)) 32px` }}
            >
              <span>Habit</span>
              {days.map((day) => (
                <span key={day} className="text-center leading-none">{day}</span>
              ))}
              <span className="text-right">Rate</span>
            </div>

            {habits.length === 0 && (
              <div className="py-8 text-center text-xs font-medium text-muted-foreground">
                {loading ? "Loading habit data..." : "No habit data"}
              </div>
            )}

            {habits.map((habit) => (
              <div
                key={habit.name}
                className="grid items-center gap-x-1 border-b border-border py-2"
                style={{ gridTemplateColumns: `72px repeat(${daysInMonth}, minmax(0, 1fr)) 32px` }}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span className="truncate text-[9px] font-bold text-foreground sm:text-[10px]">{habit.name}</span>
                </div>
                {days.map((day) => (
                  <span
                    key={day}
                    title={`${habit.name} day ${day}: ${habit.statuses[day] || (habit.done.includes(day) ? "done" : "n/a")}`}
                    className={`mx-auto block h-[clamp(0.3rem,0.85vw,0.75rem)] w-[clamp(0.3rem,0.85vw,0.75rem)] rounded-[3px] ${getHabitStatusClass(
                      habit.statuses[day] || (habit.done.includes(day) ? "done" : "n/a"),
                    )}`}
                  />
                ))}
                <span className="text-right text-[9px] font-extrabold text-destructive sm:text-[10px]">
                  {habit.rate}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(var(--success))]" />
              Done
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-destructive/60" />
              Missed
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(var(--warning))]/60" />
              Pending
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-muted" />
              N/A
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MonthlyReview;
