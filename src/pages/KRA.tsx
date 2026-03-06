import { useState, useEffect } from "react";
import { LayoutDashboard, TrendingUp } from "lucide-react";
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

const API_BASE_URL = "https://life-api.lockated.com";

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
    <div className="relative w-full max-w-4xl overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-[20px] p-8 pb-9 shadow-lg">
      {/* Decorative circles */}
      <div className="absolute -top-7 -right-7 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute top-2 right-2 w-20 h-20 rounded-full bg-white/10" />

      {/* Trending icon */}
      <div className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <TrendingUp className="text-white w-5 h-5" strokeWidth={2.2} />
      </div>

      {/* Score */}
      <p className="text-orange-100 text-sm font-medium mb-1 tracking-wide">
        Your Total Score
      </p>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-6xl font-black text-white">{score.achieved}</span>
        <span className="text-3xl font-semibold text-orange-200">
          /{score.total}
        </span>
      </div>

      {/* Title & Message */}
      <p className="text-2xl font-bold text-white mb-1">{title}</p>
      <p className="text-orange-100 text-sm mb-6 italic">{message}</p>

      {/* Progress Bar */}
      <div className="bg-white/25 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── KRA Question Item ────────────────────────────────────────────────────────

function KraItem({ item, index, onScoreChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="w-full flex items-center gap-4 py-5 px-5">
        {/* Icon */}
        <span className="text-3xl shrink-0">{item.icon || "📝"}</span>

        {/* Title & Description */}
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

        {/* Score - editable number for simplicity */}
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
        </div>

        {/* Chevron */}
        <button
          onClick={() => setOpen(!open)}
          className="bg-transparent border-none cursor-pointer p-1"
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

      {/* Expanded KPI */}
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
}) {
  // `questions` is provided by the parent so that state lives in KraSelfEvaluation.
  // any API-provided overrides can be injected there as well.

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
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

      {/* Question List */}
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

      {/* Additional Notes */}
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

      {/* Submit */}
      <button
        style={{
          marginTop: 16,
          width: "100%",
          padding: "16px",
          borderRadius: 12,
          background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          letterSpacing: "0.02em",
          boxShadow: "0 4px 14px rgba(109,40,217,0.35)",
          transition: "opacity 0.2s",
        }}
        onClick={onSubmit}
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
  const [history, setHistory] = useState([]);
  const { toast } = useToast();

  const evaluationType = activeTab === "MD" ? "md" : "team";

  const fetchHistory = async () => {
    try {
      const res = await apiRequest(
        `/kra_evaluations?evaluation_type=${evaluationType}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // API might return { kra_evaluations: [...] } or just an array
      setHistory(json.kra_evaluations || json || []);
    } catch (err) {
      console.error("failed to fetch history", err);
    }
  };

  // when tab switches, reset questions to the appropriate defaults
  useEffect(() => {
    setQuestions(evaluationType === "md" ? defaultMD : defaultTeam);
    setNotes("");
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationType]);

  const handleScoreChange = (index, newScore) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], score: newScore };
      return copy;
    });
  };

  const handleSubmit = async () => {
    // build same payload for both evaluation types (md or team)
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

    try {
      const res = await apiRequest("/kra_evaluations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("evaluation saved", data);
      toast({
        title: "Evaluation submitted",
        description: "Your responses have been saved.",
      });
      // refresh list after successful submission
      fetchHistory();
    } catch (err) {
      console.error("failed to submit evaluation", err);
      toast({
        title: "Submission failed",
        description: "Could not send evaluation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f5f0",
        padding: "40px 24px",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Page Header */}
        <div className="flex justify-between items-start mb-7">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                  KRA Self-Evaluation
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Assess your performance across key result areas
                </p>
              </div>
            </div>
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
                  ? "bg-white shadow-sm text-purple-600"
                  : "text-gray-400 hover:text-gray-600"
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
          />
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
              Previous {evaluationType === "md" ? "MD" : "Team"} Evaluations
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                  {questions.map((q) => (
                    <TableHead key={q.key}>{q.title}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((ev, idx) => (
                  <TableRow key={ev.id ?? idx}>
                    <TableCell>
                      {ev.evaluation_date || ev.date || "-"}
                    </TableCell>
                    <TableCell>{ev.notes || ""}</TableCell>
                    {questions.map((q) => (
                      <TableCell key={q.key}>
                        {ev.scores && q.key ? ev.scores[q.key] : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
