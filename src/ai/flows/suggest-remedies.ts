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
      justification: z.string().describe("A detailed justification in Bengali, quoting or referencing specific symptoms from the 'Materia Medica Pura' that match the user's symptoms. This explains the basis for the score."),
      source: z.string().describe("The source of the information. Use 'R' if the remedy is found in the provided Materia Medica. Use 'AI' if it is from the AI's general knowledge.")
    }))
    .describe('A ranked list of potential homeopathic medicine suggestions, strictly based on the provided knowledge base.'),
  concreteSuggestion: z.object({
      name: z.string().describe("The name of the single best homeopathic medicine in Bengali, selected from the list above."),
      description: z.string().describe("A brief explanation in Bengali for why this remedy is suggested, based on the Materia Medica Pura."),
      justification: z.string().describe("A concise justification in Bengali for why this medicine is the best choice among all the options, based on a comparative analysis of how well the user's symptoms match the descriptions in the 'Materia Medica Pura'."),
      source: z.string().describe("The source of the information. Use 'R' if the remedy is found in the provided Materia Medica. Use 'AI' if it is from the AI's general knowledge.")
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
  prompt: `You are a highly experienced homeopathic doctor. You will be given a list of symptoms in Bengali and a knowledge base from the "Materia Medica Pura".

Your task is to perform a comprehensive analysis using TWO sources of information:
1.  The provided 'Knowledge Base (Materia Medica Pura)'. This is your PRIMARY source.
2.  Your own extensive, general homeopathic knowledge.

Your process must be as follows:

1.  First, carefully analyze the user's symptoms against the 'Knowledge Base (Materia Medica Pura)'.
2.  Generate a ranked list of potential remedies. For each remedy, you must provide:
    a. The medicine's name in Bengali.
    b. A brief description in Bengali.
    c. A confidence score from 1 to 100.
    d. A detailed 'justification' in Bengali. If the remedy is from the knowledge base, you MUST explain which of the user's symptoms correspond to specific descriptions in the Materia Medica, quoting relevant lines.
    e. The 'source' of the remedy.
       - If the remedy is found in the provided 'Knowledge Base (Materia Medica Pura)', you MUST set the 'source' field to 'R'.
       - If you suggest a remedy from your general knowledge that is NOT in the provided text, you MUST set the 'source' field to 'AI'.
3.  After generating the list, critically evaluate all options and select the single most appropriate remedy for the 'concreteSuggestion' field, providing its name, description, justification, and its source ('R' or 'AI').

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
