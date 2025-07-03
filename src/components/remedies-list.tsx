"use client";

import { Pill } from "lucide-react";

interface RemedyItem {
  name: string;
  confidence: string;
  reasoning: string;
  description?: string;
  justification?: string;
  score?: number;
}

interface RemediesListProps {
  remedies: RemedyItem[];
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  const validScore =
    isNaN(score) || score === undefined || score === null
      ? 75
      : Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 24; // 2 * pi * radius
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  let colorClass = "text-green-500";
  if (validScore < 75) colorClass = "text-yellow-500";
  if (validScore < 50) colorClass = "text-red-500";

  return (
    <div className="relative h-16 w-16 flex-shrink-0">
      <svg className="h-full w-full" viewBox="0 0 52 52">
        <circle
          className="text-gray-200"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="24"
          cx="26"
          cy="26"
        />
        <circle
          className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="24"
          cx="26"
          cy="26"
        />
      </svg>
      <span
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-lg ${colorClass}`}
      >
        {validScore}
      </span>
    </div>
  );
};

export function RemediesList({ remedies }: RemediesListProps) {
  return (
    <div className="h-full">
      <div className="flex items-center gap-3 mb-6">
        <Pill className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          অন্যান্য সম্ভাব্য ঔষধসমূহ
        </h2>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {remedies.map((remedy, index) => (
          <div
            key={index}
            className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-200/80 transition-all hover:shadow-lg hover:border-cyan-200"
          >
            <div className="flex items-start gap-4">
              <ScoreCircle score={remedy.score || 75} />
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>{remedy.name}</span>
                  </h3>
                  <p className="mt-1 text-sm md:text-base text-gray-600 leading-relaxed">
                    {remedy.description}
                  </p>
                </div>
                {remedy.justification && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                      ভিত্তি:
                    </h4>
                    <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">
                      {remedy.justification}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
