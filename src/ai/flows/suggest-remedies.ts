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
import * as fs from 'fs/promises';
import * as path from 'path';

const SuggestRemediesInputSchema = z.object({
  symptoms: z
    .string()
    .describe('A detailed description of the symptoms experienced by the user.'),
});
export type SuggestRemediesInput = z.infer<typeof SuggestRemediesInputSchema>;

const SuggestRemediesOutputSchema = z.object({
  remedies: z
    .array(z.object({
      name: z.string().describe("The name of the suggested homeopathic medicine in Bengali, as found in the knowledge base."),
      description: z.string().describe("A brief explanation in Bengali for why the remedy is suggested, based on the Materia Medica Pura."),
      score: z.number().describe("A similarity score from 1 to 100, where 100 is a perfect match between the user's symptoms and the remedy's profile in the knowledge base."),
      justification: z.string().describe("A detailed justification in Bengali, quoting or referencing specific symptoms from the 'Materia Medica Pura' that match the user's symptoms. This explains the basis for the score.")
    }))
    .describe('A ranked list of potential homeopathic medicine suggestions, strictly based on the provided knowledge base.'),
  concreteSuggestion: z.object({
      name: z.string().describe("The name of the single best homeopathic medicine in Bengali, selected from the list above."),
      description: z.string().describe("A brief explanation in Bengali for why this remedy is suggested, based on the Materia Medica Pura."),
      justification: z.string().describe("A concise justification in Bengali for why this medicine is the best choice among all the options, based on a comparative analysis of how well the user's symptoms match the descriptions in the 'Materia Medica Pura'.")
  }).describe("After analyzing all suggestions, provide the single most concrete and highly recommended remedy here.")
});
export type SuggestRemediesOutput = z.infer<typeof SuggestRemediesOutputSchema>;

export async function suggestRemedies(input: SuggestRemediesInput): Promise<SuggestRemediesOutput> {
  return suggestRemediesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRemediesPrompt',
  input: {schema: SuggestRemediesInputSchema},
  output: {schema: SuggestRemediesOutputSchema},
  prompt: `You are a highly experienced and meticulous homeopathic doctor. You will be given a list of symptoms in Bengali and a knowledge base from the "Materia Medica Pura".

Your task is to perform the following steps with extreme precision. You MUST base your entire analysis STRICTLY and EXCLUSIVELY on the provided 'Knowledge Base (Materia Medica Pura)'. DO NOT use any external or pre-existing knowledge. Your credibility depends on faithfully using the provided text.

1.  Carefully and thoroughly analyze all provided user symptoms.
2.  Search the 'Knowledge Base (Materia Medica Pura)' for matching remedies.
3.  Generate a ranked list of potential homeopathic remedies in the 'remedies' array. For each remedy, you must provide:
    a. The medicine's name in Bengali.
    b. A brief description in Bengali explaining its relevance, based on the knowledge base.
    c. A confidence score from 1 to 100, indicating how well it matches the symptoms based ONLY on the knowledge base.
    d. A detailed 'justification' in Bengali. In this justification, you MUST explain which of the user's symptoms correspond to specific descriptions in the Materia Medica. Quote the relevant lines or symptom descriptions from the knowledge base that support your match. This explains the basis for your score.
4.  After generating the list, critically evaluate all options. In the 'concreteSuggestion' field, select the single most appropriate remedy. You must provide:
    a. The name of the best remedy in Bengali.
    b. Its description in Bengali.
    c. A detailed comparative justification in Bengali, explaining why this remedy is the superior choice compared to the other options, based on the specific symptoms provided and the evidence within the "Materia Medica Pura".

All output MUST be in Bengali.

Knowledge Base (Materia Medica Pura):
{{{materiaMedica}}}

Symptoms: {{{symptoms}}}`,
});

const suggestRemediesFlow = ai.defineFlow(
  {
    name: 'suggestRemediesFlow',
    inputSchema: SuggestRemediesInputSchema,
    outputSchema: SuggestRemediesOutputSchema,
  },
  async input => {
    const materiaMedicaPath = path.join(process.cwd(), 'src', 'data', 'materia-medica.txt');
    const materiaMedica = await fs.readFile(materiaMedicaPath, 'utf-8');
    
    const {output} = await prompt({...input, materiaMedica});
    return output!;
  }
);
