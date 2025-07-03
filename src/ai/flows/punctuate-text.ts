'use server';

/**
 * @fileOverview This file defines a Genkit flow for adding punctuation to a given text.
 *
 * - punctuateText - A function that takes a block of text and returns it with appropriate Bengali punctuation.
 * - PunctuateTextInput - The input type for the punctuateText function.
 * - PunctuateTextOutput - The output type for the punctuateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PunctuateTextInputSchema = z.object({
  text: z.string().describe('A block of Bengali text that may be missing punctuation.'),
});
export type PunctuateTextInput = z.infer<typeof PunctuateTextInputSchema>;

const PunctuateTextOutputSchema = z.object({
  punctuatedText: z.string().describe('The text with correct Bengali punctuation (daris, commas, etc.) added.'),
});
export type PunctuateTextOutput = z.infer<typeof PunctuateTextOutputSchema>;

export async function punctuateText(input: PunctuateTextInput): Promise<PunctuateTextOutput> {
  return punctuateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'punctuateTextPrompt',
  input: {schema: PunctuateTextInputSchema},
  output: {schema: PunctuateTextOutputSchema},
  prompt: `You are an expert in Bengali grammar and punctuation. Your task is to take the following block of text, which describes medical symptoms, and add appropriate punctuation, such as commas (,) and full stops (।). Do not change any words or the order of the sentences. Only add the necessary punctuation to make the text grammatically correct and easy to read.

Text to punctuate:
{{{text}}}
`,
});

const punctuateTextFlow = ai.defineFlow(
  {
    name: 'punctuateTextFlow',
    inputSchema: PunctuateTextInputSchema,
    outputSchema: PunctuateTextOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
