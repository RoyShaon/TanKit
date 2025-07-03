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
  name: z.string().describe("The name of the suggested homeopathic medicine in English, as found in the knowledge base."),
  description: z.string().describe("A brief explanation in Bengali for why the remedy is suggested, based on the provided knowledge bases."),
  score: z.number().describe("A similarity score from 1 to 100, where 100 is a perfect match between the user's symptoms and the remedy's profile in the knowledge base."),
  justification: z.string().describe("A detailed justification in Bengali, quoting or referencing specific symptoms from the respective Materia Medica that match the user's symptoms. This explains the basis for the score."),
  source: z.string().describe("The source of the information. Use 'H' for Hahnemann's Materia Medica, 'B' for Boericke's Materia Medica, 'K' for Kent's Materia Medica, and 'AI' for the AI's general knowledge.")
});

const CategorizedSymptomsSchema = z.object({
    mentalSymptoms: z.string().describe('Extracted mental symptoms in Bengali. State "উল্লেখ করা হয়নি" if none are found.'),
    physicalSymptoms: z.string().describe('Extracted physical symptoms in Bengali. State "উল্লেখ করা হয়নি" if none are found.'),
    history: z.string().describe('Extracted past history in Bengali. State "উল্লেখ করা হয়নি" if none are found.'),
});

