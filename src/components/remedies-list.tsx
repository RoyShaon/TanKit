'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { type SuggestRemediesOutput } from '@/ai/flows/suggest-remedies';
import { Pill } from 'lucide-react';

interface RemediesListProps {
    remedies: NonNullable<SuggestRemediesOutput>['remedies'];
}

export function RemediesList({ remedies }: RemediesListProps) {
    return (
        <section>
            <h2 className="text-3xl font-bold font-headline text-center mb-8">AI-Powered Suggestions</h2>
            <Accordion type="single" collapsible className="w-full space-y-3">
            {remedies.map((remedy, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="bg-card border rounded-lg shadow-sm transition-shadow hover:shadow-md">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline p-4 md:p-6 text-left">
                    <div className="flex items-center gap-4 w-full">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 text-accent-foreground flex-shrink-0">
                          <Pill className="w-5 h-5 text-accent" />
                        </div>
                        <span className="flex-1">{remedy.name}</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground px-4 pb-4 md:px-6 md:pb-6 pl-16">
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p className="whitespace-pre-wrap">{remedy.description}</p>
                    </div>
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
      </section>
    );
}
