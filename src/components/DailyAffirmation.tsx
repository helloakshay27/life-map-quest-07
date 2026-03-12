import { useState, useEffect } from "react";

const API_BASE_URL = "https://life-api.lockated.com";

export default function DailyAffirmation() {
  const [affirmations, setAffirmations] = useState([]);
  const [current, setCurrent] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAffirmations = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${API_BASE_URL}/affirmations`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data ?? [];
        setAffirmations(list);
        setCurrent(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAffirmations();
  }, []);

  const total = affirmations.length;
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  const getText = (item) => {
    if (!item) return "";
    if (typeof item === "string") return `"${item}"`;
    return `"${item.statement ?? item.text ?? item.affirmation ?? item.content ?? ""}"`;
  };

  return (
    <div className="bg-purple-50 rounded-2xl p-6  w-full font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
              fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"
            />
            <path
              d="M19 2L19.8 5.2L23 6L19.8 6.8L19 10L18.2 6.8L15 6L18.2 5.2L19 2Z"
              fill="white" strokeLinejoin="round"
            />
            <path
              d="M5 16L5.5 18L7.5 18.5L5.5 19L5 21L4.5 19L2.5 18.5L4.5 18L5 16Z"
              fill="white" strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-bold text-base text-gray-900">Your Daily Affirmation</span>
        <span
          title="Info"
          className="w-[18px] h-[18px] rounded-full border border-gray-400 inline-flex items-center justify-center text-gray-400 text-[11px] font-bold cursor-pointer flex-shrink-0"
        >
          i
        </span>
      </div>

      {/* Affirmation Card */}
      <div className="bg-yellow-50 rounded-xl px-4 py-3 flex items-center justify-between mb-3 min-h-[66px]">
        {/* Left Arrow */}
        <button
          onClick={prev}
          disabled={loading || total === 0}
          className="text-purple-500 text-2xl font-light px-2 hover:text-purple-700 disabled:opacity-30 transition-colors"
        >
          ‹
        </button>

        {/* Content */}
        <div className="flex-1 text-center">
          {loading ? (
            <div className="text-purple-400 text-sm">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : total === 0 ? (
            <div className="text-purple-400 text-sm">No affirmations found.</div>
          ) : (
            <>
              <div className="text-purple-500 font-semibold text-xs mb-1">
                Affirmation ({current + 1} of {total})
              </div>
              <div className="text-purple-700 italic text-sm font-medium">
                {getText(affirmations[current])}
              </div>
            </>
          )}
        </div>

        {/* Right Arrow */}
        <button
          onClick={next}
          disabled={loading || total === 0}
          className="text-purple-500 text-2xl font-light px-2 hover:text-purple-700 disabled:opacity-30 transition-colors"
        >
          ›
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="A positive statement about yourself..."
        className="w-full min-h-[90px] rounded-xl border border-gray-300 px-3 py-3 text-sm text-gray-700 resize-y outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all bg-white mb-3 font-sans"
      />

      {/* Tip Footer */}
      <div className="bg-violet-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
        <span className="text-sm">💡</span>
        <span className="text-violet-700 text-xs italic">
          Present tense ("I am"), positive, specific, repeat daily with emotion.
        </span>
      </div>
    </div>
  );
}