import { useState, useEffect } from "react";
import { apiRequest } from "../config/api";
import { useToast } from "../hooks/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
// default question sets with score keys for API payload
const defaultMD = [
  { id: 1, key: "vision_strategy_score", icon: "🎯", title: "Vision & Strategy",        description: "Is my team crystal clear about where the company is headed and what success looks like this year?",   kpi: "Team alignment score, OKR completion rate", score: 3 },
  { id: 2, key: "systems_processes_score", icon: "⚙️", title: "Systems & Processes",      description: "Can my business run smoothly for 2 weeks without my direct involvement?",                              kpi: "SOP coverage, escalation frequency",         score: 3 },
  { id: 3, key: "leadership_team_score", icon: "👥", title: "Leadership & Team",         description: "Do I have the right people leading each function, and do they take ownership?",                        kpi: "Leadership coverage, accountability index",  score: 3 },
  { id: 4, key: "financial_health_score", icon: "💰", title: "Financial Health",          description: "Do I know my company's profit, cash flow, and break-even at any point in time?",                       kpi: "P&L accuracy, cash flow visibility",         score: 3 },
  { id: 5, key: "growth_sales_score", icon: "📈", title: "Growth & Sales Engine",     description: "Is my revenue growing predictably every quarter from repeat and new clients?",                         kpi: "QoQ revenue growth, repeat vs new ratio",    score: 3 },
  { id: 6, key: "innovation_technology_score", icon: "💡", title: "Innovation & Technology",   description: "Have we implemented new tools, automation, or innovations in the last 6 months?",                      kpi: "Tools adopted, automation ROI",              score: 3 },
  { id: 7, key: "personal_growth_score", icon: "🌱", title: "Personal Growth & Delegation", description: "Am I spending most of my time on strategic growth, not daily firefighting?",                      kpi: "Delegation rate, deep work hours/week",      score: 3 },
];

const defaultTeam = [
  { id: 1, key: "goal_clarity_alignment_score", icon: "🤝", title: "Goal Clarity & Alignment", description: "Does every team member understand and align with company goals?",              kpi: "OKR alignment rate, clarity surveys",        score: 3 },
  { id: 2, key: "ownership_accountability_score", icon: "📋", title: "Ownership & Accountability", description: "Does each team member take full ownership of their deliverables?",         kpi: "On-time task completion rate",               score: 3 },
  { id: 3, key: "process_discipline_score", icon: "💬", title: "Process Discipline",           description: "Are team processes followed consistently and efficiently?",                 kpi: "SOP adherence, rework rate",                score: 3 },
  { id: 4, key: "collaboration_communication_score", icon: "🏆", title: "Collaboration & Communication", description: "Does the team collaborate effectively across departments?",              kpi: "Cross-team project success rate",            score: 3 },
  { id: 5, key: "learning_innovation_score", icon: "🔄", title: "Learning & Innovation",      description: "Is the team actively growing skills and fostering innovation?",           kpi: "Training hours, new ideas implemented",     score: 3 },
  { id: 6, key: "client_stakeholder_focus_score", icon: "📚", title: "Client/Stakeholder Focus", description: "Does the team keep clients/stakeholders front of mind?",                 kpi: "CSAT, stakeholder feedback",                score: 3 },
  { id: 7, key: "reliability_consistency_score", icon: "🎯", title: "Reliability & Consistency",  description: "Is the team's output dependable and steady?",                         kpi: "Delivery variance, uptime",                score: 3 },
];

// ─── ScoreCard ────────────────────────────────────────────────────────────────

function ScoreCard({ data }) {
  const { score = { achieved: 21, total: 35 }, title = "Needs Improvement", message = "You're driving growth, but systems aren't scaling with you." } = data || {};
  const pct = Math.min(100, Math.round((score.achieved / score.total) * 100));

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)",
        borderRadius: "20px",
        padding: "40px 40px 36px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(234,88,12,0.35)",
      }}
    >
      {/* Decorative circles */}
      <div style={{ position:"absolute", top:-30, right:-30, width:130, height:130, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />
      <div style={{ position:"absolute", top:10, right:10, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.10)" }} />

      {/* Trending icon button */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}
      >
        <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      </div>

      {/* Score */}
      <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 500, marginBottom: 4, letterSpacing: "0.03em" }}>
        Your Total Score
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 14 }}>
        <span style={{ color: "#fff", fontSize: 68, fontWeight: 800, lineHeight: 1 }}>{score.achieved}</span>
        <span style={{ color: "rgba(255,255,255,0.70)", fontSize: 32, fontWeight: 600 }}>/{score.total}</span>
      </div>

      {/* Title & Message */}
      <p style={{ color: "#fff", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{title}</p>
      <p style={{ color: "rgba(255,255,255,0.80)", fontSize: 15, marginBottom: 24, fontStyle: "italic" }}>{message}</p>

      {/* Progress Bar */}
      <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 99, height: 10, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "#fff",
            borderRadius: 99,
            transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
    </div>
  );
}

// ─── KRA Question Item ────────────────────────────────────────────────────────

