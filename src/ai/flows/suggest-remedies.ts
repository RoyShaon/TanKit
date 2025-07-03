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
import {readFile} from 'fs/promises';
import path from 'path';

const SuggestRemediesInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user.'),
});
export type SuggestRemediesInput = z.infer<typeof SuggestRemediesInputSchema>;

const SuggestRemediesOutputSchema = z.object({
  remedies: z
    .array(z.object({name: z.string(), description: z.string()}))
    .describe('A ranked list of potential homeopathic medicine suggestions.'),
});
export type SuggestRemediesOutput = z.infer<typeof SuggestRemediesOutputSchema>;

export async function suggestRemedies(input: SuggestRemediesInput): Promise<SuggestRemediesOutput> {
  return suggestRemediesFlow(input);
}

const PromptInputSchema = SuggestRemediesInputSchema.extend({
  knowledgeBase: z.string().describe('The knowledge base of homeopathic remedies.'),
});

const prompt = ai.definePrompt({
  name: 'suggestRemediesPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: SuggestRemediesOutputSchema},
  prompt: `You are a knowledgeable homeopathic medicine advisor. You will use the provided Materia Medica text as your primary source of truth. The user will describe their symptoms in Bengali. You must analyze these symptoms and, based on the provided knowledge, provide a ranked list of potential homeopathic medicine suggestions. Both the medicine name and its description must be in Bengali.

Materia Medica:
{{{knowledgeBase}}}

Symptoms: {{{symptoms}}}`,
});

const suggestRemediesFlow = ai.defineFlow(
  {
    name: 'suggestRemediesFlow',
    inputSchema: SuggestRemediesInputSchema,
    outputSchema: SuggestRemediesOutputSchema,
  },
  async input => {
    const knowledgeBasePath = path.join(process.cwd(), 'src', 'data', 'knowledge-base.txt');
    const knowledgeBase = await readFile(knowledgeBasePath, 'utf-8');

    const {output} = await prompt({...input, knowledgeBase});
    return output!;
  }
);
