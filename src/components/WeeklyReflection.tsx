import React, { useState, useEffect } from 'react';
import { Info, Plus, Loader2, CheckCircle2, ArrowLeft, Edit, Trash2 } from 'lucide-react';

const API_BASE_URL = "http://localhost:3000";

function WeeklyReflection() {
  // Views: 'list' | 'form'
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  
  // List State
  const [journals, setJournals] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Form fields state
  const [currentJournalId, setCurrentJournalId] = useState<number | null>(null);
  const [challenge, setChallenge] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [insight, setInsight] = useState('');
  const [balanceRating, setBalanceRating] = useState(3);
  const [wins, setWins] = useState<any[]>([]);

  // API Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const lifeBalanceStats = [
    { id: 1, emoji: '💼', score: 0 },
    { id: 2, emoji: '🤝', score: 0 },
    { id: 3, emoji: '❤️', score: 0 },
    { id: 4, emoji: '⚖️', score: 0 },
    { id: 5, emoji: '🔥', score: 0 },
  ];

  // =========================================
  // 1. FETCH LIST (GET)
  // =========================================
  const fetchJournals = async () => {
    setIsLoadingList(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/user_journals?journal_type=weekly`, {
        headers: { ...(token && { "Authorization": `Bearer ${token}` }) }
      });
      if (res.ok) {
        const data = await res.json();
        // Assuming API returns array of journals
        setJournals(Array.isArray(data) ? data : (data.user_journals || []));
      }
    } catch (error) {
      console.error("Failed to fetch journals", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (currentView === 'list') {
      fetchJournals();
    }
  }, [currentView]);

  // =========================================
  // 2. DELETE (DELETE)
  // =========================================
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this reflection?")) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/user_journals/${id}`, {
        method: "DELETE",
        headers: { ...(token && { "Authorization": `Bearer ${token}` }) }
      });
      
      if (res.ok) {
        setJournals(prev => prev.filter(j => j.id !== id));
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
  const handleEdit = (journal: any) => {
    setCurrentJournalId(journal.id);
    setGratitude(journal.gratitude_note || '');
    setBalanceRating(journal.alignment_score || 3);
    setChallenge(journal.data?.biggest_challenge || '');
    setInsight(journal.data?.key_insight || '');
    setWins(journal.data?.wins || []);
    setCurrentView('form');
  };

  // Open empty form for new entry
  const handleAddNew = () => {
    setCurrentJournalId(null);
    setGratitude('');
    setBalanceRating(3);
    setChallenge('');
    setInsight('');
    setWins([]);
    setSubmitStatus({ type: 'idle', message: '' });
    setCurrentView('form');
  };

  // =========================================
  // 4. SAVE (POST or PUT/PATCH)
  // =========================================
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus({ type: 'idle', message: '' });

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const payload = {
      user_journal: {
        journal_type: "weekly",
        start_date: today.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
        gratitude_note: gratitude || "Grateful for family support",
        alignment_score: balanceRating,
        data: {
          weekly_story: "Strong execution week",
          wins: wins.length > 0 ? wins : [
            { description: "Closed enterprise deal", day: "Monday", category: "career", completed: true }
          ],
          biggest_challenge: challenge || "Distractions",
          challenge_cause: "Phone usage",
          key_insight: insight || "Focus creates momentum",
          mission_connection: "Strong alignment",
          life_balance_rating: balanceRating
        }
      }
    };

    try {
      const token = localStorage.getItem("auth_token");
      
      // Agar ID hai toh PUT (Update), warna POST (Create)
      const url = currentJournalId 
        ? `${API_BASE_URL}/user_journals/${currentJournalId}` 
        : `${API_BASE_URL}/user_journals`;
      
      const method = currentJournalId ? "PUT" : "POST"; // Make sure your API expects PUT for updates

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      setSubmitStatus({ type: 'success', message: currentJournalId ? 'Updated successfully!' : 'Saved successfully!' });
      
      // Wait a second, then go back to list
      setTimeout(() => setCurrentView('list'), 1500);
      
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmitStatus({ type: 'error', message: 'Failed to save reflection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================
  // RENDER: LIST VIEW
  // =========================================
  if (currentView === 'list') {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-8 font-sans space-y-6 bg-[#fdfbf9] min-h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Weekly Reflections</h1>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Reflection
          </button>
        </div>

        {isLoadingList ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : journals.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
            No reflections found. Start writing your first one!
          </div>
        ) : (
          <div className="grid gap-4">
            {journals.map((journal: any) => (
              <div key={journal.id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{journal.start_date} to {journal.end_date}</p>
                  <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">{journal.gratitude_note || 'Weekly Reflection'}</h3>
                  <p className="text-sm text-gray-600 mt-1">Alignment Score: {journal.alignment_score}/5</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(journal)}
                    className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
    );
  }

  // =========================================
  // RENDER: FORM VIEW (CREATE/EDIT)
  // =========================================
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 font-sans space-y-10 bg-[#fdfbf9] min-h-screen">
      
      {/* Form Header with Back Button */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <button 
          onClick={() => setCurrentView('list')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {currentJournalId ? 'Edit Weekly Reflection' : 'New Weekly Reflection'}
        </h1>
      </div>

      {/* 1. WINS OF PAST WEEK */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Wins of Past Week</h2>
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
          </div>
        </div>
        <div className="border-y-2 border-dashed border-orange-200/60 bg-[#fefdfb] py-10 flex flex-col items-center justify-center rounded-sm">
          <p className="text-[15px] font-medium text-gray-800 mb-3">{wins.length > 0 ? `${wins.length} wins recorded` : 'No wins added yet'}</p>
          <button className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4" /> Add / Edit Wins
          </button>
        </div>
      </section>

      {/* 2. BIGGEST CHALLENGE & CAUSE */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Biggest Challenge & Cause</h2>
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
        <h2 className="text-lg font-bold text-gray-900 mb-4">Life Balance Rating: {balanceRating}</h2>
        <input 
          type="range" 
          min="1" max="5" step="0.1"
          value={balanceRating}
          onChange={(e) => setBalanceRating(parseFloat(e.target.value))}
          className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer bg-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-400"
          style={{ background: `linear-gradient(to right, #111827 0%, #111827 ${((balanceRating - 1) / 4) * 100}%, #e5e7eb ${((balanceRating - 1) / 4) * 100}%, #e5e7eb 100%)` }}
        />
      </section>

      {/* 5. SUBMIT ACTIONS */}
      <section className="pt-6 border-t border-gray-200 flex flex-col items-end gap-3">
        {submitStatus.type === 'error' && <p className="text-sm text-red-600 font-medium">{submitStatus.message}</p>}
        {submitStatus.type === 'success' && <p className="text-sm text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {submitStatus.message}</p>}
        
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Saving...' : currentJournalId ? 'Update Reflection' : 'Save Reflection'}
        </button>
      </section>

    </div>
  );
}

export default WeeklyReflection;