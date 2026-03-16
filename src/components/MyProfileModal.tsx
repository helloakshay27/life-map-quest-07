import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

const API_BASE_URL = "https://life-api.lockated.com";  // PUT uses same base, endpoint: /users/profile

interface MyProfileModalProps {
  setIsProfileModalOpen: (isOpen: boolean) => void;
}

interface UserProfile {
  name: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  birthday: string | null;
  mobile_no: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  profile_image_url: string | null;
  profile_image_base64: string | null;
}

export default function MyProfileModal({ setIsProfileModalOpen }: MyProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [imageBase64, setImageBase64] = useState<string>("");

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("auth_token");

        const res = await fetch(`${API_BASE_URL}/users/profile.json`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.message ?? `Failed to fetch profile (${res.status})`);
        }

        const data = await res.json();

        // Handle both flat response and { user: {...} } shaped response
        const user = data.user ?? data.profile ?? data;

        setProfile(user);
        setFirstName(user.first_name ?? user.name?.split(" ")[0] ?? "");
        setLastName(user.last_name ?? user.name?.split(" ").slice(1).join(" ") ?? "");
        setBirthday(user.birthday ?? "");
        setPhone(user.mobile_no ?? user.phone ?? "");
        setBio(user.bio ?? "");
        setImageBase64(user.profile_image_url ?? user.avatar_url ?? user.profile_image_base64 ?? "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
  try {
    setIsSaving(true);
    const token = localStorage.getItem("auth_token");

    // 1. Prepare the payload
    const payload: any = {
      user: {
        first_name: firstName,
        last_name: lastName,
        mobile_no: phone,
        birthday,
        bio,
      }
    };

    // 2. Only attach the base64 string if it is an actual newly uploaded base64 image
    if (imageBase64 && imageBase64.startsWith("data:image")) {
      payload.profile_image_base64 = imageBase64;
    }

    // 3. Send the request
    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message ?? `Failed to save (${res.status})`);
    }

    showToast("Profile saved successfully!", "success");
    setTimeout(() => setIsProfileModalOpen(false), 1200);
  } catch (err: unknown) {
    showToast(err instanceof Error ? err.message : "Something went wrong.");
  } finally {
    setIsSaving(false);
  }
};
  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  // ── Modal content ─────────────────────────────────────────────────────────
  const modalContent = (
    <div
      onClick={() => setIsProfileModalOpen(false)}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 p-4 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[600px] bg-white rounded-xl shadow-2xl flex flex-col max-h-[85vh] relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-xl z-10 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="text-gray-500 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── Loading ── */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#3bc2a2]" />
            </div>
          )}

          {/* ── Error ── */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-sm text-red-500 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Profile Form ── */}
          {!isLoading && !error && profile && (
            <>
              {/* Avatar */}
              <div className="flex flex-col items-center mb-8">
                {(imageBase64 || profile.avatar_url || profile.profile_image_url) ? (
                  <img
                    src={imageBase64 || profile.profile_image_url || profile.avatar_url || ""}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 bg-[#3bc2a2] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-md">
                    {getInitials(profile.name)}
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setImageBase64(reader.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {imageBase64 && imageBase64.startsWith("data:") && (
                  <p className="text-xs text-[#3bc2a2] font-medium mt-1">✓ New photo selected</p>
                )}
              </div>

              <div className="space-y-5">
                {/* Name — editable */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-[#3bc2a2] focus:ring-1 focus:ring-[#3bc2a2] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-[#3bc2a2] focus:ring-1 focus:ring-[#3bc2a2] transition-colors"
                    />
                  </div>
                </div>

                {/* Email — read only */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={profile.email ?? ""}
                    disabled
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 cursor-not-allowed outline-none"
                  />
                  <p className="mt-1.5 text-xs text-gray-400">Email cannot be changed</p>
                </div>

                {/* Birthday — editable */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Birthday</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-[#3bc2a2] focus:ring-1 focus:ring-[#3bc2a2] transition-colors"
                  />
                </div>

                {/* Phone — editable */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9999999999"
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-[#3bc2a2] focus:ring-1 focus:ring-[#3bc2a2] transition-colors"
                  />
                </div>

                {/* Bio — editable */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Bio</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-[#3bc2a2] focus:ring-1 focus:ring-[#3bc2a2] resize-none transition-colors"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[999999] flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl min-w-[280px] max-w-sm ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <div className="flex-1">
            <p className="text-sm font-bold">{toast.type === "success" ? "Success" : "Error"}</p>
            <p className="text-sm opacity-90">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}