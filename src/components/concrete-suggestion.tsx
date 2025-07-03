'use client';

import { type SuggestRemediesOutput } from '@/ai/flows/suggest-remedies';
import { Star } from 'lucide-react';

interface ConcreteSuggestionProps {
    suggestion: NonNullable<SuggestRemediesOutput>['concreteSuggestion'];
}

export function ConcreteSuggestion({ suggestion }: ConcreteSuggestionProps) {
    return (
        <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl mb-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <Star className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-primary">সর্বাধিক উপযুক্ত ঔষধ</h2>
            </div>
            
            <div className="space-y-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span>{suggestion.name}</span>
                        {suggestion.source === 'R' && (
                            <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-bold ring-2 ring-green-200" title="Materia Medica থেকে">R</span>
                        )}
                        {suggestion.source === 'AI' && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold ring-2 ring-indigo-200" title="AI এর সাধারণ জ্ঞান থেকে">AI</span>
                        )}
                    </h3>
                    <p className="mt-1 text-gray-600 text-base leading-relaxed">{suggestion.description}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700 mb-1">কেন এটি সেরা?</h4>
                    <p className="text-gray-600 text-base leading-relaxed">{suggestion.justification}</p>
                </div>
            </div>
        </div>
    );
}
