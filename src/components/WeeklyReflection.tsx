import React, { useState, useEffect } from "react";
import {
  Info,
  Plus,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
} from "lucide-react";
import { apiRequest } from "@/config/api";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface Win {
  description: string;
  day: string;
  category: string;
  completed: boolean;
}

interface JournalEntry {
  id: number;
  start_date: string;
  end_date: string;
  gratitude_note?: string | null;
  alignment_score?: number | null;
  data?: {
    biggest_challenge?: string;
    key_insight?: string;
    wins?: Win[];
    life_balance_rating?: number;
    weekly_story?: string;
    mission_connection?: string;
    challenge_cause?: string;
  };
}

function WeeklyReflection() {
  // Views: 'list' | 'form'
  const [currentView, setCurrentView] = useState<"list" | "form">("list");

  // List State
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Form fields state
  const [currentJournalId, setCurrentJournalId] = useState<number | null>(null);
  const [challenge, setChallenge] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [insight, setInsight] = useState("");
  const [balanceRating, setBalanceRating] = useState(3);
  const [wins, setWins] = useState<Win[]>([]);

  // API Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Friend's Auto-Calculated Life Balance placeholder data
  const lifeBalanceStats = [
    { id: 1, emoji: "💼", score: 0 },
    { id: 2, emoji: "🤝", score: 0 },
    { id: 3, emoji: "❤️", score: 0 },
    { id: 4, emoji: "⚖️", score: 0 },
    { id: 5, emoji: "🔥", score: 0 },
  ];

  // =========================================
  // 1. FETCH LIST (GET)
  // =========================================
  const fetchJournals = async () => {
    setIsLoadingList(true);
    try {
      const res = await apiRequest("/user_journals?journal_type=weekly");
      if (res.ok) {
        const data = await res.json();
        setJournals(Array.isArray(data) ? data : data.user_journals || []);
      }
    } catch (error) {
      console.error("Failed to fetch journals", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (currentView === "list") {
      fetchJournals();
    }
  }, [currentView]);

  // =========================================
  // 2. DELETE (DELETE)
  // =========================================
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this reflection?"))
      return;
    try {
      const res = await apiRequest(`/user_journals/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setJournals((prev) => prev.filter((j) => j.id !== id));
      } else {
        alert("Failed to delete.");
      }
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  // =========================================
  // 3. EDIT POPULATION
  // =========================================
  const handleEdit = (journal: JournalEntry) => {
    setCurrentJournalId(journal.id);
    setGratitude(journal.gratitude_note || "");
    setBalanceRating(journal.alignment_score || 3);
    setChallenge(journal.data?.biggest_challenge || "");
    setInsight(journal.data?.key_insight || "");
    setWins(journal.data?.wins || []);
    setCurrentView("form");
  };

  // Open empty form for new entry
  const handleAddNew = () => {
    setCurrentJournalId(null);
    setGratitude("");
    setBalanceRating(3);
    setChallenge("");
    setInsight("");
    setWins([]);
    setSubmitStatus({ type: "idle", message: "" });
    setCurrentView("form");
  };

  // =========================================
  // 4. SAVE (POST or PUT/PATCH)
  // =========================================
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus({ type: "idle", message: "" });

    const today = new Date();
    const startDate = format(
      startOfWeek(today, { weekStartsOn: 0 }),
      "yyyy-MM-dd",
    );
    const endDate = format(endOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd");

    const payload = {
      user_journal: {
        journal_type: "weekly",
        start_date: startDate,
        end_date: endDate,
        gratitude_note: gratitude,
        alignment_score: balanceRating,
        data: {
          weekly_story: "",
          wins: wins,
          biggest_challenge: challenge,
          challenge_cause: challenge, // same field for now; extend if UI adds separate cause input
          key_insight: insight,
          mission_connection: "",
          life_balance_rating: balanceRating,
        },
      },
    };

    try {
      const url = currentJournalId
        ? `/user_journals/${currentJournalId}`
        : "/user_journals";
      const method = currentJournalId ? "PUT" : "POST";

      const response = await apiRequest(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Backend error:", errText);
        throw new Error(`Failed: ${response.status}`);
      }

      const responseData = await response.json();
      // Capture newly created journal id for subsequent PUT
      if (!currentJournalId) {
        const newId =
          responseData.journal?.id ??
          responseData.user_journal?.id ??
          responseData.id;
        if (newId) setCurrentJournalId(newId);
      }

      setSubmitStatus({
        type: "success",
        message: currentJournalId
          ? "Updated successfully!"
          : "Saved successfully!",
      });
      setTimeout(() => setCurrentView("list"), 1500);
    } catch (error: unknown) {
      console.error("Submission error:", error);
      setSubmitStatus({ type: "error", message: "Failed to save reflection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================
  // RENDER: LIST VIEW
  // =========================================
  if (currentView === "list") {
    return (
      <div className="font-sans">
        {/* Orange Header */}
        <div className="px-6 pt-5 pb-4 border-b border-orange-100 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500 shadow-sm shrink-0">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[17px] font-bold text-gray-900">Review of Your Week</h2>
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </div>
                <p className="text-[13px] text-gray-500 mt-0.5">Reflect on wins, challenges, and insights</p>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> New Reflection
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isLoadingList ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
            </div>
          ) : journals.length === 0 ? (
            <div className="text-center py-16 text-gray-500 border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/30">
              No reflections found. Start writing your first one!
            </div>
          ) : (
            <div className="grid gap-4">
              {journals.map((journal: JournalEntry) => (
                <div
                  key={journal.id}
                  className="bg-white border-l-4 border-l-orange-400 border border-orange-100 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {journal.start_date} to {journal.end_date}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">
                      {journal.gratitude_note || "Weekly Reflection"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Alignment Score: {journal.alignment_score}/5
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(journal)}
                      className="p-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(journal.id)}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================
  // RENDER: FORM VIEW (CREATE/EDIT)
  // =========================================
  return (
    <div className="font-sans">
      {/* Orange Header */}
      <div className="px-6 pt-5 pb-4 border-b border-orange-100 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500 shadow-sm shrink-0">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">
                {currentJournalId ? "Edit Weekly Reflection" : "New Weekly Reflection"}
              </h2>
              <p className="text-[13px] text-gray-500 mt-0.5">Wins, challenges, gratitude & life balance</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView("list")}
            className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10">

      {/* 1. WINS OF PAST WEEK */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              Wins of Past Week
            </h2>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </div>
        </div>
        <div className="border-y-2 border-dashed border-orange-200/60 bg-[#fefdfb] py-10 flex flex-col items-center justify-center rounded-sm">
          <p className="text-[15px] font-medium text-gray-800 mb-3">
            {wins.length > 0
              ? `${wins.length} wins recorded`
              : "No wins added yet"}
          </p>
          <button className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" /> Add / Edit Wins
          </button>
        </div>
      </section>

      {/* 2. BIGGEST CHALLENGE & CAUSE */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Biggest Challenge & Cause
        </h2>
        <p className="text-[15px] text-gray-600 mb-3">
          What was your biggest challenge this week, perhaps a recurring
          behavior, and what caused it?
        </p>
        <textarea
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-y"
          placeholder="Type your answer here..."
        />
      </section>

      {/* 3. GRATITUDE & KEY INSIGHT */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Gratitude</h2>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-y"
            placeholder="What are you grateful for?"
          />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Key Insight</h2>
          <p className="text-[15px] text-gray-600 mb-3 line-clamp-1">
            You are the ultimate creator for everything that manifests in
            your... What were your insights this week?
          </p>
          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none resize-y"
            placeholder="What were your insights this week?"
          />
        </div>
      </section>

      {/* 4. BALANCE SLIDER */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Auto-Calculated Life Balance
          </h2>
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
        </div>

        {/* 5 Balance Categories Row */}
        <div className="flex items-center justify-between gap-4 mb-8">
          {lifeBalanceStats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center flex-1">
              <div className="w-full h-14 bg-gray-200/70 rounded-xl mb-3"></div>
              <div className="flex flex-col items-center">
                <span className="text-lg mb-0.5">{stat.emoji}</span>
                <span className="text-sm font-bold text-gray-900">
                  {stat.score}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Section */}
        <div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">
            Life Balance Rating: {balanceRating}
          </h3>
          <div className="px-1 relative">
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={balanceRating}
              onChange={(e) => setBalanceRating(parseFloat(e.target.value))}
              className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer bg-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:shadow-md"
              style={{
                background: `linear-gradient(to right, #111827 0%, #111827 ${((balanceRating - 1) / 4) * 100}%, #e5e7eb ${((balanceRating - 1) / 4) * 100}%, #e5e7eb 100%)`,
              }}
            />
          </div>
        </div>
      </section>

      {/* 5. SUBMIT ACTIONS */}
      <section className="pt-6 border-t border-gray-200 flex flex-col items-end gap-3">
        {submitStatus.type === "error" && (
          <p className="text-sm text-red-600 font-medium">
            {submitStatus.message}
          </p>
        )}
        {submitStatus.type === "success" && (
          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> {submitStatus.message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting
            ? "Saving..."
            : currentJournalId
              ? "Update Reflection"
              : "Save Reflection"}
        </button>
      </section>
      </div>
    </div>
  );
}

export default WeeklyReflection;
