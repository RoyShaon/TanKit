// src/ai/flows/suggest-homeopathic-medicines.ts
'use server';

/**
 * @fileOverview Suggests homeopathic medicines based on user-provided symptoms using a tool for retrieving medicine details.
 *
 * - suggestHomeopathicMedicines - A function that takes symptom inputs and returns a ranked list of potential homeopathic medicine suggestions with details.
 * - SuggestHomeopathicMedicinesInput - The input type for the suggestHomeopathicMedicines function.
 * - SuggestHomeopathicMedicinesOutput - The return type for the suggestHomeopathicMedicines function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHomeopathicMedicinesInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user.'),
});
export type SuggestHomeopathicMedicinesInput = z.infer<typeof SuggestHomeopathicMedicinesInputSchema>;

const SuggestHomeopathicMedicinesOutputSchema = z.object({
  remedies: z
    .array(z.object({name: z.string(), description: z.string()}))
    .describe('A ranked list of potential homeopathic medicine suggestions.'),
});
export type SuggestHomeopathicMedicinesOutput = z.infer<typeof SuggestHomeopathicMedicinesOutputSchema>;

export async function suggestHomeopathicMedicines(input: SuggestHomeopathicMedicinesInput): Promise<SuggestHomeopathicMedicinesOutput> {
  return suggestHomeopathicMedicinesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHomeopathicMedicinesPrompt',
  input: {schema: SuggestHomeopathicMedicinesInputSchema},
  output: {schema: SuggestHomeopathicMedicinesOutputSchema},
  prompt: `You are a knowledgeable homeopathic medicine advisor. Use the "material medical.pdf" as your primary source of truth. A user will describe their symptoms, and you will provide a ranked list of potential homeopathic medicine suggestions based on the content of that document. Provide a description for each medicine.

Symptoms: {{{symptoms}}}`,
});

const suggestHomeopathicMedicinesFlow = ai.defineFlow(
  {
    name: 'suggestHomeopathicMedicinesFlow',
    inputSchema: SuggestHomeopathicMedicinesInputSchema,
    outputSchema: SuggestHomeopathicMedicinesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
