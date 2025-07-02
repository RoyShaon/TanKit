'use client';

import { useState } from 'react';
import { Leaf, Bot, AlertTriangle, LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { suggestRemedies, type SuggestRemediesOutput } from '@/ai/flows/suggest-remedies';
import { SymptomForm } from '@/components/symptom-form';
import { RemediesList } from '@/components/remedies-list';

interface SymptomFormValues {
    symptoms: string;
}

export default function Home() {
  const [remedies, setRemedies] = useState<SuggestRemediesOutput['remedies'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: SymptomFormValues) {
    setIsLoading(true);
    setRemedies(null);
    setError(null);
    try {
      const result = await suggestRemedies({ symptoms: values.symptoms });
      setRemedies(result.remedies);
    } catch (e) {
      setError('An error occurred while fetching suggestions. Please check your connection or API key and try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16 max-w-3xl">
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4 ring-4 ring-primary/20">
              <Leaf className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-2">
              Veridia
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Describe your symptoms and let our AI assistant suggest potential homeopathic remedies for your wellbeing.
            </p>
          </header>

          <section className="mb-12 bg-card p-6 md:p-8 rounded-xl shadow-sm border">
            <SymptomForm onSubmit={handleSubmit} isLoading={isLoading} />
          </section>

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Finding remedies for you...</p>
            </div>
          )}

          {error && (
             <Alert variant="destructive">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}

          {remedies && remedies.length > 0 && (
            <RemediesList remedies={remedies} />
          )}
          
          {remedies && remedies.length === 0 && !isLoading && !error && (
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>No Suggestions Found</AlertTitle>
                <AlertDescription>
                    We couldn't find any specific remedies for the symptoms described. Please try rephrasing or adding more details.
                </AlertDescription>
              </Alert>
          )}
        </div>
      </main>

      <footer className="py-8 mt-auto bg-background/80 backdrop-blur-sm border-t">
        <div className="container mx-auto px-4 max-w-3xl">
          <Alert variant="default" className="bg-card/50">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <AlertTitle className="font-bold">Disclaimer</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </AlertDescription>
          </Alert>
        </div>
      </footer>
    </>
  );
}
