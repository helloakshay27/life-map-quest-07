import { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  LayoutDashboard,
  TrendingUp,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";

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
function KraItem({ item, index, currentScore, onScoreChange }) {
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

        {/* Score Buttons */}
        <div className="flex gap-1 shrink-0 mr-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => onScoreChange(item.key || item.id, num)}
              className={`w-8 h-8 rounded-full font-semibold text-sm flex items-center justify-center transition-all ${
                currentScore === num
                  ? "bg-purple-600 text-white border-none scale-110 shadow-md"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {num}
            </button>
          ))}
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
  questions = [],
  scores,
  onScoreChange,
  onSubmit,
  isSubmitting,
  notes,
  onNotesChange,
}) {
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
      <div className="space-y-3">
        {questions.length > 0 ? (
          questions.map((q, i) => (
            <KraItem
              key={q.key || q.id || i}
              item={q}
              index={i}
              currentScore={scores[q.key || q.id] || 0}
              onScoreChange={onScoreChange}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-red-50 rounded-xl text-red-500">
            No questions available
          </div>
        )}
      </div>

      {/* Additional Notes */}
      <div className="mt-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={onNotesChange}
          placeholder="Any additional observations or action items..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 p-4 text-sm bg-gray-50 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
        />
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting || questions.length === 0}
        className={`w-full mt-4 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
          isSubmitting || questions.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 active:scale-[0.98]"
        }`}
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        {isSubmitting ? "Submitting..." : "Submit Evaluation"}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KraSelfEvaluation() {
  const [activeTab, setActiveTab] = useState("MD");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // Data States
  const [questions, setQuestions] = useState([]);
  const [notes, setNotes] = useState("");
  const [scores, setScores] = useState({});
  const [evaluations, setEvaluations] = useState([]);
  const [scoreData, setScoreData] = useState({
    score: { achieved: 0, total: 0 },
    title: "No Data",
    message: "Complete evaluation to see your score",
  });

  const evaluationType = activeTab === "MD" ? "md" : "team";

  // ─── FETCH QUESTIONS ───────────────────
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);

      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          alert("Please login first");
          return;
        }

        console.log("Fetching questions for:", evaluationType);

        const res = await fetch(
          `${API_BASE_URL}/kra_evaluations?evaluation_type=${evaluationType}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          console.log("Questions data:", data);

          // Handle response
          let questionsList = [];
          if (Array.isArray(data)) questionsList = data;
          else if (data.questions) questionsList = data.questions;
          else if (data.data) questionsList = data.data;

          if (questionsList.length > 0) {
            setQuestions(questionsList);

            // Initialize scores
            const initialScores = {};
            questionsList.forEach((q) => {
              const key = q.key || q.id;
              initialScores[key] = 0;
            });
            setScores(initialScores);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [evaluationType, refresh]);

  // ─── FETCH LATEST EVALUATION FOR SCORE ───────────────────
  useEffect(() => {
    const fetchLatestEvaluation = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        const res = await fetch(
          `${API_BASE_URL}/kra_evaluations?evaluation_type=${evaluationType}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          console.log("Evaluations data:", data);

          let evaluationsList = [];
          if (Array.isArray(data)) evaluationsList = data;
          else if (data.evaluations) evaluationsList = data.evaluations;

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
          }
        }
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      }
    };

    fetchLatestEvaluation();
  }, [evaluationType, refresh, questions.length]);

  // ─── HANDLE SCORE CHANGE ───────────────────────
  const handleScoreChange = (key, val) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  // ─── HANDLE NOTES CHANGE ───────────────────────
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // ─── HANDLE SUBMIT ───────────────────────
  const handleSubmit = async () => {
    // Check if any scores are filled
    const hasScores = Object.values(scores).some((v) => v > 0);
    if (!hasScores) {
      alert("Please rate at least one area.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      // Filter out zero scores
      const cleanScores = {};
      Object.entries(scores).forEach(([key, value]) => {
        if (value > 0) cleanScores[key] = value;
      });

      const payload = {
        kra_evaluation: {
          evaluation_type: evaluationType,
          evaluation_date: today,
          notes: notes,
          scores: cleanScores,
        },
      };

      console.log("Submitting:", payload);

      const res = await fetch(`${API_BASE_URL}/kra_evaluations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Evaluation submitted successfully! 🎉");

        // Reset form
        const resetScores = {};
        questions.forEach((q) => {
          const key = q.key || q.id;
          resetScores[key] = 0;
        });
        setScores(resetScores);
        setNotes("");

        // Refresh data
        setRefresh((prev) => !prev);
      } else {
        const error = await res.text();
        alert("Error: " + error);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Network error!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-7">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-700" />
            </button>
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
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-1">
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
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
              <svg
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {tab === "MD" ? (
                  <>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                  </>
                ) : (
                  <>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </>
                )}
              </svg>
              {tab === "MD" ? "MD's Evaluation" : "Team's Evaluation"}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-purple-600 w-10 h-10" />
            <p className="text-gray-400 animate-pulse font-medium">
              Loading questions...
            </p>
          </div>
        ) : (
          <div className="bg-purple-50/30 rounded-2xl border border-purple-200/50 p-4 space-y-4">
            {/* Score Card */}
            <ScoreCard data={scoreData} />

            {/* Recent Evaluations */}
            {evaluations.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Recent Evaluations
                </h3>
                <div className="space-y-2">
                  {evaluations
                    .slice(-3)
                    .reverse()
                    .map((evalItem) => {
                      const evalScore = Object.values(
                        evalItem.scores || {},
                      ).reduce((a, b) => a + Number(b), 0);
                      return (
                        <div
                          key={evalItem.id}
                          className="text-sm text-gray-600 flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                        >
                          <span>
                            {new Date(
                              evalItem.evaluation_date,
                            ).toLocaleDateString()}
                          </span>
                          <span className="font-bold text-purple-600">
                            Score: {evalScore}/{questions.length * 5 || 35}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Questions Form */}
            <QuestionsAndAnswers
              header={
                activeTab === "MD"
                  ? "MD/Owner Self-Evaluation"
                  : "Team Self-Evaluation"
              }
              questions={questions}
              scores={scores}
              onScoreChange={handleScoreChange}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              notes={notes}
              onNotesChange={handleNotesChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
