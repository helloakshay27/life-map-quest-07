import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeft,
  HelpCircle,
  Save,
  Loader2,
} from "lucide-react";
import { apiRequest } from "../config/api";
import { useToast } from "../hooks/use-toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";

// default question sets with score keys for API payload
const defaultMD = [
  {
    id: 1,
    key: "vision_strategy_score",
    icon: "🎯",
    title: "Vision & Strategy",
    description:
      "Is my team crystal clear about where the company is headed and what success looks like this year?",
    kpi: "Team alignment score, OKR completion rate",
    score: 3,
  },
  {
    id: 2,
    key: "systems_processes_score",
    icon: "⚙️",
    title: "Systems & Processes",
    description:
      "Can my business run smoothly for 2 weeks without my direct involvement?",
    kpi: "SOP coverage, escalation frequency",
    score: 3,
  },
  {
    id: 3,
    key: "leadership_team_score",
    icon: "👥",
    title: "Leadership & Team",
    description:
      "Do I have the right people leading each function, and do they take ownership?",
    kpi: "Leadership coverage, accountability index",
    score: 3,
  },
  {
    id: 4,
    key: "financial_health_score",
    icon: "💰",
    title: "Financial Health",
    description:
      "Do I know my company's profit, cash flow, and break-even at any point in time?",
    kpi: "P&L accuracy, cash flow visibility",
    score: 3,
  },
  {
    id: 5,
    key: "growth_sales_score",
    icon: "📈",
    title: "Growth & Sales Engine",
    description:
      "Is my revenue growing predictably every quarter from repeat and new clients?",
    kpi: "QoQ revenue growth, repeat vs new ratio",
    score: 3,
  },
  {
    id: 6,
    key: "innovation_technology_score",
    icon: "💡",
    title: "Innovation & Technology",
    description:
      "Have we implemented new tools, automation, or innovations in the last 6 months?",
    kpi: "Tools adopted, automation ROI",
    score: 3,
  },
  {
    id: 7,
    key: "personal_growth_score",
    icon: "🌱",
    title: "Personal Growth & Delegation",
    description:
      "Am I spending most of my time on strategic growth, not daily firefighting?",
    kpi: "Delegation rate, deep work hours/week",
    score: 3,
  },
];

const defaultTeam = [
  {
    id: 1,
    key: "goal_clarity_alignment_score",
    icon: "🤝",
    title: "Goal Clarity & Alignment",
    description:
      "Does every team member understand and align with company goals?",
    kpi: "OKR alignment rate, clarity surveys",
    score: 3,
  },
  {
    id: 2,
    key: "ownership_accountability_score",
    icon: "📋",
    title: "Ownership & Accountability",
    description:
      "Does each team member take full ownership of their deliverables?",
    kpi: "On-time task completion rate",
    score: 3,
  },
  {
    id: 3,
    key: "process_discipline_score",
    icon: "💬",
    title: "Process Discipline",
    description: "Are team processes followed consistently and efficiently?",
    kpi: "SOP adherence, rework rate",
    score: 3,
  },
  {
    id: 4,
    key: "collaboration_communication_score",
    icon: "🏆",
    title: "Collaboration & Communication",
    description: "Does the team collaborate effectively across departments?",
    kpi: "Cross-team project success rate",
    score: 3,
  },
  {
    id: 5,
    key: "learning_innovation_score",
    icon: "🔄",
    title: "Learning & Innovation",
    description:
      "Is the team actively growing skills and fostering innovation?",
    kpi: "Training hours, new ideas implemented",
    score: 3,
  },
  {
    id: 6,
    key: "client_stakeholder_focus_score",
    icon: "📚",
    title: "Client/Stakeholder Focus",
    description: "Does the team keep clients/stakeholders front of mind?",
    kpi: "CSAT, stakeholder feedback",
    score: 3,
  },
  {
    id: 7,
    key: "reliability_consistency_score",
    icon: "🎯",
    title: "Reliability & Consistency",
    description: "Is the team's output dependable and steady?",
    kpi: "Delivery variance, uptime",
    score: 3,
  },
];

