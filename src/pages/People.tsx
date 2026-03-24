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
  Edit2,
  Trash2,
  ArrowLeft,
  Users,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MyProfileModal from "@/components/MyProfileModal";
import AddPersonModal from "@/components/AddPersonModal";

const API_BASE_URL = "https://life-api.lockated.com";

// Note: These buttons are declared but currently unused in this component.
const figmaPrimaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-[#D67455] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#C86648] active:bg-[#B95D42]";

const figmaSecondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md border border-[#E0D4C4] bg-[#FFF9F1] px-4 py-2.5 text-sm font-medium text-[#5E4A3A] shadow-sm transition-colors hover:bg-[#F8EFE4]";

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
  [key: string]: any;
}

const People = () => {
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  const [isPeopleLoading, setIsPeopleLoading] = useState(true);
  const [peopleError, setPeopleError] = useState<string | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRelationshipOpen, setIsRelationshipOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("Priority");

  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Toast State
  const [customToast, setCustomToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [relationshipFilter, setRelationshipFilter] =
    useState("All Relationships");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");

  // Helper for Custom Toast
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setCustomToast({ message, type });
    setTimeout(() => setCustomToast(null), 3000);
  };

  const fetchPeople = async () => {
    try {
      setIsPeopleLoading(true);
      setPeopleError(null);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/people`, {
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
      const list: Person[] = Array.isArray(responseData)
        ? responseData
        : (responseData.people ?? responseData.data ?? []);
      setPeople(list);
    } catch (err: unknown) {
      setPeopleError(
        err instanceof Error ? err.message : "Failed to load people.",
      );
    } finally {
      setIsPeopleLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const handleDeletePerson = async (
    id: number,
    name: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setDeletingId(id);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/people/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to delete (${res.status})`);
      
      showToast(`${name} deleted successfully.`, "success");
      fetchPeople();
    } catch (err: unknown) {
      showToast("Failed to delete person.", "error");
      console.error("Delete people error:", err);
    } finally {
      setDeletingId(null);
    }
  };

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

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Mapped relationship tags to the Semantic Tertiary Palette
  const relationshipColors: Record<string, string> = {
    Family: "bg-[#534AB7]/10 text-[#534AB7]", // Violet
    "Close Friend": "bg-[#DA7756]/10 text-[#DA7756]", // Coral
    Friend: "bg-[#1858A5]/10 text-[#1858A5]", // Sky
    Colleague: "bg-[#BA7517]/10 text-[#BA7517]", // Amber
    Partner: "bg-[#A32D2D]/10 text-[#A32D2D]", // Crimson
    Mentor: "bg-[#0B5D41]/10 text-[#0B5D41]", // Forest
    Acquaintance: "bg-[#D5D8D8]/40 text-[#888780]", // Mist
  };

  const peopleWithBirthdays = people.filter((p) => p.birthday);
  const peopleNeedingReachOut = people.filter(
    (p) => p.relationship_health < 3 || p.importance_level >= 4,
  );
  const avgHealthScore =
    people.length > 0
      ? (
          people.reduce((sum, p) => sum + (p.relationship_health || 0), 0) /
          people.length
        ).toFixed(1)
      : "0";

  return (
    <>
      {isProfileModalOpen && (
        <MyProfileModal setIsProfileModalOpen={setIsProfileModalOpen} />
      )}

      <AddPersonModal
        isOpen={isAddPersonModalOpen}
        onClose={() => {
          setIsAddPersonModalOpen(false);
          setPersonToEdit(null);
        }}
        onSuccess={() => {
          fetchPeople();
          showToast(personToEdit ? "Person Updated" : "Person Added", "success");
        }}
        initialData={personToEdit as any}
      />

      <div className="relative w-full animate-fade-in space-y-8 font-sans">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {people.length > 0 && (
              <button 
                onClick={() => navigate(-1)} 
                className="w-[42px] h-[42px] rounded-full bg-white border border-[#D6B99D] flex items-center justify-center shadow-sm hover:bg-[#FEF4EE] transition-colors shrink-0 outline-none"
              >
                <ArrowLeft className="w-5 h-5 text-[#2C2C2A]" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-extrabold text-[#2C2C2A]">People</h1>
              <p className="text-sm font-medium text-[#888780] mt-0.5">
                Nurture your meaningful relationships
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-[#D6B99D] bg-white px-4 py-2.5 text-sm font-bold text-[#2C2C2A] shadow-sm transition-colors hover:bg-[#FEF4EE] outline-none"
            >
              <User className="h-4 w-4 text-[#DA7756]" />
              My Profile
            </button>
            <button
              onClick={() => {
                setPersonToEdit(null);
                setIsAddPersonModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-[#DA7756] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#C26547] outline-none"
            >
              <Plus className="h-4 w-4" />
              Add Person
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Card 1: Upcoming Dates */}
          {people.length > 0 ? (
            <div className="flex flex-col rounded-2xl border border-[#D6B99D] bg-[#FEF4EE] px-5 pt-5 pb-6 shadow-sm min-h-[140px] justify-between transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-[32px] h-[32px] rounded-lg bg-[#DA7756] flex items-center justify-center shadow-sm">
                    <Calendar className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-[#2C2C2A] text-[15px]">Upcoming Dates</span>
                </div>
                <button className="text-[13px] font-bold text-[#DA7756] hover:text-[#C26547] transition-colors outline-none">
                  View All
                </button>
              </div>
              <div className="text-center mt-auto mb-auto">
                {peopleWithBirthdays.length > 0 ? (
                  <p className="text-[14px] font-medium text-[#888780]">
                    <span className="font-bold text-[#DA7756]">{peopleWithBirthdays.length}</span> upcoming dates in the next 30 days
                  </p>
                ) : (
                  <p className="text-[14px] font-medium text-[#888780]">No upcoming dates in the next 30 days</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-[#D6B99D] min-h-[140px] justify-between">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-[#DA7756]" />
                <h3 className="text-lg font-bold text-[#2C2C2A]">
                  Upcoming Dates
                </h3>
              </div>
              <div>
                <p className="text-sm font-medium text-[#888780] italic">
                  No upcoming dates found in records.
                </p>
              </div>
            </div>
          )}

          {/* Card 2: Reach Out To */}
          <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-[#D6B99D] min-h-[140px] justify-between">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-[#DA7756]" />
              <h3 className="text-lg font-bold text-[#2C2C2A]">
                Reach Out To
              </h3>
            </div>
            <div>
              {peopleNeedingReachOut.length > 0 ? (
                <p className="text-2xl font-extrabold text-[#DA7756]">
                  {peopleNeedingReachOut.length}{" "}
                  <span className="text-sm font-bold text-[#888780]">
                    Priority Contacts
                  </span>
                </p>
              ) : (
                <p className="text-sm font-medium text-[#888780] italic">
                  All caught up! 🎉
                </p>
              )}
            </div>
          </div>

          {/* Card 3: Avg Health */}
          <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-[#D6B99D] min-h-[140px] justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-[#DA7756]" />
              <h3 className="text-lg font-bold text-[#2C2C2A]">
                Avg. Relationship Health
              </h3>
            </div>
            <div>
              {people.length > 0 ? (
                <p className="text-2xl font-extrabold text-[#DA7756]">
                  {avgHealthScore}{" "}
                  <span className="text-sm font-bold text-[#888780]">
                    / 5.0
                  </span>
                </p>
              ) : (
                <p className="text-sm font-medium text-[#888780] italic">
                  Add people to see stats.
                </p>
              )}
            </div>
          </div>
        </div> {/* <--- MAIN FIX: Ye grid div yahan close hona zaroori tha */}

        {/* FILTER + PEOPLE LIST */}
        <div className="w-full min-h-[400px] flex flex-col bg-[#FEF4EE] rounded-2xl border border-[#D6B99D] overflow-hidden">
          {/* FILTER BAR */}
          <div className="flex flex-wrap items-center gap-4 p-4 border-b border-[#D6B99D] bg-[#FEF4EE]">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-[#888780] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <div className="relative">
                <button
                  onClick={() => {
                    setIsRelationshipOpen(!isRelationshipOpen);
                    setIsPriorityOpen(false);
                  }}
                  className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-[#D6B99D] rounded-xl text-sm font-bold text-[#2C2C2A] shadow-sm hover:border-[#DA7756] focus:outline-none transition-colors"
                >
                  {relationshipFilter}
                  <ChevronDown className="w-4 h-4 text-[#888780]" />
                </button>
                {isRelationshipOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#D6B99D] rounded-xl shadow-lg z-20 py-1 overflow-hidden">
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
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#FEF4EE] transition-colors ${
                          relationshipFilter === opt
                            ? "bg-[#FEF4EE] font-bold text-[#DA7756]"
                            : "text-[#2C2C2A] font-medium"
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-[#888780] shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <div className="relative">
                <button
                  onClick={() => {
                    setIsPriorityOpen(!isPriorityOpen);
                    setIsRelationshipOpen(false);
                  }}
                  className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-[#D6B99D] rounded-xl text-sm font-bold text-[#2C2C2A] shadow-sm hover:border-[#DA7756] focus:outline-none transition-colors"
                >
                  {priorityFilter}
                  <ChevronDown className="w-4 h-4 text-[#888780]" />
                </button>
                {isPriorityOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#D6B99D] rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                    {["All Priorities", "High", "Medium", "Low"].map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setPriorityFilter(opt);
                          setIsPriorityOpen(false);
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#FEF4EE] transition-colors ${
                          priorityFilter === opt
                            ? "bg-[#FEF4EE] font-bold text-[#DA7756]"
                            : "text-[#2C2C2A] font-medium"
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-[#888780] font-bold mr-1">
                Sort:
              </span>
              {["Name", "Priority"].map((sort) => (
                <button
                  key={sort}
                  onClick={() => setActiveSort(sort)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm outline-none ${
                    activeSort === sort
                      ? "bg-[#DA7756] text-white border border-[#DA7756]"
                      : "bg-white text-[#2C2C2A] border border-[#D6B99D] hover:bg-[#FEF4EE] hover:text-[#DA7756]"
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isPeopleLoading && (
            <div className="flex flex-1 items-center justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-[#DA7756]" />
            </div>
          )}

          {/* Error */}
          {!isPeopleLoading && peopleError && (
            <div className="flex flex-1 flex-col items-center justify-center py-20 gap-3">
              <p className="text-sm text-[#A32D2D] font-bold">{peopleError}</p>
              <button
                onClick={fetchPeople}
                className="px-5 py-2 text-sm font-bold bg-[#DA7756] text-white rounded-lg hover:bg-[#C26547] transition-colors shadow-sm outline-none"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!isPeopleLoading && !peopleError && filteredPeople.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center p-8 mt-8">
              <div className="mb-4 text-[#D6B99D]">
                <Users className="w-16 h-16" strokeWidth={1.5}/>
              </div>
              <h3 className="text-[16px] font-bold text-[#2C2C2A] mb-5">
                {people.length === 0
                  ? "No people added yet"
                  : "No results match your filters"}
              </h3>
              {people.length === 0 && (
                <button
                  onClick={() => {
                    setPersonToEdit(null);
                    setIsAddPersonModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#DA7756] text-white text-sm font-bold rounded-lg hover:bg-[#C26547] transition-colors shadow-sm outline-none"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Person
                </button>
              )}
            </div>
          )}

          {/* PEOPLE CARDS GRID */}
          {!isPeopleLoading && !peopleError && filteredPeople.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredPeople.map((person) => (
                <div
                  key={person.id}
                  onClick={() => {
                    setPersonToEdit(person);
                    setIsAddPersonModalOpen(true);
                  }}
                  className="group relative bg-white border border-[#D6B99D] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#DA7756] transition-all flex flex-col gap-3 cursor-pointer"
                >
                  {/* ACTION BUTTONS — visible only on hover */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    {/* EDIT */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPersonToEdit(person);
                        setIsAddPersonModalOpen(true);
                      }}
                      title="Edit"
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-[#D6B99D] text-[#888780] hover:text-[#DA7756] hover:border-[#DA7756] hover:bg-[#FEF4EE] shadow-sm transition-all duration-150 outline-none"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={(e) =>
                        handleDeletePerson(person.id, person.name, e)
                      }
                      disabled={deletingId === person.id}
                      title="Delete"
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-[#D6B99D] text-[#888780] hover:text-[#A32D2D] hover:border-[#A32D2D] hover:bg-[#A32D2D]/[0.08] shadow-sm transition-all duration-150 disabled:opacity-50 outline-none"
                    >
                      {deletingId === person.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pr-16">
                    {person.person_image_base64 ? (
                      <img
                        src={person.person_image_base64}
                        alt={person.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#D6B99D]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#FEF4EE] border border-[#D6B99D] flex items-center justify-center text-[#DA7756] font-extrabold text-sm shrink-0">
                        {getInitials(person.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#2C2C2A] truncate group-hover:text-[#DA7756] transition-colors">
                        {person.name}
                      </p>
                      <span
                        className={`inline-block text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md mt-1 ${
                          relationshipColors[person.relationship_type] ??
                          "bg-[#D5D8D8]/40 text-[#888780]"
                        }`}
                      >
                        {person.relationship_type}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= person.importance_level
                            ? "text-[#DA7756] fill-[#DA7756]"
                            : "text-[#D6B99D] fill-transparent"
                        }`}
                      />
                    ))}
                  </div>

                  {(person.contact_info?.phone ||
                    person.contact_info?.email) && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {person.contact_info?.phone && (
                        <div className="flex items-center gap-2 text-xs font-medium text-[#888780]">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {person.contact_info.phone}
                          </span>
                        </div>
                      )}
                      {person.contact_info?.email && (
                        <div className="flex items-center gap-2 text-xs font-medium text-[#888780]">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {person.contact_info.email}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {person.last_meaningful_interaction && (
                    <p className="text-xs font-semibold text-[#DA7756] border-t border-[#D6B99D] pt-3 mt-auto">
                      <span className="text-[#888780]">Last contact:</span>{" "}
                      {new Date(
                        person.last_meaningful_interaction,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Toast (Bottom Right) */}
      {customToast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-2.5 px-5 py-4 rounded-xl shadow-lg ${customToast.type === 'success' ? 'bg-[#0B5D41]' : 'bg-[#A32D2D]'}`}>
            <span className="text-white text-[14px] font-bold tracking-wide">
              {customToast.message}
            </span>
            {customToast.type === "success" && (
              <div className="w-[18px] h-[18px] bg-white/20 rounded-[4px] flex items-center justify-center shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default People;