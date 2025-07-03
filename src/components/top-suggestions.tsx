'use client';

import { type SuggestRemediesOutput } from '@/ai/flows/suggest-remedies';
import { BookText, BrainCircuit, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Remedy = NonNullable<SuggestRemediesOutput['topRemedyFromMateriaMedica']>;

interface TopSuggestionsProps {
    remedyFromMateriaMedica: Remedy | null | undefined;
    remedyFromAI: Remedy | null | undefined;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 20; // 2 * pi * radius
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    let colorClass = 'text-green-500';
    if (score < 75) colorClass = 'text-yellow-500';
    if (score < 50) colorClass = 'text-red-500';
  
    return (
      <div className="relative h-12 w-12 flex-shrink-0">
        <svg className="h-full w-full" viewBox="0 0 44 44">
          <circle
            className="text-gray-200"
            strokeWidth="3"
            stroke="currentColor"
            fill="transparent"
            r="20"
            cx="22"
            cy="22"
          />
          <circle
            className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="20"
            cx="22"
            cy="22"
          />
        </svg>
        <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-base ${colorClass}`}>
          {score}
        </span>
      </div>
    );
  };
  

const SuggestionCard: React.FC<{ remedy: Remedy, type: 'materia-medica' | 'ai' }> = ({ remedy, type }) => {
    const isMateriaMedica = type === 'materia-medica';

    const cardClasses = isMateriaMedica 
        ? "bg-primary/5 border-primary/20"
        : "bg-accent/5 border-accent/20";
    
    const iconClasses = isMateriaMedica
        ? "bg-primary text-primary-foreground"
        : "bg-accent text-accent-foreground";

    const titleText = isMateriaMedica ? "হ্যানিম্যানের Materia Medica থেকে সেরা পরামর্শ" : "AI থেকে সেরা পরামর্শ";

    return (
        <Card className={`shadow-lg ${cardClasses} flex flex-col`}>
            <CardHeader className="flex-row items-center gap-3 space-y-0 pb-4">
                <div className={`rounded-full p-2 ${iconClasses}`}>
                    {isMateriaMedica ? <BookText className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                </div>
                <CardTitle className="text-lg font-bold text-foreground/80">{titleText}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div className='space-y-4'>
                    <div className="flex items-start gap-4">
                        <ScoreCircle score={remedy.score} />
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span>{remedy.name}</span>
                                {remedy.source === 'H' && (
                                    <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-bold ring-2 ring-green-200" title="হ্যানিম্যানের Materia Medica থেকে">H</span>
                                )}
                                {remedy.source === 'AI' && (
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold ring-2 ring-indigo-200" title="AI এর সাধারণ জ্ঞান থেকে">AI</span>
                                )}
                            </h3>
                            <p className="mt-1 text-gray-600 text-base leading-relaxed">{remedy.description}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-1">কেন এটি সেরা?</h4>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{remedy.justification}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export function TopSuggestions({ remedyFromMateriaMedica, remedyFromAI }: TopSuggestionsProps) {
    return (
        <div className="mb-8">
             <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-foreground">সেরা দুটি পরামর্শ</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
                {remedyFromMateriaMedica && (
                    <SuggestionCard remedy={remedyFromMateriaMedica} type="materia-medica" />
                )}
                 {remedyFromMateriaMedica && !remedyFromAI && <div />}
                {remedyFromAI && (
                     <SuggestionCard remedy={remedyFromAI} type="ai" />
                )}
            </div>
        </div>
    );
}
