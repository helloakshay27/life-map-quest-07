import React, { useState } from "react";
import ReactDOM from "react-dom";
import { X, Plus, Gift, Star, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  // Basic
  name: string;
  relationship_type: string;
  importance_level: number;
  birthday: string;
  anniversary: string;
  person_image_base64: string;
  contact_info: ContactInfo;
  // Details
  notes: string;
  current_situation: string;
  interests_preferences: string[];
  gift_ideas: string[];
  support_opportunities: string;
  // Family
  family_members: FamilyMember[];
  // Goals
  relationship_goals: string[];
  desired_contact_frequency: number;
  last_meaningful_interaction: string;
  relationship_health: number;
  // Behaviour (DISC)
  disc_profile: DiscProfile;
  // History
  other_key_dates: string[];
}

// ─── Default State ─────────────────────────────────────────────────────────────

const defaultForm: FormState = {
  name: "",
  relationship_type: "",
  importance_level: 0,
  birthday: "",
  anniversary: "",
  person_image_base64: "",
  contact_info: { phone: "", email: "", social: "" },
  notes: "",
  current_situation: "",
  interests_preferences: [],
  gift_ideas: [],
  support_opportunities: "",
  family_members: [],
  relationship_goals: [],
  desired_contact_frequency: 1,
  last_meaningful_interaction: "",
  relationship_health: 0,
  disc_profile: {
    primary_style: "",
    d_score: 0,
    i_score: 0,
    s_score: 0,
    c_score: 0,
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
  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all ${props.className ?? ""}`}
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    rows={3}
    {...props}
    className={`w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none transition-all ${props.className ?? ""}`}
  />
);

// ─── Component ────────────────────────────────────────────────────────────────

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Basic");
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Temp input state for array fields
  const [interestInput, setInterestInput] = useState("");
  const [giftInput, setGiftInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const tabs = ["Basic", "Details", "Family", "Goals", "Behaviour", "History"];

  if (!isOpen) return null;
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  if (!portalTarget) return null;

  // ── Form helpers ──────────────────────────────────────────────────────────

  const set = (key: keyof FormState, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setContact = (key: keyof ContactInfo, value: string) =>
    setForm((f) => ({ ...f, contact_info: { ...f.contact_info, [key]: value } }));

  const setDisc = (key: keyof DiscProfile, value: string | number) =>
    setForm((f) => ({ ...f, disc_profile: { ...f.disc_profile, [key]: value } }));

  const addToArray = (key: keyof FormState, value: string, clear: () => void) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setForm((f) => ({ ...f, [key]: [...(f[key] as string[]), trimmed] }));
    clear();
  };

  const removeFromArray = (key: keyof FormState, index: number) =>
    setForm((f) => ({ ...f, [key]: (f[key] as string[]).filter((_, i) => i !== index) }));

  // Family member helpers
  const addFamilyMember = () =>
    setForm((f) => ({
      ...f,
      family_members: [...f.family_members, { name: "", birthday: "", notes: "", contact: "" }],
    }));

  const updateFamilyMember = (index: number, key: keyof FamilyMember, value: string) =>
    setForm((f) => ({
      ...f,
      family_members: f.family_members.map((m, i) => (i === index ? { ...m, [key]: value } : m)),
    }));

  const removeFamilyMember = (index: number) =>
    setForm((f) => ({ ...f, family_members: f.family_members.filter((_, i) => i !== index) }));

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.relationship_type) { setError("Relationship type is required."); return; }

    setIsLoading(true);
    setError(null);

    const payload = {
      name: form.name,
      relationship_type: form.relationship_type,
      importance_level: form.importance_level,
      birthday: form.birthday || null,
      anniversary: form.anniversary || null,
      other_key_dates: form.other_key_dates,
      interests_preferences: form.interests_preferences,
      notes: form.notes,
      current_situation: form.current_situation,
      person_image_base64: form.person_image_base64,
      contact_info: form.contact_info,
      gift_ideas: form.gift_ideas,
      support_opportunities: form.support_opportunities,
      relationship_goals: form.relationship_goals,
      relationship_health: form.relationship_health,
      last_meaningful_interaction: form.last_meaningful_interaction || null,
      desired_contact_frequency: form.desired_contact_frequency,
      family_members: form.family_members,
      disc_profile: form.disc_profile,
    };

    try {
              const token = localStorage.getItem("auth_token");

      const res = await fetch("https://api.lifecompass.lockated.com/people", { // 🔁 Replace with your real endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message ?? `Request failed (${res.status})`);
      }

      // Success
      setForm(defaultForm);
      setActiveTab("Basic");
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── StarRating ────────────────────────────────────────────────────────────

  const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          onClick={() => onChange(star)}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            star <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  // ── Tag List UI ───────────────────────────────────────────────────────────

  const TagList = ({ items, onRemove }: { items: string[]; onRemove: (i: number) => void }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 bg-pink-50 text-pink-700 text-xs font-medium px-3 py-1 rounded-full border border-pink-200">
          {item}
          <button onClick={() => onRemove(i)} className="hover:text-pink-900 ml-1">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* ── Header ── */}
        <div className="flex-none flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Add New Person</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex-none bg-white border-b border-gray-100">
          <div className="flex px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: "#fafafa", minHeight: 0 }}>

          {/* ════════ BASIC ════════ */}
          {activeTab === "Basic" && (
            <div className="space-y-5">
              <div>
                <Label>Name *</Label>
                <Input placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>

              <div>
                <Label>Photo (Base64 or URL)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste image URL or base64..."
                    value={form.person_image_base64}
                    onChange={(e) => set("person_image_base64", e.target.value)}
                  />
                  <button className="bg-purple-500 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-purple-600 transition-all whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Add Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Relationship *</Label>
                  <select
                    value={form.relationship_type}
                    onChange={(e) => set("relationship_type", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none appearance-none"
                  >
                    <option value="">Select type</option>
                    <option>Family</option>
                    <option>Close Friend</option>
                    <option>Friend</option>
                    <option>Colleague</option>
                    <option>Partner</option>
                    <option>Mentor</option>
                    <option>Acquaintance</option>
                  </select>
                </div>

                <div>
                  <Label>Importance Level</Label>
                  <div className="py-1.5">
                    <StarRating value={form.importance_level} onChange={(v) => set("importance_level", v)} />
                  </div>
                </div>

                <div>
                  <Label>Birthday</Label>
                  <Input type="date" value={form.birthday} onChange={(e) => set("birthday", e.target.value)} />
                </div>

                <div>
                  <Label>Anniversary</Label>
                  <Input type="date" value={form.anniversary} onChange={(e) => set("anniversary", e.target.value)} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Contact Info</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input placeholder="Phone number" value={form.contact_info.phone} onChange={(e) => setContact("phone", e.target.value)} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="Email address" value={form.contact_info.email} onChange={(e) => setContact("email", e.target.value)} />
                  </div>
                  <div>
                    <Label>Social</Label>
                    <Input placeholder="@handle or URL" value={form.contact_info.social} onChange={(e) => setContact("social", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ DETAILS ════════ */}
          {activeTab === "Details" && (
            <div className="space-y-5">
              <div>
                <Label>Current Situation</Label>
                <Textarea
                  placeholder="Current projects, challenges, what's going on in their life..."
                  value={form.current_situation}
                  onChange={(e) => set("current_situation", e.target.value)}
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="General notes about this person..."
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>

              <div>
                <Label>Support Opportunities</Label>
                <Textarea
                  placeholder="Ways you can support them..."
                  value={form.support_opportunities}
                  onChange={(e) => set("support_opportunities", e.target.value)}
                />
              </div>

              <div>
                <Label>Interests & Preferences</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an interest..."
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addToArray("interests_preferences", interestInput, () => setInterestInput(""))}
                  />
                  <button
                    onClick={() => addToArray("interests_preferences", interestInput, () => setInterestInput(""))}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <TagList items={form.interests_preferences} onRemove={(i) => removeFromArray("interests_preferences", i)} />
              </div>

              <div>
                <Label>Gift Ideas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add gift idea..."
                    value={giftInput}
                    onChange={(e) => setGiftInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addToArray("gift_ideas", giftInput, () => setGiftInput(""))}
                  />
                  <button
                    onClick={() => addToArray("gift_ideas", giftInput, () => setGiftInput(""))}
                    className="p-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <Gift className="w-5 h-5" />
                  </button>
                </div>
                <TagList items={form.gift_ideas} onRemove={(i) => removeFromArray("gift_ideas", i)} />
              </div>
            </div>
          )}

          {/* ════════ FAMILY ════════ */}
          {activeTab === "Family" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Add family members linked to this person.</p>
                <button
                  onClick={addFamilyMember}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              </div>

              {form.family_members.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">No family members added yet.</div>
              )}

              {form.family_members.map((member, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Member {i + 1}</span>
                    <button onClick={() => removeFamilyMember(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input placeholder="Full name" value={member.name} onChange={(e) => updateFamilyMember(i, "name", e.target.value)} />
                    </div>
                    <div>
                      <Label>Birthday</Label>
                      <Input type="date" value={member.birthday} onChange={(e) => updateFamilyMember(i, "birthday", e.target.value)} />
                    </div>
                    <div>
                      <Label>Contact</Label>
                      <Input placeholder="Phone or email" value={member.contact} onChange={(e) => updateFamilyMember(i, "contact", e.target.value)} />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Input placeholder="Any notes..." value={member.notes} onChange={(e) => updateFamilyMember(i, "notes", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ════════ GOALS ════════ */}
          {activeTab === "Goals" && (
            <div className="space-y-5">
              <div>
                <Label>Relationship Goals</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Check in monthly..."
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addToArray("relationship_goals", goalInput, () => setGoalInput(""))}
                  />
                  <button
                    onClick={() => addToArray("relationship_goals", goalInput, () => setGoalInput(""))}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <TagList items={form.relationship_goals} onRemove={(i) => removeFromArray("relationship_goals", i)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Last Meaningful Interaction</Label>
                  <Input
                    type="date"
                    value={form.last_meaningful_interaction}
                    onChange={(e) => set("last_meaningful_interaction", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Desired Contact Frequency (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 30"
                    value={form.desired_contact_frequency}
                    onChange={(e) => set("desired_contact_frequency", Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Relationship Health</Label>
                <div className="py-1.5">
                  <StarRating value={form.relationship_health} onChange={(v) => set("relationship_health", v)} />
                </div>
              </div>
            </div>
          )}

          {/* ════════ BEHAVIOUR (DISC) ════════ */}
          {activeTab === "Behaviour" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Primary DISC Style</Label>
                  <select
                    value={form.disc_profile.primary_style}
                    onChange={(e) => setDisc("primary_style", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none appearance-none"
                  >
                    <option value="">Select style</option>
                    <option value="D">D – Dominance</option>
                    <option value="I">I – Influence</option>
                    <option value="S">S – Steadiness</option>
                    <option value="C">C – Conscientiousness</option>
                  </select>
                </div>
                <div>
                  <Label>Assessment Date</Label>
                  <Input type="date" value={form.disc_profile.assessment_date} onChange={(e) => setDisc("assessment_date", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(["d_score", "i_score", "s_score", "c_score"] as const).map((key) => (
                  <div key={key}>
                    <Label>{key.replace("_score", "").toUpperCase()} Score</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      placeholder="0-10"
                      value={form.disc_profile[key]}
                      onChange={(e) => setDisc(key, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label>Key Traits</Label>
                <Textarea placeholder="Describe their key personality traits..." value={form.disc_profile.key_traits} onChange={(e) => setDisc("key_traits", e.target.value)} />
              </div>
              <div>
                <Label>Communication Tips</Label>
                <Textarea placeholder="How best to communicate with them..." value={form.disc_profile.communication_tips} onChange={(e) => setDisc("communication_tips", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Motivations</Label>
                  <Textarea rows={2} placeholder="What motivates them..." value={form.disc_profile.motivations} onChange={(e) => setDisc("motivations", e.target.value)} />
                </div>
                <div>
                  <Label>Fears</Label>
                  <Textarea rows={2} placeholder="What they fear..." value={form.disc_profile.fears} onChange={(e) => setDisc("fears", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Report URL</Label>
                <Input placeholder="Link to DISC report..." value={form.disc_profile.report_url} onChange={(e) => setDisc("report_url", e.target.value)} />
              </div>
            </div>
          )}

          {/* ════════ HISTORY ════════ */}
          {activeTab === "History" && (
            <div className="space-y-5">
              <div>
                <Label>Other Key Dates</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                  />
                  <button
                    onClick={() => addToArray("other_key_dates", dateInput, () => setDateInput(""))}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <TagList items={form.other_key_dates} onRemove={(i) => removeFromArray("other_key_dates", i)} />
              </div>
            </div>
          )}
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex-none px-6 py-3 bg-red-50 border-t border-red-100 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex-none p-4 border-t border-gray-100 bg-white flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-2.5 text-sm font-bold text-white rounded-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: "#e83e8c", boxShadow: "0 4px 14px rgba(232,62,140,0.3)" }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#d63384")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e83e8c")}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                Create Person
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    portalTarget
  );
};

export default AddPersonModal;