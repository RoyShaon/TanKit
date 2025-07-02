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
      setError('সাজেশন আনতে একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আপনার সংযোগ বা API কী পরীক্ষা করে আবার চেষ্টা করুন।');
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
              আপনার লক্ষণগুলি বর্ণনা করুন এবং আমাদের এআই সহকারীকে আপনার সুস্থতার জন্য সম্ভাব্য হোমিওপ্যাথিক প্রতিকারগুলির পরামর্শ দিন।
            </p>
          </header>

          <section className="mb-12 bg-card p-6 md:p-8 rounded-xl shadow-sm border">
            <SymptomForm onSubmit={handleSubmit} isLoading={isLoading} />
          </section>

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">আপনার জন্য প্রতিকার খোঁজা হচ্ছে...</p>
            </div>
          )}

          {error && (
             <Alert variant="destructive">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>ত্রুটি</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}

          {remedies && remedies.length > 0 && (
            <RemediesList remedies={remedies} />
          )}
          
          {remedies && remedies.length === 0 && !isLoading && !error && (
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>কোনো সাজেশন পাওয়া যায়নি</AlertTitle>
                <AlertDescription>
                    বর্ণিত লক্ষণগুলির জন্য আমরা কোনও নির্দিষ্ট প্রতিকার খুঁজে পাইনি। অনুগ্রহ করে বাক্যটি পুনর্গঠন করে বা আরও বিশদ বিবরণ যোগ করে আবার চেষ্টা করুন।
                </AlertDescription>
              </Alert>
          )}
        </div>
      </main>

      <footer className="py-8 mt-auto bg-background/80 backdrop-blur-sm border-t">
        <div className="container mx-auto px-4 max-w-3xl">
          <Alert variant="default" className="bg-card/50">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <AlertTitle className="font-bold">দাবিত্যাগ</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              এই টুলটি শুধুমাত্র তথ্যের উদ্দেশ্যে এবং এটি পেশাদার চিকিৎসা পরামর্শ, রোগ নির্ণয় বা চিকিৎসার বিকল্প নয়। যেকোনো மருத்துவ অবস্থা সম্পর্কিত প্রশ্নের জন্য সর্বদা আপনার চিকিৎসক বা অন্যান্য যোগ্য স্বাস্থ্য প্রদানকারীর পরামর্শ নিন।
            </AlertDescription>
          </Alert>
        </div>
      </footer>
    </>
  );
}
