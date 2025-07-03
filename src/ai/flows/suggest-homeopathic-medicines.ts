'use server';

/**
 * @fileOverview Suggests homeopathic medicines based on user-provided symptoms.
 *
 * - suggestHomeopathicMedicines - A function that takes symptom inputs and returns a ranked list of potential homeopathic medicine suggestions with details.
 * - SuggestHomeopathicMedicinesInput - The input type for the suggestHomeopathicMedicines function.
 * - SuggestHomeopathicMedicinesOutput - The return type for the suggestHomeopathicMedicines function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

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
  prompt: `You are a knowledgeable homeopathic medicine advisor. A user will describe their symptoms, and you will provide a ranked list of potential homeopathic medicine suggestions based on the provided "Materia Medica Pura" knowledge base. Provide a description for each medicine.

Knowledge Base (Materia Medica Pura):
{{{materiaMedica}}}

Symptoms: {{{symptoms}}}`,
});

const suggestHomeopathicMedicinesFlow = ai.defineFlow(
  {
    name: 'suggestHomeopathicMedicinesFlow',
    inputSchema: SuggestHomeopathicMedicinesInputSchema,
    outputSchema: SuggestHomeopathicMedicinesOutputSchema,
  },
  async input => {
    const materiaMedicaPath = path.join(process.cwd(), 'src', 'data', 'materia-medica.txt');
    const materiaMedica = await fs.readFile(materiaMedicaPath, 'utf-8');

    const {output} = await prompt({...input, materiaMedica});
    return output!;
  }
);