// ─── ScoreCard ────────────────────────────────────────────────────────────────
function ScoreCard({ data }) {
  const {
    score = { achieved: 0, total: 0 },
    title = "No Data",
    message = "Complete evaluation to see your score",
  } = data || {};
  const pct =
    Math.min(100, Math.round((score.achieved / score.total) * 100)) || 0;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-10 pb-10 shadow-xl">
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
      <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/10" />

      <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <TrendingUp className="text-white w-6 h-6" strokeWidth={2.2} />
      </div>

      <p className="text-orange-100 text-base font-semibold mb-2 tracking-widest uppercase">
        Your Total Score
      </p>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-8xl font-black text-white leading-none">{score.achieved}</span>
        <span className="text-4xl font-semibold text-orange-200 leading-none">
          /{score.total}
        </span>
      </div>

      <p className="text-3xl font-extrabold text-white mb-1">{title}</p>
      <p className="text-orange-100 text-base mb-8 italic">{message}</p>

      {/* Progress bar */}
      <div className="bg-white/25 rounded-full h-3.5 overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-orange-100 text-xs font-medium">0</span>
        <span className="text-orange-100 text-xs font-medium">{pct}%</span>
        <span className="text-orange-100 text-xs font-medium">{score.total}</span>
      </div>
    </div>
  );
}

