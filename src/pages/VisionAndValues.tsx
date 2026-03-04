import Tobe from '@/components/Tobe';
import Values from '@/components/Values';
import Vision from '@/components/Vision';
import React, { useState } from 'react';

function VisionAndValues() {
  const [activeTab, setActiveTab] = useState('Vision');
  const tabs = ['Vision', 'Values', 'Be-Do-Have'];

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 rounded-xl shadow-sm">

        {/* ==============================
            SECTION 1: HEADER
        ============================== */}
        <div className="flex justify-between items-start mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Back Button */}
            <button className="p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Vision & Values
              </h1>
              <p className="text-gray-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">Your guiding principles</p>
            </div>

          </div>

          {/* Help Button */}
          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-xs sm:text-sm font-medium mt-1 sm:mt-2 flex-shrink-0 ml-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden xs:inline sm:inline">Help</span>
          </button>
        </div>

        {/* ==============================
            SECTION 2: TABS
        ============================== */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-4 sm:mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors truncate px-1 ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ==============================
            SECTION 3: CONTENT AREA
        ============================== */}
        <div className="p-3 sm:p-4 md:p-6 bg-purple-50/50 rounded-xl min-h-[300px] border border-purple-100/50">

          {activeTab === 'Vision' && <Vision />}
          {activeTab === 'Values' && <Values />}
          {activeTab === 'Be-Do-Have' && <Tobe />}

        </div>
      </div>
    </div>
  );
}

export default VisionAndValues;
