import { useState, useEffect } from "react";
import {
  User,
  Plus,
  Calendar,
  MessageSquare,
  Heart,
  Loader2,
  Star,
  Phone,
  Mail,
} from "lucide-react";
import MyProfileModal from "@/components/MyProfileModal";
import AddPersonModal from "@/components/AddPersonModal";

const API_BASE_URL = "https://api.lifecompass.lockated.com";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface Person {
  id: number;
  name: string;
  relationship_type: string;
  importance_level: number;
  birthday: string | null;
  person_image_base64: string | null;
  contact_info: { phone?: string; email?: string; social?: string } | null;
  relationship_health: number;
  last_meaningful_interaction: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const People = () => {
  const [data, setData] = useState<PeopleData | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [isPeopleLoading, setIsPeopleLoading] = useState(true);
  const [peopleError, setPeopleError] = useState<string | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRelationshipOpen, setIsRelationshipOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("Priority");
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);

  const [relationshipFilter, setRelationshipFilter] =
    useState("All Relationships");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");

  // ── Mock summary cards ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPeopleData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const mockData = await new Promise<PeopleData>((resolve) =>
          setTimeout(
            () =>
              resolve({ upcomingDates: [], reachOuts: [], healthStats: [] }),
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

  // ── Fetch people list ─────────────────────────────────────────────────────
  const fetchPeople = async () => {
    try {
      setIsPeopleLoading(true);
      setPeopleError(null);

      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${API_BASE_URL}/people/3`, {
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

      const responseData = await res.json();
      // Handle array or { people: [...] } or { data: [...] } shaped responses
      const list: Person[] = Array.isArray(responseData)
        ? responseData
        : (responseData.people ?? responseData.data ?? []);

      setPeople(list);
    } catch (err: unknown) {
      setPeopleError(
        err instanceof Error ? err.message : "Failed to load people.",
      );
      console.error("Fetch people error:", err);
    } finally {
      setIsPeopleLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  // ── Filter + Sort ─────────────────────────────────────────────────────────
  const filteredPeople = people
    .filter((p) => {
      if (
        relationshipFilter !== "All Relationships" &&
        p.relationship_type !== relationshipFilter
      )
        return false;
      if (priorityFilter === "High" && p.importance_level < 4) return false;
      if (
        priorityFilter === "Medium" &&
        (p.importance_level < 2 || p.importance_level > 3)
      )
        return false;
      if (priorityFilter === "Low" && p.importance_level > 1) return false;
      return true;
    })
    .sort((a, b) =>
      activeSort === "Name"
        ? a.name.localeCompare(b.name)
        : b.importance_level - a.importance_level,
    );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const relationshipColors: Record<string, string> = {
    Family: "bg-purple-100 text-purple-700",
    "Close Friend": "bg-pink-100 text-pink-700",
    Friend: "bg-blue-100 text-blue-700",
    Colleague: "bg-orange-100 text-orange-700",
    Partner: "bg-rose-100 text-rose-700",
    Mentor: "bg-teal-100 text-teal-700",
    Acquaintance: "bg-gray-100 text-gray-600",
  };

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
    <>
      {isProfileModalOpen && (
        <MyProfileModal setIsProfileModalOpen={setIsProfileModalOpen} />
      )}
      <AddPersonModal
        isOpen={isAddPersonModalOpen}
        onClose={() => setIsAddPersonModalOpen(false)}
        onSuccess={fetchPeople}
      />

      <div className="relative w-full animate-fade-in space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">People</h1>
            <p className="text-sm text-muted-foreground">
              Nurture your meaningful relationships
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 rounded-md border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
            >
              <User className="h-4 w-4" />
              My Profile
            </button>
            <button
              onClick={() => setIsAddPersonModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-[#e83e8c] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#d63384]"
            >
              <Plus className="h-4 w-4" />
              Add Person
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex min-h-[200px] flex-col rounded-2xl bg-white p-6 dark:bg-purple-950/20 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-bold text-foreground">
                Upcoming Dates
              </h3>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">No upcoming dates</p>
            </div>
          </div>

          <div className="flex min-h-[200px] flex-col rounded-2xl bg-white p-6 dark:bg-orange-950/20 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              <h3 className="text-lg font-bold text-foreground">
                Reach Out To
              </h3>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">All caught up! 🎉</p>
            </div>
          </div>

          <div className="flex min-h-[200px] flex-col rounded-2xl bg-white p-6 dark:bg-emerald-950/20 shadow-sm border border-gray-100">
            <div className="mb-6 flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-foreground">
                Relationship Health
              </h3>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">No data yet</p>
            </div>
          </div>
        </div>

        {/* FILTER + PEOPLE LIST */}
        <div className="w-full min-h-[400px] flex flex-col bg-[#fafafa] rounded-2xl border border-gray-100 overflow-hidden">
          {/* FILTER BAR */}
          <div className="flex flex-wrap items-center gap-4 p-4 border-b border-gray-100 bg-white">
            {/* Relationship Filter */}
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-gray-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <div className="relative">
                <button
                  onClick={() => {
                    setIsRelationshipOpen(!isRelationshipOpen);
                    setIsPriorityOpen(false);
                  }}
                  className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none"
                >
                  {relationshipFilter}
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
                    />
                  </svg>
                </button>
                {isRelationshipOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                    {[
                      "All Relationships",
                      "Family",
                      "Close Friend",
                      "Friend",
                      "Colleague",
                      "Partner",
                      "Mentor",
                      "Acquaintance",
                    ].map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setRelationshipFilter(opt);
                          setIsRelationshipOpen(false);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${relationshipFilter === opt ? "bg-gray-50 font-semibold text-gray-900" : "text-gray-700"}`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-gray-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <div className="relative">
                <button
                  onClick={() => {
                    setIsPriorityOpen(!isPriorityOpen);
                    setIsRelationshipOpen(false);
                  }}
                  className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-800 hover:bg-gray-50 focus:outline-none"
                >
                  {priorityFilter}
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
                    />
                  </svg>
                </button>
                {isPriorityOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                    {["All Priorities", "High", "Medium", "Low"].map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setPriorityFilter(opt);
                          setIsPriorityOpen(false);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${priorityFilter === opt ? "bg-gray-50 font-semibold text-gray-900" : "text-gray-700"}`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sort Toggles */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-400 font-medium mr-1">
                Sort:
              </span>
              {["Name", "Priority"].map((sort) => (
                <button
                  key={sort}
                  onClick={() => setActiveSort(sort)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSort === sort
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>

          {/* ── STATES ── */}

          {/* Loading */}
          {isPeopleLoading && (
            <div className="flex flex-1 items-center justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
            </div>
          )}

          {/* Error */}
          {!isPeopleLoading && peopleError && (
            <div className="flex flex-1 flex-col items-center justify-center py-20 gap-3">
              <p className="text-sm text-red-500 font-medium">{peopleError}</p>
              <button
                onClick={fetchPeople}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!isPeopleLoading && !peopleError && filteredPeople.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center p-8 mt-8">
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-6">
                {people.length === 0
                  ? "No people added yet"
                  : "No results match your filters"}
              </h3>
              {people.length === 0 && (
                <button
                  onClick={() => setIsAddPersonModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#e83e8c] text-white text-sm font-medium rounded-md hover:bg-[#d63384] transition-colors shadow-sm"
                >
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
                    />
                  </svg>
                  Add Your First Person
                </button>
              )}
            </div>
          )}

          {/* ── PEOPLE CARDS GRID ── */}
          {!isPeopleLoading && !peopleError && filteredPeople.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredPeople.map((person) => (
                <a
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-pink-100 transition-all flex flex-col gap-3"
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3">
                    {person.person_image_base64 ? (
                      <img
                        src={person.person_image_base64}
                        alt={person.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {getInitials(person.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate group-hover:text-[#e83e8c] transition-colors">
                        {person.name}
                      </p>
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md mt-0.5 ${relationshipColors[person.relationship_type] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {person.relationship_type}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= person.importance_level ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                      />
                    ))}
                  </div>

                  {/* Contact */}
                  {(person.contact_info?.phone ||
                    person.contact_info?.email) && (
                    <div className="flex flex-col gap-1">
                      {person.contact_info?.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {person.contact_info.phone}
                          </span>
                        </div>
                      )}
                      {person.contact_info?.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {person.contact_info.email}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Last interaction */}
                  {person.last_meaningful_interaction && (
                    <p className="text-xs text-gray-400 border-t border-gray-50 pt-2 mt-auto">
                      Last contact:{" "}
                      {new Date(
                        person.last_meaningful_interaction,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default People;
