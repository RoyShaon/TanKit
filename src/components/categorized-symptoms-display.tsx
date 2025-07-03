'use client';

import { Brain, Stethoscope, History } from 'lucide-react';

interface CategorizedSymptoms {
    mentalSymptoms: string;
    physicalSymptoms: string;
    history: string;
}

interface CategorizedSymptomsDisplayProps {
  symptoms: CategorizedSymptoms;
}

export function CategorizedSymptomsDisplay({ symptoms }: CategorizedSymptomsDisplayProps) {
  return (
    <div className="mb-6 space-y-4 rounded-xl border border-gray-200/80 bg-gray-50/50 p-3 sm:p-4 shadow-inner">
       <h3 className="text-base md:text-lg font-bold text-gray-700">AI দ্বারা শ্রেণীবদ্ধ লক্ষণসমূহ:</h3>
       <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
                <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Brain className="h-4 w-4" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600">মানসিক লক্ষণ</h4>
                    <p className="text-gray-500">{symptoms.mentalSymptoms}</p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600">শারীরিক লক্ষণ</h4>
                    <p className="text-gray-500">{symptoms.physicalSymptoms}</p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <History className="h-4 w-4" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600">পূর্ব ইতিহাস</h4>
                    <p className="text-gray-500">{symptoms.history}</p>
                </div>
            </div>
       </div>
    </div>
  );
}
