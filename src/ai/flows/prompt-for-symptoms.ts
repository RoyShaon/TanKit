'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting symptoms to the user.
 *
 * - promptForSymptoms - A function that takes a partial symptom description and returns a list of suggested symptoms.
 * - PromptForSymptomsInput - The input type for the promptForSymptoms function.
 * - PromptForSymptomsOutput - The output type for the promptForSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import * as fs from 'fs/promises';
import * as path from 'path';


const PromptForSymptomsInputSchema = z.object({
  partialSymptom: z
    .string()
    .describe('A partial description of a symptom the user is experiencing.'),
});
export type PromptForSymptomsInput = z.infer<typeof PromptForSymptomsInputSchema>;

const PromptForSymptomsOutputSchema = z.object({
  suggestedSymptoms: z
    .array(z.string())
    .describe('An array of suggested symptoms based on the partial input.'),
});
export type PromptForSymptomsOutput = z.infer<typeof PromptForSymptomsOutputSchema>;

export async function promptForSymptoms(input: PromptForSymptomsInput): Promise<PromptForSymptomsOutput> {
  return promptForSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'promptForSymptomsPrompt',
  input: {schema: PromptForSymptomsInputSchema},
  output: {schema: PromptForSymptomsOutputSchema},
  prompt: `You are a helpful assistant designed to suggest possible symptoms to a user based on their partial symptom description. Use the provided "Materia Medica Pura" as your primary knowledge base.

  The user has provided the following partial symptom description: {{{partialSymptom}}}

  Suggest a list of symptoms that might be related to the user's description. Return the suggestions as a JSON array of strings.
  Do not include any additional text or explanation.

  Example:
  ["Headache", "Nausea", "Dizziness"]

  Knowledge Base (Materia Medica Pura):
  {{{materiaMedica}}}
  `,
});

const promptForSymptomsFlow = ai.defineFlow(
  {
    name: 'promptForSymptomsFlow',
    inputSchema: PromptForSymptomsInputSchema,
    outputSchema: PromptForSymptomsOutputSchema,
  },
  async input => {
    const materiaMedicaPath = path.join(process.cwd(), 'src', 'data', 'materia-medica.txt');
    const materiaMedica = await fs.readFile(materiaMedicaPath, 'utf-8');

    const {output} = await prompt({...input, materiaMedica});
    return output!;
  }
);
