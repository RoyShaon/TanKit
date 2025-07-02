
import React, { useState } from 'react';
import type { PatientSymptoms } from '../types';
import { PillIcon } from './icons';

interface SymptomFormProps {
  onSubmit: (symptoms: PatientSymptoms) => void;
  isLoading: boolean;
}

const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmit, isLoading }) => {
  const [allSymptoms, setAllSymptoms] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAllSymptoms(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ allSymptoms });
  };

  const textAreaClasses = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200 resize-y min-h-[360px] text-gray-700 placeholder-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="flex items-center gap-3">
            <PillIcon />
            <h2 className="text-2xl font-bold text-gray-700">রোগীর তথ্যাবলী</h2>
       </div>

      <div>
        <label htmlFor="allSymptoms" className="block mb-2 font-semibold text-gray-600">
          রোগীর সমস্ত লক্ষণ (শারীরিক, মানসিক, সাধারণ এবং হ্রাস/বৃদ্ধি সহ)
        </label>
        <textarea
          id="allSymptoms"
          name="allSymptoms"
          value={allSymptoms}
          onChange={handleChange}
          className={textAreaClasses}
          placeholder="এখানে রোগীর সমস্ত লক্ষণ বিস্তারিতভাবে লিখুন। যেমন: মাথার ডানদিকে ব্যথা, একা থাকতে ভয়, ঠাণ্ডা বাতাসে আরাম, মিষ্টি খেতে প্রবল ইচ্ছা ইত্যাদি..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !allSymptoms.trim()}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            বিশ্লেষণ করা হচ্ছে...
          </>
        ) : (
          'বিশ্লেষণ করুন'
        )}
      </button>
    </form>
  );
};

export default SymptomForm;
