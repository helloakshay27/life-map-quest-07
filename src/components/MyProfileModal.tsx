import React from "react";
import { createPortal } from "react-dom"; // <-- Portal import karna zaroori hai

interface MyProfileModalProps {
  setIsProfileModalOpen: (isOpen: boolean) => void;
}

export default function MyProfileModal({
  setIsProfileModalOpen,
}: MyProfileModalProps) {
  // Modal ka poora code ek variable mein rakh liya
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
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-[#3bc2a2] rounded-full flex items-center justify-center text-white mb-4">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                ></path>
              </svg>
              Upload Photo
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value="Tagala Uzair"
                disabled
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 cursor-not-allowed outline-none"
              />
              <p className="mt-1.5 text-sm text-gray-500">
                Name cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value="uzairtagala120@gmail.com"
                disabled
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 cursor-not-allowed outline-none"
              />
              <p className="mt-1.5 text-sm text-gray-500">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Birthday
              </label>
              <input
                type="date"
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-[#3bc2a2] focus:ring-1 focus:ring-[#3bc2a2] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-[#3bc2a2] focus:ring-1 focus:ring-[#3bc2a2] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Bio
              </label>
              <textarea
                rows={4}
                placeholder="Tell us a bit about yourself..."
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 outline-none focus:border-[#3bc2a2] focus:ring-1 focus:ring-[#3bc2a2] resize-none transition-colors"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button className="px-5 py-2.5 bg-[#3bc2a2] text-white font-medium rounded-lg hover:bg-[#32a88c] transition-colors shadow-sm">
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Yahan hum createPortal use kar rahe hain jo modal ko seedha body tag me daal dega
  return createPortal(modalContent, document.body);
}