const SuggestRemediesOutputSchema = z.object({
  categorizedSymptoms: CategorizedSymptomsSchema.describe("The user's symptoms, categorized by the AI."),
  bestRepertorySuggestion: z.string().describe("A brief analysis in Bengali explaining which repertory (Hahnemann, Boericke, Kent, or general AI knowledge) is likely most suitable for this specific case and why."),
  remedies: z
    .array(RemedySchema)
    .describe('A ranked list of potential homeopathic medicine suggestions, based on all available knowledge sources.'),
  topRemedyFromMateriaMedica: z.optional(z.nullable(RemedySchema)).describe("The single highest-scoring remedy found in the provided 'Hahnemann's Materia Medica Pura' knowledge base."),
  topRemedyFromBoericke: z.optional(z.nullable(RemedySchema)).describe("The single highest-scoring remedy found in the provided 'Boericke's Materia Medica' knowledge base."),
  topRemedyFromKent: z.optional(z.nullable(RemedySchema)).describe("The single highest-scoring remedy found in the provided 'Kent's Materia Medica' knowledge base."),
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
    kentMateriaMedica: z.string(),
  })},
  output: {schema: SuggestRemediesOutputSchema},
  prompt: `You are a highly experienced homeopathic doctor. You will analyze the patient's symptoms based on the core principles of classical homeopathy: 
1.  **Totality of Symptoms:** Consider all symptoms together—mental, emotional, general, and particular. The goal is to treat the patient, not just the disease.
2.  **Individualization and Peculiar Symptoms:** Give special weight to Strange, Rare, and Peculiar (SRP) symptoms that distinguish this patient from others with a similar complaint.
3.  **Miasmatic Diagnosis:** Consider the underlying miasmatic cause (Psora, Sycosis, Syphilis, Tubercular) to understand the chronic nature of the disease.
4.  **Mental and Emotional Symptoms:** Prioritize the patient's mental and emotional state—their temperament, fears, anger, and thoughts—as they are often the key indicators.
5.  **Modalities Analysis:** Pay close attention to what makes the symptoms better or worse (time of day, weather, food, posture, motion).
6.  **General & Particular Symptoms:** Differentiate between general symptoms (affecting the whole person, like sleep, thirst, temperature) and particular symptoms (related to a specific organ). General symptoms hold more weight.
7.  **Hering's Law of Cure:** Structure your analysis to understand the direction of cure and predict the healing response.

Now, proceed with the following tasks precisely:

Your **first task** is to categorize the given symptoms into three sections: মানসিক লক্ষণ (Mental Symptoms), শারীরিক লক্ষণ (Physical Symptoms), and পূর্ব ইতিহাস (Past History). Place this analysis in the 'categorizedSymptoms' output field. If no information is provided for a category, you MUST state "উল্লেখ করা হয়নি" (Not mentioned).

Your **second task** is to analyze the case as a whole and determine which knowledge source (Hahnemann's Materia Medica, Boericke's Materia Medica, Kent's Materia Medica, or your own general AI knowledge) appears most suited for finding the primary remedy for this specific patient. Provide a short justification for your choice in the 'bestRepertorySuggestion' field.

Your **third task** is to perform a comprehensive analysis using your categorized symptoms and FOUR distinct sources of information:
1.  The provided 'Knowledge Base 1 (Hahnemann's Materia Medica Pura)'. This is your PRIMARY source. Any remedy found here MUST have its 'source' field set to 'H'.
2.  The provided 'Knowledge Base 2 (Boericke's Materia Medica)'. Any remedy found here MUST have its 'source' field set to 'B'.
3.  The provided 'Knowledge Base 3 (Kent's Materia Medica)'. Any remedy found here MUST have its 'source' field set to 'K'.
4.  Your own extensive, general homeopathic knowledge. Any remedy you suggest from this general knowledge that is NOT in the provided texts MUST have its 'source' field set to 'AI'.

Your analysis process is critical:

1.  First, generate a combined, ranked list of potential remedies from all four sources. For each remedy, you must provide:
    a. The medicine's name in English.
    b. A brief description in Bengali.
    c. A confidence score from 1 to 100.
    d. A detailed 'justification' in Bengali. If the remedy is from a knowledge base ('H', 'B', or 'K'), you MUST explain which of the user's symptoms correspond to specific descriptions in that Materia Medica.
    e. The 'source' of the remedy ('H', 'B', 'K', or 'AI').

2.  After generating the full list, you MUST select FOUR top suggestions for comparison. It is MANDATORY to provide a top suggestion for each of the four sources, even if their scores are low.
    a.  **Top Hahnemann Remedy:** From all the remedies with source 'H', identify the one with the absolute highest score. Place this in the 'topRemedyFromMateriaMedica' field. If you cannot find any relevant remedy from this source, you must still select the best possible match. Do not leave this field null.
    b.  **Top Boericke Remedy:** From all the remedies with source 'B', identify the one with the absolute highest score. Place this in the 'topRemedyFromBoericke' field. If you cannot find any relevant remedy from this source, you must still select the best possible match. Do not leave this field null.
    c.  **Top Kent Remedy:** From all the remedies with source 'K', identify the one with the absolute highest score. Place this in the 'topRemedyFromKent' field. If you cannot find any relevant remedy from this source, you must still select the best possible match. Do not leave this field null.
    d.  **Top AI Remedy:** From all the remedies with source 'AI', identify the one with the absolute highest score. It is MANDATORY to provide a suggestion from your own knowledge base ('AI'). Place this in the 'topRemedyFromAI' field.

3.  The main 'remedies' array should still contain all the suggestions you found, including the ones you selected as top suggestions.

All output (descriptions, justifications, categorized symptoms, and repertory suggestions) MUST be in Bengali, except for the medicine names, which must be in English.

Knowledge Base 1 (Hahnemann's Materia Medica Pura):
{{{hahnemannMateriaMedica}}}

Knowledge Base 2 (Boericke's Materia Medica):
{{{boerickeMateriaMedica}}}

Knowledge Base 3 (Kent's Materia Medica):
{{{kentMateriaMedica}}}

Symptoms: {{{symptoms}}}`
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
    const kentPath = path.join(process.cwd(), 'src', 'data', 'Kent\'s Lectures On Materia Medica.txt');
    
    const [hahnemannMateriaMedica, boerickeMateriaMedica, kentMateriaMedica] = await Promise.all([
      fs.readFile(hahnemannPath, 'utf-8'),
      fs.readFile(boerickePath, 'utf-8'),
      fs.readFile(kentPath, 'utf-8')
    ]);
    
    const {output} = await prompt({
      ...input, 
      hahnemannMateriaMedica, 
      boerickeMateriaMedica,
      kentMateriaMedica
    });
    return output!;
  }
);
