import { useState, useEffect } from "react";
import { ArrowLeft, HelpCircle, Loader2, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeekStrip from "@/components/journal/WeekStrip";
import { subDays } from "date-fns";
import WeeklyReflection from "@/components/WeeklyReflection";
import MissionHabitsConnection from "@/components/MissionHabitsConnection";
import WeeklyPlanComponent from "@/components/WeeklyPlanComponent";
import FocusAndBoundaries from "@/components/FocusAndBoundaries";
import ReviewToDos from "@/components/ReviewToDos";
import BucketListProgress from "@/components/BucketListProgress";

const API_BASE_URL = "http://localhost:3000";

const WeeklyJournal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new");
  const [currentDate, setCurrentDate] = useState(new Date());

  // === INSIGHTS STATE ===
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const myFilledDates = [
    new Date(),               // Today
    subDays(new Date(), 2),   // 2 days ago
    subDays(new Date(), 4),   // 4 days ago
  ];

  // === FETCH INSIGHTS WHEN TAB IS CLICKED ===
  useEffect(() => {
    if (activeTab === "insights") {
      const fetchInsights = async () => {
        setIsLoadingInsights(true);
        try {
          const token = localStorage.getItem("auth_token");
          const res = await fetch(`${API_BASE_URL}/user_journals/weekly_journals_insights`, {
            headers: {
              "Content-Type": "application/json",
              ...(token && { "Authorization": `Bearer ${token}` })
            }
          });

          if (res.ok) {
            const data = await res.json();
            
            // Bulletproof mapping (handles both array of strings & array of objects)
            const rawInsights = Array.isArray(data) ? data : (data.insights || data.data || []);
            const formattedInsights = rawInsights.map((i: any) => 
              typeof i === 'string' ? i : (i.insight || i.message || i.content || JSON.stringify(i))
            );
            
            setInsights(formattedInsights);
          } else {
            console.error("Failed to fetch insights");
          }
        } catch (error) {
          console.error("Error fetching insights:", error);
        } finally {
          setIsLoadingInsights(false);
        }
      };

      fetchInsights();
    }
  }, [activeTab]); // Jab bhi activeTab change hoga, ye run karega

  return (
    <div className="min-h-screen bg-[#fdfbf9] animate-fade-in font-sans relative pb-10">
      
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        
        {/* Header Area */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Weekly Journal
              </h1>
              <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
                Strategic review and planning
              </p>
            </div>
          </div>
          
          <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 bg-white/50 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-all mt-2">
            <HelpCircle className="h-4 w-4" /> Help
          </button>
        </div>

        {/* Tabs Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-10 w-full p-1.5 bg-gray-100/80 border border-gray-200/60 rounded-xl h-auto shadow-inner flex">
            <TabsTrigger 
              value="new" 
              className="flex-1 py-2.5 rounded-lg text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide"
            >
              New
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide"
            >
              Past (0)
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all text-gray-500 tracking-wide"
            >
              Insights
            </TabsTrigger>
          </TabsList>

          {/* NEW TAB CONTENT */}
          <TabsContent value="new" className="focus:outline-none">
            <div className="flex flex-col w-full space-y-12">
                <WeekStrip 
                  selectedDate={currentDate} 
                  onDateChange={(newDate) => setCurrentDate(newDate)} 
                  filledDates={myFilledDates}
                /> 
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <WeeklyReflection/>
              </div>
              <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <MissionHabitsConnection/>
              </div>
              <WeeklyPlanComponent/>
              <FocusAndBoundaries/>
              <ReviewToDos/>
              <BucketListProgress/>
            </div>
          </TabsContent>

          {/* PAST TAB CONTENT */}
          <TabsContent value="past" className="focus:outline-none">
            <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">No past entries yet.</p>
            </div>
          </TabsContent>

          {/* INSIGHTS TAB CONTENT */}
          <TabsContent value="insights" className="focus:outline-none">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[300px]">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <Lightbulb className="w-6 h-6 text-[#c69cf4]" />
                <h2 className="text-xl font-bold text-gray-900">Your Weekly Insights</h2>
              </div>

              {isLoadingInsights ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#c69cf4]" />
                  <p className="text-gray-500 font-medium">Generating your insights...</p>
                </div>
              ) : insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div 
                      key={index} 
                      className="p-5 bg-gray-50/80 rounded-xl border border-gray-100 text-gray-800 font-medium text-[15px] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 font-medium text-[15px]">Complete a journal to see insights.</p>
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* FOOTER (Normal Flow, Not Fixed) */}
      <div className="bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] mt-8">
        <div className="max-w-5xl mx-auto flex items-center justify-end gap-3 px-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-[#0f4c81] font-semibold text-[15px] hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          
          <button 
            onClick={() => alert("Plan Saved!")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#c69cf4] hover:bg-[#b58ce3] text-white font-bold text-[15px] transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Plan WK#10 MAR 1-7
          </button>
        </div>
      </div>

    </div>
  );
};

export default WeeklyJournal;