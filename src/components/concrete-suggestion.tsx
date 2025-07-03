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
                    <h3 className="text-xl font-bold text-gray-800">{suggestion.name}</h3>
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
