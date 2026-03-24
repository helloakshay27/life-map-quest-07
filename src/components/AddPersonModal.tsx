import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Save,
  Gift,
  Target,
  Star,
} from "lucide-react";

const API_BASE_URL = "https://life-api.lockated.com";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FamilyMember {
  name: string;
  birthday: string;
  notes: string;
  contact: string;
}

interface ContactInfo {
  phone: string;
  email: string;
  social: string;
}

interface DiscProfile {
  primary_style: string;
  d_score: number;
  i_score: number;
  s_score: number;
  c_score: number;
  report_url: string;
  key_traits: string;
  communication_tips: string;
  motivations: string;
  fears: string;
  assessment_date: string;
}

interface FormState {
  id?: number;
  name: string;
  relationship_type: string;
  importance_level: number;
  birthday: string;
  anniversary: string;
  contact_info: ContactInfo;
  notes: string;
  current_situation: string;
  interests_preferences: string[];
  gift_ideas: string[];
  support_opportunities: string;
  family_members: FamilyMember[];
  relationship_goals: string[];
  desired_contact_frequency: number;
  last_meaningful_interaction: string;
  relationship_health: number;
  disc_profile: DiscProfile;
  other_key_dates: string[];
}

const defaultForm: FormState = {
  name: "",
  relationship_type: "",
  importance_level: 1,
  birthday: "",
  anniversary: "",
  contact_info: { phone: "", email: "", social: "" },
  notes: "",
  current_situation: "",
  interests_preferences: [],
  gift_ideas: [],
  support_opportunities: "",
  family_members: [],
  relationship_goals: [],
  desired_contact_frequency: 7,
  last_meaningful_interaction: "",
  relationship_health: 3,
  disc_profile: {
    primary_style: "",
    d_score: 1,
    i_score: 1,
    s_score: 1,
    c_score: 1,
    report_url: "",
    key_traits: "",
    communication_tips: "",
    motivations: "",
    fears: "",
    assessment_date: "",
  },
  other_key_dates: [],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[13px] font-bold text-[#2C2C2A] mb-1.5">
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-4 py-2.5 bg-white border border-[#D6B99D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DA7756]/30 focus:border-[#DA7756] transition-all text-sm text-[#2C2C2A] placeholder:text-[#888780] ${props.className ?? ""}`}
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    rows={props.rows ?? 3}
    {...props}
    className={`w-full px-4 py-2.5 bg-white border border-[#D6B99D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DA7756]/30 focus:border-[#DA7756] resize-none transition-all text-sm text-[#2C2C2A] placeholder:text-[#888780] ${props.className ?? ""}`}
  />
);

// ─── Component ────────────────────────────────────────────────────────────────
interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

const steps = ["Basic", "Details", "Family", "Goals", "Behaviour", "History"];

const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for arrays inputs
  const [interestInput, setInterestInput] = useState("");
  const [giftInput, setGiftInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const isEditMode = !!initialData?.id;

  useEffect(() => {
    if (isOpen && initialData) {
      setForm({
        ...defaultForm,
        ...initialData,
        contact_info: {
          ...defaultForm.contact_info,
          ...initialData.contact_info,
        },
        disc_profile: {
          ...defaultForm.disc_profile,
          ...initialData.disc_profile,
        },
        family_members: initialData.family_members || [],
        interests_preferences: initialData.interests_preferences || [],
        gift_ideas: initialData.gift_ideas || [],
        relationship_goals: initialData.relationship_goals || [],
        other_key_dates: initialData.other_key_dates || [],
      });
      setCurrentStepIndex(0);
      setError(null);
    } else if (isOpen && !initialData) {
      setForm(defaultForm);
      setCurrentStepIndex(0);
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const portalTarget = typeof document !== "undefined" ? document.body : null;
  if (!portalTarget) return null;

  const activeTab = steps[currentStepIndex];

  // Helper setters
  const set = (key: keyof FormState, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setContact = (key: keyof ContactInfo, value: string) =>
    setForm((f) => ({
      ...f,
      contact_info: { ...f.contact_info, [key]: value },
    }));

  const setDisc = (key: keyof DiscProfile, value: string | number) =>
    setForm((f) => ({
      ...f,
      disc_profile: { ...f.disc_profile, [key]: value },
    }));

  const addToArray = (
    key: keyof FormState,
    value: string,
    clear: () => void,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setForm((f) => ({ ...f, [key]: [...(f[key] as string[]), trimmed] }));
    clear();
  };

  const removeFromArray = (key: keyof FormState, index: number) =>
    setForm((f) => ({
      ...f,
      [key]: (f[key] as string[]).filter((_, i) => i !== index),
    }));

  // Reusable Star Rating Component
  const renderStars = (value: number, onChange: (val: number) => void) => (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-7 h-7 cursor-pointer transition-colors ${
            star <= value
              ? "text-[#DA7756] fill-[#DA7756]"
              : "text-[#D6B99D] fill-transparent"
          }`}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );

  const handleNext = () => {
    if (
      currentStepIndex === 0 &&
      (!form.name.trim() || !form.relationship_type)
    ) {
      setError("Name and Relationship type are required.");
      return;
    }
    setError(null);
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setError(null);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.relationship_type) {
      setError("Name & Relationship type required.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const payload = {
      name: form.name,
      relationship_type: form.relationship_type,
      importance_level: Number(form.importance_level),
      birthday: form.birthday || "",
      anniversary: form.anniversary || "",
      other_key_dates: form.other_key_dates,
      interests_preferences: form.interests_preferences,
      notes: form.notes,
      current_situation: form.current_situation,
      person_image_base64: "", // Hardcoded empty as per requirement
      contact_info: {
        phone: form.contact_info.phone,
        email: form.contact_info.email,
        social: form.contact_info.social,
      },
      gift_ideas: form.gift_ideas,
      support_opportunities: form.support_opportunities,
      relationship_goals: form.relationship_goals,
      relationship_health: Number(form.relationship_health),
      last_meaningful_interaction: form.last_meaningful_interaction || "",
      desired_contact_frequency: Number(form.desired_contact_frequency),
      family_members: form.family_members,
      disc_profile: {
        primary_style: form.disc_profile.primary_style,
        d_score: Number(form.disc_profile.d_score),
        i_score: Number(form.disc_profile.i_score),
        s_score: Number(form.disc_profile.s_score),
        c_score: Number(form.disc_profile.c_score),
        report_url: form.disc_profile.report_url || "",
        key_traits: form.disc_profile.key_traits,
        communication_tips: form.disc_profile.communication_tips,
        motivations: form.disc_profile.motivations,
        fears: form.disc_profile.fears,
        assessment_date: form.disc_profile.assessment_date || "",
      },
    };

    try {
      const token = localStorage.getItem("auth_token");
      const url = isEditMode
        ? `${API_BASE_URL}/people/${form.id}`
        : `${API_BASE_URL}/people`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      setForm(defaultForm);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !form.id) return;
    if (!window.confirm(`Are you sure you want to delete ${form.name}?`))
      return;

    setIsDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/people/${form.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete person.");

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh] border border-[#D6B99D]">
        {/* ── Header ── */}
        <div className="flex-none flex justify-between items-center px-6 py-4 border-b border-[#D6B99D] bg-[#FEF4EE]">
          <div>
            <h2 className="text-xl font-extrabold text-[#2C2C2A]">
              {isEditMode ? "Edit Person" : "Add New Person"}
            </h2>
            <p className="text-xs text-[#888780] font-bold mt-0.5">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete Person"
                className="p-2 text-[#A32D2D] hover:bg-[#A32D2D]/[0.08] rounded-full transition-colors outline-none"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#888780] hover:text-[#2C2C2A] hover:bg-white p-2 rounded-full transition-all outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Stepper Navigation ── */}
        <div className="flex-none bg-white border-b border-[#D6B99D]">
          <div className="flex px-2 overflow-x-auto hide-scrollbar">
            {steps.map((step, idx) => (
              <button
                key={step}
                onClick={() => {
                  if (idx <= currentStepIndex) setCurrentStepIndex(idx);
                }}
                className={`flex-1 min-w-[100px] px-2 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all outline-none ${
                  idx === currentStepIndex
                    ? "border-[#DA7756] text-[#DA7756]"
                    : idx < currentStepIndex
                      ? "border-transparent text-[#888780] cursor-pointer hover:text-[#2C2C2A]"
                      : "border-transparent text-[#D6B99D] cursor-not-allowed"
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FEF4EE]/50">
          {/* TAB 1: BASIC */}
          {activeTab === "Basic" && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <Label>Name <span className="text-[#A32D2D]">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Full Name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Relationship <span className="text-[#A32D2D]">*</span></Label>
                  <select
                    value={form.relationship_type}
                    onChange={(e) => set("relationship_type", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#D6B99D] rounded-xl outline-none focus:ring-2 focus:ring-[#DA7756]/30 focus:border-[#DA7756] transition-all text-sm text-[#2C2C2A]"
                  >
                    <option value="">Select type</option>
                    <option value="Family">Family</option>
                    <option value="Close Friend">Close Friend</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Partner">Partner</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Acquaintance">Acquaintance</option>
                  </select>
                </div>
                <div>
                  <Label>Importance Level (1-5)</Label>
                  {renderStars(form.importance_level, (val) =>
                    set("importance_level", val),
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Birthday</Label>
                  <Input
                    type="date"
                    value={form.birthday}
                    onChange={(e) => set("birthday", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Anniversary</Label>
                  <Input
                    type="date"
                    value={form.anniversary}
                    onChange={(e) => set("anniversary", e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t border-[#D6B99D] pt-5">
                <p className="text-sm font-bold text-[#2C2C2A] mb-4">
                  Contact Info
                </p>
                <div className="space-y-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      placeholder="Phone number"
                      value={form.contact_info.phone}
                      onChange={(e) => setContact("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={form.contact_info.email}
                      onChange={(e) => setContact("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Social</Label>
                    <Input
                      placeholder="@handle or URL"
                      value={form.contact_info.social}
                      onChange={(e) => setContact("social", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILS */}
          {activeTab === "Details" && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <Label>What's on their mind?</Label>
                <Textarea
                  placeholder="Current projects, challenges, joys, or significant life events..."
                  value={form.current_situation}
                  onChange={(e) => set("current_situation", e.target.value)}
                />
              </div>

              <div>
                <Label>Interests & Preferences</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    placeholder="Add interest, hobby, or preference"
                  />
                  <button
                    onClick={() =>
                      addToArray("interests_preferences", interestInput, () =>
                        setInterestInput(""),
                      )
                    }
                    className="px-4 bg-[#DA7756] text-white rounded-xl hover:bg-[#C26547] transition-colors shadow-sm outline-none"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.interests_preferences.map((item, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 bg-white border border-[#D6B99D] shadow-sm text-xs font-bold px-3 py-1.5 rounded-md text-[#2C2C2A]"
                    >
                      {item}{" "}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer text-[#888780] hover:text-[#A32D2D]"
                        onClick={() =>
                          removeFromArray("interests_preferences", i)
                        }
                      />
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Gift Ideas</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={giftInput}
                    onChange={(e) => setGiftInput(e.target.value)}
                    placeholder="Add a gift idea"
                  />
                  <button
                    onClick={() =>
                      addToArray("gift_ideas", giftInput, () =>
                        setGiftInput(""),
                      )
                    }
                    className="px-4 bg-[#DA7756] text-white rounded-xl hover:bg-[#C26547] transition-colors shadow-sm outline-none"
                  >
                    <Gift className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.gift_ideas.map((item, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 bg-white border border-[#D6B99D] shadow-sm text-xs font-bold px-3 py-1.5 rounded-md text-[#2C2C2A]"
                    >
                      {item}{" "}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer text-[#888780] hover:text-[#A32D2D]"
                        onClick={() => removeFromArray("gift_ideas", i)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>How I Can Help/Support</Label>
                <Textarea
                  value={form.support_opportunities}
                  onChange={(e) => set("support_opportunities", e.target.value)}
                  placeholder="Ways you've offered support or could help them..."
                />
              </div>

              <div>
                <Label>General Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Inside jokes, favorite memories, important things to remember..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: FAMILY */}
          {activeTab === "Family" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center bg-[#FEF4EE] border border-[#D6B99D] p-4 rounded-xl shadow-sm">
                <div>
                  <h3 className="font-bold text-[#2C2C2A] mb-1">
                    Family Members
                  </h3>
                  <p className="text-xs text-[#888780] font-medium">
                    Keep track of their spouse, kids, or pets.
                  </p>
                </div>
              </div>

              {form.family_members.length === 0 ? (
                <div className="text-sm text-[#888780] font-medium text-center py-10 border border-dashed border-[#D6B99D] rounded-xl bg-white">
                  No family members added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {form.family_members.map((member, i) => (
                    <div
                      key={i}
                      className="p-5 border border-[#D6B99D] bg-white rounded-xl relative shadow-sm"
                    >
                      <button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            family_members: f.family_members.filter(
                              (_, idx) => idx !== i,
                            ),
                          }))
                        }
                        className="absolute top-4 right-4 text-[#888780] hover:text-[#A32D2D] bg-[#FEF4EE] hover:bg-[#A32D2D]/[0.08] p-1.5 rounded-md transition-colors outline-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-10">
                        <Input
                          placeholder="Name (e.g., Spouse, Son)"
                          value={member.name}
                          onChange={(e) => {
                            const newFam = [...form.family_members];
                            newFam[i].name = e.target.value;
                            set("family_members", newFam);
                          }}
                        />
                        <Input
                          type="date"
                          value={member.birthday}
                          onChange={(e) => {
                            const newFam = [...form.family_members];
                            newFam[i].birthday = e.target.value;
                            set("family_members", newFam);
                          }}
                        />
                        <Input
                          placeholder="Contact (phone, email, social...)"
                          value={member.contact}
                          onChange={(e) => {
                            const newFam = [...form.family_members];
                            newFam[i].contact = e.target.value;
                            set("family_members", newFam);
                          }}
                        />
                        <Input
                          placeholder="Notes (hobbies, interests...)"
                          value={member.notes}
                          onChange={(e) => {
                            const newFam = [...form.family_members];
                            newFam[i].notes = e.target.value;
                            set("family_members", newFam);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    family_members: [
                      ...f.family_members,
                      { name: "", birthday: "", contact: "", notes: "" },
                    ],
                  }))
                }
                className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-white border border-[#D6B99D] text-[#2C2C2A] py-3 rounded-xl hover:bg-[#FEF4EE] hover:border-[#DA7756] hover:text-[#DA7756] transition-colors shadow-sm outline-none"
              >
                <Plus className="w-4 h-4" /> Add Family Member
              </button>
            </div>
          )}

          {/* TAB 4: GOALS */}
          {activeTab === "Goals" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label>Relationship Goals</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="e.g., Monthly deep conversation, Weekly check-in"
                  />
                  <button
                    onClick={() =>
                      addToArray("relationship_goals", goalInput, () =>
                        setGoalInput(""),
                      )
                    }
                    className="px-4 bg-[#DA7756] text-white rounded-xl hover:bg-[#C26547] transition-colors shadow-sm outline-none"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.relationship_goals.map((item, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 bg-white border border-[#D6B99D] shadow-sm text-xs font-bold px-3 py-1.5 rounded-md text-[#2C2C2A]"
                    >
                      {item}{" "}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer text-[#888780] hover:text-[#A32D2D]"
                        onClick={() => removeFromArray("relationship_goals", i)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Relationship Health (1-5)</Label>
                {renderStars(form.relationship_health, (val) =>
                  set("relationship_health", val),
                )}
              </div>

              <div>
                <Label>Last Meaningful Interaction</Label>
                <Input
                  type="date"
                  value={form.last_meaningful_interaction}
                  onChange={(e) =>
                    set("last_meaningful_interaction", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Desired Contact Frequency (days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.desired_contact_frequency}
                  onChange={(e) =>
                    set("desired_contact_frequency", Number(e.target.value))
                  }
                />
                <p className="text-xs text-[#888780] font-medium mt-1.5">
                  How often you'd like to connect with this person (used for
                  reminders)
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: BEHAVIOUR (DISC) */}
          {activeTab === "Behaviour" && (
            <div className="space-y-6 animate-fade-in">
              <div className="mb-4">
                <h3 className="font-bold text-[#2C2C2A] mb-1">
                  DISC Behavioural Profile
                </h3>
                <p className="text-sm text-[#888780] font-medium">
                  Store their DISC assessment results to better understand and
                  communicate with them.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Primary DISC Style</Label>
                  <select
                    value={form.disc_profile.primary_style}
                    onChange={(e) => setDisc("primary_style", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#D6B99D] rounded-xl outline-none focus:ring-2 focus:ring-[#DA7756]/30 focus:border-[#DA7756] transition-all text-sm text-[#2C2C2A]"
                  >
                    <option value="">Select style</option>
                    <option value="D">D - Dominance</option>
                    <option value="I">I - Influence</option>
                    <option value="S">S - Steadiness</option>
                    <option value="C">C - Conscientiousness</option>
                  </select>
                </div>
                <div>
                  <Label>Assessment Date</Label>
                  <Input
                    type="date"
                    value={form.disc_profile.assessment_date}
                    onChange={(e) => setDisc("assessment_date", e.target.value)}
                  />
                </div>
              </div>

              {/* D I S C Colored Boxes mapped to Semantic Palette */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#A32D2D]/[0.08] border border-[#A32D2D]/30 rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-bold text-[#A32D2D] mb-2 uppercase tracking-wide">
                    D - Dominance
                  </p>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    placeholder="1-7"
                    value={form.disc_profile.d_score || ""}
                    onChange={(e) => setDisc("d_score", Number(e.target.value))}
                    className="bg-white border-[#D6B99D] focus:border-[#A32D2D] focus:ring-[#A32D2D]/30"
                  />
                </div>
                <div className="bg-[#BA7517]/[0.08] border border-[#BA7517]/30 rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-bold text-[#BA7517] mb-2 uppercase tracking-wide">
                    I - Influence
                  </p>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    placeholder="1-7"
                    value={form.disc_profile.i_score || ""}
                    onChange={(e) => setDisc("i_score", Number(e.target.value))}
                    className="bg-white border-[#D6B99D] focus:border-[#BA7517] focus:ring-[#BA7517]/30"
                  />
                </div>
                <div className="bg-[#0B5D41]/[0.08] border border-[#0B5D41]/30 rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-bold text-[#0B5D41] mb-2 uppercase tracking-wide">
                    S - Steadiness
                  </p>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    placeholder="1-7"
                    value={form.disc_profile.s_score || ""}
                    onChange={(e) => setDisc("s_score", Number(e.target.value))}
                    className="bg-white border-[#D6B99D] focus:border-[#0B5D41] focus:ring-[#0B5D41]/30"
                  />
                </div>
                <div className="bg-[#1858A5]/[0.08] border border-[#1858A5]/30 rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-bold text-[#1858A5] mb-2 uppercase tracking-wide">
                    C - Compliance
                  </p>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    placeholder="1-7"
                    value={form.disc_profile.c_score || ""}
                    onChange={(e) => setDisc("c_score", Number(e.target.value))}
                    className="bg-white border-[#D6B99D] focus:border-[#1858A5] focus:ring-[#1858A5]/30"
                  />
                </div>
              </div>

              <div>
                <Label>Report URL</Label>
                <Input
                  placeholder="Link to full DISC report..."
                  value={form.disc_profile.report_url}
                  onChange={(e) => setDisc("report_url", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Key Personality Traits</Label>
                  <Textarea
                    rows={2}
                    placeholder="e.g., Direct, results-oriented, competitive, decisive..."
                    value={form.disc_profile.key_traits}
                    onChange={(e) => setDisc("key_traits", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Communication Tips</Label>
                  <Textarea
                    rows={2}
                    placeholder="How to communicate effectively with them..."
                    value={form.disc_profile.communication_tips}
                    onChange={(e) =>
                      setDisc("communication_tips", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>Motivations</Label>
                  <Textarea
                    rows={2}
                    placeholder="What drives and motivates them..."
                    value={form.disc_profile.motivations}
                    onChange={(e) => setDisc("motivations", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fears / Avoidances</Label>
                  <Textarea
                    rows={2}
                    placeholder="What they tend to fear or avoid..."
                    value={form.disc_profile.fears}
                    onChange={(e) => setDisc("fears", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: HISTORY */}
          {activeTab === "History" && (
            <div className="space-y-6 animate-fade-in flex flex-col items-center justify-center py-20 text-center">
              <h3 className="text-lg font-bold text-[#2C2C2A]">
                No interactions logged yet
              </h3>
              <p className="text-sm text-[#888780] font-medium">
                Click "Log Interaction" after saving to record your first
                interaction
              </p>
            </div>
          )}
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="px-6 py-3 bg-[#A32D2D] text-white text-sm font-bold shadow-inner">
            {error}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex-none p-5 border-t border-[#D6B99D] bg-white flex justify-between items-center rounded-b-2xl">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-5 py-2.5 text-sm font-bold flex items-center gap-2 rounded-xl transition-colors outline-none ${currentStepIndex === 0 ? "text-transparent cursor-default" : "text-[#888780] border border-[#D6B99D] hover:bg-[#FEF4EE] hover:text-[#2C2C2A]"}`}
          >
            {currentStepIndex !== 0 && (
              <>
                <ArrowLeft className="w-4 h-4" /> Back
              </>
            )}
          </button>

          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 text-sm font-extrabold text-white bg-[#DA7756] hover:bg-[#C26547] rounded-xl flex items-center gap-2 shadow-sm transition-colors outline-none"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-2.5 text-sm font-extrabold text-white rounded-xl flex items-center gap-2 bg-[#DA7756] hover:bg-[#C26547] shadow-md transition-colors outline-none disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" strokeWidth={2.5}/>
              )}
              {isEditMode ? "Save Changes" : "Create Person"}
            </button>
          )}
        </div>
      </div>
    </div>,
    portalTarget,
  );
};

export default AddPersonModal;