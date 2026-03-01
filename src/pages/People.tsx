import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Plus,
  Calendar,
  MessageSquare,
  Heart,
  Loader2,
} from "lucide-react";
import MyProfileModal from "@/components/MyProfileModal"; // Make sure path is correct

// Types
interface UpcomingDate {
  id: string;
  title: string;
  date: string;
}

interface ReachOut {
  id: string;
  name: string;
  reason: string;
}

interface HealthStat {
  id: string;
  name: string;
  score: number;
}

interface PeopleData {
  upcomingDates: UpcomingDate[];
  reachOuts: ReachOut[];
  healthStats: HealthStat[];
}

const People = () => {
  const [data, setData] = useState<PeopleData | null>(null);

  // Specific state for the profile modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRelationshipOpen, setIsRelationshipOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  // State for the sorting toggle (Name vs Priority)
  const [activeSort, setActiveSort] = useState("Priority");

  useEffect(() => {
    const fetchPeopleData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // MOCK API DELAY
        const mockData = await new Promise<PeopleData>((resolve) =>
          setTimeout(
            () =>
              resolve({
                upcomingDates: [],
                reachOuts: [],
                healthStats: [],
              }),
            800,
          ),
        );

        setData(mockData);
      } catch (err) {
        setError("Failed to load people data. Please try again.");
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPeopleData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full animate-fade-in space-y-8">
      {/* ----------------------------------------------------------------- */}
      {/* HEADER SECTION */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">People</h1>
            <p className="text-sm text-muted-foreground">
              Nurture your meaningful relationships
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 rounded-md border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <User className="h-4 w-4" />
            My Profile
          </button>

          <button className="flex items-center gap-2 rounded-md bg-[#e83e8c] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#d63384]">
            <Plus className="h-4 w-4" />
            Add Person
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* CARDS GRID */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Upcoming Dates */}
        <div className="flex min-h-[200px] flex-col rounded-2xl bg-white p-6 dark:bg-purple-950/20 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-bold text-foreground">
              Upcoming Dates
            </h3>
          </div>
          <div className="flex flex-1 items-center justify-center">
            {data?.upcomingDates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming dates</p>
            ) : (
              <div className="w-full space-y-3">
                {data?.upcomingDates.map((date) => (
                  <div key={date.id} className="text-sm">
                    {date.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Reach Out To */}
        <div className="flex min-h-[200px] flex-col rounded-2xl bg-white p-6 dark:bg-orange-950/20 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            <h3 className="text-lg font-bold text-foreground">Reach Out To</h3>
          </div>
          <div className="flex flex-1 items-center justify-center">
            {data?.reachOuts.length === 0 ? (
              <p className="text-sm text-muted-foreground">All caught up! 🎉</p>
            ) : (
              <div className="w-full space-y-3">
                {data?.reachOuts.map((person) => (
                  <div key={person.id} className="text-sm">
                    {person.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Relationship Health */}
        <div className="flex min-h-[200px] flex-col rounded-2xl bg-white p-6 dark:bg-emerald-950/20 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-foreground">
              Relationship Health
            </h3>
          </div>
          <div className="flex flex-1 items-center justify-center">
            {data?.healthStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="w-full space-y-3">
                {data?.healthStats.map((stat) => (
                  <div key={stat.id} className="text-sm">
                    {stat.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render the Modal as an Overlay */}
      {isProfileModalOpen && (
        <MyProfileModal setIsProfileModalOpen={setIsProfileModalOpen} />
      )}

      <div className="w-full min-h-[400px] flex flex-col bg-[#fafafa] font-sans">
        {/* ----------------------------------------------------------------- */}
        {/* FILTER BAR (Matched exactly with your screenshot) */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex items-center gap-6 p-4 border-b border-gray-100 bg-white">
          {/* Filter 1: Relationships */}
          <div className="flex items-center gap-3">
            {/* Funnel Icon */}
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              ></path>
            </svg>

            <div className="relative">
              <button
                onClick={() => setIsRelationshipOpen(!isRelationshipOpen)}
                className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none"
              >
                All Relationships
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>

              {isRelationshipOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                  <div className="px-3 py-2 text-sm text-gray-800 bg-gray-50 cursor-pointer">
                    All Relationships
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Family
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Friends
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter 2: Priorities */}
          <div className="flex items-center gap-3">
            {/* Star Icon */}
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              ></path>
            </svg>

            <div className="relative">
              <button
                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none"
              >
                All Priorities
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>

              {isPriorityOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                  <div className="px-3 py-2 text-sm text-gray-800 bg-gray-50 cursor-pointer">
                    All Priorities
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    High
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Medium
                  </div>
                  <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Low
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sorting Toggles (Name / Priority) */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setActiveSort("Name")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSort === "Name"
                  ? "bg-black text-white"
                  : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setActiveSort("Priority")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSort === "Priority"
                  ? "bg-[#1a1a1a] text-white" // Matched the dark black from screenshot
                  : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Priority
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* EMPTY STATE AREA */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 mt-12">
          {/* Empty State Icon */}
          <div className="mb-6 text-gray-300">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>

          {/* Empty State Text */}
          <h3 className="text-xl font-medium text-gray-600 mb-6">
            No people added yet
          </h3>

          {/* Action Button */}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#e83e8c] text-white text-sm font-medium rounded-md hover:bg-[#d63384] transition-colors shadow-sm">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            Add Your First Person
          </button>
        </div>
      </div>
    </div>
  );
};

export default People;
