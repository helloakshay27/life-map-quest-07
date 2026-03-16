import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, CalendarDays, AlertCircle } from 'lucide-react';
import { startOfWeek, endOfWeek, subWeeks, format, getWeek, isSameWeek, isBefore } from 'date-fns';

const API_BASE_URL = "https://life-api.lockated.com";

// ─── Fallback Data ────────────────────────────────────────────────────────────
const FALLBACK_DATA = [
  { id: 1, icon: '🎯', title: '1. Vision & Strategy', description: 'Is my team crystal clear about where the company is headed and what success looks like this year?', kpi: '% of team aligned with clear written goals', score: 3 },
  { id: 2, icon: '⚙️', title: '2. Systems & Processes', description: 'Can my business run smoothly for 2 weeks without my direct involvement?', kpi: 'Process adherence rate', score: 3 },
  { id: 3, icon: '👥', title: '3. Leadership & Team', description: 'Do I have the right people leading each function, and do they take ownership?', kpi: '% of key roles filled with accountable leaders', score: 3 },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Question {
  id: number;
  icon?: string;
  title?: string;
  name?: string;          
  description?: string;
  question?: string;      
  kpi?: string;
  score?: number;
  rating?: number;        
  [key: string]: unknown;
}

interface NormalizedQuestion {
  id: number;
  icon: string;
  title: string;
  description: string;
  kpi: string;
  score: number;
}

interface Props {
  apiQuestions?: Question[];       
  evaluationType?: "md" | "team";  
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function normalize(q: Question, index: number): NormalizedQuestion {
  return {
    id: q.id ?? index + 1,
    icon: (q.icon as string) ?? '🎯',
    title: (q.title ?? q.name ?? `Question ${index + 1}`) as string,
    description: (q.description ?? q.question ?? '') as string,
    kpi: (q.kpi ?? '') as string,
    score: Number(q.score ?? q.rating ?? 3),
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WeeklyJournal({ apiQuestions, evaluationType }: Props) {
  // UI & Form States
  const [questions, setQuestions] = useState<NormalizedQuestion[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [notes, setNotes] = useState('');
  
  // Loading & Toast States
  const [isFetchingWeek, setIsFetchingWeek] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Dynamic Date States
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  // Mock array representing week numbers that have been filled. (e.g., Week 11 is filled)
  // In a real app, fetch this array from your backend.
  const [filledWeeks, setFilledWeeks] = useState<number[]>([11]); 

  // --- 1. DYNAMIC WEEK GENERATOR ---
  const weeksData = useMemo(() => {
    const weeks = [];
    // Generate the last 5 weeks + current week (6 cards total)
    for (let i = 5; i >= 0; i--) {
      const targetDate = subWeeks(today, i);
      const start = startOfWeek(targetDate, { weekStartsOn: 0 }); // 0 = Sunday
      const end = endOfWeek(targetDate, { weekStartsOn: 0 }); // 6 = Saturday
      const weekNum = getWeek(targetDate);

      // Format the range (e.g., "MAR 1-7" or cross-month "FEB 22-\nMAR 2")
      let rangeStr = "";
      if (start.getMonth() === end.getMonth()) {
        rangeStr = `${format(start, 'MMM').toUpperCase()} ${format(start, 'd')}-${format(end, 'd')}`;
      } else {
        rangeStr = `${format(start, 'MMM d').toUpperCase()}-\n${format(end, 'MMM d').toUpperCase()}`;
      }

      const isThisWeek = isSameWeek(targetDate, today, { weekStartsOn: 0 });
      const isSelected = isSameWeek(targetDate, selectedDate, { weekStartsOn: 0 });
      const isFilled = filledWeeks.includes(weekNum);
      const isPast = isBefore(end, today) && !isThisWeek;

      let status: 'missed' | 'filled' | 'current' = 'current';
      if (isThisWeek) status = 'current';
      else if (isFilled) status = 'filled';
      else if (isPast) status = 'missed';

      weeks.push({
        id: `wk-${weekNum}`,
        weekNum,
        label: `WK#${weekNum.toString().padStart(2, '0')}`,
        range: rangeStr,
        status,
        startDate: start,
        endDate: end,
        isActive: isSelected
      });
    }
    return weeks;
  }, [today, selectedDate, filledWeeks]);

  // Find the currently active week object to display in the header
  const activeWeekData = weeksData.find(w => w.isActive) || weeksData[weeksData.length - 1];

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- 2. FETCH DATA WHEN A WEEK IS CLICKED ---
  useEffect(() => {
    const fetchWeekData = async () => {
      setIsFetchingWeek(true);
      try {
        // Simulate API call delay for switching weeks
        await new Promise(resolve => setTimeout(resolve, 600)); 
        
        if (apiQuestions && apiQuestions.length > 0) {
          setQuestions(apiQuestions.map(normalize));
        } else {
          setQuestions(FALLBACK_DATA); // Load fallback if no API data
        }
        setNotes(''); // Clear notes when switching weeks
      } catch (error) {
        showToast("Failed to load week data");
      } finally {
        setIsFetchingWeek(false);
      }
    };

    fetchWeekData();
  }, [selectedDate, apiQuestions]);

  // --- Handlers ---
  const handleScoreChange = (id: number, newScore: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, score: parseInt(newScore) } : q)));
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleWeekClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token");

      const payload = {
        evaluation_type: evaluationType ?? "md",
        week_number: activeWeekData.weekNum, // Send specific week to backend
        notes,
        answers: questions.map((q) => ({
          question_id: q.id,
          score: q.score,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/kra_evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to save (${res.status})`);

      // Update local state to mark this week as filled
      if (!filledWeeks.includes(activeWeekData.weekNum)) {
        setFilledWeeks(prev => [...prev, activeWeekData.weekNum]);
      }

      showToast("Evaluation saved successfully!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 font-sans bg-[#fbfbfe] min-h-screen relative space-y-10 animate-fade-in">
      
      {/* ─── 1. DYNAMIC WEEK TRACKER STRIP ─── */}
      <div className="w-full rounded-[24px] border border-[#22c55e] bg-[#f2fdf5] p-6 shadow-sm transition-all">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-[#22c55e] text-white shadow-sm">
            <CalendarDays className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-[17px] font-semibold tracking-tight text-gray-900">
              {activeWeekData.status === 'filled' ? 'Viewing' : 'Creating'} {activeWeekData.label}, {activeWeekData.range.replace('\n', ' ')}
            </h2>
            <AlertCircle className="h-[18px] w-[18px] text-gray-400" />
          </div>
        </div>

        <div className="flex justify-center px-4">
          <div className="flex items-end gap-1.5 overflow-x-auto pb-4 pt-2">
            {weeksData.map((week) => {
              const isMissed = week.status === 'missed';
              const isFilled = week.status === 'filled';
              const isCurrent = week.status === 'current';
              const isActive = week.isActive;

              // Base Card Styling
              let cardClasses = "flex flex-col items-center justify-center rounded-[18px] transition-all cursor-pointer hover:opacity-90 shadow-sm shrink-0 ";
              
              // Colors based on status
              if (isMissed) cardClasses += "bg-[#ef4444] text-white ";
              else if (isFilled) cardClasses += "bg-[#22c55e] text-white ";
              else if (isCurrent) cardClasses += "bg-[#e5e5e5] text-[#333333] ";

              // Size and Border based on Active selection
              if (isActive) {
                cardClasses += "w-[100px] h-[115px] border-[3px] border-white ring-[2px] ring-[#22c55e]";
              } else {
                cardClasses += "w-[92px] h-[105px] border-none ring-0 opacity-80";
              }

              return (
                <div 
                  key={week.id} 
                  className={cardClasses}
                  onClick={() => handleWeekClick(week.startDate)}
                >
                  <span className={`text-[11px] font-bold tracking-wider mb-1 ${(isCurrent && !isMissed && !isFilled) || isActive && isCurrent ? 'text-gray-600' : 'text-white/90'}`}>
                    {week.label}
                  </span>
                  <span className={`text-[15px] font-extrabold tracking-tight leading-[1.1] text-center whitespace-pre-line px-1 ${(isCurrent && !isMissed && !isFilled) || isActive && isCurrent ? 'text-gray-900' : 'text-white'}`}>
                    {week.range}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-[13px] font-medium text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-[14px] w-[14px] rounded-[4px] bg-[#22c55e]"></div><span>Filled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[14px] w-[14px] rounded-[4px] bg-[#ef4444]"></div><span>Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[14px] w-[14px] rounded-[4px] bg-[#e5e5e5]"></div><span>Current/Upcoming</span>
          </div>
        </div>
      </div>

      {/* ─── 2. EVALUATION SECTION ─── */}
  

      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl min-w-[280px] max-w-sm ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-in slide-in-from-bottom-5 duration-300`}>
          <div className="flex-1">
            <p className="text-sm font-bold">{toast.type === 'success' ? 'Success' : 'Error'}</p>
            <p className="text-sm opacity-90">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}