"use client";

import { useState } from "react";
import { Leaf, Bot, AlertTriangle, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Removed direct import of Genkit flows

// Define types based on API response
type SuggestRemediesOutput = {
  remedies: Array<{
    name: string;
    confidence: string;
    reasoning: string;
    score?: number;
    description?: string;
    justification?: string;
  }>;
  topRemedyFromMateriaMedica?: {
    name: string;
    description: string;
    potency: string;
    dosage: string;
    score?: number;
    justification?: string;
  };
  topRemedyFromBoericke?: {
    name: string;
    description: string;
    potency: string;
    dosage: string;
    score?: number;
    justification?: string;
  };
  topRemedyFromKent?: {
    name: string;
    description: string;
    potency: string;
    dosage: string;
    score?: number;
    justification?: string;
  };
  topRemedyFromAI?: {
    name: string;
    description: string;
    potency: string;
    dosage: string;
    score?: number;
    justification?: string;
  };
  categorizedSymptoms?: {
    mentalSymptoms: string;
    physicalSymptoms: string;
    history: string;
  };
  bestRepertorySuggestion?: string;
};
import { SymptomForm, type SymptomFormValues } from "@/components/symptom-form";
import { RemediesList } from "@/components/remedies-list";
import { TopSuggestions } from "@/components/top-suggestions";
import { CategorizedSymptomsDisplay } from "@/components/categorized-symptoms-display";
import { RepertorySuggestionDisplay } from "@/components/repertory-suggestion-display";

export default function Home() {
  const [remedies, setRemedies] = useState<SuggestRemediesOutput['remedies'] | null>(null);
  const [topRemedyFromMateriaMedica, setTopRemedyFromMateriaMedica] = useState<SuggestRemediesOutput['topRemedyFromMateriaMedica'] | null>(null);
  const [topRemedyFromBoericke, setTopRemedyFromBoericke] = useState<SuggestRemediesOutput['topRemedyFromBoericke'] | null>(null);
  const [topRemedyFromKent, setTopRemedyFromKent] = useState<SuggestRemediesOutput['topRemedyFromKent'] | null>(null);
  const [topRemedyFromAI, setTopRemedyFromAI] = useState<SuggestRemediesOutput['topRemedyFromAI'] | null>(null);
  const [categorizedSymptoms, setCategorizedSymptoms] = useState<SuggestRemediesOutput['categorizedSymptoms'] | null>(null);
  const [bestRepertorySuggestion, setBestRepertorySuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: SymptomFormValues) {
    setIsLoading(true);
    setRemedies(null);
    setTopRemedyFromMateriaMedica(null);
    setTopRemedyFromBoericke(null);
    setTopRemedyFromKent(null);
    setTopRemedyFromAI(null);
    setCategorizedSymptoms(null);
    setBestRepertorySuggestion(null);
    setError(null);

    try {
      const response = await fetch("/api/suggest-remedies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms: values.symptoms }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to get remedy suggestions");
      }

      const topRemedyNames = [
        result.topRemedyFromMateriaMedica?.name,
        result.topRemedyFromBoericke?.name,
        result.topRemedyFromKent?.name,
        result.topRemedyFromAI?.name,
      ].filter(Boolean);

      const otherRemedies = result.remedies.filter(
        (remedy: any) => !topRemedyNames.includes(remedy.name),
      );

      setRemedies(
        otherRemedies.sort((a: any, b: any) => (b.score || 0) - (a.score || 0)),
      );
      setTopRemedyFromMateriaMedica(result.topRemedyFromMateriaMedica);
      setTopRemedyFromBoericke(result.topRemedyFromBoericke);
      setTopRemedyFromKent(result.topRemedyFromKent);
      setTopRemedyFromAI(result.topRemedyFromAI);
      setCategorizedSymptoms(result.categorizedSymptoms);
      setBestRepertorySuggestion(result.bestRepertorySuggestion);
    } catch (e) {
      setError(
        "সাজেশন আনতে একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আপনার সংযোগ বা API কী পরীক্ষা করে আবার চেষ্টা করুন।",
      );
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12 flex-1 flex flex-col">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
            <Leaf className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-gray-800 tracking-tight mb-2">
            TanKit
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            রোগীর লক্ষণসমূহের বিস্তারিত বিবরণ দিন এবং হ্যানিম্যান, বোরিকস ও কেন্টের রেপার্টরি অনুসারে জেমিনি AI-এর মাধ্যমে সম্ভাব্য প্রতিকারগুলো সম্পর্কে জানুন।
          </p>
        </header>

        <main className="flex-1 grid lg:grid-cols-2 gap-8 items-start">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 flex flex-col gap-8">
            <SymptomForm onSubmit={handleSubmit} isLoading={isLoading} />
            {bestRepertorySuggestion && !isLoading && !error && (
              <RepertorySuggestionDisplay
                suggestion={bestRepertorySuggestion}
              />
            )}
            {categorizedSymptoms && !isLoading && !error && (
              <CategorizedSymptomsDisplay symptoms={categorizedSymptoms} />
            )}
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200 min-h-[500px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  লক্ষণ বিশ্লেষণ করা হচ্ছে...
                </p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <Alert variant="destructive" className="w-full">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>ত্রুটি</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}

            {!isLoading && !error && remedies === null && (
               <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <div className="text-5xl text-gray-300 mb-4">
                      <Bot />
                  </div>
                  <p className="text-gray-500 text-center">বিশ্লেষণের ফলাফল এখানে প্রদর্শিত হবে।</p>
                  <p className="text-gray-400 text-sm text-center mt-1">শুরু করতে রোগীর লক্ষণগুলি পূরণ করুন।</p>
            </div>
            )}
            
            {!isLoading && !error && (topRemedyFromMateriaMedica || topRemedyFromBoericke || topRemedyFromKent || topRemedyFromAI) && (
              <TopSuggestions 
                remedyFromMateriaMedica={topRemedyFromMateriaMedica} 
                remedyFromBoericke={topRemedyFromBoericke}
                remedyFromKent={topRemedyFromKent}
                remedyFromAI={topRemedyFromAI} 
              />
            )}

            {remedies && remedies.length > 0 && !isLoading && !error && (
              <div className="mt-8">
                <RemediesList remedies={remedies} />
              </div>
            )}
            
            {remedies && remedies.length === 0 && !topRemedyFromAI && !topRemedyFromBoericke && !topRemedyFromMateriaMedica && !topRemedyFromKent && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Alert className="w-full">
                    <Bot className="h-4 w-4" />
                    <AlertTitle>কোনো সাজেশন পাওয়া যায়নি</AlertTitle>
                    <AlertDescription>
                      বর্ণিত লক্ষণগুলির জন্য আমরা কোনও নির্দিষ্ট প্রতিকার খুঁজে
                      পাইনি। অনুগ্রহ করে বাক্যটি পুনর্গঠন করে বা আরও বিশদ বিবরণ
                      যোগ করে আবার চেষ্টা করুন।
                    </AlertDescription>
                  </Alert>
                </div>
              )}
          </section>
        </main>
      </div>

      <footer className="py-6 mt-auto bg-transparent">
        <div className="container mx-auto px-4 max-w-7xl">
          <p className="text-sm text-center text-muted-foreground mt-2">
            ডেভেলপ করেছেন TAN | © {new Date().getFullYear()} সর্বসত্ত্ব
            সংরক্ষিত।
          </p>
        </div>
      </footer>
    </>
  );
}
