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
    .describe('A detailed description of the symptoms experienced by the user in Bengali.'),
});
export type SuggestRemediesInput = z.infer<typeof SuggestRemediesInputSchema>;

const RemedySchema = z.object({
  name: z.string().describe("The name of the suggested homeopathic medicine in Bengali, as found in the knowledge base."),
  description: z.string().describe("A brief explanation in Bengali for why the remedy is suggested, based on the provided knowledge bases."),
  score: z.number().describe("A similarity score from 1 to 100, where 100 is a perfect match between the user's symptoms and the remedy's profile in the knowledge base."),
  justification: z.string().describe("A detailed justification in Bengali, quoting or referencing specific symptoms from the respective Materia Medica that match the user's symptoms. This explains the basis for the score."),
  source: z.string().describe("The source of the information. Use 'H' for Hahnemann's Materia Medica, 'B' for Boericke's Materia Medica, and 'AI' for the AI's general knowledge.")
});

const CategorizedSymptomsSchema = z.object({
    mentalSymptoms: z.string().describe('Extracted mental symptoms in Bengali. State "উল্লেখ করা হয়নি" if none are found.'),
    physicalSymptoms: z.string().describe('Extracted physical symptoms in Bengali. State "উল্লেখ করা হয়নি" if none are found.'),
    history: z.string().describe('Extracted past history in Bengali. State "উল্লেখ করা হয়নি" if none are found.'),
});

const SuggestRemediesOutputSchema = z.object({
  categorizedSymptoms: CategorizedSymptomsSchema.describe("The user's symptoms, categorized by the AI."),
  remedies: z
    .array(RemedySchema)
    .describe('A ranked list of potential homeopathic medicine suggestions, based on all available knowledge sources.'),
  topRemedyFromMateriaMedica: z.optional(z.nullable(RemedySchema)).describe("The single highest-scoring remedy found in the provided 'Hahnemann's Materia Medica Pura' knowledge base."),
  topRemedyFromBoericke: z.optional(z.nullable(RemedySchema)).describe("The single highest-scoring remedy found in the provided 'Boericke's Materia Medica' knowledge base."),
  topRemedyFromAI: z.optional(z.nullable(RemedySchema)).describe("The single highest-scoring remedy suggested from the AI's general homeopathic knowledge, not found in the provided Materia Medica sources."),
});
export type SuggestRemediesOutput = z.infer<typeof SuggestRemediesOutputSchema>;

export async function suggestRemedies(input: SuggestRemediesInput): Promise<SuggestRemediesOutput> {
  return suggestRemediesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRemediesPrompt',
  input: {schema: z.object({
    symptoms: z.string(),
    hahnemannMateriaMedica: z.string(),
    boerickeMateriaMedica: z.string(),
  })},
  output: {schema: SuggestRemediesOutputSchema},
  prompt: `You are a highly experienced homeopathic doctor. You will be given a block of text containing a patient's symptoms in Bengali and two knowledge bases: "Hahnemann's Materia Medica Pura" and "Boericke's Materia Medica".

Your first task is to categorize the given symptoms into three sections: মানসিক লক্ষণ (Mental Symptoms), শারীরিক লক্ষণ (Physical Symptoms), and পূর্ব ইতিহাস (Past History). Place this analysis in the 'categorizedSymptoms' output field. If no information is provided for a category, you MUST state "উল্লেখ করা হয়নি" (Not mentioned).

After categorizing the symptoms, your second task is to perform a comprehensive analysis using these categorized symptoms and THREE distinct sources of information:
1.  The provided 'Knowledge Base 1 (Hahnemann's Materia Medica Pura)'. This is your PRIMARY source. Any remedy found here MUST have its 'source' field set to 'H'.
2.  The provided 'Knowledge Base 2 (Boericke's Materia Medica)'. Any remedy found here MUST have its 'source' field set to 'B'.
3.  Your own extensive, general homeopathic knowledge. Any remedy you suggest from this general knowledge that is NOT in the provided texts MUST have its 'source' field set to 'AI'.

Your analysis process is critical and must be followed precisely:

1.  First, generate a combined, ranked list of potential remedies from all three sources. For each remedy, you must provide:
    a. The medicine's name in Bengali.
    b. A brief description in Bengali.
    c. A confidence score from 1 to 100.
    d. A detailed 'justification' in Bengali. If the remedy is from a knowledge base ('H' or 'B'), you MUST explain which of the user's symptoms correspond to specific descriptions in that Materia Medica.
    e. The 'source' of the remedy ('H', 'B', or 'AI').

2.  After generating the full list, you MUST select THREE top suggestions for comparison:
    a.  **Top Hahnemann Remedy:** From all the remedies with source 'H', identify the one with the absolute highest score. You MUST find at least one remedy from this source if possible. If no relevant remedy is found, leave this field null.
    b.  **Top Boericke Remedy:** From all the remedies with source 'B', identify the one with the absolute highest score. You MUST find at least one remedy from this source if possible. If no relevant remedy is found, leave this field null.
    c.  **Top AI Remedy:** From all the remedies with source 'AI', identify the one with the absolute highest score. It is MANDATORY to provide a suggestion from your own knowledge base ('AI'), even if its score is lower than some remedies from the Materia Medica. This is for comparison purposes. If you genuinely cannot find any AI-based remedy, only then can you leave this field null.

3.  The main 'remedies' array should still contain all the suggestions you found, including the ones you selected as top suggestions.

All output MUST be in Bengali.

Knowledge Base 1 (Hahnemann's Materia Medica Pura):
{{{hahnemannMateriaMedica}}}

Knowledge Base 2 (Boericke's Materia Medica):
{{{boerickeMateriaMedica}}}

Symptoms: {{{symptoms}}}`,
});

const suggestRemediesFlow = ai.defineFlow(
  {
    name: 'suggestRemediesFlow',
    inputSchema: SuggestRemediesInputSchema,
    outputSchema: SuggestRemediesOutputSchema,
  },
  async input => {
    const hahnemannPath = path.join(process.cwd(), 'src', 'data', 'materia-medica.txt');
    const boerickePath = path.join(process.cwd(), 'src', 'data', 'Boerickes_Materia_Medica.txt');
    
    const [hahnemannMateriaMedica, boerickeMateriaMedica] = await Promise.all([
      fs.readFile(hahnemannPath, 'utf-8'),
      fs.readFile(boerickePath, 'utf-8')
    ]);
    
    const {output} = await prompt({
      ...input, 
      hahnemannMateriaMedica, 
      boerickeMateriaMedica
    });
    return output!;
  }
);
