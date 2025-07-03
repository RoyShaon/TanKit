'use server';

/**
 * @fileOverview Suggests homeopathic remedies based on user-provided symptoms.
 *
 * - suggestRemedies - A function that takes symptom inputs and returns a ranked list of potential homeopathic medicine suggestions.
 * - SuggestRemediesInput - The input type for the suggestRemedies function.
 * - SuggestRemediesOutput - The return type for the suggestRemedies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRemediesInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user.'),
});
export type SuggestRemediesInput = z.infer<typeof SuggestRemediesInputSchema>;

const SuggestRemediesOutputSchema = z.object({
  remedies: z
    .array(z.object({
      name: z.string().describe("The name of the suggested homeopathic medicine in Bengali."),
      description: z.string().describe("A brief explanation in Bengali for why the remedy is suggested, based on your knowledge."),
      score: z.number().describe("A similarity score from 1 to 100, where 100 is a perfect match between the user's symptoms and the remedy's profile in your knowledge base."),
    }))
    .describe('A ranked list of potential homeopathic medicine suggestions.'),
});
export type SuggestRemediesOutput = z.infer<typeof SuggestRemediesOutputSchema>;

export async function suggestRemedies(input: SuggestRemediesInput): Promise<SuggestRemediesOutput> {
  return suggestRemediesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRemediesPrompt',
  input: {schema: SuggestRemediesInputSchema},
  output: {schema: SuggestRemediesOutputSchema},
  prompt: `You are a knowledgeable homeopathic medicine advisor. The user will describe their symptoms in Bengali. You must analyze these symptoms and, based on your knowledge, provide a ranked list of potential homeopathic medicine suggestions. 

For each suggestion, provide:
1. The medicine name in Bengali.
2. A brief description in Bengali explaining why it is a suitable choice.
3. A similarity score from 1 to 100, where 100 indicates a perfect match.

Symptoms: {{{symptoms}}}`,
});

const suggestRemediesFlow = ai.defineFlow(
  {
    name: 'suggestRemediesFlow',
    inputSchema: SuggestRemediesInputSchema,
    outputSchema: SuggestRemediesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
