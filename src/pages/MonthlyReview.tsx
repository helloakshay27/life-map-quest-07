import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

const days = Array.from({ length: 31 }, (_, index) => index + 1);

const habits = [
  { name: "sleeping", done: [15, 16, 17, 19, 23, 24, 25], rate: "19%" },
  { name: "swim", done: [], rate: "0%" },
  { name: "cycling", done: [], rate: "0%" },
];

const metrics = [
  {
    label: "Journal Days",
    value: "1/31",
    helper: "3% consistency",
    icon: BookOpen,
    card: "bg-[hsl(var(--journal-green))]",
    iconBg: "bg-[hsl(var(--success))]",
    iconFg: "text-[hsl(var(--success-foreground))]",
  },
  {
    label: "Avg Energy",
    value: "10.0",
    helper: "out of 10",
    icon: Zap,
    card: "bg-[hsl(var(--journal-orange))]",
    iconBg: "bg-[hsl(var(--warning))]",
    iconFg: "text-[hsl(var(--warning-foreground))]",
  },
  {
    label: "Avg Alignment",
    value: "2.0",
    helper: "out of 10",
    icon: TrendingUp,
    card: "bg-[hsl(var(--journal-purple))]",
    iconBg: "bg-primary",
    iconFg: "text-primary-foreground",
  },
  {
    label: "Habit Rate",
    value: "6%",
    helper: "3 active habits",
    icon: Flame,
    card: "bg-[hsl(var(--journal-pink))]",
    iconBg: "bg-destructive",
    iconFg: "text-destructive-foreground",
  },
];

const MonthlyReview = () => {
  return (
    <div className="min-h-screen animate-fade-in bg-background px-4 py-5 text-foreground sm:px-6">
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
            <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-extrabold text-foreground">March 2026</span>
            <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </header>

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
                <p className="mt-0.5 text-2xl font-extrabold leading-none text-foreground">{metric.value}</p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">{metric.helper}</p>
              </div>
            );
          })}
        </section>

        <section className="rounded-lg border border-border bg-card px-6 py-5 shadow-md">
          <h2 className="text-base font-extrabold text-foreground">Daily Energy &amp; Alignment</h2>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            Trend across the month (only journaled days shown)
          </p>

          <div className="relative mt-3 h-[230px]">
            <svg className="h-full w-full" viewBox="0 0 1060 220" role="img" aria-label="Daily energy and alignment chart">
              <line x1="34" y1="10" x2="34" y2="178" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" />
              <line x1="34" y1="178" x2="1036" y2="178" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" />
              {[10, 66, 122].map((y) => (
                <line key={y} x1="34" y1={y} x2="1036" y2={y} stroke="hsl(var(--border))" strokeDasharray="3 5" />
              ))}
              <line x1="520" y1="10" x2="520" y2="178" stroke="hsl(var(--border))" strokeDasharray="3 5" />
              <text x="14" y="14" className="fill-muted-foreground text-[10px] font-medium">10</text>
              <text x="19" y="70" className="fill-muted-foreground text-[10px] font-medium">7</text>
              <text x="19" y="126" className="fill-muted-foreground text-[10px] font-medium">4</text>
              <text x="19" y="182" className="fill-muted-foreground text-[10px] font-medium">1</text>
              <text x="514" y="194" className="fill-muted-foreground text-[10px] font-medium">24</text>
              <g transform="translate(470 208)">
                <line x1="0" y1="0" x2="10" y2="0" stroke="hsl(var(--warning-foreground))" strokeWidth="2" />
                <circle cx="5" cy="0" r="2" fill="white" stroke="hsl(var(--warning-foreground))" strokeWidth="1.5" />
                <text x="14" y="3.5" className="fill-muted-foreground text-[10px] font-semibold">Energy</text>
                <line x1="64" y1="0" x2="74" y2="0" stroke="hsl(var(--primary))" strokeWidth="2" />
                <circle cx="69" cy="0" r="2" fill="white" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                <text x="78" y="3.5" className="fill-muted-foreground text-[10px] font-semibold">Alignment</text>
              </g>
            </svg>

            <button type="button" className="group absolute left-[49.05%] top-[4px] h-4 w-4 -translate-x-1/2 rounded-full outline-none" aria-label="Energy 10 on day 24">
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[hsl(var(--warning-foreground))] bg-card" />
              <span className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-md group-hover:block group-focus:block">
                24<br />
                Energy: 10
              </span>
            </button>

            <button type="button" className="group absolute left-[49.05%] top-[172px] h-4 w-4 -translate-x-1/2 rounded-full outline-none" aria-label="Alignment 2 on day 24">
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-card" />
              <span className="pointer-events-none absolute left-1/2 top-5 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-md group-hover:block group-focus:block">
                24<br />
                Alignment: 2
              </span>
            </button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="min-h-[350px] rounded-lg border border-[hsl(var(--journal-pink-border))] bg-card px-6 py-5 shadow-md">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
              <h2 className="text-sm font-extrabold text-foreground">Mood Frequency</h2>
            </div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Most common moods this month</p>
            <div className="flex h-[250px] items-center justify-center text-xs font-medium text-muted-foreground">
              No mood data
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
                  <p className="text-2xl font-extrabold leading-none text-foreground">100%</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">complete</p>
                </div>
              </div>
              <div className="grid w-full gap-4 sm:grid-cols-2">
                <div className="rounded-md bg-primary/10 px-4 py-4 text-center">
                  <p className="text-base font-extrabold text-primary">1</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">Priorities Set</p>
                </div>
                <div className="rounded-md bg-[hsl(var(--journal-green))] px-4 py-4 text-center">
                  <p className="text-base font-extrabold text-[hsl(var(--success-foreground))]">1</p>
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
              style={{ gridTemplateColumns: "72px repeat(31, minmax(0, 1fr)) 32px" }}
            >
              <span>Habit</span>
              {days.map((day) => (
                <span key={day} className="text-center leading-none">{day}</span>
              ))}
              <span className="text-right">Rate</span>
            </div>

            {habits.map((habit) => (
              <div
                key={habit.name}
                className="grid items-center gap-x-1 border-b border-border py-2"
                style={{ gridTemplateColumns: "72px repeat(31, minmax(0, 1fr)) 32px" }}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <span className="truncate text-[9px] font-bold text-foreground sm:text-[10px]">{habit.name}</span>
                </div>
                {days.map((day) => (
                  <span
                    key={day}
                    className={`mx-auto block h-[clamp(0.3rem,0.85vw,0.75rem)] w-[clamp(0.3rem,0.85vw,0.75rem)] rounded-[3px] ${
                      habit.done.includes(day) ? "bg-[hsl(var(--success))]" : "bg-muted"
                    }`}
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
              <span className="h-2.5 w-2.5 rounded-sm bg-destructive/40" />
              Missed
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
