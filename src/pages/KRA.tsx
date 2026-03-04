import QuestionsAndAnswers from '@/components/Question&answers';
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ScoreCard from '@/components/ScoreCard';

const API_BASE_URL = "https://life-api.lockated.com";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KraQuestion {
  id: number;
  icon: string;
  title: string;
  description: string;
  kpi: string;
  score: number;
}

interface ScoreData {
  score: { achieved: number; total: number };
  title: string;
  message: string;
}

interface KraApiResponse {
  score?: { achieved: number; total: number };
  achieved?: number;
  total?: number;
  title?: string;
  message?: string;
  questions?: KraQuestion[];
  kra_items?: KraQuestion[];
  evaluations?: KraQuestion[];
  [key: string]: unknown;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useKraData(evaluationType: "md" | "team") {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [questions, setQuestions] = useState<KraQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      const url =
        evaluationType === "team"
          ? `${API_BASE_URL}/kra_evaluations?evaluation_type=team`
          : `${API_BASE_URL}/kra_evaluations`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message ?? `Failed to fetch (${res.status})`);
      }

      const json: KraApiResponse = await res.json();

      // ── Normalize ScoreCard data ──────────────────────────────────────────
      setScoreData({
        score: json.score ?? {
          achieved: (json.achieved as number) ?? 0,
          total: (json.total as number) ?? 35,
        },
        title: (json.title as string) ?? "—",
        message: (json.message as string) ?? "",
      });

      // ── Normalize questions array ─────────────────────────────────────────
      // Handles: { questions: [...] } | { kra_items: [...] } | { evaluations: [...] } | top-level array
      const rawList: KraQuestion[] =
        (json.questions as KraQuestion[]) ??
        (json.kra_items as KraQuestion[]) ??
        (json.evaluations as KraQuestion[]) ??
        (Array.isArray(json) ? (json as unknown as KraQuestion[]) : []);

      setQuestions(rawList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [evaluationType]);

  return { scoreData, questions, isLoading, error, refetch: fetchData };
}

// ─── Tab Panel ────────────────────────────────────────────────────────────────

function TabPanel({
  evaluationType,
  header,
}: {
  evaluationType: "md" | "team";
  header: string;
}) {
  const { scoreData, questions, isLoading, error, refetch } = useKraData(evaluationType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* ScoreCard gets normalized score/title/message */}
      {scoreData && <ScoreCard data={scoreData} />}

      {/* QuestionsAndAnswers gets API questions + header */}
      <QuestionsAndAnswers
        header={header}
        apiQuestions={questions}
        evaluationType={evaluationType}
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function KraSelfEvaluation() {
  const [activeTab, setActiveTab] = useState<"MD" | "Team">("MD");
  const tabs: Array<"MD" | "Team"> = ["MD", "Team"];

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-4xl p-6 md:p-8 rounded-xl shadow-sm">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">KRA Self-Evaluation</h1>
              <p className="text-gray-500 mt-1">Assess your performance across key result areas</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm font-medium mt-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help
          </button>
        </div>

        {/* TABS */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }`}
            >
              {tab === "MD" ? "MD's Evaluation" : "Team's Evaluation"}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="w-full bg-purple-50/50 rounded-xl min-h-[300px] border border-purple-100/50">
          {activeTab === "MD" && (
            <TabPanel evaluationType="md" header="MD's Evaluation" />
          )}
          {activeTab === "Team" && (
            <TabPanel evaluationType="team" header="Team's Evaluation" />
          )}
        </div>

      </div>
    </div>
  );
}

export default KraSelfEvaluation;