function KraItem({ item, index, onScoreChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #f0f0f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "20px 22px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Icon */}
        <span style={{ fontSize: 30, flexShrink: 0 }}>{item.icon}</span>

        {/* Title & Description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a", margin: 0 }}>
            {index + 1}. {item.title}
          </p>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "3px 0 0", lineHeight: 1.4 }}>
            {item.description}
          </p>
        </div>

        {/* Score - editable number for simplicity */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginRight: 6 }}>
          <input
            type="number"
            min={0}
            max={5}
            value={item.score}
            onChange={e => onScoreChange(index, Number(e.target.value))}
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
          <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>/ 5</span>
        </div>

        {/* Chevron */}
        <svg
          width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"
          style={{ flexShrink: 0, transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded KPI */}
      {open && (
        <div style={{ padding: "0 18px 16px 56px", borderTop: "1px solid #f3f4f6" }}>
          <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 10, lineHeight: 1.6 }}>
            <strong style={{ color: "#374151" }}>KPI:</strong> {item.kpi}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── QuestionsAndAnswers ──────────────────────────────────────────────────────

function QuestionsAndAnswers({ header, questions, onScoreChange, notes, setNotes, onSubmit }) {
  // `questions` is provided by the parent so that state lives in KraSelfEvaluation.
  // any API-provided overrides can be injected there as well.

  return (
      <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: "18px 20px", background: "linear-gradient(135deg,#ede9fe,#f3f4f6)", borderRadius: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0 }}>
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 17, color: "#1a1a1a", margin: 0 }}>{header}</p>
          <p style={{ fontSize: 13.5, color: "#6b7280", margin: "3px 0 0" }}>Rate yourself on each Key Result Area</p>
        </div>
      </div>

      {/* Question List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {questions.map((q, i) => (
          <KraItem key={q.id ?? i} item={q} index={i} onScoreChange={onScoreChange} />
        ))}
      </div>

      {/* Additional Notes */}
      <div style={{ marginTop: 20 }}>
        <p style={{ fontWeight: 600, fontSize: 15, color: "#374151", marginBottom: 10 }}>Additional Notes (Optional)</p>
        <textarea
          placeholder="Any additional observations or action items..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            padding: "14px 16px",
            fontSize: 15,
            color: "#374151",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            background: "#fafafa",
            boxSizing: "border-box",
          }}
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
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        Submit Evaluation
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const mockScore = {
  md: { score: { achieved: 21, total: 35 }, title: "Needs Improvement", message: "You're driving growth, but systems aren't scaling with you." },
  team: { score: { achieved: 28, total: 35 }, title: "Good Performance", message: "Your team is performing well with room for excellence." },
};

export default function KraSelfEvaluation() {
  const [activeTab, setActiveTab] = useState("MD");
  const [notes, setNotes] = useState("");
  const [questions, setQuestions] = useState(defaultMD);
  const [history, setHistory] = useState([]);
  const { toast } = useToast();

  const evaluationType = activeTab === "MD" ? "md" : "team";
  const scoreData = mockScore[evaluationType];

  // when tab switches, reset questions to the appropriate defaults
  useEffect(() => {
    setQuestions(evaluationType === "md" ? defaultMD : defaultTeam);
    setNotes("");
    fetchHistory();
  }, [evaluationType]);

  const fetchHistory = async () => {
    try {
      const res = await apiRequest(`/kra_evaluations?evaluation_type=${evaluationType}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // API might return { kra_evaluations: [...] } or just an array
      setHistory(json.kra_evaluations || json || []);
    } catch (err) {
      console.error("failed to fetch history", err);
    }
  };

  const handleScoreChange = (index, newScore) => {
    setQuestions(prev => {
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
      toast({ title: "Evaluation submitted", description: "Your responses have been saved." });
      // refresh list after successful submission
      fetchHistory();
    } catch (err) {
      console.error("failed to submit evaluation", err);
      toast({ title: "Submission failed", description: "Could not send evaluation. Please try again.", variant: "destructive" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", padding: "40px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
              </div>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: 0 }}>KRA Self-Evaluation</h1>
                <p style={{ fontSize: 14, color: "#6b7280", margin: "2px 0 0" }}>Assess your performance across key result areas</p>
              </div>
            </div>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontWeight: 500, marginTop: 4 }}>
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#e9e9e4", borderRadius: 12, padding: 4, marginBottom: 18 }}>
          {["MD", "Team"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 9,
                border: activeTab === tab ? "1px solid rgba(0,0,0,0.08)" : "1px solid transparent",
                background: activeTab === tab ? "#fff" : "transparent",
                fontWeight: 600,
                fontSize: 13.5,
                color: activeTab === tab ? "#111827" : "#6b7280",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
              }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {tab === "MD"
                  ? <><circle cx="12" cy="8" r="4" /><path d="M6 20v-2a6 6 0 0112 0v2" /></>
                  : <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>
                }
              </svg>
              {tab === "MD" ? "MD's Evaluation" : "Team's Evaluation"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: "rgba(237,233,254,0.3)", borderRadius: 16, border: "1px solid rgba(167,139,250,0.2)", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <ScoreCard data={scoreData} />
          <QuestionsAndAnswers
            header={activeTab === "MD" ? "MD/Owner Self-Evaluation" : "Team Self-Evaluation"}
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
                  {questions.map(q => (
                    <TableHead key={q.key}>{q.title}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((ev, idx) => (
                  <TableRow key={ev.id ?? idx}>
                    <TableCell>{ev.evaluation_date || ev.date || "-"}</TableCell>
                    <TableCell>{ev.notes || ""}</TableCell>
                    {questions.map(q => (
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