// ─── KRA Question Item ────────────────────────────────────────────────────────
function KraItem({
  item,
  index,
  onScoreChange,
}: {
  item: any;
  index: number;
  onScoreChange: (index: number, score: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="w-full flex items-center gap-4 py-5 px-5">
        <span className="text-3xl shrink-0">{item.icon || "📝"}</span>

        <div
          className="flex-1 min-w-0 cursor-pointer pl-2"
          onClick={() => setOpen(!open)}
        >
          <p className="font-semibold text-base text-gray-900">
            {index + 1}. {item.title}
          </p>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
            marginRight: 6,
          }}
        >
          <input
            type="number"
            min={0}
            max={5}
            value={item.score}
            onChange={(e) => onScoreChange(index, Number(e.target.value))}
            style={{
              width: 40,
              fontSize: 28,
              fontWeight: 700,
              color: "#0d9488",
              textAlign: "center",
              border: "none",
              background: "transparent",
            }}
          />
          <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>
            / 5
          </span>
          <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>
            / 5
          </span>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="bg-transparent border-none cursor-pointer p-1 text-red-400 hover:text-red-600 transition-colors"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className={`text-gray-400 transition-transform duration-250 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="px-5 pb-4 pl-[68px] border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            <strong className="text-gray-700">KPI:</strong> {item.kpi || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── QuestionsAndAnswers ──────────────────────────────────────────────────────
function QuestionsAndAnswers({
  header,
  questions,
  onScoreChange,
  notes,
  setNotes,
  onSubmit,
  isSubmitting,
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-gray-50 rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shrink-0">
          <LayoutDashboard className="text-white w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-gray-900">{header}</p>
          <p className="text-xs text-gray-500 mt-1">
            Rate yourself on each Key Result Area
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {questions.map((q, i) => (
          <KraItem
            key={q.id ?? i}
            item={q}
            index={i}
            onScoreChange={onScoreChange}
          />
        ))}
      </div>

      <div className="mt-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional observations or action items..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 p-4 text-sm bg-gray-50 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
        />
      </div>

      <button
        style={{
          marginTop: 16,
          width: "100%",
          padding: "16px",
          borderRadius: 12,
          background: "linear-gradient(135deg,#ef4444,#dc2626)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.02em",
          boxShadow: "0 4px 14px rgba(220,38,38,0.35)",
          transition: "opacity 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
        onClick={onSubmit}
        disabled={isSubmitting}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Submit Evaluation
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KraSelfEvaluation() {
  const [activeTab, setActiveTab] = useState("MD");
  const [notes, setNotes] = useState("");
  const [questions, setQuestions] = useState(defaultMD);
  const [evaluations, setEvaluations] = useState([]);
  const [scoreData, setScoreData] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const evaluationType = activeTab === "MD" ? "md" : "team";

  // When tab switches, reset questions
  useEffect(() => {
    setQuestions(evaluationType === "md" ? defaultMD : defaultTeam);
    setNotes("");
  }, [evaluationType]);

  // Fetch Latest Evaluation History
  useEffect(() => {
    const fetchLatestEvaluation = async () => {
      try {
        const res = await apiRequest(
          `/kra_evaluations?evaluation_type=${evaluationType}`,
        );

        if (res.ok) {
          const data = await res.json();
          let evaluationsList = [];
          if (Array.isArray(data)) evaluationsList = data;
          else if (data.evaluations) evaluationsList = data.evaluations;
          else if (data.kra_evaluations) evaluationsList = data.kra_evaluations;

          setEvaluations(evaluationsList);

          // Get latest evaluation for score card
          if (evaluationsList.length > 0) {
            const latest = evaluationsList[evaluationsList.length - 1];
            const totalScore = Object.values(latest.scores || {}).reduce(
              (a, b) => a + Number(b),
              0,
            );
            const maxTotal = questions.length * 5;

            let title = "Needs Improvement";
            let message = "Focus on low-scoring areas to improve performance.";
            const pct = maxTotal > 0 ? (totalScore / maxTotal) * 100 : 0;

            if (pct >= 80) {
              title = "Exceptional";
              message = "You are on the right track, keep it up!";
            } else if (pct >= 60) {
              title = "Good";
              message = "You are on the right track, keep it up!";
            }

            setScoreData({
              score: { achieved: totalScore, total: maxTotal || 35 },
              title: title,
              message: message,
            });
          } else {
            setScoreData({
              score: { achieved: 0, total: questions.length * 5 || 35 },
              title: "No Data",
              message: "Complete evaluation to see your score",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      }
    };

    fetchLatestEvaluation();
  }, [evaluationType, refresh, questions.length]);

  const handleScoreChange = (index: number, newScore: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], score: newScore };
      return copy;
    });
  };

  const handleSubmit = async () => {
    // Check if any scores are filled
    const hasScores = questions.some((q) => q.score > 0);
    if (!hasScores) {
      toast({
        title: "Validation Error",
        description: "Please rate at least one area.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        kra_evaluation: {
          evaluation_type: evaluationType,
          evaluation_date: new Date().toISOString().split("T")[0],
          notes,
          scores: questions.reduce((acc, q) => {
            if (q.key) acc[q.key] = q.score;
            return acc;
          }, {}),
        },
      };

      const res = await apiRequest("/kra_evaluations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast({
        title: "Evaluation submitted",
        description: "Your responses have been saved. 🎉",
      });
      setNotes("");
      setRefresh((prev) => !prev);
    } catch (err) {
      console.error("failed to submit evaluation", err);
      toast({
        title: "Submission failed",
        description: "Could not send evaluation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full animate-fade-in space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KRA Self-Evaluation</h1>
          <p className="text-sm text-muted-foreground">
            Assess your performance across key result areas
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-200/50 p-1 rounded-xl mb-5">
        {["MD", "Team"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === tab
                ? "bg-red-50 border border-red-200 shadow-sm text-red-600"
                : "text-red-400 hover:text-red-600"
            }`}
          >
            {tab === "MD" ? "MD's Evaluation" : "Team's Evaluation"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          background: "rgba(237,233,254,0.3)",
          borderRadius: 16,
          border: "1px solid rgba(167,139,250,0.2)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <ScoreCard data={scoreData} />

        {/* Questions Form */}
        <QuestionsAndAnswers
          header={
            activeTab === "MD"
              ? "MD/Owner Self-Evaluation"
              : "Team Self-Evaluation"
          }
          questions={questions}
          onScoreChange={handleScoreChange}
          notes={notes}
          setNotes={setNotes}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* History Table */}
      {evaluations.length > 0 && (
        <div
          style={{ marginTop: 32 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2
            style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}
            className="text-gray-900"
          >
            Previous {evaluationType === "md" ? "MD" : "Team"} Evaluations
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead>Notes</TableHead>
                  {questions.map((q) => (
                    <TableHead key={q.key} className="min-w-[150px]">
                      {q.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...evaluations].reverse().map((ev, idx) => (
                  <TableRow key={ev.id ?? idx}>
                    <TableCell className="font-medium">
                      {ev.evaluation_date
                        ? new Date(ev.evaluation_date).toLocaleDateString()
                        : ev.date || "-"}
                    </TableCell>
                    <TableCell
                      className="text-gray-600 max-w-[200px] truncate"
                      title={ev.notes}
                    >
                      {ev.notes || "-"}
                    </TableCell>
                    {questions.map((q) => (
                      <TableCell
                        key={q.key}
                        className="text-center font-semibold text-purple-600"
                      >
                        {ev.scores && q.key ? ev.scores[q.key] : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
