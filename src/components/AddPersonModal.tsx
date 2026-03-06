import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X,
  Plus,
  Gift,
  Star,
  Image as ImageIcon,
  Trash2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Save,
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
  person_image_base64: string;
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

  const [interestInput, setInterestInput] = useState("");
  const [giftInput, setGiftInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const isEditMode = !!initialData?.id;

  useEffect(() => {
    if (isOpen && initialData) {
      setForm({ ...defaultForm, ...initialData });
      setCurrentStepIndex(0);
      setError(null);
    } else if (isOpen && !initialData) {
      setForm(defaultForm);
      setCurrentStepIndex(0);
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // 🟢 PORTAL TARGET FIX: Ye line miss ho gayi thi pichli baar!
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  if (!portalTarget) return null;

  const activeTab = steps[currentStepIndex];

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

      alert("Person deleted successfully!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* ── Header ── */}
        <div className="flex-none flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Edit Person" : "Add New Person"}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete Person"
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
              className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Stepper Navigation ── */}
        <div className="flex-none bg-white border-b border-gray-100">
          <div className="flex px-2 overflow-x-auto hide-scrollbar">
            {steps.map((step, idx) => (
              <button
                key={step}
                onClick={() => {
                  if (idx < currentStepIndex) setCurrentStepIndex(idx);
                }}
                disabled={idx > currentStepIndex}
                className={`flex-1 min-w-[100px] px-2 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  idx === currentStepIndex
                    ? "border-pink-500 text-pink-600"
                    : idx < currentStepIndex
                      ? "border-gray-200 text-gray-800 cursor-pointer"
                      : "border-transparent text-gray-300 cursor-not-allowed"
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fafafa]">
          {activeTab === "Basic" && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Relationship *</Label>
                  <select
                    value={form.relationship_type}
                    onChange={(e) => set("relationship_type", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg"
                  >
                    <option value="">Select type</option>
                    <option>Family</option>
                    <option>Close Friend</option>
                    <option>Friend</option>
                    <option>Colleague</option>
                    <option>Partner</option>
                  </select>
                </div>
                <div>
                  <Label>Birthday</Label>
                  <Input
                    type="date"
                    value={form.birthday}
                    onChange={(e) => set("birthday", e.target.value)}
                  />
                </div>
              </div>
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Contact Info
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {activeTab === "Details" && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <Label>Current Situation</Label>
                <Textarea
                  value={form.current_situation}
                  onChange={(e) => set("current_situation", e.target.value)}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </div>
          )}
          {activeTab === "Family" && (
            <div className="text-sm text-gray-500 animate-fade-in">
              Family tab content goes here...
            </div>
          )}
          {activeTab === "Goals" && (
            <div className="text-sm text-gray-500 animate-fade-in">
              Goals tab content goes here...
            </div>
          )}
          {activeTab === "Behaviour" && (
            <div className="text-sm text-gray-500 animate-fade-in">
              Behaviour tab content goes here...
            </div>
          )}
          {activeTab === "History" && (
            <div className="text-sm text-gray-500 animate-fade-in">
              History tab content goes here...
            </div>
          )}
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="px-6 py-3 bg-red-50 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex-none p-4 border-t bg-white flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-5 py-2.5 text-sm font-bold flex items-center gap-2 rounded-lg ${currentStepIndex === 0 ? "text-gray-300" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-lg flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-2.5 text-sm font-bold text-white rounded-lg flex items-center gap-2 bg-[#e83e8c]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditMode ? (
                <Save className="w-4 h-4" />
              ) : (
                <ImageIcon className="w-4 h-4" />
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
