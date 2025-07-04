"use client";

import { BookText, BrainCircuit, Star, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RemedyType = {
  name: string;
  description: string;
  score?: number;
  justification?: string;
  source: string;
};

interface TopSuggestionsProps {
    remedyFromMateriaMedica: RemedyType | null | undefined;
    remedyFromBoericke: RemedyType | null | undefined;
    remedyFromKent: RemedyType | null | undefined;
    remedyFromAI: RemedyType | null | undefined;
}

const ScoreCircle: React.FC<{ score: number | undefined }> = ({ score }) => {
    const validScore =
        isNaN(score || 0) || score === undefined || score === null
        ? 85
        : Math.max(0, Math.min(100, score || 0));
    const circumference = 2 * Math.PI * 16; 
    const strokeDashoffset = circumference - (validScore / 100) * circumference;
    
    let colorClass = 'text-green-500';
    if (validScore < 75) colorClass = 'text-yellow-500';
    if (validScore < 50) colorClass = 'text-red-500';
  
    return (
      <div className="relative h-8 w-8 flex-shrink-0">
        <svg className="h-full w-full" viewBox="0 0 36 36">
          <circle
            className="text-gray-200"
            strokeWidth="3"
            stroke="currentColor"
            fill="transparent"
            r="16"
            cx="18"
            cy="18"
          />
          <circle
            className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="16"
            cx="18"
            cy="18"
          />
        </svg>
        <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xs ${colorClass}`}>
          {validScore}
        </span>
      </div>
    );
};
  

const SuggestionCard: React.FC<{ remedy: RemedyType, type: 'materia-medica' | 'boericke' | 'kent' | 'ai' }> = ({ remedy, type }) => {
    const isMateriaMedica = type === 'materia-medica';
    const isBoericke = type === 'boericke';
    const isKent = type === 'kent';

    const cardClasses = isMateriaMedica 
        ? "bg-primary/5 border-primary/20"
        : isBoericke
        ? "bg-blue-500/5 border-blue-500/20"
        : isKent
        ? "bg-purple-500/5 border-purple-500/20"
        : "bg-accent/5 border-accent/20";
    
    const iconClasses = isMateriaMedica
        ? "bg-primary text-primary-foreground"
        : isBoericke
        ? "bg-blue-500 text-white"
        : isKent
        ? "bg-purple-500 text-white"
        : "bg-accent text-accent-foreground";

    const titleText = isMateriaMedica ? "হ্যানিম্যানের Materia Medica থেকে" 
        : isBoericke ? "বোরিকসের Materia Medica থেকে" 
        : isKent ? "কেন্টের Materia Medica থেকে"
        : "AI থেকে সেরা পরামর্শ";

    const icon = isMateriaMedica ? <BookText className="w-4 h-4" /> 
        : isBoericke ? <GraduationCap className="w-4 h-4" /> 
        : isKent ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open-text"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><path d="M6 8h2"/><path d="M6 12h2"/><path d="M16 8h2"/><path d="M16 12h2"/></svg>
        : <BrainCircuit className="w-4 h-4" />;

    return (
        <Card className={`shadow-lg ${cardClasses} flex flex-col`}>
            <CardHeader className="flex-row items-center gap-2 space-y-0 p-3 pb-2">
                <div className={`rounded-full p-1.5 ${iconClasses}`}>
                    {icon}
                </div>
                <CardTitle className="text-xs font-bold text-foreground/80">{titleText}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-2 flex-1 flex flex-col justify-between">
                <div className='space-y-2'>
                    <div className="flex items-start gap-3">
                        <ScoreCircle score={remedy.score} />
                        <div className="flex-1">
                            <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span>{remedy.name}</span>
                            </h3>
                            <p className="mt-1 text-gray-600 text-xs leading-relaxed">{remedy.description}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-1 text-xs">ভিত্তি:</h4>
                        <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap">{remedy.justification}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export function TopSuggestions({ remedyFromMateriaMedica, remedyFromBoericke, remedyFromKent, remedyFromAI }: TopSuggestionsProps) {
    return (
        <div className="mb-8">
             <div className="flex items-center gap-3 mb-4 md:mb-6">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                <h2 className="text-xl md:text-2xl font-bold text-foreground">সেরা পরামর্শ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 items-stretch">
                {remedyFromMateriaMedica && (
                    <SuggestionCard remedy={remedyFromMateriaMedica} type="materia-medica" />
                )}
                {remedyFromBoericke && (
                    <SuggestionCard remedy={remedyFromBoericke} type="boericke" />
                )}
                {remedyFromKent && (
                    <SuggestionCard remedy={remedyFromKent} type="kent" />
                )}
                {remedyFromAI && (
                     <SuggestionCard remedy={remedyFromAI} type="ai" />
                )}
            </div>
        </div>
    );
}
